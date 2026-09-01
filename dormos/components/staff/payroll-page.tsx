'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Search, Download, Plus, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { PAYROLL_DATA, DEPT_INFO, STAFF_STATS } from '@/lib/mock-data/staff'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  'On Hold': { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', dot: 'bg-rose-500' },
}

const PAGE_SIZE = 15

export function PayrollPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'On Hold'>('all')
  const [deptFilter, setDeptFilter] = useState<'all' | string>('all')
  const [page, setPage] = useState(1)

  const filtered = PAYROLL_DATA.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.employeeId.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || p.paymentStatus === statusFilter
    const matchDept = deptFilter === 'all' || p.department === deptFilter
    return matchSearch && matchStatus && matchDept
  })

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const paidCount = PAYROLL_DATA.filter((p) => p.paymentStatus === 'Paid').length
  const pendingCount = PAYROLL_DATA.filter((p) => p.paymentStatus === 'Pending').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Payroll"
        description="Salaries, allowances, deductions and payment status for all staff."
        icon={Wallet}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Payroll' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Run Payroll
            </button>
          </div>
        }
      />

      <StaffTabs />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Monthly Payroll', value: `Rs ${Math.round(STAFF_STATS.monthlyPayroll / 1000)}K`, sub: 'Total net salaries', color: 'text-violet-600' },
          { label: 'Paid', value: paidCount.toString(), sub: 'Completed transfers', color: 'text-emerald-600' },
          { label: 'Pending', value: pendingCount.toString(), sub: 'Awaiting payment', color: 'text-amber-600' },
          { label: 'Avg Net Salary', value: `Rs ${Math.round(STAFF_STATS.monthlyPayroll / STAFF_STATS.totalStaff).toLocaleString()}`, sub: 'Per employee', color: 'text-primary' },
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
              <TrendingUp className="h-4 w-4 text-gray-200" />
            </div>
            <p className={cn('mt-1 text-xl font-bold', card.color)}>{card.value}</p>
            <p className="mt-0.5 text-[10px] text-gray-400">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search employee or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 shadow-sm outline-none focus:border-primary/50"
        >
          <option value="all">All Departments</option>
          {DEPT_INFO.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Paid', 'Pending', 'On Hold'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Basic</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Allowances</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Bonus</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Deductions</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Tax</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Net Salary</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Payment</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((p) => {
                const conf = STATUS_CONFIG[p.paymentStatus]
                return (
                  <motion.tr key={p.employeeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={p.name} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.designation} · {p.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{p.salary.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{p.allowances.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{p.bonus ? `+${p.bonus.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-3 text-xs text-rose-500">{p.deductions ? `−${p.deductions.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-3 text-xs text-amber-600">{p.tax ? `${p.tax.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-3 text-xs font-bold text-gray-900">Rs {p.netSalary.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', conf.dot)} />
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{p.paymentDate ? formatDate(p.paymentDate) : '—'}</td>
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
