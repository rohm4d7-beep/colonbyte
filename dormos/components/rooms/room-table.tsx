'use client'

import Link from 'next/link'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  Snowflake,
  Bath,
  Wrench,
} from 'lucide-react'
import type { Room } from '@/types/dorm'
import { StatusBadge, ROOM_STATUS_STYLES, CLEANING_STATUS_STYLES, MAINTENANCE_STATUS_STYLES } from '@/components/shared/status'
import { formatPKR } from '@/lib/format'
import { roomOccupancy, studentsInRoom } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const helper = createColumnHelper<Room>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function roomColumns(): ColumnDef<Room, any>[] {
  return [
    helper.accessor('id', {
      header: 'Room',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-primary">
            {row.original.floor}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">{row.original.number}</span>
            <span className="text-xs text-gray-400">Floor {row.original.floor} · {row.original.type}</span>
          </div>
        </div>
      ),
    }),
    helper.accessor('type', {
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.type}</span>
      ),
    }),
    helper.accessor('capacity', {
      header: 'Capacity',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          {row.original.capacity} beds
        </span>
      ),
    }),
    helper.display({
      id: 'occupancy',
      header: 'Occupancy',
      cell: ({ row }) => {
        const liveBeds = row.original.beds
        const occupied = liveBeds
          ? liveBeds.filter((bed) => bed.status === 'Occupied').length
          : roomOccupancy(row.original).occupied
        const percent = row.original.capacity === 0 ? 0 : Math.round((occupied / row.original.capacity) * 100)
        return (
          <div className="flex min-w-28 flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{occupied} of {row.original.capacity}</span>
              <span className="font-medium text-gray-700">{percent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    }),
    helper.display({
      id: 'amenities',
      header: 'Amenities',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.ac && (
            <span title="Air conditioned" className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-primary">
              <Snowflake className="h-3.5 w-3.5" />
            </span>
          )}
          {row.original.attachedBathroom && (
            <span title="Attached bathroom" className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-primary">
              <Bath className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      ),
    }),
    helper.accessor('cleaningStatus', {
      header: 'Cleaning',
      cell: ({ row }) => (
        <StatusBadge style={CLEANING_STATUS_STYLES[row.original.cleaningStatus]} />
      ),
    }),
    helper.accessor('maintenanceStatus', {
      header: 'Maintenance',
      cell: ({ row }) => (
        <StatusBadge style={MAINTENANCE_STATUS_STYLES[row.original.maintenanceStatus]} />
      ),
    }),
    helper.accessor('rentPerBed', {
      header: 'Rent / Bed',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">{formatPKR(row.original.rentPerBed)}</span>
      ),
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge style={ROOM_STATUS_STYLES[row.original.status]} />
      ),
    }),
    helper.display({
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for room ${row.original.number}`} />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Room {row.original.number}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href={`/dashboard/rooms/${row.original.id}`} />}>
                <Eye />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/dashboard/rooms/${row.original.id}/edit`} />}>
                <Pencil />
                Edit room
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={
                  row.original.beds
                    ? row.original.beds.every((bed) => bed.status !== 'Occupied')
                    : studentsInRoom(row.original.id).length === 0
                }
                onClick={() => undefined}
              >
                <Wrench />
                Log maintenance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]
}
