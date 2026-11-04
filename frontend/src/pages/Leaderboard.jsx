import { Crown, Medal, Trophy } from 'lucide-react'
import LeaderboardTable from '../components/LeaderboardTable'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'
import { useResource } from '../hooks/useResource'
import { getLeaderboard } from '../services/api'
import { mock } from '../data/mock'
import { useApp } from '../context/AppContext'

const PODIUM = [
  { place: 2, order: 'order-1', height: 'h-32', Icon: Medal, color: 'text-slate-300' },
  { place: 1, order: 'order-2', height: 'h-44', Icon: Crown, color: 'text-amber-300' },
  { place: 3, order: 'order-3', height: 'h-24', Icon: Trophy, color: 'text-orange-400' },
]

export default function Leaderboard() {
  const { userId } = useApp()
  const { data, loading, error, reload } = useResource(getLeaderboard, mock.leaderboard)
  const rows = [...(data ?? [])].sort((a, b) => b.points - a.points)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Leaderboard</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Top predictors</h1>
      <p className="mt-2 text-muted">Points are calculated by the server: 10 per correct semifinal, 20 per correct final.</p>

      {loading ? <div className="mt-10"><LoadingSkeleton count={3} /></div> : error ? <div className="mt-10"><ErrorState message={error} onRetry={reload} /></div> : rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line p-12 text-center text-muted">No resolved predictions yet. Make your picks and check back after the matches.</div>
      ) : (
        <>
          <div className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-6">
            {PODIUM.map(({ place, order, height, Icon, color }) => {
              const r = rows[place - 1]
              if (!r) return <div key={place} className={order} />
              return (
                <div key={place} className={`${order} anim-rise text-center`} style={{ animationDelay: `${place * 100}ms` }}>
                  <Icon className={`mx-auto h-8 w-8 ${color} ${place === 1 ? 'anim-float' : ''}`} aria-hidden="true" />
                  <p className={`mt-2 truncate font-black sm:text-lg ${r.user_id === userId ? 'text-mint' : ''}`}>{r.username}</p>
                  <p className="font-mono text-sm text-muted">{r.points} pts</p>
                  <div className={`mt-3 ${height} rounded-t-2xl border border-b-0 ${place === 1 ? 'border-brand bg-gradient-to-b from-brand/60 to-card glow' : 'border-line bg-gradient-to-b from-brand/20 to-card'} grid place-items-start justify-center pt-3`}>
                    <span className="font-mono text-3xl font-black text-white/80">{place}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-10"><LeaderboardTable rows={rows} currentUser={userId} /></div>
        </>
      )}
    </div>
  )
}
