'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Archive, Trash2, MailOpen, Search, Wallet, Wrench, Users,
  UserCheck, Package, Sparkles, Settings, Inbox,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { NOTIFICATION_CENTER_DATA } from '@/lib/mock-data/notifications-center'
import type { NotificationCategory, NotificationItem } from '@/types/enterprise'
import { cn } from '@/lib/utils'

const CATEGORY_CONFIG: { category: NotificationCategory; icon: typeof Wallet; classes: string; dot: string }[] = [
  { category: 'Finance', icon: Wallet, classes: 'bg-accent text-primary', dot: 'bg-primary' },
  { category: 'Maintenance', icon: Wrench, classes: 'bg-violet-50 text-violet-600', dot: 'bg-violet-500' },
  { category: 'Students', icon: Users, classes: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  { category: 'Visitors', icon: UserCheck, classes: 'bg-teal-50 text-teal-600', dot: 'bg-teal-500' },
  { category: 'Inventory', icon: Package, classes: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  { category: 'AI', icon: Sparkles, classes: 'bg-accent text-primary', dot: 'bg-primary' },
  { category: 'System', icon: Settings, classes: 'bg-gray-100 text-gray-600', dot: 'bg-gray-500' },
]

const CATEGORY_ICON: Record<NotificationCategory, typeof Wallet> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.category, c.icon]),
) as Record<NotificationCategory, typeof Wallet>

const CATEGORY_STYLES: Record<NotificationCategory, string> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.category, c.classes]),
) as Record<NotificationCategory, string>

type ViewMode = 'all' | 'unread' | 'archived'

export function NotificationCenterPage() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATION_CENTER_DATA)
  const [activeCategory, setActiveCategory] = useState<'All' | NotificationCategory>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [query, setQuery] = useState('')

  const unreadCount = items.filter((i) => !i.read && !i.archived).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (viewMode === 'unread' && item.read) return false
      if (viewMode === 'archived' && !item.archived) return false
      if (viewMode === 'all' && item.archived) return false
      if (activeCategory !== 'All' && item.category !== activeCategory) return false
      if (q && !item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, activeCategory, viewMode, query])

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, read: true })))
  const toggleRead = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: !i.read } : i)))
  const archive = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, archived: !i.archived, read: true } : i)))
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: items.filter((i) => !i.archived).length }
    for (const cat of CATEGORY_CONFIG) {
      counts[cat.category] = items.filter((i) => i.category === cat.category && !i.archived).length
    }
    return counts
  }, [items])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notification Center"
        description="Everything that needs your attention — finance, maintenance, students, visitors and more."
        icon={Bell}
        crumbs={[{ label: 'Notifications' }]}
        actions={
          <>
            <button
              onClick={markAllRead}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i.archived || i.read).map((i) => ({ ...i, archived: true, read: true })))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <Archive className="h-4 w-4" />
              Archive all
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/20 md:w-72">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications…"
              aria-label="Search notifications"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {(['all', 'unread', 'archived'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                  viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {mode}
                {mode === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['All', ...CATEGORY_CONFIG.map((c) => c.category)] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                activeCategory === cat
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {cat !== 'All' && <span className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_CONFIG.find((c) => c.category === cat)?.dot)} />}
              {cat}
              <span className={cn('rounded-full px-1.5 text-[10px] font-semibold', activeCategory === cat ? 'bg-white/20' : 'bg-gray-100 text-gray-500')}>
                {categories[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
              <Inbox className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">No notifications</p>
            <p className="max-w-sm text-xs text-gray-400">
              You&apos;re all caught up. When something happens in your hostel, it will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            <AnimatePresence initial={false}>
              {filtered.map((item) => {
                const Icon = CATEGORY_ICON[item.category]
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn('group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/70 sm:px-5', !item.read && 'bg-accent/30')}
                  >
                    <button
                      onClick={() => toggleRead(item.id)}
                      aria-label={item.read ? 'Mark as unread' : 'Mark as read'}
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                    >
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', CATEGORY_STYLES[item.category])}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm', item.read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900')}>
                          {item.title}
                        </p>
                        {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">{item.time}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{item.category}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => toggleRead(item.id)}
                        aria-label="Toggle read"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <MailOpen className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => archive(item.id)}
                        aria-label={item.archived ? 'Unarchive' : 'Archive'}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        aria-label="Delete notification"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-rose-500 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3 text-xs text-gray-400">
            <span>Showing {filtered.length} of {items.length} notifications</span>
            <span>{unreadCount} unread</span>
          </div>
        )}
      </div>
    </div>
  )
}
