'use client'

import { motion } from 'framer-motion'
import { Package, Plus, ShoppingCart, AlertTriangle, TrendingDown } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsCards, type AnalyticsItem } from '@/components/shared/analytics-cards'
import { ChartCard } from '@/components/widgets/chart-card'
import { InventoryTabs } from './inventory-tabs'
import {
  INVENTORY_STATS, ASSET_CONDITION_DATA, ASSET_BY_CATEGORY,
  MOVEMENTS_BY_DAY, PURCHASE_ORDERS, STOCK_ITEMS,
} from '@/lib/mock-data/inventory'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const CONDITION_COLORS = {
  Excellent: 'var(--color-chart-2)',
  Good: 'var(--color-chart-1)',
  Fair: 'var(--color-chart-3)',
  Poor: 'var(--color-chart-3)',
  Damaged: 'var(--color-chart-5)',
}

const CATEGORY_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-5)', 'var(--color-chart-4)', 'var(--color-chart-3)']

const STATUS_CONFIG = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  Approved: { bg: 'bg-accent', text: 'text-primary', ring: 'ring-primary/20' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  Cancelled: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/20' },
}

const criticalItems = STOCK_ITEMS.filter((s) => s.status !== 'ok')

export function InventoryDashboardPage() {
  const analytics: AnalyticsItem[] = [
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: INVENTORY_STATS.totalAssets.toString(),
      sub: 'Tracked across all rooms',
      icon: Package,
      accent: 'blue',
    },
    {
      id: 'asset-value',
      label: 'Total Value',
      value: `Rs ${(INVENTORY_STATS.totalAssetValue / 1000000).toFixed(1)}M`,
      sub: 'Combined purchase value',
      icon: TrendingDown,
      accent: 'emerald',
    },
    {
      id: 'low-stock',
      label: 'Low Stock Items',
      value: INVENTORY_STATS.lowStockItems.toString(),
      sub: 'Need restocking soon',
      icon: AlertTriangle,
      accent: 'amber',
      trend: { value: `${INVENTORY_STATS.lowStockItems} items`, positive: false },
    },
    {
      id: 'critical',
      label: 'Critical Items',
      value: INVENTORY_STATS.criticalItems.toString(),
      sub: 'Immediate action required',
      icon: AlertTriangle,
      accent: 'rose',
    },
    {
      id: 'pending-orders',
      label: 'Pending Orders',
      value: INVENTORY_STATS.pendingOrders.toString(),
      sub: 'Awaiting delivery',
      icon: ShoppingCart,
      accent: 'violet',
    },
    {
      id: 'suppliers',
      label: 'Active Suppliers',
      value: INVENTORY_STATS.activeSuppliers.toString(),
      sub: 'Verified vendors',
      icon: Package,
      accent: 'cyan',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inventory"
        description="Track assets, consumable stock, suppliers and purchase orders."
        icon={Package}
        crumbs={[{ label: 'Inventory' }]}
        actions={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
              <ShoppingCart className="h-3.5 w-3.5" />
              New Order
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/80">
              <Plus className="h-3.5 w-3.5" />
              Add Asset
            </button>
          </div>
        }
      />

      <InventoryTabs />

      <AnalyticsCards items={analytics} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Asset Condition" subtitle="Distribution by condition across all assets" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ASSET_CONDITION_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="condition" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" name="Assets" radius={[6, 6, 0, 0]}>
                {ASSET_CONDITION_DATA.map((entry) => (
                  <Cell key={entry.condition} fill={CONDITION_COLORS[entry.condition as keyof typeof CONDITION_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Stock Alerts</h3>
              <p className="mt-0.5 text-xs text-gray-400">{criticalItems.length} items need restocking</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {criticalItems.slice(0, 8).map((item, i) => {
              const isCritical = item.status === 'critical'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl p-2.5 ring-1',
                    isCritical ? 'bg-rose-50 ring-rose-600/20' : 'bg-amber-50 ring-amber-600/20',
                  )}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', isCritical ? 'bg-rose-500' : 'bg-amber-500')} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-xs font-medium', isCritical ? 'text-rose-700' : 'text-amber-700')}>{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.currentStock}/{item.minStock} {item.unit}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Asset Categories" subtitle="Assets by category" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={ASSET_BY_CATEGORY} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}>
                {ASSET_BY_CATEGORY.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stock Movements" subtitle="Items in vs out over last 30 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MOVEMENTS_BY_DAY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="in" name="Stock In" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="out" name="Stock Out" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Purchase Orders */}
      <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Purchase Orders</h3>
            <p className="mt-0.5 text-xs text-gray-400">Last 5 orders placed</p>
          </div>
          <button className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">PO Number</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Supplier</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PURCHASE_ORDERS.slice(0, 5).map((order) => {
                const statusConf = STATUS_CONFIG[order.status]
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-primary">{order.poNumber}</td>
                    <td className="px-3 py-3 text-xs text-gray-700">{order.supplier}</td>
                    <td className="px-3 py-3 text-xs text-gray-400">{formatDate(order.date)}</td>
                    <td className="px-3 py-3 text-right text-xs font-medium text-gray-900">Rs {order.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', statusConf.bg, statusConf.text, statusConf.ring)}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
