import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, Twitter, Github, Linkedin, ArrowRight } from 'lucide-react'

const LINKS = {
  Product:    ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Documentation'],
  Company:    ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Developers: ['API Reference', 'SDKs', 'Webhooks', 'Status', 'Community'],
  Legal:      ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
}

const SOCIALS = [
  { Icon: Twitter,  label: 'Twitter' },
  { Icon: Github,   label: 'GitHub' },
  { Icon: Linkedin, label: 'LinkedIn' },
]

export default function Footer() {
  const ctaRef    = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true })

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CTA banner */}
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="py-20 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to <span className="gradient-text">supercharge your team?</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of teams already using NeuralAI to build better products, faster.
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-base hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-500/30"
          >
            Start for free — no credit card required
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Main links grid */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <a href="#" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg">NeuralAI</span>
              </a>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                AI infrastructure for the modern web.
              </p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([cat, links]) => (
              <div key={cat}>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 tracking-wide">{cat}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} NeuralAI, Inc. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  )
}
