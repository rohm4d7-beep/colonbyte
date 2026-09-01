'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { QUICK_ACTIONS } from '@/constants/dashboard'

export function FloatingQuickActions() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="fixed right-5 bottom-5 z-30 sm:right-6 sm:bottom-6"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              aria-label="Quick actions"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-all duration-200 hover:bg-primary/80 hover:shadow-primary/40 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none active:scale-95"
            />
          }
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </PopoverTrigger>
        <PopoverContent align="end" side="top" sideOffset={12} className="w-72 p-1.5">
          <p className="px-2 pt-1.5 pb-1 text-xs font-semibold text-gray-500 uppercase">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-1 p-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="group flex flex-col items-start gap-1.5 rounded-xl border border-gray-100 bg-white p-2.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs leading-tight font-semibold text-gray-900">
                    {action.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  )
}
