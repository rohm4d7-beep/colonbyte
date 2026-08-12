import { Router } from 'express';
import { randomUUID } from 'crypto';
import { rateLimit } from 'express-rate-limit';
import Lead from '../models/Lead.js';
import { scrapeGoogleMaps } from '../services/googleMapsScraper.js';
import { extractEmailFromWebsite } from '../services/emailExtractor.js';
import { verifyCountry, resolveCountryCode } from '../services/countryVerification.js';
import { findDuplicateLead, normalizePhone, normalizeWebsiteDomain } from '../services/leadDedup.js';
import { analyzeWebsite } from '../services/websiteAnalyzer.js';
import { analyzeLead } from '../services/aiAnalysis.js';
import { generateDemoContent } from '../services/demoContentGenerator.js';

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
  const counts = { rejected: 0, duplicates: 0, saved: 0 };

  try {
    await scrapeGoogleMaps(keyword, {
      targetCountry,
      onProgress: (progress) => broadcast(jobId, { ...progress, ...counts }),
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

        const [email, websiteAnalysis, duplicate] = await Promise.all([
          extractEmailFromWebsite(item.website),
          analyzeWebsite(item.website),
          findDuplicateLead({
            businessName: item.businessName,
            phone: item.phone,
            website: item.website,
            lat: item.lat,
            lng: item.lng,
            placeId: item.placeId,
          }),
        ]);

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
          photos: item.photos,
          websiteStatus: websiteAnalysis.status,
          websiteQualityScore: websiteAnalysis.websiteQualityScore,
          highPriority: websiteAnalysis.highPriority,
          keyword,
        };

        // Only ever set placeId when we actually captured one — leaving it unset
        // (rather than '') keeps the sparse unique index from colliding on empty values.
        if (item.placeId) fields.placeId = item.placeId;

        // Only high-priority leads (poor/missing website) get an automatic AI report +
        // demo site — keeps the paid API calls proportional to actual opportunities.
        // Others stay 'pending' and can be generated on demand via the leads routes.
        if (websiteAnalysis.highPriority) {
          const [aiAnalysis, demoSite] = await Promise.all([
            analyzeLead(fields),
            generateDemoContent(fields),
          ]);
          fields.aiAnalysis = aiAnalysis;
          fields.demoSite = demoSite;
        }

        if (duplicate) {
          counts.duplicates += 1;
          await Lead.updateOne({ _id: duplicate._id }, { $set: fields });
        } else {
          counts.saved += 1;
          await Lead.create({ ...fields, status: 'new' });
        }
      },
    });
    broadcast(jobId, { ...(jobs.get(jobId)?.last || {}), ...counts, status: 'done' });
  } catch (err) {
    console.error(`[scrape] job ${jobId} failed:`, err.message);
    broadcast(jobId, { found: 0, processed: 0, ...(jobs.get(jobId)?.last || {}), ...counts, status: 'error' });
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
