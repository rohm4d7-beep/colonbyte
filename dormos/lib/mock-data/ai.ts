import {
  Wallet,
  BedDouble,
  FileText,
  TrendingUp,
  Wrench,
  CreditCard,
  UtensilsCrossed,
  LineChart,
} from 'lucide-react'
import type {
  AIConversation,
  AISuggestion,
  AIInsightCard,
  AIForecast,
} from '@/types/enterprise'
import { mulberry32, pick, dateBefore } from './rng'

const CONV_TITLES = [
  'Overdue payments summary',
  'Vacant rooms analysis',
  'July 2026 report generation',
  'Occupancy forecast for August',
  'Maintenance ticket triage',
  'Pending fee follow-ups',
  'Mess expense deep-dive',
  'Financial insights and cash flow',
  'Monthly revenue breakdown',
  'Block B occupancy review',
  'Kitchen stock optimization',
  'Staff attendance trends',
  'Visitor entry patterns',
  'Electricity usage analysis',
  'Early-bird discount impact',
  'Collection rate improvement',
  'Room revenue per category',
  'Billing cycle review',
]

const CONV_PREVIEWS = [
  'Here is a summary of the 5 overdue payments…',
  'There are currently 14 vacant beds across 9 rooms…',
  'I have prepared the July operational report…',
  'Based on the admissions pipeline, occupancy should hit 94%…',
  'I categorized 18 open tickets by priority and area…',
  'Five students have unpaid fees exceeding 15 days…',
  'Mess costs rose 7% this month, driven by vegetable prices…',
  'Profit margin improved to 38.6% this month…',
  'Room 2xx cohort is the highest revenue segment…',
  'Block B is operating at 88% occupancy…',
  'Switching to seasonal menus could save ~Rs 14,000 monthly…',
  'Weekday attendance dropped 6% in the last week…',
  'Peak visitor hours are between 6 PM and 9 PM…',
  'Electricity spend increased 11% compared to last month…',
]

const SUGGESTED_PROMPTS: AISuggestion[] = [
  { id: 'p1', label: 'Show overdue payments', prompt: 'Show overdue payments.', category: 'Finance', icon: Wallet },
  { id: 'p2', label: 'Which rooms are vacant?', prompt: 'Which rooms are vacant?', category: 'Operations', icon: BedDouble },
  { id: 'p3', label: 'Generate July report', prompt: 'Generate July report.', category: 'Reports', icon: FileText },
  { id: 'p4', label: "Predict next month's occupancy", prompt: "Predict next month's occupancy.", category: 'Operations', icon: TrendingUp },
  { id: 'p5', label: 'Summarize maintenance tickets', prompt: 'Summarize maintenance tickets.', category: 'Operations', icon: Wrench },
  { id: 'p6', label: 'Which students have pending fees?', prompt: 'Which students have pending fees?', category: 'Students', icon: CreditCard },
  { id: 'p7', label: 'Analyze mess expenses', prompt: 'Analyze mess expenses.', category: 'Mess', icon: UtensilsCrossed },
  { id: 'p8', label: 'Generate financial insights', prompt: 'Generate financial insights.', category: 'Finance', icon: LineChart },
]

export const AI_SUGGESTED_PROMPTS = SUGGESTED_PROMPTS

function buildConversations(): AIConversation[] {
  const rand = mulberry32(20260802)
  const list: AIConversation[] = []
  for (let i = 0; i < 200; i++) {
    const title = pick(rand, CONV_TITLES)
    const daysAgo = Math.floor(rand() * 90)
    list.push({
      id: `conv-${i + 1}`,
      title,
      preview: pick(rand, CONV_PREVIEWS),
      updated: dateBefore(daysAgo),
      pinned: i < 3,
      messages: 1 + Math.floor(rand() * 8),
    })
  }
  return list
}

export const AI_CONVERSATIONS: AIConversation[] = buildConversations()

export const AI_MESSAGES_BY_PROMPT: Record<string, { answer: string; sources: string[] }> = {
  'Show overdue payments.': {
    answer:
      "Here are the **5 overdue payments** at Sunrise Hostel, totaling **Rs 82,000**:\n\n| Student | Room | Amount | Days overdue |\n| --- | --- | --- | --- |\n| Bilal Hussain | 310 | Rs 16,000 | 21 |\n| Hassan Ali | 206 | Rs 14,200 | 18 |\n| Mahnoor Aslam | 114 | Rs 18,500 | 16 |\n| Fahad Iqbal | 112 | Rs 15,300 | 14 |\n| Ali Raza | 218 | Rs 18,000 | 12 |\n\n**Recommendation:** send a gentle automated reminder now, and escalate to the manager if fees exceed 21 days.\n\n```\nTotal overdue: Rs 82,000\nExpected recovery next week: ~Rs 49,500\n```",
    sources: ['Payments module', 'July collection report'],
  },
  'Which rooms are vacant?': {
    answer:
      "There are **9 vacant rooms** (14 beds) across the hostel:\n\n- **Block A** — Rooms 104, 118, 122 (4 beds)\n- **Block B** — Rooms 205, 207, 214 (5 beds)\n- **Block C** — Rooms 305, 310, 318 (5 beds)\n\n**Total potential revenue** if all 14 beds are filled at the average rate (Rs 8,500/month): **Rs 119,000/month**.\n\nWould you like me to draft a shortlist of rooms to promote to the incoming student pipeline?",
    sources: ['Rooms module', 'Admissions pipeline'],
  },
  'Generate July report.': {
    answer:
      "I've prepared the **July 2026 Operational Report** (12 pages, PDF ready). Key highlights:\n\n- **Revenue:** Rs 842,500 (+18.2% vs June)\n- **Expenses:** Rs 516,800 (+7.4%)\n- **Profit:** Rs 325,700 (+12.6%)\n- **Occupancy:** 92% (+2.1%)\n\n```markdown\n# July 2026 — Executive Summary\nRevenue up 18% driven by 12 new admissions.\nCollection rate improved to 96.4%.\n```\n\nThe full report is available in **Reports → Monthly Revenue**.",
    sources: ['Finance module', 'July report'],
  },
  "Predict next month's occupancy.": {
    answer:
      "Based on the current admissions pipeline, **projected occupancy for August is 94%** — the highest in 6 months.\n\n| Block | Current | Forecast | Delta |\n| --- | --- | --- | --- |\n| Block A | 90% | 96% | +6% |\n| Block B | 88% | 92% | +4% |\n| Block C | 95% | 97% | +2% |\n\n**Driver:** 12 confirmed admissions and 2 renewals. Only 9 beds in Block B remain open — consider a targeted discount for that block.",
    sources: ['Occupancy analytics', 'Admissions pipeline'],
  },
  'Summarize maintenance tickets.': {
    answer:
      "There are **18 open maintenance tickets**, categorized by priority:\n\n- 🔴 **Critical (3)** — AC unit Room 301, water leak Room 305, elevator fault\n- 🟡 **High (6)** — 2 plumbing, 3 electrical, 1 appliance\n- 🔵 **Medium (9)** — cosmetic repairs and painting\n\n**Average resolution time:** 2.4 days. **Recommended:** schedule the 3 critical items today to avoid damage escalation.",
    sources: ['Maintenance module'],
  },
  'Which students have pending fees?': {
    answer:
      "**12 students** currently have pending or overdue fees this cycle:\n\n| Student | Room | Status | Amount |\n| --- | --- | --- | --- |\n| Bilal Hussain | 310 | Overdue | Rs 16,000 |\n| Hassan Ali | 206 | Overdue | Rs 14,200 |\n| Fatima Noor | 304 | Pending | Rs 18,500 |\n| + 9 more | … | Pending | Rs 137,300 |\n\n**Total outstanding:** Rs 186,000 across 12 students. Reminders were already dispatched to the 5 most overdue.",
    sources: ['Students module', 'Payments module'],
  },
  'Analyze mess expenses.': {
    answer:
      "**Mess expenses rose 7% this month** to Rs 142,300, mainly driven by vegetable price increases in the last 3 weeks.\n\n| Category | This month | Change |\n| --- | --- | --- |\n| Groceries | Rs 74,500 | +9% |\n| Cooking oil | Rs 22,800 | +6% |\n| Meat & dairy | Rs 31,400 | +4% |\n| Utilities | Rs 13,600 | +2% |\n\n**Optimization:** switching to seasonal menus could save approximately **Rs 14,000/month** without reducing meal quality.",
    sources: ['Mess module', 'Expense categories'],
  },
  'Generate financial insights.': {
    answer:
      "Here are the key **financial insights** for Sunrise Hostel:\n\n- **Profit margin improved to 38.6%** — up 3.2 points from last month.\n- **Collection rate at 96.4%** — the best this year.\n- **Cost per bed:** Rs 8,120 vs revenue per bed Rs 13,200.\n- **Risk:** electricity spend is trending +11%; a usage audit could save ~Rs 6,000/month.\n\n```\nNet profit YTD: Rs 2,280,000\nProjected annual profit: Rs 3,900,000\n```",
    sources: ['Finance module', 'Electricity usage'],
  },
}

export const AI_FALLBACK_ANSWER =
  "I've analyzed the request against your hostel data. Here's what I found:\n\n- The current dataset covers **revenue, occupancy, fees, mess, maintenance, staff and visitors**.\n\n| Metric | Value |\n| --- | --- |\n| Monthly revenue | Rs 842,500 |\n| Occupancy | 92% |\n| Pending fees | Rs 186,000 |\n| Open tickets | 18 |\n\nI can prepare a detailed **PDF or CSV report** from the Reports center, or dig into any specific module. Would you like me to generate a report for this?"

export const AI_INSIGHTS_EXPANDED: AIInsightCard[] = [
  {
    id: 'ins1',
    headline: 'Revenue increased by 18%',
    detail: 'Driven by 12 new admissions and improved collection. The Room 2xx cohort leads revenue growth.',
    sentiment: 'positive',
    tag: 'Revenue',
    metric: 'Rs 842,500',
    delta: '+18.2%',
    series: [
      { label: 'Feb', value: 610 },
      { label: 'Mar', value: 640 },
      { label: 'Apr', value: 690 },
      { label: 'May', value: 715 },
      { label: 'Jun', value: 745 },
      { label: 'Jul', value: 842 },
    ],
  },
  {
    id: 'ins2',
    headline: 'Occupancy expected to reach 95%',
    detail: 'Projected August occupancy is 95% — highest in 6 months. 9 beds in Block B remain open.',
    sentiment: 'positive',
    tag: 'Occupancy',
    metric: '95%',
    delta: '+3 pts',
    series: [
      { label: 'Mar', value: 84 },
      { label: 'Apr', value: 86 },
      { label: 'May', value: 88 },
      { label: 'Jun', value: 90 },
      { label: 'Jul', value: 92 },
      { label: 'Aug', value: 95 },
    ],
  },
  {
    id: 'ins3',
    headline: 'Mess expenses increased 8%',
    detail: 'Vegetable prices drove the rise. Seasonal menus could save ~Rs 14,000 monthly.',
    sentiment: 'negative',
    tag: 'Mess',
    metric: 'Rs 142,300',
    delta: '+8%',
    series: [
      { label: 'Mar', value: 118 },
      { label: 'Apr', value: 122 },
      { label: 'May', value: 126 },
      { label: 'Jun', value: 131 },
      { label: 'Jul', value: 142 },
    ],
  },
  {
    id: 'ins4',
    headline: 'Five students are overdue',
    detail: 'Five students have unpaid fees exceeding 15 days, totaling Rs 82,000.',
    sentiment: 'negative',
    tag: 'Finance',
    metric: 'Rs 82,000',
    delta: '+5 cases',
    series: [
      { label: 'Mar', value: 2 },
      { label: 'Apr', value: 3 },
      { label: 'May', value: 4 },
      { label: 'Jun', value: 4 },
      { label: 'Jul', value: 5 },
    ],
  },
  {
    id: 'ins5',
    headline: 'Three rooms require maintenance',
    detail: 'AC unit, water leak and elevator faults are pending — all critical priority.',
    sentiment: 'neutral',
    tag: 'Maintenance',
    metric: '3 critical',
    delta: '−2',
    series: [
      { label: 'Mar', value: 8 },
      { label: 'Apr', value: 6 },
      { label: 'May', value: 7 },
      { label: 'Jun', value: 5 },
      { label: 'Jul', value: 3 },
    ],
  },
  {
    id: 'ins6',
    headline: 'Electricity usage increased',
    detail: 'Electricity spend is up 11% this month. A usage audit could save ~Rs 6,000 monthly.',
    sentiment: 'negative',
    tag: 'Utilities',
    metric: '+11%',
    delta: 'Rs 68,000',
    series: [
      { label: 'Mar', value: 52 },
      { label: 'Apr', value: 55 },
      { label: 'May', value: 58 },
      { label: 'Jun', value: 61 },
      { label: 'Jul', value: 68 },
    ],
  },
  {
    id: 'ins7',
    headline: 'Staff attendance dropped this week',
    detail: 'Weekday attendance fell 6%. Two housekeeping shifts were understaffed on Thursday.',
    sentiment: 'negative',
    tag: 'Staff',
    metric: '94%',
    delta: '−6 pts',
    series: [
      { label: 'Mon', value: 98 },
      { label: 'Tue', value: 97 },
      { label: 'Wed', value: 96 },
      { label: 'Thu', value: 91 },
      { label: 'Fri', value: 94 },
    ],
  },
  {
    id: 'ins8',
    headline: 'Collection rate hit a yearly high',
    detail: 'Fee collection reached 96.4% — the strongest month of the year for on-time payments.',
    sentiment: 'positive',
    tag: 'Finance',
    metric: '96.4%',
    delta: '+2.1 pts',
    series: [
      { label: 'Mar', value: 88 },
      { label: 'Apr', value: 90 },
      { label: 'May', value: 91 },
      { label: 'Jun', value: 93 },
      { label: 'Jul', value: 96 },
    ],
  },
]

export const AI_FORECASTS: AIForecast[] = [
  {
    id: 'fc-rev',
    title: 'Revenue Forecast',
    description: 'Next 6 months based on current pipeline',
    value: 'Rs 5.2M',
    delta: '+18%',
    positive: true,
    color: 'var(--color-chart-1)',
    series: [
      { label: 'Aug', value: 890 },
      { label: 'Sep', value: 860 },
      { label: 'Oct', value: 920 },
      { label: 'Nov', value: 840 },
      { label: 'Dec', value: 960 },
      { label: 'Jan', value: 940 },
    ],
  },
  {
    id: 'fc-occ',
    title: 'Occupancy Prediction',
    description: 'Projected bed utilization rate',
    value: '94%',
    delta: '+2 pts',
    positive: true,
    color: 'var(--color-chart-2)',
    series: [
      { label: 'Aug', value: 94 },
      { label: 'Sep', value: 91 },
      { label: 'Oct', value: 93 },
      { label: 'Nov', value: 90 },
      { label: 'Dec', value: 95 },
      { label: 'Jan', value: 93 },
    ],
  },
  {
    id: 'fc-exp',
    title: 'Expense Forecast',
    description: 'Projected monthly operating cost',
    value: 'Rs 3.2M',
    delta: '+7%',
    positive: false,
    color: 'var(--color-chart-3)',
    series: [
      { label: 'Aug', value: 530 },
      { label: 'Sep', value: 520 },
      { label: 'Oct', value: 545 },
      { label: 'Nov', value: 535 },
      { label: 'Dec', value: 560 },
      { label: 'Jan', value: 550 },
    ],
  },
]

export const AI_WIDGETS = {
  latestReports: [
    { id: 'wr1', title: 'July Revenue Report', meta: 'Generated 2h ago', tag: 'Finance' },
    { id: 'wr2', title: 'Occupancy Analysis Q3', meta: 'Generated yesterday', tag: 'Occupancy' },
    { id: 'wr3', title: 'Mess Cost Breakdown', meta: 'Generated 2 days ago', tag: 'Mess' },
  ],
  smartSuggestions: [
    { id: 'ws1', title: 'Promote 9 open beds in Block B', detail: 'Targeted discount could add ~Rs 76,500/month.' },
    { id: 'ws2', title: 'Switch to seasonal mess menu', detail: 'Projected saving of Rs 14,000/month.' },
    { id: 'ws3', title: 'Schedule AC maintenance before peak', detail: 'Prevents critical failures in August heat.' },
  ],
  riskAlerts: [
    { id: 'wr1', title: 'Overdue fees growing', severity: 'danger' as const, detail: 'Rs 82,000 across 5 students (>15 days).' },
    { id: 'wr2', title: 'Electricity spend trending up', severity: 'warning' as const, detail: '+11% month-over-month.' },
    { id: 'wr3', title: 'Staff attendance dip', severity: 'warning' as const, detail: 'Weekday attendance fell 6%.' },
  ],
  optimizationTips: [
    { id: 'wo1', title: 'Consolidate grocery orders', detail: 'Bulk orders from a single supplier save ~5%.' },
    { id: 'wo2', title: 'Shift water heating to off-peak', detail: 'Cut electricity cost by up to Rs 4,000/month.' },
    { id: 'wo3', title: 'Auto-schedule payment reminders', detail: 'Improve collection rate above 96%.' },
  ],
}
