'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Plus, Package } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTabs } from './inventory-tabs'
import { PURCHASE_ORDERS } from '@/lib/mock-data/inventory'
import type { OrderStatus } from '@/lib/mock-data/inventory'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; ring: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Approved: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Cancelled: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const PAYMENT_CONFIG = {
  Unpaid: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  Partial: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
}

export function PurchaseOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const filtered = PURCHASE_ORDERS.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch = !q || o.poNumber.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const summaryCards = [
    { label: 'Pending', value: PURCHASE_ORDERS.filter((o) => o.status === 'Pending').length, color: 'text-amber-600' },
    { label: 'Approved', value: PURCHASE_ORDERS.filter((o) => o.status === 'Approved').length, color: 'text-primary' },
    { label: 'Delivered', value: PURCHASE_ORDERS.filter((o) => o.status === 'Delivered').length, color: 'text-emerald-600' },
    { label: 'Outstanding', value: `Rs ${PURCHASE_ORDERS.filter((o) => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`, color: 'text-rose-600' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Purchase Orders"
        description="Manage procurement orders, delivery tracking and payments."
        icon={ShoppingCart}
        crumbs={[{ label: 'Inventory', href: '/dashboard/inventory' }, { label: 'Orders' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            New Order
          </button>
        }
      />

      <InventoryTabs />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={cn('mt-1 text-xl font-bold', card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search PO or supplier..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Pending', 'Approved', 'Delivered', 'Cancelled'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('rounded-lg px-2.5 py-1 text-xs font-medium transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">PO Number</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Supplier</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Expected</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">Items</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order, i) => {
                const sConf = STATUS_CONFIG[order.status]
                const pConf = PAYMENT_CONFIG[order.paymentStatus]
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3 text-xs font-semibold text-primary">{order.poNumber}</td>
                    <td className="px-3 py-3 text-xs font-medium text-gray-900">{order.supplier}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{formatDate(order.expectedDelivery)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{order.items.length}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">Rs {order.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', sConf.bg, sConf.text, sConf.ring)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', pConf.bg, pConf.text, pConf.ring)}>
                        {order.paymentStatus}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
