import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic hook: fetches from Supabase on mount, falls back to localStorage cache.
 * Writes update both Supabase and localStorage.
 */
export function useSupabase<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  defaultValue: T,
): [T, boolean, () => Promise<void>] {
  const [data, setData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? (JSON.parse(cached) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetcher()
      if (mountedRef.current) {
        setData(result)
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result))
        } catch { /* quota */ }
      }
    } catch {
      // keep cached/default data on error
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [cacheKey, fetcher])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => { mountedRef.current = false }
  }, [refresh])

  return [data, loading, refresh]
}
