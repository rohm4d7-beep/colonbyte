import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StudentProfilePage } from '@/components/students/student-profile-page'
import { STUDENTS_BY_ID } from '@/lib/mock-data'

interface StudentProfileRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: StudentProfileRouteProps): Promise<Metadata> {
  const { id } = await params
  const student = STUDENTS_BY_ID.get(id)
  return {
    title: student ? `${student.name} — DormOS` : 'Student — DormOS',
  }
}

export default async function StudentProfileRoute({
  params,
}: StudentProfileRouteProps) {
  const { id } = await params
  if (!STUDENTS_BY_ID.has(id)) notFound()
  return <StudentProfilePage studentId={id} />
}
