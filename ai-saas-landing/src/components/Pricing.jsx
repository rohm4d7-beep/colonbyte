import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Minus } from 'lucide-react'

const PLANS = [
  {
    name:        'Starter',
    monthly:     0,
    annually:    0,
    description: 'Perfect for individuals and side projects.',
    cta:         'Get started free',
    ctaClass:    'border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
    features: [
      { text: '1,000 AI requests / month',  yes: true  },
      { text: '2 active workflows',          yes: true  },
      { text: 'Basic analytics',             yes: true  },
      { text: 'Community support',           yes: true  },
      { text: 'Custom model fine-tuning',    yes: false },
      { text: 'SSO & audit logs',            yes: false },
    ],
  },
  {
    name:        'Pro',
    monthly:     49,
    annually:    39,
    description: 'For growing teams that need more power.',
    cta:         'Start 14-day trial',
    ctaClass:    'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 shadow-lg shadow-primary-500/30',
    popular:     true,
    features: [
      { text: '50,000 AI requests / month', yes: true  },
      { text: 'Unlimited workflows',         yes: true  },
      { text: 'Advanced analytics',          yes: true  },
      { text: 'Priority support',            yes: true  },
      { text: 'Custom model fine-tuning',    yes: true  },
      { text: 'SSO & audit logs',            yes: false },
    ],
  },
  {
    name:        'Enterprise',
    monthly:     199,
    annually:    159,
    description: 'For large organisations with custom needs.',
    cta:         'Contact sales',
    ctaClass:    'border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
    features: [
      { text: 'Unlimited AI requests',      yes: true },
      { text: 'Unlimited workflows',         yes: true },
      { text: 'Custom analytics dashboards', yes: true },
      { text: 'Dedicated success manager',   yes: true },
      { text: 'Custom model fine-tuning',    yes: true },
      { text: 'SSO & audit logs',            yes: true },
    ],
  },
]

function PlanCard({ plan, annual, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const price  = annual ? plan.annually : plan.monthly
  const saving = (plan.monthly - plan.annually) * 12

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
        plan.popular
          ? 'border-primary-400 dark:border-primary-600 bg-gradient-to-b from-primary-50/80 to-white dark:from-primary-950/30 dark:to-gray-900 shadow-xl shadow-primary-500/10 scale-[1.02]'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 inset-x-0 flex justify-center">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1.5">
          <span className="text-5xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            ${price}
          </span>
          {plan.monthly > 0 && (
            <span className="text-gray-400 dark:text-gray-500 mb-1.5 text-sm">/month</span>
          )}
        </div>
        {annual && plan.monthly > 0 && (
          <p className="text-xs text-emerald-500 mt-1.5 font-medium">Save ${saving}/year vs monthly</p>
        )}
        {!annual && plan.monthly === 0 && (
          <p className="text-xs text-gray-400 mt-1.5">Free forever</p>
        )}
      </div>

      <a
        href="#"
        className={`block text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 mb-8 ${plan.ctaClass}`}
      >
        {plan.cta}
      </a>

      <ul className="space-y-3 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-center gap-3">
            {f.yes ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Minus className="w-3 h-3 text-gray-400" strokeWidth={2.5} />
              </span>
            )}
            <span className={`text-sm ${f.yes ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true)
  const hRef    = useRef(null)
  const hInView = useInView(hRef, { once: true })

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-gray-50/60 dark:bg-gray-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={hRef}
          initial={{ opacity: 0, y: 30 }}
          animate={hInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-[0.15em]">Pricing</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Start free. Scale when you're ready. No hidden fees, ever.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            {[
              { label: 'Monthly',  value: false },
              { label: 'Annually', value: true  },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setAnnual(value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  annual === value
                    ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {label}
                {value && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} index={i} />
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-10">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  )
}
