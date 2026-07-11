import { motion } from 'framer-motion'
import {
  RotateCcw, FileText, CheckCircle2, AlertTriangle,
  Zap, Tags, Target, Award, TrendingUp,
} from 'lucide-react'
import ScoreRing from './ScoreRing'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const stagger = {
  container: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
  item:      { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
}

function Section({ icon: Icon, title, children, className = '' }) {
  return (
    <motion.div variants={stagger.item} className={`card p-6 ${className}`}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLE = {
  high:   'bg-red-500/15 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

function PriorityBadge({ priority }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[priority] || PRIORITY_STYLE.low}`}>
      {priority}
    </span>
  )
}

// ─── Skill chip ───────────────────────────────────────────────────────────────

function Chip({ label, color = 'indigo' }) {
  const styles = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    sky:    'bg-sky-500/10 text-sky-300 border-sky-500/20',
    emerald:'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    red:    'bg-red-500/10 text-red-300 border-red-500/20',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg border ${styles[color]}`}>
      {label}
    </span>
  )
}

// ─── Section score bar ────────────────────────────────────────────────────────

function ScoreBar({ label, score }) {
  const color =
    score >= 80 ? 'from-emerald-500 to-emerald-400' :
    score >= 60 ? 'from-indigo-500 to-violet-500'   :
    score >= 40 ? 'from-amber-500  to-amber-400'    :
                  'from-red-500    to-red-400'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-[#22222e] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}

// ─── Experience level badge ───────────────────────────────────────────────────

const LEVEL_STYLE = {
  entry:     'bg-sky-500/15 text-sky-400 border-sky-500/30',
  mid:       'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  senior:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  executive: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalysisResults({ result, filename, onReset }) {
  const r          = result
  const sectionMap = {
    'Contact Info':          r.section_scores?.contact_info          ?? 0,
    'Professional Summary':  r.section_scores?.professional_summary  ?? 0,
    'Work Experience':       r.section_scores?.work_experience        ?? 0,
    'Education':             r.section_scores?.education              ?? 0,
    'Skills':                r.section_scores?.skills                 ?? 0,
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top bar */}
      <motion.div variants={stagger.item} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-400 truncate max-w-xs">{filename}</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#22222e] text-gray-400 hover:text-white hover:border-indigo-500/50 text-sm font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Analyse another
        </button>
      </motion.div>

      {/* ROW 1: Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall score */}
        <motion.div variants={stagger.item} className="card p-6 flex flex-col items-center justify-center gap-3 sm:col-span-1">
          <ScoreRing score={r.overall_score} size={140} label="Overall Score" />
        </motion.div>

        {/* ATS score */}
        <motion.div variants={stagger.item} className="card p-6 flex flex-col items-center justify-center gap-3">
          <ScoreRing score={r.ats_score} size={110} strokeWidth={9} label="ATS Score" />
          <p className="text-xs text-center text-gray-500 leading-relaxed">
            Likelihood of passing automated<br />applicant tracking systems
          </p>
        </motion.div>

        {/* Experience + summary */}
        <motion.div variants={stagger.item} className="card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</span>
          </div>
          <span className={`self-start text-sm font-bold px-3 py-1.5 rounded-xl border capitalize ${LEVEL_STYLE[r.experience_level] || LEVEL_STYLE.mid}`}>
            {r.experience_level} Level
          </span>

          <div className="border-t border-[#22222e] pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AI Summary</p>
            <p className="text-sm text-gray-300 leading-relaxed">{r.summary}</p>
          </div>
        </motion.div>
      </div>

      {/* ROW 2: Strengths + Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={CheckCircle2} title="Strengths">
          <ul className="space-y-3">
            {(r.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={TrendingUp} title="Top Improvements">
          <ul className="space-y-4">
            {(r.improvements || []).slice(0, 3).map((imp, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{imp.title}</span>
                  <PriorityBadge priority={imp.priority} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{imp.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* ROW 3: Section scores */}
      <Section icon={Target} title="Section Scores">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
          {Object.entries(sectionMap).map(([label, score]) => (
            <ScoreBar key={label} label={label} score={score} />
          ))}
        </div>
      </Section>

      {/* ROW 4: Skills */}
      <Section icon={Zap} title="Skills Detected">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Technical',  items: r.skills?.technical || [], color: 'indigo' },
            { label: 'Soft Skills',items: r.skills?.soft      || [], color: 'violet' },
            { label: 'Tools',      items: r.skills?.tools     || [], color: 'sky'    },
          ].map(({ label, items, color }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</p>
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {items.map(s => <Chip key={s} label={s} color={color} />)}
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">None detected</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ROW 5: Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section icon={Tags} title="Keywords Found">
          {(r.keywords_found || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {r.keywords_found.map(k => <Chip key={k} label={k} color="emerald" />)}
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic">No notable keywords found</p>
          )}
        </Section>

        <Section icon={AlertTriangle} title="Missing Keywords">
          {(r.keywords_missing || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {r.keywords_missing.map(k => <Chip key={k} label={k} color="red" />)}
            </div>
          ) : (
            <p className="text-xs text-emerald-500">Great — no critical keywords missing!</p>
          )}
          <p className="text-[11px] text-gray-600 mt-4 leading-relaxed">
            Adding these keywords can significantly improve ATS pass rate and recruiter visibility.
          </p>
        </Section>
      </div>

      {/* ROW 6: All improvements */}
      {(r.improvements || []).length > 3 && (
        <Section icon={TrendingUp} title="All Improvement Areas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(r.improvements || []).map((imp, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#1c1c28] border border-[#22222e] space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{imp.title}</span>
                  <PriorityBadge priority={imp.priority} />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{imp.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  )
}
