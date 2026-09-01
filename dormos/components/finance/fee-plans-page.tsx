'use client'

import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { LayoutGrid, Tags, Users, CheckCircle2, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { StatusBadge } from '@/components/shared/status'
import { ACTIVE_STYLE, INACTIVE_STYLE } from '@/components/finance/styles'
import { FEE_PLANS } from '@/lib/mock-data/finance'
import { formatPKR } from '@/lib/format'
import type { FeePlan } from '@/types/finance'

const helper = createColumnHelper<FeePlan>()

const PLAN_TYPES = ['Standard', 'Premium', 'AC Room', 'Non AC', 'Semester', 'Monthly', 'Custom']
const BILLING_CYCLES = ['Monthly', 'Semester', 'Yearly']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function feePlanColumns(): ColumnDef<FeePlan, any>[] {
  return [
    helper.accessor('name', {
      header: 'Plan',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-400">{row.original.id}</span>
        </div>
      ),
    }),
    helper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
          {row.original.type}
        </span>
      ),
    }),
    helper.accessor('amount', {
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">{formatPKR(row.original.amount)}</span>
      ),
    }),
    helper.accessor('billingCycle', {
      header: 'Billing Cycle',
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {row.original.billingCycle}
        </span>
      ),
    }),
    helper.accessor('studentsEnrolled', {
      header: 'Enrolled',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          {row.original.studentsEnrolled} students
        </span>
      ),
    }),
    helper.accessor('active', {
      header: 'Status',
      cell: ({ row }) => <StatusBadge style={row.original.active ? ACTIVE_STYLE : INACTIVE_STYLE} />,
    }),
    helper.accessor('description', {
      header: 'Description',
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-56 text-xs text-gray-500">{row.original.description}</span>
      ),
    }),
  ]
}

export function FeePlansPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [cycle, setCycle] = useState('all')

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    return FEE_PLANS.filter((plan) => {
      if (type !== 'all' && plan.type !== type) return false
      if (cycle !== 'all' && plan.billingCycle !== cycle) return false
      if (!query) return true
      return (
        plan.name.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query)
      )
    })
  }, [search, type, cycle])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const active = FEE_PLANS.filter((p) => p.active)
    const enrolled = FEE_PLANS.reduce((s, p) => s + p.studentsEnrolled, 0)
    const avgMonthly = Math.round(
      FEE_PLANS.reduce((s, p) => s + p.amount, 0) / Math.max(1, FEE_PLANS.length),
    )
    return [
      {
        id: 'plans',
        label: 'Total Plans',
        value: String(FEE_PLANS.length),
        sub: `${active.length} currently active`,
        icon: LayoutGrid,
        accent: 'blue',
      },
      {
        id: 'active',
        label: 'Active Plans',
        value: String(active.length),
        sub: `${FEE_PLANS.length - active.length} archived`,
        icon: CheckCircle2,
        accent: 'emerald',
      },
      {
        id: 'enrolled',
        label: 'Students Enrolled',
        value: String(enrolled),
        sub: 'Across all plans',
        icon: Users,
        accent: 'cyan',
      },
      {
        id: 'avg',
        label: 'Avg Plan Price',
        value: formatPKR(avgMonthly),
        sub: 'Across all cycles',
        icon: Tags,
        accent: 'violet',
      },
      {
        id: 'premium',
        label: 'Premium Plan',
        value: formatPKR(FEE_PLANS.find((p) => p.type === 'Premium')?.amount ?? 0),
        sub: FEE_PLANS.find((p) => p.type === 'Premium')?.name,
        icon: Sparkles,
        accent: 'amber',
      },
    ]
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Fee Plans"
        description="Define pricing structures for rooms, mess and hostel services."
        icon={LayoutGrid}
        crumbs={[{ label: 'Finance' }, { label: 'Fee Plans' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <DataTable
        columns={feePlanColumns()}
        data={filtered}
        getRowId={(plan) => plan.id}
        stickyHeader
        showColumnToggle
        initialPageSize={8}
        toolbar={
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search plans…"
              className="w-56"
            />
            <FilterSelect
              value={type}
              onValueChange={setType}
              placeholder="Type"
              options={PLAN_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <FilterSelect
              value={cycle}
              onValueChange={setCycle}
              placeholder="Billing Cycle"
              options={BILLING_CYCLES.map((c) => ({ value: c, label: c }))}
            />
          </>
        }
        emptyTitle="No fee plans found"
        emptyDescription="No fee plans match the current filters."
      />
    </div>
  )
}
