export const WEBSITE_STATUS_META = {
  none: { label: 'No Website', color: 'var(--color-danger)' },
  broken: { label: 'Broken', color: 'var(--color-danger)' },
  // The site actively refused our check (bot protection) rather than being confirmed down —
  // distinct from `broken` on purpose, since telling a business their working site is broken
  // would be false. Neutral color, not red: this isn't a verdict against them.
  unverified: { label: "Couldn't Verify", color: 'var(--color-text-3)' },
  facebook_only: { label: 'Facebook Only', color: 'var(--color-accent-2)' },
  instagram_only: { label: 'Instagram Only', color: 'var(--color-accent-2)' },
  google_business_only: { label: 'Google Business Only', color: 'var(--color-accent-2)' },
  outdated: { label: 'Outdated', color: 'var(--color-accent-2)' },
  // A real site that's just weak (thin metadata, no social/contact links) - distinct from a
  // confirmed-strong `has_website` below. This is the preferred kind of lead: an existing
  // presence worth improving, not a first-time sell.
  weak_website: { label: 'Weak Website', color: 'var(--color-accent-2)' },
  has_website: { label: 'Strong Website', color: 'var(--color-success)' },
};

// Not one of the real, computed statuses above — used only when a lead has never actually
// been through analyzeWebsite() (e.g. legacy rows from before this field existed). Kept
// distinct from `none` so "not analyzed yet" never gets silently displayed as a confirmed
// "no website" verdict.
const UNANALYZED_META = { label: 'Not Analyzed', color: 'var(--color-text-3)' };

export default function WebsiteStatusBadge({ status, score }) {
  const meta = WEBSITE_STATUS_META[status] || UNANALYZED_META;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: meta.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
      {meta.label}
      {typeof score === 'number' && status !== 'none' && (
        <span className="text-text-3 font-mono tnum">{score}</span>
      )}
    </span>
  );
}
