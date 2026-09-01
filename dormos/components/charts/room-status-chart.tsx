'use client'

import { useState } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { ROOM_STATUS_DATA } from '@/lib/dashboard-data'

export function RoomStatusChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const total = ROOM_STATUS_DATA.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto h-52 w-full max-w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip suffix=" rooms" />} />
            <Pie
              data={ROOM_STATUS_DATA}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {ROOM_STATUS_DATA.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-gray-900">{total}</span>
          <span className="text-[11px] font-medium text-gray-400">Total rooms</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ROOM_STATUS_DATA.map((entry, index) => (
          <button
            key={entry.name}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-left text-xs transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}</span>
            <span className="ml-auto font-semibold text-gray-700">{entry.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
