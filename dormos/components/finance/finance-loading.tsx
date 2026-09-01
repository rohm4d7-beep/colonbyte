import { Skeleton } from '@/components/ui/skeleton'

export function FinancePageSkeleton() {
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
      <div className="flex items-center gap-1 overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-1.5 shadow-sm">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="mt-3 h-3 w-24" />
            <Skeleton className="mt-1.5 h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-24" />
            <Skeleton className="mt-5 h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceTablePageSkeleton() {
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
      <div className="flex items-center gap-1 overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-1.5 shadow-sm">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 shrink-0 rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-44" />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/95 text-xs">
              {Array.from({ length: 7 }).map((_, index) => (
                <th key={index} className="px-3 py-2.5 text-left">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-50 last:border-b-0">
                {Array.from({ length: 7 }).map((_, columnIndex) => (
                  <td key={columnIndex} className="px-3 py-3">
                    <div className="h-3.5 w-20 rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
