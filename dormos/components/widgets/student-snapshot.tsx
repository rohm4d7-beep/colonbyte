'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ActivityCard } from '@/components/widgets/activity-card'
import { STUDENT_SNAPSHOT } from '@/constants/dashboard'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600',
  'Check-in Pending': 'bg-amber-50 text-amber-600',
  'Notice Served': 'bg-rose-50 text-rose-600',
}

const FEE_STYLES: Record<string, string> = {
  Paid: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Overdue: 'bg-rose-50 text-rose-600',
}

export function StudentSnapshot() {
  return (
    <ActivityCard
      title="Newest Admissions"
      subtitle="Recently admitted students"
      action={
        <Link
          href="/dashboard/students"
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          View students
          <ArrowRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex flex-col">
        {STUDENT_SNAPSHOT.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-0"
          >
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                student.color,
              )}
            >
              {student.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{student.name}</p>
              <p className="text-xs text-gray-400">{student.room}</p>
            </div>
            <span
              className={cn(
                'hidden rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:inline-block',
                STATUS_STYLES[student.status],
              )}
            >
              {student.status}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                FEE_STYLES[student.feeStatus],
              )}
            >
              {student.feeStatus}
            </span>
          </motion.div>
        ))}
      </div>
    </ActivityCard>
  )
}
