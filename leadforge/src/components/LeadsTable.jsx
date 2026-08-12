import { motion } from 'framer-motion';
import WebsiteStatusBadge from './WebsiteStatusBadge';

const STATUS_COLOR = {
  new: 'var(--color-text-2)',
  contacted: 'var(--color-accent)',
  converted: 'var(--color-success)',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
const item = { hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } };

export default function LeadsTable({ leads, onStatusChange, onDelete, onSelectLead }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-24">
        <p className="text-[13.5px] text-text-2">No leads found</p>
        <p className="text-[12.5px] text-text-3">Start a scrape from the dashboard to generate leads.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-text-3 text-[11px] font-medium uppercase tracking-wider border-b" style={{ borderColor: 'var(--color-border)' }}>
            <th className="text-left py-2.5 px-4 font-medium">Business Name</th>
            <th className="text-left py-2.5 px-4 font-medium">Email</th>
            <th className="text-left py-2.5 px-4 font-medium">Phone</th>
            <th className="text-left py-2.5 px-4 font-medium">Website</th>
            <th className="text-left py-2.5 px-4 font-medium">Country</th>
            <th className="text-left py-2.5 px-4 font-medium">Keyword</th>
            <th className="text-left py-2.5 px-4 font-medium">Status</th>
            <th className="text-right py-2.5 px-4 font-medium w-10" />
          </tr>
        </thead>
        <motion.tbody variants={container} initial="hidden" animate="show">
          {leads.map(lead => (
            <motion.tr
              key={lead._id}
              variants={item}
              className="group border-b transition-colors duration-150"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: lead.highPriority ? 'inset 3px 0 0 var(--color-accent-2)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <td className="py-2.5 px-4 whitespace-nowrap">
                <button
                  onClick={() => onSelectLead?.(lead)}
                  className="text-text font-medium hover:text-accent transition-colors duration-150 text-left"
                >
                  {lead.businessName}
                </button>
                {lead.aiAnalysis?.status === 'completed' && typeof lead.aiAnalysis.leadQualityScore === 'number' && (
                  <span
                    className="ml-2 inline-flex items-center font-mono text-[11px] font-medium tnum px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                    title="AI lead quality score"
                  >
                    {lead.aiAnalysis.leadQualityScore}
                  </span>
                )}
              </td>
              <td className="py-2.5 px-4">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-text-2 hover:text-accent transition-colors duration-150">
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-text-3">—</span>
                )}
              </td>
              <td className="py-2.5 px-4 font-mono text-[12.5px] text-text-2 tnum">{lead.phone || '—'}</td>
              <td className="py-2.5 px-4">
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity duration-150">
                    <WebsiteStatusBadge status={lead.websiteStatus} score={lead.websiteQualityScore} />
                  </a>
                ) : (
                  <WebsiteStatusBadge status={lead.websiteStatus || 'none'} />
                )}
              </td>
              <td className="py-2.5 px-4 text-text-2">{lead.country || '—'}</td>
              <td className="py-2.5 px-4 text-text-2">{lead.keyword}</td>
              <td className="py-2.5 px-4">
                <div className="relative inline-block">
                  <select
                    value={lead.status}
                    onChange={e => onStatusChange(lead._id, e.target.value)}
                    className="bg-transparent text-[12.5px] font-medium capitalize cursor-pointer outline-none appearance-none pr-4"
                    style={{ color: STATUS_COLOR[lead.status] }}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="converted">converted</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-3"
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
                  className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-danger transition-all duration-150 text-[12px] font-medium"
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
