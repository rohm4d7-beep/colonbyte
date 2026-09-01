import { mulberry32, pick, dateBefore } from './rng'

const rand = mulberry32(20260805)

export type StaffDepartment = 'Warden' | 'Reception' | 'Security' | 'Kitchen' | 'Cleaning' | 'Maintenance' | 'Administration'
export type StaffStatus = 'Active' | 'On Leave' | 'Resigned' | 'Suspended'
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave'
export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'Casual'
export type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export type Employee = {
  id: string
  employeeId: string
  name: string
  initials: string
  avatarColor: string
  department: StaffDepartment
  designation: string
  phone: string
  cnic: string
  email: string
  address: string
  joiningDate: string
  salary: number
  allowances: number
  status: StaffStatus
  leaveBalance: number
  attendanceRate: number
  assignedTasks: string[]
}

export type AttendanceLog = {
  id: string
  employeeId: string
  employeeName: string
  department: StaffDepartment
  date: string
  status: AttendanceStatus
}

export type LeaveRequest = {
  id: string
  employeeId: string
  employeeName: string
  department: StaffDepartment
  designation: string
  leaveType: LeaveType
  from: string
  to: string
  days: number
  reason: string
  status: LeaveRequestStatus
  appliedOn: string
}

export type PayrollRecord = {
  employeeId: string
  name: string
  department: StaffDepartment
  designation: string
  salary: number
  allowances: number
  bonus: number
  deductions: number
  tax: number
  netSalary: number
  paymentStatus: 'Paid' | 'Pending' | 'On Hold'
  paymentDate: string | null
}

export type Department = {
  name: StaffDepartment
  head: string
  headDesignation: string
  count: number
  budget: number
  description: string
  color: string
  icon: string
}

const DEPT_DESIGNATIONS: Record<StaffDepartment, string[]> = {
  Warden: ['Chief Warden', 'Senior Warden', 'Assistant Warden', 'Night Warden'],
  Reception: ['Head Receptionist', 'Receptionist', 'Front Desk Officer', 'Admin Coordinator'],
  Security: ['Security Supervisor', 'Security Guard', 'Night Watchman', 'Gate Keeper'],
  Kitchen: ['Mess Supervisor', 'Head Cook', 'Cook', 'Kitchen Helper', 'Dishwasher'],
  Cleaning: ['Cleaning Supervisor', 'Housekeeping Staff', 'Cleaner', 'Sweeper'],
  Maintenance: ['Maintenance Supervisor', 'Electrician', 'Plumber', 'Handyman', 'Helper'],
  Administration: ['Admin Manager', 'Accountant', 'HR Officer', 'Office Assistant', 'Data Entry'],
}

const DEPT_SALARIES: Record<StaffDepartment, [number, number]> = {
  Warden: [45000, 75000],
  Reception: [28000, 45000],
  Security: [22000, 35000],
  Kitchen: [18000, 35000],
  Cleaning: [15000, 25000],
  Maintenance: [22000, 42000],
  Administration: [30000, 60000],
}

const DEPT_TASKS: Record<StaffDepartment, string[]> = {
  Warden: ['Conduct evening roll call', 'Review gate security reports', 'Handle student complaints', 'Weekly inspection of floors', 'Coordinate mess committee meeting'],
  Reception: ['Manage front desk check-ins', 'Update visitor logbook', 'Handle incoming calls', 'Distribute room keys', 'Process hostel applications'],
  Security: ['Monitor CCTV cameras', 'Patrol building perimeter', 'Manage gate access', 'Night shift surveillance', 'Log security incidents'],
  Kitchen: ['Prepare breakfast menu', 'Manage kitchen stock', 'Supervise food quality', 'Coordinate meal timings', 'Ensure kitchen hygiene'],
  Cleaning: ['Clean corridor floors', 'Sanitize washrooms', 'Refresh common areas', 'Collect garbage', 'Deep clean vacant rooms'],
  Maintenance: ['Fix electrical faults', 'Repair plumbing leaks', 'Inspect AC units', 'Handle furniture repairs', 'Preventive maintenance rounds'],
  Administration: ['Process payroll entries', 'Maintain attendance records', 'Handle vendor invoices', 'Update student records', 'Prepare monthly reports'],
}

const MALE_NAMES = [
  'Mohammad Zubair', 'Tariq Hussain', 'Imran Khan', 'Saeed Ahmad', 'Ali Hassan',
  'Bashir Ahmed', 'Abdul Rehman', 'Khalid Mehmood', 'Riaz Hussain', 'Asif Nawaz',
  'Naveed Akhtar', 'Waseem Baig', 'Aamir Siddiqui', 'Rashid Qureshi', 'Tahir Abbas',
  'Nadeem Butt', 'Saleem Mirza', 'Javed Awan', 'Kamran Sheikh', 'Arshad Chaudhry',
  'Pervaiz Ahmad', 'Shahid Malik', 'Waqar Ali', 'Zahid Hussain', 'Nasir Khan',
  'Ejaz Ahmed', 'Mushtaq Ali', 'Iftikhar Baig', 'Tanveer Sheikh', 'Ghulam Nabi',
  'Hamid Ullah', 'Asghar Ali', 'Manzoor Ahmad', 'Dilnawaz Khan', 'Shafiq Ahmad',
  'Qamar uz Zaman', 'Anwar ul Haq', 'Zulfiqar Ali', 'Liaqat Ali', 'Sabir Hussain',
]

const FEMALE_NAMES = [
  'Sadia Bibi', 'Amna Khatoon', 'Rukhsana Begum', 'Nasreen Akhtar', 'Safia Parveen',
  'Zubeda Bibi', 'Shahnaz Fatima', 'Haleema Sadia', 'Razia Begum', 'Tahira Qureshi',
  'Farida Hussain', 'Nargis Malik', 'Bushra Sheikh', 'Shamim Akhtar', 'Gulnaz Baig',
  'Mehwish Tariq', 'Uzma Noor', 'Shabana Kausar', 'Farzana Begum', 'Tehmina Ali',
  'Nadia Parveen', 'Saima Rashid', 'Asma Iqbal', 'Saeeda Bibi', 'Rohina Malik',
  'Sobia Imran', 'Yasmeen Fatima', 'Zubaida Khatoon', 'Shahida Parveen', 'Khalida Bibi',
  'Nusrat Begum', 'Naseem Akhtar', 'Parveen Bibi', 'Misbah Fatima', 'Lubna Aslam',
  'Rukhsana Bibi', 'Nasima Begum', 'Husna Khatoon', 'Shazia Iqbal', 'Aisha Rehman',
]

const ALL_NAMES = [...MALE_NAMES, ...FEMALE_NAMES]

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-violet-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
]

const DEPARTMENTS: StaffDepartment[] = ['Warden', 'Reception', 'Security', 'Kitchen', 'Cleaning', 'Maintenance', 'Administration']
const DEPT_COUNTS = [6, 8, 12, 14, 16, 14, 10]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

function makeCNIC(rand: () => number): string {
  const area = 35000 + Math.floor(rand() * 999)
  const serial = 1000000 + Math.floor(rand() * 8999999)
  const check = Math.floor(rand() * 9)
  return `${area}-${serial}-${check}`
}

function makePhone(rand: () => number): string {
  const prefixes = ['0300', '0301', '0303', '0311', '0321', '0333']
  return `${pick(rand, prefixes)}-${String(1000000 + Math.floor(rand() * 8999999)).slice(0, 7)}`
}

let empIndex = 0

export const EMPLOYEES: Employee[] = DEPARTMENTS.flatMap((dept, deptIndex) => {
  const count = DEPT_COUNTS[deptIndex]
  const [minSal, maxSal] = DEPT_SALARIES[dept]
  return Array.from({ length: count }, () => {
    empIndex++
    const name = ALL_NAMES[(empIndex - 1) % ALL_NAMES.length]
    const designation = pick(rand, DEPT_DESIGNATIONS[dept])
    const salary = minSal + Math.floor(rand() * (maxSal - minSal))
    const allowances = Math.round(salary * (0.1 + rand() * 0.15))
    const status = rand() < 0.85 ? 'Active' : rand() < 0.5 ? 'On Leave' : 'Resigned' as StaffStatus
    const daysAgo = 180 + Math.floor(rand() * 1095) // 6 months to 3 years ago
    return {
      id: `emp-${empIndex}`,
      employeeId: `EMP-${String(empIndex).padStart(3, '0')}`,
      name,
      initials: initials(name),
      avatarColor: pick(rand, AVATAR_COLORS),
      department: dept,
      designation,
      phone: makePhone(rand),
      cnic: makeCNIC(rand),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@sunrisehostel.pk`,
      address: pick(rand, ['House 12, Gulberg, Lahore', 'Street 4, Model Town, Lahore', 'Block B, Allama Iqbal Town, Lahore', 'Flat 3, DHA Phase 2, Lahore', 'Plot 7, Johar Town, Lahore']),
      joiningDate: dateBefore(daysAgo),
      salary,
      allowances,
      status,
      leaveBalance: Math.floor(rand() * 20),
      attendanceRate: Math.round((88 + rand() * 12) * 10) / 10,
      assignedTasks: DEPT_TASKS[dept].slice(0, 1 + Math.floor(rand() * 3)),
    }
  })
})

// ─── Attendance Logs (last 30 days) ──────────────────────────────────────────

const ATT_STATUSES: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent', 'Leave', 'Half Day']

export const ATTENDANCE_LOGS: AttendanceLog[] = EMPLOYEES.slice(0, 80).flatMap((emp) =>
  Array.from({ length: 30 }, (_, i) => ({
    id: `att-${emp.id}-${i}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    date: dateBefore(29 - i),
    status: pick(rand, ATT_STATUSES),
  }))
)

// ─── Leave Requests ───────────────────────────────────────────────────────────

const LEAVE_REASONS = [
  'Family function', 'Medical emergency', 'Outstation travel', 'Personal matters',
  'Eid holidays', 'Sick - fever and flu', 'Child illness', 'Annual leave',
  'Death in family', 'Court appearance',
]

export const LEAVE_REQUESTS: LeaveRequest[] = Array.from({ length: 40 }, (_, i) => {
  const emp = EMPLOYEES[Math.floor(rand() * EMPLOYEES.length)]
  const leaveType = pick(rand, ['Annual', 'Sick', 'Emergency', 'Casual'] as LeaveType[])
  const daysAgo = Math.floor(rand() * 30)
  const from = dateBefore(daysAgo)
  const days = 1 + Math.floor(rand() * 5)
  const toDate = new Date(from)
  toDate.setDate(toDate.getDate() + days - 1)
  return {
    id: `leave-${i + 1}`,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    designation: emp.designation,
    leaveType,
    from,
    to: toDate.toISOString().slice(0, 10),
    days,
    reason: pick(rand, LEAVE_REASONS),
    status: pick(rand, ['Pending', 'Pending', 'Approved', 'Approved', 'Approved', 'Rejected'] as LeaveRequestStatus[]),
    appliedOn: dateBefore(daysAgo + 2),
  }
})

// ─── Payroll ──────────────────────────────────────────────────────────────────

export const PAYROLL_DATA: PayrollRecord[] = EMPLOYEES.map((emp) => {
  const bonus = emp.attendanceRate > 95 ? Math.round(emp.salary * 0.05) : 0
  const deductions = emp.status === 'On Leave' ? Math.round(emp.salary * 0.1) : 0
  const gross = emp.salary + emp.allowances + bonus - deductions
  const tax = gross > 50000 ? Math.round((gross - 50000) * 0.05) : 0
  const netSalary = gross - tax
  const isPaid = rand() < 0.7
  return {
    employeeId: emp.employeeId,
    name: emp.name,
    department: emp.department,
    designation: emp.designation,
    salary: emp.salary,
    allowances: emp.allowances,
    bonus,
    deductions,
    tax,
    netSalary,
    paymentStatus: emp.status === 'Resigned' ? 'On Hold' : isPaid ? 'Paid' : 'Pending',
    paymentDate: isPaid ? dateBefore(3) : null,
  }
})

// ─── Departments ──────────────────────────────────────────────────────────────

export const DEPT_INFO: Department[] = [
  { name: 'Warden', head: 'Mohammad Zubair', headDesignation: 'Chief Warden', count: 6, budget: 350000, description: 'Oversees daily hostel operations, student welfare and discipline enforcement.', color: 'blue', icon: 'ShieldCheck' },
  { name: 'Reception', head: 'Sadia Bibi', headDesignation: 'Head Receptionist', count: 8, budget: 280000, description: 'Manages guest check-ins, information desk and administrative tasks at front desk.', color: 'cyan', icon: 'ConciergeBell' },
  { name: 'Security', head: 'Tariq Hussain', headDesignation: 'Security Supervisor', count: 12, budget: 320000, description: 'Ensures 24/7 security of premises, monitors CCTV and controls gate access.', color: 'rose', icon: 'Shield' },
  { name: 'Kitchen', head: 'Imran Khan', headDesignation: 'Mess Supervisor', count: 14, budget: 420000, description: 'Prepares three daily meals, manages kitchen hygiene and food quality standards.', color: 'amber', icon: 'ChefHat' },
  { name: 'Cleaning', head: 'Rukhsana Begum', headDesignation: 'Cleaning Supervisor', count: 16, budget: 260000, description: 'Maintains cleanliness of rooms, corridors, washrooms and common areas.', color: 'emerald', icon: 'Sparkles' },
  { name: 'Maintenance', head: 'Saeed Ahmad', headDesignation: 'Maintenance Supervisor', count: 14, budget: 380000, description: 'Handles repairs, electrical and plumbing work and preventive maintenance schedules.', color: 'orange', icon: 'Wrench' },
  { name: 'Administration', head: 'Khalid Mehmood', headDesignation: 'Admin Manager', count: 10, budget: 450000, description: 'Manages HR, payroll, accounts and overall administrative functions of the hostel.', color: 'violet', icon: 'Building2' },
]

// ─── Aggregates ───────────────────────────────────────────────────────────────

export const STAFF_STATS = {
  totalStaff: EMPLOYEES.length,
  activeStaff: EMPLOYEES.filter((e) => e.status === 'Active').length,
  onLeave: EMPLOYEES.filter((e) => e.status === 'On Leave').length,
  pendingLeaves: LEAVE_REQUESTS.filter((l) => l.status === 'Pending').length,
  monthlyPayroll: PAYROLL_DATA.reduce((sum, p) => sum + p.netSalary, 0),
  avgAttendance: Math.round(EMPLOYEES.reduce((sum, e) => sum + e.attendanceRate, 0) / EMPLOYEES.length * 10) / 10,
}
