'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { RoomForm } from '@/components/rooms/room-form'
import { fetchRoom } from '@/lib/rooms-api'
import { ROOMS_BY_ID } from '@/lib/mock-data'
import type { Room } from '@/types/dorm'

export function RoomEditPage({ roomId }: { roomId: string }) {
  const mockRoom = ROOMS_BY_ID.get(roomId)
  const [room, setRoom] = useState<Room | null>(mockRoom ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetchRoom(roomId)
      .then(({ room: liveRoom }) => setRoom(liveRoom))
      .catch(() => {
        if (!mockRoom) setFailed(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  if (failed) notFound()
  if (!room) return null

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Edit Room ${room.number}`}
        description="Update the configuration for this room."
        icon={Pencil}
        crumbs={[
          { label: 'Rooms', href: '/dashboard/rooms' },
          { label: room.number, href: `/dashboard/rooms/${room.id}` },
          { label: 'Edit' },
        ]}
      />
      <RoomForm mode="edit" room={room} />
    </div>
  )
}
