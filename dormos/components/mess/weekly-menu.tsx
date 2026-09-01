'use client'

import { motion } from 'framer-motion'
import { Coffee, Sun, Moon, Edit2, Copy, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { WEEKLY_MENU } from '@/lib/mock-data/mess'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const MEAL_CONFIG = [
  { key: 'breakfast' as const, label: 'Breakfast', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' },
  { key: 'lunch' as const, label: 'Lunch', icon: Sun, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
  { key: 'dinner' as const, label: 'Dinner', icon: Moon, color: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-400' },
]

const TODAY_INDEX = 0 // Monday as today

export function WeeklyMenuPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Weekly Menu"
        description="Manage breakfast, lunch and dinner menus for the week."
        icon={UtensilsCrossed}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Menu' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <Copy className="h-3.5 w-3.5" />
              Duplicate Week
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Edit2 className="h-3.5 w-3.5" />
              Edit Menu
            </button>
          </div>
        }
      />

      <MessTabs />

      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200/70 bg-white px-5 py-3 shadow-sm">
        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50">
          <ChevronLeft className="h-4 w-4" />
          Prev Week
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Week of Aug 3 – Aug 9, 2026</p>
          <p className="text-xs text-gray-400">Current week</p>
        </div>
        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50">
          Next Week
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WEEKLY_MENU.slice(0, 4).map((day, i) => (
          <MenuDayCard key={day.day} day={day} index={i} isToday={i === TODAY_INDEX} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {WEEKLY_MENU.slice(4).map((day, i) => (
          <MenuDayCard key={day.day} day={day} index={i + 4} isToday={false} />
        ))}
      </div>
    </div>
  )
}

function MenuDayCard({ day, index, isToday }: { day: typeof WEEKLY_MENU[0]; index: number; isToday: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        isToday ? 'border-primary/35 ring-1 ring-primary/20' : 'border-gray-200/70',
      )}
    >
      {/* Day Header */}
      <div className={cn('flex items-center justify-between rounded-t-2xl px-4 py-3', isToday ? 'bg-primary' : 'bg-gray-50')}>
        <div>
          <p className={cn('text-sm font-bold', isToday ? 'text-white' : 'text-gray-900')}>{day.day}</p>
          <p className={cn('text-xs', isToday ? 'text-primary-foreground/80' : 'text-gray-400')}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        {isToday && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
            Today
          </span>
        )}
        <button className={cn('flex h-6 w-6 items-center justify-center rounded-lg transition-colors', isToday ? 'hover:bg-white/20' : 'hover:bg-gray-100')}>
          <Edit2 className={cn('h-3 w-3', isToday ? 'text-primary-foreground/80' : 'text-gray-400')} />
        </button>
      </div>

      {/* Meals */}
      <div className="flex flex-col gap-0 divide-y divide-gray-50 p-3">
        {MEAL_CONFIG.map(({ key, label, icon: Icon, color, bg, dot }) => (
          <div key={key} className="py-2.5 first:pt-0 last:pb-0">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className={cn('flex h-5 w-5 items-center justify-center rounded-md', bg)}>
                <Icon className={cn('h-3 w-3', color)} />
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {day[key].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200"
                >
                  <span className={cn('h-1 w-1 rounded-full', dot)} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
