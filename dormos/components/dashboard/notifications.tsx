'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationCard } from '@/components/widgets/notification-card'
import { NOTIFICATIONS } from '@/constants/dashboard'

export function Notifications() {
  const [items, setItems] = useState(NOTIFICATIONS)
  const unread = items.filter((item) => !item.read).length

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`Notifications (${unread} unread)`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
          />
        }
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] max-w-sm p-0"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-400">
              {unread > 0 ? `${unread} unread updates` : 'You are all caught up'}
            </p>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                <CheckCheck className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No notifications</p>
              <p className="text-xs text-gray-400">
                New updates about your hostel will appear here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <NotificationCard key={item.id} notification={item} />
            ))
          )}
        </div>

        <Link
          href="/dashboard/notifications"
          className="block w-full rounded-b-lg border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 text-center text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  )
}
