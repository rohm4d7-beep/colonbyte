import { mulberry32, pick, dateBefore } from './rng'

const rand = mulberry32(20260803)

export type TicketCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Cleaning'
  | 'Furniture'
  | 'Painting'
  | 'Internet'
  | 'Air Conditioning'
  | 'General'

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled'

export type TimelineEntry = {
  date: string
  action: string
  by: string
  note?: string
}

export type MaintenanceTicket = {
  id: string
  ticketNumber: string
  title: string
  room: string
  floor: number
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  description: string
  reportedBy: string
  assignedTo: string
  assignedDept: string
  createdAt: string
  updatedAt: string
  scheduledDate: string | null
  completedDate: string | null
  estimatedCost: number
  actualCost: number | null
  timeline: TimelineEntry[]
  images: number
}

const CATEGORIES: TicketCategory[] = [
  'Electrical', 'Plumbing', 'Cleaning', 'Furniture',
  'Painting', 'Internet', 'Air Conditioning', 'General',
]

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical']
const STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled']

const PRIORITY_WEIGHTS = [0.3, 0.35, 0.25, 0.1]
const STATUS_WEIGHTS = [0.2, 0.2, 0.35, 0.2, 0.05]

function weightedPick<T>(rand: () => number, items: T[], weights: number[]): T {
  const r = rand()
  let cumulative = 0
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return items[i]
  }
  return items[items.length - 1]
}

const TICKET_TITLES: Record<TicketCategory, string[]> = {
  Electrical: [
    'Faulty electrical socket not working', 'Main switch tripping repeatedly',
    'Tube light flickering in room', 'Extension cord sparking', 'Power outage on floor 3',
    'Ceiling fan wiring issue', 'Emergency light not charging',
  ],
  Plumbing: [
    'Water leakage from bathroom ceiling', 'Blocked drain in washroom',
    'Water tap leaking continuously', 'Low water pressure on 4th floor',
    'Toilet flush broken', 'Hot water heater not working', 'Water pipe burst in corridor',
  ],
  Cleaning: [
    'Deep cleaning required in room', 'Corridor requires mopping urgently',
    'Washroom sanitation needed', 'Garbage not collected for 2 days',
    'Pest control required', 'Common area cleaning overdue',
  ],
  Furniture: [
    'Bed frame broken and unsafe', 'Study table wobbling badly',
    'Chair leg broken', 'Cupboard door hinge broken', 'Mattress needs replacement',
    'Wardrobe lock broken', 'Desk drawer stuck',
  ],
  Painting: [
    'Paint peeling from damp wall', 'Graffiti on corridor wall',
    'Room walls need fresh coat', 'Staircase railing paint chipped',
    'Bathroom walls discolored from moisture',
  ],
  Internet: [
    'WiFi not working on 3rd floor', 'Router down in Block B',
    'Very slow internet speed in room', 'LAN port not working',
    'WiFi password needs reset', 'Network cable loose in corridor',
  ],
  'Air Conditioning': [
    'AC not cooling properly', 'AC making loud noise',
    'AC remote control not working', 'AC leaking water inside',
    'AC filter needs cleaning', 'AC unit not turning on',
  ],
  General: [
    'Window glass cracked', 'Door lock broken', 'Room key lost',
    'Notice board needs replacement', 'Staircase light broken',
    'Main gate intercom not working', 'Laundry machine broken',
  ],
}

const STAFF_NAMES = [
  'Mohammad Zubair', 'Tariq Hussain', 'Imran Khan',
  'Saeed Ahmad', 'Ali Hassan', 'Bashir Ahmed', 'Abdul Rehman',
]

const DEPARTMENTS: Record<TicketCategory, string> = {
  Electrical: 'Maintenance',
  Plumbing: 'Maintenance',
  Cleaning: 'Cleaning',
  Furniture: 'Maintenance',
  Painting: 'Maintenance',
  Internet: 'Administration',
  'Air Conditioning': 'Maintenance',
  General: 'Maintenance',
}

const REPORTER_NAMES = [
  'Ahmed Raza', 'Usman Khalid', 'Hassan Ali', 'Bilal Hussain', 'Fahad Iqbal',
  'Sara Khan', 'Fatima Noor', 'Zainab Fatima', 'Mahnoor Aslam', 'Asad Malik',
  'Zain Abbas', 'Omar Farooq', 'Talha Noor', 'Faisal Awan', 'Hira Baig',
]

const ROOMS = ['101', '102', '103', '104', '105', '106',
  '201', '202', '203', '204', '205', '206', '207', '208',
  '301', '302', '303', '304', '305', '306',
  '401', '402', '403', '404', '405']

function makeTimeline(status: TicketStatus, createdAt: string, assignedTo: string): TimelineEntry[] {
  const timeline: TimelineEntry[] = [
    { date: createdAt, action: 'Ticket created', by: 'System', note: 'Submitted via hostel portal' },
    { date: new Date(new Date(createdAt).getTime() + 1800000).toISOString(), action: 'Ticket assigned', by: 'Admin', note: `Assigned to ${assignedTo}` },
  ]
  if (status === 'In Progress' || status === 'Resolved' || status === 'Closed') {
    timeline.push({ date: new Date(new Date(createdAt).getTime() + 86400000).toISOString(), action: 'Work started', by: assignedTo, note: 'Visited site and assessed issue' })
  }
  if (status === 'Resolved' || status === 'Closed') {
    timeline.push({ date: new Date(new Date(createdAt).getTime() + 172800000).toISOString(), action: 'Issue resolved', by: assignedTo, note: 'Problem fixed and verified' })
    timeline.push({ date: new Date(new Date(createdAt).getTime() + 200000000).toISOString(), action: 'Ticket closed', by: 'Admin', note: 'Confirmed resolution by resident' })
  }
  return timeline
}

export const MAINTENANCE_TICKETS: MaintenanceTicket[] = Array.from({ length: 250 }, (_, i) => {
  const category = pick(rand, CATEGORIES)
  const priority = weightedPick(rand, PRIORITIES, PRIORITY_WEIGHTS)
  const status = weightedPick(rand, STATUSES, STATUS_WEIGHTS)
  const roomNum = pick(rand, ROOMS)
  const floor = Math.ceil(parseInt(roomNum) / 100)
  const daysAgo = Math.floor(rand() * 120)
  const createdAt = new Date(dateBefore(daysAgo) + 'T' + String(8 + Math.floor(rand() * 12)).padStart(2, '0') + ':' + String(Math.floor(rand() * 60)).padStart(2, '0') + ':00').toISOString()
  const assignedTo = pick(rand, STAFF_NAMES)
  const estimatedCost = pick(rand, [500, 1000, 1500, 2000, 3000, 5000, 8000, 12000])
  const isCompleted = status === 'Resolved' || status === 'Closed'
  const scheduledDate = status !== 'Open' ? dateBefore(daysAgo - 2) : daysAgo < 5 ? dateBefore(-3) : null

  return {
    id: `mnt-${i + 1}`,
    ticketNumber: `MNT-2026-${String(i + 1).padStart(3, '0')}`,
    title: pick(rand, TICKET_TITLES[category]),
    room: `Room ${roomNum}`,
    floor,
    category,
    priority,
    status,
    description: `Reported issue in Room ${roomNum} on floor ${floor}. Requires immediate attention from ${DEPARTMENTS[category]} team. Student has been impacted since the issue was first noticed.`,
    reportedBy: pick(rand, REPORTER_NAMES),
    assignedTo,
    assignedDept: DEPARTMENTS[category],
    createdAt,
    updatedAt: new Date(new Date(createdAt).getTime() + Math.floor(rand() * 86400000 * 3)).toISOString(),
    scheduledDate,
    completedDate: isCompleted ? dateBefore(daysAgo - 5) : null,
    estimatedCost,
    actualCost: isCompleted ? Math.round(estimatedCost * (0.8 + rand() * 0.4)) : null,
    timeline: makeTimeline(status, createdAt, assignedTo),
    images: Math.floor(rand() * 4),
  }
})

// ─── Aggregates ───────────────────────────────────────────────────────────────

export const MAINTENANCE_STATS = {
  open: MAINTENANCE_TICKETS.filter((t) => t.status === 'Open').length,
  inProgress: MAINTENANCE_TICKETS.filter((t) => t.status === 'In Progress').length,
  resolvedThisMonth: MAINTENANCE_TICKETS.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
  avgResolutionDays: 2.4,
  totalCostMTD: 142800,
  critical: MAINTENANCE_TICKETS.filter((t) => t.priority === 'Critical' && (t.status === 'Open' || t.status === 'In Progress')).length,
}

export const MAINTENANCE_BY_CATEGORY = CATEGORIES.map((cat) => {
  const tickets = MAINTENANCE_TICKETS.filter((t) => t.category === cat)
  return {
    category: cat,
    count: tickets.length,
    cost: tickets.reduce((sum, t) => sum + (t.actualCost ?? t.estimatedCost), 0),
    resolved: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
  }
})

export const MAINTENANCE_BY_MONTH = [
  { month: 'Sep', open: 18, resolved: 22, cost: 85000 },
  { month: 'Oct', open: 21, resolved: 19, cost: 92000 },
  { month: 'Nov', open: 15, resolved: 24, cost: 78000 },
  { month: 'Dec', open: 12, resolved: 18, cost: 65000 },
  { month: 'Jan', open: 22, resolved: 20, cost: 95000 },
  { month: 'Feb', open: 19, resolved: 25, cost: 88000 },
  { month: 'Mar', open: 24, resolved: 21, cost: 102000 },
  { month: 'Apr', open: 17, resolved: 23, cost: 79000 },
  { month: 'May', open: 28, resolved: 22, cost: 118000 },
  { month: 'Jun', open: 20, resolved: 26, cost: 98000 },
  { month: 'Jul', open: 23, resolved: 28, cost: 112000 },
  { month: 'Aug', open: 14, resolved: 8, cost: 58000 },
]
