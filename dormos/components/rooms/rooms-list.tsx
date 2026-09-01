'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  BedDouble,
  DoorOpen,
  Sparkles,
  Wrench,
  LayoutGrid,
  Snowflake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { roomColumns } from '@/components/rooms/room-table'
import {
  RoomFilters,
  filterRooms,
  activeRoomFilterCount,
  DEFAULT_ROOM_FILTERS,
  type RoomFiltersState,
  type RoomFilterOptions,
} from '@/components/rooms/room-filters'
import { ExportButton } from '@/components/shared/export-button'
import { ROOMS, BUILDINGS } from '@/lib/mock-data'
import { fetchRooms } from '@/lib/rooms-api'
import { getActiveHostelId } from '@/lib/api'
import { formatPKR } from '@/lib/format'

const ROOM_TYPES = ['Single', 'Twin', 'Triple', 'Quad', 'Dorm']
const ROOM_STATUSES = ['Occupied', 'Vacant', 'Cleaning', 'Maintenance']

export function RoomsListPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<RoomFiltersState>(DEFAULT_ROOM_FILTERS)
  const [liveRooms, setLiveRooms] = useState<typeof ROOMS | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadRooms = useCallback(() => {
    const hostelId = getActiveHostelId()
    if (!hostelId) return
    fetchRooms(hostelId)
      .then((result) => {
        setLiveRooms(result.items)
        setLoadError(null)
      })
      .catch(() => {
        setLoadError('Could not load rooms from the server.')
      })
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const rooms = liveRooms ?? ROOMS
  const floors = useMemo(
    () => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b),
    [rooms],
  )

  const filtered = filterRooms(rooms, filters)
  const activeCount = activeRoomFilterCount(filters)
  const resetFilters = () => setFilters(DEFAULT_ROOM_FILTERS)

  const filterOptions: RoomFilterOptions = {
    floors: floors.map(String),
    types: ROOM_TYPES,
    statuses: ROOM_STATUSES,
  }

  const analytics: AnalyticsItem[] = useMemo(() => {
    const vacant = rooms.filter((room) => room.status === 'Vacant').length
    const cleaning = rooms.filter((room) => room.status === 'Cleaning').length
    const maintenance = rooms.filter((room) => room.status === 'Maintenance').length
    const bedsCount = rooms.reduce((sum, room) => sum + room.capacity, 0)
    const totalRent = rooms.reduce((sum, room) => {
      const occupiedBeds = room.beds
        ? room.beds.filter((bed) => bed.status === 'Occupied').length
        : room.status === 'Occupied'
          ? room.capacity
          : 0
      return sum + room.rentPerBed * occupiedBeds
    }, 0)
    const buildingName = BUILDINGS[0]?.name ?? 'Block A'
    const floorsCount = floors.length || BUILDINGS[0]?.floors
    const floorLabel = floorsCount ?? 4
    return [
      {
        id: 'total',
        label: 'Total Rooms',
        value: String(rooms.length),
        sub: `${buildingName} · ${floorLabel} floors`,
        icon: DoorOpen,
        accent: 'blue',
      },
      {
        id: 'beds',
        label: 'Total Beds',
        value: String(bedsCount),
        sub: `${vacant} vacant`,
        icon: BedDouble,
        accent: 'emerald',
      },
      {
        id: 'vacant',
        label: 'Vacant Rooms',
        value: String(vacant),
        sub: 'Ready to allocate',
        icon: Building2,
        accent: 'cyan',
      },
      {
        id: 'cleaning',
        label: 'In Cleaning',
        value: String(cleaning),
        sub: 'Being serviced',
        icon: Sparkles,
        accent: 'amber',
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        value: String(maintenance),
        sub: 'Out of service',
        icon: Wrench,
        accent: 'rose',
      },
      {
        id: 'revenue',
        label: 'Est. Monthly Rent',
        value: formatPKR(totalRent),
        sub: 'At current occupancy',
        icon: Snowflake,
        accent: 'violet',
      },
    ]
  }, [rooms, floors])

  const csvColumns = [
    { key: 'id', label: 'Room' },
    { key: 'floor', label: 'Floor' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'status', label: 'Status' },
    { key: 'cleaningStatus', label: 'Cleaning' },
    { key: 'maintenanceStatus', label: 'Maintenance' },
    { key: 'rentPerBed', label: 'Rent Per Bed' },
  ]

  const exportData = filtered.map((room) => ({
    id: room.id,
    floor: room.floor,
    type: room.type,
    capacity: room.capacity,
    status: room.status,
    cleaningStatus: room.cleaningStatus,
    maintenanceStatus: room.maintenanceStatus,
    rentPerBed: room.rentPerBed,
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Rooms"
        description="Manage rooms, beds, cleaning and maintenance across all floors."
        icon={Building2}
        crumbs={[{ label: 'Rooms' }]}
        actions={
          <Button render={<Link href="/dashboard/rooms/floors" />} variant="outline" size="sm">
            <LayoutGrid className="mr-1 h-3.5 w-3.5" />
            Floor View
          </Button>
        }
      />

      <AnalyticsCards items={analytics} />

      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={loadRooms}>
            Retry
          </Button>
        </div>
      )}

      <DataTable
        columns={roomColumns()}
        data={filtered}
        getRowId={(room) => room.id}
        onRowClick={(room) => router.push(`/dashboard/rooms/${room.id}`)}
        stickyHeader
        showColumnToggle
        loading={liveRooms === null && !loadError}
        toolbar={
          <RoomFilters
            filters={filters}
            onChange={setFilters}
            options={filterOptions}
            onReset={resetFilters}
          />
        }
        actions={
          <ExportButton
            data={exportData}
            columns={csvColumns}
            filename={`rooms-${new Date().toISOString().slice(0, 10)}`}
            label="Export CSV"
          />
        }
        emptyTitle="No rooms found"
        emptyDescription={
          activeCount > 0
            ? 'No rooms match the current filters. Try clearing some filters.'
            : 'No rooms have been added yet.'
        }
        initialColumnVisibility={{ amenities: false, cleaningStatus: false }}
        initialPageSize={10}
      />
    </div>
  )
}
