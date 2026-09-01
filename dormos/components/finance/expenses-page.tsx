'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  Receipt,
  Banknote,
  CheckCircle2,
  Clock3,
  FileCheck,
  XCircle,
  TrendingDown,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { EXPENSE_STATUS_STYLES } from '@/components/finance/styles'
import { EXPENSES, EXPENSE_CATEGORIES } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Expense } from '@/types/finance'

const helper = createColumnHelper<Expense>()

const EXPENSE_STATUSES = ['Paid', 'Pending', 'Approved', 'Rejected']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expenseColumns(): ColumnDef<Expense, any>[] {
  return [
    helper.accessor('id', {
      header: 'Expense',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-primary">{row.original.id}</span>
      ),
    }),
    helper.accessor('vendor', {
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.vendor}</span>
          <span className="text-xs text-gray-400">{row.original.category}</span>
        </div>
      ),
    }),
    helper.accessor('category', {
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {row.original.category}
        </span>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('paymentDate', {
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.paymentDate)}</span>
          <span className="text-xs text-gray-400">{row.original.receiptNo}</span>
        </div>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={EXPENSE_STATUS_STYLES[row.original.status]} />,
    }),
    helper.accessor('createdBy', {
      header: 'Created By',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.createdBy}</span>,
    }),
  ]
}

export function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return EXPENSES.filter((expense) => {
      if (status !== 'all' && expense.status !== status) return false
      if (category !== 'all' && expense.category !== category) return false
      if (!query) return true
      return (
        expense.vendor.toLowerCase().includes(query) ||
        expense.id.toLowerCase().includes(query) ||
        expense.receiptNo.toLowerCase().includes(query)
      )
    })
  }, [search, status, category])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const settled = EXPENSES.filter((e) => e.status !== 'Rejected')
    const total = settled.reduce((s, e) => s + e.amount, 0)
    const paid = EXPENSES.filter((e) => e.status === 'Paid')
    const pending = EXPENSES.filter((e) => e.status === 'Pending')
    const approved = EXPENSES.filter((e) => e.status === 'Approved')
    const rejected = EXPENSES.filter((e) => e.status === 'Rejected')
    const byCat = EXPENSES.filter((e) => e.status !== 'Rejected').reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount
        return acc
      },
      {} as Record<string, number>,
    )
    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
    return [
      {
        id: 'total',
        label: 'Total Spent',
        value: formatPKR(total),
        sub: `${settled.length} entries`,
        icon: Banknote,
        accent: 'rose',
        trend: { value: '-4.1%', positive: true },
      },
      {
        id: 'paid',
        label: 'Paid',
        value: formatPKR(paid.reduce((s, e) => s + e.amount, 0)),
        sub: `${paid.length} payments released`,
        icon: CheckCircle2,
        accent: 'emerald',
      },
      {
        id: 'pending',
        label: 'Pending',
        value: formatPKR(pending.reduce((s, e) => s + e.amount, 0)),
        sub: `${pending.length} awaiting confirmation`,
        icon: Clock3,
        accent: 'amber',
      },
      {
        id: 'approved',
        label: 'Approved',
        value: formatPKR(approved.reduce((s, e) => s + e.amount, 0)),
        sub: `${approved.length} in approval queue`,
        icon: FileCheck,
        accent: 'blue',
      },
      {
        id: 'rejected',
        label: 'Rejected',
        value: formatPKR(rejected.reduce((s, e) => s + e.amount, 0)),
        sub: `${rejected.length} entries declined`,
        icon: XCircle,
        accent: 'rose',
      },
      {
        id: 'top-category',
        label: 'Top Category',
        value: top?.[0] ?? '—',
        sub: top ? formatPKR(top[1]) : undefined,
        icon: TrendingDown,
        accent: 'violet',
      },
    ]
  }, [])

  const exportData = filtered.map((e) => ({
    id: e.id,
    vendor: e.vendor,
    category: e.category,
    amount: e.amount,
    date: e.paymentDate,
    status: e.status,
    receipt: e.receiptNo,
    createdBy: e.createdBy,
  }))
  const csvColumns = [
    { key: 'id', label: 'Expense ID' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'createdBy', label: 'Created By' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Expenses"
        description="Track operational costs, approve payments and keep spending in check."
        icon={Receipt}
        crumbs={[{ label: 'Finance' }, { label: 'Expenses' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={expenseColumns()}
        data={filtered}
        getRowId={(expense) => expense.id}
        stickyHeader
        showColumnToggle
        initialPageSize={12}
        initialColumnVisibility={{ createdBy: false }}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search vendor or receipt…"
              className="w-56"
            />
            <FilterSelect
              value={status}
              onValueChange={setStatus}
              placeholder="Status"
              options={EXPENSE_STATUSES.map((s) => ({ value: s, label: s }))}
            />
            <FilterSelect
              value={category}
              onValueChange={setCategory}
              placeholder="Category"
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={csvColumns}
            filename={`expenses-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No expenses found"
        emptyDescription="No expenses match the current filters. Try adjusting your search."
      />
    </div>
  )
}
