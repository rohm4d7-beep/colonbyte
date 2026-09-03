import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import API_BASE from '../config';
import { COUNTRIES } from '../constants/countries';

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <circle cx="8.7" cy="8.7" r="5.7" />
      <path d="M16.5 16.5 13 13" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" opacity="0.2" />
      <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 2.5 18 16.5H2z" />
      <path d="M10 8v3.2M10 13.8h.01" />
    </svg>
  );
}

const fade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.16, ease: 'easeOut' },
};

function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 10 6" fill="none" {...props}>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const filtered = query.trim()
    ? COUNTRIES.filter(c => c.toLowerCase().includes(query.trim().toLowerCase()))
    : COUNTRIES;

  const select = (c) => {
    onChange(c);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative inline-block shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 bg-transparent text-[13px] text-text-2 outline-none cursor-pointer max-w-[130px]"
      >
        <span className="truncate">{value || 'Target country'}</span>
        <ChevronIcon className="shrink-0 w-2.5 h-2.5 text-text-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...fade}
            className="absolute right-0 top-[calc(100%+6px)] z-10 w-56 rounded-md border shadow-lg overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}
          >
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && filtered.length > 0) select(filtered[0]);
              }}
              placeholder="Search countries…"
              className="w-full px-3 py-2 text-[13px] text-text bg-transparent outline-none border-b placeholder:text-text-3"
              style={{ borderColor: 'var(--color-border)' }}
            />
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-[12.5px] text-text-3">No matches</p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => select(c)}
                    className="block w-full text-left px-3 py-1.5 text-[13px] truncate hover:brightness-110 transition-colors duration-100"
                    style={{
                      color: c === value ? 'var(--color-accent)' : 'var(--color-text)',
                      background: c === value ? 'var(--color-accent-soft, transparent)' : 'transparent',
                    }}
                  >
                    {c}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ScrapeComposer({ onDone }) {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const evtSource = useRef(null);

  useEffect(() => () => {
    if (evtSource.current) evtSource.current.close();
  }, []);

  const reset = () => {
    setKeyword('');
    setJobId(null);
    setProgress(null);
    setLoading(false);
    setError(null);
  };

  const canStart = keyword.trim() && country;

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/scrape/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), country }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status}). Check server is running.`);
      }

      const data = await res.json();
      setJobId(data.jobId);

      const es = new EventSource(`${API_BASE}/api/scrape/progress/${data.jobId}`);
      evtSource.current = es;

      es.onmessage = e => {
        const payload = JSON.parse(e.data);
        setProgress(payload);
        if (payload.status === 'done' || payload.status === 'error') {
          es.close();
          evtSource.current = null;
          setLoading(false);
          if (payload.status === 'done') {
            setTimeout(() => {
              onDone();
              reset();
            }, 1500);
          }
        }
      };

      es.onerror = () => {
        es.close();
        evtSource.current = null;
        setLoading(false);
        setError('Lost connection to server. Please try again.');
      };
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to start scraping. Is the server running?');
    }
  };

  const isDone = progress?.status === 'done';
  const isServerError = progress?.status === 'error';
  const isError = !!error || isServerError;
  const isRunning = !!jobId && !isDone && !isError;

  const found = progress?.found || 0;
  const processed = progress?.processed || 0;
  const rejected = progress?.rejected || 0;
  const duplicates = progress?.duplicates || 0;
  const saved = progress?.saved || 0;
  const hasWebsite = progress?.hasWebsite || 0;
  const unverified = progress?.unverified || 0;
  const noEmail = progress?.noEmail || 0;
  const pct = found > 0 ? Math.min(Math.round((processed / found) * 100), 100) : jobId ? 6 : 0;
  const statusLine = found === 0 ? 'Searching Google Maps for' : 'Verifying & extracting for';
  const errorMessage = error || 'Something went wrong. Check the server logs.';

  return (
    <div
      className="relative rounded-md border overflow-hidden transition-colors duration-200"
      style={{
        background: 'var(--color-surface)',
        borderColor: isError ? 'var(--color-danger)' : 'var(--color-border-strong)',
      }}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        <AnimatePresence mode="wait" initial={false}>
          {isError ? (
            <motion.div key="error" {...fade} className="flex items-center gap-3 flex-1 min-w-0">
              <AlertIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-danger)' }} />
              <p className="text-[13px] truncate" style={{ color: 'var(--color-danger)' }}>
                {errorMessage}
              </p>
              <button
                onClick={reset}
                className="ml-auto shrink-0 text-[12.5px] font-medium text-text-2 hover:text-text transition-colors duration-150"
              >
                Dismiss
              </button>
            </motion.div>
          ) : isDone ? (
            <motion.div key="done" {...fade} className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}
              >
                <CheckIcon className="w-3 h-3" />
              </span>
              <p className="text-[13px] text-text truncate">
                Captured <span className="font-mono font-medium tnum">{saved}</span> new lead{saved === 1 ? '' : 's'}
                {duplicates > 0 && (
                  <span className="text-text-2">
                    {' '}· <span className="font-mono tnum">{duplicates}</span> merged
                  </span>
                )}
                {hasWebsite > 0 && (
                  <span className="text-text-2">
                    {' '}· <span className="font-mono tnum">{hasWebsite}</span> already have a website
                  </span>
                )}
                {unverified > 0 && (
                  <span className="text-text-2">
                    {' '}· <span className="font-mono tnum">{unverified}</span> saved but couldn't verify site
                  </span>
                )}
                {noEmail > 0 && (
                  <span className="text-text-2">
                    {' '}· <span className="font-mono tnum">{noEmail}</span> skipped, no email found
                  </span>
                )}
                {rejected > 0 && (
                  <span className="text-text-2">
                    {' '}· <span className="font-mono tnum">{rejected}</span> rejected (wrong country)
                  </span>
                )}
              </p>
            </motion.div>
          ) : isRunning || loading ? (
            <motion.div key="running" {...fade} className="flex items-center gap-3 flex-1 min-w-0">
              <SpinnerIcon className="w-4 h-4 shrink-0 animate-spin" style={{ color: 'var(--color-accent)' }} />
              <p className="text-[13px] text-text-2 truncate">
                {loading && !jobId ? (
                  'Starting scrape…'
                ) : (
                  <>
                    {statusLine} <span className="text-text">"{keyword}"</span>
                    {hasWebsite > 0 && (
                      <span className="text-text-3"> · {hasWebsite} have a website</span>
                    )}
                    {unverified > 0 && (
                      <span className="text-text-3"> · {unverified} unverified</span>
                    )}
                    {noEmail > 0 && (
                      <span className="text-text-3"> · {noEmail} no email</span>
                    )}
                    {rejected > 0 && (
                      <span className="text-text-3"> · {rejected} rejected</span>
                    )}
                  </>
                )}
              </p>
              {jobId && (
                <span className="ml-auto shrink-0 font-mono text-[13px] text-text tnum">
                  {processed}
                  <span className="text-text-3">/{found}</span>
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div key="idle" {...fade} className="flex items-center gap-3 flex-1 min-w-0">
              <SearchIcon className="w-4 h-4 shrink-0 text-text-3" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleStart(); }}
                placeholder="Business category — try “dentists” or “boutique hotels” (pick the country on the right)"
                className="flex-1 min-w-0 bg-transparent text-[13.5px] text-text placeholder:text-text-3 outline-none"
              />
              <div className="w-px h-4 shrink-0" style={{ background: 'var(--color-border)' }} />
              <CountryPicker value={country} onChange={setCountry} />
              <button
                onClick={handleStart}
                disabled={!canStart}
                className="shrink-0 h-8 px-3.5 rounded text-[13px] font-medium transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
                style={{ background: 'var(--color-accent)', color: '#ffffff' }}
              >
                Start Scraping
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-full" style={{ background: isRunning ? 'var(--color-border)' : 'transparent' }}>
        {isRunning && (
          <motion.div
            className="h-full"
            style={{ background: 'var(--color-accent)' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  );
}
