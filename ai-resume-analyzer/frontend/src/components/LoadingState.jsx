import { motion } from 'framer-motion'
import { FileText, Cpu, BarChart3 } from 'lucide-react'

const STEPS = [
  { icon: FileText,  label: 'Reading PDF',          delay: 0    },
  { icon: Cpu,       label: 'Extracting content',   delay: 1.5  },
  { icon: BarChart3, label: 'Running AI analysis',  delay: 3.5  },
]

function Spinner() {
  return (
    <div className="relative w-16 h-16 mx-auto mb-8">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#22222e" strokeWidth="4" />
        <motion.circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke="url(#spinGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="175.9"
          animate={{ strokeDashoffset: [175.9, 0, 175.9] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function LoadingState({ filename }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Spinner />

      <h2 className="text-2xl font-bold text-white mb-2">Analysing your resume</h2>
      {filename && (
        <p className="text-gray-500 text-sm mb-8 truncate max-w-xs">{filename}</p>
      )}

      <div className="space-y-3 text-left w-full max-w-xs">
        {STEPS.map(({ icon: Icon, label, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ background: '#22222e' }}
              animate={{ background: ['#22222e', '#312e81', '#22222e'] }}
              transition={{ delay, duration: 1.5, repeat: Infinity }}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <Icon className="w-4 h-4 text-indigo-400" />
            </motion.div>
            <span className="text-sm text-gray-400">{label}</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: delay + 0.3, duration: 1.2 }}
              className="h-px bg-gradient-to-r from-indigo-500/50 to-transparent flex-1"
            />
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-600 mt-10">This typically takes 15–30 seconds</p>
    </div>
  )
}
