import { Router } from 'express';
import Campaign from '../models/Campaign.js';
import Lead from '../models/Lead.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { funnelAccumulators, shapeFunnelResult } from '../services/funnelStages.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).limit(200).lean();
  const campaignIds = campaigns.map((c) => c._id);

  const [leadCounts, funnelRows] = await Promise.all([
    Lead.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      { $group: { _id: { campaignId: '$campaignId', status: '$status' }, count: { $sum: 1 } } },
    ]),
    // Same funnelAccumulators() as GET /funnel, grouped per campaign instead of globally - one
    // aggregation pass covers every campaign's funnel rather than N queries per campaign.
    Lead.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      { $group: { _id: '$campaignId', ...funnelAccumulators() } },
    ]),
  ]);

  const countsByCampaign = {};
  for (const row of leadCounts) {
    const cid = String(row._id.campaignId);
    if (!countsByCampaign[cid]) countsByCampaign[cid] = { total: 0, byStatus: {} };
    countsByCampaign[cid].byStatus[row._id.status] = row.count;
    countsByCampaign[cid].total += row.count;
  }

  const funnelByCampaign = {};
  for (const row of funnelRows) {
    funnelByCampaign[String(row._id)] = shapeFunnelResult(row);
  }

  const result = campaigns.map((c) => ({
    ...c,
    leadCounts: countsByCampaign[String(c._id)] || { total: 0, byStatus: {} },
    funnel: funnelByCampaign[String(c._id)] || shapeFunnelResult(null),
  }));

  res.json({ campaigns: result });
}));

// Org-wide conversion funnel (brief section 14) - optionally scoped to a country and/or a
// createdAt date range. Also surfaces reply-outcome, bounce, and opt-out counts alongside the
// funnel itself since those are the other headline deliverability/response numbers the brief
// asks to track, and they share the same filter.
router.get('/funnel', asyncHandler(async (req, res) => {
  const { country, from, to } = req.query;

  const match = {};
  if (typeof country === 'string' && country) match.country = country;
  if (typeof from === 'string' && from) match.createdAt = { ...match.createdAt, $gte: new Date(from) };
  if (typeof to === 'string' && to) match.createdAt = { ...match.createdAt, $lte: new Date(to) };

  const [[funnelRow], replyLabelRows, bounced, optedOut] = await Promise.all([
    Lead.aggregate([{ $match: match }, { $group: { _id: null, ...funnelAccumulators() } }]),
    Lead.aggregate([
      { $match: match },
      { $unwind: '$replies' },
      { $match: { 'replies.classification.label': { $exists: true } } },
      { $group: { _id: '$replies.classification.label', count: { $sum: 1 } } },
    ]),
    Lead.countDocuments({ ...match, 'outreach.bounced': true }),
    Lead.countDocuments({ ...match, doNotContact: true }),
  ]);

  const byReplyLabel = {};
  for (const row of replyLabelRows) byReplyLabel[row._id] = row.count;

  res.json({
    funnel: shapeFunnelResult(funnelRow),
    replies: byReplyLabel,
    bounced,
    optedOut,
  });
}));

export default router;
