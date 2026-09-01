import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Staff Reports — DormOS' }

export default function StaffReportsPage() {
  return <ReportCategoryPage categoryId="staff" />
}
