import { Skeleton } from '@/components/ui/skeleton'
import { ProfileSkeleton } from '@/components/shared/skeletons'

export default function SettingsLoading() {
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
      <div className="flex items-center gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-9 flex-1 rounded-lg" />
        ))}
      </div>
      <ProfileSkeleton />
    </div>
  )
}
