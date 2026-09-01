import Link from 'next/link'
import type { QuickAction } from '@/types/dashboard'

export function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon
  return (
    <Link
      href={action.href}
      className="group flex flex-col items-start gap-2 rounded-xl border border-gray-100 bg-white p-3.5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary transition-all duration-150 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-900">
          {action.label}
        </span>
        <span className="block text-xs text-gray-400">{action.description}</span>
      </span>
    </Link>
  )
}
