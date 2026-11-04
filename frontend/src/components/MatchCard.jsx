import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CountdownTimer from './CountdownTimer'
import { gameIcon } from '../data/games'

export default function MatchCard({ match, index = 0 }) {
  const Icon = gameIcon(match.tournament.game)
  return (
    <article style={{ animationDelay: `${index * 60}ms` }} className="anim-rise rounded-2xl border border-line bg-card p-5 transition hover:border-mint/50">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="inline-flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-mint" aria-hidden="true" /> {match.tournament.game}</span>
        <span className="truncate pl-2">{match.tournament.name}</span>
      </div>
      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <span className="truncate text-lg font-extrabold">{match.team1.name}</span>
        <span className="rounded-full bg-brand/20 px-2.5 py-1 text-xs font-black tracking-widest text-violet-300">VS</span>
        <span className="truncate text-lg font-extrabold">{match.team2.name}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CountdownTimer target={match.scheduled_at} compact />
        <Link to={`/tournaments/${match.tournament_id}#bracket`} className="inline-flex items-center gap-1.5 rounded-xl border border-brand/60 px-3.5 py-2 text-sm font-bold transition hover:bg-brand">
          View Match <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
