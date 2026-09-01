'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserCheck,
  CalendarClock,
  FileWarning,
  PiggyBank,
  ArrowRightLeft,
  FileText,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { DataTable } from '@/components/shared/data-table'
import { studentColumns } from '@/components/students/student-table'
import {
  StudentFilters,
  filterStudents,
  activeStudentFilterCount,
  DEFAULT_STUDENT_FILTERS,
  type StudentFiltersState,
  type StudentFilterOptions,
} from '@/components/students/student-filters'
import { MoveStudentModal } from '@/components/students/move-student-modal'
import { ExportButton } from '@/components/shared/export-button'
import { STUDENTS, BEDS, studentSearchIndex } from '@/lib/mock-data'
import { fetchStudents } from '@/lib/students-api'
import { getActiveHostelId } from '@/lib/api'
import { formatPKR } from '@/lib/format'
import type { Student } from '@/types/dorm'

const STUDENT_STATUSES = ['Active', 'Graduated', 'Check-in Pending', 'Notice Served', 'Inactive']
const FEE_STATUSES = ['Paid', 'Pending', 'Overdue']

export function StudentsListPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<StudentFiltersState>(DEFAULT_STUDENT_FILTERS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [moveStudent, setMoveStudent] = useState<Student | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [liveStudents, setLiveStudents] = useState<Student[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadStudents = useCallback(() => {
    const hostelId = getActiveHostelId()
    if (!hostelId) return
    fetchStudents(hostelId)
      .then((result) => {
        setLiveStudents(result.items)
        setLoadError(null)
      })
      .catch(() => {
        setLoadError('Could not load students from the server.')
      })
  }, [])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  const students = liveStudents ?? STUDENTS
  const searchIndex = useMemo(() => studentSearchIndex(), [])
  const filterOptions: StudentFilterOptions = {
    rooms: [...new Set(students.map((s) => s.roomId).filter(Boolean))] as string[],
    departments: searchIndex.departments,
    universities: searchIndex.universities,
    statuses: STUDENT_STATUSES,
    feeStatuses: FEE_STATUSES,
  }

  const filtered = useMemo(() => filterStudents(students, filters), [students, filters])

  const activeCount = activeStudentFilterCount(filters)
  const resetFilters = () => setFilters(DEFAULT_STUDENT_FILTERS)

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIds.includes(student.id)),
    [students, selectedIds],
  )

  const analytics: AnalyticsItem[] = useMemo(() => {
    const active = students.filter((s) => s.status === 'Active').length
    const pendingCheckin = students.filter((s) => s.status === 'Check-in Pending').length
    const noticeServed = students.filter((s) => s.status === 'Notice Served').length
    const overdue = students.filter((s) => s.feeStatus === 'Overdue')
    const totalDues = overdue.reduce((sum, s) => sum + s.outstandingDues, 0)
    const occupiedBeds = BEDS.filter((bed) => bed.status === 'Occupied').length
    const occupancy = BEDS.length > 0 ? Math.round((occupiedBeds / BEDS.length) * 100) : 0
    return [
      {
        id: 'total',
        label: 'Total Students',
        value: String(students.length),
        sub: 'All time registrations',
        icon: Users,
        accent: 'blue',
        trend: { value: '+4.2%', positive: true },
      },
      {
        id: 'active',
        label: 'Active Residents',
        value: String(active),
        sub: 'Currently residing',
        icon: UserCheck,
        accent: 'emerald',
        trend: { value: '+2.1%', positive: true },
      },
      {
        id: 'pending',
        label: 'Pending Check-in',
        value: String(pendingCheckin),
        sub: 'Awaiting arrival',
        icon: CalendarClock,
        accent: 'amber',
      },
      {
        id: 'notices',
        label: 'Notice Served',
        value: String(noticeServed),
        sub: 'Under review',
        icon: FileWarning,
        accent: 'rose',
      },
      {
        id: 'dues',
        label: 'Overdue Dues',
        value: `${overdue.length} students`,
        sub: `Total ${formatPKR(totalDues)}`,
        icon: PiggyBank,
        accent: 'rose',
        trend: { value: '-1.8%', positive: true },
      },
      {
        id: 'occupancy',
        label: 'Occupancy',
        value: `${occupancy}%`,
        sub: `${occupiedBeds} of ${BEDS.length} beds filled`,
        icon: Users,
        accent: 'cyan',
        trend: { value: '+1.4%', positive: true },
      },
    ]
  }, [students])

  const csvColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'university', label: 'University' },
    { key: 'department', label: 'Department' },
    { key: 'semester', label: 'Semester' },
    { key: 'roomId', label: 'Room' },
    { key: 'status', label: 'Status' },
    { key: 'feeStatus', label: 'Fee Status' },
  ]

  const exportData = filtered.map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    university: student.university,
    department: student.department,
    semester: student.semester,
    roomId: student.roomId ?? '',
    status: student.status,
    feeStatus: student.feeStatus,
  }))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Students"
        description="Manage student profiles, documents, check-ins and fee records."
        icon={Users}
        crumbs={[{ label: 'Students' }]}
        actions={
          <Button render={<Link href="/dashboard/students/new" />}>
            <UserPlus className="mr-1 h-3.5 w-3.5" />
            Add Student
          </Button>
        }
      />

      <AnalyticsCards items={analytics} />

      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={loadStudents}>
            Retry
          </Button>
        </div>
      )}

      <DataTable
        columns={studentColumns((student) => {
          setMoveStudent(student)
          setModalOpen(true)
        })}
        data={filtered}
        getRowId={(student) => student.id}
        enableRowSelection
        onSelectionChange={setSelectedIds}
        onRowClick={(student) => router.push(`/dashboard/students/${student.id}`)}
        stickyHeader
        showColumnToggle
        loading={liveStudents === null && !loadError}
        toolbar={
          <StudentFilters
            filters={filters}
            onChange={setFilters}
            options={filterOptions}
            onReset={resetFilters}
          />
        }
        actions={
          <>
            {selectedStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMoveStudent(selectedStudents[0])
                  setModalOpen(true)
                }}
              >
                <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
                Move ({selectedStudents.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={selectedStudents.length === 0}
              onClick={() => router.push('/dashboard/finance')}
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              Invoices ({selectedStudents.length})
            </Button>
            <ExportButton
              data={exportData}
              columns={csvColumns}
              filename={`students-${new Date().toISOString().slice(0, 10)}`}
              label="Export CSV"
            />
          </>
        }
        emptyTitle="No students found"
        emptyDescription={
          activeCount > 0
            ? 'No students match the current filters. Try clearing some filters.'
            : 'Get started by adding your first student.'
        }
        emptyAction={
          activeCount === 0 ? (
            <Button render={<Link href="/dashboard/students/new" />}>
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              Add Student
            </Button>
          ) : undefined
        }
        initialColumnVisibility={{ phone: false, bedId: false, admissionDate: false }}
        initialPageSize={10}
      />

      <MoveStudentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        student={moveStudent}
      />
    </div>
  )
}
