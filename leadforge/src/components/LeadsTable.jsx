import { motion } from 'framer-motion';
import WebsiteStatusBadge from './WebsiteStatusBadge';

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.6h2.55l.38-2.95h-2.93V8.56c0-.85.24-1.44 1.46-1.44h1.56V4.5c-.27-.04-1.2-.12-2.28-.12-2.25 0-3.79 1.37-3.79 3.89v2.17H8v2.95h2.45V21h3.05Z" />
    </svg>
  );
}

// Calibrated against a pure black row background, not the app's light-surface text tokens -
// this table is permanently dark now (not theme-dependent), so it needs its own light-on-black
// palette rather than reusing var(--color-text-2/3), which are tuned for white surfaces.
const MUTED = 'rgba(255,255,255,0.55)';
const FAINT = 'rgba(255,255,255,0.35)';

const STATUS_COLOR = {
  new: MUTED,
  contacted: 'var(--color-accent)',
  converted: 'var(--color-success)',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
const item = { hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } };

export default function LeadsTable({ leads, onStatusChange, onDelete, onSelectLead }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-24">
        <p className="text-[13.5px]" style={{ color: MUTED }}>No leads found</p>
        <p className="text-[12.5px]" style={{ color: FAINT }}>Start a scrape from the dashboard to generate leads.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wider" style={{ background: 'var(--color-black)', color: 'rgba(255,255,255,0.6)' }}>
            <th className="text-left py-3 px-4 font-semibold first:rounded-l-2xl" style={{ color: '#ffffff' }}>Business Name</th>
            <th className="text-left py-3 px-4 font-semibold">Email</th>
            <th className="text-left py-3 px-4 font-semibold">Phone</th>
            <th className="text-left py-3 px-4 font-semibold">Website</th>
            <th className="text-left py-3 px-4 font-semibold">Country</th>
            <th className="text-left py-3 px-4 font-semibold">Keyword</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-right py-3 px-4 font-semibold w-10 last:rounded-r-2xl" />
          </tr>
        </thead>
        <motion.tbody variants={container} initial="hidden" animate="show" style={{ background: 'var(--color-black)' }}>
          {leads.map(lead => (
            <motion.tr
              key={lead._id}
              variants={item}
              className="group border-b transition-colors duration-150"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: lead.highPriority ? 'inset 3px 0 0 var(--color-accent-2)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <td className="py-2.5 px-4 whitespace-nowrap">
                <button
                  onClick={() => onSelectLead?.(lead)}
                  className="font-medium hover:opacity-75 transition-opacity duration-150 text-left"
                  style={{ color: '#ffffff' }}
                >
                  {lead.businessName}
                </button>
                {lead.aiAnalysis?.status === 'completed' && typeof lead.aiAnalysis.leadQualityScore === 'number' && (
                  <span
                    className="ml-2 inline-flex items-center font-mono text-[11px] font-medium tnum px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(61,86,232,0.25)', color: '#8fa0ff' }}
                    title="AI lead quality score"
                  >
                    {lead.aiAnalysis.leadQualityScore}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="hover:opacity-75 transition-opacity duration-150" style={{ color: MUTED }}>
                      {lead.email}
                    </a>
                  ) : (
                    <span style={{ color: FAINT }}>—</span>
                  )}
                  {lead.instagramUrl && (
                    <a
                      href={lead.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      title="Instagram"
                      className="shrink-0 hover:opacity-75 transition-opacity duration-150"
                      style={{ color: FAINT }}
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.facebookUrl && (
                    <a
                      href={lead.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      title="Facebook"
                      className="shrink-0 hover:opacity-75 transition-opacity duration-150"
                      style={{ color: FAINT }}
                    >
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono text-[12.5px] tnum" style={{ color: MUTED }}>{lead.phone || '—'}</td>
              <td className="py-2.5 px-4">
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity duration-150">
                    <WebsiteStatusBadge status={lead.websiteStatus} score={lead.websiteQualityScore} />
                  </a>
                ) : (
                  <WebsiteStatusBadge status={lead.websiteStatus || 'none'} />
                )}
              </td>
              <td className="py-2.5 px-4" style={{ color: MUTED }}>{lead.country || '—'}</td>
              <td className="py-2.5 px-4" style={{ color: MUTED }}>{lead.keyword}</td>
              <td className="py-2.5 px-4">
                <div className="relative inline-block">
                  <select
                    value={lead.status}
                    onChange={e => onStatusChange(lead._id, e.target.value)}
                    className="bg-transparent text-[12.5px] font-medium capitalize cursor-pointer outline-none appearance-none pr-4"
                    style={{ color: STATUS_COLOR[lead.status], colorScheme: 'dark' }}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="converted">converted</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5"
                    style={{ color: FAINT }}
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </td>
              <td className="py-2.5 px-4 text-right">
                <button
                  onClick={() => onDelete(lead._id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-danger transition-all duration-150 text-[12px] font-medium"
                  style={{ color: FAINT }}
                >
                  Delete
                </button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
