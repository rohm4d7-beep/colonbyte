import { AnalyticsSkeleton, TableSkeleton } from '@/components/shared/skeletons'
import { DataTableToolbarSkeleton } from '@/components/shared/data-table'

export default function StudentsLoading() {
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
      <DataTableToolbarSkeleton />
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
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
            <TableSkeleton rows={8} columns={7} />
          </tbody>
        </table>
      </div>
    </div>
  )
}
