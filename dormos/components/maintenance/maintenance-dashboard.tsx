'use client'

import { motion } from 'framer-motion'
import {
  Wrench, Plus, AlertTriangle, Clock, CheckCircle2, DollarSign,
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { MaintenanceTabs } from './maintenance-tabs'
import { MAINTENANCE_TICKETS, MAINTENANCE_STATS, MAINTENANCE_BY_CATEGORY, MAINTENANCE_BY_MONTH } from '@/lib/mock-data/maintenance'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG = {
  Critical: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', dot: 'bg-rose-500' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  Medium: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20', dot: 'bg-primary' },
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20', dot: 'bg-gray-400' },
}

const STATUS_CONFIG = {
  Open: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  'In Progress': { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Closed: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
  Cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-400/20' },
}

const CAT_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-5)', 'var(--color-chart-4)', 'var(--color-chart-3)', 'var(--color-chart-6)', 'var(--color-chart-2)']

const urgentTickets = MAINTENANCE_TICKETS.filter(
  (t) => (t.priority === 'Critical' || t.priority === 'High') && (t.status === 'Open' || t.status === 'In Progress')
).slice(0, 5)

const recentTickets = [...MAINTENANCE_TICKETS]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10)

export function MaintenanceDashboardPage() {
  const analytics: AnalyticsItem[] = [
    { id: 'open', label: 'Open Tickets', value: MAINTENANCE_STATS.open.toString(), sub: 'Awaiting assignment', icon: Wrench, accent: 'rose' },
    { id: 'in-progress', label: 'In Progress', value: MAINTENANCE_STATS.inProgress.toString(), sub: 'Currently being worked on', icon: Clock, accent: 'blue' },
    { id: 'resolved', label: 'Resolved (Month)', value: MAINTENANCE_STATS.resolvedThisMonth.toString(), sub: 'Completed this month', icon: CheckCircle2, accent: 'emerald' },
    { id: 'avg-res', label: 'Avg Resolution', value: `${MAINTENANCE_STATS.avgResolutionDays} days`, sub: 'Time to close tickets', icon: Clock, accent: 'cyan' },
    { id: 'cost', label: 'Cost (MTD)', value: `Rs ${MAINTENANCE_STATS.totalCostMTD.toLocaleString()}`, sub: 'This month\'s spend', icon: DollarSign, accent: 'violet' },
    { id: 'critical', label: 'Critical Issues', value: MAINTENANCE_STATS.critical.toString(), sub: 'Needs immediate attention', icon: AlertTriangle, accent: 'rose', trend: { value: `${MAINTENANCE_STATS.critical} open`, positive: false } },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Maintenance"
        description="Manage repair tickets, assign jobs and track resolution timelines."
        icon={Wrench}
        crumbs={[{ label: 'Maintenance' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        }
      />

      <MaintenanceTabs />

      <AnalyticsCards items={analytics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Monthly Tickets" subtitle="Open vs resolved tickets over 12 months" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MAINTENANCE_BY_MONTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="open" name="Open" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Urgent Tickets */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Urgent Tickets</h3>
              <p className="mt-0.5 text-xs text-gray-400">Critical & high priority</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {urgentTickets.map((ticket, i) => {
              const pConf = PRIORITY_CONFIG[ticket.priority]
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('h-2 w-2 rounded-full shrink-0', pConf.dot)} />
                    <p className="text-xs font-medium text-gray-900 truncate">{ticket.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{ticket.room} · {ticket.category}</span>
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>
                      {ticket.priority}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Cost Trend" subtitle="Monthly maintenance expenditure">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MAINTENANCE_BY_MONTH} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, 'Cost']} />
              <Line type="monotone" dataKey="cost" name="Cost" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By Category" subtitle="Ticket distribution across issue types">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={MAINTENANCE_BY_CATEGORY} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={3}>
                {MAINTENANCE_BY_CATEGORY.map((_, i) => (
                  <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Tickets Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Tickets</h3>
            <p className="mt-0.5 text-xs text-gray-400">Latest 10 maintenance requests</p>
          </div>
          <button className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Ticket</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Priority</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Assigned</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTickets.map((ticket, i) => {
                const pConf = PRIORITY_CONFIG[ticket.priority]
                const sConf = STATUS_CONFIG[ticket.status]
                return (
                  <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs font-semibold text-primary">{ticket.ticketNumber}</p>
                        <p className="text-xs text-gray-600 truncate max-w-[160px]">{ticket.title}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.room}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.category}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[100px] truncate">{ticket.assignedTo}</td>
                    <td className="px-3 py-3 text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
