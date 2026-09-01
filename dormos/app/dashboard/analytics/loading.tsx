import { AnalyticsSkeleton } from '@/components/shared/skeletons'

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-44 rounded bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <AnalyticsSkeleton count={6} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-4 h-48 rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
