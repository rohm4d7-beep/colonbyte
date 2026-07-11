import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Docs',         href: '#' },
]

export default function Navbar() {
  const { isDark, setIsDark } = useTheme()
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 dark:border-gray-800/60'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">NeuralAI</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle colour scheme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a href="#" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2">
            Sign in
          </a>
          <a
            href="#"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary-500/25"
          >
            Get started
          </a>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle colour scheme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 mt-1">
                <a href="#" className="text-sm font-medium text-center text-gray-600 dark:text-gray-400 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  Sign in
                </a>
                <a href="#" className="text-sm font-semibold text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                  Get started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
