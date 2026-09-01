'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UsersRound, CalendarDays, Plane, Wallet, Building2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STAFF_TABS: { label: string; href: string; icon: LucideIcon; exact?: boolean }[] = [
  { label: 'Overview', href: '/dashboard/staff', icon: LayoutDashboard, exact: true },
  { label: 'Employees', href: '/dashboard/staff/employees', icon: UsersRound },
  { label: 'Attendance', href: '/dashboard/staff/attendance', icon: CalendarDays },
  { label: 'Leaves', href: '/dashboard/staff/leaves', icon: Plane },
  { label: 'Payroll', href: '/dashboard/staff/payroll', icon: Wallet },
  { label: 'Departments', href: '/dashboard/staff/departments', icon: Building2 },
]

export function StaffTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-200/70 bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STAFF_TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none',
              active
                ? 'bg-accent text-primary shadow-sm shadow-primary/5'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
