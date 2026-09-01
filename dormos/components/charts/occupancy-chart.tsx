'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { OCCUPANCY_WEEKLY } from '@/lib/dashboard-data'

export function OccupancyChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={OCCUPANCY_WEEKLY} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <defs>
            <linearGradient id="occupancy-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            domain={[80, 100]}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip
            content={<ChartTooltip suffix="%" />}
            cursor={{ stroke: '#E5E7EB' }}
          />
          <Area
            type="monotone"
            dataKey="occupancy"
            name="Occupancy"
            stroke="var(--color-chart-4)"
            strokeWidth={2.5}
            fill="url(#occupancy-fill)"
            dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: 'var(--color-chart-4)' }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
