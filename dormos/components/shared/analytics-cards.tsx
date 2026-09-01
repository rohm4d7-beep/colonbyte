'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCENT_STYLES } from '@/components/widgets/stat-card'

export type AnalyticsItem = {
  id: string
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  accent: keyof typeof ACCENT_STYLES
  trend?: { value: string; positive: boolean }
}

export function AnalyticsCards({
  items,
  className,
}: {
  items: AnalyticsItem[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6',
        className,
      )}
    >
      {items.map((item, index) => (
        <AnalyticsCard key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}

export function AnalyticsCard({
  item,
  index = 0,
  className,
}: {
  item: AnalyticsItem
  index?: number
  className?: string
}) {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
            ACCENT_STYLES[item.accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        {item.trend && (
          <span
            className={cn(
              'text-xs font-semibold',
              item.trend.positive ? 'text-emerald-600' : 'text-rose-500',
            )}
          >
            {item.trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 truncate text-xs font-medium text-gray-500">{item.label}</p>
      <p className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900">
        {item.value}
      </p>
      {item.sub && <p className="mt-0.5 truncate text-xs text-gray-400">{item.sub}</p>}
    </motion.div>
  )
}
