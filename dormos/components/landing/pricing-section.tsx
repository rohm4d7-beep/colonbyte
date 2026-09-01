'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { PricingCard } from '@/components/pricing/pricing-card'
import { PRICING_PLANS } from '@/constants'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            eyebrow="Simple pricing"
            title="Pick the plan that fits your hostel."
            subtitle="All plans include a 14-day free trial. No credit card required."
          />
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <span className={cn('text-sm font-medium', !annual ? 'text-foreground' : 'text-muted-foreground')}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
              annual ? 'bg-primary' : 'bg-border',
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-[#ffffff] shadow transition-transform duration-200',
                annual ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
          <span className={cn('text-sm font-medium', annual ? 'text-foreground' : 'text-muted-foreground')}>
            Annual
            <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Save 20%
            </span>
          </span>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} annual={annual} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          All prices in PKR. Sales tax may apply. Need a custom plan?{' '}
          <a href="#contact" className="text-primary hover:underline font-medium">
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  )
}
