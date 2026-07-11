import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

const COMPANIES = ['Google', 'Microsoft', 'Stripe', 'Notion', 'Vercel', 'Linear']

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
})

function MockUI() {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-gray-200/60 dark:shadow-black/40 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-emerald-400" />
        <div className="flex-1 mx-4">
          <div className="h-5 rounded-md bg-gray-200 dark:bg-gray-800 w-52 mx-auto" />
        </div>
      </div>

      {/* Content mockup */}
      <div className="p-6 sm:p-8 grid grid-cols-3 gap-6 min-h-60">
        {/* Sidebar */}
        <div className="col-span-1 space-y-3">
          {[75, 55, 90, 45, 65].map((w, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-400 to-accent-400 flex-shrink-0" />
              <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="col-span-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-5 space-y-4">
          <div className="h-3.5 rounded-full bg-gradient-to-r from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800 w-2/3" />
          <div className="space-y-2">
            {[100, 88, 94, 72, 60].map((w, i) => (
              <div key={i} className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="pt-3 flex gap-3 items-center">
            <div className="h-8 rounded-lg bg-gradient-to-r from-primary-400 to-accent-400 w-24" />
            <div className="h-8 rounded-lg border border-gray-200 dark:border-gray-600 w-20" />
            <div className="ml-auto w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-accent-300 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 sm:bottom-6 sm:right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">Output ready</p>
          <p className="text-xs text-gray-400">Generated in 0.4s</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient blobs */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary-400/15 dark:bg-primary-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-400/15 dark:bg-accent-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Grid overlay */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800/60 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Introducing NeuralAI 2.0
          <ArrowRight className="w-3 h-3" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp(0.1)}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
        >
          Build smarter with
          <br />
          <span className="gradient-text">AI that just works</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp(0.2)}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10"
        >
          NeuralAI gives your team superpowers — automate workflows, generate content,
          analyse data, and ship faster. No PhD required.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <Play className="w-5 h-5 text-primary-500 fill-primary-500" />
            Watch demo
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp(0.4)}
          initial="hidden"
          animate="visible"
        >
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {COMPANIES.map((c) => (
              <span key={c} className="text-gray-400 dark:text-gray-600 font-bold text-sm tracking-wider uppercase hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                {c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* App mockup */}
        <motion.div
          variants={fadeUp(0.5)}
          initial="hidden"
          animate="visible"
          className="mt-20 relative max-w-4xl mx-auto"
        >
          <MockUI />
          {/* Glow ring */}
          <div aria-hidden className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary-400/20 via-accent-400/20 to-primary-400/20 blur-3xl rounded-3xl" />
        </motion.div>
      </div>
    </section>
  )
}
