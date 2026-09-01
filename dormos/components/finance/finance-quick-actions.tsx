import Link from 'next/link'
import {
  FileText,
  CreditCard,
  Receipt,
  FileDown,
  BellRing,
  type LucideIcon,
} from 'lucide-react'

const QUICK_ACTIONS: { label: string; description: string; href: string; icon: LucideIcon }[] = [
  {
    label: 'Generate Invoice',
    description: 'Create a new fee invoice',
    href: '/dashboard/finance/invoices',
    icon: FileText,
  },
  {
    label: 'Record Payment',
    description: 'Log an incoming fee payment',
    href: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    label: 'Create Expense',
    description: 'Add an expense entry',
    href: '/dashboard/finance/expenses',
    icon: Receipt,
  },
  {
    label: 'Export Report',
    description: 'Download financial reports',
    href: '/dashboard/finance/reports',
    icon: FileDown,
  },
  {
    label: 'Send Reminder',
    description: 'Notify students of dues',
    href: '/dashboard/finance/invoices',
    icon: BellRing,
  },
]

export function FinanceQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-start gap-2.5 rounded-2xl border border-gray-200/70 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">{action.label}</span>
              <span className="block text-xs text-gray-400">{action.description}</span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
