import { mulberry32, pick, dateBefore } from './rng'

const rand = mulberry32(20260801)

const STUDENT_NAMES = [
  'Ahmed Raza', 'Usman Khalid', 'Hassan Ali', 'Bilal Hussain', 'Fahad Iqbal',
  'Zain Abbas', 'Omar Farooq', 'Asad Malik', 'Hamza Sheikh', 'Saad Qureshi',
  'Talha Noor', 'Faisal Awan', 'Junaid Baig', 'Kashif Mirza', 'Waqas Chaudhry',
  'Yasir Aziz', 'Tariq Butt', 'Adnan Nasir', 'Imran Sajid', 'Rizwan Shah',
  'Sara Khan', 'Fatima Noor', 'Zainab Fatima', 'Mahnoor Aslam', 'Ayesha Siddiqi',
  'Hira Baig', 'Nimra Malik', 'Sana Tariq', 'Nadia Hussain', 'Rabia Akhtar',
]

const ROOMS = [
  'Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105',
  'Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205',
  'Room 206', 'Room 207', 'Room 208', 'Room 209', 'Room 210',
  'Room 301', 'Room 302', 'Room 303', 'Room 304', 'Room 305',
  'Room 401', 'Room 402', 'Room 403', 'Room 404', 'Room 405',
]

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner'

export type MenuDay = {
  day: string
  date: string
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

export type KitchenItem = {
  id: string
  name: string
  category: 'Grains' | 'Proteins' | 'Dairy' | 'Vegetables' | 'Spices' | 'Beverages' | 'Utilities'
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  supplier: string
  lastPurchase: string
  expiryDate: string | null
  status: 'ok' | 'low' | 'critical'
  costPerUnit: number
}

export type MealAttendanceRecord = {
  id: string
  student: string
  room: string
  date: string
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  isGuest: boolean
  guestName: string | null
}

export type GuestMeal = {
  id: string
  guestName: string
  hostStudent: string
  hostRoom: string
  date: string
  meal: MealType
  cost: number
  status: 'Approved' | 'Pending' | 'Rejected'
}

export type MealCoupon = {
  id: string
  couponNumber: string
  studentName: string
  room: string
  mealType: MealType | 'All'
  validFrom: string
  validTo: string
  usedCount: number
  totalCount: number
  status: 'Active' | 'Expired' | 'Used'
}

export type MessAlert = {
  id: string
  itemName: string
  currentStock: number
  minStock: number
  unit: string
  severity: 'low' | 'critical'
  message: string
}

// ─── Weekly Menu ──────────────────────────────────────────────────────────────

const BREAKFASTS = [
  ['Paratha', 'Anda Fry', 'Chai', 'Lassi'],
  ['Halwa Puri', 'Cholay', 'Chai', 'Fruit Chaat'],
  ['Anda Roti', 'Aloo Bhujia', 'Chai', 'Milk'],
  ['Paye', 'Naan', 'Chai', 'Dahi'],
  ['Nihari', 'Khamiri Roti', 'Chai', 'Achaar'],
  ['Poori', 'Aloo Saalan', 'Chai', 'Bananas'],
  ['Fried Eggs', 'Toast', 'Chai', 'Orange Juice'],
]

const LUNCHES = [
  ['Dal Chawal', 'Sabzi', 'Roti', 'Salad', 'Achaar'],
  ['Chicken Karahi', 'Naan', 'Raita', 'Salad'],
  ['Aloo Gosht', 'Chawal', 'Daal', 'Roti'],
  ['Biryani', 'Raita', 'Salad', 'Cold Drink'],
  ['Qeema Karahi', 'Naan', 'Mint Chutney', 'Salad'],
  ['Pulao', 'Kofta Curry', 'Roti', 'Dahi'],
  ['Saag Gosht', 'Makki Roti', 'Lassi', 'Achaar'],
]

const DINNERS = [
  ['Daal Makhani', 'Roti', 'Salad', 'Kheer'],
  ['Mutton Karahi', 'Naan', 'Raita', 'Salad'],
  ['Chicken Qorma', 'Chawal', 'Roti', 'Fruit Custard'],
  ['Haleem', 'Naan', 'Lemon', 'Hari Mirch'],
  ['Fried Rice', 'Chicken Manchurian', 'Spring Rolls', 'Soup'],
  ['Chapli Kabab', 'Naan', 'Raita', 'Salad'],
  ['Palak Gosht', 'Chawal', 'Roti', 'Seviyan'],
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const WEEKLY_MENU: MenuDay[] = DAYS_OF_WEEK.map((day, i) => {
  const base = new Date('2026-08-03') // Next Monday
  const date = new Date(base)
  date.setDate(base.getDate() + i)
  return {
    day,
    date: date.toISOString().slice(0, 10),
    breakfast: BREAKFASTS[i],
    lunch: LUNCHES[i],
    dinner: DINNERS[i],
  }
})

// ─── Kitchen Inventory ────────────────────────────────────────────────────────

const RAW_KITCHEN_ITEMS: Omit<KitchenItem, 'id' | 'status'>[] = [
  { name: 'Basmati Rice', category: 'Grains', currentStock: 85, minStock: 50, maxStock: 200, unit: 'kg', supplier: 'Al-Baraka Traders', lastPurchase: '2026-07-25', expiryDate: null, costPerUnit: 120 },
  { name: 'Wheat Flour (Atta)', category: 'Grains', currentStock: 40, minStock: 50, maxStock: 150, unit: 'kg', supplier: 'Punjab Mills', lastPurchase: '2026-07-20', expiryDate: null, costPerUnit: 85 },
  { name: 'Cooking Oil', category: 'Utilities', currentStock: 25, minStock: 30, maxStock: 80, unit: 'litre', supplier: 'Dalda Foods', lastPurchase: '2026-07-22', expiryDate: '2027-01-15', costPerUnit: 320 },
  { name: 'Milk (Fresh)', category: 'Dairy', currentStock: 12, minStock: 20, maxStock: 60, unit: 'litre', supplier: 'Haleeb Dairy', lastPurchase: '2026-08-01', expiryDate: '2026-08-03', costPerUnit: 130 },
  { name: 'Eggs', category: 'Proteins', currentStock: 18, minStock: 30, maxStock: 120, unit: 'dozen', supplier: 'City Poultry', lastPurchase: '2026-07-30', expiryDate: '2026-08-14', costPerUnit: 320 },
  { name: 'Chicken (Frozen)', category: 'Proteins', currentStock: 45, minStock: 30, maxStock: 100, unit: 'kg', supplier: 'K&N\'s Poultry', lastPurchase: '2026-07-28', expiryDate: '2026-09-01', costPerUnit: 550 },
  { name: 'Mutton', category: 'Proteins', currentStock: 15, minStock: 10, maxStock: 40, unit: 'kg', supplier: 'Karachi Meat Co', lastPurchase: '2026-07-29', expiryDate: '2026-08-05', costPerUnit: 1800 },
  { name: 'Onions', category: 'Vegetables', currentStock: 30, minStock: 20, maxStock: 60, unit: 'kg', supplier: 'Vegetable Market', lastPurchase: '2026-07-31', expiryDate: '2026-08-10', costPerUnit: 60 },
  { name: 'Tomatoes', category: 'Vegetables', currentStock: 8, minStock: 15, maxStock: 40, unit: 'kg', supplier: 'Vegetable Market', lastPurchase: '2026-07-29', expiryDate: '2026-08-04', costPerUnit: 80 },
  { name: 'Potatoes', category: 'Vegetables', currentStock: 50, minStock: 25, maxStock: 80, unit: 'kg', supplier: 'Vegetable Market', lastPurchase: '2026-07-28', expiryDate: null, costPerUnit: 55 },
  { name: 'Spinach (Palak)', category: 'Vegetables', currentStock: 5, minStock: 10, maxStock: 30, unit: 'kg', supplier: 'Vegetable Market', lastPurchase: '2026-07-30', expiryDate: '2026-08-03', costPerUnit: 70 },
  { name: 'Red Chilli Powder', category: 'Spices', currentStock: 3, minStock: 5, maxStock: 20, unit: 'kg', supplier: 'National Foods', lastPurchase: '2026-07-15', expiryDate: '2027-07-15', costPerUnit: 450 },
  { name: 'Turmeric (Haldi)', category: 'Spices', currentStock: 2, minStock: 3, maxStock: 10, unit: 'kg', supplier: 'National Foods', lastPurchase: '2026-07-15', expiryDate: '2027-07-15', costPerUnit: 380 },
  { name: 'Garam Masala', category: 'Spices', currentStock: 1.5, minStock: 2, maxStock: 8, unit: 'kg', supplier: 'Shan Foods', lastPurchase: '2026-07-10', expiryDate: '2027-07-10', costPerUnit: 650 },
  { name: 'Salt', category: 'Spices', currentStock: 8, minStock: 5, maxStock: 20, unit: 'kg', supplier: 'National Foods', lastPurchase: '2026-07-01', expiryDate: null, costPerUnit: 45 },
  { name: 'Tea (Chai Patti)', category: 'Beverages', currentStock: 4, minStock: 5, maxStock: 15, unit: 'kg', supplier: 'Tapal Tea', lastPurchase: '2026-07-20', expiryDate: '2027-01-20', costPerUnit: 800 },
  { name: 'Sugar', category: 'Grains', currentStock: 25, minStock: 20, maxStock: 60, unit: 'kg', supplier: 'Tandlianwala Sugar', lastPurchase: '2026-07-25', expiryDate: null, costPerUnit: 130 },
  { name: 'Water Bottles (1.5L)', category: 'Beverages', currentStock: 80, minStock: 100, maxStock: 300, unit: 'bottle', supplier: 'Nestle Waters', lastPurchase: '2026-07-30', expiryDate: '2027-07-30', costPerUnit: 45 },
  { name: 'Gas Cylinders', category: 'Utilities', currentStock: 3, minStock: 4, maxStock: 12, unit: 'cylinder', supplier: 'PSO Gas', lastPurchase: '2026-07-26', expiryDate: null, costPerUnit: 2800 },
  { name: 'Daal (Mash)', category: 'Grains', currentStock: 20, minStock: 15, maxStock: 50, unit: 'kg', supplier: 'Al-Baraka Traders', lastPurchase: '2026-07-22', expiryDate: null, costPerUnit: 280 },
]

export const KITCHEN_INVENTORY: KitchenItem[] = RAW_KITCHEN_ITEMS.map((item, i) => ({
  ...item,
  id: `ki-${i + 1}`,
  status: item.currentStock <= item.minStock * 0.5 ? 'critical' : item.currentStock < item.minStock ? 'low' : 'ok',
}))

// ─── Mess Alerts ──────────────────────────────────────────────────────────────

export const MESS_ALERTS: MessAlert[] = KITCHEN_INVENTORY
  .filter((item) => item.status !== 'ok')
  .map((item) => ({
    id: `alert-${item.id}`,
    itemName: item.name,
    currentStock: item.currentStock,
    minStock: item.minStock,
    unit: item.unit,
    severity: item.status as 'low' | 'critical',
    message: item.status === 'critical'
      ? `${item.name} is critically low (${item.currentStock} ${item.unit} left)`
      : `${item.name} is below minimum (${item.currentStock}/${item.minStock} ${item.unit})`,
  }))

// ─── Meal Attendance ─────────────────────────────────────────────────────────

export const MEAL_ATTENDANCE: MealAttendanceRecord[] = Array.from({ length: 500 }, (_, i) => {
  const student = pick(rand, STUDENT_NAMES)
  const room = pick(rand, ROOMS)
  const daysAgo = Math.floor(rand() * 30)
  const isGuest = rand() < 0.05
  return {
    id: `ma-${i + 1}`,
    student,
    room,
    date: dateBefore(daysAgo),
    breakfast: rand() > 0.25,
    lunch: rand() > 0.2,
    dinner: rand() > 0.3,
    isGuest,
    guestName: isGuest ? pick(rand, ['Khalid Noor', 'Sana Tariq', 'Ali Raza', 'Hira Khan', 'Omar Sheikh']) : null,
  }
})

// Today's meal counts
export const TODAY_MEALS = {
  breakfast: 312,
  lunch: 368,
  dinner: 0, // not served yet (morning)
  guests: 8,
}

// ─── Guest Meals ──────────────────────────────────────────────────────────────

export const GUEST_MEALS: GuestMeal[] = Array.from({ length: 50 }, (_, i) => {
  const daysAgo = Math.floor(rand() * 60)
  const meal = pick(rand, ['Breakfast', 'Lunch', 'Dinner'] as MealType[])
  const status = pick(rand, ['Approved', 'Approved', 'Approved', 'Pending', 'Rejected'] as const)
  return {
    id: `gm-${i + 1}`,
    guestName: pick(rand, ['Khalid Noor', 'Sana Tariq', 'Ali Raza', 'Hira Khan', 'Omar Sheikh', 'Zara Baig', 'Faheem Akhtar', 'Laiba Malik']),
    hostStudent: pick(rand, STUDENT_NAMES),
    hostRoom: pick(rand, ROOMS),
    date: dateBefore(daysAgo),
    meal,
    cost: meal === 'Breakfast' ? 80 : meal === 'Lunch' ? 150 : 130,
    status,
  }
})

// ─── Meal Coupons ─────────────────────────────────────────────────────────────

export const MEAL_COUPONS: MealCoupon[] = Array.from({ length: 100 }, (_, i) => {
  const student = pick(rand, STUDENT_NAMES)
  const room = pick(rand, ROOMS)
  const mealType = pick(rand, ['Breakfast', 'Lunch', 'Dinner', 'All'] as const)
  const total = pick(rand, [5, 10, 15, 20, 30])
  const used = Math.floor(rand() * (total + 1))
  const isExpired = rand() < 0.2
  return {
    id: `cp-${i + 1}`,
    couponNumber: `CPN-${String(2026001 + i).padStart(7, '0')}`,
    studentName: student,
    room,
    mealType,
    validFrom: dateBefore(30),
    validTo: isExpired ? dateBefore(5) : dateBefore(-30),
    usedCount: used,
    totalCount: total,
    status: isExpired ? 'Expired' : used >= total ? 'Used' : 'Active',
  }
})

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MEALS_PER_DAY = Array.from({ length: 30 }, (_, i) => {
  const date = dateBefore(29 - i)
  return {
    date,
    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    breakfast: 280 + Math.floor(rand() * 60),
    lunch: 350 + Math.floor(rand() * 50),
    dinner: 310 + Math.floor(rand() * 70),
    total: 0,
  }
}).map((d) => ({ ...d, total: d.breakfast + d.lunch + d.dinner }))

export const MONTHLY_MESS_COST = [
  { month: 'Sep', cost: 128000, budget: 135000 },
  { month: 'Oct', cost: 132000, budget: 135000 },
  { month: 'Nov', cost: 141000, budget: 140000 },
  { month: 'Dec', cost: 138000, budget: 140000 },
  { month: 'Jan', cost: 129000, budget: 135000 },
  { month: 'Feb', cost: 133000, budget: 135000 },
  { month: 'Mar', cost: 136000, budget: 138000 },
  { month: 'Apr', cost: 142000, budget: 140000 },
  { month: 'May', cost: 145000, budget: 145000 },
  { month: 'Jun', cost: 138000, budget: 145000 },
  { month: 'Jul', cost: 142300, budget: 145000 },
  { month: 'Aug', cost: 147000, budget: 150000 },
]

export const TOP_CONSUMED_ITEMS = [
  { item: 'Roti/Naan', quantity: 9200, unit: 'pcs', cost: 46000 },
  { item: 'Basmati Rice', quantity: 420, unit: 'kg', cost: 50400 },
  { item: 'Chicken', quantity: 280, unit: 'kg', cost: 154000 },
  { item: 'Cooking Oil', quantity: 85, unit: 'litre', cost: 27200 },
  { item: 'Daal (Mixed)', quantity: 95, unit: 'kg', cost: 26600 },
  { item: 'Vegetables', quantity: 180, unit: 'kg', cost: 12600 },
  { item: 'Milk', quantity: 120, unit: 'litre', cost: 15600 },
  { item: 'Eggs', quantity: 45, unit: 'dozen', cost: 14400 },
]

export const FOOD_WASTE_DATA = [
  { category: 'Vegetables', waste: 12, cost: 840 },
  { category: 'Bread/Roti', waste: 8, cost: 400 },
  { category: 'Cooked Food', waste: 15, cost: 2250 },
  { category: 'Beverages', waste: 5, cost: 650 },
  { category: 'Fruits', waste: 6, cost: 900 },
]

export const MESS_SUMMARY = {
  totalMealsToday: TODAY_MEALS.breakfast + TODAY_MEALS.lunch,
  breakfastCount: TODAY_MEALS.breakfast,
  lunchCount: TODAY_MEALS.lunch,
  dinnerCount: TODAY_MEALS.dinner,
  guestsToday: TODAY_MEALS.guests,
  monthlyMessCost: 142300,
  avgMealCost: Math.round(142300 / (490 * 30 * 3)),
  alertCount: MESS_ALERTS.length,
}
