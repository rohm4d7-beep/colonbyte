'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Pencil,
  ArrowRightLeft,
  Snowflake,
  Bath,
  Wrench,
  Sparkles,
  Users,
  BedDouble,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge, ROOM_STATUS_STYLES, CLEANING_STATUS_STYLES, MAINTENANCE_STATUS_STYLES, MAINTENANCE_ENTRY_STYLES } from '@/components/shared/status'
import {
  ROOMS_BY_ID,
  BEDS_BY_ROOM,
  studentsInRoom,
  roomMaintenance,
  BUILDINGS,
} from '@/lib/mock-data'
import { fetchRoom } from '@/lib/rooms-api'
import { fetchStudents } from '@/lib/students-api'
import { getActiveHostelId } from '@/lib/api'
import type { Room, Bed, Student, MaintenanceEntry } from '@/types/dorm'
import { formatDate, formatPKR } from '@/lib/format'
import { AvatarInitials } from '@/components/shared/avatar-initials'
import { cn } from '@/lib/utils'

function AmenityItem({
  active,
  icon,
  label,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400',
      )}
    >
      {icon}
      {label}
    </span>
  )
}

export function RoomDetailsPage({ roomId }: { roomId: string }) {
  const mockRoom = ROOMS_BY_ID.get(roomId)
  const [room, setRoom] = useState<Room | null>(mockRoom ?? null)
  const [beds, setBeds] = useState<Bed[]>(mockRoom ? BEDS_BY_ROOM.get(mockRoom.id) ?? [] : [])
  const [occupants, setOccupants] = useState<Student[]>(mockRoom ? studentsInRoom(mockRoom.id) : [])
  const [maintenance] = useState<MaintenanceEntry[]>(mockRoom ? roomMaintenance(mockRoom.id) : [])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const hostelId = getActiveHostelId()
    if (!hostelId) return
    fetchRoom(roomId)
      .then(({ room: liveRoom, beds: liveBeds }) => {
        setRoom(liveRoom)
        setBeds(liveBeds)
        return fetchStudents(hostelId, { roomId })
      })
      .then((result) => {
        if (result) setOccupants(result.items)
      })
      .catch(() => {
        if (!mockRoom) setFailed(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  if (failed) notFound()
  if (!room) return null

  const occupied = beds.filter((bed) => bed.status === 'Occupied').length
  const building = BUILDINGS.find((building) => building.id === room.building) ?? { name: room.building }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Room ${room.number}`}
        description={`${building?.name ?? 'Hostel'} · Floor ${room.floor}`}
        icon={undefined}
        crumbs={[{ label: 'Rooms', href: '/dashboard/rooms' }, { label: room.number }]}
        actions={
          <>
            <Button variant="outline" size="sm" render={<Link href="/dashboard/rooms" />}>
              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
              View floor
            </Button>
            <Button size="sm" render={<Link href={`/dashboard/rooms/${room.id}/edit`} />}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit Room
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge style={ROOM_STATUS_STYLES[room.status]} />
                <StatusBadge style={CLEANING_STATUS_STYLES[room.cleaningStatus]} />
                <StatusBadge style={MAINTENANCE_STATUS_STYLES[room.maintenanceStatus]} />
              </div>
              <div className="flex items-center gap-2">
                <AmenityItem active={room.ac} icon={<Snowflake className="h-4 w-4" />} label="AC" />
                <AmenityItem
                  active={room.attachedBathroom}
                  icon={<Bath className="h-4 w-4" />}
                  label="Attached bath"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Building2 className="h-3 w-3" /> Type
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{room.type}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <BedDouble className="h-3 w-3" /> Capacity
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {occupied}/{room.capacity} beds
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="h-3 w-3" /> Rent / bed
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatPKR(room.rentPerBed)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Sparkles className="h-3 w-3" /> Furniture
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{room.furniture.length} items</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-gray-400">Furniture</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {room.furniture.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users className="h-4 w-4 text-gray-400" />
              Current Occupants ({occupants.length})
            </h3>
            {occupants.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No students are currently assigned to this room.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {occupants.map((student) => (
                  <li key={student.id}>
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <AvatarInitials name={student.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {student.registrationNo} · {student.department}
                        </p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                        {beds.find((bed) => bed.studentId === student.id)?.label ?? '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Wrench className="h-4 w-4 text-gray-400" />
              Maintenance History
            </h3>
            {maintenance.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No maintenance requests on record for this room.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-100">
                {maintenance.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                      <p className="text-xs text-gray-400">
                        {entry.id} · {formatDate(entry.date)}
                      </p>
                    </div>
                    <StatusBadge style={MAINTENANCE_ENTRY_STYLES[entry.status]} showDot={false} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Beds</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2',
                    bed.status === 'Occupied'
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : bed.status === 'Maintenance'
                        ? 'border-rose-200 bg-rose-50/60'
                        : bed.status === 'Reserved'
                          ? 'border-primary/25 bg-accent/60'
                          : 'border-gray-200 bg-white',
                  )}
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-gray-700">{bed.label}</p>
                    <p className="text-[10px] text-gray-400">{bed.status}</p>
                  </div>
                  {bed.status === 'Occupied' && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Monthly Revenue</h3>
            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {formatPKR(occupied * room.rentPerBed)}
            </p>
            <p className="text-xs text-gray-400">
              {occupied} occupied beds × {formatPKR(room.rentPerBed)} / bed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
