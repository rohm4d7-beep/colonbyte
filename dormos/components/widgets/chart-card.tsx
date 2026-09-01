import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
  delay?: number
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={cn('min-h-0 flex-1', contentClassName)}>{children}</div>
    </div>
  )
}
