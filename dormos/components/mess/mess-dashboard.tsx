'use client'

import { motion } from 'framer-motion'
import {
  UtensilsCrossed, Users, TrendingUp, AlertTriangle, Plus, Coffee, Sun, Moon,
  CheckCircle2, XCircle, Thermometer, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { MessTabs } from './mess-tabs'
import {
  MESS_SUMMARY, MEALS_PER_DAY, MONTHLY_MESS_COST, MESS_ALERTS,
  MEAL_ATTENDANCE, WEEKLY_MENU,
} from '@/lib/mock-data/mess'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const ALERT_COLORS = {
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-600/20' },
  low: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-600/20' },
}

const TODAY_MENU = WEEKLY_MENU[0] // Monday as "today"

const RECENT_ATTENDANCE = MEAL_ATTENDANCE.slice(0, 12)

export function MessDashboardPage() {
  const analytics: AnalyticsItem[] = [
    {
      id: 'meals-today',
      label: 'Meals Served Today',
      value: MESS_SUMMARY.totalMealsToday.toString(),
      sub: 'Breakfast + Lunch combined',
      icon: UtensilsCrossed,
      accent: 'blue',
    },
    {
      id: 'breakfast',
      label: 'Breakfast',
      value: MESS_SUMMARY.breakfastCount.toString(),
      sub: '89% of students',
      icon: Coffee,
      accent: 'amber',
    },
    {
      id: 'lunch',
      label: 'Lunch',
      value: MESS_SUMMARY.lunchCount.toString(),
      sub: '94% of students',
      icon: Sun,
      accent: 'emerald',
    },
    {
      id: 'dinner',
      label: 'Dinner',
      value: '—',
      sub: 'Serving at 8:00 PM',
      icon: Moon,
      accent: 'violet',
    },
    {
      id: 'guests',
      label: 'Guests Today',
      value: MESS_SUMMARY.guestsToday.toString(),
      sub: 'Extra meal coupons issued',
      icon: Users,
      accent: 'cyan',
    },
    {
      id: 'monthly-cost',
      label: 'Monthly Cost',
      value: `Rs ${MESS_SUMMARY.monthlyMessCost.toLocaleString()}`,
      sub: 'vs Rs 145,000 budget',
      icon: TrendingUp,
      accent: 'rose',
      trend: { value: '+7.0%', positive: false },
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mess Management"
        description="Plan menus, track attendance and manage kitchen inventory."
        icon={UtensilsCrossed}
        crumbs={[{ label: 'Mess' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            Update Menu
          </button>
        }
      />

      <MessTabs />

      <AnalyticsCards items={analytics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Meals Per Day"
          subtitle="Breakfast, lunch and dinner counts for the last 30 days"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MEALS_PER_DAY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 600, color: '#1e293b' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="breakfast" name="Breakfast" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#bfGrad)" dot={false} />
              <Area type="monotone" dataKey="lunch" name="Lunch" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#lnGrad)" dot={false} />
              <Area type="monotone" dataKey="dinner" name="Dinner" stroke="var(--color-chart-4)" strokeWidth={2} fill="url(#dnGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Kitchen Alerts */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Kitchen Alerts</h3>
              <p className="mt-0.5 text-xs text-gray-400">{MESS_ALERTS.length} items need attention</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {MESS_ALERTS.slice(0, 7).map((alert, i) => {
              const c = ALERT_COLORS[alert.severity]
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn('flex items-center gap-2.5 rounded-xl p-2.5 ring-1', c.bg, c.ring)}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', c.dot)} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-xs font-medium', c.text)}>{alert.itemName}</p>
                    <p className="text-xs text-gray-400">{alert.currentStock}/{alert.minStock} {alert.unit}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize ring-1', c.bg, c.text, c.ring)}>
                    {alert.severity}
                  </span>
                </motion.div>
              )
            })}
          </div>
          <button className="mt-3 w-full rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
            View All Inventory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Monthly Mess Cost"
          subtitle="Budget vs actual spend over last 12 months"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_MESS_COST} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, '']}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Actual" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Today's Menu */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Today&apos;s Menu</h3>
              <p className="mt-0.5 text-xs text-gray-400">{TODAY_MENU.day} · {formatDate(TODAY_MENU.date)}</p>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
              <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Breakfast', icon: Coffee, color: 'text-amber-600 bg-amber-50', items: TODAY_MENU.breakfast },
              { label: 'Lunch', icon: Sun, color: 'text-emerald-600 bg-emerald-50', items: TODAY_MENU.lunch },
              { label: 'Dinner', icon: Moon, color: 'text-violet-600 bg-violet-50', items: TODAY_MENU.dinner },
            ].map(({ label, icon: Icon, color, items }) => (
              <div key={label} className="rounded-xl bg-gray-50/70 p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-md', color)}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {items.map((item) => (
                    <span key={item} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Meal Attendance</h3>
            <p className="mt-0.5 text-xs text-gray-400">Latest attendance records</p>
          </div>
          <button className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-xs text-gray-400">
                <th className="px-5 py-3 text-left font-medium">Student</th>
                <th className="px-3 py-3 text-left font-medium">Room</th>
                <th className="px-3 py-3 text-center font-medium">Breakfast</th>
                <th className="px-3 py-3 text-center font-medium">Lunch</th>
                <th className="px-3 py-3 text-center font-medium">Dinner</th>
                <th className="px-3 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ATTENDANCE.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                        {record.student.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-gray-900 text-xs">{record.student}</span>
                      {record.isGuest && (
                        <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-600/20">Guest</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{record.room}</td>
                  <td className="px-3 py-3 text-center">
                    {record.breakfast
                      ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      : <XCircle className="mx-auto h-4 w-4 text-gray-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {record.lunch
                      ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      : <XCircle className="mx-auto h-4 w-4 text-gray-300" />}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {record.dinner
                      ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      : <XCircle className="mx-auto h-4 w-4 text-gray-300" />}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">{formatDate(record.date)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
