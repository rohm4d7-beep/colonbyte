import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12',
        className,
      )}
    >
      {children}
    </div>
  )
}
