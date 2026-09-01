'use client'

import { motion } from 'framer-motion'
import {
  CreditCard,
  UserCheck,
  BedDouble,
  Wrench,
  Handshake,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { ActivityCard } from '@/components/widgets/activity-card'
import { RECENT_ACTIVITY } from '@/constants/dashboard'
import type { ActivityItem } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<ActivityItem['type'], { icon: typeof CreditCard; classes: string }> = {
  payment: { icon: CreditCard, classes: 'bg-emerald-50 text-emerald-600' },
  checkin: { icon: UserCheck, classes: 'bg-accent text-primary' },
  room: { icon: BedDouble, classes: 'bg-violet-50 text-violet-600' },
  maintenance: { icon: Wrench, classes: 'bg-amber-50 text-amber-600' },
  visitor: { icon: Handshake, classes: 'bg-accent text-primary' },
  ai: { icon: Sparkles, classes: 'bg-purple-50 text-purple-600' },
}

export function RecentActivity() {
  return (
    <ActivityCard
      title="Recent Activity"
      subtitle="Latest events across your hostel"
      action={
        <button className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      }
    >
      <ol className="relative flex flex-col gap-4">
        {RECENT_ACTIVITY.map((activity, index) => {
          const config = TYPE_STYLES[activity.type]
          const Icon = config.icon
          const isLast = index === RECENT_ACTIVITY.length - 1
          return (
            <motion.li
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="relative flex gap-3"
            >
              {!isLast && (
                <span className="absolute top-8 left-4 h-[calc(100%-0.5rem)] w-px bg-gray-100" />
              )}
              <span
                className={cn(
                  'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                  config.classes,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <span className="shrink-0 text-[11px] text-gray-400">
                    {activity.time}
                  </span>
                </div>
                <p className="truncate text-xs text-gray-500">{activity.description}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </ActivityCard>
  )
}
