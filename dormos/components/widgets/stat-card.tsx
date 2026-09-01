'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { StatWidget } from '@/types/dashboard'
import { cn } from '@/lib/utils'

export const ACCENT_STYLES: Record<StatWidget['accent'], string> = {
  blue: 'bg-accent text-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  cyan: 'bg-accent text-primary',
}

interface StatCardProps {
  stat: StatWidget
  index?: number
  className?: string
}

export function StatCard({ stat, index = 0, className }: StatCardProps) {
  const Icon = stat.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-gray-900">
            {stat.value}
          </p>
          <div
            className={cn(
              'mt-2 inline-flex items-center gap-0.5 text-xs font-semibold',
              stat.positive ? 'text-emerald-600' : 'text-rose-500',
            )}
          >
            {stat.positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {stat.change}
            <span className="ml-1 font-normal text-gray-400">vs last month</span>
          </div>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
            ACCENT_STYLES[stat.accent],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    </motion.div>
  )
}
