'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, AlertTriangle, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { MessTabs } from './mess-tabs'
import { KITCHEN_INVENTORY } from '@/lib/mock-data/mess'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

const STATUS_CONFIG = {
  ok: { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', bar: 'bg-emerald-500' },
  low: { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', bar: 'bg-amber-500' },
  critical: { label: 'Critical', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', bar: 'bg-rose-500' },
}

const CATEGORY_COLORS: Record<string, string> = {
  Grains: 'bg-amber-100 text-amber-700',
  Proteins: 'bg-rose-100 text-rose-700',
  Dairy: 'bg-accent text-primary',
  Vegetables: 'bg-emerald-100 text-emerald-700',
  Spices: 'bg-orange-100 text-orange-700',
  Beverages: 'bg-accent text-primary',
  Utilities: 'bg-gray-100 text-gray-700',
}

export function KitchenInventoryPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'critical'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', ...Array.from(new Set(KITCHEN_INVENTORY.map((i) => i.category)))]

  const filtered = KITCHEN_INVENTORY.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  const okCount = KITCHEN_INVENTORY.filter((i) => i.status === 'ok').length
  const lowCount = KITCHEN_INVENTORY.filter((i) => i.status === 'low').length
  const criticalCount = KITCHEN_INVENTORY.filter((i) => i.status === 'critical').length
  const totalValue = KITCHEN_INVENTORY.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0)

  const summaryCards = [
    { label: 'Total Items', value: KITCHEN_INVENTORY.length.toString(), color: 'text-primary bg-accent', filter: 'all' as const },
    { label: 'In Stock', value: okCount.toString(), color: 'text-emerald-600 bg-emerald-50', filter: 'ok' as const },
    { label: 'Low Stock', value: lowCount.toString(), color: 'text-amber-600 bg-amber-50', filter: 'low' as const },
    { label: 'Critical', value: criticalCount.toString(), color: 'text-rose-600 bg-rose-50', filter: 'critical' as const },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kitchen Inventory"
        description="Track all kitchen ingredients, their stock levels and reorder status."
        icon={Package}
        crumbs={[{ label: 'Mess', href: '/dashboard/mess' }, { label: 'Kitchen Inventory' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <ShoppingCart className="h-3.5 w-3.5" />
            Reorder Low Items
          </button>
        }
      />

      <MessTabs />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.button
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setStatusFilter(card.filter)}
            className={cn(
              'rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-left transition-all hover:shadow-md',
              statusFilter === card.filter && 'ring-2 ring-primary/30',
            )}
          >
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', card.color.split(' ')[0])}>{card.value}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Total Inventory Value: Rs {totalValue.toLocaleString()}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search item or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, i) => {
          const statusConf = STATUS_CONFIG[item.status]
          const stockPercent = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100))
          const catColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-700'

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                  <span className={cn('mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', catColor)}>
                    {item.category}
                  </span>
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                  {statusConf.label}
                </span>
              </div>

              {/* Stock bar */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.currentStock} {item.unit}</span>
                  <span className="text-gray-400">/ {item.maxStock} {item.unit}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stockPercent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03 }}
                    className={cn('h-full rounded-full', statusConf.bar)}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                  <span>Min: {item.minStock}</span>
                  <span>{stockPercent}%</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Supplier</span>
                  <span className="font-medium text-gray-700 truncate ml-2 max-w-[120px]">{item.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost/Unit</span>
                  <span className="font-medium text-gray-700">Rs {item.costPerUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Purchase</span>
                  <span className="font-medium text-gray-700">{formatDate(item.lastPurchase)}</span>
                </div>
                {item.expiryDate && (
                  <div className="flex justify-between">
                    <span>Expiry</span>
                    <span className={cn('font-medium', new Date(item.expiryDate) < new Date() ? 'text-rose-600' : 'text-gray-700')}>
                      {formatDate(item.expiryDate)}
                    </span>
                  </div>
                )}
              </div>

              {item.status !== 'ok' && (
                <button className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-medium text-white transition-colors hover:bg-primary/80">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Reorder
                </button>
              )}
              {item.status === 'ok' && (
                <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-2 text-xs text-gray-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Stock OK
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
