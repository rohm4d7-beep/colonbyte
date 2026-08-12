import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import LeadsTable from '../components/LeadsTable';
import LeadDetailDrawer from '../components/LeadDetailDrawer';
import { WEBSITE_STATUS_META } from '../components/WebsiteStatusBadge';
import API_BASE from '../config';

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

function capitalize(s) {
  if (!s) return 'All';
  return s.charAt(0).toUpperCase() + s.slice(1);
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

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [country, setCountry] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState('');
  const [minRating, setMinRating] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (websiteStatus) params.set('websiteStatus', websiteStatus);
    if (minRating) params.set('minRating', minRating);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', page);
    params.set('limit', 20);

    try {
      const res = await fetch(`${API_BASE}/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      // ignore
    }
  }, [country, websiteStatus, minRating, status, search, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetch(`${API_BASE}/api/leads/countries`)
      .then(res => res.json())
      .then(data => setCountries(data.countries || []))
      .catch(() => {});
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${API_BASE}/api/leads/${id}/status`, {
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
    try {
      await fetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
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

  const statusFilters = ['', 'new', 'contacted', 'converted'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto max-w-[1120px] px-6 py-8"
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-text">Leads</h1>
          <p className="text-text-2 text-[13px] mt-1">
            <span className="font-mono font-medium text-text tnum">{total}</span> total leads
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium text-text-2 hover:text-white hover:bg-[var(--color-accent)] transition-colors duration-150"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-5 mb-5">
        <div className="flex items-center gap-2 pb-1.5 border-b w-64" style={{ borderColor: 'var(--color-border-strong)' }}>
          <SearchIcon className="w-3.5 h-3.5 text-text-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or keyword…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-[13px] text-text placeholder:text-text-3 outline-none"
          />
        </div>

        <div className="relative inline-block">
          <select
            value={country}
            onChange={e => { setCountry(e.target.value); setPage(1); }}
            className="bg-transparent text-[13px] text-text-2 pr-4 outline-none appearance-none cursor-pointer"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-3" />
        </div>

        <div className="relative inline-block">
          <select
            value={websiteStatus}
            onChange={e => { setWebsiteStatus(e.target.value); setPage(1); }}
            className="bg-transparent text-[13px] text-text-2 pr-4 outline-none appearance-none cursor-pointer"
          >
            <option value="">All Website Statuses</option>
            {WEBSITE_STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-3" />
        </div>

        <div className="relative inline-block">
          <select
            value={minRating}
            onChange={e => { setMinRating(e.target.value); setPage(1); }}
            className="bg-transparent text-[13px] text-text-2 pr-4 outline-none appearance-none cursor-pointer"
          >
            {MIN_RATING_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-text-3" />
        </div>

        <div className="w-px h-4" style={{ background: 'var(--color-border)' }} />

        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
          {statusFilters.map(s => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className="relative px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors duration-150"
              style={{ color: status === s ? '#ffffff' : 'var(--color-text-2)' }}
            >
              {status === s && (
                <motion.span
                  layoutId="status-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                />
              )}
              <span className="relative">{capitalize(s)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onSelectLead={setSelectedLead}
        />

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-text-3 text-[12px] font-mono tnum">
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-text-2 hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-text-2 hover:text-text hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
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
