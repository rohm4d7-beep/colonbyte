import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.5 10.7A7.3 7.3 0 0 1 9.3 2.5a7.3 7.3 0 1 0 8.2 8.2z" />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.5v1.8M10 15.7v1.8M4.1 4.1l1.3 1.3M14.6 14.6l1.3 1.3M2.5 10h1.8M15.7 10h1.8M4.1 15.9l1.3-1.3M14.6 5.4l1.3-1.3" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [light, setLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    const theme = light ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [light]);

  return (
    <button
      onClick={() => setLight(v => !v)}
      aria-label="Toggle theme"
      className="relative w-7 h-7 flex items-center justify-center rounded-md text-text-2 hover:text-text hover:bg-surface-2 transition-colors duration-150"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={light ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex"
        >
          {light ? <SunIcon className="w-[15px] h-[15px]" /> : <MoonIcon className="w-[15px] h-[15px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
