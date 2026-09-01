'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Search, Plus, Download, Gift, Flame, CheckCircle2, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { MEAL_COUPONS } from '@/lib/mock-data/mess'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  Used: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20', dot: 'bg-gray-400' },
  Expired: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', dot: 'bg-rose-500' },
}

const MEAL_CONFIG = {
  Breakfast: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Lunch: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Dinner: { bg: 'bg-violet-50', text: 'text-violet-700' },
  All: { bg: 'bg-accent', text: 'text-primary' },
}

const activeCoupons = MEAL_COUPONS.filter((c) => c.status === 'Active')

export function MealCouponsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Used' | 'Expired'>('all')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = MEAL_COUPONS.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.couponNumber.toLowerCase().includes(q) || c.studentName.toLowerCase().includes(q) || c.room.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const usedMeals = MEAL_COUPONS.reduce((sum, c) => sum + c.usedCount, 0)
  const totalMeals = MEAL_COUPONS.reduce((sum, c) => sum + c.totalCount, 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Meal Coupons"
        description="Issue and track prepaid meal coupons for students and guests."
        icon={Ticket}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Coupons' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Issue Coupon
            </button>
          </div>
        }
      />

      <MessTabs />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Active Coupons', value: activeCoupons.length.toString(), sub: 'Currently valid', icon: Ticket, color: 'text-emerald-600' },
          { label: 'Meals Used', value: usedMeals.toLocaleString(), sub: `${totalMeals.toLocaleString()} total issued`, icon: CheckCircle2, color: 'text-primary' },
          { label: 'Usage Rate', value: `${Math.round((usedMeals / Math.max(totalMeals, 1)) * 100)}%`, sub: 'Across all coupons', icon: Flame, color: 'text-amber-600' },
          { label: 'Expired', value: MEAL_COUPONS.filter((c) => c.status === 'Expired').length.toString(), sub: 'No longer valid', icon: Gift, color: 'text-rose-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{card.label}</p>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
            <p className={cn('mt-1 text-2xl font-bold', card.color)}>{card.value}</p>
            <p className="mt-0.5 text-[10px] text-gray-400">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by coupon number, student or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Active', 'Used', 'Expired'] as const).map((s) => (
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Coupon</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Student</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Meal</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Valid From</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Valid To</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Usage</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((coupon, i) => {
                const statusConf = STATUS_CONFIG[coupon.status]
                const mealConf = MEAL_CONFIG[coupon.mealType]
                const pct = Math.round((coupon.usedCount / Math.max(coupon.totalCount, 1)) * 100)
                return (
                  <motion.tr key={coupon.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-900">{coupon.couponNumber}</p>
                      <p className="text-[10px] text-gray-400">{coupon.room}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-gray-900">{coupon.studentName}</p>
                      <p className="text-[10px] text-gray-400">{coupon.room}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', mealConf.bg, mealConf.text)}>
                        {coupon.mealType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(coupon.validFrom)}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(coupon.validTo)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <div className={cn('h-full rounded-full', coupon.status === 'Active' ? 'bg-primary' : 'bg-gray-300')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{coupon.usedCount}/{coupon.totalCount}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusConf.dot)} />
                        {coupon.status}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-xs text-gray-400">No coupons match your filters.</div>
        )}
      </div>

      {/* Issue Coupon Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Issue Meal Coupon</h2>
              <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Student Name', placeholder: 'Full name', type: 'text' },
                { label: 'Room', placeholder: 'Room 101', type: 'text' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Meal Type</label>
                <select className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50">
                  <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>All</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Total Meals</label>
                <input type="number" defaultValue={10} className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/80">
                Issue Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
