'use client'

import { motion } from 'framer-motion'
import { PRODUCT_FACTS } from '@/constants'

export function Facts() {
  return (
    <section className="border-y border-border bg-muted/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            What you get with DormOS
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
            {PRODUCT_FACTS.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-heading text-3xl font-semibold text-foreground">
                  {fact.value}
                </div>
                <div className="mt-1.5 text-sm text-muted-foreground max-w-[11rem] mx-auto leading-snug">
                  {fact.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
