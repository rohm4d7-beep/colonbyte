import { Skeleton } from '@/components/ui/skeleton'

export default function AuditLogsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-80 max-w-full rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
