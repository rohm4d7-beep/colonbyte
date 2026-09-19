// The conversion funnel (brief section 14): Scraped -> Verified -> Qualified -> Approved ->
// Contacted -> Delivered -> Replied -> Positive Interest -> Qualified Conversation -> Meeting ->
// Proposal -> Won. Each stage is CUMULATIVE (a lead counted at "Replied" also counts at every
// earlier stage) except the first four, which are independent gates checked directly on the
// lead's current data rather than a status ever having been "reached."
//
// The last 9 stages are computed from statusHistory, not the lead's current `status` field -
// current status alone can't answer "did this lead ever pass through X," since a lead can jump
// straight from 'new' to 'do_not_contact' (an opt-out reply) without ever having been
// 'contacted'. Every status change goes through routes/leads.js's setStatus(), which always
// pushes to statusHistory, so statusHistory is a complete, reliable record - membership in that
// array (via $in against a $map'd list of its `status` values) is the only correct test for
// "was this stage ever reached."
export const FUNNEL_STAGES = [
  { key: 'scraped', label: 'Scraped' },
  { key: 'verified', label: 'Verified' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'approved', label: 'Approved' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'replied', label: 'Replied' },
  { key: 'positiveInterest', label: 'Positive Interest' },
  { key: 'qualifiedConversation', label: 'Qualified Conversation' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'won', label: 'Won' },
];

const STATUS_HISTORY_STAGE_KEYS = {
  contacted: 'contacted',
  delivered: 'delivered',
  replied: 'replied',
  positiveInterest: 'positive_interest',
  qualifiedConversation: 'qualified',
  meeting: 'meeting_scheduled',
  proposal: 'proposal_sent',
  won: 'won',
};

// $ifNull guards leads scraped before statusHistory existed - their raw stored document has no
// statusHistory field at all (Mongoose's schema default only applies at the app layer, never
// retroactively to documents already in MongoDB), so $map would otherwise receive a missing
// field and return null, which $in then rejects ("$in requires an array") - confirmed live
// against production data, not a hypothetical.
const historyStatuses = { $map: { input: { $ifNull: ['$statusHistory', []] }, as: 's', in: '$$s.status' } };

/**
 * Returns the accumulator object for a single $group aggregation stage that computes every
 * funnel count in one pass (used both for the global funnel and per-campaign, grouped by
 * whatever `_id` the caller supplies).
 */
export function funnelAccumulators() {
  const acc = {
    scraped: { $sum: 1 },
    verified: { $sum: { $cond: ['$countryVerified', 1, 0] } },
    qualified: { $sum: { $cond: [{ $eq: ['$aiAnalysis.worthContacting', true] }, 1, 0] } },
    approved: { $sum: { $cond: ['$highPriority', 1, 0] } },
  };
  for (const [key, status] of Object.entries(STATUS_HISTORY_STAGE_KEYS)) {
    // "Reached this stage" = it's in statusHistory (a confirmed past transition) OR it's the
    // lead's current status (a confirmed present fact) - checked live against production data:
    // every one of the 1387 leads in this database predates the statusHistory feature entirely
    // (0 of them have a single history entry), so relying on history alone would report 0% at
    // every pipeline stage despite 1261 leads currently sitting at 'contacted'. This never
    // fabricates a stage a legacy lead can't be shown to have passed through (e.g. a legacy
    // 'won' lead isn't retroactively credited with 'contacted' unless its CURRENT status is
    // 'contacted') - it only ever credits a stage that's directly evidenced, either by history
    // or by the present. Once statusHistory actually starts recording new transitions, it
    // supersedes this fallback for those leads on its own.
    acc[key] = { $sum: { $cond: [{ $or: [{ $in: [status, historyStatuses] }, { $eq: ['$status', status] }] }, 1, 0] } };
  }
  return acc;
}

/**
 * Shapes a raw aggregation result row (one per group) into the ordered stage list the frontend
 * renders, each with its count and percentage of the top-of-funnel ('scraped') count.
 */
export function shapeFunnelResult(row) {
  const scraped = row?.scraped || 0;
  return FUNNEL_STAGES.map(({ key, label }) => {
    const count = row?.[key] || 0;
    return { key, label, count, pctOfTotal: scraped > 0 ? Math.round((count / scraped) * 1000) / 10 : 0 };
  });
}
