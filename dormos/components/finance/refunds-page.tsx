'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Undo2, RotateCcw, Clock3, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { REFUND_STATUS_STYLES } from '@/components/finance/styles'
import { REFUNDS, studentName, studentRoomNumber } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Refund } from '@/types/finance'

const helper = createColumnHelper<Refund>()

const REFUND_STATUSES = ['Requested', 'Approved', 'Processed', 'Rejected']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function refundColumns(): ColumnDef<Refund, any>[] {
  return [
    helper.accessor('id', {
      header: 'Refund',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-primary">{row.original.id}</span>
      ),
    }),
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
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('reason', {
      header: 'Reason',
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-52 text-xs text-gray-500">{row.original.reason}</span>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={REFUND_STATUS_STYLES[row.original.status]} />,
    }),
    helper.accessor('requestedDate', {
      header: 'Requested',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.requestedDate)}</span>
          <span className="text-xs text-gray-400">{row.original.paymentId}</span>
        </div>
      ),
    }),
    helper.accessor('processedDate', {
      header: 'Processed',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">
            {row.original.processedDate === '—'
              ? '—'
              : formatDate(row.original.processedDate)}
          </span>
          <span className="text-xs text-gray-400">via {row.original.method}</span>
        </div>
      ),
    }),
  ]
}

export function RefundsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return REFUNDS.filter((refund) => {
      if (status !== 'all' && refund.status !== status) return false
      if (!query) return true
      return (
        refund.id.toLowerCase().includes(query) ||
        refund.paymentId.toLowerCase().includes(query) ||
        studentName(refund.studentId).toLowerCase().includes(query)
      )
    })
  }, [search, status])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const total = REFUNDS.filter((r) => r.status !== 'Rejected').reduce((s, r) => s + r.amount, 0)
    const processed = REFUNDS.filter((r) => r.status === 'Processed')
    const approved = REFUNDS.filter((r) => r.status === 'Approved')
    const requested = REFUNDS.filter((r) => r.status === 'Requested')
    const rejected = REFUNDS.filter((r) => r.status === 'Rejected')
    return [
      {
        id: 'total',
        label: 'Total Refunded',
        value: formatPKR(total),
        sub: `${processed.length} processed`,
        icon: RotateCcw,
        accent: 'rose',
        trend: { value: '-2.3%', positive: true },
      },
      {
        id: 'requested',
        label: 'Requested',
        value: String(requested.length),
        sub: formatPKR(requested.reduce((s, r) => s + r.amount, 0)),
        icon: Clock3,
        accent: 'amber',
      },
      {
        id: 'approved',
        label: 'Approved',
        value: String(approved.length),
        sub: 'Waiting to be paid out',
        icon: CheckCircle2,
        accent: 'blue',
      },
      {
        id: 'processed',
        label: 'Processed',
        value: String(processed.length),
        sub: formatPKR(processed.reduce((s, r) => s + r.amount, 0)),
        icon: Undo2,
        accent: 'emerald',
      },
      {
        id: 'rejected',
        label: 'Rejected',
        value: String(rejected.length),
        sub: formatPKR(rejected.reduce((s, r) => s + r.amount, 0)),
        icon: XCircle,
        accent: 'rose',
      },
    ]
  }, [])

  const exportData = filtered.map((r) => ({
    id: r.id,
    payment: r.paymentId,
    student: studentName(r.studentId),
    room: studentRoomNumber(r.studentId),
    amount: r.amount,
    reason: r.reason,
    status: r.status,
    requestedDate: r.requestedDate,
    processedDate: r.processedDate,
    method: r.method,
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Refunds"
        description="Review, approve and process payment refunds for residents."
        icon={Undo2}
        crumbs={[{ label: 'Finance' }, { label: 'Refunds' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={refundColumns()}
        data={filtered}
        getRowId={(refund) => refund.id}
        stickyHeader
        showColumnToggle
        initialPageSize={10}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search refund or student…"
              className="w-56"
            />
            <FilterSelect
              value={status}
              onValueChange={setStatus}
              placeholder="Status"
              options={REFUND_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={[
              { key: 'id', label: 'Refund ID' },
              { key: 'payment', label: 'Payment' },
              { key: 'student', label: 'Student' },
              { key: 'room', label: 'Room' },
              { key: 'amount', label: 'Amount' },
              { key: 'reason', label: 'Reason' },
              { key: 'status', label: 'Status' },
              { key: 'requestedDate', label: 'Requested' },
              { key: 'processedDate', label: 'Processed' },
              { key: 'method', label: 'Method' },
            ]}
            filename={`refunds-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No refunds found"
        emptyDescription="No refunds match the current filters."
      />
    </div>
  )
}
