import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LeadsTable from '../components/LeadsTable';
import LeadDetailDrawer from '../components/LeadDetailDrawer';
import { WEBSITE_STATUS_META } from '../components/WebsiteStatusBadge';
import { LEAD_STATUSES, STATUS_LABELS } from '../constants/leadStatus';
import { useConfirm } from '../components/ConfirmDialog';
import API_BASE, { apiFetch } from '../config';

const MIN_RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5+ stars' },
  { value: '4', label: '4.0+ stars' },
  { value: '3', label: '3.0+ stars' },
];

const WEBSITE_STATUS_OPTIONS = Object.entries(WEBSITE_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

function statusLabel(s) {
  return s ? STATUS_LABELS[s] || s : 'All';
}

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5 10.5 10.5" />
    </svg>
  );
}

function ChevronDown(props) {
  return (
    <svg viewBox="0 0 10 6" fill="none" {...props}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}

function ChevronRight(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export default function Leads() {
  // Lets the Dashboard's "Website Missing" / "High Priority Leads" cards link straight to a
  // pre-filtered view (e.g. /leads?highPriority=true) instead of just being decorative -
  // read once on mount as the initial filter state, same as a bookmark or shared link would.
  const [searchParams] = useSearchParams();
  const confirm = useConfirm();

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [country, setCountry] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState(() => searchParams.get('websiteStatus') || '');
  const [highPriority, setHighPriority] = useState(() => searchParams.get('highPriority') === 'true');
  const [requiresReview, setRequiresReview] = useState(() => searchParams.get('requiresReview') === 'true');
  const [minRating, setMinRating] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (websiteStatus) params.set('websiteStatus', websiteStatus);
    if (highPriority) params.set('highPriority', 'true');
    if (requiresReview) params.set('requiresReview', 'true');
    if (minRating) params.set('minRating', minRating);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', page);
    params.set('limit', 20);

    try {
      const res = await apiFetch(`${API_BASE}/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // ignore
    }
  }, [country, websiteStatus, highPriority, requiresReview, minRating, status, search, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/leads/countries`)
      .then(res => res.json())
      .then(data => setCountries(data.countries || []))
      .catch(() => {});
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`${API_BASE}/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    // The row button that triggers this only appears on hover at the row's far edge - a stray
    // click while scanning the table used to permanently delete the lead with zero recourse.
    // Confirmed live: two leads vanished this way with no trace in any pipeline log, since a
    // successful DELETE leaves nothing to trace. Same confirm() the bulk "delete all" action
    // already uses on Dashboard.jsx.
    if (!(await confirm('Delete this lead? This cannot be undone.', { confirmLabel: 'Delete' }))) return;
    try {
      await apiFetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch {
      // ignore
    }
  };

  const handleExport = () => {
    window.open(`${API_BASE}/api/leads/export`, '_blank');
  };

  const handleLeadUpdated = (updated) => {
    setLeads(prev => prev.map(l => (l._id === updated._id ? updated : l)));
    setSelectedLead(updated);
  };

  const statusFilters = ['', ...LEAD_STATUSES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto max-w-[1120px] px-6 py-8"
    >
      <div
        className="flex items-center justify-between gap-3 rounded-full px-14 py-3 mb-4"
        style={{ background: 'var(--color-accent-2)', color: '#ffffff' }}
      >
        <div>
          <h1 className="text-[18px] font-bold tracking-tight leading-none">Leads</h1>
          <p className="text-[12.5px] mt-1 opacity-70 leading-none">
            <span className="font-mono font-bold tnum">{total}</span> total leads
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold transition-all duration-150 hover:brightness-95 active:scale-[0.98]"
          style={{ background: '#ffffff', color: 'var(--color-black)' }}
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {(highPriority || requiresReview) && (
        <div className="flex items-center gap-2 mb-4">
          {highPriority && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-[12px] font-semibold"
              style={{ background: 'var(--color-accent-2-soft)', color: 'var(--color-accent-2)' }}
            >
              High Priority only
              <button
                onClick={() => { setHighPriority(false); setPage(1); }}
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 hover:opacity-70"
                style={{ background: 'var(--color-accent-2)', color: '#ffffff' }}
                title="Clear filter"
              >
                <CloseIcon className="w-2 h-2" />
              </button>
            </span>
          )}
          {requiresReview && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-[12px] font-semibold"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}
            >
              Needs Review only
              <button
                onClick={() => { setRequiresReview(false); setPage(1); }}
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 hover:opacity-70"
                style={{ background: 'var(--color-text-3)', color: '#ffffff' }}
                title="Clear filter"
              >
                <CloseIcon className="w-2 h-2" />
              </button>
            </span>
          )}
        </div>
      )}

      <div
        className="rounded-full px-3 py-3 mb-3"
        style={{ background: 'var(--color-accent-3)' }}
      >
        <div className="rounded-full px-2 py-1.5 overflow-x-auto" style={{ background: 'var(--color-black)' }}>
          <div className="inline-flex items-center gap-0.5 whitespace-nowrap">
            {statusFilters.map(s => (
              <button
                key={s || 'all'}
                onClick={() => { setStatus(s); setPage(1); }}
                className="relative px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors duration-150 shrink-0"
                style={{ color: status === s ? 'var(--color-black)' : 'rgba(255,255,255,0.65)' }}
              >
                {status === s && (
                  <motion.span
                    layoutId="status-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: '#ffffff' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative">{statusLabel(s)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-full px-6 py-3.5 mb-5"
        style={{ background: '#dfe1e0' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2 pb-0 border-b border-transparent w-60">
            <SearchIcon className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(0,0,0,0.6)' }} />
            <input
              type="text"
              placeholder="Search by name or keyword…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-black placeholder:opacity-50"
              style={{ color: 'var(--color-black)' }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-5">
          <div className="relative inline-block">
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setPage(1); }}
              className="bg-transparent text-[13px] pr-4 outline-none appearance-none cursor-pointer"
              style={{ color: 'var(--color-black)', colorScheme: 'light' }}
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5" style={{ color: 'rgba(0,0,0,0.6)' }} />
          </div>

          <div className="relative inline-block">
            <select
              value={websiteStatus}
              onChange={e => { setWebsiteStatus(e.target.value); setPage(1); }}
              className="bg-transparent text-[13px] pr-4 outline-none appearance-none cursor-pointer"
              style={{ color: 'var(--color-black)', colorScheme: 'light' }}
            >
              <option value="">All Website Statuses</option>
              {WEBSITE_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5" style={{ color: 'rgba(0,0,0,0.6)' }} />
          </div>

          <div className="relative inline-block">
            <select
              value={minRating}
              onChange={e => { setMinRating(e.target.value); setPage(1); }}
              className="bg-transparent text-[13px] pr-4 outline-none appearance-none cursor-pointer"
              style={{ color: 'var(--color-black)', colorScheme: 'light' }}
            >
              {MIN_RATING_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5" style={{ color: 'rgba(0,0,0,0.6)' }} />
          </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] overflow-hidden" style={{ background: 'var(--color-black)', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)' }}>
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelectLead={setSelectedLead}
        />

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <span className="text-[12px] font-mono tnum" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors duration-150 disabled:opacity-30"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors duration-150 disabled:opacity-30"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdated={handleLeadUpdated}
      />
    </motion.div>
  );
}
