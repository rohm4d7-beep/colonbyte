import type { Metadata } from 'next'
import { RoomForm } from '@/components/rooms/room-form'
import { PageHeader } from '@/components/shared/page-header'
import { DoorOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Add Room — DormOS',
}

export default function AddRoomRoute() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Add Room"
        description="Configure a new room and add it to the hostel inventory."
        icon={DoorOpen}
        crumbs={[{ label: 'Rooms', href: '/dashboard/rooms' }, { label: 'Add' }]}
      />
      <RoomForm mode="add" />
    </div>
  )
}
