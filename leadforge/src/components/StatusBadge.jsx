const COLORS = {
  new: 'var(--color-text-2)',
  contacted: 'var(--color-accent)',
  converted: 'var(--color-success)',
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || COLORS.new;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium capitalize" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {status}
    </span>
  );
}
