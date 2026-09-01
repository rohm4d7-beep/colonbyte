import { EmployeeProfilePage } from '@/components/staff/employee-profile'

export const metadata = {
  title: 'Employee Profile — DormOS',
}

export default async function EmployeeProfileRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EmployeeProfilePage employeeId={id} />
}
