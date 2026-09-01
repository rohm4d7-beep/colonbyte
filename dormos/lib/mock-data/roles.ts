import type { Role, Permissions, PermissionModuleName, PermissionCell } from '@/types/enterprise'

export const ROLES: Role[] = [
  { id: 'r1', name: 'Super Admin', description: 'Full access to every module across all hostels.', members: 1, accent: 'bg-gray-900 text-white', permissions: 36, builtIn: true },
  { id: 'r2', name: 'Hostel Owner', description: 'Complete control over a single hostel.', members: 3, accent: 'bg-blue-600 text-white', permissions: 36, builtIn: true },
  { id: 'r3', name: 'Manager', description: 'Runs day-to-day operations and staff.', members: 5, accent: 'bg-emerald-600 text-white', permissions: 32, builtIn: true },
  { id: 'r4', name: 'Warden', description: 'Supervises students and room discipline.', members: 8, accent: 'bg-violet-600 text-white', permissions: 24 },
  { id: 'r5', name: 'Accountant', description: 'Manages invoices, payments and finance reports.', members: 4, accent: 'bg-amber-600 text-white', permissions: 20 },
  { id: 'r6', name: 'Receptionist', description: 'Handles check-ins, visitors and room queries.', members: 6, accent: 'bg-cyan-600 text-white', permissions: 16 },
  { id: 'r7', name: 'Kitchen Staff', description: 'Updates mess menus and kitchen inventory.', members: 12, accent: 'bg-rose-600 text-white', permissions: 8 },
  { id: 'r8', name: 'Maintenance Staff', description: 'Works maintenance tickets and asset jobs.', members: 9, accent: 'bg-orange-600 text-white', permissions: 8 },
  { id: 'r9', name: 'Security Guard', description: 'Manages gate entries and visitor passes.', members: 10, accent: 'bg-slate-600 text-white', permissions: 4 },
  { id: 'r10', name: 'Student', description: 'Self-service profile, fees and complaints.', members: 486, accent: 'bg-teal-600 text-white', permissions: 4 },
]

export const PERMISSION_MODULES: PermissionModuleName[] = ['Students', 'Rooms', 'Finance', 'Inventory', 'Reports', 'Visitors', 'Maintenance', 'Staff', 'Settings']

const FULL = { create: true, read: true, update: true, delete: true }

function cell(create: boolean, read: boolean, update: boolean, del: boolean): PermissionCell {
  return { create, read, update, delete: del }
}

export const ROLE_MATRIX: Record<string, Permissions> = {
  'Super Admin': Object.fromEntries(PERMISSION_MODULES.map((m) => [m, FULL])) as Permissions,
  'Hostel Owner': Object.fromEntries(PERMISSION_MODULES.map((m) => [m, FULL])) as Permissions,
  Manager: Object.fromEntries(
    PERMISSION_MODULES.map((m) => [m, m === 'Settings' ? cell(false, true, false, false) : FULL]),
  ) as Permissions,
  Warden: Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Students') return [m, cell(true, true, true, false)]
      if (m === 'Rooms') return [m, cell(true, true, true, false)]
      if (m === 'Visitors') return [m, cell(true, true, false, false)]
      if (m === 'Maintenance') return [m, cell(true, true, true, false)]
      if (m === 'Settings' || m === 'Finance' || m === 'Staff') return [m, cell(false, false, false, false)]
      return [m, cell(false, true, false, false)]
    }),
  ) as Permissions,
  Accountant: Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Finance' || m === 'Reports') return [m, FULL]
      if (m === 'Students') return [m, cell(false, true, false, false)]
      if (m === 'Settings' || m === 'Staff') return [m, cell(false, false, false, false)]
      return [m, cell(false, true, false, false)]
    }),
  ) as Permissions,
  Receptionist: Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Students') return [m, cell(true, true, true, false)]
      if (m === 'Rooms') return [m, cell(true, true, false, false)]
      if (m === 'Visitors') return [m, cell(true, true, true, false)]
      if (m === 'Reports') return [m, cell(false, true, false, false)]
      return [m, cell(false, false, false, false)]
    }),
  ) as Permissions,
  'Kitchen Staff': Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Inventory') return [m, cell(true, true, true, false)]
      if (m === 'Reports') return [m, cell(false, true, false, false)]
      return [m, cell(false, false, false, false)]
    }),
  ) as Permissions,
  'Maintenance Staff': Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Maintenance') return [m, cell(true, true, true, false)]
      if (m === 'Inventory') return [m, cell(false, true, true, false)]
      return [m, cell(false, false, false, false)]
    }),
  ) as Permissions,
  'Security Guard': Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Visitors') return [m, cell(true, true, false, false)]
      return [m, cell(false, false, false, false)]
    }),
  ) as Permissions,
  Student: Object.fromEntries(
    PERMISSION_MODULES.map((m) => {
      if (m === 'Reports') return [m, cell(false, true, false, false)]
      return [m, cell(false, false, false, false)]
    }),
  ) as Permissions,
}

export const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-gray-900',
  'Hostel Owner': 'bg-blue-600',
  Manager: 'bg-emerald-600',
  Warden: 'bg-violet-600',
  Accountant: 'bg-amber-500',
  Receptionist: 'bg-cyan-500',
  'Kitchen Staff': 'bg-rose-500',
  'Maintenance Staff': 'bg-orange-500',
  'Security Guard': 'bg-slate-500',
  Student: 'bg-teal-500',
}
