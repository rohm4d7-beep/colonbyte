'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { ArrowRightLeft, TrendingUp, TrendingDown, RotateCcw, SlidersHorizontal, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { TRANSACTION_TYPE_STYLES } from '@/components/finance/styles'
import { TRANSACTIONS } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types/finance'

const helper = createColumnHelper<Transaction>()

const TXN_TYPES = ['Income', 'Expense', 'Refund', 'Adjustment', 'Transfer']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transactionColumns(): ColumnDef<Transaction, any>[] {
  return [
    helper.accessor('id', {
      header: 'Transaction',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-primary">{row.original.id}</span>
      ),
    }),
    helper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => <StatusBadge style={TRANSACTION_TYPE_STYLES[row.original.type]} />,
    }),
    helper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-64 text-sm text-gray-700">{row.original.description}</span>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => {
        const isInflow = row.original.type === 'Income' || row.original.type === 'Transfer'
        return (
          <span
            className={cn(
              'text-sm font-semibold',
              isInflow ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            {isInflow ? '+' : '−'} {formatPKR(row.original.amount)}
          </span>
        )
      },
    }),
    helper.accessor('date', {
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.date)}</span>
          <span className="text-xs text-gray-400">{row.original.reference}</span>
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
    helper.accessor('balance', {
      header: 'Balance',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-gray-700">
          {formatPKR(row.original.balance)}
        </span>
      ),
    }),
  ]
}

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return TRANSACTIONS.filter((txn) => {
      if (type !== 'all' && txn.type !== type) return false
      if (!query) return true
      return (
        txn.id.toLowerCase().includes(query) ||
        txn.description.toLowerCase().includes(query) ||
        txn.reference.toLowerCase().includes(query) ||
        txn.category.toLowerCase().includes(query)
      )
    })
  }, [search, type])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const income = TRANSACTIONS.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0)
    const expense = TRANSACTIONS.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
    const refunds = TRANSACTIONS.filter((t) => t.type === 'Refund').reduce((s, t) => s + t.amount, 0)
    const balance = TRANSACTIONS[TRANSACTIONS.length - 1]?.balance ?? 0
    const adjustments = TRANSACTIONS.filter((t) => t.type === 'Adjustment').length
    return [
      {
        id: 'balance',
        label: 'Closing Balance',
        value: formatPKR(balance),
        sub: 'Across all accounts',
        icon: Wallet,
        accent: 'blue',
      },
      {
        id: 'income',
        label: 'Total Income',
        value: formatPKR(income),
        sub: `${TRANSACTIONS.filter((t) => t.type === 'Income').length} entries`,
        icon: TrendingUp,
        accent: 'emerald',
        trend: { value: '+11.2%', positive: true },
      },
      {
        id: 'expense',
        label: 'Total Expense',
        value: formatPKR(expense),
        sub: `${TRANSACTIONS.filter((t) => t.type === 'Expense').length} entries`,
        icon: TrendingDown,
        accent: 'rose',
      },
      {
        id: 'refunds',
        label: 'Refunds',
        value: formatPKR(refunds),
        sub: `${TRANSACTIONS.filter((t) => t.type === 'Refund').length} refunds`,
        icon: RotateCcw,
        accent: 'amber',
      },
      {
        id: 'adjustments',
        label: 'Adjustments',
        value: String(adjustments),
        sub: 'Manual corrections',
        icon: SlidersHorizontal,
        accent: 'violet',
      },
    ]
  }, [])

  const exportData = filtered.map((t) => ({
    id: t.id,
    type: t.type,
    description: t.description,
    amount: t.amount,
    date: t.date,
    category: t.category,
    reference: t.reference,
    balance: t.balance,
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Transactions"
        description="Full ledger of income, expenses, refunds, adjustments and transfers."
        icon={ArrowRightLeft}
        crumbs={[{ label: 'Finance' }, { label: 'Transactions' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={transactionColumns()}
        data={filtered}
        getRowId={(txn) => txn.id}
        stickyHeader
        showColumnToggle
        initialPageSize={12}
        initialColumnVisibility={{ category: false }}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search transaction or reference…"
              className="w-56"
            />
            <FilterSelect
              value={type}
              onValueChange={setType}
              placeholder="Type"
              options={TXN_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={[
              { key: 'id', label: 'Transaction ID' },
              { key: 'type', label: 'Type' },
              { key: 'description', label: 'Description' },
              { key: 'amount', label: 'Amount' },
              { key: 'date', label: 'Date' },
              { key: 'category', label: 'Category' },
              { key: 'reference', label: 'Reference' },
              { key: 'balance', label: 'Balance' },
            ]}
            filename={`transactions-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No transactions found"
        emptyDescription="No transactions match the current filters."
      />
    </div>
  )
}
