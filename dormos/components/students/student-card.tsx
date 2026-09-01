'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { DoorOpen, BedDouble, Building2, CalendarDays, Wallet } from 'lucide-react'
import type { Student } from '@/types/dorm'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { StatusBadge, STUDENT_STATUS_STYLES, FEE_STATUS_STYLES } from '@/components/shared/status'
import { formatPKR } from '@/lib/format'

interface StudentCardProps {
  student: Student
  index?: number
}

export function StudentCard({ student, index = 0 }: StudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index % 12) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <AvatarInitials name={student.name} size="lg" />
        <StatusBadge style={STUDENT_STATUS_STYLES[student.status]} />
      </div>

      <h3 className="mt-3 truncate text-sm font-semibold text-gray-900">{student.name}</h3>
      <p className="font-mono text-xs text-gray-400">{student.id}</p>

      <div className="mt-3 flex flex-col gap-1.5 text-xs text-gray-600">
        <span className="flex items-center gap-1.5 truncate">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {student.university}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {student.department} · {student.semester}
        </span>
        <span className="flex items-center gap-1.5">
          <DoorOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          {student.roomId ? `Room ${student.roomId}` : 'Not allocated'}
          {student.bedId && (
            <>
              <span className="text-gray-300">·</span>
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              Bed {student.bedId.split('-').pop()}
            </>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Wallet className="h-3.5 w-3.5 text-gray-400" />
          <span className={student.outstandingDues === 0 ? 'text-emerald-600' : 'text-rose-500'}>
            {student.outstandingDues === 0
              ? 'No dues'
              : formatPKR(student.outstandingDues)}
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <StatusBadge style={FEE_STATUS_STYLES[student.feeStatus]} showDot={false} />
          <Link
            href={`/dashboard/students/${student.id}`}
            aria-label={`View ${student.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-accent hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <span className="text-xs font-medium">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
