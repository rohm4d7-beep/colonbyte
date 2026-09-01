'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Utensils, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { ChartCard } from '@/components/widgets/chart-card'
import { MessTabs } from './mess-tabs'
import { MEALS_PER_DAY, MONTHLY_MESS_COST, TOP_CONSUMED_ITEMS, FOOD_WASTE_DATA } from '@/lib/mock-data/mess'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const ATTENDANCE_TREND = MEALS_PER_DAY.slice(-14).map((d) => ({
  label: d.label,
  breakfast: d.breakfast,
  lunch: d.lunch,
  dinner: d.dinner,
}))

const WASTE_COLORS = ['var(--color-chart-5)', 'var(--color-chart-3)', 'var(--color-chart-1)', 'var(--color-chart-4)', 'var(--color-chart-2)']

const KPI_CARDS = [
  { label: 'Avg Daily Meals', value: '930', sub: 'Per day this month', icon: Utensils, color: 'text-primary bg-accent', trend: '+3.2%', positive: true },
  { label: 'Cost Per Meal', value: 'Rs 9.8', sub: 'All 3 meals average', icon: TrendingDown, color: 'text-emerald-600 bg-emerald-50', trend: '-1.2%', positive: true },
  { label: 'Monthly Budget', value: 'Rs 150,000', sub: 'Aug 2026 allocation', icon: TrendingUp, color: 'text-violet-600 bg-violet-50', trend: '+3.4%', positive: false },
  { label: 'Food Waste', value: '46 kg', sub: 'This month estimate', icon: Trash2, color: 'text-rose-600 bg-rose-50', trend: '-12%', positive: true },
]

export function MessAnalyticsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mess Analytics"
        description="Data-driven insights on meal patterns, costs and food efficiency."
        icon={BarChart3}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Analytics' }]}
      />

      <MessTabs />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', card.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={cn('text-xs font-semibold', card.positive ? 'text-emerald-600' : 'text-rose-500')}>
                  {card.trend}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-500">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Meals Per Day" subtitle="Last 30 days — all three meal types" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MEALS_PER_DAY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {[['bfG', 'var(--color-chart-3)'], ['lnG', 'var(--color-chart-1)'], ['dnG', 'var(--color-chart-4)']].map(([id, color]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="breakfast" name="Breakfast" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#bfG)" dot={false} />
              <Area type="monotone" dataKey="lunch" name="Lunch" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#lnG)" dot={false} />
              <Area type="monotone" dataKey="dinner" name="Dinner" stroke="var(--color-chart-4)" strokeWidth={2} fill="url(#dnG)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Food Waste" subtitle="Waste by category this month">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={FOOD_WASTE_DATA}
                dataKey="waste"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={3}
              >
                {FOOD_WASTE_DATA.map((_, i) => (
                  <Cell key={i} fill={WASTE_COLORS[i % WASTE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v} kg`, '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Monthly Cost Trend" subtitle="Budget vs actual mess expenditure">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_MESS_COST} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Actual" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Consumed Items" subtitle="Highest usage items this month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TOP_CONSUMED_ITEMS} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="item" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v, name) => [`${v} units`, name]} />
              <Bar dataKey="quantity" name="Quantity" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Meal Attendance Trend" subtitle="Last 14 days — attendance by meal type">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={ATTENDANCE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={[250, 420]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="breakfast" name="Breakfast" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lunch" name="Lunch" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="dinner" name="Dinner" stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
