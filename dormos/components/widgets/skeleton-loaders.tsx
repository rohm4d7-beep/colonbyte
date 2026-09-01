import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-3 h-7 w-28" />
          <Skeleton className="mt-2.5 h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  )
}

export function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-1.5 h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-52 w-full" />
    </div>
  )
}

export function ListCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="mt-1.5 h-2.5 w-2/5" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" />
        <ChartCardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ListCardSkeleton />
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
    </div>
  )
}
