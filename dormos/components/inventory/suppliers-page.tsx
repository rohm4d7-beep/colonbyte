'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Truck, Plus, Star, Phone, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTabs } from './inventory-tabs'
import { SUPPLIERS } from '@/lib/mock-data/inventory'
import { cn } from '@/lib/utils'

export function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all')

  const categories = ['all', ...Array.from(new Set(SUPPLIERS.map((s) => s.category)))]

  const filtered = SUPPLIERS.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q)
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Suppliers"
        description="Manage vendor relationships, track purchases and outstanding balances."
        icon={Truck}
        crumbs={[{ label: 'Inventory', href: '/dashboard/inventory' }, { label: 'Suppliers' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            Add Supplier
          </button>
        }
      />

      <InventoryTabs />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Suppliers', value: SUPPLIERS.length },
          { label: 'Active', value: SUPPLIERS.filter((s) => s.status === 'Active').length },
          { label: 'Total Outstanding', value: `Rs ${SUPPLIERS.reduce((sum, s) => sum + s.outstandingBalance, 0).toLocaleString()}` },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm text-center"
          >
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50"
        >
          {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'Active', 'Inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', statusFilter === s ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((supplier, i) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{supplier.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{supplier.supplierId}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', supplier.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20')}>
                  {supplier.status}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">{supplier.category}</span>
              </div>
            </div>

            {/* Products */}
            <div className="mb-3 flex flex-wrap gap-1">
              {supplier.products.slice(0, 4).map((p) => (
                <span key={p} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">{p}</span>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-gray-400" />
                {supplier.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-gray-400" />
                {supplier.city}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-2.5">
              <div className="text-center">
                <p className="text-[10px] text-gray-400">Orders</p>
                <p className="text-xs font-bold text-gray-900">{supplier.totalOrders}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400">Total</p>
                <p className="text-xs font-bold text-gray-900">Rs {(supplier.totalValue / 1000).toFixed(0)}k</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400">Due</p>
                <p className={cn('text-xs font-bold', supplier.outstandingBalance > 0 ? 'text-rose-600' : 'text-gray-900')}>
                  Rs {(supplier.outstandingBalance / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={cn('h-3 w-3', i < Math.round(supplier.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200')} />
                ))}
                <span className="ml-1 text-xs text-gray-400">{supplier.rating}</span>
              </div>
              <button className="rounded-lg border border-gray-200 px-2.5 py-1 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-50">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
