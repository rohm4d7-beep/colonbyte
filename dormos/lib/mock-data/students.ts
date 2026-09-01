import type {
  Student,
  StudentStatus,
  FeeStatus,
  Guardian,
  EmergencyContact,
  StudentDocument,
} from '@/types/dorm'
import {
  MALE_FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  UNIVERSITIES,
  DEPARTMENTS,
  BLOOD_GROUPS,
  MESS_PLANS,
  STREET_NAMES,
} from './names'
import { mulberry32, pick } from './rng'

export const STUDENT_COUNT = 120

function padCnic(rand: () => number): string {
  const a = 35201 + Math.floor(rand() * 4)
  const b = Math.floor(rand() * 9000000) + 1000000
  const c = Math.floor(rand() * 9)
  return `${a}-${b}-${c}`
}

function padPhone(rand: () => number): string {
  const prefix = pick(rand, ['0300', '0301', '0321', '0333', '0345', '0311', '0302', '0334'])
  const rest = String(Math.floor(rand() * 9000000) + 1000000)
  return `${prefix}-${rest}`
}

function monthShift(iso: string, months: number): string {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function semesterFromAdmission(admission: string): string {
  const months = Math.max(
    1,
    Math.floor(
      (new Date('2026-08-01').getTime() - new Date(admission).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    ),
  )
  return String(Math.min(8, Math.max(1, Math.ceil(months / 4))))
}

const DOC_CATEGORIES = [
  'CNIC',
  'Bonafide Certificate',
  'University Card',
  'Admission Form',
  'Fee Voucher',
  'Undertaking',
  'Medical Certificate',
  'Result Card',
]

function buildDocuments(rand: () => number, admission: string): StudentDocument[] {
  const count = 4 + Math.floor(rand() * 3)
  const categories = [...DOC_CATEGORIES].sort(() => rand() - 0.5).slice(0, count)
  return categories.map((category, index) => ({
    id: `doc-${Math.floor(rand() * 100000)}-${index}`,
    name: category,
    category,
    size: `${(200 + Math.floor(rand() * 900)).toFixed(0)} KB`,
    uploadedAt: index === 0 ? admission : monthShift(admission, -Math.floor(rand() * 6)),
    status: rand() < 0.72 ? 'Verified' : rand() < 0.85 ? 'Pending' : 'Expired',
  }))
}

export function buildStudents(): Student[] {
  const rand = mulberry32(20260801)
  const students: Student[] = []
  const usedFirstNames = new Set<string>()

  for (let i = 0; i < STUDENT_COUNT; i++) {
    let first = pick(rand, MALE_FIRST_NAMES)
    while (usedFirstNames.has(first) && rand() < 0.9) {
      first = pick(rand, MALE_FIRST_NAMES)
    }
    usedFirstNames.add(first)
    const last = pick(rand, LAST_NAMES)
    const name = `${first} ${last}`

    const admissionYear = pick(rand, ['2023', '2023', '2024', '2024', '2024', '2025', '2025', '2026'])
    const admissionDate = `${admissionYear}-0${1 + Math.floor(rand() * 8)}-${String(
      1 + Math.floor(rand() * 27),
    ).padStart(2, '0')}`

    const guardianName = `Mr. ${last} ${pick(rand, ['Sahib', 'Muhammad', '']).trim()}`
    const guardianRelation = pick(rand, ['Father', 'Father', 'Father', 'Uncle', 'Brother'])
    const city = pick(rand, CITIES)
    const street = pick(rand, STREET_NAMES)

    const feeRoll = rand()
    const feeStatus: FeeStatus = feeRoll < 0.62 ? 'Paid' : feeRoll < 0.85 ? 'Pending' : 'Overdue'
    const statusRoll = rand()
    const status: StudentStatus =
      statusRoll < 0.78
        ? 'Active'
        : statusRoll < 0.86
          ? 'Graduated'
          : statusRoll < 0.93
            ? 'Notice Served'
            : statusRoll < 0.98
              ? 'Check-in Pending'
              : 'Inactive'

    const monthlyFee = 12000 + Math.floor(rand() / 0.2) * 2000

    const medicalNotes =
      rand() < 0.14
        ? pick(rand, [
            'Mild asthma — carries inhaler',
            'Allergic to peanuts',
            'Requires low-salt diet',
            'Diabetes (Type 1)',
            'Seasonal allergies',
          ])
        : 'None'

    const guardian: Guardian = {
      name: guardianName,
      relation: guardianRelation,
      phone: padPhone(rand),
      occupation: pick(rand, ['Businessman', 'Government Officer', 'Engineer', 'Doctor', 'Teacher', 'Farmer', 'Retired']),
    }
    const emergencyContact: EmergencyContact = {
      name: pick(rand, ['Mrs. ', 'Mr. ']) + `${last} ${pick(rand, ['Khanum', 'Sahib'])}`,
      relation: pick(rand, ['Mother', 'Father', 'Brother', 'Uncle']),
      phone: padPhone(rand),
    }

    students.push({
      id: `STU-${1000 + i}`,
      name,
      cnic: padCnic(rand),
      gender: 'Male',
      dateOfBirth: `${2003 + Math.floor(rand() * 5)}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 27)).padStart(2, '0')}`,
      phone: padPhone(rand),
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i % 7 === 0 ? `${100 + Math.floor(rand() * 900)}` : ''}@gmail.com`,
      address: `${street}, ${city}`,
      bloodGroup: pick(rand, BLOOD_GROUPS),
      medicalNotes,
      university: pick(rand, UNIVERSITIES),
      department: pick(rand, DEPARTMENTS),
      semester: `Semester ${semesterFromAdmission(admissionDate)}`,
      registrationNo: `${String(2000 + Math.floor(rand() * 30))}-${String(10000 + Math.floor(rand() * 90000))}`,
      admissionDate,
      status,
      feeStatus,
      monthlyFee,
      outstandingDues:
        feeStatus === 'Paid' ? 0 : feeStatus === 'Pending' ? monthlyFee : monthlyFee * 2,
      roomId: null,
      bedId: null,
      messPlan: pick(rand, MESS_PLANS),
      guardian,
      emergencyContact,
      documents: buildDocuments(rand, admissionDate),
    })
  }

  return students
}
