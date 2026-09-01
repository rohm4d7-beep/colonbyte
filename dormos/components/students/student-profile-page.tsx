'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, ArrowRightLeft, FileText, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StudentProfileCard } from '@/components/students/student-profile'
import { StudentTimeline } from '@/components/students/student-timeline'
import { StudentDocuments } from '@/components/students/student-documents'
import { StudentPayments } from '@/components/students/student-payments'
import { MoveStudentModal } from '@/components/students/move-student-modal'
import { STUDENTS_BY_ID } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'documents', label: 'Documents' },
  { id: 'payments', label: 'Payments' },
] as const

type TabId = (typeof TABS)[number]['id']

export function StudentProfilePage({ studentId }: { studentId: string }) {
  const [tab, setTab] = useState<TabId>('overview')
  const [modalOpen, setModalOpen] = useState(false)

  const student = STUDENTS_BY_ID.get(studentId)

  if (!student) notFound()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={student.name}
        description={`${student.registrationNo} · ${student.university}`}
        icon={undefined}
        crumbs={[{ label: 'Students', href: '/dashboard/students' }, { label: student.id }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
              Move Room
            </Button>
            <Button render={<Link href={`/dashboard/students/${student.id}/edit`} />} size="sm">
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </>
        }
      />

      <StudentProfileCard student={student} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-gray-200/70 bg-white p-1 shadow-sm">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none',
                tab === item.id
                  ? 'bg-accent text-primary'
                  : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/finance" />}
          >
            <FileText className="mr-1 h-3.5 w-3.5" />
            Generate Invoice
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(student.id)}>
            <Share2 className="mr-1 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ['CNIC', student.cnic],
                ['Date of Birth', student.dateOfBirth],
                ['Blood Group', student.bloodGroup],
                ['Gender', student.gender],
                ['Semester', student.semester],
                ['Admission Date', student.admissionDate],
                ['Mess Plan', student.messPlan],
                ['Medical Notes', student.medicalNotes],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-gray-50 pb-3">
                  <dt className="text-xs font-medium text-gray-400">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Guardian</h3>
            <dl className="mt-4 space-y-4">
              {[
                ['Guardian Name', student.guardian.name],
                ['Relation', student.guardian.relation],
                ['Phone', student.guardian.phone],
                ['Occupation', student.guardian.occupation],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-gray-50 pb-3">
                  <dt className="text-xs font-medium text-gray-400">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-6 text-sm font-semibold text-gray-900">Emergency Contact</h3>
            <dl className="mt-4 space-y-4">
              {[
                ['Contact', student.emergencyContact.name],
                ['Relation', student.emergencyContact.relation],
                ['Phone', student.emergencyContact.phone],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-gray-50 pb-3">
                  <dt className="text-xs font-medium text-gray-400">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Activity Timeline</h3>
          <StudentTimeline studentId={student.id} />
        </div>
      )}

      {tab === 'documents' && (
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Documents</h3>
          <StudentDocuments documents={student.documents} />
        </div>
      )}

      {tab === 'payments' && (
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Payments</h3>
          <StudentPayments student={student} />
        </div>
      )}

      <MoveStudentModal open={modalOpen} onOpenChange={setModalOpen} student={student} />
    </div>
  )
}
