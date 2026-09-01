'use client'

import {
  Banknote,
  Wallet,
  Receipt,
  TrendingUp,
  Percent,
  Clock3,
  FileWarning,
  UserCheck,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { FinanceTabs } from '@/components/finance/finance-tabs'
import { FinanceInsightsCard } from '@/components/finance/finance-insights'
import { FinanceQuickActions } from '@/components/finance/finance-quick-actions'
import {
  FinanceRevenueAreaChart,
  FinanceProfitLineChart,
  FinanceMethodDonutChart,
  FinanceExpenseBarChart,
  FinanceOutstandingChart,
  FinanceOccupancyRevenueChart,
} from '@/components/finance/finance-charts'
import {
  AVERAGE_REVENUE_PER_STUDENT,
  COLLECTION_RATE,
  LATEST_MONTH,
  MONTHLY_FINANCE,
  NET_PROFIT,
  OUTSTANDING_DUES,
  PENDING_PAYMENTS,
  PENDING_PAYMENTS_TOTAL,
  PREVIOUS_MONTH,
  TOTAL_EXPENSES,
  TOTAL_REVENUE,
  monthTrend,
} from '@/lib/mock-data/finance'
import { formatPKR } from '@/lib/format'

export function FinanceDashboardPage() {
  const revenueTrend = monthTrend(LATEST_MONTH.revenue, PREVIOUS_MONTH.revenue)
  const profitTrend = monthTrend(LATEST_MONTH.netProfit, PREVIOUS_MONTH.netProfit)
  const expenseTrend = monthTrend(LATEST_MONTH.expenses, PREVIOUS_MONTH.expenses)
  const messCost = MONTHLY_FINANCE.reduce((sum, m) => sum + m.messCost, 0)
  const maintenanceCost = MONTHLY_FINANCE.reduce((sum, m) => sum + m.maintenanceCost, 0)

  const analytics: AnalyticsItem[] = [
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: formatPKR(TOTAL_REVENUE),
      sub: 'Last 12 months',
      icon: Banknote,
      accent: 'emerald',
      trend: { value: revenueTrend.value, positive: revenueTrend.positive },
    },
    {
      id: 'monthly-revenue',
      label: 'Monthly Revenue',
      value: formatPKR(LATEST_MONTH.revenue),
      sub: `${LATEST_MONTH.month} ${LATEST_MONTH.year}`,
      icon: Wallet,
      accent: 'blue',
    },
    {
      id: 'total-expenses',
      label: 'Total Expenses',
      value: formatPKR(TOTAL_EXPENSES),
      sub: `${Math.round((TOTAL_EXPENSES / TOTAL_REVENUE) * 100)}% of revenue`,
      icon: Receipt,
      accent: 'rose',
      trend: { value: expenseTrend.value, positive: !expenseTrend.positive },
    },
    {
      id: 'net-profit',
      label: 'Net Profit',
      value: formatPKR(NET_PROFIT),
      sub: `${Math.round((NET_PROFIT / TOTAL_REVENUE) * 100)}% margin`,
      icon: TrendingUp,
      accent: 'cyan',
      trend: { value: profitTrend.value, positive: profitTrend.positive },
    },
    {
      id: 'collection-rate',
      label: 'Collection Rate',
      value: `${COLLECTION_RATE}%`,
      sub: 'Payments collected on time',
      icon: Percent,
      accent: 'violet',
    },
    {
      id: 'pending',
      label: 'Pending Payments',
      value: formatPKR(PENDING_PAYMENTS_TOTAL),
      sub: `${PENDING_PAYMENTS.length} awaiting confirmation`,
      icon: Clock3,
      accent: 'amber',
    },
    {
      id: 'outstanding',
      label: 'Outstanding Dues',
      value: formatPKR(OUTSTANDING_DUES),
      sub: 'Overdue + pending invoices',
      icon: FileWarning,
      accent: 'rose',
    },
    {
      id: 'avg-revenue',
      label: 'Avg Revenue / Student',
      value: formatPKR(AVERAGE_REVENUE_PER_STUDENT),
      sub: 'Annualised per resident',
      icon: UserCheck,
      accent: 'cyan',
    },
    {
      id: 'mess',
      label: 'Mess Cost',
      value: formatPKR(messCost),
      sub: 'Food & rationing (12 mo)',
      icon: UtensilsCrossed,
      accent: 'amber',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      value: formatPKR(maintenanceCost),
      sub: 'Repairs & upkeep (12 mo)',
      icon: Wrench,
      accent: 'blue',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Finance"
        description="Track revenue, expenses, invoicing and profitability across your hostel."
        icon={Wallet}
        crumbs={[{ label: 'Finance' }]}
      />

      <FinanceTabs />

      <AnalyticsCards items={analytics} />

      <FinanceQuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly collections against operational spend"
          className="lg:col-span-2"
        >
          <FinanceRevenueAreaChart />
        </ChartCard>
        <FinanceInsightsCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Profit & Revenue"
          subtitle="Net profit bars with revenue trend line"
          className="lg:col-span-2"
        >
          <FinanceProfitLineChart />
        </ChartCard>
        <ChartCard title="Payment Methods" subtitle="Share of collections by method">
          <FinanceMethodDonutChart />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Expense Breakdown"
          subtitle="Total spend by category this year"
          className="lg:col-span-2"
        >
          <FinanceExpenseBarChart />
        </ChartCard>
        <ChartCard title="Outstanding by Month" subtitle="Collected, pending and overdue">
          <FinanceOutstandingChart />
        </ChartCard>
      </div>

      <ChartCard
        title="Occupancy vs Revenue"
        subtitle="How room occupancy relates to monthly collections"
      >
        <FinanceOccupancyRevenueChart />
      </ChartCard>
    </div>
  )
}
