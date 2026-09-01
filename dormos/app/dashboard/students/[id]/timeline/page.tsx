import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { History } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StudentTimeline } from '@/components/students/student-timeline'
import { STUDENTS_BY_ID } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'

interface StudentTimelineRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: StudentTimelineRouteProps): Promise<Metadata> {
  const { id } = await params
  const student = STUDENTS_BY_ID.get(id)
  return {
    title: student ? `Timeline — ${student.name} — DormOS` : 'Timeline — DormOS',
  }
}

export default async function StudentTimelineRoute({
  params,
}: StudentTimelineRouteProps) {
  const { id } = await params
  const student = STUDENTS_BY_ID.get(id)
  if (!student) notFound()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Activity Timeline"
        description={`Full audit trail of ${student.name}'s stay at the hostel.`}
        icon={History}
        crumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: student.id, href: `/dashboard/students/${student.id}` },
          { label: 'Timeline' },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href={`/dashboard/students/${student.id}`} />}>
            Back to profile
          </Button>
        }
      />
      <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
        <StudentTimeline studentId={student.id} />
      </div>
    </div>
  )
}
