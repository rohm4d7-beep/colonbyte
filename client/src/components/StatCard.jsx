import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-[12px] p-5 flex-1 min-w-[160px] transition-shadow"
    >
      <div className="text-text-muted text-sm font-medium mb-1.5">{label}</div>
      <div className="text-2xl font-semibold tracking-tight text-text-primary">
        {count.toLocaleString()}
      </div>
    </motion.div>
  );
}
