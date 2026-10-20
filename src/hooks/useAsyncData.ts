import { useCallback, useEffect, useState } from 'react'
// Loaders should be stable (useCallback). Cleanup ignores responses after unmount.
export function useAsyncData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    load().then(value => { if (active) setData(value) }).catch(() => { if (active) setError('Unable to load data. Please try again.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [load, attempt])
  const retry = useCallback(() => { setLoading(true); setError(''); setAttempt(value => value + 1) }, [])
  return { data, setData, loading, error, retry }
}
