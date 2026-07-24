import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [light, setLight] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light';
  });

  useEffect(() => {
    const theme = light ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [light]);

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-full"
      style={{ background: 'var(--color-elevated)', border: '1px solid var(--color-border)' }}
    >
      {[
        { key: 'dark', label: 'Dark', Icon: MoonIcon, active: !light, onClick: () => setLight(false) },
        { key: 'light', label: 'Light', Icon: SunIcon, active: light, onClick: () => setLight(true) },
      ].map(({ key, label, Icon, active, onClick }) => (
        <button
          key={key}
          onClick={onClick}
          className="relative flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium"
          style={{ color: active ? 'var(--color-base)' : 'var(--color-text-muted)' }}
        >
          {active && (
            <motion.span
              layoutId="theme-toggle-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          )}
          <Icon className="relative w-3.5 h-3.5" strokeWidth={active ? 2 : 1.6} />
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  );
}
