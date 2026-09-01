'use client'

import Link from 'next/link'
import { BadgeCheck, Building2, GraduationCap, MapPin, Mail, Phone, CalendarDays } from 'lucide-react'
import type { Student } from '@/types/dorm'
import { studentRoom, studentBed } from '@/lib/mock-data'
import { formatDateLong, formatPKR, initialsOf } from '@/lib/format'
import { avatarColor } from '@/components/shared/avatar-initials'
import { StatusBadge, STUDENT_STATUS_STYLES, FEE_STATUS_STYLES } from '@/components/shared/status'
import { cn } from '@/lib/utils'

export function StudentProfileCard({ student }: { student: Student }) {
  const room = studentRoom(student)
  const bed = studentBed(student)

  const details: { icon: React.ReactNode; label: string; value: string; href?: string }[] = [
    {
      icon: <Building2 className="h-4 w-4 text-gray-400" />,
      label: 'Room',
      value: room ? `Room ${room.id}` : 'Not allocated',
      href: room ? `/dashboard/rooms/${room.id}` : undefined,
    },
    {
      icon: <CalendarDays className="h-4 w-4 text-gray-400" />,
      label: 'Admitted',
      value: formatDateLong(student.admissionDate),
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-gray-400" />,
      label: 'Department',
      value: student.department,
    },
    {
      icon: <Phone className="h-4 w-4 text-gray-400" />,
      label: 'Phone',
      value: student.phone,
    },
    {
      icon: <Mail className="h-4 w-4 text-gray-400" />,
      label: 'Email',
      value: student.email,
    },
    {
      icon: <MapPin className="h-4 w-4 text-gray-400" />,
      label: 'Address',
      value: student.address,
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      <div className={cn('relative h-24 bg-gradient-to-r from-primary to-chart-2')} />
      <div className="px-5 pb-5">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ring-4 ring-white',
                avatarColor(student.name),
              )}
            >
              {initialsOf(student.name)}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-gray-500">
                {student.registrationNo} · {student.university}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <StatusBadge style={STUDENT_STATUS_STYLES[student.status]} />
            <StatusBadge style={FEE_STATUS_STYLES[student.feeStatus]} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                {detail.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">{detail.label}</p>
                {detail.href ? (
                  <Link
                    href={detail.href}
                    className="truncate text-sm font-medium text-primary hover:underline"
                  >
                    {detail.value}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium text-gray-700">{detail.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Monthly fee</p>
              <p className="text-sm font-semibold text-gray-900">{formatPKR(student.monthlyFee)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Outstanding dues</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  student.outstandingDues > 0 ? 'text-rose-600' : 'text-emerald-600',
                )}
              >
                {formatPKR(student.outstandingDues)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Bed</p>
              <p className="text-sm font-semibold text-gray-900">
                {bed ? `${room?.id} · Bed ${bed.label}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Mess plan</p>
              <p className="text-sm font-semibold text-gray-900">{student.messPlan}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
