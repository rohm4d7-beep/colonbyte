import type { Metadata } from 'next'
import { HostelDetailPage } from '@/components/settings/hostel-detail-page'

export const metadata: Metadata = {
  title: 'Hostel Details — DormOS',
  description: 'Manage members, billing, subscription and usage for a hostel.',
}

export default async function HostelDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <HostelDetailPage hostelId={id} />
}
