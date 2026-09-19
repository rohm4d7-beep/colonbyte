// Mirrors server/models/Lead.js's LEAD_STATUSES - kept in sync manually since the client can't
// import server code. Order matches the server's rough pipeline-progression ordering.
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'delivered',
  'replied',
  'positive_interest',
  'qualified',
  'meeting_scheduled',
  'demo_sent',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
  'paused',
  'do_not_contact',
];

export const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  delivered: 'Delivered',
  replied: 'Replied',
  positive_interest: 'Positive interest',
  qualified: 'Qualified',
  meeting_scheduled: 'Meeting scheduled',
  demo_sent: 'Demo sent',
  proposal_sent: 'Proposal sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  paused: 'Paused',
  do_not_contact: 'Do not contact',
};

export const REPLY_CHANNELS = ['email', 'whatsapp', 'instagram', 'facebook'];
export const REPLY_CHANNEL_LABELS = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export const REPLY_LABEL_META = {
  interested: { label: 'Interested', color: 'var(--color-success)' },
  not_interested: { label: 'Not interested', color: 'var(--color-danger)' },
  pricing_inquiry: { label: 'Pricing inquiry', color: 'var(--color-accent-2)' },
  referral: { label: 'Referral', color: 'var(--color-accent-2)' },
  opt_out: { label: 'Opt-out', color: 'var(--color-danger)' },
  unclear: { label: 'Unclear', color: 'var(--color-text-3)' },
  automated: { label: 'Automated', color: 'var(--color-text-3)' },
};

// Deliberately computed here from the lead's actual contact fields rather than stored on the
// lead server-side - a lead can gain an email/social link later (recheck-website, manual edit),
// and a persisted recommendation would silently go stale. Priority order matches the pipeline's
// own channel preference (routes/leads.js: email has a real send + tracking, the rest are
// manual-copy workflows) - see [[project-leadforge-pipeline-issues]].
export function recommendedOutreachChannel(lead) {
  if (!lead) return null;
  if (lead.email) return 'email';
  if (lead.phone) return 'whatsapp';
  if (lead.instagramUrl) return 'instagram';
  if (lead.facebookUrl) return 'facebook';
  return null;
}
