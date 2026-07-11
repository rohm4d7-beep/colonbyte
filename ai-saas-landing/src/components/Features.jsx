import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Zap, Shield, BarChart3, Workflow, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon:  Brain,
    title: 'AI-Powered Insights',
    desc:  'Leverage cutting-edge LLMs to extract meaningful insights from your data in seconds, not hours.',
    grad:  'from-blue-500 to-cyan-500',
    glow:  'shadow-blue-500/20',
  },
  {
    icon:  Zap,
    title: 'Lightning Fast',
    desc:  'Built on optimised infrastructure delivering sub-second response times at any scale.',
    grad:  'from-amber-500 to-orange-500',
    glow:  'shadow-amber-500/20',
  },
  {
    icon:  Shield,
    title: 'Enterprise Security',
    desc:  'SOC 2 Type II certified with end-to-end encryption, SSO, and granular audit logs built-in.',
    grad:  'from-emerald-500 to-teal-500',
    glow:  'shadow-emerald-500/20',
  },
  {
    icon:  BarChart3,
    title: 'Advanced Analytics',
    desc:  'Real-time dashboards that give you a 360° view of AI usage, costs, and performance.',
    grad:  'from-purple-500 to-pink-500',
    glow:  'shadow-purple-500/20',
  },
  {
    icon:  Workflow,
    title: 'No-Code Workflows',
    desc:  'Drag-and-drop builder to automate complex processes without writing a single line of code.',
    grad:  'from-primary-500 to-accent-500',
    glow:  'shadow-primary-500/20',
  },
  {
    icon:  Globe,
    title: 'Global Scale',
    desc:  'Deploy across 30+ regions with automatic load balancing and a 99.99% uptime SLA.',
    grad:  'from-rose-500 to-red-500',
    glow:  'shadow-rose-500/20',
  },
]

function FeatureCard({ feature, index }) {
  const ref      = useRef(null)
  const inView   = useInView(ref, { once: true, margin: '-60px' })
  const Icon     = feature.icon

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.grad} shadow-lg ${feature.glow} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
    </motion.article>
  )
}

export default function Features() {
  const hRef   = useRef(null)
  const hInView = useInView(hRef, { once: true })

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={hRef}
          initial={{ opacity: 0, y: 30 }}
          animate={hInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-[0.15em]">Features</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Everything you need to{' '}
            <span className="gradient-text">move faster</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            A complete suite of AI tools engineered for teams that ship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
