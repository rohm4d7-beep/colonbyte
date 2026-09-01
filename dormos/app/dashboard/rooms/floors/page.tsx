import type { Metadata } from 'next'
import { RoomsFloorPage } from '@/components/rooms/rooms-floor-page'

export const metadata: Metadata = {
  title: 'Floor View — DormOS',
  description: 'Visual overview of rooms and occupancy per floor.',
}

export default function RoomsFloorRoute() {
  return <RoomsFloorPage />
}
