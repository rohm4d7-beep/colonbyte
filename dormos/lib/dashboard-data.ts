export const REVENUE_DATA = [
  { month: 'Sep', revenue: 610000, expenses: 420000 },
  { month: 'Oct', revenue: 640000, expenses: 435000 },
  { month: 'Nov', revenue: 585000, expenses: 410000 },
  { month: 'Dec', revenue: 625000, expenses: 428000 },
  { month: 'Jan', revenue: 660000, expenses: 445000 },
  { month: 'Feb', revenue: 705000, expenses: 462000 },
  { month: 'Mar', revenue: 690000, expenses: 458000 },
  { month: 'Apr', revenue: 735000, expenses: 470000 },
  { month: 'May', revenue: 775000, expenses: 489000 },
  { month: 'Jun', revenue: 802000, expenses: 498000 },
  { month: 'Jul', revenue: 842500, expenses: 516800 },
  { month: 'Aug', revenue: 890000, expenses: 524000 },
]

export const OCCUPANCY_WEEKLY = [
  { day: 'Mon', occupancy: 90 },
  { day: 'Tue', occupancy: 91 },
  { day: 'Wed', occupancy: 89 },
  { day: 'Thu', occupancy: 92 },
  { day: 'Fri', occupancy: 93 },
  { day: 'Sat', occupancy: 91 },
  { day: 'Sun', occupancy: 94 },
]

export const EXPENSE_BREAKDOWN = [
  { name: 'Mess & Food', value: 142300, color: 'var(--color-chart-1)' },
  { name: 'Staff Salaries', value: 148000, color: 'var(--color-chart-2)' },
  { name: 'Electricity', value: 68000, color: 'var(--color-chart-3)' },
  { name: 'Maintenance', value: 52000, color: 'var(--color-chart-4)' },
  { name: 'Water & Utilities', value: 46500, color: 'var(--color-chart-5)' },
  { name: 'Other', value: 60000, color: 'var(--color-chart-6)' },
]

export const PAYMENT_DATA = [
  { month: 'Sep', collected: 560000, pending: 52000 },
  { month: 'Oct', collected: 585000, pending: 48000 },
  { month: 'Nov', collected: 540000, pending: 61000 },
  { month: 'Dec', collected: 570000, pending: 54000 },
  { month: 'Jan', collected: 605000, pending: 47000 },
  { month: 'Feb', collected: 645000, pending: 51000 },
  { month: 'Mar', collected: 630000, pending: 58000 },
  { month: 'Apr', collected: 672000, pending: 49000 },
  { month: 'May', collected: 708000, pending: 44000 },
  { month: 'Jun', collected: 736000, pending: 46000 },
  { month: 'Jul', collected: 782000, pending: 60500 },
  { month: 'Aug', collected: 824000, pending: 55000 },
]

export const ROOM_STATUS_DATA = [
  { name: 'Occupied', value: 92, color: 'var(--color-chart-1)' },
  { name: 'Vacant', value: 14, color: 'var(--color-chart-2)' },
  { name: 'Cleaning', value: 6, color: 'var(--color-chart-3)' },
  { name: 'Maintenance', value: 4, color: 'var(--color-chart-5)' },
]

export const ANALYTICS_KPIS = [
  {
    label: 'Revenue Growth',
    value: '+18.2%',
    detail: 'vs. last month',
    positive: true,
    spark: [40, 42, 45, 48, 52, 55, 60],
  },
  {
    label: 'Occupancy Growth',
    value: '+2.1%',
    detail: 'vs. last month',
    positive: true,
    spark: [82, 84, 83, 87, 89, 90, 92],
  },
  {
    label: 'Expense Trend',
    value: '+7.4%',
    detail: 'vs. last month',
    positive: false,
    spark: [40, 42, 41, 44, 45, 46, 47],
  },
  {
    label: 'Avg. Stay Duration',
    value: '8.4 mo',
    detail: '+0.6 mo',
    positive: true,
    spark: [6.2, 6.8, 7.1, 7.4, 7.8, 8.1, 8.4],
  },
  {
    label: 'Collection Rate',
    value: '96.4%',
    detail: '+1.8%',
    positive: true,
    spark: [90, 91, 92, 93, 94, 95, 96],
  },
  {
    label: 'Profit Margin',
    value: '38.6%',
    detail: '+2.3%',
    positive: true,
    spark: [30, 32, 33, 35, 36, 37, 39],
  },
]
