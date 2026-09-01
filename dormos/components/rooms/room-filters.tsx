'use client'

import { RotateCcw } from 'lucide-react'
import type { Room, RoomType, RoomStatus } from '@/types/dorm'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect, type FilterOption } from '@/components/shared/filter-select'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import { Button } from '@/components/ui/button'

export type RoomFiltersState = {
  search: string
  floor: string
  type: string
  status: string
  ac: string
  bathroom: string
  priceMin: string
  priceMax: string
}

export const DEFAULT_ROOM_FILTERS: RoomFiltersState = {
  search: '',
  floor: 'all',
  type: 'all',
  status: 'all',
  ac: 'all',
  bathroom: 'all',
  priceMin: '',
  priceMax: '',
}

export function activeRoomFilterCount(filters: RoomFiltersState): number {
  let count = 0
  if (filters.search.trim()) count++
  if (filters.floor !== 'all') count++
  if (filters.type !== 'all') count++
  if (filters.status !== 'all') count++
  if (filters.ac !== 'all') count++
  if (filters.bathroom !== 'all') count++
  if (filters.priceMin) count++
  if (filters.priceMax) count++
  return count
}

export function filterRooms(rooms: Room[], filters: RoomFiltersState): Room[] {
  const search = filters.search.trim().toLowerCase()
  return rooms.filter((room) => {
    if (
      search &&
      ![room.id, room.number, room.type].some((value) => value.toLowerCase().includes(search))
    ) {
      return false
    }
    if (filters.floor !== 'all' && String(room.floor) !== filters.floor) return false
    if (filters.type !== 'all' && room.type !== (filters.type as RoomType)) return false
    if (filters.status !== 'all' && room.status !== (filters.status as RoomStatus)) return false
    if (filters.ac === 'yes' && !room.ac) return false
    if (filters.ac === 'no' && room.ac) return false
    if (filters.bathroom === 'yes' && !room.attachedBathroom) return false
    if (filters.bathroom === 'no' && room.attachedBathroom) return false
    if (filters.priceMin && room.rentPerBed < Number(filters.priceMin)) return false
    if (filters.priceMax && room.rentPerBed > Number(filters.priceMax)) return false
    return true
  })
}

export type RoomFilterOptions = {
  floors: string[]
  types: string[]
  statuses: string[]
}

interface RoomFilterControlsProps {
  filters: RoomFiltersState
  onChange: (filters: RoomFiltersState) => void
  options: RoomFilterOptions
  stacked?: boolean
}

export function RoomFilterControls({
  filters,
  onChange,
  options,
  stacked,
}: RoomFilterControlsProps) {
  const set = (patch: Partial<RoomFiltersState>) => onChange({ ...filters, ...patch })

  const floorOptions: FilterOption[] = options.floors.map((floor) => ({
    value: floor,
    label: `Floor ${floor}`,
  }))
  const typeOptions: FilterOption[] = options.types.map((type) => ({ value: type, label: type }))
  const statusOptions: FilterOption[] = options.statuses.map((status) => ({
    value: status,
    label: status,
  }))

  const inline = (
    <>
      <SearchBar
        value={filters.search}
        onChange={(value) => set({ search: value })}
        placeholder="Search rooms…"
        className="w-52"
      />
      <FilterSelect
        value={filters.floor}
        onValueChange={(value) => set({ floor: value })}
        placeholder="Floor"
        options={floorOptions}
      />
      <FilterSelect
        value={filters.type}
        onValueChange={(value) => set({ type: value })}
        placeholder="Type"
        options={typeOptions}
      />
      <FilterSelect
        value={filters.status}
        onValueChange={(value) => set({ status: value })}
        placeholder="Status"
        options={statusOptions}
      />
      <FilterSelect
        value={filters.ac}
        onValueChange={(value) => set({ ac: value })}
        placeholder="AC"
        options={[
          { value: 'yes', label: 'With AC' },
          { value: 'no', label: 'Without AC' },
        ]}
      />
    </>
  )

  if (stacked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Search</label>
          <SearchBar
            value={filters.search}
            onChange={(value) => set({ search: value })}
            placeholder="Search rooms…"
          />
        </div>
        <FilterSelect
          value={filters.floor}
          onValueChange={(value) => set({ floor: value })}
          placeholder="Floor"
          options={floorOptions}
          className="w-full"
        />
        <FilterSelect
          value={filters.type}
          onValueChange={(value) => set({ type: value })}
          placeholder="Type"
          options={typeOptions}
          className="w-full"
        />
        <FilterSelect
          value={filters.status}
          onValueChange={(value) => set({ status: value })}
          placeholder="Status"
          options={statusOptions}
          className="w-full"
        />
        <FilterSelect
          value={filters.ac}
          onValueChange={(value) => set({ ac: value })}
          placeholder="Air conditioning"
          options={[
            { value: 'yes', label: 'With AC' },
            { value: 'no', label: 'Without AC' },
          ]}
          className="w-full"
        />
        <FilterSelect
          value={filters.bathroom}
          onValueChange={(value) => set({ bathroom: value })}
          placeholder="Bathroom"
          options={[
            { value: 'yes', label: 'Attached' },
            { value: 'no', label: 'Shared' },
          ]}
          className="w-full"
        />
      </div>
    )
  }

  return <div className="flex flex-wrap items-center gap-2">{inline}</div>
}

interface RoomFiltersProps extends RoomFilterControlsProps {
  onReset: () => void
}

export function RoomFilters({ filters, onChange, options, onReset }: RoomFiltersProps) {
  const activeCount = activeRoomFilterCount(filters)
  return (
    <>
      <RoomFilterControls filters={filters} onChange={onChange} options={options} />
      <FilterDrawer activeCount={activeCount}>
        <RoomFilterControls
          filters={filters}
          onChange={onChange}
          options={options}
          stacked
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={activeCount === 0}
          className="w-full"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Reset filters
        </Button>
      </FilterDrawer>
    </>
  )
}
