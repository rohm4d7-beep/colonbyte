import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { EmptyState } from '@/components/widgets/empty-state'
import { NotifyButton } from '@/components/placeholder/notify-button'
import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  icon: LucideIcon
  description: string
  comingSoonLabel?: string
}

export function PlaceholderPage({
  title,
  icon: Icon,
  description,
  comingSoonLabel = 'This module is under active development',
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          </div>
          <NotifyButton />
        </div>
      </header>

      <div className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm">
        <EmptyState
          icon={<Icon className="h-5 w-5 text-primary" />}
          title={`${title} is coming soon`}
          description={`${comingSoonLabel}. The complete ${title.toLowerCase()} experience will live here — built with the same design system and premium feel as the rest of DormOS.`}
        />
      </div>
    </div>
  )
}
