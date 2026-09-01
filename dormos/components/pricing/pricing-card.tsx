'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { PricingPlan } from '@/types'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  plan: PricingPlan
  annual?: boolean
  index?: number
}

export function PricingCard({ plan, annual = false, index = 0 }: PricingCardProps) {
  const displayPrice = annual && plan.annualPrice ? plan.annualPrice : plan.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'relative flex flex-col rounded-2xl p-8',
        plan.highlighted
          ? 'bg-primary text-primary-foreground shadow-2xl ring-2 ring-primary scale-[1.02]'
          : 'bg-card border border-border shadow-sm',
      )}
    >
      {plan.badge && (
        <span
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            plan.highlighted
              ? 'bg-card text-primary'
              : 'bg-primary text-primary-foreground',
          )}
        >
          {plan.badge}
        </span>
      )}

      <div className="mb-6">
        <h3
          className={cn(
            'text-lg font-bold mb-1',
            plan.highlighted ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            'text-sm',
            plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-end gap-1">
          <span
            className={cn(
              'text-4xl font-extrabold tracking-tight',
              plan.highlighted ? 'text-primary-foreground' : 'text-foreground',
            )}
          >
            {displayPrice}
          </span>
          {plan.period && (
            <span
              className={cn(
                'text-sm mb-1.5',
                plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {plan.period}
            </span>
          )}
        </div>
        {annual && plan.annualPrice && (
          <p
            className={cn(
              'text-xs mt-1',
              plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground',
            )}
          >
            Billed annually · Save 20%
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div
              className={cn(
                'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
                plan.highlighted ? 'bg-primary-foreground/20' : 'bg-accent',
              )}
            >
              <Check
                className={cn(
                  'h-2.5 w-2.5 stroke-[3]',
                  plan.highlighted ? 'text-primary-foreground' : 'text-primary',
                )}
              />
            </div>
            <span
              className={cn(
                'text-sm',
                plan.highlighted ? 'text-primary-foreground/90' : 'text-muted-foreground',
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.name === 'Enterprise' ? '#contact' : '/signup'}
        className={cn(
          buttonVariants({
            variant: plan.highlighted ? 'secondary' : plan.name === 'Enterprise' ? 'outline' : 'default',
          }),
          'w-full h-11 text-sm font-semibold justify-center',
          plan.highlighted ? 'bg-card text-primary hover:bg-card/90' : '',
        )}
      >
        {plan.cta}
      </Link>
    </motion.div>
  )
}
