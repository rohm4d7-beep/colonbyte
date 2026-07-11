export default function StatusBadge({ status }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-medium rounded-full"
      style={{
        background: `var(--color-status-${status}-bg)`,
        color: `var(--color-status-${status}-text)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--color-status-${status}-dot)` }} />
      {status}
    </span>
  );
}
