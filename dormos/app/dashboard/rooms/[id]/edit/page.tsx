import type { Metadata } from 'next'
import { RoomEditPage } from '@/components/rooms/room-edit-page'
import { ROOMS_BY_ID } from '@/lib/mock-data'

interface EditRoomRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EditRoomRouteProps): Promise<Metadata> {
  const { id } = await params
  const room = ROOMS_BY_ID.get(id)
  return {
    title: room ? `Edit Room ${room.number} — DormOS` : 'Edit Room — DormOS',
  }
}

export default async function EditRoomRoute({ params }: EditRoomRouteProps) {
  const { id } = await params
  return <RoomEditPage roomId={id} />
}
