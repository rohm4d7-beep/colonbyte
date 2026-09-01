'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Tag } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CTASection() {
  return (
    <section id="contact" className="py-24 bg-[#152A1D]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <span className="inline-flex items-center rounded-full border border-[#ffffff]/15 bg-[#ffffff]/5 px-3 py-1 text-xs font-semibold text-[#ffffff]/80 mb-6">
              Get started today
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-[#ffffff] leading-tight">
              Ready to modernize
              <br />
              your hostel?
            </h2>
            <p className="mt-5 text-lg text-[#ffffff]/60 max-w-xl mx-auto leading-relaxed">
              Set up finance, students, rooms, mess, and maintenance in one place — and let AI
              handle the busywork.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'gap-2 h-12 px-7 text-base bg-[#ffffff] text-[#152A1D] hover:bg-[#ffffff]/90',
              )}
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'gap-2 h-12 px-7 text-base border-[#ffffff]/20 text-[#ffffff] hover:bg-[#ffffff]/10 hover:text-[#ffffff] bg-transparent',
              )}
            >
              <Tag className="h-4 w-4" />
              View Pricing
            </Link>
          </div>

          <p className="text-sm text-[#ffffff]/45">No credit card required to start</p>
        </motion.div>
      </div>
    </section>
  )
}
