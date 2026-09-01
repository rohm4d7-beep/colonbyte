import type { Metadata } from 'next'
import { ReportCategoryPage } from '@/components/reports/report-category-page'

export const metadata: Metadata = { title: 'Student Reports — DormOS' }

export default function StudentReportsPage() {
  return <ReportCategoryPage categoryId="students" />
}
