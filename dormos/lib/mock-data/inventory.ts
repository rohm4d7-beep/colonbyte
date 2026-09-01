import { mulberry32, pick, dateBefore } from './rng'

const rand = mulberry32(20260806)

export type AssetCategory = 'Furniture' | 'Electronics' | 'Cleaning' | 'Kitchen' | 'Safety'
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged'
export type AssetStatus = 'Active' | 'In Repair' | 'Retired'
export type StockStatus = 'ok' | 'low' | 'critical'
export type MovementType = 'In' | 'Out' | 'Adjustment'
export type SupplierStatus = 'Active' | 'Inactive'
export type OrderStatus = 'Pending' | 'Approved' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid'

export type Asset = {
  id: string
  assetId: string
  name: string
  category: AssetCategory
  subCategory: string
  purchaseDate: string
  purchasePrice: number
  warrantyExpiry: string | null
  currentLocation: string
  condition: AssetCondition
  assignedRoom: string | null
  assignedStaff: string | null
  lastMaintenance: string | null
  notes: string | null
  status: AssetStatus
}

export type StockItem = {
  id: string
  name: string
  category: 'Cleaning' | 'Kitchen' | 'Office' | 'Maintenance'
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  costPerUnit: number
  supplier: string
  lastPurchase: string
  status: StockStatus
}

export type Supplier = {
  id: string
  supplierId: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string
  category: string
  products: string[]
  totalOrders: number
  totalValue: number
  outstandingBalance: number
  rating: number
  status: SupplierStatus
  joinedDate: string
}

export type PurchaseOrder = {
  id: string
  poNumber: string
  supplier: string
  supplierId: string
  date: string
  expectedDelivery: string
  items: { name: string; qty: number; unitPrice: number }[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  notes: string | null
}

export type StockMovement = {
  id: string
  date: string
  itemName: string
  type: MovementType
  quantity: number
  unit: string
  reason: string
  performedBy: string
  reference: string | null
}

// ─── Assets ───────────────────────────────────────────────────────────────────

const ASSET_TEMPLATES: { name: string; category: AssetCategory; subCategory: string; count: number; priceRange: [number, number] }[] = [
  { name: 'Single Bed Frame', category: 'Furniture', subCategory: 'Bed', count: 60, priceRange: [8000, 15000] },
  { name: 'Foam Mattress (Single)', category: 'Furniture', subCategory: 'Mattress', count: 60, priceRange: [3500, 7000] },
  { name: 'Study Table', category: 'Furniture', subCategory: 'Table', count: 30, priceRange: [4000, 8000] },
  { name: 'Plastic Chair', category: 'Furniture', subCategory: 'Chair', count: 60, priceRange: [1200, 2500] },
  { name: 'Steel Cupboard', category: 'Furniture', subCategory: 'Cupboard', count: 30, priceRange: [8000, 16000] },
  { name: 'Ceiling Fan', category: 'Electronics', subCategory: 'Fan', count: 40, priceRange: [3500, 6000] },
  { name: 'LED Tube Light', category: 'Electronics', subCategory: 'Light', count: 80, priceRange: [800, 1500] },
  { name: 'AC Unit (1 Ton)', category: 'Electronics', subCategory: 'Air Conditioner', count: 15, priceRange: [45000, 75000] },
  { name: 'WiFi Router', category: 'Electronics', subCategory: 'Network', count: 10, priceRange: [4000, 12000] },
  { name: 'CCTV Camera', category: 'Electronics', subCategory: 'Security', count: 15, priceRange: [5000, 15000] },
  { name: 'Fire Extinguisher', category: 'Safety', subCategory: 'Fire Safety', count: 12, priceRange: [3500, 6000] },
  { name: 'Water Cooler', category: 'Electronics', subCategory: 'Appliance', count: 8, priceRange: [15000, 25000] },
  { name: 'Washing Machine', category: 'Electronics', subCategory: 'Appliance', count: 4, priceRange: [35000, 55000] },
  { name: 'Window Curtains (pair)', category: 'Furniture', subCategory: 'Curtain', count: 50, priceRange: [800, 2000] },
  { name: 'Pillow (Standard)', category: 'Furniture', subCategory: 'Bedding', count: 60, priceRange: [400, 800] },
]

const CONDITIONS: AssetCondition[] = ['Excellent', 'Good', 'Good', 'Fair', 'Poor', 'Damaged']
const CONDITIONS_WEIGHTS = [0.2, 0.35, 0.25, 0.12, 0.05, 0.03]

function weightedPick<T>(r: () => number, items: T[], weights: number[]): T {
  const v = r()
  let c = 0
  for (let i = 0; i < items.length; i++) {
    c += weights[i]
    if (v < c) return items[i]
  }
  return items[items.length - 1]
}

const ROOMS_LIST = ['Floor 1 - Room 101', 'Floor 1 - Room 102', 'Floor 1 - Room 103', 'Floor 2 - Room 201', 'Floor 2 - Room 202', 'Floor 2 - Room 203', 'Floor 3 - Room 301', 'Floor 3 - Room 302', 'Floor 4 - Room 401', 'Common Area', 'Corridor - Floor 1', 'Corridor - Floor 2', 'Mess Hall', 'Reception', 'Security Post']

let assetCount = 0
export const ASSETS: Asset[] = ASSET_TEMPLATES.flatMap((template) =>
  Array.from({ length: template.count }, (_, i) => {
    assetCount++
    const condition = weightedPick(rand, CONDITIONS, CONDITIONS_WEIGHTS)
    const daysAgo = 180 + Math.floor(rand() * 1460)
    const purchaseDate = dateBefore(daysAgo)
    const warrantyMonths = pick(rand, [12, 24, 36, null])
    const warrantyExpiry = warrantyMonths
      ? (() => { const d = new Date(purchaseDate); d.setMonth(d.getMonth() + warrantyMonths); return d.toISOString().slice(0, 10) })()
      : null
    return {
      id: `ast-${assetCount}`,
      assetId: `AST-${String(assetCount).padStart(4, '0')}`,
      name: `${template.name} #${i + 1}`,
      category: template.category,
      subCategory: template.subCategory,
      purchaseDate,
      purchasePrice: Math.round(template.priceRange[0] + rand() * (template.priceRange[1] - template.priceRange[0])),
      warrantyExpiry,
      currentLocation: pick(rand, ROOMS_LIST),
      condition,
      assignedRoom: rand() < 0.7 ? pick(rand, ['Room 101', 'Room 201', 'Room 301', 'Room 401']) : null,
      assignedStaff: null,
      lastMaintenance: rand() < 0.4 ? dateBefore(Math.floor(rand() * 60)) : null,
      notes: null,
      status: condition === 'Damaged' ? 'In Repair' : rand() < 0.95 ? 'Active' : 'Retired',
    }
  })
)

// ─── Stock Items ──────────────────────────────────────────────────────────────

const STOCK_RAW: Omit<StockItem, 'id' | 'status'>[] = [
  { name: 'Floor Cleaner', category: 'Cleaning', currentStock: 8, minStock: 10, maxStock: 30, unit: 'litre', costPerUnit: 180, supplier: 'National Cleaning', lastPurchase: '2026-07-20' },
  { name: 'Bleach (Bleach-It)', category: 'Cleaning', currentStock: 3, minStock: 8, maxStock: 25, unit: 'litre', costPerUnit: 150, supplier: 'National Cleaning', lastPurchase: '2026-07-15' },
  { name: 'Toilet Cleaner', category: 'Cleaning', currentStock: 12, minStock: 10, maxStock: 30, unit: 'bottle', costPerUnit: 120, supplier: 'National Cleaning', lastPurchase: '2026-07-22' },
  { name: 'Dishwashing Liquid', category: 'Cleaning', currentStock: 5, minStock: 6, maxStock: 20, unit: 'bottle', costPerUnit: 90, supplier: 'National Cleaning', lastPurchase: '2026-07-18' },
  { name: 'Mops', category: 'Cleaning', currentStock: 8, minStock: 5, maxStock: 15, unit: 'pcs', costPerUnit: 350, supplier: 'Cleaning Depot', lastPurchase: '2026-07-01' },
  { name: 'Brooms', category: 'Cleaning', currentStock: 10, minStock: 8, maxStock: 20, unit: 'pcs', costPerUnit: 250, supplier: 'Cleaning Depot', lastPurchase: '2026-07-01' },
  { name: 'Tissue Rolls', category: 'Cleaning', currentStock: 45, minStock: 30, maxStock: 100, unit: 'roll', costPerUnit: 35, supplier: 'National Cleaning', lastPurchase: '2026-07-25' },
  { name: 'Garbage Bags (Large)', category: 'Cleaning', currentStock: 3, minStock: 5, maxStock: 20, unit: 'pack', costPerUnit: 200, supplier: 'Cleaning Depot', lastPurchase: '2026-07-10' },
  { name: 'Hand Soap (Liquid)', category: 'Cleaning', currentStock: 15, minStock: 12, maxStock: 40, unit: 'litre', costPerUnit: 200, supplier: 'National Cleaning', lastPurchase: '2026-07-20' },
  { name: 'Light Bulbs (LED)', category: 'Maintenance', currentStock: 24, minStock: 15, maxStock: 50, unit: 'pcs', costPerUnit: 350, supplier: 'Karachi Hardware', lastPurchase: '2026-07-05' },
  { name: 'Electrical Wire (Roll)', category: 'Maintenance', currentStock: 2, minStock: 3, maxStock: 10, unit: 'roll', costPerUnit: 1800, supplier: 'Karachi Hardware', lastPurchase: '2026-06-15' },
  { name: 'PVC Pipe', category: 'Maintenance', currentStock: 8, minStock: 5, maxStock: 20, unit: 'metre', costPerUnit: 120, supplier: 'Karachi Hardware', lastPurchase: '2026-06-20' },
  { name: 'Plumbing Tape', category: 'Maintenance', currentStock: 10, minStock: 8, maxStock: 25, unit: 'roll', costPerUnit: 45, supplier: 'Karachi Hardware', lastPurchase: '2026-07-10' },
  { name: 'Printer Paper (A4)', category: 'Office', currentStock: 5, minStock: 10, maxStock: 30, unit: 'ream', costPerUnit: 850, supplier: 'Office Zone', lastPurchase: '2026-07-01' },
  { name: 'Pens (Box)', category: 'Office', currentStock: 8, minStock: 5, maxStock: 20, unit: 'box', costPerUnit: 250, supplier: 'Office Zone', lastPurchase: '2026-07-15' },
  { name: 'Registers', category: 'Office', currentStock: 12, minStock: 8, maxStock: 25, unit: 'pcs', costPerUnit: 120, supplier: 'Office Zone', lastPurchase: '2026-07-10' },
  { name: 'Stapler Pins', category: 'Office', currentStock: 6, minStock: 5, maxStock: 15, unit: 'box', costPerUnit: 80, supplier: 'Office Zone', lastPurchase: '2026-07-05' },
  { name: 'Paint (White - 4L)', category: 'Maintenance', currentStock: 4, minStock: 5, maxStock: 15, unit: 'tin', costPerUnit: 1800, supplier: 'Berger Paints', lastPurchase: '2026-06-10' },
  { name: 'Masking Tape', category: 'Maintenance', currentStock: 8, minStock: 6, maxStock: 20, unit: 'roll', costPerUnit: 55, supplier: 'Karachi Hardware', lastPurchase: '2026-07-08' },
  { name: 'Mosquito Repellent', category: 'Cleaning', currentStock: 6, minStock: 8, maxStock: 25, unit: 'bottle', costPerUnit: 180, supplier: 'National Cleaning', lastPurchase: '2026-07-22' },
]

export const STOCK_ITEMS: StockItem[] = STOCK_RAW.map((item, i) => ({
  ...item,
  id: `stk-${i + 1}`,
  status: item.currentStock <= item.minStock * 0.5 ? 'critical' : item.currentStock < item.minStock ? 'low' : 'ok',
}))

// ─── Suppliers ────────────────────────────────────────────────────────────────

const SUPPLIER_DATA = [
  { name: 'Al-Baraka Traders', category: 'Groceries & Food', city: 'Lahore', products: ['Rice', 'Flour', 'Daal', 'Spices'] },
  { name: 'Punjab Electronics', category: 'Electronics', city: 'Lahore', products: ['Fans', 'LED Lights', 'Electrical Parts'] },
  { name: 'Karachi Hardware', category: 'Hardware & Maintenance', city: 'Karachi', products: ['Tools', 'Wire', 'Pipes', 'Fittings'] },
  { name: 'National Cleaning Supplies', category: 'Cleaning', city: 'Lahore', products: ['Floor Cleaner', 'Bleach', 'Soap', 'Disinfectants'] },
  { name: 'Islamabad Furniture Co', category: 'Furniture', city: 'Islamabad', products: ['Beds', 'Tables', 'Chairs', 'Cupboards'] },
  { name: 'K&N\'s Poultry', category: 'Food Supplies', city: 'Lahore', products: ['Frozen Chicken', 'Chicken Portions'] },
  { name: 'Tariq Traders', category: 'General Supplies', city: 'Lahore', products: ['Stationery', 'Office Supplies', 'Miscellaneous'] },
  { name: 'Haleeb Dairy', category: 'Dairy', city: 'Lahore', products: ['Fresh Milk', 'Yogurt', 'Butter'] },
  { name: 'Nestlé Pakistan', category: 'Beverages', city: 'Lahore', products: ['Water Bottles', 'Juice', 'Milo'] },
  { name: 'National Foods', category: 'Food Supplies', city: 'Karachi', products: ['Spices', 'Sauces', 'Masala'] },
  { name: 'Shan Foods', category: 'Food Supplies', city: 'Karachi', products: ['Biryani Masala', 'Haleem Mix', 'Spice Blends'] },
  { name: 'Office Zone', category: 'Stationery', city: 'Lahore', products: ['Paper', 'Pens', 'Registers', 'Files'] },
  { name: 'Berger Paints', category: 'Paints', city: 'Lahore', products: ['Wall Paint', 'Primer', 'Paint Brushes'] },
  { name: 'Cleaning Depot', category: 'Cleaning Equipment', city: 'Lahore', products: ['Mops', 'Brooms', 'Buckets'] },
  { name: 'City Poultry', category: 'Food Supplies', city: 'Lahore', products: ['Fresh Eggs', 'Live Birds'] },
  { name: 'PSO Gas', category: 'Utilities', city: 'Lahore', products: ['Gas Cylinders', 'Regulators'] },
  { name: 'Dalda Foods', category: 'Cooking Supplies', city: 'Lahore', products: ['Cooking Oil', 'Ghee'] },
  { name: 'Vegetable Market', category: 'Fresh Produce', city: 'Lahore', products: ['Vegetables', 'Fruit', 'Herbs'] },
  { name: 'Karachi Meat Co', category: 'Meat & Poultry', city: 'Karachi', products: ['Mutton', 'Beef', 'Offal'] },
  { name: 'Punjab Mills', category: 'Grain & Flour', city: 'Faisalabad', products: ['Wheat Flour', 'Semolina', 'Corn Flour'] },
]

const CONTACT_NAMES = ['Mr. Tariq', 'Mr. Asif', 'Mr. Nadeem', 'Mrs. Sadia', 'Mr. Kamran', 'Mr. Zafar', 'Mr. Imran', 'Ms. Nadia', 'Mr. Rashid', 'Mr. Waseem']

export const SUPPLIERS: Supplier[] = SUPPLIER_DATA.map((s, i) => ({
  id: `sup-${i + 1}`,
  supplierId: `SUP-${String(i + 1).padStart(3, '0')}`,
  name: s.name,
  contactPerson: pick(rand, CONTACT_NAMES),
  phone: `0${pick(rand, ['300', '301', '321', '333'])}-${String(1000000 + Math.floor(rand() * 8999999)).slice(0, 7)}`,
  email: `info@${s.name.toLowerCase().replace(/[^a-z]/g, '')}.pk`,
  address: `Plot ${Math.floor(rand() * 99) + 1}, Industrial Area`,
  city: s.city,
  category: s.category,
  products: s.products,
  totalOrders: 5 + Math.floor(rand() * 50),
  totalValue: 50000 + Math.floor(rand() * 950000),
  outstandingBalance: Math.floor(rand() * 80000),
  rating: Math.round((3 + rand() * 2) * 10) / 10,
  status: rand() < 0.9 ? 'Active' : 'Inactive',
  joinedDate: dateBefore(180 + Math.floor(rand() * 730)),
}))

// ─── Purchase Orders ──────────────────────────────────────────────────────────

const ORDER_ITEMS = ['Rice (50kg)', 'Cooking Oil (20L)', 'Chicken (20kg)', 'Flour (25kg)', 'Cleaning Supplies', 'LED Lights (Box)', 'Mattress', 'Fan', 'Tissue Rolls']
const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Approved', 'Delivered', 'Cancelled']
const ORDER_STATUS_WEIGHTS = [0.2, 0.2, 0.5, 0.1]

export const PURCHASE_ORDERS: PurchaseOrder[] = Array.from({ length: 40 }, (_, i) => {
  const supplier = pick(rand, SUPPLIERS)
  const daysAgo = Math.floor(rand() * 90)
  const status = weightedPick(rand, ORDER_STATUSES, ORDER_STATUS_WEIGHTS)
  const itemCount = 1 + Math.floor(rand() * 4)
  const items = Array.from({ length: itemCount }, () => ({
    name: pick(rand, ORDER_ITEMS),
    qty: 5 + Math.floor(rand() * 45),
    unitPrice: 100 + Math.floor(rand() * 4900),
  }))
  const totalAmount = items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0)
  return {
    id: `po-${i + 1}`,
    poNumber: `PO-2026-${String(i + 1).padStart(3, '0')}`,
    supplier: supplier.name,
    supplierId: supplier.supplierId,
    date: dateBefore(daysAgo),
    expectedDelivery: dateBefore(daysAgo - 7),
    items,
    totalAmount,
    status,
    paymentStatus: status === 'Delivered' ? (rand() < 0.7 ? 'Paid' : 'Partial') : status === 'Cancelled' ? 'Unpaid' : pick(rand, ['Unpaid', 'Partial']),
    notes: rand() < 0.3 ? 'Urgent delivery required' : null,
  }
})

// ─── Stock Movements ──────────────────────────────────────────────────────────

const MOVEMENT_REASONS = {
  In: ['Purchase delivery', 'Returned from repair', 'Stock replenishment', 'Donation received'],
  Out: ['Consumed in mess', 'Distributed to rooms', 'Sent for repair', 'Disposed (expired)'],
  Adjustment: ['Stock count correction', 'Damaged goods write-off', 'Audit adjustment', 'Transfer between stores'],
}

const MOVE_STAFF = ['Tariq Hussain', 'Sadia Bibi', 'Imran Khan', 'Abdul Rehman', 'Rukhsana Begum']

export const STOCK_MOVEMENTS: StockMovement[] = Array.from({ length: 100 }, (_, i) => {
  const type = pick(rand, ['In', 'In', 'Out', 'Out', 'Out', 'Adjustment'] as MovementType[])
  const daysAgo = Math.floor(rand() * 30)
  const item = pick(rand, STOCK_ITEMS)
  return {
    id: `mov-${i + 1}`,
    date: new Date(dateBefore(daysAgo) + 'T' + String(8 + Math.floor(rand() * 10)).padStart(2, '0') + ':' + String(Math.floor(rand() * 60)).padStart(2, '0') + ':00').toISOString(),
    itemName: item.name,
    type,
    quantity: 1 + Math.floor(rand() * 20),
    unit: item.unit,
    reason: pick(rand, MOVEMENT_REASONS[type]),
    performedBy: pick(rand, MOVE_STAFF),
    reference: type === 'In' ? `PO-2026-${String(Math.floor(rand() * 40) + 1).padStart(3, '0')}` : null,
  }
})

// ─── Aggregates ───────────────────────────────────────────────────────────────

export const INVENTORY_STATS = {
  totalAssets: ASSETS.length,
  totalAssetValue: ASSETS.reduce((sum, a) => sum + a.purchasePrice, 0),
  lowStockItems: STOCK_ITEMS.filter((s) => s.status === 'low').length,
  criticalItems: STOCK_ITEMS.filter((s) => s.status === 'critical').length,
  pendingOrders: PURCHASE_ORDERS.filter((o) => o.status === 'Pending' || o.status === 'Approved').length,
  activeSuppliers: SUPPLIERS.filter((s) => s.status === 'Active').length,
}

export const ASSET_BY_CONDITION = CONDITIONS_WEIGHTS.map((_, i) => {
  const condition: AssetCondition = (['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'] as AssetCondition[])[i === 5 ? 4 : i]
  return {
    condition,
    count: ASSETS.filter((a) => a.condition === condition).length,
  }
}).filter((c) => c.count > 0)

const CONDITION_LABELS: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']
export const ASSET_CONDITION_DATA = CONDITION_LABELS.map((condition) => ({
  condition,
  count: ASSETS.filter((a) => a.condition === condition).length,
}))

export const ASSET_BY_CATEGORY = (['Furniture', 'Electronics', 'Safety', 'Cleaning', 'Kitchen'] as AssetCategory[]).map((cat) => ({
  category: cat,
  count: ASSETS.filter((a) => a.category === cat).length,
  value: ASSETS.filter((a) => a.category === cat).reduce((sum, a) => sum + a.purchasePrice, 0),
}))

export const MOVEMENTS_BY_DAY = Array.from({ length: 30 }, (_, i) => {
  const date = dateBefore(29 - i)
  return {
    date,
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    in: 2 + Math.floor(rand() * 8),
    out: 3 + Math.floor(rand() * 10),
  }
})
