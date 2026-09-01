import type { Metadata } from 'next'
import { ReportBuilderPage } from '@/components/reports/report-builder-page'

export const metadata: Metadata = {
  title: 'Report Builder — DormOS',
  description: 'Design a custom report with a date range, module, chart type and filters, then preview and export.',
}

export default function ReportBuilderRoutePage() {
  return <ReportBuilderPage />
}
