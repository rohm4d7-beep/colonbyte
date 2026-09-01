'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Grid3X3, List, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTabs } from './inventory-tabs'
import { ASSETS } from '@/lib/mock-data/inventory'
import type { AssetCategory, AssetCondition } from '@/lib/mock-data/inventory'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const CONDITION_CONFIG: Record<AssetCondition, { bg: string; text: string; ring: string }> = {
  Excellent: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Good: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Fair: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Poor: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' },
  Damaged: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
}

const STATUS_CONFIG = {
  Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  'In Repair': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Retired: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const CATEGORY_ICONS: Record<AssetCategory, string> = {
  Furniture: '🪑',
  Electronics: '💡',
  Cleaning: '🧹',
  Kitchen: '🍳',
  Safety: '🔥',
}

const CATEGORIES: (AssetCategory | 'all')[] = ['all', 'Furniture', 'Electronics', 'Safety', 'Cleaning', 'Kitchen']
const CONDITIONS: (AssetCondition | 'all')[] = ['all', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged']

export function AssetsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AssetCategory | 'all'>('all')
  const [condition, setCondition] = useState<AssetCondition | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(1)

  const filtered = ASSETS.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q) || a.currentLocation.toLowerCase().includes(q)
    const matchCat = category === 'all' || a.category === category
    const matchCond = condition === 'all' || a.condition === condition
    return matchSearch && matchCat && matchCond
  })

  const total = filtered.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const assets = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assets"
        description="Track all physical assets across rooms and departments."
        icon={Package}
        crumbs={[{ label: 'Inventory', href: '/dashboard/inventory' }, { label: 'Assets' }]}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
            <Plus className="h-3.5 w-3.5" />
            Add Asset
          </button>
        }
      />

      <InventoryTabs />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as AssetCategory | 'all'); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <select
          value={condition}
          onChange={(e) => { setCondition(e.target.value as AssetCondition | 'all'); setPage(1) }}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:border-primary/50"
        >
          {CONDITIONS.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Conditions' : c}</option>)}
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button onClick={() => setViewMode('list')} className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors', viewMode === 'list' ? 'bg-accent text-primary' : 'text-gray-400 hover:bg-gray-50')}>
            <List className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setViewMode('grid')} className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors', viewMode === 'grid' ? 'bg-accent text-primary' : 'text-gray-400 hover:bg-gray-50')}>
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-xs text-gray-400">{total} assets</span>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Asset</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Condition</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Location</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Warranty</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map((asset, i) => {
                  const condConf = CONDITION_CONFIG[asset.condition]
                  const statusConf = STATUS_CONFIG[asset.status]
                  const warrantyExpired = asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()
                  return (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{CATEGORY_ICONS[asset.category]} {asset.name}</p>
                          <p className="text-[10px] text-gray-400">{asset.assetId}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{asset.subCategory}</td>
                      <td className="px-3 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', condConf.bg, condConf.text, condConf.ring)}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 max-w-[140px] truncate">{asset.currentLocation}</td>
                      <td className="px-3 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {asset.warrantyExpiry ? (
                          <span className={warrantyExpired ? 'text-rose-500' : 'text-gray-500'}>
                            {warrantyExpired ? 'Expired' : formatDate(asset.warrantyExpiry)}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">
                        Rs {asset.purchasePrice.toLocaleString()}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 6) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors', page === p ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset, i) => {
            const condConf = CONDITION_CONFIG[asset.condition]
            const statusConf = STATUS_CONFIG[asset.status]
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{CATEGORY_ICONS[asset.category]}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', condConf.bg, condConf.text, condConf.ring)}>
                    {asset.condition}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900">{asset.name}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{asset.assetId}</p>
                <p className="mt-2 text-xs text-gray-500 truncate">{asset.currentLocation}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                    {asset.status}
                  </span>
                  <span className="text-xs font-medium text-gray-700">Rs {asset.purchasePrice.toLocaleString()}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
