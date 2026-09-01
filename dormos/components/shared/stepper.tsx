'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <ol className="flex items-center gap-1" aria-label="Form progress">
      {steps.map((label, index) => (
        <li key={label} className="flex flex-1 items-center gap-1">
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              index < current
                ? 'bg-emerald-500 text-white'
                : index === current
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-400',
            )}
          >
            {index < current ? <Check className="h-3 w-3" /> : index + 1}
          </span>
          <span
            className={cn(
              'hidden text-xs font-medium sm:block',
              index === current ? 'text-gray-900' : 'text-gray-400',
            )}
          >
            {label}
          </span>
          {index < steps.length - 1 && (
            <span
              className={cn(
                'h-px flex-1 transition-colors',
                index < current ? 'bg-emerald-400' : 'bg-gray-200',
              )}
            />
          )}
        </li>
      ))}
    </ol>
  )
}
