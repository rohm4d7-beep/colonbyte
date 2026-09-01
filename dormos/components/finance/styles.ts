import type {
  ExpenseStatus,
  InvoiceStatus,
  PaymentStatus,
  RefundStatus,
  ScholarshipStatus,
  TransactionType,
} from '@/types/finance'

export type FinanceBadgeStyle = {
  label: string
  className: string
  dot?: string
}

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, FinanceBadgeStyle> = {
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  Refunded: {
    label: 'Refunded',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
}

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, FinanceBadgeStyle> = {
  Draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  Issued: {
    label: 'Issued',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  Partial: {
    label: 'Partial',
    className: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Overdue: {
    label: 'Overdue',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  Void: {
    label: 'Void',
    className: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  },
}

export const EXPENSE_STATUS_STYLES: Record<ExpenseStatus, FinanceBadgeStyle> = {
  Paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Approved: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const REFUND_STATUS_STYLES: Record<RefundStatus, FinanceBadgeStyle> = {
  Requested: {
    label: 'Requested',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Approved: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  Processed: {
    label: 'Processed',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
}

export const SCHOLARSHIP_STATUS_STYLES: Record<ScholarshipStatus, FinanceBadgeStyle> = {
  Active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Approved: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  Expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
}

export const TRANSACTION_TYPE_STYLES: Record<TransactionType, FinanceBadgeStyle> = {
  Income: {
    label: 'Income',
    className: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Expense: {
    label: 'Expense',
    className: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
  Refund: {
    label: 'Refund',
    className: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  Adjustment: {
    label: 'Adjustment',
    className: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
  },
  Transfer: {
    label: 'Transfer',
    className: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
  },
}

export const ACTIVE_STYLE: FinanceBadgeStyle = {
  label: 'Active',
  className: 'bg-emerald-50 text-emerald-700',
  dot: 'bg-emerald-500',
}

export const INACTIVE_STYLE: FinanceBadgeStyle = {
  label: 'Inactive',
  className: 'bg-gray-100 text-gray-600',
  dot: 'bg-gray-400',
}
