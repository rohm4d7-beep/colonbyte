'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Search, Plus, Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { GUEST_MEALS } from '@/lib/mock-data/mess'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const STATUS_CONFIG = {
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const MEAL_CONFIG = {
  Breakfast: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Lunch: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Dinner: { bg: 'bg-violet-50', text: 'text-violet-700' },
}

export function GuestMealsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Pending' | 'Rejected'>('all')

  const filtered = GUEST_MEALS.filter((g) => {
    const q = search.toLowerCase()
    const matchSearch = !q || g.guestName.toLowerCase().includes(q) || g.hostStudent.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || g.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = GUEST_MEALS.filter((g) => g.status === 'Approved').reduce((sum, g) => sum + g.cost, 0)
  const approvedCount = GUEST_MEALS.filter((g) => g.status === 'Approved').length
  const pendingCount = GUEST_MEALS.filter((g) => g.status === 'Pending').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Guest Meals"
        description="Manage and approve meal requests for student guests."
        icon={UserCheck}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Guests' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Add Guest Meal
            </button>
          </div>
        }
      />

      <MessTabs />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Guests', value: GUEST_MEALS.length.toString(), color: 'text-primary' },
          { label: 'Approved', value: approvedCount.toString(), color: 'text-emerald-600' },
          { label: 'Revenue', value: `Rs ${totalRevenue.toLocaleString()}`, color: 'text-violet-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-center"
          >
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search guest or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Approved', 'Pending', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Guest Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Host Student</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Meal</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Cost</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((guest, i) => {
                const statusConf = STATUS_CONFIG[guest.status]
                const mealConf = MEAL_CONFIG[guest.meal]
                return (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-gray-900">{guest.guestName}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{guest.hostStudent}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{guest.hostRoom}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', mealConf.bg, mealConf.text)}>
                        {guest.meal}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(guest.date)}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">Rs {guest.cost}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                        {guest.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
