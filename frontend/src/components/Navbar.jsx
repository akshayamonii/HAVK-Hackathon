import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Trophy, User, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const LINKS = [
  ['/', 'Home'],
  ['/tournaments', 'Tournaments'],
  ['/predictions', 'Predictions'],
  ['/leaderboard', 'Leaderboard'],
]

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand/20 text-white' : 'text-muted hover:bg-white/5 hover:text-white'}`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { offline, userId } = useApp()
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand glow"><Trophy className="h-5 w-5" aria-hidden="true" /></span>
          <span className="text-lg">TWITCH <span className="text-brand">ARENA</span></span>
        </Link>
        <div className="ml-6 hidden gap-1 md:flex">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>)}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {offline && (
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 sm:inline-flex">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" /> Demo data
            </span>
          )}
          <span className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-semibold sm:inline-flex">
            <User className="h-4 w-4 text-mint" aria-hidden="true" /> {userId}
          </span>
          <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/5 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="anim-rise border-t border-line bg-ink px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={linkClass} onClick={() => setOpen(false)}>{label}</NavLink>)}
            <span className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-sm text-muted"><User className="h-4 w-4 text-mint" aria-hidden="true" /> {userId}{offline && ' · Demo data'}</span>
          </div>
        </div>
      )}
    </header>
  )
}
