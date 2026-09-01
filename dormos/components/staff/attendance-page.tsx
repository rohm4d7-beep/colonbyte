'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { ATTENDANCE_LOGS, DEPT_INFO } from '@/lib/mock-data/staff'
import { formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Present: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', label: 'Present' },
  Late: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', label: 'Late' },
  'Half Day': { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20', label: 'Half Day' },
  Absent: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', label: 'Absent' },
  Leave: { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-400/20', label: 'Leave' },
}

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AttendancePage() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [deptFilter, setDeptFilter] = useState<'all' | string>('all')
  const [search, setSearch] = useState('')

  const logs = useMemo(() => {
    const q = search.toLowerCase()
    return ATTENDANCE_LOGS.filter((l) => {
      const matchDept = deptFilter === 'all' || l.department === deptFilter
      const matchSearch = !q || l.employeeName.toLowerCase().includes(q)
      return matchDept && matchSearch
    })
  }, [deptFilter, search])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const daySummary = Array.from({ length: daysInMonth }, (_, i) => {
    const iso = new Date(year, month, i + 1).toISOString().slice(0, 10)
    const dayLogs = logs.filter((l) => l.date === iso)
    const present = dayLogs.filter((l) => l.status === 'Present' || l.status === 'Late').length
    const absent = dayLogs.filter((l) => l.status === 'Absent').length
    const leave = dayLogs.filter((l) => l.status === 'Leave').length
    const half = dayLogs.filter((l) => l.status === 'Half Day').length
    return { day: i + 1, iso, present, absent, leave, half, total: dayLogs.length }
  })

  const todayLogs = logs.filter((l) => l.date === new Date().toISOString().slice(0, 10))
  const summary = {
    present: todayLogs.filter((l) => l.status === 'Present' || l.status === 'Late').length,
    late: todayLogs.filter((l) => l.status === 'Late').length,
    absent: todayLogs.filter((l) => l.status === 'Absent').length,
    half: todayLogs.filter((l) => l.status === 'Half Day').length,
    leave: todayLogs.filter((l) => l.status === 'Leave').length,
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(viewDate)
    d.setMonth(d.getMonth() + delta)
    setViewDate(d)
  }

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Attendance"
        description="Track daily staff presence with calendar and status views."
        icon={CalendarDays}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Attendance' }]}
      />

      <StaffTabs />

      {/* Today summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {([
          { label: 'Present', value: summary.present, conf: STATUS_CONFIG.Present },
          { label: 'Late', value: summary.late, conf: STATUS_CONFIG.Late },
          { label: 'Half Day', value: summary.half, conf: STATUS_CONFIG['Half Day'] },
          { label: 'Absent', value: summary.absent, conf: STATUS_CONFIG.Absent },
          { label: 'Leave', value: summary.leave, conf: STATUS_CONFIG.Leave },
        ] as const).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">Today · {item.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
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
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"><CalendarDays className="h-4 w-4 text-primary" /></span>
            <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => shiftMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button onClick={() => setViewDate(new Date())} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">Today</button>
            <button onClick={() => shiftMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_KEYS.map((d) => (
              <div key={d} className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
            {daySummary.map((d) => {
              const isToday = d.iso === new Date().toISOString().slice(0, 10)
              const dominant = d.present === d.total ? 'present' : d.absent > d.leave ? 'absent' : d.leave > 0 ? 'leave' : 'mixed'
              return (
                <div
                  key={d.day}
                  title={`${formatDateShort(d.iso)} — P:${d.present} L:${d.leave} A:${d.absent}`}
                  className={cn(
                    'flex h-16 flex-col items-center justify-center rounded-xl border transition-colors',
                    isToday ? 'border-primary/35 bg-accent/50 ring-1 ring-primary/20' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <span className={cn('text-xs font-semibold', isToday ? 'text-primary' : 'text-gray-600')}>{d.day}</span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-gray-400">{d.present}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {d.absent > 0 && <span className="text-[9px] text-rose-500">{d.absent}A</span>}
                    {d.leave > 0 && <span className="text-[9px] text-gray-400">{d.leave}L</span>}
                    {dominant === 'mixed' && d.half > 0 && <span className="text-[9px] text-primary">{d.half}HD</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Attendance Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Employee', 'Department', 'Date', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.slice(0, 30).map((log) => {
                const conf = STATUS_CONFIG[log.status]
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <AvatarInitials name={log.employeeName} size="sm" />
                        <p className="text-xs font-semibold text-gray-900">{log.employeeName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{log.department}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{formatDateShort(log.date)}</td>
                    <td className="px-5 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                        {conf.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && <div className="px-5 py-12 text-center text-xs text-gray-400">No attendance records found.</div>}
      </div>
    </div>
  )
}
