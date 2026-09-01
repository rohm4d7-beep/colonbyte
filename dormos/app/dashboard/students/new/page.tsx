import type { Metadata } from 'next'
import { StudentFormPage } from '@/components/students/student-form-page'

export const metadata: Metadata = {
  title: 'Add Student — DormOS',
}

export default function AddStudentRoute() {
  return <StudentFormPage mode="add" />
}
