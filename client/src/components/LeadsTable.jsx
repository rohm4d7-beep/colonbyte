import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function LeadsTable({ leads, onStatusChange, onDelete }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted text-sm">
        No leads found. Start a scrape to generate leads.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-xs font-medium uppercase tracking-wider border-b border-border">
            <th className="text-left py-3 px-4 font-medium">Business Name</th>
            <th className="text-left py-3 px-4 font-medium">Email</th>
            <th className="text-left py-3 px-4 font-medium">Phone</th>
            <th className="text-left py-3 px-4 font-medium">Website</th>
            <th className="text-left py-3 px-4 font-medium">Country</th>
            <th className="text-left py-3 px-4 font-medium">Keyword</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <motion.tbody variants={container} initial="hidden" animate="show">
          {leads.map(lead => (
            <motion.tr
              key={lead._id}
              variants={item}
              className="border-b border-border hover:bg-accent-glow transition-colors"
            >
              <td className="py-3 px-4 text-text-primary font-medium">{lead.businessName}</td>
              <td className="py-3 px-4 text-text-primary">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-text-subtle">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-text-muted">{lead.phone || '—'}</td>
              <td className="py-3 px-4">
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer" className="text-accent hover:underline truncate max-w-[160px] block">
                    {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                ) : (
                  <span className="text-text-subtle">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-text-muted">{lead.country || '—'}</td>
              <td className="py-3 px-4 text-text-muted">{lead.keyword}</td>
              <td className="py-3 px-4">
                <select
                  value={lead.status}
                  onChange={e => onStatusChange(lead._id, e.target.value)}
                  className="bg-transparent text-text-primary text-xs border border-border rounded px-2 py-1 cursor-pointer"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="converted">converted</option>
                </select>
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onDelete(lead._id)}
                  className="text-text-subtle hover:text-red-400 transition-colors text-xs"
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
