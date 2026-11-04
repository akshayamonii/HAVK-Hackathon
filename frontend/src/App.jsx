import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastNotification from './components/ToastNotification'
import Home from './pages/Home'
import Tournaments from './pages/Tournaments'
import TournamentDetails from './pages/TournamentDetails'
import Leaderboard from './pages/Leaderboard'
import { useApp } from './context/AppContext'

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-24 text-center">
      <h1 className="text-6xl font-black">404</h1>
      <p className="mt-2 text-muted">This arena doesn't exist.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 font-bold">Back home</Link>
    </div>
  )
}

export default function App() {
  const { offline } = useApp()
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2">Skip to content</a>
      <Navbar />
      {offline && (
        <div role="status" className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center text-sm text-amber-200">
          <WifiOff className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Backend offline: showing demo data. Predictions are kept on this device and are not saved to the server.
        </div>
      )}
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/predictions" element={<Tournaments mode="predict" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastNotification />
    </div>
  )
}
