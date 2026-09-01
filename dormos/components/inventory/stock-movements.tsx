'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, ArrowUp, ArrowDown, Settings2, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { InventoryTabs } from './inventory-tabs'
import { STOCK_MOVEMENTS } from '@/lib/mock-data/inventory'
import type { MovementType } from '@/lib/mock-data/inventory'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<MovementType, { icon: typeof ArrowUp; bg: string; text: string; ring: string; iconColor: string }> = {
  In: { icon: ArrowUp, bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', iconColor: 'text-emerald-600' },
  Out: { icon: ArrowDown, bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20', iconColor: 'text-rose-600' },
  Adjustment: { icon: Settings2, bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20', iconColor: 'text-primary' },
}

export function StockMovementsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all')

  const sorted = [...STOCK_MOVEMENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filtered = sorted.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.itemName.toLowerCase().includes(q) || m.performedBy.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSearch && matchType
  })

  const inCount = STOCK_MOVEMENTS.filter((m) => m.type === 'In').length
  const outCount = STOCK_MOVEMENTS.filter((m) => m.type === 'Out').length
  const adjustCount = STOCK_MOVEMENTS.filter((m) => m.type === 'Adjustment').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Stock Movements"
        description="Track all inventory in/out activity and adjustments."
        icon={ArrowRightLeft}
        crumbs={[{ label: 'Inventory', href: '/dashboard/inventory' }, { label: 'Movements' }]}
      />

      <InventoryTabs />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Stock In', value: inCount, icon: ArrowUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Stock Out', value: outCount, icon: ArrowDown, color: 'text-rose-600 bg-rose-50' },
          { label: 'Adjustments', value: adjustCount, icon: Settings2, color: 'text-primary bg-accent' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', card.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-lg font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search item or staff..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs placeholder-gray-400 shadow-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(['all', 'In', 'Out', 'Adjustment'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', typeFilter === t ? 'bg-accent text-primary' : 'text-gray-500 hover:bg-gray-50')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col divide-y divide-gray-50">
          {filtered.map((movement, i) => {
            const typeConf = TYPE_CONFIG[movement.type]
            const Icon = typeConf.icon
            const date = new Date(movement.date)
            return (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5', typeConf.bg)}>
                  <Icon className={cn('h-4 w-4', typeConf.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{movement.itemName}</p>
                      <p className="text-xs text-gray-500">{movement.reason}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">By {movement.performedBy}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', typeConf.bg, typeConf.text, typeConf.ring)}>
                          {movement.type === 'In' ? '+' : movement.type === 'Out' ? '-' : '±'}{movement.quantity} {movement.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {movement.reference && (
                        <p className="text-[10px] text-primary mt-0.5">{movement.reference}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
