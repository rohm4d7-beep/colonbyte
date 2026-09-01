import type { AuditEvent } from '@/types/enterprise'
import { mulberry32, pick } from './rng'

const MODULES = ['Students', 'Rooms', 'Finance', 'Inventory', 'Reports', 'Visitors', 'Maintenance', 'Staff', 'Settings', 'Auth']

const ACTIONS: Record<string, string[]> = {
  Students: ['added student', 'updated student', 'removed student', 'changed room', 'admitted student'],
  Rooms: ['allocated room', 'marked room vacant', 'updated room', 'changed bed'],
  Finance: ['created invoice', 'edited payment', 'issued refund', 'applied discount', 'generated report'],
  Inventory: ['updated stock', 'received order', 'adjusted stock', 'flagged asset'],
  Reports: ['generated report', 'exported CSV', 'exported PDF', 'scheduled report'],
  Visitors: ['approved pass', 'denied entry', 'logged visitor', 'updated pass'],
  Maintenance: ['created ticket', 'resolved ticket', 'escalated ticket', 'assigned technician'],
  Staff: ['added employee', 'updated payroll', 'approved leave', 'changed role'],
  Settings: ['modified settings', 'changed branding', 'updated notification prefs', 'edited profile'],
  Auth: ['logged in', 'logged out', 'failed login', 'updated password'],
}

const TARGETS = ['Ahmed Raza', 'Mahnoor Aslam', 'Room 208', 'INV-2084', 'Room 305', 'Al-Baraka Traders', 'Payroll Jul', 'Role: Accountant', 'Hostel Profile', 'MNT-2026-045', 'Visitor pass #382', 'Backup schedule']
const ACTORS = [
  { name: 'Rohaab', role: 'Owner' },
  { name: 'Asif Raza', role: 'Manager' },
  { name: 'Imran Qureshi', role: 'Mess Supervisor' },
  { name: 'Saima Akhtar', role: 'Accountant' },
  { name: 'Usman Malik', role: 'Receptionist' },
  { name: 'Zara Sheikh', role: 'System Admin' },
]

const TIME_POOL = ['5m ago', '18m ago', '34m ago', '1h ago', '2h ago', '3h ago', '5h ago', '8h ago', 'Yesterday', '2 days ago', '3 days ago', '4 days ago']

function buildAuditEvents(): AuditEvent[] {
  const rand = mulberry32(20260804)
  const list: AuditEvent[] = []
  for (let i = 0; i < 50; i++) {
    const moduleName = pick(rand, MODULES)
    const action = pick(rand, ACTIONS[moduleName])
    const actor = pick(rand, ACTORS)
    const severity = action.includes('delete') || action.includes('failed') ? ('danger' as const) : action.includes('update') || action.includes('edit') || action.includes('change') ? ('warning' as const) : ('info' as const)
    list.push({
      id: `audit-${i + 1}`,
      actor: actor.name,
      actorRole: actor.role,
      action,
      module: moduleName,
      target: pick(rand, TARGETS),
      timestamp: pick(rand, TIME_POOL),
      ip: `182.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
      severity,
    })
  }
  return list
}

export const AUDIT_EVENTS: AuditEvent[] = buildAuditEvents()

export const AUDIT_FILTERS = {
  modules: [...MODULES, 'All modules'],
  actors: ['All actors', ...ACTORS.map((a) => a.name)],
  severities: ['All severities', 'Info', 'Warning', 'Danger'],
}
