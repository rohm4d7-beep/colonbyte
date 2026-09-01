import type { Metadata } from 'next'
import { NotificationCenterPage } from '@/components/notifications/notification-center-page'

export const metadata: Metadata = {
  title: 'Notifications — DormOS',
  description: 'Everything that needs your attention across finance, maintenance, students, visitors and more.',
}

export default function NotificationsRoutePage() {
  return <NotificationCenterPage />
}
