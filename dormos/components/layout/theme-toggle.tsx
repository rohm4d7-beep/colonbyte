'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border border-border bg-muted p-1',
        'transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
        className,
      )}
    >
      <Sun className="pointer-events-none absolute left-[7px] h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
      <Moon className="pointer-events-none absolute right-[7px] h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
      <motion.span
        layout
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
      >
        {isDark ? <Moon className="h-3.5 w-3.5" strokeWidth={2} /> : <Sun className="h-3.5 w-3.5" strokeWidth={2} />}
      </motion.span>
    </button>
  )
}
