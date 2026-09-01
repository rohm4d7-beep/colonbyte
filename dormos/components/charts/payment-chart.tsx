'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { PAYMENT_DATA } from '@/lib/dashboard-data'
import { formatCurrency } from '@/lib/utils'

export function PaymentChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={PAYMENT_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -8 }} barGap={3}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
            }
          />
          <Tooltip
            content={
              <ChartTooltip format={(value) => formatCurrency(value, 'PKR')} />
            }
            cursor={{ fill: '#F9FAFB' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#6B7280', paddingTop: 8 }}
          />
          <Bar
            dataKey="collected"
            name="Collected"
            fill="var(--color-chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="pending"
            name="Pending"
            fill="var(--color-chart-3)"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
