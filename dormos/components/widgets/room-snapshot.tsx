'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { DoorOpen, ArrowRight } from 'lucide-react'
import { ActivityCard } from '@/components/widgets/activity-card'
import { ROOM_SNAPSHOT } from '@/constants/dashboard'
import type { RoomStatus } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<RoomStatus, { dot: string; badge: string }> = {
  Occupied: { dot: 'bg-primary', badge: 'bg-accent text-primary' },
  Vacant: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600' },
  Cleaning: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600' },
  Maintenance: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-600' },
}

export function RoomSnapshot() {
  return (
    <ActivityCard
      title="Room Snapshot"
      subtitle="Live status · Floor 2"
      action={
        <Link
          href="/dashboard/rooms"
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          All rooms
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {ROOM_SNAPSHOT.map((room, index) => {
          const status = STATUS_STYLES[room.status]
          return (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              onClick={() => {}}
              className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-gray-200/70 bg-gray-50/60 p-2.5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <DoorOpen className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-gray-600" />
              <span className="text-xs font-semibold text-gray-900">{room.room}</span>
              <span className="flex items-center gap-1">
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[9px] font-semibold whitespace-nowrap',
                    status.badge,
                  )}
                >
                  {room.status}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
        {(Object.keys(STATUS_STYLES) as RoomStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_STYLES[status].dot)} />
            {status}
          </span>
        ))}
      </div>
    </ActivityCard>
  )
}
