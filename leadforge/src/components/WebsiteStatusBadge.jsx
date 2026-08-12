export const WEBSITE_STATUS_META = {
  none: { label: 'No Website', color: 'var(--color-danger)' },
  broken: { label: 'Broken', color: 'var(--color-danger)' },
  facebook_only: { label: 'Facebook Only', color: 'var(--color-accent-2)' },
  instagram_only: { label: 'Instagram Only', color: 'var(--color-accent-2)' },
  google_business_only: { label: 'Google Business Only', color: 'var(--color-accent-2)' },
  outdated: { label: 'Outdated', color: 'var(--color-accent-2)' },
  has_website: { label: 'Has Website', color: 'var(--color-success)' },
};

export default function WebsiteStatusBadge({ status, score }) {
  const meta = WEBSITE_STATUS_META[status] || WEBSITE_STATUS_META.none;
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
