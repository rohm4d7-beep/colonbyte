'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BedDouble, Snowflake, Bath, Users, MapPin } from 'lucide-react'
import type { Room } from '@/types/dorm'
import { StatusBadge, ROOM_STATUS_STYLES } from '@/components/shared/status'
import { formatPKR } from '@/lib/format'
import { roomOccupancy } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STATUS_BORDER: Record<Room['status'], string> = {
  Occupied: 'hover:border-emerald-300',
  Vacant: 'hover:border-primary/35',
  Cleaning: 'hover:border-amber-300',
  Maintenance: 'hover:border-rose-300',
}

export function RoomCard({ room, index = 0 }: { room: Room; index?: number }) {
  const { occupied } = roomOccupancy(room)
  const percent = room.capacity === 0 ? 0 : Math.round((occupied / room.capacity) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/dashboard/rooms/${room.id}`}
        className={cn(
          'group flex h-full flex-col gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
          STATUS_BORDER[room.status],
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-bold tracking-tight text-gray-900">Room {room.number}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              Floor {room.floor} · {room.type}
            </p>
          </div>
          <StatusBadge style={ROOM_STATUS_STYLES[room.status]} showDot={false} />
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {occupied}/{room.capacity}
          </div>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percent === 100 ? 'bg-rose-500' : percent > 0 ? 'bg-primary' : 'bg-gray-300',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700">{percent}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {room.ac && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-primary" title="AC">
                <Snowflake className="h-3.5 w-3.5" />
              </span>
            )}
            {room.attachedBathroom && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-primary" title="Attached bathroom">
                <Bath className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-gray-500" title="Beds">
              <BedDouble className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatPKR(room.rentPerBed)}
            <span className="text-xs font-normal text-gray-400"> / bed</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
