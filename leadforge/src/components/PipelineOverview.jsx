import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) {
      setDisplay(0);
      return;
    }
    const duration = 600;
    const steps = 24;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return display.toLocaleString();
}

export default function PipelineOverview({ stats }) {
  const { total = 0, emails = 0, contacted = 0, converted = 0 } = stats;
  const newCount = Math.max(total - contacted - converted, 0);
  const coverage = total > 0 ? Math.round((emails / total) * 100) : 0;

  const segments = [
    { key: 'new', label: 'New', value: newCount, color: 'var(--color-text-3)' },
    { key: 'contacted', label: 'Contacted', value: contacted, color: 'var(--color-accent)' },
    { key: 'converted', label: 'Converted', value: converted, color: 'var(--color-success)' },
  ];

  return (
    <div
      className="rounded-md border p-6 h-full"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-12 mb-8">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Total Leads</div>
          <div className="font-mono text-[36px] leading-none font-semibold text-text tnum">
            <CountUp value={total} />
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-2">Emails Found</div>
          <div className="flex items-baseline gap-2">
            <div className="font-mono text-[36px] leading-none font-semibold text-text tnum">
              <CountUp value={emails} />
            </div>
            {total > 0 && <span className="text-[12.5px] font-medium text-text-2">{coverage}% coverage</span>}
          </div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-text-3 mb-3">Pipeline</div>
        <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          {segments.map(s =>
            s.value > 0 ? (
              <motion.div
                key={s.key}
                initial={{ width: 0 }}
                animate={{ width: `${(s.value / total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: s.color }}
              />
            ) : null
          )}
        </div>
        <div className="flex items-center gap-6 mt-4">
          {segments.map(s => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[12.5px] text-text-2">{s.label}</span>
              <span className="text-[12.5px] font-mono font-medium text-text tnum">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
