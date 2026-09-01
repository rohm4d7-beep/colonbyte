import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Maintenance Reports — DormOS' }

export default function MaintenanceReportsPage() {
  return <ReportCategoryPage categoryId="maintenance" />
}
