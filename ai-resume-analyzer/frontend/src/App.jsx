import { AnimatePresence, motion } from 'framer-motion'
import Navbar           from './components/Navbar'
import UploadZone       from './components/UploadZone'
import LoadingState     from './components/LoadingState'
import AnalysisResults  from './components/AnalysisResults'
import { useAnalyzer }  from './hooks/useAnalyzer'

export default function App() {
  const { status, file, result, error, analyze, reset } = useAnalyzer()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'error' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero copy */}
              <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                  Analyse your resume with{' '}
                  <span className="gradient-text">AI precision</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Upload your PDF and get instant structured feedback on skills,
                  ATS compatibility, and exactly what to improve.
                </p>
              </div>

              <UploadZone onFile={analyze} />

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : status === 'analyzing' ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingState filename={file?.name} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AnalysisResults result={result} filename={file?.name} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
