import type {
  Bed,
  MaintenanceEntry,
  PaymentRecord,
  Room,
  Student,
  TimelineEvent,
  TimelineType,
} from '@/types/dorm'
import { buildRooms, buildBeds, BUILDINGS, FLOORS } from './rooms'
import { buildStudents } from './students'
import { mulberry32 } from './rng'
import { formatDateShort } from '@/lib/format'

export { BUILDINGS, FLOORS } from './rooms'

const rand = mulberry32(20260802)

function monthShift(iso: string, months: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + Math.floor(rand() * 6))
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function dayShift(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function allocate(
  students: Student[],
  rooms: Room[],
  beds: Bed[],
): { beds: Bed[]; byRoom: Map<string, Bed[]> } {
  const byRoom = new Map<string, Bed[]>()
  for (const room of rooms) {
    byRoom.set(
      room.id,
      beds.filter((bed) => bed.roomId === room.id),
    )
  }

  const availableRooms = rooms.filter(
    (room) => room.status === 'Occupied' || room.status === 'Vacant',
  )
  const sorted = [...students].sort((a, b) =>
    a.admissionDate.localeCompare(b.admissionDate),
  )

  const index = 0
  const occupied = new Map<string, Bed[]>()
  for (const student of sorted) {
    let placed = false
    for (let guard = 0; guard < availableRooms.length && !placed; guard++) {
      const room = availableRooms[(index + guard) % availableRooms.length]
      const roomBeds = byRoom.get(room.id) ?? []
      const vacantBed = roomBeds.find(
        (bed) => bed.status === 'Vacant' && bed.studentId === null,
      )
      if (vacantBed) {
        vacantBed.status = 'Occupied'
        vacantBed.studentId = student.id
        student.roomId = room.id
        student.bedId = vacantBed.id
        const list = occupied.get(room.id) ?? []
        list.push(vacantBed)
        occupied.set(room.id, list)
        placed = true
      }
    }
    if (!placed) break
  }

  for (const room of availableRooms) {
    const list = occupied.get(room.id) ?? []
    if (list.length > 0) {
      room.status = 'Occupied'
    } else {
      room.status = 'Vacant'
    }
  }

  return { beds, byRoom }
}

function buildPayments(students: Student[]): PaymentRecord[] {
  const records: PaymentRecord[] = []
  const methods = ['JazzCash', 'Easypaisa', 'Bank Transfer', 'Cash', 'Card']

  students.forEach((student, i) => {
    const count =
      student.feeStatus === 'Paid' ? 3 + Math.floor(rand() * 2) : 1 + Math.floor(rand() * 2)
    for (let p = 0; p < count; p++) {
      const pending = student.feeStatus !== 'Paid' && p === count - 1
      records.push({
        id: `PAY-${String(1000 + i * 10 + p).padStart(4, '0')}`,
        studentId: student.id,
        invoiceNo: `INV-${String(2080 - Math.floor(rand() * 500) + i).padStart(4, '0')}`,
        amount: pending
          ? Math.round(student.monthlyFee * (0.4 + rand() * 0.6))
          : student.monthlyFee,
        method: methods[Math.floor(rand() * methods.length)],
        date: pending
          ? dayShift('2026-07-25', -Math.floor(rand() * 5))
          : monthShift('2026-07-20', -p),
        status: pending
          ? rand() < 0.7
            ? 'Pending'
            : 'Failed'
          : 'Completed',
      })
    }
  })

  return records.sort((a, b) => b.date.localeCompare(a.date))
}

function buildMaintenanceHistory(rooms: Room[]): MaintenanceEntry[] {
  const entries: MaintenanceEntry[] = []
  const titles = [
    'AC cooling issue',
    'Bathroom plumbing leak',
    'Flickering tube light',
    'Wardrobe hinge repair',
    'Window latch replacement',
    'Water seepage in ceiling',
    'Fan speed regulator fix',
    'Door lock replacement',
  ]
  for (const room of rooms) {
    const hasHistory =
      room.maintenanceStatus !== 'None' || room.status === 'Maintenance' || rand() < 0.3
    if (!hasHistory) continue
    const count = 1 + Math.floor(rand() * 3)
    for (let i = 0; i < count; i++) {
      entries.push({
        id: `MT-${room.id}-${i}`,
        roomId: room.id,
        title: titles[Math.floor(rand() * titles.length)],
        date: dayShift('2026-07-10', -Math.floor(rand() * 180)),
        status: rand() < 0.6 ? 'Resolved' : rand() < 0.5 ? 'In Progress' : 'Scheduled',
      })
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

const TIMELINE_META: Record<
  TimelineType,
  { title: string; icon: TimelineType }
> = {
  admitted: { title: 'Student admitted', icon: 'admitted' },
  room_allocated: { title: 'Room allocated', icon: 'room_allocated' },
  fee_received: { title: 'Fee received', icon: 'fee_received' },
  complaint: { title: 'Complaint created', icon: 'complaint' },
  maintenance: { title: 'Maintenance requested', icon: 'maintenance' },
  mess_plan: { title: 'Mess plan updated', icon: 'mess_plan' },
  documents: { title: 'Documents uploaded', icon: 'documents' },
}

function buildTimeline(students: Student[], payments: PaymentRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = []
  for (const student of students) {
    const admission = student.admissionDate
    const firstPayment = payments
      .filter((payment) => payment.studentId === student.id)
      .sort((a, b) => a.date.localeCompare(b.date))[0]

    events.push({
      id: `${student.id}-t1`,
      studentId: student.id,
      type: 'documents',
      ...TIMELINE_META.documents,
      description: 'CNIC, bonafide certificate and admission form verified.',
      date: dayShift(admission, -3),
      actor: 'Admissions Office',
    })
    events.push({
      id: `${student.id}-t2`,
      studentId: student.id,
      type: 'admitted',
      ...TIMELINE_META.admitted,
      description: `${student.name} joined ${student.department} at ${student.university}.`,
      date: admission,
      actor: 'Admissions Office',
    })
    if (student.roomId) {
      events.push({
        id: `${student.id}-t3`,
        studentId: student.id,
        type: 'room_allocated',
        ...TIMELINE_META.room_allocated,
        description: `Allocated Room ${student.roomId}${student.bedId ? `, Bed ${student.bedId.split('-').pop()}` : ''} on ${formatDateShort(admission)}.`,
        date: dayShift(admission, 1),
        actor: 'Warden Office',
      })
    }
    if (firstPayment && firstPayment.date >= admission) {
      events.push({
        id: `${student.id}-t4`,
        studentId: student.id,
        type: 'fee_received',
        ...TIMELINE_META.fee_received,
        description: `PKR ${firstPayment.amount.toLocaleString()} received via ${firstPayment.method} (${firstPayment.invoiceNo}).`,
        date: firstPayment.date,
        actor: 'Finance Office',
      })
    }
    const messMonth = 2 + Math.floor(rand() * 6)
    events.push({
      id: `${student.id}-t5`,
      studentId: student.id,
      type: 'mess_plan',
      ...TIMELINE_META.mess_plan,
      description: `${student.messPlan} mess plan selected for the current term.`,
      date: monthShift(admission, messMonth),
      actor: 'Mess Committee',
    })
    if (student.status === 'Notice Served' || rand() < 0.12) {
      events.push({
        id: `${student.id}-t6`,
        studentId: student.id,
        type: 'complaint',
        ...TIMELINE_META.complaint,
        description: 'Reported Wi-Fi connectivity issue in the room block.',
        date: monthShift(admission, 1 + Math.floor(rand() * 4)),
        actor: student.name,
      })
    }
  }
  return events.sort((a, b) => b.date.localeCompare(a.date))
}

export const STUDENTS: Student[] = buildStudents()
export const ROOMS: Room[] = buildRooms()
export const BEDS: Bed[] = buildBeds(ROOMS)

const { beds: allocatedBeds } = allocate(STUDENTS, ROOMS, BEDS)

export const OCCUPIED_BEDS = allocatedBeds.filter((bed) => bed.status === 'Occupied').length

export const PAYMENTS: PaymentRecord[] = buildPayments(STUDENTS)
export const MAINTENANCE_HISTORY: MaintenanceEntry[] = buildMaintenanceHistory(ROOMS)
export const TIMELINE: TimelineEvent[] = buildTimeline(STUDENTS, PAYMENTS)

export const ROOMS_BY_ID = new Map(ROOMS.map((room) => [room.id, room]))
export const STUDENTS_BY_ID = new Map(STUDENTS.map((student) => [student.id, student]))

export const BEDS_BY_ROOM = new Map<string, Bed[]>()
for (const room of ROOMS) {
  BEDS_BY_ROOM.set(
    room.id,
    BEDS.filter((bed) => bed.roomId === room.id),
  )
}

export function studentsInRoom(roomId: string): Student[] {
  return STUDENTS.filter((student) => student.roomId === roomId)
}

export function studentRoom(student: Student): Room | undefined {
  return student.roomId ? ROOMS_BY_ID.get(student.roomId) : undefined
}

export function studentBed(student: Student): Bed | undefined {
  return student.bedId ? BEDS.find((bed) => bed.id === student.bedId) : undefined
}

export function roomOccupancy(room: Room): { occupied: number; vacant: number } {
  const beds = BEDS_BY_ROOM.get(room.id) ?? []
  const occupied = beds.filter((bed) => bed.status === 'Occupied').length
  return { occupied, vacant: room.capacity - occupied }
}

export function floorRooms(floor: number): Room[] {
  return ROOMS.filter((room) => room.floor === floor)
}

export function floorOccupancy(floor: number): { occupied: number; total: number } {
  const beds = BEDS.filter((bed) => {
    const room = ROOMS_BY_ID.get(bed.roomId)
    return room?.floor === floor
  })
  return {
    occupied: beds.filter((bed) => bed.status === 'Occupied').length,
    total: beds.length,
  }
}

export function studentTimeline(studentId: string): TimelineEvent[] {
  return TIMELINE.filter((event) => event.studentId === studentId)
}

export function studentPayments(studentId: string): PaymentRecord[] {
  return PAYMENTS.filter((payment) => payment.studentId === studentId)
}

export function roomMaintenance(roomId: string): MaintenanceEntry[] {
  return MAINTENANCE_HISTORY.filter((entry) => entry.roomId === roomId)
}

export function uniqueValues(key: 'university' | 'department'): string[] {
  return [...new Set(STUDENTS.map((student) => student[key]))].sort()
}

export function studentSearchIndex() {
  return {
    universities: uniqueValues('university'),
    departments: uniqueValues('department'),
    rooms: ROOMS.map((room) => room.id),
    buildings: BUILDINGS,
    floors: [...FLOORS],
  }
}
