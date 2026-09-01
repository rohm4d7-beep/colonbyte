'use client'

import { notFound } from 'next/navigation'
import { UserPlus, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { AddStudentForm } from '@/components/students/add-student-form'
import { STUDENTS_BY_ID } from '@/lib/mock-data'

export function StudentFormPage({
  mode,
  studentId,
}: {
  mode: 'add' | 'edit'
  studentId?: string
}) {
  const student = studentId ? STUDENTS_BY_ID.get(studentId) : undefined

  if (mode === 'edit' && studentId && !student) notFound()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={mode === 'add' ? 'Add Student' : 'Edit Student'}
        description={
          mode === 'add'
            ? 'Register a new student with personal, guardian and room details.'
            : `Update the record for ${student?.name}.`
        }
        icon={mode === 'add' ? UserPlus : Pencil}
        crumbs={[
          { label: 'Students', href: '/dashboard/students' },
          { label: mode === 'add' ? 'Add' : 'Edit' },
        ]}
      />
      <AddStudentForm mode={mode} student={student} />
    </div>
  )
}
