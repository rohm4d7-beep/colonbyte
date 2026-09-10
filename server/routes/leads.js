import { Router } from 'express';
import { Parser as CsvParser } from 'json2csv';
import { rateLimit } from 'express-rate-limit';
import Lead, { WEBSITE_STATUSES } from '../models/Lead.js';
import { TEMPLATE_KEYS } from '../constants/demoOptions.js';
import { analyzeLead } from '../services/aiAnalysis.js';
import { analyzeOpportunity, noOpportunity } from '../services/opportunityAnalysis.js';
import { generateDemoContent } from '../services/demoContentGenerator.js';
import { generateOutreach, generateFollowUpEmail } from '../services/outreachGenerator.js';
import { generateWhatsappOutreach, generateFollowUpWhatsapp } from '../services/whatsappOutreachGenerator.js';
import { generateInstagramOutreach, generateFollowUpInstagram } from '../services/instagramOutreachGenerator.js';
import { generateFacebookOutreach } from '../services/facebookOutreachGenerator.js';
import { sendOutreachEmail } from '../services/emailSender.js';
import { analyzeWebsite } from '../services/websiteAnalyzer.js';
import { extractContactInfoFromWebsite, isRealSocialProfileUrl } from '../services/emailExtractor.js';
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
  lead.websiteSignals = result.signals;
}

const EXPORT_FIELDS = [
  'businessName',
  'email',
  'instagramUrl',
  'facebookUrl',
  'phone',
  'website',
  'websiteStatus',
  'websiteQualityScore',
  'highPriority',
  'rating',
  'reviewCount',
  'category',
  'aiAnalysis.worthContacting',
  'aiAnalysis.opportunity',
  'opportunityAnalysis.primaryOpportunity',
  'opportunityAnalysis.solutionCategory',
  'opportunityAnalysis.outreachAngle',
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

// The opportunity engine (services/opportunityAnalysis.js) is the authoritative outreach gate
// once it has run: any credible category (not NO_STRONG_OPPORTUNITY) means there's a real,
// defensible reason to reach out, regardless of website condition — a business with an
// excellent website but a strong AI/automation angle is just as eligible as one with a broken
// site. Leads not yet run through it fall back to aiAnalysis.worthContacting — NEVER to website
// condition (highPriority/websiteStatus). COLONBYTE no longer only sells websites, so "this
// business already has a solid site" stopped being a valid reason to block outreach outright
// the moment aiAnalysis.js's worthContacting was decoupled from website condition (see that
// file) — a confirmed-good-website lead can still have a real AI/automation angle worth
// contacting about, and gating on website status alone was blocking exactly those leads.
function isOutreachEligible(lead) {
  if (lead.opportunityAnalysis?.status === 'completed') {
    return !!lead.opportunityAnalysis.primaryOpportunity && lead.opportunityAnalysis.primaryOpportunity !== 'NO_STRONG_OPPORTUNITY';
  }
  // A FAILED opportunity analysis (Groq error - e.g. tonight's quota exhaustion) is NOT the
  // same as one that was never attempted. Falling back to aiAnalysis.opportunity/suggestions
  // here produced a real bad message: aiAnalysis's suggestions are general business-quality
  // notes ("verify your opening hours") that were never meant to double as an outreach angle -
  // confirmed live, a lead whose opportunity call failed got an Instagram DM asking "do you
  // adjust your hours seasonally", signed The Colonbyte Team, with zero connection to anything
  // COLONBYTE sells. Block outreach outright on a failed analysis instead - the fix is to
  // retry the analysis, not to guess from an unrelated field. Only a lead that was NEVER run
  // through the opportunity engine at all (status undefined/pending - a pre-opportunity-engine
  // legacy lead) falls back to the old aiAnalysis-based gate.
  if (lead.opportunityAnalysis?.status === 'failed') {
    return false;
  }
  return lead.aiAnalysis?.status === 'completed' && lead.aiAnalysis?.worthContacting === true;
}

function notOutreachEligibleMessage(lead) {
  if (lead.opportunityAnalysis?.status === 'completed') {
    return 'No credible opportunity was found for this business — outreach is only for leads with a defensible reason to contact them.';
  }
  if (lead.opportunityAnalysis?.status === 'failed') {
    return 'Opportunity analysis failed to complete — re-analyze this lead before drafting outreach.';
  }
  if (lead.aiAnalysis?.status === 'completed') {
    return 'AI analysis did not find a credible reason to contact this business.';
  }
  return 'Run AI analysis before drafting outreach.';
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
  const { country, status, websiteStatus, highPriority, minRating, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (typeof country === 'string' && country) filter.country = country;
  if (typeof status === 'string' && ['new', 'contacted', 'converted'].includes(status)) {
    filter.status = status;
  }
  if (typeof websiteStatus === 'string' && WEBSITE_STATUSES.includes(websiteStatus)) {
    filter.websiteStatus = websiteStatus;
  }
  // Backs the Dashboard's "High Priority Leads" stat card link - same field the stat itself
  // counts (Lead.countDocuments({ highPriority: true })), so the number and the filtered list
  // it links to can never drift apart.
  if (highPriority === 'true') {
    filter.highPriority = true;
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

  // Lead prioritization now considers two dimensions, not just website condition (see
  // server/constants/opportunityOptions.js / opportunityAnalysis.js): a lead with a CONFIRMED
  // credible opportunity (opportunityAnalysis has run and found one) always ranks top,
  // regardless of website status — a strong-website business with a real AI/automation angle is
  // a higher-value lead than a weak-website business with no angle at all. Below that top tier,
  // leads that haven't been through opportunity analysis yet fall back to the original
  // website-condition ranking as a rough pre-analysis heuristic: an existing-but-weak/outdated
  // site is a better target than a broken one, which is better than no website at all - still
  // just a signal, not proof of purchase intent, which is exactly why a confirmed opportunity
  // overrides it once one exists. `unverified` (no evidence either way) and a confirmed-strong
  // `has_website` sit at the bottom of the pre-analysis heuristic; legacy/never-analyzed leads
  // fall into the same middle tier as `none` via the default case.
  const priorityRank = {
    $switch: {
      branches: [
        {
          case: {
            $and: [
              { $eq: ['$opportunityAnalysis.status', 'completed'] },
              { $ne: ['$opportunityAnalysis.primaryOpportunity', 'NO_STRONG_OPPORTUNITY'] },
              { $ne: ['$opportunityAnalysis.primaryOpportunity', ''] },
            ],
          },
          then: 0,
        },
        { case: { $in: ['$websiteStatus', ['outdated', 'weak_website']] }, then: 1 },
        { case: { $eq: ['$websiteStatus', 'broken'] }, then: 2 },
        { case: { $in: ['$websiteStatus', ['none', 'facebook_only', 'instagram_only', 'google_business_only']] }, then: 3 },
        { case: { $eq: ['$websiteStatus', 'unverified'] }, then: 4 },
        { case: { $eq: ['$websiteStatus', 'has_website'] }, then: 5 },
      ],
      default: 3,
    },
  };

  const [result] = await Lead.aggregate([
    { $match: filter },
    { $addFields: { priorityRank } },
    {
      $facet: {
        // Within the same tier, real demand signals (rating/review count - actual Google Maps
        // data, never a fabricated composite score) break ties before falling back to recency.
        leads: [
          { $sort: { priorityRank: 1, reviewCount: -1, rating: -1, createdAt: -1 } },
          { $skip: (pageNum - 1) * limitNum },
          { $limit: limitNum },
          { $project: { priorityRank: 0 } },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const leads = result?.leads || [];
  const total = result?.totalCount?.[0]?.count || 0;

  res.json({ leads, total, pages: Math.max(1, Math.ceil(total / limitNum)) });
}));

// Shared across every analyze/regenerate-draft endpoint (analyze, recheck-website,
// generate-demo, change-template, and all 4 channels' generate-outreach + follow-up) - the
// whole point is to stop unauthenticated abuse, but /api/leads is already fully gated behind
// login (see requireAuth in index.js), so the real threat model here is "a single admin working
// through a large lead list," not anonymous attackers. 20/10min meant a normal session
// (analyze + up to 4 channel drafts per lead) exhausted it after 2-3 leads - raised to a level
// that comfortably covers real batch usage across dozens of leads while still bounding a
// runaway client bug. Deliberately NOT applied to sendLimiter below - actually sending a real
// email to a real business is a more consequential action and stays conservative.
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 200,
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

  // Opportunity analysis (services/opportunityAnalysis.js) only runs once the business-quality
  // gate above says this is worth contacting at all — a business that fails that gate gets
  // NO_STRONG_OPPORTUNITY without spending a second Groq call finding a specific angle for a
  // business not worth the outreach in the first place. A genuine business-quality analysis
  // FAILURE (bad key, rate limit) is kept distinct from that deliberate verdict, so the UI can
  // still offer a retry instead of reporting a confident "no opportunity" that was never judged.
  if (aiAnalysis.status !== 'completed') {
    lead.opportunityAnalysis = { status: 'failed' };
  } else if (aiAnalysis.worthContacting === true) {
    lead.opportunityAnalysis = await analyzeOpportunity(lead);
  } else {
    lead.opportunityAnalysis = noOpportunity();
  }

  await lead.save();

  res.json(lead);
}));

// Re-runs the same website check + contact extraction routes/scrape.js does on first scrape,
// against a lead already saved in the database. Exists because analyzeWebsite/emailExtractor
// keep getting bug fixes (e.g. the Cloudflare-challenge-page misclassification) that only ever
// apply to leads scraped AFTER the fix - this is the only way to bring an older lead's stored
// websiteStatus/email/social links up to date with the current logic, on demand, one lead at a
// time. Contact fields are only overwritten when a fresh value is actually found - a transient
// fetch failure on recheck must never wipe out a good value the lead already had.
router.post('/:id/recheck-website', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.website) return res.status(400).json({ error: 'This lead has no website to recheck.' });

  const websiteAnalysis = await analyzeWebsite(lead.website);
  lead.websiteStatus = websiteAnalysis.status;
  lead.websiteQualityScore = websiteAnalysis.websiteQualityScore;
  lead.highPriority = websiteAnalysis.highPriority;
  lead.websiteSignals = websiteAnalysis.signals;

  // Mirrors routes/scrape.js: when the Maps "website" link is itself a social profile, that
  // URL already IS the Instagram/Facebook link - fetching it for contact info would find nothing.
  // See routes/scrape.js's identical check — the Maps "website" field isn't automatically a
  // real profile link just because its hostname is instagram.com/facebook.com.
  const contactInfo =
    websiteAnalysis.status === 'instagram_only'
      ? { email: '', instagramUrl: isRealSocialProfileUrl(lead.website, 'instagram') ? lead.website : '', facebookUrl: '' }
      : websiteAnalysis.status === 'facebook_only'
      ? { email: '', instagramUrl: '', facebookUrl: isRealSocialProfileUrl(lead.website, 'facebook') ? lead.website : '' }
      : await extractContactInfoFromWebsite(lead.website);

  if (contactInfo.email) lead.email = contactInfo.email;
  if (contactInfo.instagramUrl) lead.instagramUrl = contactInfo.instagramUrl;
  if (contactInfo.facebookUrl) lead.facebookUrl = contactInfo.facebookUrl;

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

// Deliberately separate from generate-demo/"Regenerate" - that endpoint locks templateKey
// after the first generation on purpose (per explicit past feedback: re-rolling the layout on
// every regenerate click read as "stuck on random themes"). This is the intentional-choice
// counterpart: cycles to the next template in TEMPLATE_KEYS, keeping the existing color/photo/
// copy untouched, so a user can deliberately try a different layout without also re-rolling
// everything else.
router.post('/:id/change-template', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.demoSite?.status !== 'completed') {
    return res.status(409).json({ error: 'Generate a demo before changing its template.' });
  }

  const currentIndex = TEMPLATE_KEYS.indexOf(lead.demoSite.templateKey);
  const nextTemplateKey = TEMPLATE_KEYS[(currentIndex + 1) % TEMPLATE_KEYS.length];

  lead.demoSite.templateKey = nextTemplateKey;
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-outreach', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!isOutreachEligible(lead)) {
    return res.status(409).json({ error: notOutreachEligibleMessage(lead) });
  }
  // Demo is deliberately NOT required here — per explicit product decision, the demo is held
  // back and only attached later, manually, when the user opts in (typically after a reply),
  // never bundled into the first message by default. See includeDemo below.
  if (lead.aiAnalysis?.status !== 'completed') {
    return res.status(409).json({ error: 'Run AI analysis before drafting outreach.' });
  }
  if (lead.outreach?.status === 'sent') {
    return res.status(409).json({ error: 'This outreach email has already been sent.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const outreach = await generateOutreach(lead, { includeDemo });
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

router.post('/:id/generate-whatsapp', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.phone) return res.status(400).json({ error: 'This lead has no phone number.' });
  if (!isOutreachEligible(lead)) {
    return res.status(409).json({ error: notOutreachEligibleMessage(lead) });
  }
  // Demo not required — same manual, opt-in-only demo strategy as generate-outreach above.
  if (lead.aiAnalysis?.status !== 'completed') {
    return res.status(409).json({ error: 'Run AI analysis before drafting a message.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const whatsapp = await generateWhatsappOutreach(lead, { includeDemo });
  lead.whatsappOutreach = { ...lead.whatsappOutreach.toObject(), ...whatsapp };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/whatsapp', asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.whatsappOutreach.message = message.trim();
  if (lead.whatsappOutreach.status === 'pending' || lead.whatsappOutreach.status === 'failed') {
    lead.whatsappOutreach.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

// No sending happens server-side (see whatsappOutreachSchema) - this only records that the
// operator clicked through to WhatsApp with the draft, for visibility in the dashboard.
router.post('/:id/whatsapp-opened', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.whatsappOutreach.status = 'opened';
  lead.whatsappOutreach.openedAt = new Date();
  if (lead.status === 'new') lead.status = 'contacted';
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-instagram', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.instagramUrl) return res.status(400).json({ error: 'This lead has no Instagram profile.' });
  if (!isOutreachEligible(lead)) {
    return res.status(409).json({ error: notOutreachEligibleMessage(lead) });
  }
  if (lead.aiAnalysis?.status !== 'completed') {
    return res.status(409).json({ error: 'Run AI analysis before drafting a message.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const instagram = await generateInstagramOutreach(lead, { includeDemo });
  lead.instagramOutreach = { ...lead.instagramOutreach.toObject(), ...instagram };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/instagram', asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.instagramOutreach.message = message.trim();
  if (lead.instagramOutreach.status === 'pending' || lead.instagramOutreach.status === 'failed') {
    lead.instagramOutreach.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

// No sending happens server-side (see instagramOutreachSchema) - there is no official deep-link
// that opens Instagram DMs with a message pre-filled, so this only records that the operator
// copied the draft and clicked through to the profile, for visibility in the dashboard.
router.post('/:id/instagram-opened', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.instagramOutreach.status = 'opened';
  lead.instagramOutreach.openedAt = new Date();
  if (lead.status === 'new') lead.status = 'contacted';
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-followup-instagram', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.instagramOutreach?.status !== 'opened') {
    return res.status(409).json({ error: 'Open the first Instagram DM before drafting a follow-up.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const followUp = await generateFollowUpInstagram(lead, { includeDemo });
  lead.instagramFollowUp = { ...lead.instagramFollowUp.toObject(), ...followUp };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/followup-instagram', asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.instagramFollowUp.message = message.trim();
  if (lead.instagramFollowUp.status === 'pending' || lead.instagramFollowUp.status === 'failed') {
    lead.instagramFollowUp.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

router.post('/:id/followup-instagram-opened', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.instagramFollowUp.status = 'opened';
  lead.instagramFollowUp.openedAt = new Date();
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-facebook', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.facebookUrl) return res.status(400).json({ error: 'This lead has no Facebook page.' });
  if (!isOutreachEligible(lead)) {
    return res.status(409).json({ error: notOutreachEligibleMessage(lead) });
  }
  if (lead.aiAnalysis?.status !== 'completed') {
    return res.status(409).json({ error: 'Run AI analysis before drafting a message.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const facebook = await generateFacebookOutreach(lead, { includeDemo });
  lead.facebookOutreach = { ...lead.facebookOutreach.toObject(), ...facebook };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/facebook', asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.facebookOutreach.message = message.trim();
  if (lead.facebookOutreach.status === 'pending' || lead.facebookOutreach.status === 'failed') {
    lead.facebookOutreach.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

// Same manual-only tracking as instagram-opened - no official pre-filled Messenger deep-link.
router.post('/:id/facebook-opened', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.facebookOutreach.status = 'opened';
  lead.facebookOutreach.openedAt = new Date();
  if (lead.status === 'new') lead.status = 'contacted';
  await lead.save();

  res.json(lead);
}));

const sendLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many send requests. Please wait before trying again.' },
});

router.post('/:id/send-outreach', sendLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.email) return res.status(400).json({ error: 'This lead has no email address.' });
  if (!isOutreachEligible(lead)) {
    return res.status(409).json({ error: notOutreachEligibleMessage(lead) });
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

router.post('/:id/generate-followup-email', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.outreach?.status !== 'sent') {
    return res.status(409).json({ error: 'Send the first email before drafting a follow-up.' });
  }
  if (lead.outreachFollowUp?.status === 'sent') {
    return res.status(409).json({ error: 'The follow-up has already been sent.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const followUp = await generateFollowUpEmail(lead, { includeDemo });
  lead.outreachFollowUp = { ...lead.outreachFollowUp.toObject(), ...followUp };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/followup-email', asyncHandler(async (req, res) => {
  const { subject, body } = req.body || {};
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 200) {
    return res.status(400).json({ error: 'Subject is required (max 200 characters).' });
  }
  if (typeof body !== 'string' || !body.trim() || body.length > 5000) {
    return res.status(400).json({ error: 'Body is required (max 5000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.outreachFollowUp?.status === 'sent') {
    return res.status(409).json({ error: 'The follow-up has already been sent.' });
  }

  lead.outreachFollowUp.subject = subject.trim();
  lead.outreachFollowUp.body = body.trim();
  if (lead.outreachFollowUp.status === 'pending' || lead.outreachFollowUp.status === 'failed') {
    lead.outreachFollowUp.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

router.post('/:id/send-followup-email', sendLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (!lead.email) return res.status(400).json({ error: 'This lead has no email address.' });
  if (lead.outreachFollowUp?.status === 'sent') {
    return res.status(409).json({ error: 'The follow-up has already been sent.' });
  }
  if (lead.outreachFollowUp?.status !== 'drafted') {
    return res.status(409).json({ error: 'Generate and review a follow-up draft before sending.' });
  }

  const result = await sendOutreachEmail({
    to: lead.email,
    subject: lead.outreachFollowUp.subject,
    body: lead.outreachFollowUp.body,
    leadId: lead._id,
  });

  if (!result.success) {
    lead.outreachFollowUp.status = 'failed';
    await lead.save();
    return res.status(502).json({ error: result.error || 'Failed to send email.' });
  }

  lead.outreachFollowUp.status = 'sent';
  lead.outreachFollowUp.sentAt = new Date();
  lead.outreachFollowUp.providerMessageId = result.messageId || '';
  await lead.save();

  res.json(lead);
}));

router.post('/:id/generate-followup-whatsapp', analyzeLimiter, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });
  if (lead.whatsappOutreach?.status !== 'opened') {
    return res.status(409).json({ error: 'Open the first WhatsApp message before drafting a follow-up.' });
  }

  const includeDemo = req.body?.includeDemo === true;
  const followUp = await generateFollowUpWhatsapp(lead, { includeDemo });
  lead.whatsappFollowUp = { ...lead.whatsappFollowUp.toObject(), ...followUp };
  await lead.save();

  res.json(lead);
}));

router.patch('/:id/followup-whatsapp', asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: 'Message is required (max 2000 characters).' });
  }

  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.whatsappFollowUp.message = message.trim();
  if (lead.whatsappFollowUp.status === 'pending' || lead.whatsappFollowUp.status === 'failed') {
    lead.whatsappFollowUp.status = 'drafted';
  }
  await lead.save();

  res.json(lead);
}));

router.post('/:id/followup-whatsapp-opened', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  lead.whatsappFollowUp.status = 'opened';
  lead.whatsappFollowUp.openedAt = new Date();
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
