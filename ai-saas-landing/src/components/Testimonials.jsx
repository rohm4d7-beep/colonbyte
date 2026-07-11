import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name:   'Sarah Chen',
    role:   'Head of Product, Stripe',
    avatar: 'SC',
    grad:   'from-blue-500 to-cyan-500',
    quote:  'NeuralAI reduced our content production time by 80%. Our team ships twice as fast without sacrificing quality. It has genuinely transformed how we work.',
  },
  {
    name:   'Marcus Rodriguez',
    role:   'CTO, Linear',
    avatar: 'MR',
    grad:   'from-purple-500 to-pink-500',
    quote:  'We evaluated six AI platforms before choosing NeuralAI. The reliability and output quality are in a different league. It has become mission-critical infrastructure for us.',
  },
  {
    name:   'Emily Park',
    role:   'AI Lead, Notion',
    avatar: 'EP',
    grad:   'from-emerald-500 to-teal-500',
    quote:  'The no-code workflow builder is incredible. I have automated pipelines that would have taken our dev team weeks to build. ROI was obvious within the first month.',
  },
  {
    name:   'James Liu',
    role:   'Founder, Runway',
    avatar: 'JL',
    grad:   'from-orange-500 to-red-500',
    quote:  'Customer support is exceptional. They helped us build a custom integration in two days. We went from 100 to 100k requests/day without a single hiccup.',
  },
  {
    name:   'Aisha Johnson',
    role:   'Director of Ops, Vercel',
    avatar: 'AJ',
    grad:   'from-primary-500 to-accent-500',
    quote:  "Security was our #1 concern. NeuralAI's SOC 2 certification and granular permissions gave our legal team full peace of mind. We were in production within a week.",
  },
  {
    name:   'Tom Williams',
    role:   'VP Engineering, GitHub',
    avatar: 'TW',
    grad:   'from-pink-500 to-rose-500',
    quote:  'I was skeptical — every AI tool overpromises. But NeuralAI actually delivers. The code generation quality is stellar and the context window handles our largest repos.',
  },
]

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

function TestimonialCard({ t, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <Stars />
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <span className="text-white text-xs font-bold">{t.avatar}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
        </div>
      </div>
    </motion.article>
  )
}

export default function Testimonials() {
  const hRef    = useRef(null)
  const hInView = useInView(hRef, { once: true })

  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={hRef}
          initial={{ opacity: 0, y: 30 }}
          animate={hInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-[0.15em]">Testimonials</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Loved by <span className="gradient-text">10,000+ teams</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Don&apos;t take our word for it. Here&apos;s what engineering leaders say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
