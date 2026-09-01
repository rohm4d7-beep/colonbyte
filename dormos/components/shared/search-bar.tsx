'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  autoFocus,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (prevValue !== value) {
    setPrevValue(value)
    setInputValue(value)
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (inputValue !== value) onChange(inputValue)
    }, 250)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [inputValue, value, onChange])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={inputValue}
        autoFocus={autoFocus}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 w-full rounded-lg border border-input bg-white pr-8 pl-8 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setInputValue('')
            onChange('')
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
