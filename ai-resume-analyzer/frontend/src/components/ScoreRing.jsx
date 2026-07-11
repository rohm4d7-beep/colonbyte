import { useEffect, useState } from 'react'

function scoreColor(score) {
  if (score >= 80) return { stroke: 'url(#grad-green)', text: 'text-emerald-400' }
  if (score >= 60) return { stroke: 'url(#grad-blue)',  text: 'text-indigo-400'  }
  if (score >= 40) return { stroke: 'url(#grad-amber)', text: 'text-amber-400'   }
  return               { stroke: 'url(#grad-red)',   text: 'text-red-400'    }
}

export default function ScoreRing({ score, size = 130, strokeWidth = 10, label }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(score), 120)
    return () => clearTimeout(t)
  }, [score])

  const r      = (size - strokeWidth) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (displayed / 100) * circ
  const cx = size / 2
  const { stroke, text } = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Defs shared across all rings on the page */}
          <defs>
            <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#22222e" strokeWidth={strokeWidth} />
          {/* Progress */}
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        {/* Score label in centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={`text-3xl font-extrabold leading-none ${text}`}>{score}</span>
          <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      {label && <p className="text-xs text-gray-400 font-medium">{label}</p>}
    </div>
  )
}
