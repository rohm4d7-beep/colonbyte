import { motion } from 'framer-motion';

export default function ProgressFeed({ progress }) {
  if (!progress) return null;

  const { found, processed, status } = progress;
  const pct = found > 0 ? Math.min(Math.round((processed / found) * 100), 100) : 0;
  const isDone = status === 'done';
  const isError = status === 'error';

  const statusLine = isError
    ? 'Scraping encountered an error'
    : isDone
    ? 'Complete!'
    : processed < found
    ? 'Extracting emails...'
    : 'Processing...';

  return (
    <div className="bg-elevated border border-border rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{statusLine}</span>
        <span className="text-text-primary font-medium">
          {processed}/{found} leads
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--color-accent)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {isDone && (
        <p className="text-success text-xs font-medium">Scraping completed successfully</p>
      )}
      {isError && (
        <p className="text-red-400 text-xs font-medium">Something went wrong. Check the server logs.</p>
      )}
    </div>
  );
}
