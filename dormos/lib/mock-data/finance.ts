import type {
  Discount,
  DiscountType,
  Expense,
  ExpenseCategory,
  FeePlan,
  Invoice,
  Payment,
  PaymentMethod,
  RecurringItem,
  Refund,
  Scholarship,
  Transaction,
  MonthlyFinance,
} from '@/types/finance'
import { STUDENTS, BEDS } from './index'
import { mulberry32, pick } from './rng'

const rand = mulberry32(20260805)

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'JazzCash',
  'Easypaisa',
  'Online Gateway',
]

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Utilities',
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Maintenance',
  'Furniture',
  'Cleaning',
  'Mess',
  'Transport',
  'Salary',
  'Miscellaneous',
]

export const MONTHS: { label: string; year: number; month: number }[] = [
  { label: 'Sep', year: 2025, month: 9 },
  { label: 'Oct', year: 2025, month: 10 },
  { label: 'Nov', year: 2025, month: 11 },
  { label: 'Dec', year: 2025, month: 12 },
  { label: 'Jan', year: 2026, month: 1 },
  { label: 'Feb', year: 2026, month: 2 },
  { label: 'Mar', year: 2026, month: 3 },
  { label: 'Apr', year: 2026, month: 4 },
  { label: 'May', year: 2026, month: 5 },
  { label: 'Jun', year: 2026, month: 6 },
  { label: 'Jul', year: 2026, month: 7 },
  { label: 'Aug', year: 2026, month: 8 },
]

export const MONTH_LABELS = MONTHS.map((m) => m.label)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dateInMonth(monthIndex: number, day: number): string {
  const m = MONTHS[monthIndex]
  return `${m.year}-${pad(m.month)}-${pad(Math.min(28, Math.max(1, day)))}`
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthIndexOf(iso: string): number {
  const m = Number(iso.slice(5, 7))
  const y = Number(iso.slice(0, 4))
  for (let i = 0; i < MONTHS.length; i++) {
    if (MONTHS[i].month === m && MONTHS[i].year === y) return i
  }
  return 11
}

function roundHundreds(n: number): number {
  return Math.round(n / 100) * 100
}

const STAFF = ['Finance Office', 'Accounts Office', 'Reception', 'Warden Office']

const REFERENCE_PREFIX: Record<PaymentMethod, string[]> = {
  Cash: ['CSH-', 'CSH-'],
  'Bank Transfer': ['TRF-', 'NIFT-'],
  'Credit Card': ['CC-', 'VISA-'],
  'Debit Card': ['DBT-', 'MC-'],
  JazzCash: ['JC-', 'JZ-'],
  Easypaisa: ['EP-', 'EPAY-'],
  'Online Gateway': ['ONL-', 'GWY-'],
}

// ---------------------------------------------------------------------------
// Scholarships (needed before invoices for discounts)
// ---------------------------------------------------------------------------

const SCHOLARSHIP_REASONS = [
  'Merit-based — HEC approved',
  'Need-based financial aid',
  'Sports excellence',
  'Minority quota support',
  'Orphan support program',
  'Government merit quota',
]

function buildScholarships(): Scholarship[] {
  const list: Scholarship[] = []
  const indices = new Set<number>()
  while (indices.size < 14) indices.add(Math.floor(rand() * STUDENTS.length))
  let i = 0
  for (const studentIndex of indices) {
    const student = STUDENTS[studentIndex]
    const roll = rand()
    const status =
      roll < 0.45 ? 'Active' : roll < 0.65 ? 'Approved' : roll < 0.82 ? 'Pending' : roll < 0.92 ? 'Rejected' : 'Expired'
    const duration = 6 * (1 + Math.floor(rand() * 4))
    list.push({
      id: `SCH-${String(2001 + i)}`,
      studentId: student.id,
      percentage: 10 + Math.floor(rand() * 9) * 5,
      reason: pick(rand, SCHOLARSHIP_REASONS),
      durationMonths: duration,
      status,
      appliedDate: dateInMonth(3 + Math.floor(rand() * 8), 1 + Math.floor(rand() * 27)),
      approvedBy: status === 'Pending' || status === 'Rejected' ? '—' : 'Scholarship Committee',
    })
    i++
  }
  return list.sort((a, b) => b.appliedDate.localeCompare(a.appliedDate))
}

const SCHOLARSHIPS: Scholarship[] = buildScholarships()

const SCHOLARSHIP_STUDENT_IDS = new Set(SCHOLARSHIPS.map((s) => s.studentId))

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------

function buildDiscounts(): Discount[] {
  const types: { name: DiscountType; pct: number; global: boolean }[] = [
    { name: 'Sibling Discount', pct: 5, global: false },
    { name: 'Early Payment', pct: 3, global: true },
    { name: 'Seasonal Discount', pct: 5, global: true },
    { name: 'Manual Discount', pct: 10, global: false },
  ]
  const list: Discount[] = []
  for (let i = 0; i < 10; i++) {
    const def = types[i % types.length]
    const studentId = def.global ? null : STUDENTS[Math.floor(rand() * STUDENTS.length)].id
    const student = studentId ? STUDENTS.find((s) => s.id === studentId) : undefined
    list.push({
      id: `DSC-${String(3001 + i)}`,
      name: def.name,
      studentId,
      percentage: def.pct + Math.floor(rand() * 3) * 5,
      amount: student ? roundHundreds((student.monthlyFee * (def.pct + Math.floor(rand() * 2)) / 100)) : 0,
      active: i % 4 !== 3,
      reason: pick(rand, [
        'Two siblings enrolled in the hostel',
        'Fee paid before the 5th of the month',
        'Ramadan seasonal package',
        'Discretionary adjustment by warden',
      ]),
      createdAt: dateInMonth(1 + Math.floor(rand() * 10), 1 + Math.floor(rand() * 27)),
    })
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const DISCOUNTS: Discount[] = buildDiscounts()

const DISCOUNT_STUDENT_IDS = new Set(
  DISCOUNTS.filter((d) => d.studentId).map((d) => d.studentId as string),
)

// ---------------------------------------------------------------------------
// Invoices (~300)
// ---------------------------------------------------------------------------

function buildInvoices(): Invoice[] {
  const list: Invoice[] = []
  STUDENTS.forEach((student, i) => {
    const count = i < 60 ? 2 : 3
    for (let k = 0; k < count; k++) {
      const monthOffset = Math.min(11, Math.floor(Math.pow(rand(), 1.35) * 12))
      const issueDate = dateInMonth(monthOffset, 1 + ((i * 5 + k * 3) % 26))
      const dueDate = addDays(issueDate, 15)

      const billingPeriodMonths = 2 + Math.floor(monthOffset / 6) + (i % 3 === 0 ? 1 : 0)
      const rent = roundHundreds(student.monthlyFee * 0.72) * billingPeriodMonths
      const mess = 3200 * billingPeriodMonths
      const utility = 1500 * billingPeriodMonths
      const maintenance = 600 * billingPeriodMonths
      const subtotal = rent + mess + utility + maintenance

      const hasScholarship = SCHOLARSHIP_STUDENT_IDS.has(student.id)
      const hasDiscount = DISCOUNT_STUDENT_IDS.has(student.id)
      const discount = hasScholarship
        ? roundHundreds(subtotal * 0.15)
        : hasDiscount
          ? roundHundreds(subtotal * 0.05)
          : 0

      const roll = rand()
      const status =
        roll < 0.72
          ? 'Paid'
          : roll < 0.84
            ? 'Partial'
            : roll < 0.93
              ? 'Overdue'
              : roll < 0.97
                ? 'Pending'
                : roll < 0.99
                  ? 'Draft'
                  : 'Void'

      const taxed = i % 5 === 0 && status !== 'Void'
      const taxes = taxed ? roundHundreds(subtotal * 0.17) : 0
      const total = subtotal - discount + taxes

      const number = `INV-${String(4001 + i * 3 + k)}`

      list.push({
        id: `inv-${i}-${k}`,
        number,
        studentId: student.id,
        issueDate,
        dueDate,
        billingPeriodMonths,
        status,
        items: [
          { id: `${number}-1`, label: `Room rent — ${student.roomId ?? 'Unallocated'} (${billingPeriodMonths} months)`, amount: rent },
          { id: `${number}-2`, label: `Mess charges (${billingPeriodMonths} months)`, amount: mess },
          { id: `${number}-3`, label: `Utility charges (${billingPeriodMonths} months)`, amount: utility },
          { id: `${number}-4`, label: `Maintenance charges (${billingPeriodMonths} months)`, amount: maintenance },
        ],
        discounts: discount,
        taxes,
        total,
        notes: hasScholarship
          ? `Scholarship discount of 15% applied on this invoice.`
          : hasDiscount
            ? 'Loyalty discount applied on this invoice.'
            : '',
        createdBy: pick(rand, STAFF),
      })
    }
  })
  return list.sort((a, b) => b.issueDate.localeCompare(a.issueDate))
}

const INVOICES: Invoice[] = buildInvoices()

const INVOICES_BY_ID = new Map(INVOICES.map((invoice) => [invoice.id, invoice]))
const INVOICES_BY_NUMBER = new Map(INVOICES.map((invoice) => [invoice.number, invoice]))

// ---------------------------------------------------------------------------
// Payments (one per issued/partial/overdue/pending invoice)
// ---------------------------------------------------------------------------

function referenceFor(method: PaymentMethod): string {
  const prefix = pick(rand, REFERENCE_PREFIX[method])
  return `${prefix}${String(100000 + Math.floor(rand() * 899999))}`
}

function buildPayments(): Payment[] {
  const list: Payment[] = []
  INVOICES.forEach((invoice, i) => {
    if (invoice.status === 'Void' || invoice.status === 'Draft') return

    const student = STUDENTS.find((s) => s.id === invoice.studentId)
    if (!student) return

    const method = pick(rand, PAYMENT_METHODS)
    const due = invoice.dueDate

    let amount = invoice.total
    let status: Payment['status'] = 'Completed'
    let paidDate = addDays(invoice.issueDate, 2 + Math.floor(rand() * 12))
    if (paidDate > due) paidDate = due

    if (invoice.status === 'Partial') {
      amount = roundHundreds(invoice.total * (0.6 + rand() * 0.3))
      status = 'Completed'
    } else if (invoice.status === 'Pending') {
      status = 'Pending'
      paidDate = due
    } else if (invoice.status === 'Overdue') {
      status = rand() < 0.7 ? 'Pending' : 'Failed'
      paidDate = addDays(invoice.issueDate, 16 + Math.floor(rand() * 20))
    }

    list.push({
      id: `PAY-${String(5001 + i)}`,
      invoiceNo: invoice.number,
      studentId: student.id,
      roomId: student.roomId,
      amount,
      method,
      status,
      paidDate,
      dueDate: due,
      referenceNo: referenceFor(method),
      createdBy: pick(rand, STAFF),
      notes: pick(rand, [
        'Monthly fee collected at reception counter.',
        'Received via digital wallet transfer.',
        'Paid at the bank counter.',
        'Auto-debited against standing order.',
      ]),
      receiptId: `RCP-${invoice.number.slice(4)}`,
    })
  })
  return list.sort((a, b) => b.paidDate.localeCompare(a.paidDate))
}

const PAYMENTS: Payment[] = buildPayments()

const PAYMENTS_BY_ID = new Map(PAYMENTS.map((payment) => [payment.id, payment]))

// ---------------------------------------------------------------------------
// Expenses (150)
// ---------------------------------------------------------------------------

const VENDORS: Record<ExpenseCategory, string[]> = {
  Utilities: ['WAPDA', 'Utility Stores Corporation', 'Punjab Utility Co'],
  Electricity: ['K-Electric', 'LESCO — Lahore Electric Supply', 'FESCO'],
  Water: ['WASA', 'Metropolitan Water Board', 'Canal Water Supply'],
  Gas: ['Sui Northern Gas', 'Sui Southern Gas'],
  Internet: ['PTCL', 'Nayatel', 'StormFiber', 'Jazz Fiber'],
  Maintenance: ['Al-Hamad Maintenance Co', 'QuickFix Services', 'Punjab Builders'],
  Furniture: ['City Furniture Mart', 'National Furnishers', 'Daraz Business'],
  Cleaning: ['Sparkle Cleaning Services', 'EcoClean', 'Bright Maids'],
  Mess: ['Al-Noor Caterers', 'Shahzad Food Suppliers', 'Sabzi Mandi Traders', 'Punjab Meat Market'],
  Transport: ['City Shuttle Service', 'Metro Logistics'],
  Salary: ['Staff Payroll', 'Mess Staff Wages', 'Security Payroll'],
  Miscellaneous: ['Stationery House', 'General Store', 'Print House'],
}

const EXPENSE_AMOUNTS: Record<ExpenseCategory, [number, number]> = {
  Utilities: [10000, 24000],
  Electricity: [40000, 72000],
  Water: [8000, 18000],
  Gas: [5000, 14000],
  Internet: [10000, 22000],
  Maintenance: [8000, 42000],
  Furniture: [10000, 55000],
  Cleaning: [8000, 16000],
  Mess: [80000, 135000],
  Transport: [4000, 14000],
  Salary: [90000, 115000],
  Miscellaneous: [3000, 12000],
}

function buildExpenses(): Expense[] {
  const list: Expense[] = []
  for (let i = 0; i < 150; i++) {
    const category = pick(rand, EXPENSE_CATEGORIES)
    const [min, max] = EXPENSE_AMOUNTS[category]
    const amount = roundHundreds(min + rand() * (max - min))
    const roll = rand()
    const status: Expense['status'] =
      roll < 0.78 ? 'Paid' : roll < 0.86 ? 'Approved' : roll < 0.96 ? 'Pending' : 'Rejected'
    list.push({
      id: `EXP-${String(6001 + i)}`,
      vendor: pick(rand, VENDORS[category]),
      category,
      amount,
      paymentDate: dateInMonth(Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)),
      status,
      receiptNo: `REC-${String(7001 + i)}`,
      notes: pick(rand, [
        `Monthly ${category.toLowerCase()} charges for the hostel block.`,
        'Invoice received and verified by accounts office.',
        'Annual maintenance contract installment.',
        'Quarterly utility bill settlement.',
      ]),
      createdBy: pick(rand, STAFF),
    })
  }
  return list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
}

const EXPENSES: Expense[] = buildExpenses()

// ---------------------------------------------------------------------------
// Recurring billing + fee plans
// ---------------------------------------------------------------------------

export const RECURRING_ITEMS: RecurringItem[] = [
  { id: 'REC-1', name: 'Monthly Hostel Fee', amount: 7000, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 120, category: 'Income' },
  { id: 'REC-2', name: 'Mess Fee', amount: 3200, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 118, category: 'Income' },
  { id: 'REC-3', name: 'Laundry', amount: 1200, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 82, category: 'Income' },
  { id: 'REC-4', name: 'Parking', amount: 1500, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 47, category: 'Income' },
  { id: 'REC-5', name: 'Internet', amount: 22000, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 0, category: 'Expense' },
  { id: 'REC-6', name: 'Electricity', amount: 68000, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 0, category: 'Expense' },
  { id: 'REC-7', name: 'Water', amount: 26000, frequency: 'Monthly', nextBilling: '2026-09-01', active: true, students: 0, category: 'Expense' },
  { id: 'REC-8', name: 'Maintenance Fund', amount: 35000, frequency: 'Quarterly', nextBilling: '2026-10-01', active: true, students: 0, category: 'Expense' },
]

function buildFeePlans(): FeePlan[] {
  return [
    { id: 'FP-1', name: 'Standard Plan', type: 'Standard', amount: 7000, billingCycle: 'Monthly', active: true, studentsEnrolled: 54, description: 'Economy dorm beds with shared bathrooms and standard mess.' },
    { id: 'FP-2', name: 'Premium Plan', type: 'Premium', amount: 9500, billingCycle: 'Monthly', active: true, studentsEnrolled: 38, description: 'Twin-sharing rooms with attached bathrooms and premium mess.' },
    { id: 'FP-3', name: 'AC Room Plan', type: 'AC Room', amount: 12000, billingCycle: 'Monthly', active: true, studentsEnrolled: 22, description: 'Air-conditioned rooms with dedicated study desks.' },
    { id: 'FP-4', name: 'Non-AC Room Plan', type: 'Non AC', amount: 6000, billingCycle: 'Monthly', active: true, studentsEnrolled: 65, description: 'Standard non-AC rooms with ceiling fans.' },
    { id: 'FP-5', name: 'Semester Plan', type: 'Semester', amount: 38000, billingCycle: 'Semester', active: true, studentsEnrolled: 41, description: 'Pay once per semester and save 10%.' },
    { id: 'FP-6', name: 'Monthly Plan', type: 'Monthly', amount: 7000, billingCycle: 'Monthly', active: true, studentsEnrolled: 79, description: 'Flexible month-to-month billing for short stays.' },
    { id: 'FP-7', name: 'Custom Plan', type: 'Custom', amount: 0, billingCycle: 'Monthly', active: false, studentsEnrolled: 6, description: 'Tailored packages for institutional partnerships.' },
  ]
}

export const FEE_PLANS: FeePlan[] = buildFeePlans()

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------

const REFUND_REASONS = [
  'Duplicate payment — refunded on request',
  'Student vacated early — pro-rated refund',
  'Payment made in error',
  'Scholarship applied after payment',
  'Service not availed for the billing period',
]

function buildRefunds(): Refund[] {
  const list: Refund[] = []
  const sources = [...PAYMENTS]
    .filter((p) => p.status === 'Failed' || p.status === 'Completed')
    .slice(0, 12)
  sources.forEach((payment, i) => {
    const roll = rand()
    const status: Refund['status'] =
      roll < 0.35 ? 'Processed' : roll < 0.6 ? 'Approved' : roll < 0.85 ? 'Requested' : 'Rejected'
    list.push({
      id: `REF-${String(8001 + i)}`,
      paymentId: payment.id,
      studentId: payment.studentId,
      amount: roundHundreds(payment.amount * (0.4 + rand() * 0.6)),
      reason: pick(rand, REFUND_REASONS),
      status,
      requestedDate: payment.paidDate,
      processedDate: status === 'Processed' ? addDays(payment.paidDate, 2 + Math.floor(rand() * 5)) : '—',
      method: payment.method,
    })
  })
  return list.sort((a, b) => b.requestedDate.localeCompare(a.requestedDate))
}

const REFUNDS: Refund[] = buildRefunds()

const REFUNDED_PAYMENT_IDS = new Set(
  REFUNDS.filter((r) => r.status === 'Processed').map((r) => r.paymentId),
)

// ---------------------------------------------------------------------------
// Transactions (500+)
// ---------------------------------------------------------------------------

function buildTransactions(): Transaction[] {
  const txns: Transaction[] = []

  PAYMENTS.forEach((payment) => {
    txns.push({
      id: `TXN-${payment.id.slice(4)}`,
      type: 'Income',
      description: `Fee received — ${payment.invoiceNo}`,
      amount: payment.amount,
      date: payment.paidDate,
      category: 'Student Fees',
      reference: payment.referenceNo,
      balance: 0,
    })
  })

  EXPENSES.forEach((expense) => {
    txns.push({
      id: `TXN-E${expense.id.slice(4)}`,
      type: 'Expense',
      description: `${expense.vendor} — ${expense.category}`,
      amount: expense.amount,
      date: expense.paymentDate,
      category: expense.category,
      reference: expense.receiptNo,
      balance: 0,
    })
  })

  REFUNDS.forEach((refund) => {
    if (refund.status === 'Requested') return
    txns.push({
      id: `TXN-R${refund.id.slice(4)}`,
      type: 'Refund',
      description: `Refund to student — ${refund.paymentId}`,
      amount: refund.amount,
      date: refund.processedDate === '—' ? refund.requestedDate : refund.processedDate,
      category: 'Refunds',
      reference: refund.id,
      balance: 0,
    })
  })

  for (let i = 0; i < 32; i++) {
    const positive = rand() < 0.45
    txns.push({
      id: `TXN-A${String(9001 + i)}`,
      type: 'Adjustment',
      description: positive
        ? 'Fee correction — arrears added'
        : 'Late fee waived after review',
      amount: roundHundreds(500 + rand() * 3000),
      date: dateInMonth(Math.floor(rand() * 12), 1 + Math.floor(rand() * 27)),
      category: 'Adjustments',
      reference: `ADJ-${String(9001 + i)}`,
      balance: 0,
    })
  }

  for (let i = 0; i < 24; i++) {
    txns.push({
      id: `TXN-T${String(9101 + i)}`,
      type: 'Transfer',
      description: 'Transfer to HBL savings account',
      amount: 100000 + Math.floor(rand() * 400000),
      date: dateInMonth(Math.floor(rand() * 12), 5 + Math.floor(rand() * 20)),
      category: 'Bank Transfers',
      reference: `TRF-${String(9101 + i)}`,
      balance: 0,
    })
  }

  txns.sort((a, b) => a.date.localeCompare(b.date))
  let balance = 1_250_000
  for (const txn of txns) {
    const sign =
      txn.type === 'Income' || txn.type === 'Adjustment'
        ? 1
        : txn.type === 'Expense' || txn.type === 'Refund'
          ? -1
          : txn.type === 'Transfer'
            ? rand() < 0.5
              ? -1
              : 1
            : 0
    balance += sign * txn.amount
    txn.balance = balance
  }

  return txns.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

const TRANSACTIONS: Transaction[] = buildTransactions()

// ---------------------------------------------------------------------------
// Derived KPIs
// ---------------------------------------------------------------------------

export const TOTAL_REVENUE = PAYMENTS.filter((p) => p.status === 'Completed').reduce(
  (sum, p) => sum + p.amount,
  0,
)
export const TOTAL_EXPENSES = EXPENSES.filter((e) => e.status !== 'Rejected').reduce(
  (sum, e) => sum + e.amount,
  0,
)
export const NET_PROFIT = TOTAL_REVENUE - TOTAL_EXPENSES

const COMPLETED_COUNT = PAYMENTS.filter((p) => p.status === 'Completed').length
export const COLLECTION_RATE = Math.round((COMPLETED_COUNT / PAYMENTS.length) * 100)

export const PENDING_PAYMENTS = PAYMENTS.filter(
  (p) => p.status === 'Pending' || p.status === 'Failed',
)
export const PENDING_PAYMENTS_TOTAL = PENDING_PAYMENTS.reduce((sum, p) => sum + p.amount, 0)

export const OUTSTANDING_DUES = INVOICES.filter(
  (inv) => inv.status === 'Overdue' || inv.status === 'Pending' || inv.status === 'Partial',
).reduce((sum, inv) => sum + inv.total, 0)

export const AVERAGE_REVENUE_PER_STUDENT = Math.round(
  TOTAL_REVENUE / STUDENTS.length,
)

// ---------------------------------------------------------------------------
// Monthly finance + chart series
// ---------------------------------------------------------------------------

function buildMonthlyFinance(): MonthlyFinance[] {
  const occupiedBase = BEDS.filter((bed) => bed.status === 'Occupied').length

  const revenueRamp = MONTHS.map((_, mi) => 1 + mi * 0.11)
  const expenseRamp = MONTHS.map((_, mi) => 1 + mi * 0.045)
  const revenueRampSum = revenueRamp.reduce((a, b) => a + b, 0)
  const expenseRampSum = expenseRamp.reduce((a, b) => a + b, 0)

  return MONTHS.map((_, mi) => {
    const monthExpenses = EXPENSES.filter((e) => monthIndexOf(e.paymentDate) === mi)
    const messCost = monthExpenses
      .filter((e) => e.category === 'Mess')
      .reduce((sum, e) => sum + e.amount, 0)
    const utilityCost = monthExpenses
      .filter((e) => ['Electricity', 'Water', 'Gas', 'Utilities'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0)
    const maintenanceCost = monthExpenses
      .filter((e) => e.category === 'Maintenance')
      .reduce((sum, e) => sum + e.amount, 0)

    const monthPayments = PAYMENTS.filter((p) => monthIndexOf(p.paidDate) === mi)
    const completed = monthPayments.filter((p) => p.status === 'Completed').length
    const collectionRate =
      monthPayments.length > 0 ? Math.round((completed / monthPayments.length) * 100) : 100

    const outstanding = INVOICES.filter(
      (inv) =>
        (inv.status === 'Overdue' || inv.status === 'Pending' || inv.status === 'Partial') &&
        monthIndexOf(inv.issueDate) === mi,
    ).reduce((sum, inv) => sum + inv.total, 0)

    const occupancyPulse = 4 - (Math.abs(mi - 11) % 5)
    const revenue = Math.round((TOTAL_REVENUE * revenueRamp[mi]) / revenueRampSum / 100) * 100
    const expenses =
      Math.round((TOTAL_EXPENSES * expenseRamp[mi]) / expenseRampSum / 100) * 100

    return {
      month: MONTHS[mi].label,
      year: MONTHS[mi].year,
      revenue,
      expenses,
      netProfit: revenue - expenses,
      messCost,
      utilityCost,
      maintenanceCost,
      collectionRate,
      outstanding,
      occupiedBeds: occupiedBase + occupancyPulse,
    }
  })
}

const MONTHLY_FINANCE: MonthlyFinance[] = buildMonthlyFinance()

const PAYMENT_METHOD_BREAKDOWN = PAYMENT_METHODS.map((method, i) => {
  const value = PAYMENTS.filter((p) => p.method === method).reduce(
    (sum, p) => sum + p.amount,
    0,
  )
  const colors = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-4)', 'var(--color-chart-3)', 'var(--color-chart-5)', 'var(--color-chart-6)', 'var(--color-chart-7)']
  return { name: method, value, color: colors[i % colors.length] }
})

const OUTSTANDING_BY_MONTH = MONTHS.map((_, mi) => {
  const monthPayments = PAYMENTS.filter((p) => monthIndexOf(p.paidDate) === mi)
  const collected = monthPayments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const pending = monthPayments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const overdue = INVOICES.filter(
    (inv) => inv.status === 'Overdue' && monthIndexOf(inv.issueDate) === mi,
  ).reduce((sum, inv) => sum + inv.total, 0)
  return { month: MONTHS[mi].label, collected, pending, overdue }
})

const OCCUPANCY_REVENUE = MONTHS.map((_, mi) => ({
  month: MONTHS[mi].label,
  occupancy: Math.round((MONTHLY_FINANCE[mi].occupiedBeds / BEDS.length) * 100),
  revenue: MONTHLY_FINANCE[mi].revenue,
}))

// ---------------------------------------------------------------------------
// Derived KPIs
// ---------------------------------------------------------------------------

const LATEST = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 1]
const PREVIOUS = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 2]

export function monthTrend(
  current: number,
  previous: number,
): { value: string; positive: boolean } {
  if (previous === 0) return { value: '—', positive: true }
  const diff = ((current - previous) / previous) * 100
  return {
    value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
    positive: diff >= 0,
  }
}

export const LATEST_MONTH = LATEST
export const PREVIOUS_MONTH = PREVIOUS

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function studentName(studentId: string): string {
  return STUDENTS.find((s) => s.id === studentId)?.name ?? 'Unknown Student'
}

export function studentRecord(studentId: string) {
  return STUDENTS.find((s) => s.id === studentId)
}

export function studentRoomNumber(studentId: string): string {
  const student = STUDENTS.find((s) => s.id === studentId)
  return student?.roomId ?? 'Unallocated'
}

export function invoiceById(id: string): Invoice | undefined {
  return INVOICES_BY_ID.get(id)
}

export function invoiceByNumber(number: string): Invoice | undefined {
  return INVOICES_BY_NUMBER.get(number)
}

export function paymentById(id: string): Payment | undefined {
  return PAYMENTS_BY_ID.get(id)
}

export function invoicesByStudent(studentId: string): Invoice[] {
  return INVOICES.filter((inv) => inv.studentId === studentId)
}

export function paymentsByStudent(studentId: string): Payment[] {
  return PAYMENTS.filter((p) => p.studentId === studentId)
}

export function refundsByStudent(studentId: string): Refund[] {
  return REFUNDS.filter((r) => r.studentId === studentId)
}

export function refundedPaymentIds(): Set<string> {
  return REFUNDED_PAYMENT_IDS
}

export const FINANCE_FILTERS = {
  methods: PAYMENT_METHODS,
  invoiceStatuses: ['Draft', 'Issued', 'Partial', 'Paid', 'Overdue', 'Void'] as const,
  expenseCategories: EXPENSE_CATEGORIES,
  transactionTypes: ['Income', 'Expense', 'Refund', 'Adjustment', 'Transfer'] as const,
  refundStatuses: ['Requested', 'Approved', 'Processed', 'Rejected'] as const,
  scholarshipStatuses: ['Active', 'Pending', 'Approved', 'Rejected', 'Expired'] as const,
  months: MONTHS.map((m) => `${m.label} ${m.year}`),
}

export {
  INVOICES,
  PAYMENTS,
  EXPENSES,
  SCHOLARSHIPS,
  DISCOUNTS,
  REFUNDS,
  TRANSACTIONS,
  MONTHLY_FINANCE,
  PAYMENT_METHOD_BREAKDOWN,
  OUTSTANDING_BY_MONTH,
  OCCUPANCY_REVENUE,
}
