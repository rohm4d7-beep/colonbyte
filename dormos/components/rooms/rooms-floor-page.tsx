'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { FloorView } from '@/components/rooms/floor-view'
import { BUILDINGS, FLOORS, BEDS, floorOccupancy } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function RoomsFloorPage() {
  const [floor, setFloor] = useState<number>(FLOORS[0])

  const analytics: AnalyticsItem[] = [
    {
      id: 'building',
      label: 'Building',
      value: BUILDINGS[0]?.name ?? 'Block A',
      sub: `${BUILDINGS[0]?.floors ?? 4} floors`,
      icon: Building2,
      accent: 'blue',
    },
    ...FLOORS.map((item, index) => {
      const occupancy = floorOccupancy(item)
      const percent = occupancy.total === 0 ? 0 : Math.round((occupancy.occupied / occupancy.total) * 100)
      return {
        id: `floor-${item}`,
        label: `Floor ${item}`,
        value: `${percent}%`,
        sub: `${occupancy.occupied} of ${occupancy.total} beds`,
        icon: Layers,
        accent: (['emerald', 'cyan', 'amber', 'violet'] as const)[index],
      } as AnalyticsItem
    }),
  ]

  const totalOccupied = BEDS.filter((bed) => bed.status === 'Occupied').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Floor View"
        description={`Visual overview of ${BUILDINGS[0]?.name ?? 'Block A'} — ${totalOccupied} beds occupied across all floors.`}
        icon={Layers}
        crumbs={[{ label: 'Rooms', href: '/dashboard/rooms' }, { label: 'Floors' }]}
        actions={
          <Button render={<Link href="/dashboard/rooms/new" />} size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Room
          </Button>
        }
      />

      <AnalyticsCards items={analytics} />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200/70 bg-white p-1 shadow-sm">
        {FLOORS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFloor(item)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
              floor === item
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            Floor {item}
          </button>
        ))}
      </div>

      <FloorView floor={floor} buildingName={BUILDINGS[0]?.name ?? 'Block A'} />
    </div>
  )
}
