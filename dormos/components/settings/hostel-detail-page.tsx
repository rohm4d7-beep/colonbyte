'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2, ArrowLeft, Users, BedDouble, CreditCard, UserPlus, Check, Globe, Mail,
  ArrowUpRight, Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'
import { HOSTELS, HOSTEL_MEMBERS, HOSTEL_BILLING, USAGE_STATS, SUBSCRIPTION_PLANS } from '@/lib/mock-data/hostels'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'subscription', label: 'Subscription', icon: Wallet },
  { id: 'usage', label: 'Usage', icon: BedDouble },
] as const

type TabId = (typeof TABS)[number]['id']

const PLAN_STYLES: Record<string, string> = {
  Starter: 'bg-gray-100 text-gray-600',
  Professional: 'bg-accent text-primary',
  Enterprise: 'bg-violet-50 text-violet-600',
}

export function HostelDetailPage({ hostelId }: { hostelId: string }) {
  const hostel = HOSTELS.find((h) => h.id === hostelId)
  const [tab, setTab] = useState<TabId>('overview')

  if (!hostel) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={hostel.name}
        description={hostel.location}
        icon={Building2}
        crumbs={[{ label: 'Settings', href: '/dashboard/settings' }, { label: 'Hostels', href: '/dashboard/settings/hostels' }, { label: hostel.name }]}
        actions={
          <>
            <Link
              href="/dashboard/settings/hostels"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              All hostels
            </Link>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
              <ArrowUpRight className="h-4 w-4" />
              Switch to hostel
            </button>
          </>
        }
      />

      {/* Meta strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Users, label: 'Students', value: String(hostel.students) },
          { icon: BedDouble, label: 'Total beds', value: String(hostel.beds) },
          { icon: ArrowUpRight, label: 'Occupancy', value: `${hostel.occupancy}%` },
          { icon: Wallet, label: 'Plan', value: hostel.plan },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-base font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="inline-flex max-w-full flex-wrap rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((item) => {
          const Icon = item.icon
          const active = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                active ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tab === 'overview' && <OverviewTab hostelId={hostelId} />}
        {tab === 'members' && <MembersTab />}
        {tab === 'billing' && <BillingTab />}
        {tab === 'subscription' && <SubscriptionTab currentPlan={hostel.plan} />}
        {tab === 'usage' && <UsageTab />}
      </motion.div>
    </div>
  )
}

function OverviewTab({ hostelId }: { hostelId: string }) {
  const hostel = HOSTELS.find((h) => h.id === hostelId)!
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm lg:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900">Hostel information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: 'Hostel name', value: hostel.name, icon: Building2 },
            { label: 'Location', value: hostel.location, icon: Globe },
            { label: 'Tagline', value: hostel.tagline, icon: BedDouble },
            { label: 'Workspace ID', value: hostel.id, icon: Wallet },
          ].map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="flex items-start gap-3 rounded-xl bg-gray-50/70 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Status</h3>
        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-50/70 px-4 py-3">
            <span className="text-xs font-medium text-gray-600">Hostel status</span>
            <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', hostel.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : hostel.status === 'Trial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
              {hostel.status}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50/70 px-4 py-3">
            <span className="text-xs font-medium text-gray-600">Plan</span>
            <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', PLAN_STYLES[hostel.plan])}>{hostel.plan}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50/70 px-4 py-3">
            <span className="text-xs font-medium text-gray-600">Members</span>
            <span className="text-sm font-semibold text-gray-900">{HOSTEL_MEMBERS.filter((m) => m.status === 'Active').length}</span>
          </div>
          <button className="mt-auto inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
            <Mail className="h-4 w-4" />
            Invite member
          </button>
        </div>
      </div>
    </div>
  )
}

function MembersTab() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Hostel members</h3>
          <p className="text-xs text-gray-400">{HOSTEL_MEMBERS.filter((m) => m.status === 'Active').length} active members</p>
        </div>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>
      <ul className="divide-y divide-gray-50">
        {HOSTEL_MEMBERS.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/50">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', member.color)}>
              {member.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-400">{member.email}</p>
            </div>
            <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 sm:block">{member.role}</span>
            <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-semibold', member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
              {member.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Billing history</h3>
        <p className="text-xs text-gray-400">Invoices for {HOSTEL_BILLING.currentPlan} plan</p>
      </div>
      <ul className="divide-y divide-gray-50">
        {HOSTEL_BILLING.invoices.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
              <p className="text-xs text-gray-400">{invoice.period}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-900">Rs {invoice.amount.toLocaleString()}</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                <Check className="h-3 w-3" />
                {invoice.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Next billing: <span className="font-semibold text-gray-800">{HOSTEL_BILLING.nextBilling}</span> · Rs {HOSTEL_BILLING.monthlyAmount.toLocaleString()}/month
          </p>
          <button className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
            Update payment method
          </button>
        </div>
      </div>
    </div>
  )
}

function SubscriptionTab({ currentPlan }: { currentPlan: string }) {
  return (
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
              plan.name === currentPlan
                ? 'border border-gray-200 bg-white text-gray-400'
                : plan.highlighted
                  ? 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/80'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
            )}
          >
            {plan.name === currentPlan ? 'Current plan' : `Switch to ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  )
}

function UsageTab() {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Usage</h3>
      <p className="text-xs text-gray-400">Billing-period consumption for this hostel</p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {USAGE_STATS.map((stat) => {
          const pct = Math.min(100, Math.round((stat.used / stat.limit) * 100))
          return (
            <div key={stat.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                <span className="text-xs text-gray-400">{stat.used} / {stat.limit} {stat.unit}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className={cn('h-full rounded-full transition-all duration-500', stat.accent, pct >= 90 && 'animate-pulse')} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {pct >= 90 ? 'Near limit — upgrade recommended' : `${100 - pct}% remaining`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
