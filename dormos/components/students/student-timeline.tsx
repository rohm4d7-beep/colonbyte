'use client'

import {
  UserPlus,
  BedDouble,
  Banknote,
  MessageSquareWarning,
  Wrench,
  UtensilsCrossed,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import type { TimelineType } from '@/types/dorm'
import { studentTimeline } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { TIMELINE_TYPE_STYLES } from '@/components/shared/status'

const TIMELINE_ICONS: Record<TimelineType, LucideIcon> = {
  admitted: UserPlus,
  room_allocated: BedDouble,
  fee_received: Banknote,
  complaint: MessageSquareWarning,
  maintenance: Wrench,
  mess_plan: UtensilsCrossed,
  documents: FileText,
}

export function StudentTimeline({ studentId }: { studentId: string }) {
  const events = studentTimeline(studentId)

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/70 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
        No activity recorded for this student yet.
      </div>
    )
  }

  return (
    <ol className="relative ml-3 space-y-6 border-l border-gray-200">
      {events.map((event) => {
        const Icon = TIMELINE_ICONS[event.type]
        const style = TIMELINE_TYPE_STYLES[event.type]
        return (
          <li key={event.id} className="relative pl-8">
            <span
              className={`absolute top-0 -left-[25px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${style.className}`}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{event.title}</span>
              <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{event.description}</p>
            <p className="mt-1 text-xs font-medium text-gray-400">by {event.actor}</p>
          </li>
        )
      })}
    </ol>
  )
}
