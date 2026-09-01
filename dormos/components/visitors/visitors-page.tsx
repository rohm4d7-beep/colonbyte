'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, Search, Plus, Download, X, QrCode, Clock, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { VisitorTabs } from './visitor-tabs'
import { VISITORS, VISITOR_STATS } from '@/lib/mock-data/visitors'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const STATUS_CONFIG = {
  'Checked In': { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  'Checked Out': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Overstay: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const REL_COLORS: Record<string, string> = {
  Parent: 'bg-accent text-primary',
  Sibling: 'bg-violet-100 text-violet-700',
  Friend: 'bg-emerald-100 text-emerald-700',
  Relative: 'bg-amber-100 text-amber-700',
  Guardian: 'bg-accent text-primary',
  Official: 'bg-rose-100 text-rose-700',
}

const currentlyInside = VISITORS.filter((v) => v.status === 'Checked In' || v.status === 'Overstay')

export function VisitorsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Checked In' | 'Checked Out' | 'Overstay'>('all')
  const [page, setPage] = useState(1)
  const [showLogModal, setShowLogModal] = useState(false)
  const [logSuccess, setLogSuccess] = useState(false)

  const allVisitors = [...VISITORS].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())

  const filtered = allVisitors.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch = !q || v.name.toLowerCase().includes(q) || v.cnic.includes(q) || v.visitingStudent.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const total = filtered.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const visitors = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const analytics: AnalyticsItem[] = [
    { id: 'today', label: 'Total Today', value: VISITOR_STATS.totalToday.toString(), sub: 'Visitors logged today', icon: UserCheck, accent: 'blue' },
    { id: 'inside', label: 'Currently Inside', value: VISITOR_STATS.checkedInNow.toString(), sub: 'Live count inside premises', icon: UserCheck, accent: 'emerald' },
    { id: 'checkout', label: 'Checked Out', value: VISITOR_STATS.checkedOutToday.toString(), sub: 'Departed today', icon: UserCheck, accent: 'cyan' },
    { id: 'overstay', label: 'Overstay Alerts', value: VISITOR_STATS.overstayCount.toString(), sub: 'Exceeded allowed time', icon: AlertCircle, accent: 'rose', trend: { value: `${VISITOR_STATS.overstayCount} alerts`, positive: false } },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Visitor Management"
        description="Digital visitor log with check-in/out, pass generation and access control."
        icon={UserCheck}
        crumbs={[{ label: 'Visitors' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Log Visitor
            </button>
          </div>
        }
      />

      <VisitorTabs />

      <AnalyticsCards items={analytics} />

      {/* Currently Inside */}
      {currentlyInside.length > 0 && (
        <div className="rounded-2xl border border-primary/25 bg-accent/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <h3 className="text-sm font-semibold text-gray-900">Currently Inside</h3>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">{currentlyInside.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {currentlyInside.slice(0, 6).map((visitor, i) => {
              const sConf = STATUS_CONFIG[visitor.status]
              const checkInTime = new Date(visitor.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              return (
                <motion.div key={visitor.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-xl border border-white/80 bg-white p-3 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{visitor.name}</p>
                    <p className="text-[10px] text-gray-500">→ {visitor.visitingStudent} · {visitor.studentRoom}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      In at {checkInTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>
                      {visitor.status}
                    </span>
                    <button className="rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50">
                      Check Out
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search by name, CNIC or student..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Checked In', 'Checked Out', 'Overstay'] as const).map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn('rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Visitor</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">CNIC</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Visiting</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Purpose</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Check In</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Check Out</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Duration</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visitors.map((visitor, i) => {
                const sConf = STATUS_CONFIG[visitor.status]
                const relColor = REL_COLORS[visitor.relationship] ?? 'bg-gray-100 text-gray-600'
                return (
                  <motion.tr key={visitor.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{visitor.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', relColor)}>{visitor.relationship}</span>
                          <span className="text-[10px] text-gray-400">{visitor.visitorId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 font-mono">{visitor.cnic}</td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-gray-900">{visitor.visitingStudent}</p>
                      <p className="text-[10px] text-gray-400">{visitor.studentRoom}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{visitor.purpose}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {new Date(visitor.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {visitor.checkOut ? new Date(visitor.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : <span className="text-primary">Inside</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{visitor.duration ?? '—'}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>
                        {visitor.status}
                      </span>
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

      {/* Log Visitor Modal */}
      <AnimatePresence>
        {showLogModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              {logSuccess ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <QrCode className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Visitor Logged!</p>
                    <p className="text-sm text-gray-500 mt-1">Pass PASS-0501 has been generated.</p>
                  </div>
                  <button onClick={() => { setShowLogModal(false); setLogSuccess(false) }}
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/80">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Log New Visitor</h2>
                    <button onClick={() => setShowLogModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Visitor Name', placeholder: 'Full name', type: 'text' },
                      { label: 'CNIC', placeholder: 'XXXXX-XXXXXXX-X', type: 'text' },
                      { label: 'Phone', placeholder: '03XX-XXXXXXX', type: 'tel' },
                      { label: 'Relationship', placeholder: '', type: 'select' },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>
                        {field.type === 'select' ? (
                          <select className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50">
                            <option>Parent</option><option>Sibling</option><option>Friend</option><option>Relative</option><option>Guardian</option><option>Official</option>
                          </select>
                        ) : (
                          <input type={field.type} placeholder={field.placeholder}
                            className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Visiting Student</label>
                      <input type="text" placeholder="Student name" className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Purpose</label>
                      <select className="h-9 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 shadow-sm outline-none focus:border-primary/50">
                        <option>Family Visit</option><option>Document Collection</option><option>Emergency</option><option>Parent Meeting</option><option>Delivery</option><option>Official Business</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setShowLogModal(false)}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={() => setLogSuccess(true)}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary/80">
                      Log & Generate Pass
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
