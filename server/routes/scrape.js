import { Router } from 'express';
import { randomUUID } from 'crypto';
import { rateLimit } from 'express-rate-limit';
import { chromium } from 'playwright';
import Lead from '../models/Lead.js';
import { scrapeGoogleMaps } from '../services/googleMapsScraper.js';
import { extractContactInfoFromWebsite } from '../services/emailExtractor.js';
import { verifyCountry, resolveCountryCode } from '../services/countryVerification.js';
import { topCitiesForCountry } from '../services/topCities.js';
import { findDuplicateLead, normalizePhone, normalizeWebsiteDomain, namesAreSimilar } from '../services/leadDedup.js';
import { analyzeWebsite } from '../services/websiteAnalyzer.js';
import { fetchListingPhotos } from '../services/listingPhotoScraper.js';

const router = Router();

// jobId -> { clients: Set<res>, last: object }
const jobs = new Map();

function broadcast(jobId, payload) {
  const job = jobs.get(jobId);
  if (!job) return;
  job.last = payload;
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of job.clients) res.write(line);
  if (payload.status === 'done' || payload.status === 'error') {
    setTimeout(() => jobs.delete(jobId), 60_000);
  }
}

async function runJob(jobId, keyword, targetCountry, requireContact) {
  const counts = { rejected: 0, duplicates: 0, saved: 0, hasWebsite: 0, unverified: 0, noEmail: 0, errored: 0 };
  // Set once googleMapsScraper.js's circuit breaker trips (Google rate-limiting/blocking this
  // connection, not a batch of coincidentally-dead listings) - surfaced to the dashboard so a
  // wall of "failed" reads as an external block instead of looking like a broken scraper.
  let blocked = false;

  // Shared across every item in this job — analyzeWebsite() only needs it as a fallback for
  // axios-blocked sites, but launching a fresh Chromium process per item (on top of the Maps
  // scraper's own browser) was the dominant cost on categories like hotels where most sites
  // sit behind a WAF. One browser, many pages, closed once the whole job finishes.
  const analysisBrowser = await chromium.launch({ headless: true });

  // A bare "<keyword> <country>" Maps search only ever returns one city's worth of results
  // no matter how large the country is (confirmed live: "dentist Russia" returned only
  // Moscow-area listings) - search each of the country's biggest cities instead so a country
  // selection actually gets country-wide coverage. Falls back to the plain country-level
  // search below if the country code isn't in the cities dataset.
  const searchCities = topCitiesForCountry(resolveCountryCode(targetCountry));

  try {
    await scrapeGoogleMaps(keyword, {
      targetCountry,
      searchCities,
      onProgress: (progress) => {
        if (progress.blocked) blocked = true;
        broadcast(jobId, { ...progress, ...counts, blocked });
      },
      onItemError: () => {
        counts.errored += 1;
      },
      processItem: async (item) => {
        const verification = verifyCountry({
          address: item.address,
          phone: item.phone,
          lat: item.lat,
          lng: item.lng,
          targetCountry,
        });

        if (!verification.verified) {
          counts.rejected += 1;
          return;
        }

        // This is a lead-gen tool for businesses that need a NEW website — one CONFIRMED to
        // already have a solid site is not a prospect, so check that first and skip
        // everything else (email extraction, dedup lookup, paid AI calls) for it. Don't even
        // save it as a lead.
        //
        // 'unverified' (site is up but blocked our check, e.g. WAF/bot protection) is NOT the
        // same claim — we have no evidence either way, so it falls through instead of being
        // silently dropped: it still gets saved for manual review, just without the paid AI
        // report/demo (see the highPriority gate below), so it can't be mistaken for a
        // confirmed opportunity either.
        const websiteAnalysis = await analyzeWebsite(item.website, analysisBrowser);
        const confirmedHasWebsite = !websiteAnalysis.highPriority && websiteAnalysis.status !== 'unverified';
        if (confirmedHasWebsite) {
          counts.hasWebsite += 1;
          return;
        }
        if (websiteAnalysis.status === 'unverified') {
          counts.unverified += 1;
        }

        // If the Maps "website" link IS a social profile (websiteAnalyzer.js already told us
        // which kind), that URL already is the Instagram/Facebook link - use it directly
        // rather than fetching instagram.com/facebook.com looking for a mailto link and a
        // "follow us" href back to itself, which would never find anything.
        const contactInfoPromise =
          websiteAnalysis.status === 'instagram_only'
            ? Promise.resolve({ email: '', instagramUrl: item.website, facebookUrl: '' })
            : websiteAnalysis.status === 'facebook_only'
            ? Promise.resolve({ email: '', instagramUrl: '', facebookUrl: item.website })
            : extractContactInfoFromWebsite(item.website, analysisBrowser);

        const [contactInfo, duplicate] = await Promise.all([
          contactInfoPromise,
          findDuplicateLead({
            businessName: item.businessName,
            phone: item.phone,
            website: item.website,
            lat: item.lat,
            lng: item.lng,
            placeId: item.placeId,
          }),
        ]);
        const { email, instagramUrl, facebookUrl } = contactInfo;

        // No email means no automated outreach on this lead (routes/leads.js + the dashboard
        // both already gate send-outreach on lead.email being set) - but it's still a real,
        // contactable business (phone/address are still real signals), and for genuinely
        // no-website leads especially - this tool's core target - dropping it here would throw
        // away exactly the leads it exists to find. Save it either way; just track how many
        // came in without an email for visibility in the progress UI.
        if (!email) {
          counts.noEmail += 1;
        }
        // requireContact means "skip phone/WhatsApp-only leads" specifically - a website is
        // just as usable a channel as email/Instagram/Facebook, but only when it's a CONFIRMED
        // reachable site ('has_website' or 'outdated' - see websiteAnalyzer.js). 'unverified'
        // (bot-blocked, we have no evidence either way) and 'broken' (confirmed dead) are NOT
        // a usable channel and must not satisfy this - counting either would let through leads
        // with a website field on file that a human can't actually do anything with, which is
        // exactly what this flag exists to keep out. WhatsApp-only outreach is slow to send and
        // the number frequently isn't even on WhatsApp, so a caller opting into this doesn't
        // want the dashboard/DB cluttered with leads only reachable that way.
        const hasUsableWebsite = websiteAnalysis.status === 'has_website' || websiteAnalysis.status === 'outdated';
        if (requireContact && !email && !instagramUrl && !facebookUrl && !hasUsableWebsite) return;

        // The bulk Maps visit above only ever grabs the single hero photo (opening the full
        // gallery costs ~8-10s, too slow to pay for every one of up to ~150 candidates a job
        // visits). By this point the lead has passed every filter and WILL be saved, so it's
        // worth paying that cost once here for a real multi-photo pool — demo generation then
        // has enough real photos to actually rotate through on regenerate instead of being
        // limited to whatever the single scraped hero photo was.
        const galleryPhotos = await fetchListingPhotos(item.businessName, verification.countryName);

        const fields = {
          businessName: item.businessName,
          email,
          instagramUrl,
          facebookUrl,
          phone: item.phone,
          normalizedPhone: normalizePhone(item.phone),
          website: item.website,
          websiteDomain: normalizeWebsiteDomain(item.website),
          address: item.address,
          country: verification.countryName,
          countryCode: verification.countryCode,
          countryVerified: true,
          lat: item.lat,
          lng: item.lng,
          rating: item.rating,
          reviewCount: item.reviewCount,
          category: item.category,
          openingHoursSummary: item.openingHoursSummary,
          photoCount: item.photoCount,
          photos: galleryPhotos.length > 0 ? galleryPhotos : item.photos,
          websiteStatus: websiteAnalysis.status,
          websiteQualityScore: websiteAnalysis.websiteQualityScore,
          highPriority: websiteAnalysis.highPriority,
          keyword,
        };

        // Only ever set placeId when we actually captured one — leaving it unset
        // (rather than '') keeps the sparse unique index from colliding on empty values.
        if (item.placeId) fields.placeId = item.placeId;

        // AI report + demo site used to be generated automatically here for every
        // high-priority lead found in a scrape job — but a broad scrape can turn up dozens of
        // high-priority leads at once, and running both AI calls (now including the demo
        // pipeline's vision photo-selection call) concurrently for all of them blows through
        // Groq's per-minute token limits fast. These now stay 'pending' after scraping and are
        // generated on demand, one lead at a time, via routes/leads.js's /analyze and
        // /generate-demo (routes/leads.js also blocks outreach on non-highPriority leads
        // regardless).

        if (duplicate) {
          // findDuplicateLead matching on placeId/phone/website domain should only ever match
          // the SAME real business - but this is exactly the guard that would have caught a
          // real incident: leads a user had already manually contacted were later found
          // completely missing (their businessName no longer matched anything in the DB),
          // meaning a "duplicate" match at some point overwrote one business's identity with a
          // different one's via $set. No exact root cause could be reconstructed after the
          // fact (no audit history to inspect) - this closes the door on it regardless of which
          // path (placeId/phone/website/lat-lng) produced the false match: refuse to overwrite
          // a lead's identity unless the incoming business name is actually similar to what's
          // already stored, and only ever fall silent-safe (skip) rather than risk clobbering a
          // real, possibly already-contacted lead.
          if (duplicate.businessName && !namesAreSimilar(duplicate.businessName, item.businessName)) {
            console.warn(
              `[scrape] Refusing to merge "${item.businessName}" into existing lead "${duplicate.businessName}" (id ${duplicate._id}) - matched as a duplicate but names don't look like the same business. Skipping update to avoid overwriting a real lead.`
            );
            return;
          }
          counts.duplicates += 1;
          await Lead.updateOne({ _id: duplicate._id }, { $set: fields });
        } else {
          try {
            counts.saved += 1;
            await Lead.create({ ...fields, status: 'new' });
          } catch (err) {
            // findDuplicateLead ran before any worker had inserted this placeId, so two
            // concurrent workers (see CONCURRENCY in googleMapsScraper.js) racing the same
            // physical listing can both see "no duplicate" and both reach Lead.create - one
            // wins, the other hits the placeId unique index and throws. Previously this
            // propagated straight out of processItem into the caller's blanket `catch {}`,
            // silently vanishing the item from every count. Recover by updating the winner's
            // row instead of losing the item entirely.
            if (err.code === 11000 && fields.placeId) {
              const winner = await Lead.findOne({ placeId: fields.placeId });
              if (winner) {
                counts.saved -= 1;
                counts.duplicates += 1;
                await Lead.updateOne({ _id: winner._id }, { $set: fields });
                return;
              }
            }
            counts.saved -= 1;
            throw err;
          }
        }
      },
    });
    const finalProgress = { ...(jobs.get(jobId)?.last || {}), ...counts, status: 'done', blocked };
    console.log(`[scrape] job ${jobId} (${keyword} / ${targetCountry}) done:`, JSON.stringify(finalProgress));
    broadcast(jobId, finalProgress);
  } catch (err) {
    console.error(`[scrape] job ${jobId} failed:`, err.message);
    broadcast(jobId, { found: 0, processed: 0, ...(jobs.get(jobId)?.last || {}), ...counts, status: 'error' });
  } finally {
    await analysisBrowser.close();
  }
}

const startLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many scrape jobs started. Please wait before starting another.' },
});

router.post('/start', startLimiter, (req, res) => {
  const keyword = (req.body?.keyword || '').trim();
  const country = (req.body?.country || '').trim();

  if (!keyword || keyword.length > 200) {
    return res.status(400).json({ error: 'A keyword is required (max 200 characters).' });
  }
  if (!country || !resolveCountryCode(country)) {
    return res.status(400).json({ error: 'A valid target country is required.' });
  }

  const requireContact = req.body?.requireContact === true;

  const jobId = randomUUID();
  jobs.set(jobId, { clients: new Set(), last: { found: 0, processed: 0, status: 'running' } });

  runJob(jobId, keyword, country, requireContact);

  res.json({ jobId });
});

router.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  job.clients.add(res);
  res.write(`data: ${JSON.stringify(job.last)}\n\n`);

  req.on('close', () => {
    job.clients.delete(res);
  });
});

export default router;
