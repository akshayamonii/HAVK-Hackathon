import { useMemo, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import TournamentCard from '../components/TournamentCard'
import GameCategoryFilter from '../components/GameCategoryFilter'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'
import { useResource } from '../hooks/useResource'
import { getTournaments } from '../services/api'
import { mock } from '../data/mock'

const STATUSES = ['all', 'live', 'upcoming', 'completed']

export default function Tournaments({ mode = 'browse' }) {
  const predict = mode === 'predict'
  const { data, loading, error, reload } = useResource(getTournaments, mock.tournaments)
  const [query, setQuery] = useState('')
  const [game, setGame] = useState('All')
  const [status, setStatus] = useState(predict ? 'upcoming' : 'all')
  const [sort, setSort] = useState('asc')

  const games = useMemo(() => [...new Set((data ?? []).map((t) => t.game))].map((name) => ({ name })), [data])
  const results = useMemo(() => (data ?? [])
    .filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((t) => game === 'All' || t.game === game)
    .filter((t) => status === 'all' || t.status === status)
    .sort((a, b) => (sort === 'asc' ? 1 : -1) * (new Date(a.start_time) - new Date(b.start_time))), [data, query, game, status, sort])
  const featured = predict ? [] : results.filter((t) => t.status !== 'completed').slice(0, 2)
  const rest = results.filter((t) => !featured.includes(t))

  const clear = () => { setQuery(''); setGame('All'); setStatus('all') }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-mint">{predict ? 'Predictions' : 'Tournaments'}</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">{predict ? 'Pick a bracket to predict' : 'Find your tournament'}</h1>
      <p className="mt-2 max-w-2xl text-muted">{predict ? 'Choose an upcoming tournament, call the semifinal winners and crown your champion.' : 'Search every event, filter by game and status, and jump into the bracket.'}</p>

      <div className="mt-8 space-y-4 rounded-2xl border border-line bg-card/60 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search tournaments</span>
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tournaments…"
              className="w-full rounded-xl border border-line bg-ink py-3 pl-10 pr-4 outline-none transition placeholder:text-muted focus:border-brand" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-line bg-ink px-3 py-3 font-semibold text-white focus:border-brand">
              {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-line bg-ink px-3 py-3 font-semibold text-white focus:border-brand">
              <option value="asc">Start date: soonest</option>
              <option value="desc">Start date: latest</option>
            </select>
          </label>
        </div>
        <GameCategoryFilter games={games} value={game} onChange={setGame} />
      </div>

      <div className="mt-10">
        {loading ? <LoadingSkeleton count={6} /> : error ? <ErrorState message={error} onRetry={reload} /> : results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line p-12 text-center">
            <SearchX className="h-10 w-10 text-muted" aria-hidden="true" />
            <h2 className="text-xl font-bold">No tournaments match those filters</h2>
            <button onClick={clear} className="rounded-xl bg-brand px-4 py-2 font-bold hover:bg-violet-500">Clear filters</button>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-xl font-extrabold">Featured</h2>
                <div className="grid gap-5 md:grid-cols-2">{featured.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} featured />)}</div>
              </div>
            )}
            {rest.length > 0 && (
              <>
                {featured.length > 0 && <h2 className="mb-4 text-xl font-extrabold">All tournaments</h2>}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} />)}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
