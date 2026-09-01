import type { Metadata } from 'next'
import { ScholarshipsPage } from '@/components/finance/scholarships-page'

export const metadata: Metadata = {
  title: 'Scholarships — DormOS',
  description: 'Award and manage merit and need-based scholarships for residents.',
}

export default function ScholarshipsRoutePage() {
  return <ScholarshipsPage />
}
