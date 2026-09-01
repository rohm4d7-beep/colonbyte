'use client'

import { Check, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BUILDINGS,
  FLOORS,
  BEDS_BY_ROOM,
  roomOccupancy,
  floorOccupancy,
  floorRooms,
} from '@/lib/mock-data'
import type { Room } from '@/types/dorm'
import { StatusBadge, ROOM_STATUS_STYLES, BED_STATUS_STYLES } from '@/components/shared/status'

export type RoomBedSelection = {
  buildingId: string
  floor: number | null
  roomId: string | null
  bedId: string | null
}

interface RoomBedPickerProps {
  value: RoomBedSelection
  onChange: (patch: Partial<RoomBedSelection>) => void
  showBuilding?: boolean
  disabled?: boolean
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase">{children}</p>
}

export function RoomBedPicker({
  value,
  onChange,
  showBuilding = true,
  disabled,
}: RoomBedPickerProps) {
  const selectedRoom: Room | undefined = value.roomId
    ? floorRooms(value.floor ?? 1).find((room) => room.id === value.roomId)
    : undefined
  const roomBeds = selectedRoom ? BEDS_BY_ROOM.get(selectedRoom.id) ?? [] : []
  const rooms = value.floor !== null ? floorRooms(value.floor) : []

  return (
    <div className="flex flex-col gap-4">
      {showBuilding && (
        <div className="flex flex-col gap-1.5">
          <StageLabel>Building</StageLabel>
          <div className="flex flex-wrap gap-2">
            {BUILDINGS.map((building) => {
              const selected = value.buildingId === building.id
              return (
                <button
                  key={building.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ buildingId: building.id, floor: null, roomId: null, bedId: null })}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                    selected
                      ? 'border-primary/35 bg-accent/60 font-semibold text-primary ring-1 ring-primary/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/25',
                  )}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  {building.name}
                  {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <StageLabel>Floor</StageLabel>
        <div className="flex flex-wrap gap-2">
          {FLOORS.map((floor) => {
            const occupancy = floorOccupancy(floor)
            const selected = value.floor === floor
            return (
              <button
                key={floor}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ floor, roomId: null, bedId: null })}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                  selected
                    ? 'border-primary/35 bg-accent/60 font-semibold text-primary ring-1 ring-primary/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary/25',
                )}
              >
                Floor {floor}
                <span className="text-xs text-gray-400">
                  {occupancy.occupied}/{occupancy.total}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <StageLabel>Room</StageLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rooms.map((room) => {
            const occupancy = roomOccupancy(room)
            const selected = value.roomId === room.id
            const unavailable =
              room.status === 'Cleaning' ||
              room.status === 'Maintenance' ||
              occupancy.vacant === 0
            return (
              <button
                key={room.id}
                type="button"
                disabled={disabled || unavailable}
                onClick={() => onChange({ roomId: room.id, bedId: null })}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                  selected
                    ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                    : unavailable
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                      : 'border-gray-200 bg-white hover:border-primary/25',
                )}
              >
                <span className="text-sm font-semibold text-gray-900">{room.number}</span>
                <span className="text-xs text-gray-500">
                  {occupancy.occupied}/{room.capacity} filled
                </span>
                <StatusBadge style={ROOM_STATUS_STYLES[room.status]} showDot={false} />
              </button>
            )
          })}
        </div>
      </div>

      {selectedRoom && (
        <div className="flex flex-col gap-1.5">
          <StageLabel>
            Bed · Room {selectedRoom.number}
          </StageLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roomBeds.map((bed) => {
              const selected = value.bedId === bed.id
              const unavailable = bed.status === 'Occupied' || bed.status === 'Maintenance'
              return (
                <button
                  key={bed.id}
                  type="button"
                  disabled={disabled || unavailable}
                  onClick={() => onChange({ bedId: bed.id })}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border p-2.5 text-left transition-all focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                    selected
                      ? 'border-primary/35 bg-accent/60 ring-1 ring-primary/20'
                      : unavailable
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                        : 'border-gray-200 bg-white hover:border-primary/25',
                  )}
                >
                  <span className="font-mono text-sm font-bold text-gray-900">{bed.label}</span>
                  <StatusBadge style={BED_STATUS_STYLES[bed.status]} showDot={false} />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
