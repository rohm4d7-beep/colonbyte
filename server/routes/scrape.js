import { Router } from 'express';
import { randomUUID } from 'crypto';
import { rateLimit } from 'express-rate-limit';
import { chromium } from 'playwright';
import Lead from '../models/Lead.js';
import { scrapeGoogleMaps } from '../services/googleMapsScraper.js';
import { extractEmailFromWebsite } from '../services/emailExtractor.js';
import { verifyCountry, resolveCountryCode } from '../services/countryVerification.js';
import { findDuplicateLead, normalizePhone, normalizeWebsiteDomain } from '../services/leadDedup.js';
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

async function runJob(jobId, keyword, targetCountry) {
  const counts = { rejected: 0, duplicates: 0, saved: 0, hasWebsite: 0, unverified: 0, noEmail: 0, errored: 0 };

  // Shared across every item in this job — analyzeWebsite() only needs it as a fallback for
  // axios-blocked sites, but launching a fresh Chromium process per item (on top of the Maps
  // scraper's own browser) was the dominant cost on categories like hotels where most sites
  // sit behind a WAF. One browser, many pages, closed once the whole job finishes.
  const analysisBrowser = await chromium.launch({ headless: true });

  try {
    await scrapeGoogleMaps(keyword, {
      targetCountry,
      onProgress: (progress) => broadcast(jobId, { ...progress, ...counts }),
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

        const [email, duplicate] = await Promise.all([
          extractEmailFromWebsite(item.website),
          findDuplicateLead({
            businessName: item.businessName,
            phone: item.phone,
            website: item.website,
            lat: item.lat,
            lng: item.lng,
            placeId: item.placeId,
          }),
        ]);

        // No email means no automated outreach on this lead (routes/leads.js + the dashboard
        // both already gate send-outreach on lead.email being set) - but it's still a real,
        // contactable business (phone/address are still real signals), and for genuinely
        // no-website leads especially - this tool's core target - dropping it here would throw
        // away exactly the leads it exists to find. Save it either way; just track how many
        // came in without an email for visibility in the progress UI.
        if (!email) {
          counts.noEmail += 1;
        }

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
    const finalProgress = { ...(jobs.get(jobId)?.last || {}), ...counts, status: 'done' };
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

  const jobId = randomUUID();
  jobs.set(jobId, { clients: new Set(), last: { found: 0, processed: 0, status: 'running' } });

  runJob(jobId, keyword, country);

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
