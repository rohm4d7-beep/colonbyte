'use client'

import { motion } from 'framer-motion'
import { Building2, Plus, UsersRound, Wallet, UserCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StaffTabs } from './staff-tabs'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { DEPT_INFO, EMPLOYEES } from '@/lib/mock-data/staff'
import { cn } from '@/lib/utils'

const DEPT_ACCENTS: Record<string, { icon: string; bg: string; border: string; text: string }> = {
  Warden: { icon: 'bg-accent', bg: 'from-primary to-primary', border: 'border-primary/25', text: 'text-primary' },
  Reception: { icon: 'bg-accent', bg: 'from-primary to-primary', border: 'border-primary/25', text: 'text-primary' },
  Security: { icon: 'bg-rose-50', bg: 'from-rose-500 to-rose-600', border: 'border-rose-200', text: 'text-rose-600' },
  Kitchen: { icon: 'bg-amber-50', bg: 'from-amber-500 to-amber-600', border: 'border-amber-200', text: 'text-amber-600' },
  Cleaning: { icon: 'bg-emerald-50', bg: 'from-emerald-500 to-emerald-600', border: 'border-emerald-200', text: 'text-emerald-600' },
  Maintenance: { icon: 'bg-orange-50', bg: 'from-orange-500 to-orange-600', border: 'border-orange-200', text: 'text-orange-600' },
  Administration: { icon: 'bg-violet-50', bg: 'from-violet-500 to-violet-600', border: 'border-violet-200', text: 'text-violet-600' },
}

export function DepartmentsPage() {
  const totalBudget = DEPT_INFO.reduce((s, d) => s + d.budget, 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Departments"
        description="Organizational structure, heads and budgets across all departments."
        icon={Building2}
        crumbs={[{ label: 'Staff', href: '/dashboard/staff' }, { label: 'Departments' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            Add Department
          </button>
        }
      />

      <StaffTabs />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Departments', value: DEPT_INFO.length.toString(), icon: Building2 },
          { label: 'Total Staff', value: EMPLOYEES.length.toString(), icon: UsersRound },
          { label: 'Total Budget', value: `Rs ${Math.round(totalBudget / 1000)}K`, icon: Wallet },
          { label: 'Active Staff', value: EMPLOYEES.filter((e) => e.status === 'Active').length.toString(), icon: UserCircle2 },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50"><card.icon className="h-4 w-4 text-gray-500" /></span>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEPT_INFO.map((dept, i) => {
          const accent = DEPT_ACCENTS[dept.name]
          const members = EMPLOYEES.filter((e) => e.department === dept.name)
          const active = members.filter((m) => m.status === 'Active').length
          return (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={cn('bg-gradient-to-r p-4 text-white', accent.bg)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{dept.name} Department</p>
                    <p className="text-[11px] opacity-80">{members.length} members · {active} active</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50/70 p-3">
                  <AvatarInitials name={dept.head} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900">Head: {dept.head}</p>
                    <p className="text-[10px] text-gray-400">{dept.headDesignation}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-gray-500">{dept.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Wallet className="h-3.5 w-3.5 text-gray-300" />
                    Monthly Budget
                  </div>
                  <span className="text-xs font-bold text-gray-900">Rs {dept.budget.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
