'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, Search, Check, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { LEAVE_REQUESTS, DEPT_INFO } from '@/lib/mock-data/staff'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', dot: 'bg-rose-500' },
}

const TYPE_CONFIG: Record<string, string> = {
  Annual: 'bg-accent text-primary',
  Sick: 'bg-rose-50 text-rose-700',
  Emergency: 'bg-amber-50 text-amber-700',
  Casual: 'bg-violet-50 text-violet-700',
}

export function LeavesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all')
  const [deptFilter, setDeptFilter] = useState<'all' | string>('all')

  const filtered = LEAVE_REQUESTS.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.employeeName.toLowerCase().includes(q) || l.employeeId.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchDept = deptFilter === 'all' || l.department === deptFilter
    return matchSearch && matchStatus && matchDept
  })

  const pending = LEAVE_REQUESTS.filter((l) => l.status === 'Pending').length
  const approved = LEAVE_REQUESTS.filter((l) => l.status === 'Approved').length
  const totalDays = LEAVE_REQUESTS.filter((l) => l.status === 'Approved').reduce((s, l) => s + l.days, 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Leave Requests"
        description="Review and manage staff leave applications."
        icon={Plane}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Leaves' }]}
      />

      <StaffTabs />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending Approval', value: pending.toString(), color: 'text-amber-600' },
          { label: 'Approved', value: approved.toString(), color: 'text-emerald-600' },
          { label: 'Leave Days Granted', value: totalDays.toString(), color: 'text-primary' },
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
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 shadow-sm outline-none focus:border-primary/50"
        >
          <option value="all">All Departments</option>
          {DEPT_INFO.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Employee</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">From</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">To</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Days</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Reason</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((leave) => {
                const conf = STATUS_CONFIG[leave.status]
                return (
                  <motion.tr key={leave.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={leave.employeeName} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{leave.employeeName}</p>
                          <p className="text-[10px] text-gray-400">{leave.designation} · {leave.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', TYPE_CONFIG[leave.leaveType])}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{formatDate(leave.from)}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{formatDate(leave.to)}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-900">{leave.days}d</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[220px] truncate">{leave.reason}</td>
                    <td className="px-3 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', conf.dot)} />
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {leave.status === 'Pending' ? (
                        <div className="flex gap-1">
                          <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"><Check className="h-3 w-3" /></button>
                          <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-5 py-12 text-center text-xs text-gray-400">No leave requests found.</div>}
      </div>
    </div>
  )
}
