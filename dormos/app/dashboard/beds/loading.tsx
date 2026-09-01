import { AnalyticsSkeleton } from '@/components/shared/skeletons'

export default function BedsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-3 w-56 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <AnalyticsSkeleton />
      <div className="rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm">
        <div className="h-8 w-72 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 16 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
