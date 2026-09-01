import type { NotificationItem, NotificationCategory } from '@/types/enterprise'
import { mulberry32, pick } from './rng'

const CATEGORY_LABELS: NotificationCategory[] = ['Finance', 'Maintenance', 'Students', 'Visitors', 'Inventory', 'AI', 'System']

const TEMPLATES: { category: NotificationCategory; titles: string[]; descriptions: string[] }[] = [
  {
    category: 'Finance',
    titles: ['Payment received', 'Invoice generated', 'Fee reminder sent', 'Payment failed', 'Refund issued', 'Discount applied'],
    descriptions: [
      'Rs 18,500 received from {student} via JazzCash.',
      'Invoice INV-{num} generated for {student}.',
      'Automated reminders sent to {n} students.',
      'Payment of Rs {amt} failed for {student}.',
      'Refund of Rs {amt} issued to {student}.',
      'Early-bird discount applied to {n} invoices.',
    ],
  },
  {
    category: 'Maintenance',
    titles: ['New maintenance request', 'Ticket resolved', 'Ticket escalated', 'Preventive job due', 'Asset flagged'],
    descriptions: [
      '{label} reported in Room {room} · {priority} priority.',
      'Ticket MNT-{num} marked as resolved.',
      'Ticket MNT-{num} escalated to the manager.',
      'Preventive maintenance due for {label}.',
      'Warranty expiring for {label}.',
    ],
  },
  {
    category: 'Students',
    titles: ['New student admitted', 'Student checked in', 'Student checked out', 'Room allocated', 'Notice served'],
    descriptions: [
      '{student} was admitted to Room {room}, Bed {bed}.',
      '{student} completed check-in for Room {room}.',
      '{student} checked out from Room {room}.',
      'Room {room} allocated to {student}.',
      'Notice served to {student} for fee compliance.',
    ],
  },
  {
    category: 'Visitors',
    titles: ['Visitor arrived', 'Visitor pass approved', 'Visitor pass expired', 'Gate entry denied'],
    descriptions: [
      '{visitor} checked in to visit {student}.',
      'Visitor pass approved for {visitor}.',
      'Visitor pass expired for {visitor}.',
      'Gate entry denied for {visitor} — ID mismatch.',
    ],
  },
  {
    category: 'Inventory',
    titles: ['Low stock alert', 'Order delivered', 'Stock adjusted', 'Reorder recommended'],
    descriptions: [
      '{item} below minimum level ({qty} {unit} left).',
      'Purchase order PO-{num} delivered.',
      'Stock adjusted for {item} by {n} {unit}.',
      'Reorder {item} — current stock {qty} {unit}.',
    ],
  },
  {
    category: 'AI',
    titles: ['AI report generated', 'AI insight available', 'Forecast updated', 'Anomaly detected'],
    descriptions: [
      'Weekly operations report is ready to review.',
      'New insight: {headline}.',
      'Occupancy forecast refreshed for August.',
      'Unusual expense spike detected in {category}.',
    ],
  },
  {
    category: 'System',
    titles: ['Backup completed', 'Update installed', 'New user invited', 'Security alert', 'Timezone updated'],
    descriptions: [
      'Daily database backup completed successfully.',
      'DormOS v2.4.1 installed.',
      '{user} was invited as {role}.',
      'Failed login attempt blocked from {ip}.',
      'Hostel timezone updated to Asia/Karachi.',
    ],
  },
]

const STUDENTS = ['Ahmed Raza', 'Mahnoor Aslam', 'Shahzaib Malik', 'Usman Khalid', 'Fatima Noor', 'Sara Khan', 'Hassan Ali', 'Zainab Fatima', 'Bilal Hussain', 'Fahad Iqbal']
const VISITORS = ['Mohammad Tariq', 'Ayesha Khan', 'Rizwan Ahmed', 'Hina Shahid', 'Kamran Yousaf']
const ITEMS = ['Basmati Rice', 'Cooking Oil', 'Spinach', 'Chicken', 'Cleaning Supplies', 'Detergent']

const TIME_POOL = ['2m ago', '15m ago', '28m ago', '42m ago', '1h ago', '2h ago', '3h ago', '5h ago', '7h ago', 'Yesterday', '2 days ago', '3 days ago', '5 days ago']

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}

function buildNotifications(): NotificationItem[] {
  const rand = mulberry32(20260803)
  const list: NotificationItem[] = []
  for (let i = 0; i < 100; i++) {
    const category = pick(rand, CATEGORY_LABELS)
    const template = pick(rand, TEMPLATES.find((t) => t.category === category)!.titles)
    const student = pick(rand, STUDENTS)
    const vars: Record<string, string> = {
      student,
      visitor: pick(rand, VISITORS),
      item: pick(rand, ITEMS),
      room: String(100 + Math.floor(rand() * 320)),
      bed: String(1 + Math.floor(rand() * 4)),
      n: String(2 + Math.floor(rand() * 20)),
      num: String(2000 + Math.floor(rand() * 900)),
      amt: String((10000 + Math.floor(rand() * 20000)) / 1000),
      qty: String(2 + Math.floor(rand() * 40)),
      unit: 'kg',
      label: pick(rand, ['Water tap leaking', 'AC not cooling', 'Light bulb fuse', 'Door lock jammed', 'Window broken']),
      priority: pick(rand, ['Low', 'Medium', 'High', 'Critical']),
      headline: pick(rand, ['Revenue increased 18%', 'Occupancy to hit 95%', 'Mess costs up 8%', '5 students overdue']),
      category: pick(rand, ['Electricity', 'Groceries', 'Staff']),
      user: pick(rand, ['Imran Qureshi', 'Saima Akhtar', 'Rohaab', 'Asif Raza']),
      role: pick(rand, ['Manager', 'Accountant', 'Receptionist']),
      ip: `182.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
    }
    const descriptionPool = TEMPLATES.find((t) => t.category === category)!.descriptions
    const descriptionTemplate = pick(rand, descriptionPool)
    list.push({
      id: `not-${i + 1}`,
      title: template,
      description: fill(descriptionTemplate, vars),
      category,
      time: pick(rand, TIME_POOL),
      read: rand() > 0.55,
      archived: rand() > 0.8,
    })
  }
  return list
}

export const NOTIFICATION_CENTER_DATA: NotificationItem[] = buildNotifications()
