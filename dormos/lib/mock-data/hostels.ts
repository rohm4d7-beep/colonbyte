import type { Hostel, SubscriptionPlan, UsageStat, HostelMember } from '@/types/enterprise'

export const HOSTELS: Hostel[] = [
  { id: 'sunrise', name: 'Sunrise Hostel', location: 'Gulberg, Lahore', initials: 'SH', color: 'bg-blue-600', tagline: '200 beds · Men', beds: 200, students: 184, occupancy: 92, plan: 'Enterprise', status: 'Active' },
  { id: 'city', name: 'City Hostel', location: 'Bahadurabad, Karachi', initials: 'CH', color: 'bg-emerald-600', tagline: '120 beds · Co-ed', beds: 120, students: 96, occupancy: 80, plan: 'Professional', status: 'Active' },
  { id: 'bluesky', name: 'BlueSky Residency', location: 'F-7, Islamabad', initials: 'BR', color: 'bg-violet-600', tagline: '80 beds · Women', beds: 80, students: 74, occupancy: 93, plan: 'Professional', status: 'Active' },
  { id: 'ivory', name: 'Ivory Tower Hostel', location: 'DHA Phase 4, Lahore', initials: 'IT', color: 'bg-amber-600', tagline: '60 beds · Men', beds: 60, students: 38, occupancy: 63, plan: 'Starter', status: 'Trial' },
  { id: 'oakwood', name: 'Oakwood Suites', location: 'Gulshan-e-Iqbal, Karachi', initials: 'OS', color: 'bg-cyan-600', tagline: '90 beds · Co-ed', beds: 90, students: 0, occupancy: 0, plan: 'Starter', status: 'Suspended' },
]

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2500,
    period: 'per hostel / month',
    features: ['1 hostel', 'Up to 100 students', '5 GB storage', '10 monthly reports', '50 AI credits', '5 active users'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 6500,
    period: 'per hostel / month',
    features: ['3 hostels', 'Up to 500 students', '50 GB storage', 'Unlimited monthly reports', '500 AI credits', '25 active users', 'Custom reports & exports'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 14900,
    period: 'per hostel / month',
    features: ['Unlimited hostels', 'Unlimited students', '500 GB storage', 'Unlimited monthly reports', 'Unlimited AI credits', 'Unlimited users', 'SSO & audit logs', 'Priority support'],
  },
]

export const USAGE_STATS: UsageStat[] = [
  { id: 'u1', label: 'Students used', used: 184, limit: 500, unit: 'students', accent: 'bg-blue-500' },
  { id: 'u2', label: 'Storage', used: 34, limit: 50, unit: 'GB', accent: 'bg-emerald-500' },
  { id: 'u3', label: 'Monthly reports', used: 12, limit: 12, unit: 'reports', accent: 'bg-violet-500' },
  { id: 'u4', label: 'AI credits', used: 342, limit: 500, unit: 'credits', accent: 'bg-amber-500' },
  { id: 'u5', label: 'Active users', used: 8, limit: 25, unit: 'users', accent: 'bg-cyan-500' },
]

export const HOSTEL_MEMBERS: HostelMember[] = [
  { id: 'hm1', name: 'Rohaab', email: 'rohaab@sunrisehostel.pk', role: 'Owner', status: 'Active', initials: 'R', color: 'bg-blue-600' },
  { id: 'hm2', name: 'Asif Raza', email: 'asif@sunrisehostel.pk', role: 'Manager', status: 'Active', initials: 'AR', color: 'bg-emerald-600' },
  { id: 'hm3', name: 'Saima Akhtar', email: 'saima@sunrisehostel.pk', role: 'Accountant', status: 'Active', initials: 'SA', color: 'bg-violet-600' },
  { id: 'hm4', name: 'Usman Malik', email: 'usman@sunrisehostel.pk', role: 'Receptionist', status: 'Active', initials: 'UM', color: 'bg-amber-600' },
  { id: 'hm5', name: 'Imran Qureshi', email: 'imran@sunrisehostel.pk', role: 'Kitchen Staff', status: 'Active', initials: 'IQ', color: 'bg-cyan-600' },
  { id: 'hm6', name: 'Zara Sheikh', email: 'zara@sunrisehostel.pk', role: 'System Admin', status: 'Invited', initials: 'ZS', color: 'bg-rose-600' },
]

export const HOSTEL_BILLING = {
  currentPlan: 'Enterprise',
  nextBilling: 'Sep 01, 2026',
  monthlyAmount: 14900,
  paymentMethod: 'Bank transfer',
  invoices: [
    { id: 'INV-ENT-042', period: 'August 2026', amount: 14900, status: 'Paid' },
    { id: 'INV-ENT-041', period: 'July 2026', amount: 14900, status: 'Paid' },
    { id: 'INV-ENT-040', period: 'June 2026', amount: 14900, status: 'Paid' },
  ],
}
