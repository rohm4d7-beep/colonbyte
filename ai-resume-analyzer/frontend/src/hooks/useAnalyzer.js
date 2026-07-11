import { useState, useCallback } from 'react'
import { analyzeResume } from '../api/analyze'

const INITIAL = { status: 'idle', file: null, result: null, error: null }

export function useAnalyzer() {
  const [state, setState] = useState(INITIAL)

  const analyze = useCallback(async (file) => {
    setState({ status: 'analyzing', file, result: null, error: null })
    try {
      const result = await analyzeResume(file)
      setState(s => ({ ...s, status: 'done', result }))
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: err.message }))
    }
  }, [])

  const reset = useCallback(() => setState(INITIAL), [])

  return { ...state, analyze, reset }
}
