'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react'
import { AI_INSIGHTS } from '@/constants/dashboard'
import type { AIInsight } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const SENTIMENT_STYLES: Record<AIInsight['sentiment'], { icon: typeof TrendingUp; classes: string }> = {
  positive: { icon: TrendingUp, classes: 'bg-emerald-500' },
  negative: { icon: TrendingDown, classes: 'bg-rose-500' },
  neutral: { icon: Minus, classes: 'bg-gray-400' },
}

export function AIInsightsCard() {
  const [activeIndex, setActiveIndex] = useState(0)
  const insight = AI_INSIGHTS[activeIndex]
  const sentiment = SENTIMENT_STYLES[insight.sentiment]
  const SentimentIcon = sentiment.icon

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-primary p-6 text-white shadow-lg shadow-gray-900/20">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">AI Insights</h3>
          <p className="text-[11px] text-gray-400">Analyzed from your hostel data</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      <div className="relative mt-5 min-h-[120px] flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold">
                <span className={cn('h-1.5 w-1.5 rounded-full', sentiment.classes)} />
                {insight.tag}
              </span>
              <SentimentIcon className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <h4 className="mt-2.5 text-lg leading-snug font-bold tracking-tight">
              {insight.headline}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">{insight.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5">
          {AI_INSIGHTS.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`View insight ${index + 1}: ${item.headline}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50',
              )}
            />
          ))}
        </div>
        <button className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
          AI Assistant
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
