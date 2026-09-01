'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 51000 },
  { month: 'Apr', revenue: 67000 },
  { month: 'May', revenue: 72000 },
  { month: 'Jun', revenue: 89000 },
  { month: 'Jul', revenue: 95000 },
  { month: 'Aug', revenue: 108000 },
  { month: 'Sep', revenue: 98000 },
  { month: 'Oct', revenue: 115000 },
  { month: 'Nov', revenue: 124500 },
  { month: 'Dec', revenue: 132000 },
]

const STATS = [
  { label: 'Total Revenue', value: 'Rs 124,500', change: '+18.4%' },
  { label: 'Occupancy Rate', value: '94%', change: '+2.1%' },
  { label: 'Vacant Beds', value: '12', change: '-3' },
  { label: 'Active Students', value: '486', change: '+24' },
]

export function DashboardShowcase() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            eyebrow="Live dashboard"
            title="See everything at a glance."
            subtitle="Real-time data across every dimension of your hostel — revenue, occupancy, students, and operations — all in one view."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 relative"
        >
          {/* Callout badges */}
          <div className="absolute -left-4 top-1/3 hidden lg:flex items-center gap-2 bg-card rounded-xl border border-border shadow-lg px-4 py-3 z-10">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground/90">Real-time sync</span>
          </div>
          <div className="absolute -right-4 top-1/4 hidden lg:flex items-center gap-2 bg-card rounded-xl border border-border shadow-lg px-4 py-3 z-10">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-foreground/90">AI-Powered</span>
          </div>

          {/* Dashboard frame */}
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/40">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-6">
                <div className="h-6 max-w-sm rounded-lg bg-border/60 mx-auto flex items-center px-3">
                  <div className="h-2.5 w-32 rounded bg-muted-foreground/30 mx-auto" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-border" />
                <div className="h-3 w-3 rounded-full bg-border" />
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <aside className="hidden md:flex w-56 flex-col border-r border-border p-4 gap-1">
                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-primary" />
                  <div className="h-3.5 w-16 rounded bg-foreground/80" />
                </div>
                {['Dashboard', 'Students', 'Rooms', 'Finance', 'Mess', 'Reports'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${i === 0 ? 'bg-primary' : 'hover:bg-muted'}`}
                  >
                    <div className={`h-4 w-4 rounded-md ${i === 0 ? 'bg-primary-foreground/40' : 'bg-border'}`} />
                    <span className={`text-xs font-medium ${i === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </aside>

              {/* Content */}
              <main className="flex-1 p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-foreground">Good morning, Ahmed 👋</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Here’s what’s happening today</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 rounded-lg bg-muted" />
                    <div className="h-8 w-8 rounded-full bg-primary/15 border-2 border-card shadow" />
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="bg-card rounded-xl border border-border shadow-sm p-3">
                      <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-semibold text-foreground/90">Revenue Overview</div>
                      <div className="text-xs text-muted-foreground">Last 12 months · illustrative example</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 rounded-lg px-2.5 py-1">
                      ↑ 18.4% vs last year
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: 12,
                          color: 'var(--foreground)',
                        }}
                        formatter={(v) => [`Rs ${(Number(v) / 1000).toFixed(0)}k`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
