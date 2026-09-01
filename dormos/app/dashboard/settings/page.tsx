import type { Metadata } from 'next'
import { SettingsPage } from '@/components/settings/settings-page'

export const metadata: Metadata = {
  title: 'Settings — DormOS',
  description: 'Manage your hostel, account, security, billing and AI preferences.',
}

export default function SettingsRoutePage() {
  return <SettingsPage />
}
