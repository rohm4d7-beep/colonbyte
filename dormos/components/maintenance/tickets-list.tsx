'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Search, Plus, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MaintenanceTabs } from './maintenance-tabs'
import { MAINTENANCE_TICKETS } from '@/lib/mock-data/maintenance'
import type { TicketCategory, TicketPriority, TicketStatus } from '@/lib/mock-data/maintenance'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const PRIORITY_CONFIG: Record<TicketPriority, { bg: string; text: string; ring: string }> = {
  Critical: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  High: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Medium: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Low: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const STATUS_CONFIG: Record<TicketStatus, { bg: string; text: string; ring: string }> = {
  Open: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  'In Progress': { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Closed: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
  Cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-400/20' },
}

const CATEGORIES: TicketCategory[] = ['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Painting', 'Internet', 'Air Conditioning', 'General']
const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical']
const STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled']

export function TicketsListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all')
  const [page, setPage] = useState(1)

  const filtered = MAINTENANCE_TICKETS.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q) || t.room.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter
    return matchSearch && matchStatus && matchPriority && matchCat
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = filtered.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const tickets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCount = MAINTENANCE_TICKETS.filter((t) => t.status === 'Open').length
  const inProgressCount = MAINTENANCE_TICKETS.filter((t) => t.status === 'In Progress').length
  const resolvedCount = MAINTENANCE_TICKETS.filter((t) => t.status === 'Resolved').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="All Tickets"
        description="Browse, filter and manage all maintenance requests."
        icon={Ticket}
        crumbs={[{ label: 'Maintenance', href: '/dashboard/maintenance' }, { label: 'All Tickets' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        }
      />

      <MaintenanceTabs />

      {/* Status chips */}
      <div className="flex items-center gap-2">
        {[
          { label: 'Open', count: openCount, color: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
          { label: 'In Progress', count: inProgressCount, color: 'bg-accent text-primary ring-primary/20' },
          { label: 'Resolved', count: resolvedCount, color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
        ].map((chip) => (
          <div key={chip.label} className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1', chip.color)}>
            {chip.label}
            <span className="font-bold">{chip.count}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search tickets..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as TicketStatus | 'all'); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50">
          <option value="all">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value as TicketPriority | 'all'); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50">
          <option value="all">All Priority</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value as TicketCategory | 'all'); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Ticket</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Priority</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Assigned To</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Cost</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.map((ticket, i) => {
                const pConf = PRIORITY_CONFIG[ticket.priority]
                const sConf = STATUS_CONFIG[ticket.status]
                return (
                  <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-primary">{ticket.ticketNumber}</p>
                      <p className="text-xs text-gray-600 truncate max-w-[180px]">{ticket.title}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.room}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{ticket.category}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>{ticket.priority}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>{ticket.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[110px] truncate">{ticket.assignedTo}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-600">
                      Rs {(ticket.actualCost ?? ticket.estimatedCost).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(pages, 6) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors', page === p ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100')}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
