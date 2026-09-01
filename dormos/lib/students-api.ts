import { API_BASE, getToken } from '@/lib/api'
import type { Student, StudentStatus, FeeStatus } from '@/types/dorm'

export type StudentListResult = {
  items: Student[]
  total: number
  page: number
  limit: number
  pageCount: number
}

type ApiStudent = Record<string, unknown> & {
  id: string
  name: string
  cnic: string
  gender: 'Male' | 'Female'
  phone: string
  status: string
  feeStatus: string
  roomId: string | null
  bedId: string | null
  room?: { id: string; number: string } | null
}

const STATUS_MAP: Record<string, StudentStatus> = {
  Active: 'Active',
  Graduated: 'Graduated',
  CheckInPending: 'Check-in Pending',
  NoticeServed: 'Notice Served',
  Inactive: 'Inactive',
}

const FEE_STATUS_MAP: Record<string, FeeStatus> = {
  Paid: 'Paid',
  Pending: 'Pending',
  Overdue: 'Overdue',
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function num(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

export function mapStudent(raw: ApiStudent): Student {
  return {
    id: raw.id,
    name: str(raw.name),
    cnic: str(raw.cnic),
    gender: raw.gender === 'Female' ? 'Female' : 'Male',
    dateOfBirth: str(raw.dateOfBirth),
    phone: str(raw.phone),
    email: str(raw.email),
    address: str(raw.address),
    bloodGroup: str(raw.bloodGroup),
    medicalNotes: str(raw.medicalNotes),
    university: str(raw.university),
    department: str(raw.department),
    semester: str(raw.semester),
    registrationNo: str(raw.registrationNo),
    admissionDate: str(raw.admissionDate),
    status: STATUS_MAP[str(raw.status)] ?? 'Active',
    feeStatus: FEE_STATUS_MAP[str(raw.feeStatus)] ?? 'Pending',
    monthlyFee: num(raw.monthlyFee),
    outstandingDues: num(raw.outstandingDues),
    roomId: raw.roomId ?? null,
    bedId: raw.bedId ?? null,
    messPlan: str(raw.messPlan) || 'Full',
    guardian: (raw.guardian as Student['guardian']) ?? {
      name: '',
      relation: '',
      phone: '',
      occupation: '',
    },
    emergencyContact: (raw.emergencyContact as Student['emergencyContact']) ?? {
      name: '',
      relation: '',
      phone: '',
    },
    documents: (raw.documents as Student['documents']) ?? [],
  }
}

export async function fetchStudents(
  hostelId: string,
  params?: Record<string, string>,
): Promise<StudentListResult> {
  const search = new URLSearchParams({ hostelId, limit: '200', ...params })
  const res = await fetch(`${API_BASE}/api/students?${search}`, {
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Failed to load students (${res.status})`)
  }
  const json = await res.json()
  return {
    items: (json.items ?? []).map(mapStudent),
    total: json.total ?? 0,
    page: json.page ?? 1,
    limit: json.limit ?? 200,
    pageCount: json.pageCount ?? 0,
  }
}

export async function createStudent(payload: Record<string, unknown>): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to create student')
  }
  return mapStudent(await res.json())
}

export async function updateStudent(
  id: string,
  payload: Record<string, unknown>,
): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to update student')
  }
  return mapStudent(await res.json())
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'DELETE',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete student')
}

export async function allocateStudent(id: string, bedId: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/api/students/${id}/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ bedId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'Failed to allocate bed')
  }
  return mapStudent(await res.json())
}
