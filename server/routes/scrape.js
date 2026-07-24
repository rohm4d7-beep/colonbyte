import { Router } from 'express';
import { randomUUID } from 'crypto';
import Lead from '../models/Lead.js';
import { scrapeGoogleMaps } from '../services/googleMapsScraper.js';
import { extractEmailFromWebsite } from '../services/emailExtractor.js';

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

async function runJob(jobId, keyword) {
  try {
    await scrapeGoogleMaps(keyword, {
      onProgress: (progress) => broadcast(jobId, { ...progress }),
      processItem: async (item) => {
        const email = await extractEmailFromWebsite(item.website);
        await Lead.updateOne(
          { businessName: item.businessName, keyword },
          {
            $set: {
              email,
              phone: item.phone,
              website: item.website,
              address: item.address,
              country: item.country,
              keyword,
            },
            $setOnInsert: { status: 'new' },
          },
          { upsert: true }
        );
      },
    });
    broadcast(jobId, { ...(jobs.get(jobId)?.last || {}), status: 'done' });
  } catch (err) {
    console.error(`[scrape] job ${jobId} failed:`, err.message);
    broadcast(jobId, { found: 0, processed: 0, ...(jobs.get(jobId)?.last || {}), status: 'error' });
  }
}

router.post('/start', (req, res) => {
  const keyword = (req.body?.keyword || '').trim();
  if (!keyword) {
    return res.status(400).json({ error: 'A keyword is required.' });
  }

  const jobId = randomUUID();
  jobs.set(jobId, { clients: new Set(), last: { found: 0, processed: 0, status: 'running' } });

  runJob(jobId, keyword);

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
