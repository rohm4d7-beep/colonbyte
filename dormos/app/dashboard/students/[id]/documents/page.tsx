import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StudentDocuments } from '@/components/students/student-documents'
import { STUDENTS_BY_ID } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

interface StudentDocumentsRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: StudentDocumentsRouteProps): Promise<Metadata> {
  const { id } = await params
  const student = STUDENTS_BY_ID.get(id)
  return {
    title: student ? `Documents — ${student.name} — DormOS` : 'Documents — DormOS',
  }
}

export default async function StudentDocumentsRoute({
  params,
}: StudentDocumentsRouteProps) {
  const { id } = await params
  const student = STUDENTS_BY_ID.get(id)
  if (!student) notFound()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Documents"
        description={`Verify and manage uploaded documents for ${student.name}.`}
        icon={FileText}
        crumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: student.id, href: `/dashboard/students/${student.id}` },
          { label: 'Documents' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href={`/dashboard/students/${student.id}`} />}>
            Back to profile
          </Button>
        }
      />
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <StudentDocuments documents={student.documents} />
      </div>
    </div>
  )
}
