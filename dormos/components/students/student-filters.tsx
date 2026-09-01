'use client'

import { RotateCcw } from 'lucide-react'
import type { Student, FeeStatus, StudentStatus } from '@/types/dorm'
import { SearchBar } from '@/components/shared/search-bar'
import { FilterSelect, type FilterOption } from '@/components/shared/filter-select'
import { FilterDrawer } from '@/components/shared/filter-drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export type StudentFiltersState = {
  search: string
  room: string
  department: string
  university: string
  status: string
  feeStatus: string
  dateFrom: string
  dateTo: string
}

export const DEFAULT_STUDENT_FILTERS: StudentFiltersState = {
  search: '',
  room: 'all',
  department: 'all',
  university: 'all',
  status: 'all',
  feeStatus: 'all',
  dateFrom: '',
  dateTo: '',
}

export function activeStudentFilterCount(filters: StudentFiltersState): number {
  let count = 0
  if (filters.search.trim()) count++
  if (filters.room !== 'all') count++
  if (filters.department !== 'all') count++
  if (filters.university !== 'all') count++
  if (filters.status !== 'all') count++
  if (filters.feeStatus !== 'all') count++
  if (filters.dateFrom) count++
  if (filters.dateTo) count++
  return count
}

export function filterStudents(
  students: Student[],
  filters: StudentFiltersState,
): Student[] {
  const search = filters.search.trim().toLowerCase()
  return students.filter((student) => {
    if (
      search &&
      ![student.name, student.id, student.email, student.cnic, student.phone, student.university, student.department, student.roomId ?? ''].some((value) =>
        value.toLowerCase().includes(search),
      )
    ) {
      return false
    }
    if (filters.room !== 'all' && student.roomId !== filters.room) return false
    if (filters.department !== 'all' && student.department !== filters.department) return false
    if (filters.university !== 'all' && student.university !== filters.university) return false
    if (filters.status !== 'all' && student.status !== (filters.status as StudentStatus)) {
      return false
    }
    if (filters.feeStatus !== 'all' && student.feeStatus !== (filters.feeStatus as FeeStatus)) {
      return false
    }
    if (filters.dateFrom && student.admissionDate < filters.dateFrom) return false
    if (filters.dateTo && student.admissionDate > filters.dateTo) return false
    return true
  })
}

export type StudentFilterOptions = {
  rooms: string[]
  departments: string[]
  universities: string[]
  statuses: string[]
  feeStatuses: string[]
}

interface StudentFilterControlsProps {
  filters: StudentFiltersState
  onChange: (filters: StudentFiltersState) => void
  options: StudentFilterOptions
  stacked?: boolean
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-xs font-medium text-gray-500">{children}</Label>
}

export function StudentFilterControls({
  filters,
  onChange,
  options,
  stacked,
}: StudentFilterControlsProps) {
  const set = (patch: Partial<StudentFiltersState>) => onChange({ ...filters, ...patch })

  const roomOptions: FilterOption[] = options.rooms.map((room) => ({
    value: room,
    label: `Room ${room}`,
  }))
  const departmentOptions: FilterOption[] = options.departments.map((department) => ({
    value: department,
    label: department,
  }))
  const universityOptions: FilterOption[] = options.universities.map((university) => ({
    value: university,
    label: university,
  }))
  const statusOptions: FilterOption[] = options.statuses.map((status) => ({
    value: status,
    label: status,
  }))
  const feeOptions: FilterOption[] = options.feeStatuses.map((fee) => ({
    value: fee,
    label: fee,
  }))

  if (stacked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Search</FieldLabel>
          <SearchBar
            value={filters.search}
            onChange={(value) => set({ search: value })}
            placeholder="Search name, ID, email…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Room</FieldLabel>
          <FilterSelect
            value={filters.room}
            onValueChange={(value) => set({ room: value })}
            placeholder="Room"
            options={roomOptions}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Department</FieldLabel>
          <FilterSelect
            value={filters.department}
            onValueChange={(value) => set({ department: value })}
            placeholder="Department"
            options={departmentOptions}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>University</FieldLabel>
          <FilterSelect
            value={filters.university}
            onValueChange={(value) => set({ university: value })}
            placeholder="University"
            options={universityOptions}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Status</FieldLabel>
          <FilterSelect
            value={filters.status}
            onValueChange={(value) => set({ status: value })}
            placeholder="Status"
            options={statusOptions}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Fee Status</FieldLabel>
          <FilterSelect
            value={filters.feeStatus}
            onValueChange={(value) => set({ feeStatus: value })}
            placeholder="Fee Status"
            options={feeOptions}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Admission from</FieldLabel>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => set({ dateFrom: event.target.value })}
              aria-label="Admission date from"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Admission to</FieldLabel>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => set({ dateTo: event.target.value })}
              aria-label="Admission date to"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBar
        value={filters.search}
        onChange={(value) => set({ search: value })}
        placeholder="Search students…"
        className="w-56"
      />
      <FilterSelect
        value={filters.room}
        onValueChange={(value) => set({ room: value })}
        placeholder="Room"
        options={roomOptions}
      />
      <FilterSelect
        value={filters.department}
        onValueChange={(value) => set({ department: value })}
        placeholder="Department"
        options={departmentOptions}
      />
      <FilterSelect
        value={filters.university}
        onValueChange={(value) => set({ university: value })}
        placeholder="University"
        options={universityOptions}
      />
      <FilterSelect
        value={filters.status}
        onValueChange={(value) => set({ status: value })}
        placeholder="Status"
        options={statusOptions}
      />
      <FilterSelect
        value={filters.feeStatus}
        onValueChange={(value) => set({ feeStatus: value })}
        placeholder="Fee"
        options={feeOptions}
      />
    </div>
  )
}

interface StudentFiltersProps extends StudentFilterControlsProps {
  onReset: () => void
}

export function StudentFilters({ filters, onChange, options, onReset }: StudentFiltersProps) {
  const activeCount = activeStudentFilterCount(filters)
  return (
    <>
      <StudentFilterControls filters={filters} onChange={onChange} options={options} />
      <FilterDrawer activeCount={activeCount}>
        <StudentFilterControls
          filters={filters}
          onChange={onChange}
          options={options}
          stacked
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={activeCount === 0}
          className="w-full"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Reset filters
        </Button>
      </FilterDrawer>
    </>
  )
}
