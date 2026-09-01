'use client'

import type { Room } from '@/types/dorm'
import { RoomCard } from '@/components/rooms/room-card'
import { EmptyState } from '@/components/widgets/empty-state'
import { cn } from '@/lib/utils'

export function RoomGrid({
  rooms,
  className,
  columns = 4,
}: {
  rooms: Room[]
  className?: string
  columns?: 3 | 4 | 5
}) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        title="No rooms found"
        description="No rooms match the current filters."
      />
    )
  }

  const gridCols =
    columns === 5
      ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5'
      : columns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:gap-4', gridCols, className)}>
      {rooms.map((room, index) => (
        <RoomCard key={room.id} room={room} index={index} />
      ))}
    </div>
  )
}
