export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Debit Card'
  | 'JazzCash'
  | 'Easypaisa'
  | 'Online Gateway'

export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded'

export type InvoiceStatus =
  | 'Draft'
  | 'Issued'
  | 'Partial'
  | 'Pending'
  | 'Paid'
  | 'Overdue'
  | 'Void'

export type Payment = {
  id: string
  invoiceNo: string
  studentId: string
  roomId: string | null
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidDate: string
  dueDate: string
  referenceNo: string
  createdBy: string
  notes: string
  receiptId: string
}

export type InvoiceItem = {
  id: string
  label: string
  amount: number
}

export type Invoice = {
  id: string
  number: string
  studentId: string
  issueDate: string
  dueDate: string
  billingPeriodMonths: number
  status: InvoiceStatus
  items: InvoiceItem[]
  discounts: number
  taxes: number
  total: number
  notes: string
  createdBy: string
}

export type ExpenseCategory =
  | 'Utilities'
  | 'Electricity'
  | 'Water'
  | 'Gas'
  | 'Internet'
  | 'Maintenance'
  | 'Furniture'
  | 'Cleaning'
  | 'Mess'
  | 'Transport'
  | 'Salary'
  | 'Miscellaneous'

export type ExpenseStatus = 'Paid' | 'Pending' | 'Approved' | 'Rejected'

export type Expense = {
  id: string
  vendor: string
  category: ExpenseCategory
  amount: number
  paymentDate: string
  status: ExpenseStatus
  receiptNo: string
  notes: string
  createdBy: string
}

export type BillingFrequency = 'Monthly' | 'Quarterly' | 'Semester' | 'Yearly'

export type RecurringItem = {
  id: string
  name: string
  amount: number
  frequency: BillingFrequency
  nextBilling: string
  active: boolean
  students: number
  category: 'Income' | 'Expense'
}

export type FeePlanType =
  | 'Standard'
  | 'Premium'
  | 'AC Room'
  | 'Non AC'
  | 'Semester'
  | 'Monthly'
  | 'Custom'

export type FeePlan = {
  id: string
  name: string
  type: FeePlanType
  amount: number
  billingCycle: 'Monthly' | 'Semester' | 'Yearly'
  active: boolean
  studentsEnrolled: number
  description: string
}

export type ScholarshipStatus =
  | 'Active'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Expired'

export type Scholarship = {
  id: string
  studentId: string
  percentage: number
  reason: string
  durationMonths: number
  status: ScholarshipStatus
  appliedDate: string
  approvedBy: string
}

export type DiscountType =
  | 'Sibling Discount'
  | 'Early Payment'
  | 'Seasonal Discount'
  | 'Manual Discount'

export type Discount = {
  id: string
  name: DiscountType
  studentId: string | null
  percentage: number
  amount: number
  active: boolean
  reason: string
  createdAt: string
}

export type RefundStatus =
  | 'Requested'
  | 'Approved'
  | 'Processed'
  | 'Rejected'

export type Refund = {
  id: string
  paymentId: string
  studentId: string
  amount: number
  reason: string
  status: RefundStatus
  requestedDate: string
  processedDate: string
  method: PaymentMethod
}

export type TransactionType =
  | 'Income'
  | 'Expense'
  | 'Refund'
  | 'Adjustment'
  | 'Transfer'

export type Transaction = {
  id: string
  type: TransactionType
  description: string
  amount: number
  date: string
  category: string
  reference: string
  balance: number
}

export type MonthlyFinance = {
  month: string
  year: number
  revenue: number
  expenses: number
  netProfit: number
  messCost: number
  utilityCost: number
  maintenanceCost: number
  collectionRate: number
  outstanding: number
  occupiedBeds: number
}
