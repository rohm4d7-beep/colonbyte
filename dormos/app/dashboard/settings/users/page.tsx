import type { Metadata } from 'next'
import { UserSettingsPage } from '@/components/settings/user-settings-page'

export const metadata: Metadata = {
  title: 'My Profile — DormOS',
  description: 'Manage your personal information, password and account security.',
}

export default function UserSettingsRoutePage() {
  return <UserSettingsPage />
}
