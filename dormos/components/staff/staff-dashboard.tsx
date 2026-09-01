'use client'

import { motion } from 'framer-motion'
import { UsersRound, UserCheck, Plane, Wallet, CalendarDays, TrendingUp, Plus, Download } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { ATTENDANCE_LOGS, LEAVE_REQUESTS, PAYROLL_DATA, DEPT_INFO, STAFF_STATS } from '@/lib/mock-data/staff'
import { formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'

const DEPT_ICONS: Record<string, string> = {
  Warden: 'bg-accent text-primary',
  Reception: 'bg-accent text-primary',
  Security: 'bg-rose-50 text-rose-600',
  Kitchen: 'bg-amber-50 text-amber-600',
  Cleaning: 'bg-emerald-50 text-emerald-600',
  Maintenance: 'bg-orange-50 text-orange-600',
  Administration: 'bg-violet-50 text-violet-600',
}

const DEPT_BAR_COLORS = ['var(--color-chart-1)', 'var(--color-chart-6)', 'var(--color-chart-5)', 'var(--color-chart-3)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)']

const LEAVE_STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const attendanceByDept = DEPT_INFO.map((dept, i) => {
  const deptLogs = ATTENDANCE_LOGS.filter((l) => l.department === dept.name)
  const present = deptLogs.filter((l) => l.status === 'Present' || l.status === 'Late').length
  const absent = deptLogs.filter((l) => l.status === 'Absent' || l.status === 'Leave').length
  const half = deptLogs.filter((l) => l.status === 'Half Day').length
  return {
    name: dept.name,
    present,
    absent,
    half,
    fill: DEPT_BAR_COLORS[i % DEPT_BAR_COLORS.length],
  }
})

const payrollByDept = DEPT_INFO.map((dept) => ({
  name: dept.name,
  value: PAYROLL_DATA.filter((p) => p.department === dept.name).reduce((s, p) => s + p.netSalary, 0),
}))

const recentLeaves = [...LEAVE_REQUESTS]
  .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
  .slice(0, 8)

const PIE_COLORS = ['var(--color-chart-1)', 'var(--color-chart-6)', 'var(--color-chart-5)', 'var(--color-chart-3)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)']

export function StaffDashboardPage() {
  const analytics: AnalyticsItem[] = [
    { id: 'total', label: 'Total Staff', value: STAFF_STATS.totalStaff.toString(), sub: 'Across 7 departments', icon: UsersRound, accent: 'blue' },
    { id: 'active', label: 'Active Today', value: STAFF_STATS.activeStaff.toString(), sub: 'Currently employed', icon: UserCheck, accent: 'emerald' },
    { id: 'onleave', label: 'On Leave', value: STAFF_STATS.onLeave.toString(), sub: 'Not on duty', icon: Plane, accent: 'amber' },
    { id: 'pending', label: 'Pending Leaves', value: STAFF_STATS.pendingLeaves.toString(), sub: 'Awaiting approval', icon: CalendarDays, accent: 'rose', trend: { value: `${STAFF_STATS.pendingLeaves} new`, positive: false } },
    { id: 'payroll', label: 'Monthly Payroll', value: `Rs ${Math.round(STAFF_STATS.monthlyPayroll / 1000)}K`, sub: 'Total net salaries', icon: Wallet, accent: 'violet' },
    { id: 'attendance', label: 'Avg Attendance', value: `${STAFF_STATS.avgAttendance}%`, sub: 'Last 30 days', icon: TrendingUp, accent: 'cyan' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Staff Management"
        description="Manage employees, attendance, leaves, payroll and departments."
        icon={UsersRound}
        crumbs={[{ label: 'Staff' }]}
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

      <AnalyticsCards items={analytics} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Attendance by Department" subtitle="Present vs absent over last 30 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceByDept} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="present" name="Present" stackId="a" fill="var(--color-chart-2)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="half" name="Half Day" stackId="a" fill="var(--color-chart-3)" />
              <Bar dataKey="absent" name="Absent" stackId="a" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payroll by Department" subtitle="Monthly net salary distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={payrollByDept} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" nameKey="name" paddingAngle={2}>
                {payrollByDept.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`Rs ${Number(v).toLocaleString()}`, 'Payroll']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {payrollByDept.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Departments + Recent Leaves */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Department cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-2">
          {DEPT_INFO.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', DEPT_ICONS[dept.name])}>
                  <span className="text-xs font-bold">{dept.name.slice(0, 1)}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900">{dept.name}</p>
                  <p className="truncate text-[10px] text-gray-400">{dept.head}</p>
                </div>
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                  {dept.count}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-gray-500">{dept.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
                <span className="text-[10px] text-gray-400">Budget</span>
                <span className="text-xs font-semibold text-gray-700">Rs {dept.budget.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent leave requests */}
        <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Leave Requests</h3>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {recentLeaves.map((leave) => {
              const conf = LEAVE_STATUS_CONFIG[leave.status]
              return (
                <div key={leave.id} className="flex items-center gap-3 px-5 py-3">
                  <AvatarInitials name={leave.employeeName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-900">{leave.employeeName}</p>
                    <p className="truncate text-[10px] text-gray-400">{leave.leaveType} · {leave.days}d · {formatDateShort(leave.from)}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                    {leave.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Attendance trend */}
      <ChartCard title="Weekly Attendance Trend" subtitle="Total staff on duty per day (last 14 days)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={Array.from({ length: 14 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (13 - i))
            const iso = date.toISOString().slice(0, 10)
            const logs = ATTENDANCE_LOGS.filter((l) => l.date === iso)
            const present = logs.filter((l) => l.status === 'Present' || l.status === 'Late').length
            return {
              day: date.toLocaleDateString('en-US', { weekday: 'short' }),
              present,
            }
          })}>
            <defs>
              <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Area type="monotone" dataKey="present" name="On Duty" stroke="var(--color-chart-4)" strokeWidth={2} fill="url(#staffGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
