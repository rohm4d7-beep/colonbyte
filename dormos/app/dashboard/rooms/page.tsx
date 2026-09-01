import type { Metadata } from 'next'
import { RoomsListPage } from '@/components/rooms/rooms-list'

export const metadata: Metadata = {
  title: 'Rooms — DormOS',
  description: 'Manage rooms, beds, cleaning and maintenance across all floors.',
}

export default function RoomsPage() {
  return <RoomsListPage />
}
