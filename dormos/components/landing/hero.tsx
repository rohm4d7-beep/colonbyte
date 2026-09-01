'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, BedDouble, Users, Banknote } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />

      {/* Browser chrome */}
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/60">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 w-48 rounded-md bg-border/70 mx-auto" />
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden sm:flex w-14 flex-col items-center gap-3 py-4 border-r border-border bg-muted/40">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-xl ${i === 0 ? 'bg-primary' : 'bg-border/70'}`}
              />
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-36 rounded bg-foreground/80 mb-1.5" />
                <div className="h-3 w-24 rounded bg-muted-foreground/30" />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/15 border-2 border-primary/20" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Revenue', value: 'Rs 5,24,800', icon: Banknote, change: '+8.2%' },
                { label: 'Occupancy', value: '94%', icon: BedDouble, change: '+2.1%' },
                { label: 'Students', value: '486', icon: Users, change: '+12' },
                { label: 'Vacant', value: '12', icon: BedDouble, change: '-3' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl border border-border p-3 shadow-sm"
                >
                  <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-base font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-20 rounded bg-foreground/70" />
                <div className="flex gap-2">
                  <div className="h-3 w-12 rounded bg-primary/15" />
                  <div className="h-3 w-12 rounded bg-muted" />
                </div>
              </div>
              {/* Illustrative chart bars */}
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95, 80, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/15"
                    style={{ height: `${h}%` }}
                  >
                    {i % 3 === 2 && (
                      <div
                        className="w-full rounded-sm bg-primary"
                        style={{ height: '100%' }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m) => (
                  <div key={m} className="text-[9px] text-muted-foreground/60">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Table preview */}
            <div className="bg-card rounded-xl border border-border p-3 shadow-sm">
              <div className="h-3 w-24 rounded bg-foreground/60 mb-3" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b last:border-0 border-border/60">
                  <div className="h-6 w-6 rounded-full bg-primary/15 flex-shrink-0" />
                  <div className="h-2.5 w-28 rounded bg-border/80" />
                  <div className="ml-auto h-2.5 w-12 rounded bg-muted" />
                  <div className="h-4 w-12 rounded-full bg-emerald-500/15" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-4 bg-card rounded-xl border border-border shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-foreground/90">AI Active</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-4 -left-4 bg-card rounded-xl border border-border shadow-lg px-3 py-2"
      >
        <div className="text-xs text-muted-foreground mb-0.5">Illustrative example</div>
        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+18.4% revenue</div>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-24 sm:pt-20 sm:pb-32">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(to right, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-accent px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
              <span className="text-xs font-semibold text-accent-foreground">
                AI-powered hostel operations
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-foreground leading-[1.1]"
            >
              Run every hostel from{' '}
              <span className="font-heading italic font-normal text-primary">one</span>{' '}
              intelligent platform.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              DormOS helps hostel owners automate finance, student management, rooms, maintenance,
              mess operations, analytics and AI reporting — all from a single dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'gap-2 text-base h-12 px-6',
                )}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#ai"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'gap-2 text-base h-12 px-6',
                )}
              >
                See it in action
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-4 text-sm text-muted-foreground/80"
            >
              No credit card required · 14-day free trial · Cancel anytime
            </motion.p>
          </div>

          {/* Right: dashboard mockup */}
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
