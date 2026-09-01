'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Users,
  ToggleRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { StatusBadge } from '@/components/shared/status'
import { ACTIVE_STYLE, INACTIVE_STYLE } from '@/components/finance/styles'
import { RECURRING_ITEMS } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { RecurringItem } from '@/types/finance'

const helper = createColumnHelper<RecurringItem>()

const FREQUENCIES = ['Monthly', 'Quarterly', 'Semester', 'Yearly']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recurringColumns(): ColumnDef<RecurringItem, any>[] {
  return [
    helper.accessor('name', {
      header: 'Item',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-400">
            {row.original.category === 'Income' ? 'Billed to students' : 'Operational cost'}
          </span>
        </div>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('frequency', {
      header: 'Frequency',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {row.original.frequency}
        </span>
      ),
    }),
    helper.accessor('nextBilling', {
      header: 'Next Billing',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.nextBilling)}</span>
          <span className="text-xs text-gray-400">{row.original.id}</span>
        </div>
      ),
    }),
    helper.accessor('students', {
      header: 'Students',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          {row.original.students}
        </span>
      ),
    }),
    helper.accessor('category', {
      header: 'Type',
      cell: ({ row }) => (
        <span
          className={
            row.original.category === 'Income'
              ? 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
              : 'inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700'
          }
        >
          {row.original.category === 'Income' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {row.original.category}
        </span>
      ),
    }),
    helper.accessor('active', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={row.original.active ? ACTIVE_STYLE : INACTIVE_STYLE} />,
    }),
  ]
}

export function RecurringBillingPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [frequency, setFrequency] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return RECURRING_ITEMS.filter((item) => {
      if (type !== 'all' && item.category !== type) return false
      if (frequency !== 'all' && item.frequency !== frequency) return false
      if (!query) return true
      return item.name.toLowerCase().includes(query)
    })
  }, [search, type, frequency])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const active = RECURRING_ITEMS.filter((i) => i.active)
    const monthlyIncome = active
      .filter((i) => i.category === 'Income')
      .reduce((s, i) => s + i.amount * (i.frequency === 'Monthly' ? 1 : i.frequency === 'Quarterly' ? 1 / 3 : 1 / 12), 0)
    const monthlyExpense = active
      .filter((i) => i.category === 'Expense')
      .reduce((s, i) => s + i.amount * (i.frequency === 'Monthly' ? 1 : i.frequency === 'Quarterly' ? 1 / 3 : 1 / 12), 0)
    const nextBilling = [...active].sort((a, b) => a.nextBilling.localeCompare(b.nextBilling))[0]
    const studentsCovered = active.reduce((s, i) => s + i.students, 0)
    return [
      {
        id: 'income',
        label: 'Recurring Income / mo',
        value: formatPKR(monthlyIncome),
        sub: `${active.filter((i) => i.category === 'Income').length} active items`,
        icon: TrendingUp,
        accent: 'emerald',
        trend: { value: '+5.3%', positive: true },
      },
      {
        id: 'expense',
        label: 'Recurring Expense / mo',
        value: formatPKR(monthlyExpense),
        sub: `${active.filter((i) => i.category === 'Expense').length} active items`,
        icon: TrendingDown,
        accent: 'rose',
      },
      {
        id: 'active',
        label: 'Active Items',
        value: String(active.length),
        sub: `${RECURRING_ITEMS.length - active.length} paused`,
        icon: ToggleRight,
        accent: 'blue',
      },
      {
        id: 'next',
        label: 'Next Billing',
        value: nextBilling?.name ?? '—',
        sub: nextBilling ? formatDate(nextBilling.nextBilling) : undefined,
        icon: CalendarClock,
        accent: 'amber',
      },
      {
        id: 'students',
        label: 'Students Covered',
        value: String(studentsCovered),
        sub: 'Across active items',
        icon: Users,
        accent: 'cyan',
      },
    ]
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Recurring Billing"
        description="Automate recurring charges for rent, mess, laundry and utilities."
        icon={RefreshCcw}
        crumbs={[{ label: 'Finance' }, { label: 'Recurring' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={recurringColumns()}
        data={filtered}
        getRowId={(item) => item.id}
        stickyHeader
        showColumnToggle
        initialPageSize={8}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search billing item…"
              className="w-56"
            />
            <FilterSelect
              value={type}
              onValueChange={setType}
              placeholder="Type"
              options={[
                { value: 'Income', label: 'Income' },
                { value: 'Expense', label: 'Expense' },
              ]}
            />
            <FilterSelect
              value={frequency}
              onValueChange={setFrequency}
              placeholder="Frequency"
              options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
            />
          </>
        }
        emptyTitle="No recurring items found"
        emptyDescription="No recurring items match the current filters."
      />
    </div>
  )
}
