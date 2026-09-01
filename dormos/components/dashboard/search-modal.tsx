'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Users,
  DoorOpen,
  CreditCard,
  FileText,
  UsersRound,
  Settings,
  ArrowUpRight,
  CornerDownLeft,
  Layers,
  Package,
  UserCheck,
  Wrench,
  UtensilsCrossed,
  Truck,
  Sparkles,
  Shield,
  Building2,
  Bell,
  History,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SEARCH_RESULTS } from '@/constants/dashboard'
import type { SearchResultType } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<SearchResultType, typeof Users> = {
  Students: Users,
  Rooms: DoorOpen,
  Payments: CreditCard,
  Reports: FileText,
  Staff: UsersRound,
  Settings: Settings,
  Inventory: Package,
  Visitors: UserCheck,
  Tickets: Wrench,
  Mess: UtensilsCrossed,
  Suppliers: Truck,
  AI: Sparkles,
  Roles: Shield,
  Hostels: Building2,
  Notifications: Bell,
  Audit: History,
}

const TYPE_STYLES: Record<SearchResultType, string> = {
  Students: 'bg-accent text-primary',
  Rooms: 'bg-emerald-50 text-emerald-600',
  Payments: 'bg-violet-50 text-violet-600',
  Reports: 'bg-amber-50 text-amber-600',
  Staff: 'bg-accent text-primary',
  Settings: 'bg-rose-50 text-rose-600',
  Inventory: 'bg-orange-50 text-orange-600',
  Visitors: 'bg-teal-50 text-teal-600',
  Tickets: 'bg-red-50 text-red-600',
  Mess: 'bg-yellow-50 text-yellow-600',
  Suppliers: 'bg-accent text-primary',
  AI: 'bg-purple-50 text-purple-600',
  Roles: 'bg-slate-50 text-slate-600',
  Hostels: 'bg-emerald-50 text-emerald-600',
  Notifications: 'bg-accent text-primary',
  Audit: 'bg-amber-50 text-amber-600',
}

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: () => void
}

export function SearchModal({ open, onOpenChange, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setQuery('')
        inputRef.current?.focus()
      }, 50)
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SEARCH_RESULTS.slice(0, 8)
    return SEARCH_RESULTS.filter(
      (result) =>
        result.title.toLowerCase().includes(q) ||
        result.subtitle.toLowerCase().includes(q) ||
        result.type.toLowerCase().includes(q),
    ).slice(0, 8)
  }, [query])

  const grouped = useMemo(() => {
    const groups: Partial<Record<SearchResultType, typeof results>> = {}
    for (const result of results) {
      groups[result.type] = [...(groups[result.type] ?? []), result]
    }
    return groups
  }, [results])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[15%] max-w-xl translate-y-0 gap-0 p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across students, rooms, payments, reports, staff and settings.
        </DialogDescription>

        <div className="flex items-center gap-2.5 border-b border-gray-100 px-4">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, rooms, payments, reports…"
            className="h-12 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            aria-label="Search"
          />
          <kbd className="hidden rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <Layers className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No results for “{query}”
              </p>
              <p className="text-xs text-gray-400">
                Try searching for a student name, room number or invoice ID.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {Object.entries(grouped).map(([type, items]) => {
                const TypeIcon = TYPE_ICONS[type as SearchResultType]
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 px-2 pt-2 pb-1">
                      <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                        {type}
                      </span>
                      <span className="h-px flex-1 bg-gray-100" />
                    </div>
                    {items.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => {
                          onOpenChange(false)
                          onNavigate?.()
                        }}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-100 hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            TYPE_STYLES[result.type],
                          )}
                        >
                          <TypeIcon className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-gray-900">
                            {result.title}
                          </span>
                          <span className="truncate text-xs text-gray-500">
                            {result.subtitle}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-semibold text-gray-500">
              ⌘
            </kbd>
            <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-semibold text-gray-500">
              K
            </kbd>
            <span className="ml-1">to open</span>
          </span>
          <span className="ml-auto flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" />
            <span>to navigate</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
