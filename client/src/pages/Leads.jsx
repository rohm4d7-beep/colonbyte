import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import LeadsTable from '../components/LeadsTable';
import API_BASE from '../config';

function capitalize(s) {
  if (!s) return 'All';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);
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
  }, [country, status, search, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  const statusFilters = ['', 'new', 'contacted', 'converted'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Leads</h1>
          <p className="text-text-muted text-sm mt-0.5">{total} total leads</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--color-btn-secondary-bg)',
            border: '1px solid var(--color-btn-secondary-border)',
            color: 'var(--color-btn-secondary-text)',
          }}
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or keyword..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg px-3.5 py-2 text-sm w-64 transition"
          style={{
            background: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-input-text)',
          }}
        />

        <select
          value={country}
          onChange={e => { setCountry(e.target.value); setPage(1); }}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-input-text)',
          }}
        >
          <option value="">All Countries</option>
          <option value="UAE">UAE</option>
        </select>

        <div className="flex gap-2">
          {statusFilters.map(s => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border"
              style={{
                background: status === s ? 'var(--color-pill-active-bg)' : 'var(--color-pill-inactive-bg)',
                color: status === s ? 'var(--color-pill-active-text)' : 'var(--color-pill-inactive-text)',
                borderColor: status === s ? 'var(--color-pill-active-border)' : 'var(--color-pill-inactive-border)',
              }}
              onMouseEnter={e => {
                if (status !== s) {
                  e.currentTarget.style.background = 'var(--color-pill-hover-bg)';
                  e.currentTarget.style.color = 'var(--color-pill-hover-text)';
                }
              }}
              onMouseLeave={e => {
                if (status !== s) {
                  e.currentTarget.style.background = 'var(--color-pill-inactive-bg)';
                  e.currentTarget.style.color = 'var(--color-pill-inactive-text)';
                }
              }}
            >
              {capitalize(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-text-muted text-xs">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-elevated border border-border text-text-primary disabled:opacity-40 transition-colors hover:bg-border"
              >
                Previous
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-elevated border border-border text-text-primary disabled:opacity-40 transition-colors hover:bg-border"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
