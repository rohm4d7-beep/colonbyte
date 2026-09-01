import { Skeleton } from '@/components/ui/skeleton'

export default function AiAssistantLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-3 w-72 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 flex-1 rounded-lg" />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="ml-auto h-16 w-2/3 rounded-2xl rounded-tr-sm" />
          <Skeleton className="h-16 w-1/2 rounded-2xl rounded-tl-sm" />
          <Skeleton className="ml-auto h-24 w-3/4 rounded-2xl rounded-tr-sm" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  )
}
