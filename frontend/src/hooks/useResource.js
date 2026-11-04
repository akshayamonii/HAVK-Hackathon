import { useEffect, useState } from 'react'
import { NetworkError } from '../services/api'
import { useApp } from '../context/AppContext'

// Loads from the backend. If the backend is unreachable, falls back to clearly labeled demo data.
// HTTP errors from a reachable backend surface as `error`, they are never masked by demo data.
export function useResource(apiFn, mockFn, deps = []) {
  const { setOffline } = useApp()
  const [state, setState] = useState({ data: null, loading: true, error: null, offline: false })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    apiFn()
      .then((data) => {
        if (!alive) return
        setOffline(false)
        setState({ data, loading: false, error: null, offline: false })
      })
      .catch((err) => {
        if (!alive) return
        if (err instanceof NetworkError) {
          setOffline(true)
          try {
            setState({ data: mockFn(), loading: false, error: null, offline: true })
          } catch (e) {
            setState({ data: null, loading: false, error: e.message, offline: true })
          }
        } else {
          setState({ data: null, loading: false, error: err.message, offline: false })
        }
      })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
