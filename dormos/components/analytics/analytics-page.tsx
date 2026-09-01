'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, Wallet, CircleDollarSign, Percent, UserPlus, DoorOpen, UtensilsCrossed,
  Wrench, Package, UsersRound, LayoutGrid,
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import {
  EXEC_KPIS, REVENUE_TREND, OCCUPANCY_TREND, MONTHLY_KPIS, ROOM_UTILIZATION,
  COST_TREND, HEATMAP, BLOCK_COMPARISON, EXPENSE_DONUT, STUDENT_GROWTH, ATTENDANCE_TREND,
} from '@/lib/mock-data/analytics'
import { cn } from '@/lib/utils'

const KPI_ICONS = {
  Revenue: Wallet,
  Expenses: TrendingUp,
  Profit: CircleDollarSign,
  Occupancy: Percent,
  'Student growth': UserPlus,
  'Room utilization': DoorOpen,
  'Mess cost': UtensilsCrossed,
  'Maintenance cost': Wrench,
  'Inventory value': Package,
  Attendance: UsersRound,
}

const axisTick = { fontSize: 10, fill: '#94a3b8' }
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }

function heatColor(value: number) {
  if (value >= 18) return 'bg-primary'
  if (value >= 14) return 'bg-primary'
  if (value >= 10) return 'bg-primary/70'
  if (value >= 7) return 'bg-primary/50'
  return 'bg-primary/30'
}

export function AnalyticsPage() {
  const analytics: AnalyticsItem[] = EXEC_KPIS.map((kpi) => {
    const Icon = KPI_ICONS[kpi.label as keyof typeof KPI_ICONS] ?? Wallet
    return {
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      icon: Icon,
      accent: kpi.accent,
      trend: { value: kpi.change, positive: kpi.positive },
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Analytics Center"
        description="Executive KPIs and advanced trend analysis across every module."
        icon={TrendingUp}
        crumbs={[{ label: 'Analytics' }]}
      />

      <AnalyticsCards items={analytics} />

      {/* Row: revenue trend + expense donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Revenue & Expenses" subtitle="Monthly · PKR thousands" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-5)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#rev-area)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="var(--color-chart-5)" strokeWidth={2} fill="url(#exp-area)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense Breakdown" subtitle="Share of operating costs">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie data={EXPENSE_DONUT} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} strokeWidth={0}>
                {EXPENSE_DONUT.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {EXPENSE_DONUT.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="truncate text-gray-500">{entry.name}</span>
                <span className="ml-auto font-semibold text-gray-700">{entry.value}K</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row: profit + occupancy + room utilization */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Profitability" subtitle="Revenue vs expenses vs profit">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={MONTHLY_KPIS} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Occupancy Trend" subtitle="Bed utilization %">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={OCCUPANCY_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis domain={[75, 100]} tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="occupancy" name="Occupancy" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-chart-4)' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Room Utilization" subtitle="By block">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ROOM_UTILIZATION} layout="vertical" margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="block" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={64} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="utilized" name="Utilized %" fill="var(--color-chart-6)" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Heatmap */}
      <ChartCard
        title="Visitor Activity Heatmap"
        subtitle="Entry volume by hour of day and day of week"
        action={<span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary"><LayoutGrid className="h-3 w-3" /> Heatmap</span>}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-8 gap-1.5">
              <div />
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="pb-1 text-center text-[10px] font-semibold text-gray-400">{day}</div>
              ))}
              {HEATMAP.map((row) => (
                <div key={row.hour} className="grid grid-cols-8 gap-1.5">
                  <div className="flex items-center text-[10px] text-gray-400">{row.hour}</div>
                  {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                    const value = row[day]
                    return (
                      <div
                        key={day}
                        title={`${row.hour} · ${day}: ${value} entries`}
                        className={cn('flex h-9 items-center justify-center rounded-lg text-[10px] font-semibold text-white/80 transition-transform hover:scale-105', heatColor(value))}
                      >
                        {value}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
              <span>Low</span>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={cn('h-3 w-3 rounded', heatColor([2, 7, 10, 14, 19][i]))} />
              ))}
              <span>High</span>
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Row: cost trend + comparison + growth + attendance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Cost Trend Analysis" subtitle="Mess, maintenance & utilities" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={COST_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="mess" name="Mess" stroke="var(--color-chart-3)" strokeWidth={2} fill="var(--color-chart-3)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="utilities" name="Utilities" stroke="var(--color-chart-4)" strokeWidth={2} fill="var(--color-chart-4)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="maintenance" name="Maintenance" stroke="var(--color-chart-5)" strokeWidth={2} fill="var(--color-chart-5)" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Block Comparison" subtitle="Revenue vs expenses by block">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BLOCK_COMPARISON} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="block" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Student Growth" subtitle="Admissions vs checkouts">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={STUDENT_GROWTH} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="admissions" name="Admissions" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="checkouts" name="Checkouts" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Staff Attendance" subtitle="Present vs absent this week">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={ATTENDANCE_TREND} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" stackId="a" fill="var(--color-chart-6)" maxBarSize={22} />
              <Bar dataKey="absent" name="Absent" stackId="a" fill="var(--color-chart-5)" maxBarSize={22} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900">Executive summary</h3>
          <p className="mt-0.5 text-xs text-gray-400">Narrative generated from this month</p>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            {[
              { label: 'Best month on record', detail: 'Revenue of Rs 842.5K with a 38.6% margin.' },
              { label: 'Watch electricity', detail: 'Utilities trending +11% month-over-month.' },
              { label: 'Block B opportunity', detail: '9 open beds worth ~Rs 76K/month at 88% utilization.' },
              { label: 'Collection strong', detail: '96.4% collection — the highest this year.' },
            ].map((item, i) => (
              <div key={item.label} className="flex gap-3 rounded-xl bg-gray-50/70 px-3 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">{i + 1}</span>
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
