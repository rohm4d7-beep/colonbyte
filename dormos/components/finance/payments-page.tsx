'use client'

import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'
import { CreditCard, Banknote, Clock3, XCircle, RotateCcw, CalendarRange, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PAYMENT_STATUS_STYLES } from '@/components/finance/styles'
import { PaymentDetailDrawer } from '@/components/finance/payment-detail-drawer'
import {
  PAYMENTS,
  PAYMENT_METHODS,
  studentName,
  studentRoomNumber,
} from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Payment } from '@/types/finance'

const helper = createColumnHelper<Payment>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function paymentColumns(onView: (payment: Payment) => void): ColumnDef<Payment, any>[] {
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
    helper.accessor('invoiceNo', {
      header: 'Invoice',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-primary">{row.original.invoiceNo}</span>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('method', {
      header: 'Method',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.method}</span>,
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={PAYMENT_STATUS_STYLES[row.original.status]} />,
    }),
    helper.accessor('paidDate', {
      header: 'Paid Date',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.paidDate)}</span>
          <span className="text-xs text-gray-400">Due {formatDate(row.original.dueDate)}</span>
        </div>
      ),
    }),
    helper.accessor('referenceNo', {
      header: 'Reference',
      cell: ({ row }) => <span className="font-mono text-xs text-gray-500">{row.original.referenceNo}</span>,
    }),
    helper.accessor('createdBy', {
      header: 'Created By',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.createdBy}</span>,
    }),
    helper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Payment actions" />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row.original)}>View details</DropdownMenuItem>
            <DropdownMenuItem>Print receipt</DropdownMenuItem>
            <DropdownMenuItem>Send reminder</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]
}

export function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return PAYMENTS.filter((payment) => {
      if (status !== 'all' && payment.status !== status) return false
      if (method !== 'all' && payment.method !== method) return false
      if (!query) return true
      return (
        payment.invoiceNo.toLowerCase().includes(query) ||
        payment.referenceNo.toLowerCase().includes(query) ||
        studentName(payment.studentId).toLowerCase().includes(query)
      )
    })
  }, [search, status, method])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const completed = PAYMENTS.filter((p) => p.status === 'Completed')
    const collected = completed.reduce((sum, p) => sum + p.amount, 0)
    const pending = PAYMENTS.filter((p) => p.status === 'Pending')
    const failed = PAYMENTS.filter((p) => p.status === 'Failed')
    const refunded = PAYMENTS.filter((p) => p.status === 'Refunded')
    const monthLabel = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })
    const thisMonth = completed.filter(
      (p) => p.paidDate.slice(0, 7) === new Date().toISOString().slice(0, 7),
    )
    return [
      {
        id: 'collected',
        label: 'Total Collected',
        value: formatPKR(collected),
        sub: `${completed.length} completed payments`,
        icon: Banknote,
        accent: 'emerald',
        trend: { value: '+11.2%', positive: true },
      },
      {
        id: 'month',
        label: 'This Month',
        value: formatPKR(thisMonth.reduce((s, p) => s + p.amount, 0)),
        sub: monthLabel,
        icon: CalendarRange,
        accent: 'blue',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: String(pending.length),
        sub: formatPKR(pending.reduce((s, p) => s + p.amount, 0)),
        icon: Clock3,
        accent: 'amber',
      },
      {
        id: 'failed',
        label: 'Failed',
        value: String(failed.length),
        sub: formatPKR(failed.reduce((s, p) => s + p.amount, 0)),
        icon: XCircle,
        accent: 'rose',
      },
      {
        id: 'refunded',
        label: 'Refunded',
        value: String(refunded.length),
        sub: formatPKR(refunded.reduce((s, p) => s + p.amount, 0)),
        icon: RotateCcw,
        accent: 'violet',
      },
      {
        id: 'avg',
        label: 'Avg Payment',
        value: formatPKR(Math.round(collected / Math.max(1, completed.length))),
        sub: 'Across all payments',
        icon: CreditCard,
        accent: 'cyan',
      },
    ]
  }, [])

  const exportData = filtered.map((p) => ({
    invoiceNo: p.invoiceNo,
    student: studentName(p.studentId),
    room: studentRoomNumber(p.studentId),
    amount: p.amount,
    method: p.method,
    status: p.status,
    paidDate: p.paidDate,
    dueDate: p.dueDate,
    reference: p.referenceNo,
    createdBy: p.createdBy,
  }))
  const csvColumns = [
    { key: 'invoiceNo', label: 'Invoice' },
    { key: 'student', label: 'Student' },
    { key: 'room', label: 'Room' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
    { key: 'paidDate', label: 'Paid Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'reference', label: 'Reference' },
    { key: 'createdBy', label: 'Created By' },
  ]

  const openPayment = (payment: Payment) => {
    setSelected(payment)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Payments"
        description="Record incoming fees, track collections and reconcile outstanding payments."
        icon={CreditCard}
        crumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={paymentColumns(openPayment)}
        data={filtered}
        getRowId={(payment) => payment.id}
        onRowClick={openPayment}
        stickyHeader
        showColumnToggle
        initialPageSize={12}
        initialColumnVisibility={{ referenceNo: false, createdBy: false }}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search invoice, reference or student…"
              className="w-56"
            />
            <FilterSelect
              value={status}
              onValueChange={setStatus}
              placeholder="Status"
              options={[
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Refunded', label: 'Refunded' },
              ]}
            />
            <FilterSelect
              value={method}
              onValueChange={setMethod}
              placeholder="Method"
              options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={csvColumns}
            filename={`payments-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No payments found"
        emptyDescription="No payments match the current filters. Try adjusting your search."
      />

      <PaymentDetailDrawer
        payment={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
