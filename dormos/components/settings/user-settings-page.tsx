'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserRound, ShieldCheck, Globe, MonitorSmartphone } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SettingsSection, FieldRow, TextInput, SelectInput, Toggle, Divider } from './settings-ui'
import { PROFILE_MENU } from '@/constants/dashboard'

export function UserSettingsPage() {
  const [prefs, setPrefs] = useState({ twoFactor: true, loginAlerts: false, digest: true, mentionEmail: true })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, password and account security."
        icon={UserRound}
        crumbs={[{ label: 'Settings', href: '/dashboard/settings' }, { label: 'My Profile' }]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center rounded-2xl border border-gray-200/70 bg-white p-6 text-center shadow-sm lg:col-span-1"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-2xl font-bold text-white shadow-lg shadow-primary/30">
            {PROFILE_MENU.initials}
          </div>
          <p className="mt-4 text-base font-semibold text-gray-900">{PROFILE_MENU.name}</p>
          <p className="text-sm text-gray-400">{PROFILE_MENU.email}</p>
          <span className="mt-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary">{PROFILE_MENU.role}</span>
          <button className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none">
            Upload new avatar
          </button>
          <div className="mt-6 w-full rounded-xl bg-gray-50/70 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Profile completion</span>
              <span className="text-gray-400">85%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full w-[85%] rounded-full bg-primary" />
            </div>
          </div>
        </motion.div>

        {/* Forms */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <SettingsSection title="Profile information" description="Your name and contact details.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Full name</label>
                <TextInput defaultValue={PROFILE_MENU.name} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Role</label>
                <TextInput defaultValue={PROFILE_MENU.role} disabled className="bg-gray-50 text-gray-400" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Email address</label>
                <TextInput defaultValue={PROFILE_MENU.email} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Language</label>
                <SelectInput defaultValue="English">
                  <option>English</option>
                  <option>Urdu</option>
                </SelectInput>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Theme</label>
                <SelectInput defaultValue="Light">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </SelectInput>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <SaveButton />
            </div>
          </SettingsSection>

          <SettingsSection title="Password" description="Keep your account secure with a strong password.">
            <FieldRow label="Current password">
              <TextInput type="password" defaultValue="password123" />
            </FieldRow>
            <Divider />
            <FieldRow label="New password" hint="Min 8 characters, one number">
              <TextInput type="password" placeholder="Enter new password" />
            </FieldRow>
            <Divider />
            <FieldRow label="Confirm new password">
              <TextInput type="password" placeholder="Re-enter new password" />
            </FieldRow>
            <div className="mt-5 flex justify-end">
              <SaveButton />
            </div>
          </SettingsSection>

          <SettingsSection title="Two-factor authentication" description="Add an extra layer of protection to your account.">
            <Toggle checked={prefs.twoFactor} onChange={(v) => setPrefs({ ...prefs, twoFactor: v })} label="Enable two-factor authentication" description="You'll enter a one-time code from your authenticator app when signing in." />
            <Divider />
            <Toggle checked={prefs.loginAlerts} onChange={(v) => setPrefs({ ...prefs, loginAlerts: v })} label="Sign-in notifications" description="Get an email whenever your account is accessed from a new device." />
          </SettingsSection>

          <SettingsSection title="Notification preferences" description="Control which emails you receive.">
            <Toggle checked={prefs.digest} onChange={(v) => setPrefs({ ...prefs, digest: v })} label="Daily digest" description="A summary of yesterday's activity, sent every morning." />
            <Divider />
            <Toggle checked={prefs.mentionEmail} onChange={(v) => setPrefs({ ...prefs, mentionEmail: v })} label="Mentions & assignments" description="Emails when you're mentioned or assigned a task." />
          </SettingsSection>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary"><MonitorSmartphone className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-medium text-gray-900">Active session</p>
                <p className="text-xs text-gray-400">Chrome on Linux · Lahore, PK · 2h ago</p>
              </div>
              <button className="ml-auto text-xs font-medium text-rose-500 transition-colors hover:text-rose-600">Sign out</button>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Globe className="h-4 w-4" /></span>
              <div>
                <p className="text-sm font-medium text-gray-900">Workspace role</p>
                <p className="text-xs text-gray-400">Managed in role management</p>
              </div>
              <button className="ml-auto flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Roles</button>
            </div>
          </div>
        </div>
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
