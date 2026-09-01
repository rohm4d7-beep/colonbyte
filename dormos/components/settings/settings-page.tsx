'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Building2, Palette, Bell, ShieldCheck, CreditCard,
  Bot, DatabaseBackup, Check, Download, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SettingsSection, FieldRow, TextInput, SelectInput, Toggle, Divider } from './settings-ui'
import { USAGE_STATS, SUBSCRIPTION_PLANS, HOSTEL_BILLING } from '@/lib/mock-data/hostels'
import { cn } from '@/lib/utils'

const NAV = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'hostel', label: 'Hostel Profile', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  { id: 'ai', label: 'AI Preferences', icon: Bot },
  { id: 'backup', label: 'Backup', icon: DatabaseBackup },
] as const

type TabId = (typeof NAV)[number]['id']

export function SettingsPage() {
  const [tab, setTab] = useState<TabId>('general')
  const [notificationPrefs, setNotificationPrefs] = useState({ sms: true, email: true, inApp: true, digest: false, aiDigest: true })
  const [securityPrefs, setSecurityPrefs] = useState({ twoFactor: true, loginAlerts: true, sessionControl: false })
  const [aiPrefs, setAiPrefs] = useState({ autoInsights: true, weeklySummary: true, riskAlerts: true, forecast: true, dataTraining: false })
  const [backupPrefs, setBackupPrefs] = useState({ scheduled: true, encrypted: true })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        description="Manage your hostel, account, security, billing and AI preferences."
        icon={SettingsIcon}
        crumbs={[{ label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Settings nav */}
        <nav aria-label="Settings sections" className="h-fit rounded-2xl border border-gray-200/70 bg-white p-2 shadow-sm lg:sticky lg:top-20">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
                  active ? 'bg-accent text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          {tab === 'general' && <GeneralSettings />}
          {tab === 'hostel' && <HostelProfileSettings />}
          {tab === 'branding' && <BrandingSettings />}
          {tab === 'notifications' && (
            <SettingsSection title="Notification preferences" description="Choose how and when you want to be notified across your hostel.">
              <Toggle checked={notificationPrefs.sms} onChange={(v) => setNotificationPrefs({ ...notificationPrefs, sms: v })} label="SMS alerts" description="Critical alerts sent via SMS to your phone." />
              <Divider />
              <Toggle checked={notificationPrefs.email} onChange={(v) => setNotificationPrefs({ ...notificationPrefs, email: v })} label="Email notifications" description="Daily digests and important updates by email." />
              <Divider />
              <Toggle checked={notificationPrefs.inApp} onChange={(v) => setNotificationPrefs({ ...notificationPrefs, inApp: v })} label="In-app notifications" description="Show notifications inside the dashboard." />
              <Divider />
              <Toggle checked={notificationPrefs.aiDigest} onChange={(v) => setNotificationPrefs({ ...notificationPrefs, aiDigest: v })} label="AI insight digest" description="Weekly summary of AI-generated insights and risks." />
              <Divider />
              <Toggle checked={notificationPrefs.digest} onChange={(v) => setNotificationPrefs({ ...notificationPrefs, digest: v })} label="Marketing updates" description="Product news and feature announcements." />
              <div className="mt-5 flex justify-end">
                <SaveButton />
              </div>
            </SettingsSection>
          )}
          {tab === 'security' && (
            <SettingsSection title="Security" description="Protect your account and control active sessions.">
              <FieldRow label="Current password" hint="You'll be asked to confirm changes">
                <TextInput type="password" defaultValue="password123" />
              </FieldRow>
              <Divider />
              <FieldRow label="New password" hint="At least 8 characters with a number">
                <TextInput type="password" placeholder="Enter new password" />
              </FieldRow>
              <Divider />
              <Toggle checked={securityPrefs.twoFactor} onChange={(v) => setSecurityPrefs({ ...securityPrefs, twoFactor: v })} label="Two-factor authentication" description="Require a one-time code when signing in from a new device." />
              <Divider />
              <Toggle checked={securityPrefs.loginAlerts} onChange={(v) => setSecurityPrefs({ ...securityPrefs, loginAlerts: v })} label="Login alerts" description="Email me when a new device signs in." />
              <Divider />
              <Toggle checked={securityPrefs.sessionControl} onChange={(v) => setSecurityPrefs({ ...securityPrefs, sessionControl: v })} label="Session timeouts" description="Auto sign-out after 30 minutes of inactivity." />
              <div className="mt-5 flex justify-end">
                <SaveButton />
              </div>
            </SettingsSection>
          )}
          {tab === 'billing' && <BillingSettings />}
          {tab === 'ai' && (
            <SettingsSection title="AI preferences" description="Configure how DormOS Intelligence analyzes and reports on your data.">
              <Toggle checked={aiPrefs.autoInsights} onChange={(v) => setAiPrefs({ ...aiPrefs, autoInsights: v })} label="Automatic insights" description="Generate insights from hostel data every night." />
              <Divider />
              <Toggle checked={aiPrefs.weeklySummary} onChange={(v) => setAiPrefs({ ...aiPrefs, weeklySummary: v })} label="Weekly operations summary" description="Receive a weekly narrative report every Monday." />
              <Divider />
              <Toggle checked={aiPrefs.riskAlerts} onChange={(v) => setAiPrefs({ ...aiPrefs, riskAlerts: v })} label="Risk alerts" description="Flag overdue fees, cost spikes and attendance dips." />
              <Divider />
              <Toggle checked={aiPrefs.forecast} onChange={(v) => setAiPrefs({ ...aiPrefs, forecast: v })} label="Revenue & occupancy forecasts" description="Predict next-month performance from historical data." />
              <Divider />
              <Toggle checked={aiPrefs.dataTraining} onChange={(v) => setAiPrefs({ ...aiPrefs, dataTraining: v })} label="Improve models with my data" description="Allow anonymized data to improve AI accuracy." />
              <div className="mt-5 flex justify-end">
                <SaveButton />
              </div>
            </SettingsSection>
          )}
          {tab === 'backup' && (
            <div className="flex flex-col gap-4">
              <SettingsSection title="Backup" description="Keep your hostel data safe with automated and manual backups.">
                <FieldRow label="Backup schedule" hint="Automatic encrypted backups">
                  <SelectInput defaultValue="Daily">
                    <option>Every 6 hours</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                  </SelectInput>
                </FieldRow>
                <Divider />
                <Toggle checked={backupPrefs.scheduled} onChange={(v) => setBackupPrefs({ ...backupPrefs, scheduled: v })} label="Scheduled backups" description="Run backups automatically on the schedule above." />
                <Divider />
                <Toggle checked={backupPrefs.encrypted} onChange={(v) => setBackupPrefs({ ...backupPrefs, encrypted: v })} label="Encrypt backups" description="Protect backups with AES-256 encryption." />
              </SettingsSection>
              <div className="flex items-center justify-between rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Check className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Last backup: 2h ago</p>
                    <p className="text-xs text-gray-400">2.1 GB · Encrypted · All hostels</p>
                  </div>
                </div>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
                  <Download className="h-4 w-4" />
                  Backup now
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function SaveButton() {
  return (
    <button className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none">
      Save changes
    </button>
  )
}

function GeneralSettings() {
  return (
    <SettingsSection title="General" description="Hostel-level defaults used across the workspace.">
      <FieldRow label="Hostel name" hint="Shown in reports and the AI assistant">
        <TextInput defaultValue="Sunrise Hostel" />
      </FieldRow>
      <Divider />
      <FieldRow label="Currency" hint="Used for all financial reporting">
        <SelectInput defaultValue="PKR — Pakistani Rupee">
          <option>PKR — Pakistani Rupee</option>
          <option>USD — US Dollar</option>
          <option>GBP — British Pound</option>
        </SelectInput>
      </FieldRow>
      <Divider />
      <FieldRow label="Timezone" hint="For schedules and visitor logs">
        <SelectInput defaultValue="Asia/Karachi (PKT)">
          <option>Asia/Karachi (PKT)</option>
          <option>Asia/Dubai (GST)</option>
          <option>Europe/London (GMT)</option>
        </SelectInput>
      </FieldRow>
      <Divider />
      <FieldRow label="Language" hint="Interface and report language">
        <SelectInput defaultValue="English">
          <option>English</option>
          <option>Urdu</option>
          <option>Arabic</option>
        </SelectInput>
      </FieldRow>
      <Divider />
      <FieldRow label="Week starts on" hint="Affects calendars and reports">
        <SelectInput defaultValue="Monday">
          <option>Monday</option>
          <option>Sunday</option>
          <option>Saturday</option>
        </SelectInput>
      </FieldRow>
      <div className="mt-5 flex justify-end">
        <SaveButton />
      </div>
    </SettingsSection>
  )
}

function HostelProfileSettings() {
  return (
    <SettingsSection title="Hostel profile" description="Public information about your hostel.">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-sm">
          SH
        </div>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
          Change logo
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Hostel name</label>
          <TextInput defaultValue="Sunrise Hostel" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Tax number</label>
          <TextInput defaultValue="PK-1042837-2" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Address</label>
          <TextInput defaultValue="12-C, Gulberg III, Lahore, Punjab" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Phone</label>
          <TextInput defaultValue="+92 300 123 4567" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Email</label>
          <TextInput defaultValue="hello@sunrisehostel.pk" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Website</label>
          <TextInput defaultValue="https://sunrisehostel.pk" />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <SaveButton />
      </div>
    </SettingsSection>
  )
}

function BrandingSettings() {
  const [branding, setBranding] = useState({ logoOnReports: true })
  return (
    <SettingsSection title="Branding" description="Personalize the look and feel of your workspace.">
      <FieldRow label="Accent color" hint="Used for buttons and active states">
        <div className="flex items-center gap-2">
          {['#1F3D2E', '#2F7D52', '#6B5B95', '#C77E22', '#C13A2A', '#A08B3F'].map((color) => (
            <button
              key={color}
              aria-label={`Accent ${color}`}
              className={cn('h-7 w-7 rounded-lg ring-2 ring-offset-2 transition-transform hover:scale-110', color === '#1F3D2E' ? 'ring-gray-300' : 'ring-transparent')}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </FieldRow>
      <Divider />
      <FieldRow label="Favicon & watermark" hint="Branded on exports and PDFs">
        <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
          Upload files
        </button>
      </FieldRow>
      <Divider />
      <Toggle checked={branding.logoOnReports} onChange={(v) => setBranding({ ...branding, logoOnReports: v })} label="Show logo on reports" description="Embed your logo in every exported report." />
      <div className="mt-5 flex justify-end">
        <SaveButton />
      </div>
    </SettingsSection>
  )
}

function BillingSettings() {
  return (
    <div className="flex flex-col gap-4">
      <SettingsSection title="Current plan" description="Your subscription and usage at a glance.">
        <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-accent/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{HOSTEL_BILLING.currentPlan} plan · Rs {HOSTEL_BILLING.monthlyAmount.toLocaleString()}/month</p>
            <p className="text-xs text-gray-500">Next billing on {HOSTEL_BILLING.nextBilling} · {HOSTEL_BILLING.paymentMethod}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {USAGE_STATS.map((stat) => {
            const pct = Math.min(100, Math.round((stat.used / stat.limit) * 100))
            return (
              <div key={stat.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600">{stat.label}</span>
                  <span className="text-gray-400">{stat.used} / {stat.limit} {stat.unit}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className={cn('h-full rounded-full', stat.accent, pct >= 90 && 'animate-pulse')} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="Available plans" description="Upgrade or downgrade at any time.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-4 transition-shadow',
                plan.highlighted ? 'border-primary/35 bg-accent/40 shadow-md' : 'border-gray-200 bg-white',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">Most popular</span>
              )}
              <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Rs {plan.price.toLocaleString()}
                <span className="text-xs font-normal text-gray-400"> / month</span>
              </p>
              <p className="mt-1 text-[11px] text-gray-400">{plan.period}</p>
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
                  'mt-4 inline-flex h-8 items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
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
      </SettingsSection>

      <SettingsSection title="Invoices" description="Billing history for this hostel.">
        <div className="flex flex-col gap-2">
          {HOSTEL_BILLING.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between rounded-xl bg-gray-50/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{invoice.id}</p>
                <p className="text-xs text-gray-400">{invoice.period}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">Rs {invoice.amount.toLocaleString()}</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  <Check className="h-3 w-3" />
                  {invoice.status}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  )
}
