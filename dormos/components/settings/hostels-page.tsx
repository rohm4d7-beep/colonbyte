'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Plus, ArrowUpRight, Users, BedDouble, Check } from 'lucide-react'
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { HOSTELS, SUBSCRIPTION_PLANS, USAGE_STATS } from '@/lib/mock-data/hostels'
import { cn } from '@/lib/utils'

const PLAN_STYLES: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-600',
  Professional: 'bg-accent text-primary',
  Enterprise: 'bg-violet-50 text-violet-600',
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600',
  Trial: 'bg-amber-50 text-amber-600',
  Suspended: 'bg-rose-50 text-rose-600',
}

export function HostelsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', beds: '100', plan: 'Starter' })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Hostels"
        description="Manage all hostels in your workspace, switch between them and track usage."
        icon={Building2}
        crumbs={[{ label: 'Settings', href: '/dashboard/settings' }, { label: 'Hostels' }]}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" />
            Create hostel
          </button>
        }
      />

      {/* Hostel cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HOSTELS.map((hostel, index) => (
          <motion.div
            key={hostel.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/70 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white', hostel.color)}>
                {hostel.initials}
              </span>
              <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', STATUS_STYLES[hostel.status])}>
                {hostel.status}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{hostel.name}</p>
            <p className="text-xs text-gray-400">{hostel.location}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/70 px-3 py-2.5">
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900"><BedDouble className="h-3.5 w-3.5 text-gray-400" />{hostel.beds}</p>
                <p className="text-[10px] text-gray-400">Beds</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900"><Users className="h-3.5 w-3.5 text-gray-400" />{hostel.students}</p>
                <p className="text-[10px] text-gray-400">Students</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{hostel.occupancy}%</p>
                <p className="text-[10px] text-gray-400">Occupancy</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', PLAN_STYLES[hostel.plan])}>{hostel.plan} plan</span>
              <Link
                href={`/dashboard/settings/hostels/${hostel.id}`}
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                Manage
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        ))}

        {/* Create card */}
        <button
          onClick={() => setCreateOpen(true)}
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/40 text-gray-400 transition-colors hover:border-primary/35 hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Add a new hostel</span>
          <span className="text-xs">Create a workspace for another property</span>
        </button>
      </div>

      {/* Workspace usage */}
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Workspace usage</h3>
            <p className="text-xs text-gray-400">Across all hostels in your Enterprise plan</p>
          </div>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600">Enterprise</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {USAGE_STATS.map((stat) => {
            const pct = Math.min(100, Math.round((stat.used / stat.limit) * 100))
            return (
              <div key={stat.id} className="rounded-xl bg-gray-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">{stat.label}</span>
                  <span className="text-[11px] text-gray-400">{pct}%</span>
                </div>
                <p className="mt-1 text-lg font-bold text-gray-900">{stat.used}<span className="text-xs font-normal text-gray-400"> / {stat.limit}</span></p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div className={cn('h-full rounded-full', stat.accent)} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Subscription plans</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-5',
                plan.highlighted ? 'border-primary/35 bg-accent/40 shadow-md' : 'border-gray-200/70 bg-white shadow-sm',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">Most popular</span>
              )}
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Rs {plan.price.toLocaleString()}
                <span className="text-xs font-normal text-gray-400">/month</span>
              </p>
              <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={cn(
                  'mt-4 inline-flex h-8 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                  plan.highlighted
                    ? 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/80'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                )}
              >
                {plan.name === 'Enterprise' ? 'Current plan' : `Switch to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Create a new hostel</DialogTitle>
          <DialogDescription>
            Add another property to your workspace. You can invite members after creation.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Hostel name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grand View Hostel"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-colors focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, Area"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-colors focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Total beds</label>
                <input
                  value={form.beds}
                  onChange={(e) => setForm({ ...form, beds: e.target.value })}
                  type="number"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-colors focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition-colors focus:border-primary/50 focus:outline-none focus:ring-3 focus:ring-primary/20"
                >
                  <option>Starter</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <DialogClose
                render={
                  <button className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
                    Cancel
                  </button>
                }
              />
              <button
                onClick={() => setCreateOpen(false)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                <Plus className="h-4 w-4" />
                Create hostel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
