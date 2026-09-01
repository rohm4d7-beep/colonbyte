'use client'

import { motion } from 'framer-motion'
import { Clock3 } from 'lucide-react'
import { ActivityCard } from '@/components/widgets/activity-card'
import { UPCOMING_EVENTS } from '@/constants/dashboard'
import type { UpcomingEvent } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const SEVERITY_STYLES: Record<UpcomingEvent['severity'], string> = {
  danger: 'border-rose-200 bg-rose-50/80',
  warning: 'border-amber-200 bg-amber-50/80',
  info: 'border-primary/25 bg-accent/80',
  success: 'border-emerald-200 bg-emerald-50/80',
}

const SEVERITY_DOT: Record<UpcomingEvent['severity'], string> = {
  danger: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-primary',
  success: 'bg-emerald-500',
}

export function UpcomingEvents() {
  return (
    <ActivityCard title="Upcoming Events" subtitle="Things to watch out for">
      <div className="flex flex-col gap-2.5">
        {UPCOMING_EVENTS.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className={cn(
              'group flex items-center gap-3 rounded-xl border p-3 transition-all duration-150 hover:shadow-sm',
              SEVERITY_STYLES[event.severity],
            )}
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white/80 shadow-sm ring-1 ring-black/5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">
                {event.date.split(' ')[0]}
              </span>
              <span className="text-sm leading-none font-bold text-gray-900">
                {event.date.split(' ')[1]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-900">
                <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', SEVERITY_DOT[event.severity])} />
                {event.title}
              </p>
              <p className="truncate text-xs text-gray-500">{event.description}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-gray-500">
              <Clock3 className="h-3 w-3" />
              {event.time}
            </span>
          </motion.div>
        ))}
      </div>
    </ActivityCard>
  )
}
