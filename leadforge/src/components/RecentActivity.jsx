import StatusBadge from './StatusBadge';

export default function RecentActivity({ leads }) {
  return (
    <div
      className="rounded-[28px] h-full flex flex-col overflow-hidden"
      style={{ background: '#dfe1e0' }}
    >
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-black)' }}>Recent Activity</span>
        {leads.length > 0 && <span className="font-mono text-[11px] font-bold tnum" style={{ color: 'var(--color-black)' }}>{leads.length}</span>}
      </div>

      {leads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 py-10 px-4 text-center">
          <p className="text-[13px] text-text-2">No leads yet</p>
          <p className="text-[12px] text-text-3">Results will appear here once a scrape runs.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {leads.map((lead, i) => (
            <div
              key={lead._id}
              className="flex items-center gap-3 px-4 py-2.5 border-t"
              style={{ borderColor: i === 0 ? 'transparent' : 'var(--color-border)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-text font-medium truncate">{lead.businessName}</p>
                <p className="text-[12px] text-text-3 truncate mt-0.5">{lead.email || 'No email found'}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
