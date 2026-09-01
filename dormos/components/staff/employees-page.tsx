'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UsersRound, Search, Plus, Download, Mail, Phone } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { EMPLOYEES, DEPT_INFO } from '@/lib/mock-data/staff'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  'On Leave': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  Resigned: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-400/20', dot: 'bg-gray-400' },
  Suspended: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', dot: 'bg-rose-500' },
}

const PAGE_SIZE = 15

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'On Leave' | 'Resigned' | 'Suspended'>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return EMPLOYEES.filter((e) => {
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q) || e.phone.includes(q)
      const matchDept = deptFilter === 'all' || e.department === deptFilter
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchDept && matchStatus
    })
  }, [search, deptFilter, statusFilter])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const employees = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeCount = EMPLOYEES.filter((e) => e.status === 'Active').length
  const onLeaveCount = EMPLOYEES.filter((e) => e.status === 'On Leave').length
  const avgRate = Math.round(EMPLOYEES.reduce((s, e) => s + e.attendanceRate, 0) / EMPLOYEES.length * 10) / 10

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Employees"
        description="Browse staff profiles, designations and employment details."
        icon={UsersRound}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Employees' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Add Employee
            </button>
          </div>
        }
      />

      <StaffTabs />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Employees', value: EMPLOYEES.length.toString(), color: 'text-primary' },
          { label: 'Active', value: activeCount.toString(), color: 'text-emerald-600' },
          { label: 'Avg Attendance', value: `${avgRate}%`, color: 'text-violet-600' },
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
            {card.label === 'Active' && <p className="mt-0.5 text-[10px] text-gray-400">{onLeaveCount} on leave</p>}
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name, ID, designation or phone..."
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
          {(['all', 'Active', 'On Leave', 'Resigned'] as const).map((s) => (
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
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Department</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Designation</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Contact</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Salary</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Attendance</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp, i) => {
                const conf = STATUS_CONFIG[emp.status]
                return (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/staff/employees/${emp.id}`} className="flex items-center gap-3 group">
                        <AvatarInitials name={emp.name} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-primary transition-colors">{emp.name}</p>
                          <p className="text-[10px] font-mono text-gray-400">{emp.employeeId}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{emp.department}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{emp.designation}</td>
                    <td className="px-3 py-3">
                      <p className="flex items-center gap-1 text-xs text-gray-600"><Phone className="h-3 w-3 text-gray-300" />{emp.phone}</p>
                      <p className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5"><Mail className="h-3 w-3 text-gray-300" />{emp.email}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(emp.joiningDate)}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-900">Rs {emp.salary.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
                          <div className={cn('h-full rounded-full', emp.attendanceRate >= 95 ? 'bg-emerald-500' : emp.attendanceRate >= 90 ? 'bg-primary' : 'bg-amber-500')} style={{ width: `${emp.attendanceRate}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{emp.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', conf.dot)} />
                        {emp.status}
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
    </div>
  )
}
