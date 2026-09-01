import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-50 last:border-b-0">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-3 py-3">
              <Skeleton
                className={cn(
                  'h-3.5',
                  columnIndex === 0 ? 'w-24' : columnIndex % 3 === 0 ? 'w-16' : 'w-20',
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function AnalyticsSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="mt-3 h-3 w-20" />
          <Skeleton className="mt-1.5 h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-3.5 w-32" />
            <Skeleton className="mt-2 h-3.5 w-40" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm lg:col-span-2">
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-3 w-14" />
                <Skeleton className="mt-1.5 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <Skeleton className="h-4 w-32" />
          <div className="mt-4 flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto max-w-3xl rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <Skeleton className="h-6 w-56" />
      <Skeleton className="mt-2 h-3.5 w-72" />
      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 flex-1 rounded-lg" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-8 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  )
}
