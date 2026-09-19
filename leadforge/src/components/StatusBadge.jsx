import { STATUS_LABELS } from '../constants/leadStatus';

const COLORS = {
  new: 'var(--color-text-2)',
  contacted: 'var(--color-accent)',
  delivered: 'var(--color-accent)',
  replied: 'var(--color-accent-2)',
  positive_interest: 'var(--color-accent-3)',
  qualified: 'var(--color-accent-3)',
  meeting_scheduled: 'var(--color-accent-2)',
  demo_sent: 'var(--color-accent-2)',
  proposal_sent: 'var(--color-accent-2)',
  negotiation: 'var(--color-accent-2)',
  won: 'var(--color-success)',
  lost: 'var(--color-danger)',
  paused: 'var(--color-text-3)',
  do_not_contact: 'var(--color-danger)',
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || COLORS.new;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
