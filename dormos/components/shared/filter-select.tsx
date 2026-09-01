'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type FilterOption = { value: string; label: string }

interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: FilterOption[]
  includeAll?: boolean
  allLabel?: string
  className?: string
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  includeAll = true,
  allLabel = 'All',
  className,
}: FilterSelectProps) {
  const items = includeAll
    ? [{ value: 'all', label: allLabel }, ...options]
    : options
  const selected = items.find((item) => item.value === value)

  return (
    <Select value={value} onValueChange={(next) => onValueChange(String(next ?? ''))}>
      <SelectTrigger className={cn('w-auto min-w-32', className)} aria-label={placeholder}>
        <SelectValue>
          <span className="text-gray-400">{placeholder}:</span>
          <span className="font-medium text-gray-900">
            {selected?.label ?? allLabel}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
