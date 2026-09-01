'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { ANALYTICS_KPIS } from '@/lib/dashboard-data'
import { cn } from '@/lib/utils'

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 28 - ((value - min) / range) * 24 - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'var(--color-chart-2)' : 'var(--color-chart-5)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AnalyticsOverview() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {ANALYTICS_KPIS.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
          className="group rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="truncate text-xs font-medium text-gray-500">{kpi.label}</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {kpi.value}
            </span>
            <span
              className={cn(
                'flex items-center gap-0.5',
                kpi.positive ? 'text-emerald-600' : 'text-rose-500',
              )}
            >
              {kpi.positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">{kpi.detail}</p>
          <div className="mt-2">
            <Sparkline data={kpi.spark} positive={kpi.positive} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
