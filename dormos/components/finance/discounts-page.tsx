'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Percent, Users, BadgePercent, HandCoins } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { ExportButton } from '@/components/shared/export-button'
import { StatusBadge } from '@/components/shared/status'
import { ACTIVE_STYLE, INACTIVE_STYLE } from '@/components/finance/styles'
import { DISCOUNTS, studentName, studentRoomNumber } from '@/lib/mock-data/finance'
import { formatDate, formatPKR } from '@/lib/format'
import type { Discount } from '@/types/finance'

const helper = createColumnHelper<Discount>()

const DISCOUNT_TYPES = ['Sibling Discount', 'Early Payment', 'Seasonal Discount', 'Manual Discount']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function discountColumns(): ColumnDef<Discount, any>[] {
  return [
    helper.accessor('name', {
      header: 'Discount',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-400">{row.original.reason}</span>
        </div>
      ),
    }),
    helper.accessor('studentId', {
      header: 'Applied To',
      cell: ({ row }) =>
        row.original.studentId ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {studentName(row.original.studentId)}
            </span>
            <span className="text-xs text-gray-400">
              Room {studentRoomNumber(row.original.studentId)}
            </span>
          </div>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            All students
          </span>
        ),
    }),
    helper.accessor('percentage', {
      header: 'Percentage',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{row.original.percentage}%</span>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-700">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('createdAt', {
      header: 'Created',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatDate(row.original.createdAt)}</span>
          <span className="text-xs text-gray-400">{row.original.id}</span>
        </div>
      ),
    }),
    helper.accessor('active', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={row.original.active ? ACTIVE_STYLE : INACTIVE_STYLE} />,
    }),
  ]
}

export function DiscountsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return DISCOUNTS.filter((discount) => {
      if (type !== 'all' && discount.name !== type) return false
      if (!query) return true
      return (
        discount.name.toLowerCase().includes(query) ||
        discount.reason.toLowerCase().includes(query) ||
        (discount.studentId ? studentName(discount.studentId).toLowerCase().includes(query) : false)
      )
    })
  }, [search, type])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const active = DISCOUNTS.filter((d) => d.active)
    const totalValue = DISCOUNTS.filter((d) => d.active).reduce((s, d) => s + d.amount, 0)
    const studentCount = new Set(DISCOUNTS.filter((d) => d.studentId).map((d) => d.studentId)).size
    const sibling = DISCOUNTS.filter((d) => d.name === 'Sibling Discount').length
    return [
      {
        id: 'active',
        label: 'Active Discounts',
        value: String(active.length),
        sub: `${DISCOUNTS.length - active.length} expired`,
        icon: BadgePercent,
        accent: 'emerald',
      },
      {
        id: 'value',
        label: 'Value Applied',
        value: formatPKR(totalValue),
        sub: 'On active discounts',
        icon: Percent,
        accent: 'blue',
        trend: { value: '+8.7%', positive: true },
      },
      {
        id: 'students',
        label: 'Students Covered',
        value: String(studentCount),
        sub: 'Individual recipients',
        icon: Users,
        accent: 'cyan',
      },
      {
        id: 'sibling',
        label: 'Sibling Discounts',
        value: String(sibling),
        sub: 'Family admissions',
        icon: HandCoins,
        accent: 'violet',
      },
    ]
  }, [])

  const exportData = filtered.map((d) => ({
    id: d.id,
    name: d.name,
    student: d.studentId ? studentName(d.studentId) : 'All students',
    percentage: `${d.percentage}%`,
    amount: d.amount,
    reason: d.reason,
    createdAt: d.createdAt,
    active: d.active ? 'Active' : 'Inactive',
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Discounts"
        description="Apply sibling, early-payment and seasonal discounts automatically."
        icon={Percent}
        crumbs={[{ label: 'Finance' }, { label: 'Discounts' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={discountColumns()}
        data={filtered}
        getRowId={(discount) => discount.id}
        stickyHeader
        showColumnToggle
        initialPageSize={10}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search discount or student…"
              className="w-56"
            />
            <FilterSelect
              value={type}
              onValueChange={setType}
              placeholder="Type"
              options={DISCOUNT_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </>
        }
        actions={
          <ExportButton
            data={exportData}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Discount' },
              { key: 'student', label: 'Applied To' },
              { key: 'percentage', label: 'Percentage' },
              { key: 'amount', label: 'Amount' },
              { key: 'reason', label: 'Reason' },
              { key: 'createdAt', label: 'Created' },
              { key: 'active', label: 'Status' },
            ]}
            filename={`discounts-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No discounts found"
        emptyDescription="No discounts match the current filters."
      />
    </div>
  )
}
