import type { Metadata } from 'next'
import { StudentsListPage } from '@/components/students/students-list'

export const metadata: Metadata = {
  title: 'Students — DormOS',
  description: 'Manage student profiles, documents, check-ins and fee records.',
}

export default function StudentsPage() {
  return <StudentsListPage />
}
