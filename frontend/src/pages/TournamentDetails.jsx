import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import CountdownTimer from '../components/CountdownTimer'
import TournamentBracket from '../components/TournamentBracket'
import TeamComparison from '../components/TeamComparison'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'
import { formatWhen } from '../components/TournamentCard'
import { useResource } from '../hooks/useResource'
import { useBracket } from '../hooks/useBracket'
import { loadTournamentDetail } from '../services/loaders'
import { mock } from '../data/mock'
import { gameIcon } from '../data/games'
import { useApp } from '../context/AppContext'

function Detail({ data }) {
  const { tournament: t, matches, teams } = data
  const bracket = useBracket(data)
  const { toast } = useApp()
  const { hash } = useLocation()
  const [compare, setCompare] = useState(null)
  const Icon = gameIcon(t.game)
  const teamById = new Map(teams.map((x) => [x.id, x]))

  useEffect(() => {
    if (hash === '#bracket') document.getElementById('bracket')?.scrollIntoView()
  }, [hash])

  const predictFromCompare = (teamId) => {
    bracket.pick(compare.id, teamId)
    toast(`Picked ${teamById.get(teamId)?.name ?? 'team'}. Remember to save your predictions.`, 'success')
    setCompare(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> All tournaments</Link>

      <header className="relative mt-5 overflow-hidden rounded-3xl border border-brand/40 bg-gradient-to-br from-[#2b1d45] to-card p-6 sm:p-10 glow">
        <div className="anim-drift absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted"><Icon className="h-4 w-4 text-mint" aria-hidden="true" /> {t.game}</span>
              <StatusBadge status={t.status} />
              {t.is_demo && <span className="text-xs uppercase tracking-wider text-muted">Demo data</span>}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.name}</h1>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" aria-hidden="true" /> {formatWhen(t.start_time)}</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /> {t.team_count} teams</span>
            </div>
          </div>
          {t.status === 'upcoming' && <div><p className="mb-2 text-xs uppercase tracking-widest text-muted">Starts in</p><CountdownTimer target={t.start_time} /></div>}
        </div>
      </header>

      <section id="bracket" className="mt-14 scroll-mt-24">
        <h2 className="text-3xl font-black">Prediction bracket</h2>
        <p className="mb-6 mt-1 text-muted">Click a team to advance it. Correct semifinal: 10 pts. Correct champion: 20 pts.</p>
        <TournamentBracket bracket={bracket} onCompare={setCompare} />
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-black">Match schedule</h2>
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">{m.round === 'final' ? 'Final' : `Semifinal ${m.slot}`}</p>
                  <p className="font-bold">{m.team1?.name ?? 'TBD'} <span className="text-muted">vs</span> {m.team2?.name ?? 'TBD'}</p>
                </div>
                <div className="text-right text-sm">
                  <StatusBadge status={m.status} />
                  <p className="mt-1 text-muted">{formatWhen(m.scheduled_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-black">Participating teams</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.map((team) => {
              const rate = Math.round((team.wins / Math.max(1, team.wins + team.losses)) * 100)
              return (
                <div key={team.id} className="rounded-2xl border border-line bg-card p-4">
                  <p className="font-extrabold">{team.name}</p>
                  <p className="text-sm text-muted">{team.region} · {team.wins}W-{team.losses}L</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40" aria-hidden="true"><div className="h-full bg-gradient-to-r from-brand to-mint" style={{ width: `${rate}%` }} /></div>
                    <span className="font-mono text-sm">{rate}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {compare && teamById.get(compare.team1.id) && teamById.get(compare.team2.id) && (
        <TeamComparison teamA={teamById.get(compare.team1.id)} teamB={teamById.get(compare.team2.id)} selectedId={bracket.picks[compare.id]}
          disabled={bracket.locked || compare.status !== 'upcoming'} onPredict={predictFromCompare} onClose={() => setCompare(null)} />
      )}
    </div>
  )
}

export default function TournamentDetails() {
  const { id } = useParams()
  const { data, loading, error, reload } = useResource(() => loadTournamentDetail(id), () => mock.detail(id), [id])
  if (loading) return <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6"><LoadingSkeleton count={3} height="h-56" /></div>
  if (error) return <div className="px-4 pt-16"><ErrorState message={error} onRetry={reload} /></div>
  return <Detail key={id} data={data} />
}
