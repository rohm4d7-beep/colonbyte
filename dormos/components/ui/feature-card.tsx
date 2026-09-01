'use client'

import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group bg-card rounded-2xl border border-border shadow-sm p-6',
        'hover:border-primary/30 hover:shadow-md transition-all duration-200',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent group-hover:bg-primary/15 transition-colors duration-200 mb-4">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}
