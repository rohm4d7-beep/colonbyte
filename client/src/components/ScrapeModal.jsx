import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressFeed from './ProgressFeed';
import API_BASE from '../config';

export default function ScrapeModal({ isOpen, onClose, onDone }) {
  const [keyword, setKeyword] = useState('');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const evtSource = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setKeyword('');
      setJobId(null);
      setProgress(null);
      setLoading(false);
      setError(null);
      if (evtSource.current) {
        evtSource.current.close();
        evtSource.current = null;
      }
    }
  }, [isOpen]);

  const handleStart = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);

    console.log('[ScrapeModal] Starting scrape for:', keyword.trim());

    try {
      const res = await fetch(`${API_BASE}/api/scrape/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      console.log('[ScrapeModal] POST response status:', res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status}). Check server is running.`);
      }

      const data = await res.json();
      console.log('[ScrapeModal] Received jobId:', data.jobId);

      setJobId(data.jobId);

      const es = new EventSource(`${API_BASE}/api/scrape/progress/${data.jobId}`);
      evtSource.current = es;

      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log('[ScrapeModal] SSE progress:', data);
        setProgress(data);
        if (data.status === 'done' || data.status === 'error') {
          es.close();
          evtSource.current = null;
          setLoading(false);
          if (data.status === 'done') {
            setTimeout(() => {
              onDone();
              onClose();
            }, 1500);
          }
        }
      };

      es.onerror = () => {
        console.log('[ScrapeModal] SSE connection error');
        es.close();
        evtSource.current = null;
        setLoading(false);
        setError('Lost connection to server. Please try again.');
      };
    } catch (err) {
      console.error('[ScrapeModal] Error:', err.message);
      setLoading(false);
      setError(err.message || 'Failed to start scraping. Is the server running?');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface border border-border rounded-lg p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold tracking-tight text-text-primary mb-1">
              New Scrape Job
            </h2>
            <p className="text-text-muted text-sm mb-5">
              Enter a keyword to search Google Maps for leads.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="e.g. restaurants in Dubai"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              disabled={loading || !!jobId}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-4 transition"
              style={{
                background: 'var(--color-input-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-input-text)',
              }}
            />

            {!jobId ? (
              <button
                onClick={handleStart}
                disabled={loading || !keyword.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: loading ? 'var(--color-btn-secondary-bg)' : 'var(--color-accent)',
                  color: loading ? 'var(--color-btn-secondary-text)' : 'var(--color-base)',
                }}
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Starting...' : 'Start Scraping'}
              </button>
            ) : (
              <ProgressFeed progress={progress} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
