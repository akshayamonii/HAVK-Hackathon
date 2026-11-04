import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { USER_ID } from '../services/api'

const AppContext = createContext(null)
let nextId = 1

export function AppProvider({ children }) {
  const [offline, setOffline] = useState(false)
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback((message, type = 'info') => {
    const id = nextId++
    setToasts((t) => [...t.slice(-3), { id, message, type }])
    setTimeout(() => dismiss(id), 5000)
  }, [dismiss])

  const value = useMemo(() => ({ offline, setOffline, toasts, toast, dismiss, userId: USER_ID }), [offline, toasts, toast, dismiss])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
