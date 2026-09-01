import type { Metadata } from 'next'
import { RoomDetailsPage } from '@/components/rooms/room-details-page'
import { ROOMS_BY_ID } from '@/lib/mock-data'

interface RoomDetailsRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: RoomDetailsRouteProps): Promise<Metadata> {
  const { id } = await params
  const room = ROOMS_BY_ID.get(id)
  return {
    title: room ? `Room ${room.number} — DormOS` : 'Room — DormOS',
  }
}

export default async function RoomDetailsRoute({
  params,
}: RoomDetailsRouteProps) {
  const { id } = await params
  return <RoomDetailsPage roomId={id} />
}
