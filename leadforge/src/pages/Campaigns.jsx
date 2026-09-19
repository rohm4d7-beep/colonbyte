import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API_BASE, { apiFetch } from '../config';
import { REPLY_LABEL_META } from '../constants/leadStatus';

const CAMPAIGN_STATUS_COLOR = {
  running: 'var(--color-accent)',
  done: 'var(--color-success)',
  error: 'var(--color-danger)',
};

// Key funnel stages worth a column in the per-campaign table - the full 12-stage funnel is
// shown once, org-wide, above; repeating all 12 per campaign would be unreadable in a table row.
const CAMPAIGN_TABLE_STAGES = ['qualified', 'contacted', 'replied', 'won'];

function FunnelBar({ stage, maxCount }) {
  const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 2 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-text-2 w-[150px] shrink-0 text-right">{stage.label}</span>
      <div className="flex-1 h-6 rounded-full relative overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--color-accent)' }}
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[12px] font-mono tnum text-text w-[100px] shrink-0">
        {stage.count.toLocaleString()} <span className="text-text-3">({stage.pctOfTotal}%)</span>
      </span>
    </div>
  );
}

// Auto-created one per scrape job (never configured upfront) - this page makes that otherwise-
// invisible Campaign entity visible, plus the org-wide conversion funnel (server/routes/
// campaigns.js's GET /funnel) since both are read from the same campaignId/status/statusHistory
// data. See funnelStages.js's comment on why "reached stage X" also falls back to the lead's
// CURRENT status, not just statusHistory - production data here predates that tracking entirely.
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_BASE}/api/campaigns`).then((res) => res.json()),
      apiFetch(`${API_BASE}/api/campaigns/funnel`).then((res) => res.json()),
    ])
      .then(([campaignsData, funnel]) => {
        setCampaigns(campaignsData.campaigns || []);
        setFunnelData(funnel);
      })
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  }, []);

  const funnel = funnelData?.funnel || [];
  const maxCount = funnel[0]?.count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto max-w-[1120px] px-7 py-8"
    >
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-text">Campaigns</h1>
        <p className="text-text-2 text-[13px] mt-1">One per scrape job — auto-created, grouping the leads it found</p>
      </div>

      {loading ? (
        <p className="text-[13px] text-text-3">Loading…</p>
      ) : error ? (
        <p className="text-[13px]" style={{ color: 'var(--color-danger)' }}>{error}</p>
      ) : (
        <>
          {funnel.length > 0 && (
            <div className="rounded-[28px] p-6 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 className="text-[14px] font-semibold text-text mb-4">Conversion Funnel</h2>
              <div className="space-y-2">
                {funnel.map((stage) => (
                  <FunnelBar key={stage.key} stage={stage} maxCount={maxCount} />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-3 mr-1">Reply outcomes</span>
                {Object.entries(REPLY_LABEL_META).map(([label, meta]) => {
                  const count = funnelData?.replies?.[label] || 0;
                  if (!count) return null;
                  return (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-[11.5px] font-medium"
                      style={{ background: 'var(--color-surface-2)', color: meta.color }}
                    >
                      {meta.label}
                      <span className="font-mono tnum">{count}</span>
                    </span>
                  );
                })}
                {!Object.values(funnelData?.replies || {}).some(Boolean) && (
                  <span className="text-[12px] text-text-3">No classified replies yet</span>
                )}
                <span className="w-px h-4 mx-1" style={{ background: 'var(--color-border)' }} />
                <span className="text-[11.5px] text-text-3">
                  Bounced <span className="font-mono tnum text-text">{funnelData?.bounced || 0}</span>
                </span>
                <span className="text-[11.5px] text-text-3">
                  Opted out <span className="font-mono tnum text-text">{funnelData?.optedOut || 0}</span>
                </span>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <p className="text-[13px] text-text-3">No campaigns yet — run a scrape from the Dashboard to create one.</p>
          ) : (
            <div className="rounded-[28px] overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-medium uppercase tracking-wider text-text-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="py-3 px-5">Campaign</th>
                    <th className="py-3 px-5">Started</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Leads</th>
                    {CAMPAIGN_TABLE_STAGES.map((key) => (
                      <th key={key} className="py-3 px-5 capitalize">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const stageByKey = Object.fromEntries((c.funnel || []).map((s) => [s.key, s]));
                    return (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="py-3 px-5 text-[13px] text-text font-medium">{c.name}</td>
                        <td className="py-3 px-5 text-[12.5px] text-text-2">{new Date(c.startedAt).toLocaleString()}</td>
                        <td className="py-3 px-5 text-[12.5px] font-medium capitalize" style={{ color: CAMPAIGN_STATUS_COLOR[c.status] }}>
                          {c.status}
                        </td>
                        <td className="py-3 px-5 text-[13px] font-mono tnum text-text">{c.leadCounts?.total || 0}</td>
                        {CAMPAIGN_TABLE_STAGES.map((key) => (
                          <td key={key} className="py-3 px-5 text-[13px] font-mono tnum text-text-2">
                            {stageByKey[key]?.count ?? 0}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
