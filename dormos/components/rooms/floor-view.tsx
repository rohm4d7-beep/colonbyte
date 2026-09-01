'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import type { Room } from '@/types/dorm'
import { floorRooms, floorOccupancy } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ROOM_COLORS: Record<Room['status'], { bg: string; text: string; ring: string }> = {
  Occupied: { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-500/30' },
  Vacant: { bg: 'bg-primary', text: 'text-white', ring: 'ring-primary/30' },
  Cleaning: { bg: 'bg-amber-400', text: 'text-amber-950', ring: 'ring-amber-400/30' },
  Maintenance: { bg: 'bg-rose-500', text: 'text-white', ring: 'ring-rose-500/30' },
}

export function FloorView({
  floor,
  buildingName = 'Block A',
}: {
  floor: number
  buildingName?: string
}) {
  const rooms = floorRooms(floor)
  const occupancy = floorOccupancy(floor)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white px-4 py-3 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Floor {floor} — {buildingName}
          </h3>
          <p className="text-xs text-gray-400">
            {rooms.length} rooms · {occupancy.occupied} of {occupancy.total} beds occupied
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(
            [
              ['Occupied', 'bg-emerald-500'],
              ['Vacant', 'bg-primary'],
              ['Cleaning', 'bg-amber-400'],
              ['Maintenance', 'bg-rose-500'],
            ] as const
          ).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/70 bg-gray-50/40 p-4 shadow-sm sm:p-6">
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {rooms.map((room, index) => {
            const color = ROOM_COLORS[room.status]
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, delay: index * 0.015, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/dashboard/rooms/${room.id}`}
                  className={cn(
                    'group flex aspect-[4/3] flex-col justify-between rounded-xl p-3 shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    color.bg,
                    color.text,
                    `ring-${room.hue}`,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{room.number}</span>
                    <span className="rounded-md bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                      {room.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-90">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.capacity}
                    </span>
                    <span className="rounded-md bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
                      {room.status}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
