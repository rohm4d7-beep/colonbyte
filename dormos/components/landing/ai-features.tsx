'use client'

import * as LucideIcons from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { AI_FEATURES } from '@/constants'
import { cn } from '@/lib/utils'

const COLOR_MAP: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'bg-sky-500/10', icon: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/20' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
  rose: { bg: 'bg-rose-500/10', icon: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' },
  cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-500/20' },
  indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20' },
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function AIFeatures() {
  return (
    <section id="ai" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            eyebrow="Powered by AI"
            title="Built for hostels. Powered by intelligence."
            subtitle="DormOS uses AI to automate the repetitive, surface the important, and help you make smarter decisions every day."
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {AI_FEATURES.map((feature, i) => {
            const colors = COLOR_MAP[feature.color] ?? COLOR_MAP.blue
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[feature.icon]
            const isFeatured = i === 3

            return (
              <motion.div
                key={feature.title}
                variants={item}
                className={cn(
                  'group relative bg-card rounded-2xl border border-border shadow-sm p-6',
                  'hover:border-foreground/15 hover:shadow-md transition-all duration-200',
                  isFeatured && 'lg:col-span-1 ring-1 ring-inset ring-primary/20 border-primary/20 bg-primary/[0.04]',
                )}
              >
                {isFeatured && (
                  <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Featured
                  </span>
                )}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl mb-4 ring-1',
                    colors.bg,
                    colors.ring,
                  )}
                >
                  {Icon && <Icon className={cn('h-5 w-5', colors.icon)} />}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
