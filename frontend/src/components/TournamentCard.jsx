import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Users } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { gameIcon } from '../data/games'

export const formatWhen = (iso) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function TournamentCard({ tournament: t, featured = false, index = 0 }) {
  const Icon = gameIcon(t.game)
  return (
    <article style={{ animationDelay: `${index * 60}ms` }}
      className={`anim-rise group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/70 hover:shadow-[0_20px_50px_-20px_rgba(145,70,255,.6)] ${featured ? 'border-brand/50 glow' : 'border-line'}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 blur-3xl transition group-hover:bg-brand/40" aria-hidden="true" />
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted"><Icon className="h-4 w-4 text-mint" aria-hidden="true" /> {t.game}</span>
        <StatusBadge status={t.status} />
      </div>
      <h3 className="mt-4 text-xl font-extrabold leading-tight">{t.name}</h3>
      <dl className="mt-4 space-y-1.5 text-sm text-muted">
        <div className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Teams</dt><dd>{t.team_count} teams</dd></div>
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Start time</dt><dd>{formatWhen(t.start_time)}</dd></div>
      </dl>
      <Link to={`/tournaments/${t.id}`} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold transition hover:bg-violet-500">
        View Tournament <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </Link>
      {t.is_demo && <p className="mt-3 text-[11px] uppercase tracking-wider text-muted/70">Demo tournament</p>}
    </article>
  )
}
