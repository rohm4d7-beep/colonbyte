'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MaintenanceTabs } from './maintenance-tabs'
import { MAINTENANCE_TICKETS } from '@/lib/mock-data/maintenance'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG = {
  Critical: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Medium: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const completedTickets = MAINTENANCE_TICKETS.filter((t) => t.status === 'Resolved' || t.status === 'Closed')
  .sort((a, b) => new Date(b.completedDate ?? b.updatedAt).getTime() - new Date(a.completedDate ?? a.updatedAt).getTime())

function calcDuration(created: string, completed: string | null): string {
  if (!completed) return '—'
  const days = Math.round((new Date(completed).getTime() - new Date(created).getTime()) / 86400000)
  return days === 0 ? 'Same day' : `${days} day${days > 1 ? 's' : ''}`
}

export function CompletedJobsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', ...Array.from(new Set(completedTickets.map((t) => t.category)))]

  const filtered = completedTickets.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.room.toLowerCase().includes(q)
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchCat
  })

  const totalCost = completedTickets.reduce((sum, t) => sum + (t.actualCost ?? 0), 0)
  const thisWeek = completedTickets.filter((t) => {
    const d = new Date(t.completedDate ?? t.updatedAt)
    const week = new Date()
    week.setDate(week.getDate() - 7)
    return d >= week
  }).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Completed Jobs"
        description="All resolved and closed maintenance tickets."
        icon={CheckCircle2}
        crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'Completed' }]}
      />

      <MaintenanceTabs />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed This Week', value: thisWeek.toString(), color: 'text-emerald-600' },
          { label: 'Completed This Month', value: completedTickets.length.toString(), color: 'text-primary' },
          { label: 'Total Cost', value: `Rs ${totalCost.toLocaleString()}`, color: 'text-violet-600' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={cn('mt-1 text-xl font-bold', card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search completed jobs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50">
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Ticket</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Priority</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Completed</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Duration</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Actual Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice(0, 50).map((ticket, i) => {
                const pConf = PRIORITY_CONFIG[ticket.priority]
                return (
                  <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-emerald-600">{ticket.ticketNumber}</p>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{ticket.title}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.room}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.category}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>{ticket.priority}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {ticket.completedDate ? new Date(ticket.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {calcDuration(ticket.createdAt, ticket.completedDate)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">
                      {ticket.actualCost ? `Rs ${ticket.actualCost.toLocaleString()}` : '—'}
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
