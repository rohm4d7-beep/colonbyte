import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (event?: unknown) => void
  'aria-label'?: string
  className?: string
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={(event) => {
        event.stopPropagation()
        onChange()
      }}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        checked || indeterminate
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 bg-white hover:border-primary/50',
        className,
      )}
      {...rest}
    >
      {indeterminate ? (
        <span className="h-0.5 w-2 rounded-full bg-white" />
      ) : (
        checked && <Check className="h-3 w-3" strokeWidth={3} />
      )}
    </button>
  )
}
