import type { Metadata } from 'next'
import { BedsPage } from '@/components/beds/beds-page'

export const metadata: Metadata = {
  title: 'Beds — DormOS',
  description: 'Browse and manage individual beds across every room and floor.',
}

export default function BedsRoute() {
  return <BedsPage />
}
