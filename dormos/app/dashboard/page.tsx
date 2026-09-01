import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { PROFILE_MENU, WORKSPACES } from '@/constants/dashboard'

export const metadata = {
  title: 'Dashboard — DormOS',
  description:
    'Get a live overview of revenue, occupancy, payments, maintenance and AI insights for your hostel.',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())
}

export default function DashboardPage() {
  return (
    <DashboardOverview
      greeting={getGreeting()}
      today={getToday()}
      hostelName={WORKSPACES[0].name}
      firstName={PROFILE_MENU.name.split(' ')[0]}
    />
  )
}
