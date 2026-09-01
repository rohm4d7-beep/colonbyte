'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { GraduationCap, Users, CheckCircle2, Clock3, HandCoins } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { SCHOLARSHIP_STATUS_STYLES } from '@/components/finance/styles'
import {
  SCHOLARSHIPS,
  studentName,
  studentRoomNumber,
} from '@/lib/mock-data/finance'
import { formatDate } from '@/lib/format'
import type { Scholarship } from '@/types/finance'

const helper = createColumnHelper<Scholarship>()

const SCHOLARSHIP_STATUSES = ['Active', 'Pending', 'Approved', 'Rejected', 'Expired']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scholarshipColumns(): ColumnDef<Scholarship, any>[] {
  return [
    helper.display({
      id: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <AvatarInitials name={studentName(row.original.studentId)} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {studentName(row.original.studentId)}
            </p>
            <p className="text-xs text-gray-400">Room {studentRoomNumber(row.original.studentId)}</p>
          </div>
        </div>
      ),
    }),
    helper.accessor('percentage', {
      header: 'Scholarship',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{row.original.percentage}%</span>
          <span className="text-xs text-gray-400">{row.original.reason}</span>
        </div>
      ),
    }),
    helper.accessor('durationMonths', {
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.durationMonths} months</span>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={SCHOLARSHIP_STATUS_STYLES[row.original.status]} />,
    }),
    helper.accessor('appliedDate', {
      header: 'Applied',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.appliedDate)}</span>
          <span className="text-xs text-gray-400">{row.original.id}</span>
        </div>
      ),
    }),
    helper.accessor('approvedBy', {
      header: 'Approved By',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.approvedBy}</span>,
    }),
  ]
}

export function ScholarshipsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return SCHOLARSHIPS.filter((scholarship) => {
      if (status !== 'all' && scholarship.status !== status) return false
      if (!query) return true
      return (
        studentName(scholarship.studentId).toLowerCase().includes(query) ||
        scholarship.reason.toLowerCase().includes(query) ||
        scholarship.id.toLowerCase().includes(query)
      )
    })
  }, [search, status])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const active = SCHOLARSHIPS.filter((s) => s.status === 'Active')
    const approved = SCHOLARSHIPS.filter((s) => s.status === 'Approved')
    const pending = SCHOLARSHIPS.filter((s) => s.status === 'Pending')
    const estimatedValue = SCHOLARSHIPS.filter((s) => s.status !== 'Rejected').reduce(
      (sum, s) => sum + s.percentage * s.durationMonths,
      0,
    )
    return [
      {
        id: 'active',
        label: 'Active Scholarships',
        value: String(active.length),
        sub: `${approved.length} approved for next term`,
        icon: GraduationCap,
        accent: 'emerald',
        trend: { value: '+1', positive: true },
      },
      {
        id: 'students',
        label: 'Recipients',
        value: String(new Set(SCHOLARSHIPS.map((s) => s.studentId)).size),
        sub: 'Distinct students',
        icon: Users,
        accent: 'blue',
      },
      {
        id: 'pending',
        label: 'Pending Review',
        value: String(pending.length),
        sub: 'Awaiting approval',
        icon: Clock3,
        accent: 'amber',
      },
      {
        id: 'approved',
        label: 'Approved',
        value: String(approved.length),
        sub: 'Ready to apply',
        icon: CheckCircle2,
        accent: 'cyan',
      },
      {
        id: 'value',
        label: 'Est. Relief Given',
        value: `${estimatedValue}%·mo`,
        sub: 'Percentage × months',
        icon: HandCoins,
        accent: 'violet',
      },
    ]
  }, [])

  const exportData = filtered.map((s) => ({
    id: s.id,
    student: studentName(s.studentId),
    room: studentRoomNumber(s.studentId),
    percentage: `${s.percentage}%`,
    reason: s.reason,
    durationMonths: s.durationMonths,
    status: s.status,
    appliedDate: s.appliedDate,
    approvedBy: s.approvedBy,
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Scholarships"
        description="Award and manage merit and need-based scholarships for residents."
        icon={GraduationCap}
        crumbs={[{ label: 'Finance' }, { label: 'Scholarships' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={scholarshipColumns()}
        data={filtered}
        getRowId={(scholarship) => scholarship.id}
        stickyHeader
        showColumnToggle
        initialPageSize={10}
        initialColumnVisibility={{ approvedBy: false }}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search student or reason…"
              className="w-56"
            />
            <FilterSelect
              value={status}
              onValueChange={setStatus}
              placeholder="Status"
              options={SCHOLARSHIP_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'student', label: 'Student' },
              { key: 'room', label: 'Room' },
              { key: 'percentage', label: 'Percentage' },
              { key: 'reason', label: 'Reason' },
              { key: 'durationMonths', label: 'Duration (months)' },
              { key: 'status', label: 'Status' },
              { key: 'appliedDate', label: 'Applied' },
              { key: 'approvedBy', label: 'Approved By' },
            ]}
            filename={`scholarships-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No scholarships found"
        emptyDescription="No scholarships match the current filters."
      />
    </div>
  )
}
