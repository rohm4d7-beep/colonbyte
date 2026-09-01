'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import {
  EXPENSES,
  MONTHLY_FINANCE,
  OCCUPANCY_REVENUE,
  OUTSTANDING_BY_MONTH,
  PAYMENT_METHOD_BREAKDOWN,
} from '@/lib/mock-data/finance'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const AXIS_TICK = { fill: '#9CA3AF', fontSize: 11 }
const AXIS_LINE = { stroke: '#F3F4F6', vertical: false }

export function FinanceRevenueAreaChart({ className }: { className?: string }) {
  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={MONTHLY_FINANCE} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="fin-rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fin-exp-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" {...AXIS_LINE} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            cursor={{ stroke: '#E5E7EB' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            fill="url(#fin-rev-fill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            fill="url(#fin-exp-fill)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const EXPENSE_CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-4)',
  'var(--color-chart-3)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-2)',
  'var(--color-chart-7)',
  'var(--color-chart-6)',
  'var(--color-chart-3)',
  '#94A3B8',
]

export function FinanceExpenseBarChart({ className }: { className?: string }) {
  const categories = Object.entries(
    EXPENSES.filter((e) => e.status !== 'Rejected').reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={categories} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="4 4" {...AXIS_LINE} />
          <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            cursor={{ fill: '#F9FAFB' }}
          />
          <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {categories.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={EXPENSE_CHART_COLORS[index % EXPENSE_CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FinanceProfitLineChart({ className }: { className?: string }) {
  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={MONTHLY_FINANCE} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="fin-profit-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" {...AXIS_LINE} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            cursor={{ stroke: '#E5E7EB' }}
          />
          <Bar dataKey="netProfit" name="Net profit" fill="url(#fin-profit-fill)" radius={[5, 5, 0, 0]} maxBarSize={36} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: 'var(--color-chart-1)' }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FinanceMethodDonutChart({
  className,
  height = 220,
}: {
  className?: string
  height?: number
}) {
  const total = PAYMENT_METHOD_BREAKDOWN.reduce((sum, entry) => sum + entry.value, 0)
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center', className)}>
      <div className="relative shrink-0" style={{ height, width: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PAYMENT_METHOD_BREAKDOWN}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {PAYMENT_METHOD_BREAKDOWN.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-bold tracking-tight text-gray-900">
            {formatCurrency(total, 'PKR')}
          </p>
          <p className="text-[11px] text-gray-400">Total collected</p>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5">
        {PAYMENT_METHOD_BREAKDOWN.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="flex-1 truncate text-gray-500">{entry.name}</span>
            <span className="font-semibold text-gray-900">
              {Math.round((entry.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FinanceOutstandingChart({ className }: { className?: string }) {
  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={OUTSTANDING_BY_MONTH} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="4 4" {...AXIS_LINE} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            cursor={{ fill: '#F9FAFB' }}
          />
          <Bar dataKey="collected" name="Collected" stackId="a" fill="var(--color-chart-2)" maxBarSize={22} />
          <Bar dataKey="pending" name="Pending" stackId="a" fill="var(--color-chart-3)" maxBarSize={22} />
          <Bar dataKey="overdue" name="Overdue" stackId="a" fill="var(--color-chart-5)" maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FinanceOccupancyRevenueChart({ className }: { className?: string }) {
  return (
    <div className={cn('h-72 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={OCCUPANCY_REVENUE} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="fin-occ-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" {...AXIS_LINE} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
          <YAxis
            yAxisId="left"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            content={<ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />}
            cursor={{ stroke: '#E5E7EB' }}
          />
          <Bar yAxisId="left" dataKey="occupancy" name="Occupancy" fill="url(#fin-occ-fill)" radius={[5, 5, 0, 0]} maxBarSize={28} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: 'var(--color-chart-1)' }}
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
