export type Kpi = {
  id: string
  label: string
  value: string
  change: string
  positive: boolean
  accent: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan'
}

export const EXEC_KPIS: Kpi[] = [
  { id: 'k1', label: 'Revenue', value: 'Rs 842.5K', change: '+18.2%', positive: true, accent: 'blue' },
  { id: 'k2', label: 'Expenses', value: 'Rs 516.8K', change: '+7.4%', positive: false, accent: 'rose' },
  { id: 'k3', label: 'Profit', value: 'Rs 325.7K', change: '+12.6%', positive: true, accent: 'emerald' },
  { id: 'k4', label: 'Occupancy', value: '92%', change: '+2.1 pts', positive: true, accent: 'violet' },
  { id: 'k5', label: 'Student growth', value: '+12', change: '+20%', positive: true, accent: 'blue' },
  { id: 'k6', label: 'Room utilization', value: '88%', change: '+1.4 pts', positive: true, accent: 'cyan' },
  { id: 'k7', label: 'Mess cost', value: 'Rs 142.3K', change: '+7.0%', positive: false, accent: 'amber' },
  { id: 'k8', label: 'Maintenance cost', value: 'Rs 52K', change: '+4.1%', positive: false, accent: 'rose' },
  { id: 'k9', label: 'Inventory value', value: 'Rs 485K', change: '+3.2%', positive: true, accent: 'emerald' },
  { id: 'k10', label: 'Attendance', value: '94%', change: '-1.6 pts', positive: false, accent: 'cyan' },
]

export const REVENUE_TREND = [
  { month: 'Feb', revenue: 610, expenses: 420 },
  { month: 'Mar', revenue: 640, expenses: 440 },
  { month: 'Apr', revenue: 690, expenses: 455 },
  { month: 'May', revenue: 715, expenses: 470 },
  { month: 'Jun', revenue: 745, expenses: 485 },
  { month: 'Jul', revenue: 842, expenses: 517 },
]

export const OCCUPANCY_TREND = [
  { month: 'Feb', occupancy: 84 },
  { month: 'Mar', occupancy: 86 },
  { month: 'Apr', occupancy: 88 },
  { month: 'May', occupancy: 89 },
  { month: 'Jun', occupancy: 90 },
  { month: 'Jul', occupancy: 92 },
]

export const MONTHLY_KPIS = [
  { month: 'Feb', revenue: 610, expenses: 420, profit: 190 },
  { month: 'Mar', revenue: 640, expenses: 440, profit: 200 },
  { month: 'Apr', revenue: 690, expenses: 455, profit: 235 },
  { month: 'May', revenue: 715, expenses: 470, profit: 245 },
  { month: 'Jun', revenue: 745, expenses: 485, profit: 260 },
  { month: 'Jul', revenue: 842, expenses: 517, profit: 326 },
]

export const ROOM_UTILIZATION = [
  { block: 'Block A', utilized: 90, vacant: 10 },
  { block: 'Block B', utilized: 88, vacant: 12 },
  { block: 'Block C', utilized: 95, vacant: 5 },
]

export const COST_TREND = [
  { month: 'Feb', mess: 118, maintenance: 38, utilities: 52 },
  { month: 'Mar', mess: 122, maintenance: 41, utilities: 55 },
  { month: 'Apr', mess: 126, maintenance: 44, utilities: 58 },
  { month: 'May', mess: 130, maintenance: 48, utilities: 61 },
  { month: 'Jun', mess: 131, maintenance: 50, utilities: 61 },
  { month: 'Jul', mess: 142, maintenance: 52, utilities: 68 },
]

export const HEATMAP = [
  { hour: '00–06', Mon: 4, Tue: 3, Wed: 5, Thu: 4, Fri: 6, Sat: 8, Sun: 9 },
  { hour: '06–09', Mon: 12, Tue: 14, Wed: 13, Thu: 12, Fri: 11, Sat: 6, Sun: 5 },
  { hour: '09–12', Mon: 8, Tue: 7, Wed: 9, Thu: 8, Fri: 7, Sat: 5, Sun: 4 },
  { hour: '12–15', Mon: 10, Tue: 11, Wed: 9, Thu: 10, Fri: 12, Sat: 8, Sun: 7 },
  { hour: '15–18', Mon: 9, Tue: 8, Wed: 10, Thu: 9, Fri: 10, Sat: 9, Sun: 8 },
  { hour: '18–21', Mon: 18, Tue: 19, Wed: 17, Thu: 18, Fri: 20, Sat: 22, Sun: 16 },
  { hour: '21–24', Mon: 15, Tue: 14, Wed: 16, Thu: 15, Fri: 17, Sat: 19, Sun: 14 },
]

export const BLOCK_COMPARISON = [
  { block: 'Block A', revenue: 320, expenses: 190 },
  { block: 'Block B', revenue: 280, expenses: 175 },
  { block: 'Block C', revenue: 242, expenses: 152 },
]

export const EXPENSE_DONUT = [
  { name: 'Staff Salaries', value: 148, color: 'var(--color-chart-1)' },
  { name: 'Mess & Food', value: 142, color: 'var(--color-chart-2)' },
  { name: 'Electricity', value: 68, color: 'var(--color-chart-3)' },
  { name: 'Maintenance', value: 52, color: 'var(--color-chart-4)' },
  { name: 'Water & Utilities', value: 46, color: 'var(--color-chart-5)' },
  { name: 'Other', value: 60, color: 'var(--color-chart-6)' },
]

export const STUDENT_GROWTH = [
  { month: 'Feb', admissions: 18, checkouts: 14 },
  { month: 'Mar', admissions: 22, checkouts: 16 },
  { month: 'Apr', admissions: 16, checkouts: 19 },
  { month: 'May', admissions: 20, checkouts: 15 },
  { month: 'Jun', admissions: 26, checkouts: 14 },
  { month: 'Jul', admissions: 31, checkouts: 19 },
]

export const ATTENDANCE_TREND = [
  { day: 'Mon', present: 76, absent: 4 },
  { day: 'Tue', present: 77, absent: 3 },
  { day: 'Wed', present: 75, absent: 5 },
  { day: 'Thu', present: 72, absent: 8 },
  { day: 'Fri', present: 74, absent: 6 },
]
