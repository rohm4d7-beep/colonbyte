import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrapeComposer from '../components/ScrapeComposer';
import PipelineOverview from '../components/PipelineOverview';
import RecentActivity from '../components/RecentActivity';
import API_BASE from '../config';

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M12.5 4.5 12 13a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13l-.5-8.5" />
    </svg>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    emails: 0,
    contacted: 0,
    converted: 0,
    websiteMissing: 0,
    highPriority: 0,
  });
  const [recent, setRecent] = useState([]);
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto max-w-[1120px] px-7 py-8"
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-text">Dashboard</h1>
          <p className="text-text-2 text-[13px] mt-1">Overview of your lead generation</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting || stats.total === 0}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-text-3 hover:text-danger transition-colors duration-150 disabled:opacity-40 disabled:hover:text-text-3"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          {resetting ? 'Resetting…' : 'Reset all data'}
        </button>
      </div>

      <div className="mb-5">
        <ScrapeComposer onDone={fetchStats} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Link
          to="/leads?websiteStatus=none"
          className="relative rounded-[28px] p-6 overflow-hidden block transition-transform duration-150 hover:scale-[0.99]"
          style={{ background: 'var(--color-accent-2)', color: 'var(--color-black)' }}
        >
          <ArrowIcon className="absolute top-6 right-6 w-4 h-4 opacity-60" />
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mb-3">Website Missing</div>
          <div className="text-[64px] leading-[0.9] font-bold tracking-tight tnum">{stats.websiteMissing}</div>
        </Link>
        <Link
          to="/leads?highPriority=true"
          className="relative rounded-[28px] p-6 overflow-hidden block transition-transform duration-150 hover:scale-[0.99]"
          style={{ background: 'var(--color-accent-3)', color: 'var(--color-on-accent-3)' }}
        >
          <ArrowIcon className="absolute top-6 right-6 w-4 h-4 opacity-60" />
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mb-3">High Priority Leads</div>
          <div className="text-[64px] leading-[0.9] font-bold tracking-tight tnum">{stats.highPriority}</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-5 items-stretch">
        <PipelineOverview stats={stats} />
        <RecentActivity leads={recent} />
      </div>
    </motion.div>
  );
}
