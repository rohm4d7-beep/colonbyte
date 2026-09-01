import type { Metadata } from 'next'
import { AnalyticsPage } from '@/components/analytics/analytics-page'

export const metadata: Metadata = {
  title: 'Analytics — DormOS',
  description: 'Executive KPIs and advanced trend analysis across every module.',
}

export default function AnalyticsRoutePage() {
  return <AnalyticsPage />
}
