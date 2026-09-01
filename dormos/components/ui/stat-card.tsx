import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, change, positive = true, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-primary">
            {icon}
          </span>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {change && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              positive ? 'text-emerald-600' : 'text-red-500',
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
    </div>
  )
}
