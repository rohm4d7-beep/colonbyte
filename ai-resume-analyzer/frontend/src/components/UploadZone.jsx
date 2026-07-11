import { useCallback, useState, useRef } from 'react'
import { UploadCloud, FileText, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_MB   = 10
const MAX_SIZE = MAX_MB * 1024 * 1024

export default function UploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false)
  const [fileErr, setFileErr]   = useState(null)
  const [staged,  setStaged]    = useState(null)
  const inputRef = useRef(null)

  function validate(file) {
    if (file.type !== 'application/pdf') return 'Only PDF files are accepted.'
    if (file.size > MAX_SIZE)            return `File must be under ${MAX_MB} MB.`
    return null
  }

  function handleFile(file) {
    const err = validate(file)
    if (err) { setFileErr(err); setStaged(null); return }
    setFileErr(null)
    setStaged(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave = ()  => setDragging(false)

  function fmt(bytes) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center
          ${dragging
            ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]'
            : 'border-[#2a2a38] hover:border-indigo-500/50 bg-[#16161f] hover:bg-[#1c1c28]'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]) }}
        />

        <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors ${
          dragging ? 'bg-indigo-500/20' : 'bg-[#22222e]'
        }`}>
          <UploadCloud className={`w-8 h-8 transition-colors ${dragging ? 'text-indigo-400' : 'text-gray-500'}`} />
        </div>

        <p className="text-white font-semibold text-lg mb-1">
          {dragging ? 'Drop your resume here' : 'Drag & drop your resume'}
        </p>
        <p className="text-gray-500 text-sm mb-5">or click to browse — PDF only, max {MAX_MB} MB</p>

        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
          <FileText className="w-4 h-4" />
          Choose PDF file
        </span>
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {fileErr && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {fileErr}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staged file preview */}
      <AnimatePresence>
        {staged && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{staged.name}</p>
                <p className="text-xs text-gray-500">{fmt(staged.size)}</p>
              </div>
            </div>
            <button
              onClick={() => onFile(staged)}
              className="flex-shrink-0 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            >
              Analyse →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
