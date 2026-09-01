'use client'

interface TooltipItem {
  name?: string
  value?: number | string
  stroke?: string
  fill?: string
  payload?: { fill?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
  format?: (value: number) => string
  suffix?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  format,
  suffix,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      {label !== undefined && label !== null && (
        <p className="mb-1 text-xs font-semibold text-gray-900">{label}</p>
      )}
      {payload.map((entry, index) => (
        <p
          key={index}
          className="flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                entry.stroke ?? entry.payload?.fill ?? entry.fill ?? 'var(--color-chart-1)',
            }}
          />
          {entry.name}:{' '}
          <span className="font-semibold text-gray-900">
            {typeof entry.value === 'number' && format
              ? format(entry.value)
              : entry.value}
            {typeof entry.value === 'number' && !format && suffix
              ? suffix
              : ''}
          </span>
        </p>
      ))}
    </div>
  )
}
