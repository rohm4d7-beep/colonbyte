'use client'

import { cn } from '@/lib/utils'

export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

const inputClasses =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-colors focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClasses, props.className)} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClasses, props.className)} />
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start justify-between gap-4 text-left focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
    >
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-gray-400">{description}</span>}
      </span>
      <span
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-4',
          )}
        />
      </span>
    </button>
  )
}

export function Divider() {
  return <div className="my-4 border-t border-gray-100" />
}
