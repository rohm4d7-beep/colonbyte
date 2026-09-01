'use client'

import { motion } from 'framer-motion'
import { FeatureCard } from '@/components/ui/feature-card'
import { SectionHeader } from '@/components/ui/section-header'
import { FEATURES } from '@/constants'

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader
            eyebrow="Everything you need"
            title="Every module your hostel requires, beautifully unified."
            subtitle="From student check-in to month-end reports — DormOS covers the entire operation so nothing falls through the cracks."
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={item}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
