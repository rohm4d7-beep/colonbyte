'use client'

import { useMemo, useState } from 'react'
import { BedDouble, DoorOpen, User, Wrench, CalendarClock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect } from '@/components/shared/filter-select'
import { StatusBadge, ROOM_STATUS_STYLES } from '@/components/shared/status'
import { BEDS, ROOMS_BY_ID, STUDENTS_BY_ID, FLOORS } from '@/lib/mock-data'
import { formatPKR } from '@/lib/format'
import type { Bed } from '@/types/dorm'
import { cn } from '@/lib/utils'

export function BedsPage() {
  const [search, setSearch] = useState('')
  const [floor, setFloor] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return BEDS.filter((bed) => {
      const room = ROOMS_BY_ID.get(bed.roomId)
      if (floor !== 'all' && room?.floor !== Number(floor)) return false
      if (status !== 'all' && bed.status !== status) return false
      if (q) {
        const student = bed.studentId ? STUDENTS_BY_ID.get(bed.studentId) : undefined
        const haystack = [
          bed.id,
          bed.roomId,
          bed.label,
          student?.name ?? '',
          student?.registrationNo ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [search, floor, status])

  const analytics: AnalyticsItem[] = useMemo(() => {
    const occupied = BEDS.filter((bed) => bed.status === 'Occupied').length
    const vacant = BEDS.filter((bed) => bed.status === 'Vacant').length
    const reserved = BEDS.filter((bed) => bed.status === 'Reserved').length
    const maintenance = BEDS.filter((bed) => bed.status === 'Maintenance').length
    const occupancy = Math.round((occupied / BEDS.length) * 100)
    return [
      {
        id: 'total',
        label: 'Total Beds',
        value: String(BEDS.length),
        sub: 'Across all rooms',
        icon: BedDouble,
        accent: 'blue',
      },
      {
        id: 'occupied',
        label: 'Occupied',
        value: String(occupied),
        sub: `${occupancy}% occupancy`,
        icon: User,
        accent: 'emerald',
        trend: { value: `${occupancy}%`, positive: true },
      },
      {
        id: 'vacant',
        label: 'Vacant',
        value: String(vacant),
        sub: 'Available now',
        icon: CheckCircle2,
        accent: 'cyan',
      },
      {
        id: 'reserved',
        label: 'Reserved',
        value: String(reserved),
        sub: 'Held for check-in',
        icon: CalendarClock,
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
    ]
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Beds"
        description="Browse and manage individual beds across every room and floor."
        icon={BedDouble}
        crumbs={[{ label: 'Beds' }]}
      />

      <AnalyticsCards items={analytics} />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search beds, rooms, students…"
          className="w-60"
        />
        <FilterSelect
          value={floor}
          onValueChange={setFloor}
          placeholder="Floor"
          options={FLOORS.map((item) => ({ value: String(item), label: `Floor ${item}` }))}
        />
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          placeholder="Status"
          options={['Occupied', 'Vacant', 'Reserved', 'Maintenance'].map((item) => ({
            value: item,
            label: item,
          }))}
        />
        <p className="ml-auto text-xs text-gray-400">
          {filtered.length} of {BEDS.length} beds
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            No beds match the current filters.
          </div>
        ) : (
          Object.entries(
            filtered.reduce<Record<string, Bed[]>>((groups, bed) => {
              ;(groups[bed.roomId] ??= []).push(bed)
              return groups
            }, {}),
          )
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([roomId, beds]) => {
              const room = ROOMS_BY_ID.get(roomId)
              if (!room) return null
              return (
                <div
                  key={roomId}
                  className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-primary">
                        {roomId}
                      </span>
                      <div>
                        <Link
                          href={`/dashboard/rooms/${roomId}`}
                          className="text-sm font-semibold text-gray-900 hover:text-primary"
                        >
                          Room {room.id}
                        </Link>
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                          <DoorOpen className="h-3 w-3" />
                          Floor {room.floor} · {room.type} · {formatPKR(room.rentPerBed)}/bed
                        </p>
                      </div>
                    </div>
                    <StatusBadge style={ROOM_STATUS_STYLES[room.status]} showDot={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-8">
                    {beds.map((bed) => {
                      const student = bed.studentId ? STUDENTS_BY_ID.get(bed.studentId) : undefined
                      return (
                        <Link
                          key={bed.id}
                          href={student ? `/dashboard/students/${student.id}` : `/dashboard/rooms/${roomId}`}
                          className={cn(
                            'flex flex-col gap-1.5 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                            bed.status === 'Occupied'
                              ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                              : bed.status === 'Vacant'
                                ? 'border-primary/25 bg-accent/40 hover:border-primary/35'
                                : bed.status === 'Reserved'
                                  ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                                  : 'border-rose-200 bg-rose-50/50 hover:border-rose-300',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold text-gray-800">{bed.label}</span>
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                bed.status === 'Occupied'
                                  ? 'bg-emerald-500'
                                  : bed.status === 'Vacant'
                                    ? 'bg-primary'
                                    : bed.status === 'Reserved'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500',
                              )}
                            />
                          </div>
                          <span className="truncate text-xs font-medium text-gray-600">
                            {student?.name ?? '—'}
                          </span>
                          <span className="truncate text-[10px] text-gray-400">
                            {student?.registrationNo ?? bed.status}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}
