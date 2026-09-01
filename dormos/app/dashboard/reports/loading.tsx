import { Skeleton } from '@/components/ui/skeleton'
import { CardGridSkeleton } from '@/components/shared/skeletons'

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-36 rounded bg-gray-200" />
            <div className="h-3 w-60 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
      <CardGridSkeleton count={8} />
    </div>
  )
}
