import { useEffect, useState } from 'react';
import API_BASE, { apiFetch } from '../config';

const POLL_MS = 30_000;

function formatResetIn(resetAt) {
  if (!resetAt) return null;
  const ms = resetAt - Date.now();
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h`;
}

// Rendered inside PipelineOverview's black card (see its dark rgba(255,255,255,x) text
// convention) rather than as its own card — no background/padding of its own here.
export default function GroqUsageWidget() {
  const [keys, setKeys] = useState([]);

  const fetchUsage = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/groq-usage`);
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      // ignore — widget just stays on its last known snapshot
    }
  };

  useEffect(() => {
    fetchUsage();
    const timer = setInterval(fetchUsage, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  if (keys.length === 0) return null;

  const cappedCount = keys.filter((k) => k.capped).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Groq Key Usage (Today)
        </span>
        <span className="text-[11.5px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {cappedCount > 0 ? `${cappedCount}/${keys.length} capped` : 'all keys healthy'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        {keys.map((k) => {
          const resetIn = k.capped ? formatResetIn(k.resetAt) : null;
          const barColor = k.capped ? 'var(--color-danger)' : 'var(--color-accent-3)';
          return (
            <div key={k.keyIndex}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.8)' }}>Key {k.keyIndex}</span>
                <span className="text-[10.5px] font-mono tnum" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {k.used.toLocaleString()}/{k.limit.toLocaleString()}
                  {resetIn && ` · ~${resetIn}`}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(k.percentUsed, k.used > 0 ? 2 : 0)}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
