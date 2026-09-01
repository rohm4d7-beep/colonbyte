import { Router } from 'express';
import { Parser as CsvParser } from 'json2csv';
import { rateLimit } from 'express-rate-limit';
import Lead, { WEBSITE_STATUSES } from '../models/Lead.js';
import { analyzeLead } from '../services/aiAnalysis.js';
import { generateDemoContent } from '../services/demoContentGenerator.js';
import { generateOutreach } from '../services/outreachGenerator.js';
import { sendOutreachEmail } from '../services/emailSender.js';
import { analyzeWebsite } from '../services/websiteAnalyzer.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Old/legacy leads can reach here with websiteStatus never computed (predates the analyzer,
// or a prior failed run). Never let the AI report/demo/outreach be generated on top of that
// gap — it's exactly how a lead with a real website got written up as having none.
async function ensureWebsiteAnalyzed(lead) {
  if (lead.websiteStatus) return;
  const result = await analyzeWebsite(lead.website);
  lead.websiteStatus = result.status;
  lead.websiteQualityScore = result.websiteQualityScore;
  lead.highPriority = result.highPriority;
}

const EXPORT_FIELDS = [
  'businessName',
  'email',
  'phone',
  'website',
  'websiteStatus',
  'websiteQualityScore',
  'highPriority',
  'rating',
  'reviewCount',
  'category',
  'aiAnalysis.leadQualityScore',
  'aiAnalysis.websiteOpportunityScore',
  'address',
  'country',
  'countryCode',
  'keyword',
  'status',
  'createdAt',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/stats', asyncHandler(async (req, res) => {
  const [total, emails, contacted, converted, websiteMissing, highPriority] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({ email: { $ne: '' } }),
    Lead.countDocuments({ status: 'contacted' }),
    Lead.countDocuments({ status: 'converted' }),
    Lead.countDocuments({ websiteStatus: 'none' }),
    Lead.countDocuments({ highPriority: true }),
  ]);
  res.json({ total, emails, contacted, converted, websiteMissing, highPriority });
}));

router.get('/countries', asyncHandler(async (req, res) => {
  const countries = await Lead.distinct('country', { country: { $ne: '' } });
  res.json({ countries: countries.sort() });
}));

router.get('/export', asyncHandler(async (req, res) => {
  const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
  const parser = new CsvParser({ fields: EXPORT_FIELDS });
  const csv = parser.parse(leads);

  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="leads.csv"',
  });
  res.send(csv);
}));

router.get('/', asyncHandler(async (req, res) => {
  const { country, status, websiteStatus, minRating, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (typeof country === 'string' && country) filter.country = country;
  if (typeof status === 'string' && ['new', 'contacted', 'converted'].includes(status)) {
    filter.status = status;
  }
  if (typeof websiteStatus === 'string' && WEBSITE_STATUSES.includes(websiteStatus)) {
    filter.websiteStatus = websiteStatus;
  }
  if (typeof minRating === 'string' && minRating) {
    const parsed = parseFloat(minRating);
    if (!Number.isNaN(parsed)) filter.rating = { $gte: Math.max(0, Math.min(5, parsed)) };
  }
  if (typeof search === 'string' && search) {
    const safe = escapeRegex(search).slice(0, 100);
    filter.$or = [
      { businessName: { $regex: safe, $options: 'i' } },
      { keyword: { $regex: safe, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  res.json({ leads, total, pages: Math.max(1, Math.ceil(total / limitNum)) });
}));

const analyzeLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests. Please wait before trying again.' },
});

router.post('/:id/analyze', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  await ensureWebsiteAnalyzed(lead);
  const aiAnalysis = await analyzeLead(lead);
  lead.aiAnalysis = aiAnalysis;
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-demo', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  await ensureWebsiteAnalyzed(lead);
  const demoSite = await generateDemoContent(lead);
  lead.demoSite = demoSite;
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-outreach', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.highPriority) {
    return res.status(409).json({
      error: 'Outreach is only for high-priority leads (poor or missing website) — this business already has a solid site.',
    });
  }
  if (lead.aiAnalysis?.status !== 'completed' || lead.demoSite?.status !== 'completed') {
    return res.status(409).json({ error: 'Run AI analysis and generate the demo site before drafting outreach.' });
  }
  if (lead.outreach?.status === 'sent') {
    return res.status(409).json({ error: 'This outreach email has already been sent.' });
  }

  const outreach = await generateOutreach(lead);
  lead.outreach = { ...lead.outreach.toObject(), ...outreach };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/outreach', asyncHandler(async (req, res) => {
  const { subject, body } = req.body || {};
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 200) {
    return res.status(400).json({ error: 'Subject is required (max 200 characters).' });
  }
  if (typeof body !== 'string' || !body.trim() || body.length > 5000) {
    return res.status(400).json({ error: 'Body is required (max 5000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.outreach?.status === 'sent') {
    return res.status(409).json({ error: 'This outreach email has already been sent.' });
  }

  lead.outreach.subject = subject.trim();
  lead.outreach.body = body.trim();
  if (lead.outreach.status === 'pending' || lead.outreach.status === 'failed') {
    lead.outreach.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

const sendLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many send requests. Please wait before trying again.' },
});

router.post('/:id/send-outreach', sendLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.email) return res.status(400).json({ error: 'This lead has no email address.' });
  if (!lead.highPriority) {
    return res.status(409).json({
      error: 'Outreach is only for high-priority leads (poor or missing website) — this business already has a solid site.',
    });
  }
  if (lead.outreach?.status === 'sent') {
    return res.status(409).json({ error: 'This outreach email has already been sent.' });
  }
  if (lead.outreach?.status !== 'drafted') {
    return res.status(409).json({ error: 'Generate and review a draft before sending.' });
  }

  const result = await sendOutreachEmail({
    to: lead.email,
    subject: lead.outreach.subject,
    body: lead.outreach.body,
    leadId: lead._id,
  });

  if (!result.success) {
    lead.outreach.status = 'failed';
    await lead.save();
    return res.status(502).json({ error: result.error || 'Failed to send email.' });
  }

  lead.outreach.status = 'sent';
  lead.outreach.sentAt = new Date();
  lead.outreach.providerMessageId = result.messageId || '';
  if (lead.status === 'new') lead.status = 'contacted';
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['new', 'contacted', 'converted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json(lead);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  res.json({ ok: true });
}));

router.delete('/', asyncHandler(async (req, res) => {
  const { deletedCount } = await Lead.deleteMany({});
  res.json({ ok: true, deletedCount });
}));

export default router;
