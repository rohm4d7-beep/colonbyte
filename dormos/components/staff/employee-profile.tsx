'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, MapPin, BadgeCheck, CalendarDays, Wallet, ListChecks, BriefcaseBusiness, IdCard } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { EMPLOYEES, ATTENDANCE_LOGS } from '@/lib/mock-data/staff'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  'On Leave': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Resigned: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-400/20' },
  Suspended: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const ATTENDANCE_CONFIG = {
  Present: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Late: { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Half Day': { bg: 'bg-accent', text: 'text-primary' },
  Absent: { bg: 'bg-rose-50', text: 'text-rose-700' },
  Leave: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export function EmployeeProfilePage({ employeeId }: { employeeId: string }) {
  const employee = useMemo(() => EMPLOYEES.find((e) => e.id === employeeId), [employeeId])

  const recentAttendance = useMemo(
    () => (employee ? ATTENDANCE_LOGS.filter((l) => l.employeeId === employee.id).slice(-14).reverse() : []),
    [employee],
  )

  if (!employee) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Employee not found" icon={BriefcaseBusiness} crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Employees', href: '/dashboard/staff/employees' }, { label: 'Not found' }]} />
        <div className="rounded-2xl border border-gray-200/70 bg-white p-8 text-center text-sm text-gray-500">No employee matches this ID.</div>
      </div>
    )
  }

  const conf = STATUS_CONFIG[employee.status]
  const presentCount = recentAttendance.filter((l) => l.status === 'Present' || l.status === 'Late').length
  const leaveDays = employee.leaveBalance
  const monthlyNet = employee.salary + employee.allowances

  const infoRows = [
    { icon: IdCard, label: 'Employee ID', value: employee.employeeId, mono: true },
    { icon: BriefcaseBusiness, label: 'Designation', value: employee.designation },
    { icon: BriefcaseBusiness, label: 'Department', value: employee.department },
    { icon: CalendarDays, label: 'Joining Date', value: formatDate(employee.joiningDate) },
    { icon: Phone, label: 'Phone', value: employee.phone, mono: true },
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: IdCard, label: 'CNIC', value: employee.cnic, mono: true },
    { icon: MapPin, label: 'Address', value: employee.address },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={employee.name}
        description={`${employee.designation} · ${employee.department}`}
        icon={BriefcaseBusiness}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Employees', href: '/dashboard/staff/employees' }, { label: employee.name }]}
        actions={
          <Link href="/dashboard/staff/employees" className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <AvatarInitials name={employee.name} size="lg" className="h-20 w-20 text-2xl" />
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{employee.name}</p>
              <p className="text-xs text-gray-500">{employee.designation}</p>
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
              {employee.status}
            </span>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
            <div className="text-center">
              <p className="text-base font-bold text-primary">{employee.attendanceRate}%</p>
              <p className="text-[10px] text-gray-400">Attendance</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-base font-bold text-amber-600">{leaveDays}</p>
              <p className="text-[10px] text-gray-400">Leave Balance</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-emerald-600">{presentCount}/{recentAttendance.length}</p>
              <p className="text-[10px] text-gray-400">Present (14d)</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            {[
              { icon: Wallet, label: 'Basic Salary', value: `Rs ${employee.salary.toLocaleString()}`, color: 'text-gray-900' },
              { icon: Wallet, label: 'Allowances', value: `Rs ${employee.allowances.toLocaleString()}`, color: 'text-gray-900' },
              { icon: BadgeCheck, label: 'Monthly Gross', value: `Rs ${monthlyNet.toLocaleString()}`, color: 'text-emerald-600' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl bg-gray-50/70 px-3 py-2">
                <span className="flex items-center gap-2 text-xs text-gray-500"><row.icon className="h-3.5 w-3.5 text-gray-400" />{row.label}</span>
                <span className={cn('text-xs font-semibold', row.color)}>{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Details + attendance */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Info grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"><BriefcaseBusiness className="h-4 w-4 text-primary" /></span>
              <h3 className="text-sm font-semibold text-gray-900">Personal & Employment Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-gray-100 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    <row.icon className="h-3 w-3" />{row.label}
                  </p>
                  <p className={cn('mt-1 text-xs font-semibold text-gray-900', row.mono && 'font-mono')}>{row.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent attendance */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50"><CalendarDays className="h-4 w-4 text-emerald-600" /></span>
                <h3 className="text-sm font-semibold text-gray-900">Recent Attendance</h3>
              </div>
              <Link href="/dashboard/staff/attendance" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {recentAttendance.map((log) => {
                const attConf = ATTENDANCE_CONFIG[log.status]
                const date = new Date(log.date)
                return (
                  <div key={log.id} title={`${log.status} · ${formatDate(log.date)}`}
                    className="flex flex-col items-center gap-1 rounded-lg border border-gray-100 p-2 text-center transition-colors hover:border-gray-200">
                    <span className="text-[10px] font-semibold text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', attConf.bg, attConf.text)}>
                      {log.status === 'Present' ? 'P' : log.status === 'Late' ? 'L' : log.status === 'Half Day' ? 'HD' : log.status === 'Absent' ? 'A' : 'LV'}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Assigned tasks */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50"><ListChecks className="h-4 w-4 text-violet-600" /></span>
              <h3 className="text-sm font-semibold text-gray-900">Assigned Tasks</h3>
            </div>
            {employee.assignedTasks.length > 0 ? (
              <div className="flex flex-col divide-y divide-gray-50">
                {employee.assignedTasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500">{i + 1}</span>
                    <p className="flex-1 text-xs text-gray-700">{task}</p>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">Assigned</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No tasks assigned.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
