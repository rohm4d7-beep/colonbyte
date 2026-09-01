import type { Metadata } from 'next'
import { StudentFormPage } from '@/components/students/student-form-page'

interface EditStudentRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: EditStudentRouteProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Edit Student ${id} — DormOS`,
  }
}

export default async function EditStudentRoute({
  params,
}: EditStudentRouteProps) {
  const { id } = await params
  return <StudentFormPage mode="edit" studentId={id} />
}
