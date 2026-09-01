'use client'

import { Download, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardGrid } from '@/components/widgets/dashboard-grid'
import { StatCard } from '@/components/widgets/stat-card'
import { ChartCard } from '@/components/widgets/chart-card'
import { AnalyticsOverview } from '@/components/widgets/analytics-overview'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { ExpenseBreakdownChart } from '@/components/charts/expense-breakdown-chart'
import { PaymentChart } from '@/components/charts/payment-chart'
import { OccupancyChart } from '@/components/charts/occupancy-chart'
import { RoomStatusChart } from '@/components/charts/room-status-chart'
import { AIInsightsCard } from '@/components/widgets/ai-insights-card'
import { RecentActivity } from '@/components/widgets/recent-activity'
import { UpcomingEvents } from '@/components/widgets/upcoming-events'
import { RoomSnapshot } from '@/components/widgets/room-snapshot'
import { StudentSnapshot } from '@/components/widgets/student-snapshot'
import { PaymentSnapshot } from '@/components/widgets/payment-snapshot'
import { FloatingQuickActions } from '@/components/widgets/floating-quick-actions'
import { DASHBOARD_STATS } from '@/constants/dashboard'

interface DashboardOverviewProps {
  greeting: string
  today: string
  hostelName: string
  firstName: string
}

export function DashboardOverview({
  greeting,
  today,
  hostelName,
  firstName,
}: DashboardOverviewProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {today}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is what is happening at {hostelName} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Report
          </Button>
        </div>
      </header>

      {/* Primary stats */}
      <DashboardGrid className="gap-4 sm:gap-5">
        {DASHBOARD_STATS.map((stat, index) => (
          <div key={stat.id} className="lg:col-span-3">
            <StatCard stat={stat} index={index} />
          </div>
        ))}
      </DashboardGrid>

      {/* Analytics overview KPIs */}
      <section aria-label="Analytics overview">
        <AnalyticsOverview />
      </section>

      {/* Revenue + expense breakdown */}
      <DashboardGrid>
        <div className="lg:col-span-8">
          <ChartCard
            title="Revenue & Expenses"
            subtitle="Last 12 months"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Expenses
                </span>
              </div>
            }
          >
            <RevenueChart />
          </ChartCard>
        </div>
        <div className="lg:col-span-4">
          <ChartCard title="Expense Breakdown" subtitle="This month by category">
            <ExpenseBreakdownChart />
          </ChartCard>
        </div>
      </DashboardGrid>

      {/* Payments + AI insights */}
      <DashboardGrid>
        <div className="lg:col-span-7">
          <ChartCard
            title="Payments Collected"
            subtitle="Collected vs pending · Last 12 months"
          >
            <PaymentChart />
          </ChartCard>
        </div>
        <div className="lg:col-span-5">
          <AIInsightsCard />
        </div>
      </DashboardGrid>

      {/* Snapshots */}
      <DashboardGrid>
        <div className="lg:col-span-4">
          <RoomSnapshot />
        </div>
        <div className="lg:col-span-4">
          <StudentSnapshot />
        </div>
        <div className="lg:col-span-4">
          <PaymentSnapshot />
        </div>
      </DashboardGrid>

      {/* Activity + events */}
      <DashboardGrid>
        <div className="lg:col-span-6">
          <RecentActivity />
        </div>
        <div className="lg:col-span-6">
          <UpcomingEvents />
        </div>
      </DashboardGrid>

      {/* Occupancy + room status */}
      <DashboardGrid>
        <div className="lg:col-span-6">
          <ChartCard title="Occupancy Trend" subtitle="This week">
            <OccupancyChart />
          </ChartCard>
        </div>
        <div className="lg:col-span-6">
          <ChartCard title="Room Status" subtitle="All rooms">
            <RoomStatusChart />
          </ChartCard>
        </div>
      </DashboardGrid>

      <FloatingQuickActions />
    </div>
  )
}
