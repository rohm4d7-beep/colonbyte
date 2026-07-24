import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import ScrapeModal from '../components/ScrapeModal';
import StatusBadge from '../components/StatusBadge';
import API_BASE from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, emails: 0, contacted: 0, converted: 0 });
  const [recent, setRecent] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchStats = async () => {
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch(`${API_BASE}/api/leads/stats`),
        fetch(`${API_BASE}/api/leads?limit=10`),
      ]);
      const statsData = await statsRes.json();
      const leadsData = await leadsRes.json();
      setStats(statsData);
      setRecent(leadsData.leads || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Delete all leads? This cannot be undone.')) return;
    setResetting(true);
    try {
      await fetch(`${API_BASE}/api/leads`, { method: 'DELETE' });
      await fetchStats();
    } catch {
      // ignore
    } finally {
      setResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">Overview of your lead generation</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={resetting || stats.total === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
            onMouseEnter={e => {
              if (resetting || stats.total === 0) return;
              e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            {resetting ? 'Resetting...' : 'Reset'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-base)',
            }}
          >
            Start New Scrape
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <StatCard label="Total Leads" value={stats.total} />
        <StatCard label="Emails Found" value={stats.emails} />
        <StatCard label="Contacted" value={stats.contacted} />
        <StatCard label="Converted" value={stats.converted} />
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-5 transition-shadow">
        <h2 className="text-base font-semibold tracking-tight text-text-primary mb-4">
          Recent Leads
        </h2>
        {recent.length === 0 ? (
          <p className="text-text-muted text-sm py-8 text-center">
            No leads yet. Click "Start New Scrape" to begin.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map(lead => (
              <div key={lead._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text-primary font-medium">{lead.businessName}</p>
                  <p className="text-xs text-text-muted">{lead.email || 'No email'}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ScrapeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDone={fetchStats}
      />
    </motion.div>
  );
}
