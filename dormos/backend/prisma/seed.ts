import { PrismaClient } from '@prisma/client'
import type { Gender, RoleType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const PERMISSION_MODULES = ['Students', 'Rooms', 'Finance', 'Inventory', 'Reports', 'Visitors', 'Maintenance', 'Staff', 'Settings'] as const

function allPermissions(): Record<string, { canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }> {
  return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, { canCreate: true, canRead: true, canUpdate: true, canDelete: true }]))
}

async function main() {
  console.log('Seeding platform bootstrap...')

  // ── Subscription plans ───────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Starter',
      code: 'starter',
      price: 2500,
      features: ['1 hostel', 'Up to 100 students', '5 GB storage', '10 monthly reports', '50 AI credits', '5 active users'],
      studentLimit: 100,
      hostelLimit: 1,
      storageGB: 5,
      reportLimit: 10,
      aiCredits: 50,
      userLimit: 5,
    },
    {
      name: 'Professional',
      code: 'professional',
      price: 6500,
      highlighted: true,
      features: ['3 hostels', 'Up to 500 students', '50 GB storage', 'Unlimited monthly reports', '500 AI credits', '25 active users', 'Custom reports & exports'],
      studentLimit: 500,
      hostelLimit: 3,
      storageGB: 50,
      reportLimit: 9999,
      aiCredits: 500,
      userLimit: 25,
    },
    {
      name: 'Enterprise',
      code: 'enterprise',
      price: 14900,
      features: ['Unlimited hostels', 'Unlimited students', '500 GB storage', 'Unlimited monthly reports', 'Unlimited AI credits', 'Unlimited users', 'SSO & audit logs', 'Priority support'],
      studentLimit: 100000,
      hostelLimit: 9999,
      storageGB: 500,
      reportLimit: 9999,
      aiCredits: 99999,
      userLimit: 9999,
      ssoEnabled: true,
      auditLogs: true,
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    })
  }

  // ── Super admin user ─────────────────────────────────────────────────────────
  const passwordHash = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dormos.pk' },
    update: {},
    create: {
      email: 'admin@dormos.pk',
      passwordHash,
      firstName: 'DormOS',
      lastName: 'Admin',
      isSuperAdmin: true,
      emailVerified: new Date(),
    },
  })

  // ── Hostel Owner user (login: aqdaspookie@gmail.com) ─────────────────────────
  const ownerPasswordHash = await hash('aqdaspookiezindabaD27', 10)
  const ownerUser = await prisma.user.upsert({
    where: { email: 'aqdaspookie@gmail.com' },
    update: { passwordHash: ownerPasswordHash, isActive: true, emailVerified: new Date() },
    create: {
      email: 'aqdaspookie@gmail.com',
      passwordHash: ownerPasswordHash,
      firstName: 'Aqdas',
      lastName: '',
      emailVerified: new Date(),
    },
  })

  // ── Organization + hostel ────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: 'org-sunrise' },
    update: {},
    create: {
      id: 'org-sunrise',
      name: 'Sunrise Hostels',
      email: 'billing@sunrisehostel.pk',
      phone: '0300-1234567',
      timezone: 'Asia/Karachi',
      currency: 'PKR',
      subscriptions: {
        create: {
          planId: (await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: 'enterprise' } })).id,
          status: 'Active',
          nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          monthlyAmount: 14900,
        },
      },
    },
  })

  const enterprisePlan = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: 'enterprise' } })
  const hostel = await prisma.hostel.upsert({
    where: { id: 'hostel-sunrise' },
    update: {},
    create: {
      id: 'hostel-sunrise',
      organizationId: org.id,
      name: 'Sunrise Hostel',
      location: 'Gulberg, Lahore',
      tagline: '200 beds · Men',
      initials: 'SH',
      color: 'bg-blue-600',
      bedCount: 0,
      studentCount: 0,
      occupancy: 0,
      plan: 'Enterprise',
      status: 'Active',
    },
  })

  // ── Roles + permissions (mirrors frontend ROLE_MATRIX) ───────────────────────
  const roles: { name: string; type: string; builtIn?: boolean }[] = [
    { name: 'Super Admin', type: 'System', builtIn: true },
    { name: 'Hostel Owner', type: 'Owner', builtIn: true },
    { name: 'Manager', type: 'Manager', builtIn: true },
    { name: 'Warden', type: 'Warden' },
    { name: 'Accountant', type: 'Accountant' },
    { name: 'Receptionist', type: 'Receptionist' },
    { name: 'Kitchen Staff', type: 'KitchenStaff' },
    { name: 'Maintenance Staff', type: 'MaintenanceStaff' },
    { name: 'Security Guard', type: 'SecurityGuard' },
    { name: 'Student', type: 'Student' },
  ]

  for (const role of roles) {
    const existing = await prisma.role.findFirst({ where: { organizationId: org.id, name: role.name } })
    if (existing) continue
    const created = await prisma.role.create({
      data: {
        organizationId: org.id,
        name: role.name,
        type: role.type as RoleType,
        builtIn: role.builtIn ?? false,
        description: `Built-in ${role.name} role`,
      },
    })
    const perms = allPermissions()
    if (role.name === 'Manager') {
      for (const m of PERMISSION_MODULES) {
        if (m === 'Settings') perms[m] = { canCreate: false, canRead: true, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Warden') {
      for (const m of PERMISSION_MODULES) {
        if (m === 'Students' || m === 'Rooms' || m === 'Maintenance') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: false }
        else if (m === 'Visitors') perms[m] = { canCreate: true, canRead: true, canUpdate: false, canDelete: false }
        else perms[m] = { canCreate: false, canRead: m === 'Inventory' || m === 'Reports' || m === 'Settings' ? true : false, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Accountant') {
      for (const m of PERMISSION_MODULES) {
        if (m === 'Finance' || m === 'Reports') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: true }
        else if (m === 'Students') perms[m] = { canCreate: false, canRead: true, canUpdate: false, canDelete: false }
        else perms[m] = { canCreate: false, canRead: m === 'Inventory' || m === 'Rooms' || m === 'Visitors' || m === 'Maintenance' ? true : false, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Receptionist') {
      for (const m of PERMISSION_MODULES) {
        if (m === 'Students') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: false }
        else if (m === 'Rooms') perms[m] = { canCreate: true, canRead: true, canUpdate: false, canDelete: false }
        else if (m === 'Visitors') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: false }
        else if (m === 'Reports') perms[m] = { canCreate: false, canRead: true, canUpdate: false, canDelete: false }
        else perms[m] = { canCreate: false, canRead: false, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Kitchen Staff' || role.name === 'Maintenance Staff') {
      for (const m of PERMISSION_MODULES) {
        if (m === 'Inventory') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: false }
        else if (role.name === 'Maintenance Staff' && m === 'Maintenance') perms[m] = { canCreate: true, canRead: true, canUpdate: true, canDelete: false }
        else perms[m] = { canCreate: false, canRead: m === 'Reports' ? true : false, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Security Guard') {
      for (const m of PERMISSION_MODULES) {
        perms[m] = m === 'Visitors' ? { canCreate: true, canRead: true, canUpdate: false, canDelete: false } : { canCreate: false, canRead: false, canUpdate: false, canDelete: false }
      }
    }
    if (role.name === 'Student') {
      for (const m of PERMISSION_MODULES) {
        perms[m] = m === 'Reports' ? { canCreate: false, canRead: true, canUpdate: false, canDelete: false } : { canCreate: false, canRead: false, canUpdate: false, canDelete: false }
      }
    }
    await prisma.permission.createMany({
      data: Object.entries(perms).map(([module, p]) => ({ roleId: created.id, module, ...p })),
    })
  }

  // ── Admin membership ─────────────────────────────────────────────────────────
  const ownerRole = await prisma.role.findFirstOrThrow({ where: { organizationId: org.id, name: 'Hostel Owner' } })
  await prisma.membership.upsert({
    where: { userId_organizationId_hostelId: { userId: admin.id, organizationId: org.id, hostelId: hostel.id } },
    update: { roleId: ownerRole.id },
    create: { userId: admin.id, organizationId: org.id, hostelId: hostel.id, roleId: ownerRole.id, status: 'Active' },
  })
  await prisma.membership.upsert({
    where: { userId_organizationId_hostelId: { userId: ownerUser.id, organizationId: org.id, hostelId: hostel.id } },
    update: { roleId: ownerRole.id, status: 'Active' },
    create: { userId: ownerUser.id, organizationId: org.id, hostelId: hostel.id, roleId: ownerRole.id, status: 'Active' },
  })

  // ── Rooms + beds ─────────────────────────────────────────────────────────────
  const building = await prisma.building.create({
    data: { hostelId: hostel.id, name: 'Block A', floors: 4 },
  })

  // Reserved rooms (by 0-based creation index) kept out of service so the
  // Cleaning/Maintenance stats aren't always zero.
  const CLEANING_INDEXES = new Set([6, 13]) // 202, 304
  const MAINTENANCE_INDEXES = new Set([4, 15]) // 105, 401

  const rooms: string[] = []
  let roomIndex = 0
  for (let floor = 1; floor <= 4; floor++) {
    for (let i = 1; i <= 5; i++) {
      const number = `${floor}0${i}`
      const isCleaning = CLEANING_INDEXES.has(roomIndex)
      const isMaintenance = MAINTENANCE_INDEXES.has(roomIndex)
      const room = await prisma.room.create({
        data: {
          hostelId: hostel.id,
          buildingId: building.id,
          number,
          floor,
          capacity: 2,
          type: 'Twin',
          ac: floor === 4,
          attachedBathroom: true,
          furniture: ['Bed', 'Study Table', 'Chair', 'Cupboard'],
          status: isCleaning ? 'Cleaning' : isMaintenance ? 'Maintenance' : 'Vacant',
          cleaningStatus: isCleaning ? 'InProgress' : 'Clean',
          maintenanceStatus: isMaintenance ? 'Scheduled' : 'None',
          rentPerBed: floor === 4 ? 25000 : 20000,
          hue: (floor + i) * 17,
          beds: {
            create: [
              { label: 'Bed A', status: isMaintenance ? 'Maintenance' : 'Vacant' },
              { label: 'Bed B', status: isMaintenance ? 'Maintenance' : 'Vacant' },
            ],
          },
        },
      })
      rooms.push(room.id)
      roomIndex += 1
    }
  }

  const beds = await prisma.bed.findMany({ where: { room: { hostelId: hostel.id } } })
  await prisma.hostel.update({
    where: { id: hostel.id },
    data: { bedCount: beds.length },
  })

  // ── Sample students ──────────────────────────────────────────────────────────
  // Fill most rooms (skipping the reserved Cleaning/Maintenance ones above),
  // leaving a handful vacant or half-occupied so occupancy stats read realistically.
  const FULLY_OCCUPIED_INDEXES = [0, 1, 2, 3, 5, 7, 8, 9, 10, 16]
  const HALF_OCCUPIED_INDEXES = [12, 14]

  type SeedStudent = {
    name: string
    cnic: string
    phone: string
    university: string
    department: string
    semester: string
    admissionDate: string
    feeStatus: 'Paid' | 'Pending' | 'Overdue'
  }

  const students: SeedStudent[] = [
    { name: 'Ahmed Raza', cnic: '35202-1000001-1', phone: '0300-1000001', university: 'University of the Punjab', department: 'Computer Science', semester: '6th', admissionDate: '2024-08-15', feeStatus: 'Paid' },
    { name: 'Usman Khalid', cnic: '35202-1000002-2', phone: '0300-1000002', university: 'UET Lahore', department: 'Electrical Engineering', semester: '4th', admissionDate: '2024-09-01', feeStatus: 'Paid' },
    { name: 'Hassan Ali', cnic: '35202-1000003-3', phone: '0300-1000003', university: 'FAST-NUCES', department: 'Software Engineering', semester: '8th', admissionDate: '2023-08-20', feeStatus: 'Pending' },
    { name: 'Bilal Hussain', cnic: '35202-1000004-4', phone: '0300-1000004', university: 'GCU Lahore', department: 'Business Administration', semester: '2nd', admissionDate: '2025-02-10', feeStatus: 'Paid' },
    { name: 'Fahad Iqbal', cnic: '35202-1000005-5', phone: '0300-1000005', university: 'University of the Punjab', department: 'Economics', semester: '6th', admissionDate: '2024-08-15', feeStatus: 'Overdue' },
    { name: 'Zain Abbas', cnic: '35202-1000006-6', phone: '0300-1000006', university: 'NUST', department: 'Mechanical Engineering', semester: '4th', admissionDate: '2024-09-05', feeStatus: 'Paid' },
    { name: 'Shahzaib Malik', cnic: '35202-1000007-7', phone: '0300-1000007', university: 'UET Lahore', department: 'Civil Engineering', semester: '6th', admissionDate: '2024-08-18', feeStatus: 'Paid' },
    { name: 'Talha Farooq', cnic: '35202-1000008-8', phone: '0300-1000008', university: 'FAST-NUCES', department: 'Computer Science', semester: '2nd', admissionDate: '2025-02-12', feeStatus: 'Pending' },
    { name: 'Umer Saeed', cnic: '35202-1000009-9', phone: '0300-1000009', university: 'GCU Lahore', department: 'Chemistry', semester: '4th', admissionDate: '2024-09-02', feeStatus: 'Paid' },
    { name: 'Hamza Tariq', cnic: '35202-1000010-1', phone: '0300-1000010', university: 'University of the Punjab', department: 'Computer Science', semester: '8th', admissionDate: '2023-08-22', feeStatus: 'Paid' },
    { name: 'Ali Raza', cnic: '35202-1000011-2', phone: '0300-1000011', university: 'NUST', department: 'Software Engineering', semester: '6th', admissionDate: '2024-08-16', feeStatus: 'Overdue' },
    { name: 'Danish Aslam', cnic: '35202-1000012-3', phone: '0300-1000012', university: 'UET Lahore', department: 'Electrical Engineering', semester: '2nd', admissionDate: '2025-02-08', feeStatus: 'Paid' },
    { name: 'Rayyan Sheikh', cnic: '35202-1000013-4', phone: '0300-1000013', university: 'FAST-NUCES', department: 'Data Science', semester: '4th', admissionDate: '2024-09-10', feeStatus: 'Paid' },
    { name: 'Owais Ahmed', cnic: '35202-1000014-5', phone: '0300-1000014', university: 'GCU Lahore', department: 'Business Administration', semester: '6th', admissionDate: '2024-08-19', feeStatus: 'Pending' },
    { name: 'Junaid Iqbal', cnic: '35202-1000015-6', phone: '0300-1000015', university: 'University of the Punjab', department: 'Physics', semester: '4th', admissionDate: '2024-09-03', feeStatus: 'Paid' },
    { name: 'Kashif Nawaz', cnic: '35202-1000016-7', phone: '0300-1000016', university: 'NUST', department: 'Mechanical Engineering', semester: '8th', admissionDate: '2023-08-25', feeStatus: 'Paid' },
    { name: 'Waqas Anjum', cnic: '35202-1000017-8', phone: '0300-1000017', university: 'UET Lahore', department: 'Computer Engineering', semester: '2nd', admissionDate: '2025-02-14', feeStatus: 'Paid' },
    { name: 'Noman Yousaf', cnic: '35202-1000018-9', phone: '0300-1000018', university: 'FAST-NUCES', department: 'Software Engineering', semester: '6th', admissionDate: '2024-08-17', feeStatus: 'Pending' },
    { name: 'Saad Chaudhry', cnic: '35202-1000019-1', phone: '0300-1000019', university: 'GCU Lahore', department: 'Economics', semester: '4th', admissionDate: '2024-09-06', feeStatus: 'Paid' },
    { name: 'Ibrahim Latif', cnic: '35202-1000020-2', phone: '0300-1000020', university: 'University of the Punjab', department: 'Computer Science', semester: '2nd', admissionDate: '2025-02-11', feeStatus: 'Paid' },
    { name: 'Arslan Butt', cnic: '35202-1000021-3', phone: '0300-1000021', university: 'NUST', department: 'Electrical Engineering', semester: '6th', admissionDate: '2024-08-21', feeStatus: 'Paid' },
    { name: 'Moiz Rashid', cnic: '35202-1000022-4', phone: '0300-1000022', university: 'UET Lahore', department: 'Civil Engineering', semester: '4th', admissionDate: '2024-09-07', feeStatus: 'Pending' },
  ]

  const roomsWithRent = await prisma.room.findMany({
    where: { hostelId: hostel.id },
    select: { id: true, rentPerBed: true },
    orderBy: [{ floor: 'asc' }, { number: 'asc' }],
  })

  const bedSlots: { roomId: string; rentPerBed: number }[] = []
  for (const idx of FULLY_OCCUPIED_INDEXES) {
    bedSlots.push({ roomId: roomsWithRent[idx].id, rentPerBed: Number(roomsWithRent[idx].rentPerBed) })
    bedSlots.push({ roomId: roomsWithRent[idx].id, rentPerBed: Number(roomsWithRent[idx].rentPerBed) })
  }
  for (const idx of HALF_OCCUPIED_INDEXES) {
    bedSlots.push({ roomId: roomsWithRent[idx].id, rentPerBed: Number(roomsWithRent[idx].rentPerBed) })
  }

  for (let i = 0; i < students.length && i < bedSlots.length; i++) {
    const s = students[i]
    const slot = bedSlots[i]
    const bed = await prisma.bed.findFirst({
      where: { roomId: slot.roomId, status: 'Vacant' },
    })
    if (!bed) continue

    const monthlyFee = slot.rentPerBed
    const outstandingDues =
      s.feeStatus === 'Paid' ? 0 : s.feeStatus === 'Pending' ? monthlyFee : monthlyFee * 2

    await prisma.student.upsert({
      where: { cnic: s.cnic },
      update: { hostelId: hostel.id },
      create: {
        hostelId: hostel.id,
        roomId: slot.roomId,
        bedId: bed.id,
        name: s.name,
        cnic: s.cnic,
        phone: s.phone,
        gender: 'Male' as Gender,
        university: s.university,
        department: s.department,
        semester: s.semester,
        admissionDate: new Date(s.admissionDate),
        status: 'Active',
        feeStatus: s.feeStatus,
        monthlyFee,
        outstandingDues,
        messPlan: 'Full',
        guardian: { name: `Mr. ${s.name.split(' ')[1]}`, relation: 'Father', phone: '0300-0000000', occupation: 'Businessman' },
        emergencyContact: { name: `Mrs. ${s.name.split(' ')[1]}`, relation: 'Mother', phone: '0300-9999999' },
      },
    })
    await prisma.bed.update({ where: { id: bed.id }, data: { status: 'Occupied' } })
    await prisma.room.update({ where: { id: slot.roomId }, data: { status: 'Occupied' } })
  }

  const studentCount = await prisma.student.count({ where: { hostelId: hostel.id } })
  await prisma.hostel.update({
    where: { id: hostel.id },
    data: { studentCount, occupancy: Math.round((studentCount / beds.length) * 100) },
  })

  console.log(`Seeded: org=${org.id} hostel=${hostel.id} admin=${admin.email} rooms=${rooms.length} beds=${beds.length} students=${studentCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
