'use client'

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { EXPENSE_BREAKDOWN } from '@/lib/dashboard-data'
import { formatCurrency } from '@/lib/utils'

export function ExpenseBreakdownChart() {
  const total = EXPENSE_BREAKDOWN.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="flex h-64 w-full flex-col gap-2">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTooltip
                  format={(value) =>
                    `${formatCurrency(value, 'PKR')} · ${((value / total) * 100).toFixed(1)}%`
                  }
                />
              }
            />
            <Pie
              data={EXPENSE_BREAKDOWN}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {EXPENSE_BREAKDOWN.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium text-gray-400">Total expenses</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(total, 'PKR')}</p>
        </div>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {EXPENSE_BREAKDOWN.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="truncate text-gray-500">{entry.name}</span>
            <span className="ml-auto font-semibold text-gray-700">
              {((entry.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
