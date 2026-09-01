'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { History, Users, Clock, BarChart2, TrendingUp } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { VisitorTabs } from './visitor-tabs'
import { VISITORS, VISITOR_STATS, VISITOR_BY_DAY, VISITOR_BY_PURPOSE, VISITOR_BY_RELATIONSHIP } from '@/lib/mock-data/visitors'

const PIE_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-4)', 'var(--color-chart-3)', 'var(--color-chart-5)', 'var(--color-chart-6)']

const completedVisitors = VISITORS.filter((v) => v.status === 'Checked Out')

export function VisitorHistoryPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30')

  const chartData = range === '7' ? VISITOR_BY_DAY.slice(-7) : range === '90' ? VISITOR_BY_DAY : VISITOR_BY_DAY.slice(-30)

  const analytics: AnalyticsItem[] = [
    { id: 'total', label: 'Total Visitors', value: VISITOR_STATS.totalAllTime.toString(), sub: 'All time visitor count', icon: Users, accent: 'blue' },
    { id: 'avg', label: 'Avg Visit Duration', value: VISITOR_STATS.avgDuration, sub: 'Average time spent', icon: Clock, accent: 'violet' },
    { id: 'monthly', label: 'This Month', value: VISITOR_STATS.thisMonth.toString(), sub: 'Current month visits', icon: TrendingUp, accent: 'emerald' },
    { id: 'peak', label: 'Peak Day', value: 'Friday', sub: 'Busiest visitor day', icon: BarChart2, accent: 'amber' },
  ]

  const topRelationships = [...VISITOR_BY_RELATIONSHIP].sort((a, b) => b.count - a.count)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Visitor History"
        description="Historical visitor analytics, trends and insights."
        icon={History}
        crumbs={[{ label: 'Visitors', href: '/dashboard/visitors' }, { label: 'History' }]}
      />

      <VisitorTabs />

      <AnalyticsCards items={analytics} />

      {/* Range Selector */}
      <div className="flex items-center gap-1 self-start rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {(['7', '30', '90'] as const).map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${range === r ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50'}`}>
            {r === '7' ? 'Last 7 Days' : r === '30' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Daily Visitor Traffic" subtitle="Number of visitors per day">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="count" name="Visitors" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#visGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="By Purpose" subtitle="Visit purpose breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={VISITOR_BY_PURPOSE} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="purpose">
                {VISITOR_BY_PURPOSE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
            {VISITOR_BY_PURPOSE.map((p, i) => (
              <div key={p.purpose} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] text-gray-500">{p.purpose}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="By Relationship" subtitle="Visitor relationship to resident">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRelationships} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="relationship" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" name="Visits" fill="var(--color-chart-4)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Pattern" subtitle="Average visitors by day of week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { day: 'Mon', count: 38 }, { day: 'Tue', count: 42 }, { day: 'Wed', count: 35 },
              { day: 'Thu', count: 48 }, { day: 'Fri', count: 67 }, { day: 'Sat', count: 72 }, { day: 'Sun', count: 55 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" name="Visitors" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Completed Visits */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Completed Visits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Visitor', 'CNIC', 'Visited', 'Purpose', 'Check In', 'Check Out', 'Duration'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {completedVisitors.slice(0, 15).map((v, i) => (
                <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-xs font-semibold text-gray-900">{v.name}</p>
                    <p className="text-[10px] text-gray-400">{v.relationship}</p>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-500">{v.cnic}</td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-gray-900">{v.visitingStudent}</p>
                    <p className="text-[10px] text-gray-400">{v.studentRoom}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{v.purpose}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(v.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {v.checkOut ? new Date(v.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{v.duration ?? '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
