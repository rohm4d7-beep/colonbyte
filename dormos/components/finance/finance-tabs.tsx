'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wallet,
  CreditCard,
  FileText,
  Receipt,
  RefreshCcw,
  LayoutGrid,
  GraduationCap,
  Percent,
  Undo2,
  ArrowRightLeft,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FINANCE_TABS: { label: string; href: string; icon: LucideIcon; match?: string }[] = [
  { label: 'Overview', href: '/dashboard/finance', icon: Wallet },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Invoices', href: '/dashboard/finance/invoices', icon: FileText, match: '/dashboard/finance/invoices' },
  { label: 'Expenses', href: '/dashboard/finance/expenses', icon: Receipt },
  { label: 'Recurring', href: '/dashboard/finance/recurring', icon: RefreshCcw },
  { label: 'Fee Plans', href: '/dashboard/finance/fee-plans', icon: LayoutGrid },
  { label: 'Scholarships', href: '/dashboard/finance/scholarships', icon: GraduationCap },
  { label: 'Discounts', href: '/dashboard/finance/discounts', icon: Percent },
  { label: 'Refunds', href: '/dashboard/finance/refunds', icon: Undo2 },
  { label: 'Transactions', href: '/dashboard/finance/transactions', icon: ArrowRightLeft },
  { label: 'Reports', href: '/dashboard/finance/reports', icon: BarChart3 },
]

export function FinanceTabs() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-200/70 bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FINANCE_TABS.map((tab) => {
        const active = tab.match ? pathname.startsWith(tab.match) : pathname === tab.href
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
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
