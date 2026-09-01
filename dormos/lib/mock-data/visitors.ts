import { mulberry32, pick, dateBefore } from './rng'

const rand = mulberry32(20260804)

export type VisitorStatus = 'Checked In' | 'Checked Out' | 'Overstay'
export type VisitorPurpose = 'Family Visit' | 'Document Collection' | 'Emergency' | 'Parent Meeting' | 'Delivery' | 'Official Business'
export type VisitorRelationship = 'Parent' | 'Sibling' | 'Friend' | 'Relative' | 'Guardian' | 'Official'

export type Visitor = {
  id: string
  visitorId: string
  name: string
  cnic: string
  phone: string
  relationship: VisitorRelationship
  visitingStudent: string
  studentRoom: string
  purpose: VisitorPurpose
  checkIn: string
  checkOut: string | null
  duration: string | null
  passNumber: string
  status: VisitorStatus
  approvedBy: string
  notes: string | null
}

const MALE_NAMES = [
  'Mohammad Tariq', 'Abdul Rehman', 'Khalid Mehmood', 'Zafar Iqbal', 'Asif Nawaz',
  'Imran Cheema', 'Naveed Akhtar', 'Riaz Hussain', 'Waseem Baig', 'Aamir Siddiqui',
  'Rashid Qureshi', 'Tahir Abbas', 'Nadeem Butt', 'Saleem Mirza', 'Javed Awan',
  'Kamran Sheikh', 'Arshad Chaudhry', 'Pervaiz Ahmad', 'Shahid Malik', 'Waqar Ali',
]

const FEMALE_NAMES = [
  'Sana Bibi', 'Rukhsana Khatoon', 'Amna Sultana', 'Nasreen Akhtar', 'Safia Begum',
  'Zubeda Parveen', 'Shahnaz Fatima', 'Haleema Sadia', 'Razia Begum', 'Tahira Qureshi',
  'Farida Hussain', 'Nargis Malik', 'Bushra Sheikh', 'Shamim Akhtar', 'Gulnaz Baig',
]

const ALL_VISITOR_NAMES = [...MALE_NAMES, ...FEMALE_NAMES]

const STUDENT_NAMES = [
  'Ahmed Raza', 'Usman Khalid', 'Hassan Ali', 'Bilal Hussain', 'Fahad Iqbal',
  'Zain Abbas', 'Omar Farooq', 'Asad Malik', 'Hamza Sheikh', 'Saad Qureshi',
  'Sara Khan', 'Fatima Noor', 'Zainab Fatima', 'Mahnoor Aslam', 'Ayesha Siddiqi',
  'Hira Baig', 'Nimra Malik', 'Sana Tariq', 'Nadia Hussain', 'Rabia Akhtar',
]

const ROOMS = [
  'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202',
  'Room 203', 'Room 204', 'Room 205', 'Room 208', 'Room 210',
  'Room 301', 'Room 304', 'Room 305', 'Room 401', 'Room 402',
]

const RELATIONSHIPS: VisitorRelationship[] = ['Parent', 'Sibling', 'Friend', 'Relative', 'Guardian', 'Official']
const PURPOSES: VisitorPurpose[] = ['Family Visit', 'Document Collection', 'Emergency', 'Parent Meeting', 'Delivery', 'Official Business']
const STAFF_NAMES = ['Reception Officer', 'Warden Ahmed', 'Guard Bashir', 'Receptionist Sadia']

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function makeCNIC(): string {
  const area = 35000 + Math.floor(rand() * 999)
  const serial = 1000000 + Math.floor(rand() * 8999999)
  const check = Math.floor(rand() * 9)
  return `${area}-${serial}-${check}`
}

function makePhone(): string {
  const prefixes = ['0300', '0301', '0302', '0303', '0311', '0312', '0321', '0333', '0345']
  return `${pick(rand, prefixes)}-${String(1000000 + Math.floor(rand() * 8999999)).slice(0, 7)}`
}

export const VISITORS: Visitor[] = Array.from({ length: 500 }, (_, i) => {
  const daysAgo = Math.floor(rand() * 90)
  const isToday = daysAgo === 0
  const isCheckedIn = isToday && rand() < 0.15
  const isOverstay = isCheckedIn && rand() < 0.08

  const checkInHour = 9 + Math.floor(rand() * 9) // 9am to 6pm
  const checkInMin = Math.floor(rand() * 60)
  const baseDate = new Date(dateBefore(daysAgo))
  baseDate.setHours(checkInHour, checkInMin, 0, 0)
  const checkInISO = baseDate.toISOString()

  const durationMinutes = 30 + Math.floor(rand() * 210) // 30min to 3.5h
  let checkOut: string | null = null
  let duration: string | null = null
  let status: VisitorStatus = 'Checked Out'

  if (isCheckedIn) {
    status = isOverstay ? 'Overstay' : 'Checked In'
    checkOut = null
    duration = null
  } else {
    const checkOutDate = new Date(baseDate.getTime() + durationMinutes * 60000)
    checkOut = checkOutDate.toISOString()
    duration = formatDuration(durationMinutes)
    status = 'Checked Out'
  }

  return {
    id: `vis-${i + 1}`,
    visitorId: `VIS-2026-${String(i + 1).padStart(4, '0')}`,
    name: pick(rand, ALL_VISITOR_NAMES),
    cnic: makeCNIC(),
    phone: makePhone(),
    relationship: pick(rand, RELATIONSHIPS),
    visitingStudent: pick(rand, STUDENT_NAMES),
    studentRoom: pick(rand, ROOMS),
    purpose: pick(rand, PURPOSES),
    checkIn: checkInISO,
    checkOut,
    duration,
    passNumber: `PASS-${String(1000 + i).padStart(4, '0')}`,
    status,
    approvedBy: pick(rand, STAFF_NAMES),
    notes: rand() < 0.15 ? 'Student confirmed relationship. Documents checked.' : null,
  }
})

// ─── Aggregates ───────────────────────────────────────────────────────────────

const todayVisitors = VISITORS.filter((v) => {
  const d = new Date(v.checkIn)
  const today = new Date()
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
})

export const VISITOR_STATS = {
  totalToday: todayVisitors.length,
  checkedInNow: VISITORS.filter((v) => v.status === 'Checked In').length,
  checkedOutToday: todayVisitors.filter((v) => v.status === 'Checked Out').length,
  overstayCount: VISITORS.filter((v) => v.status === 'Overstay').length,
  totalAllTime: VISITORS.length,
  avgDuration: '1h 45m',
  thisMonth: VISITORS.filter((v) => {
    const d = new Date(v.checkIn)
    return d.getMonth() === new Date().getMonth()
  }).length,
}

export const VISITOR_BY_DAY = Array.from({ length: 30 }, (_, i) => {
  const date = dateBefore(29 - i)
  return {
    date,
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: 5 + Math.floor(rand() * 20),
  }
})

export const VISITOR_BY_PURPOSE = PURPOSES.map((purpose) => ({
  purpose,
  count: VISITORS.filter((v) => v.purpose === purpose).length,
}))

export const VISITOR_BY_RELATIONSHIP = RELATIONSHIPS.map((relationship) => ({
  relationship,
  count: VISITORS.filter((v) => v.relationship === relationship).length,
}))
