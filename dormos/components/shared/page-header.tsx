import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Crumb = {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  crumbs?: Crumb[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  crumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  const breadcrumbs =
    crumbs.length > 0
      ? [
          { label: 'Dashboard', href: '/dashboard' },
          ...crumbs,
        ]
      : [{ label: 'Dashboard', href: '/dashboard' }]

  return (
    <header className={cn('flex flex-col gap-3', className)}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1
            return (
              <BreadcrumbItem key={`${crumb.label}-${index}`}>
                {last ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={crumb.href ?? '#'}>
                      {crumb.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap items-center gap-4">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
