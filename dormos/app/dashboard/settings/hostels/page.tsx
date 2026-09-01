import type { Metadata } from 'next'
import { HostelsPage } from '@/components/settings/hostels-page'

export const metadata: Metadata = {
  title: 'Hostels — DormOS',
  description: 'Manage all hostels in your workspace, switch between them and track usage.',
}

export default function HostelsRoutePage() {
  return <HostelsPage />
}
