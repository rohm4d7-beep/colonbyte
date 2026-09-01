'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  FileText,
  Banknote,
  FileWarning,
  CalendarClock,
  Clock3,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { INVOICE_STATUS_STYLES } from '@/components/finance/styles'
import {
  INVOICES,
  PAYMENTS,
  studentName,
  studentRoomNumber,
} from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Invoice } from '@/types/finance'

const helper = createColumnHelper<Invoice>()

const INVOICE_STATUSES = ['Draft', 'Issued', 'Partial', 'Paid', 'Overdue', 'Void']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function invoiceColumns(onOpen: (invoice: Invoice) => void): ColumnDef<Invoice, any>[] {
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
    helper.accessor('number', {
      header: 'Invoice',
      cell: ({ row }) => (
        <button
          onClick={(event) => {
            event.stopPropagation()
            onOpen(row.original)
          }}
          className="font-mono text-xs font-medium text-primary transition-colors hover:text-primary hover:underline"
        >
          {row.original.number}
        </button>
      ),
    }),
    helper.accessor('issueDate', {
      header: 'Issued',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.issueDate)}</span>
          <span className="text-xs text-gray-400">Due {formatDate(row.original.dueDate)}</span>
        </div>
      ),
    }),
    helper.accessor('billingPeriodMonths', {
      header: 'Period',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          <Layers className="h-3 w-3" />
          {row.original.billingPeriodMonths} mo
        </span>
      ),
    }),
    helper.accessor('total', {
      header: 'Total',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {formatPKR(row.original.total)}
          </span>
          <span className="text-xs text-gray-400">− {formatPKR(row.original.discounts)} disc</span>
        </div>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={INVOICE_STATUS_STYLES[row.original.status]} />,
    }),
    helper.accessor('createdBy', {
      header: 'Created By',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.createdBy}</span>,
    }),
    helper.display({
      id: 'open',
      header: '',
      enableSorting: false,
      cell: () => (
        <ChevronRight
          className="h-4 w-4 text-gray-300 transition-colors group-hover:text-primary"
          aria-hidden
        />
      ),
    }),
  ]
}

export function InvoicesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return INVOICES.filter((invoice) => {
      if (status !== 'all' && invoice.status !== status) return false
      if (!query) return true
      return (
        invoice.number.toLowerCase().includes(query) ||
        invoice.id.toLowerCase().includes(query) ||
        studentName(invoice.studentId).toLowerCase().includes(query)
      )
    })
  }, [search, status])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const paid = INVOICES.filter((i) => i.status === 'Paid')
    const collected = PAYMENTS.filter((p) => p.status === 'Completed').reduce(
      (s, p) => s + p.amount,
      0,
    )
    const outstanding = INVOICES.filter(
      (i) => i.status === 'Overdue' || i.status === 'Pending' || i.status === 'Partial',
    )
    const overdue = INVOICES.filter((i) => i.status === 'Overdue')
    const totalInvoiced = INVOICES.reduce((s, i) => s + i.total, 0)
    return [
      {
        id: 'invoiced',
        label: 'Total Invoiced',
        value: formatPKR(totalInvoiced),
        sub: `${INVOICES.length} invoices`,
        icon: FileText,
        accent: 'blue',
        trend: { value: '+13.4%', positive: true },
      },
      {
        id: 'collected',
        label: 'Collected',
        value: formatPKR(collected),
        sub: `${paid.length} paid in full`,
        icon: Banknote,
        accent: 'emerald',
      },
      {
        id: 'outstanding',
        label: 'Outstanding',
        value: formatPKR(outstanding.reduce((s, i) => s + i.total, 0)),
        sub: `${outstanding.length} invoices not settled`,
        icon: FileWarning,
        accent: 'amber',
      },
      {
        id: 'overdue',
        label: 'Overdue',
        value: String(overdue.length),
        sub: formatPKR(overdue.reduce((s, i) => s + i.total, 0)),
        icon: CalendarClock,
        accent: 'rose',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: String(INVOICES.filter((i) => i.status === 'Pending').length),
        sub: 'Awaiting payment window',
        icon: Clock3,
        accent: 'violet',
      },
      {
        id: 'avg',
        label: 'Avg Invoice',
        value: formatPKR(Math.round(totalInvoiced / Math.max(1, INVOICES.length))),
        sub: 'Across all billing cycles',
        icon: Layers,
        accent: 'cyan',
      },
    ]
  }, [])

  const exportData = filtered.map((inv) => ({
    number: inv.number,
    student: studentName(inv.studentId),
    room: studentRoomNumber(inv.studentId),
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    periodMonths: inv.billingPeriodMonths,
    subtotal: inv.items.reduce((s, item) => s + item.amount, 0),
    discounts: inv.discounts,
    taxes: inv.taxes,
    total: inv.total,
    status: inv.status,
  }))
  const csvColumns = [
    { key: 'number', label: 'Invoice' },
    { key: 'student', label: 'Student' },
    { key: 'room', label: 'Room' },
    { key: 'issueDate', label: 'Issued' },
    { key: 'dueDate', label: 'Due' },
    { key: 'periodMonths', label: 'Period (months)' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'discounts', label: 'Discount' },
    { key: 'taxes', label: 'Tax' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Invoices"
        description="Generate, view and reconcile fee invoices for residents."
        icon={FileText}
        crumbs={[{ label: 'Finance' }, { label: 'Invoices' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={invoiceColumns((invoice) =>
          router.push(`/dashboard/finance/invoices/${invoice.id}`),
        )}
        data={filtered}
        getRowId={(invoice) => invoice.id}
        onRowClick={(invoice) => router.push(`/dashboard/finance/invoices/${invoice.id}`)}
        stickyHeader
        showColumnToggle
        initialPageSize={12}
        initialColumnVisibility={{ createdBy: false }}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search invoice or student…"
              className="w-56"
            />
            <FilterSelect
              value={status}
              onValueChange={setStatus}
              placeholder="Status"
              options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={csvColumns}
            filename={`invoices-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No invoices found"
        emptyDescription="No invoices match the current filters. Try adjusting your search."
      />
    </div>
  )
}
