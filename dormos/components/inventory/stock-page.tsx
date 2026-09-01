'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Boxes, Search, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTabs } from './inventory-tabs'
import { STOCK_ITEMS } from '@/lib/mock-data/inventory'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  ok: { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', bar: 'bg-emerald-500' },
  low: { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', bar: 'bg-amber-500' },
  critical: { label: 'Critical', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', bar: 'bg-rose-500' },
}

export function StockPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'critical'>('all')

  const categories = ['all', ...Array.from(new Set(STOCK_ITEMS.map((i) => i.category)))]
  const filtered = STOCK_ITEMS.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.name.toLowerCase().includes(q)
    const matchCat = catFilter === 'all' || item.category === catFilter
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Consumable Stock"
        description="Track cleaning supplies, office items and maintenance materials."
        icon={Boxes}
        crumbs={[{ label: 'Inventory', href: '/dashboard/inventory' }, { label: 'Stock' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <ShoppingCart className="h-3.5 w-3.5" />
            Order Supplies
          </button>
        }
      />

      <InventoryTabs />

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search stock items..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50">
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'ok', 'low', 'critical'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, i) => {
          const conf = STATUS_CONFIG[item.status]
          const pct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100))
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                  <span className="text-[10px] text-gray-400 bg-gray-50 rounded-full px-1.5 py-0.5">{item.category}</span>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', conf.bg, conf.text, conf.ring)}>
                  {conf.label}
                </span>
              </div>
              <div className="mb-2">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-700 font-medium">{item.currentStock} {item.unit}</span>
                  <span className="text-gray-400">max {item.maxStock}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.03 }}
                    className={cn('h-full rounded-full', conf.bar)} />
                </div>
              </div>
              <div className="text-[10px] text-gray-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Supplier</span>
                  <span className="text-gray-600 truncate ml-1 max-w-[100px]">{item.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Purchase</span>
                  <span className="text-gray-600">{formatDate(item.lastPurchase)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost/Unit</span>
                  <span className="text-gray-600">Rs {item.costPerUnit}</span>
                </div>
              </div>
              {item.status !== 'ok' && (
                <button className="mt-3 w-full rounded-xl bg-primary py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-primary/80">
                  Reorder Now
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
