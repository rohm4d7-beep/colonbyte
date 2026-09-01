import type { Metadata } from 'next'
import { ReportsPage } from '@/components/reports/reports-page'

export const metadata: Metadata = {
  title: 'Reports — DormOS',
  description: 'Generate, schedule and export professional reports across every module.',
}

export default function ReportsRoutePage() {
  return <ReportsPage />
}
