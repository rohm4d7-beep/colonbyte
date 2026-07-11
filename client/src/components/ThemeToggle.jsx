import { useEffect, useState } from 'react';

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
    <button
      onClick={() => setLight(l => !l)}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
    >
      <span className="text-base">{light ? '🌙' : '☀️'}</span>
      <span>{light ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}
