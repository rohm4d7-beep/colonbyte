'use client'

import Link from 'next/link'
import { MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'chat', label: 'Assistant', icon: MessageCircle, href: '/dashboard/ai-assistant' },
  { id: 'insights', label: 'Insights', icon: Sparkles, href: '/dashboard/ai-assistant/insights' },
]

export function AITabs({ active }: { active: 'chat' | 'insights' }) {
  return (
    <nav aria-label="AI Assistant sections" className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.id === active
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
              isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
