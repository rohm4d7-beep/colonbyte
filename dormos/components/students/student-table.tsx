'use client'

import Link from 'next/link'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  FileText,
  Pencil,
  ArrowRightLeft,
  MoreHorizontal,
} from 'lucide-react'
import type { Student } from '@/types/dorm'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { StatusBadge, STUDENT_STATUS_STYLES, FEE_STATUS_STYLES } from '@/components/shared/status'
import { formatDate, formatPKR } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const helper = createColumnHelper<Student>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function studentColumns(onMove: (student: Student) => void): ColumnDef<Student, any>[] {
  return [
    helper.display({
      id: 'photo',
      header: 'Photo',
      cell: ({ row }) => (
        <AvatarInitials name={row.original.name} size="sm" className="ring-1 ring-gray-100" />
      ),
    }),
    helper.accessor('name', {
      header: 'Student Name',
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-gray-900">
            {row.original.name}
          </span>
          <span className="truncate text-xs text-gray-400">{row.original.email}</span>
        </div>
      ),
    }),
    helper.accessor('id', {
      header: 'Student ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">{row.original.id}</span>
      ),
    }),
    helper.accessor('university', {
      header: 'University',
      cell: ({ row }) => (
        <span className="block max-w-36 truncate text-sm text-gray-700">
          {row.original.university}
        </span>
      ),
    }),
    helper.accessor('department', {
      header: 'Department',
      cell: ({ row }) => (
        <span className="block max-w-32 truncate text-sm text-gray-700">
          {row.original.department}
        </span>
      ),
    }),
    helper.accessor('semester', {
      header: 'Semester',
      cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.semester}</span>,
    }),
    helper.accessor('roomId', {
      header: 'Room',
      cell: ({ row }) => {
        const roomId = row.original.roomId
        return roomId ? (
          <Link
            href={`/dashboard/rooms/${roomId}`}
            className="inline-flex rounded-md px-1.5 py-0.5 text-sm font-medium text-primary transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            {roomId}
          </Link>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )
      },
    }),
    helper.accessor('bedId', {
      header: 'Bed',
      cell: ({ row }) => {
        const bed = row.original.bedId
        return bed ? (
          <span className="font-mono text-xs text-gray-500">{bed.split('-').pop()}</span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )
      },
    }),
    helper.accessor('phone', {
      header: 'Phone',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.phone}</span>,
    }),
    helper.accessor('guardian', {
      header: 'Guardian',
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-gray-700">{row.original.guardian.name}</span>
          <span className="text-xs text-gray-400">{row.original.guardian.relation}</span>
        </div>
      ),
    }),
    helper.accessor('outstandingDues', {
      header: 'Outstanding Dues',
      cell: ({ row }) => {
        const dues = row.original.outstandingDues
        return (
          <span
            className={
              dues === 0
                ? 'text-sm font-medium text-emerald-600'
                : 'text-sm font-medium text-rose-500'
            }
          >
            {dues === 0 ? '—' : formatPKR(dues)}
          </span>
        )
      },
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge style={STUDENT_STATUS_STYLES[row.original.status]} />
      ),
    }),
    helper.accessor('feeStatus', {
      header: 'Fee Status',
      cell: ({ row }) => (
        <StatusBadge style={FEE_STATUS_STYLES[row.original.feeStatus]} />
      ),
    }),
    helper.accessor('admissionDate', {
      header: 'Admission Date',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-gray-600">
          {formatDate(row.original.admissionDate)}
        </span>
      ),
    }),
    helper.display({
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="truncate">{row.original.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}`} />}
              >
                <Eye />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/dashboard/students/${row.original.id}/edit`} />}
              >
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove(row.original)}>
                <ArrowRightLeft />
                Move room
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/dashboard/finance" />}
              >
                <FileText />
                Generate invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]
}
