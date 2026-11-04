import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Target, Coins, TrendingUp, ExternalLink } from 'lucide-react'
import Hero from '../components/Hero'
import TournamentCard from '../components/TournamentCard'
import MatchCard from '../components/MatchCard'
import GameCategoryFilter from '../components/GameCategoryFilter'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorState from '../components/ErrorState'
import { useResource } from '../hooks/useResource'
import { loadHome } from '../services/loaders'
import { mock } from '../data/mock'

const STEPS = [
  [Search, 'Discover tournaments', 'Browse live and upcoming events across every major esports title.'],
  [Target, 'Predict match winners', 'Fill out the bracket and lock in who you think takes it all.'],
  [Coins, 'Earn points', '10 points for a correct semifinal, 20 for calling the champion.'],
  [TrendingUp, 'Climb the leaderboard', 'Stack points across tournaments and race the community to #1.'],
]

function SectionHead({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default function Home() {
  const { data, loading, error, reload } = useResource(loadHome, mock.home)
  const [game, setGame] = useState('All')
  const byGame = (g) => game === 'All' || g === game
  const featured = data?.tournaments.filter((t) => t.status !== 'completed' && byGame(t.game)).slice(0, 3) ?? []
  const upcoming = data?.upcoming.filter((m) => byGame(m.tournament.game)).slice(0, 4) ?? []
  const heroPick = data?.tournaments.find((t) => t.status === 'upcoming')

  return (
    <>
      <Hero featured={heroPick} />
      <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6">
        {error && <ErrorState message={error} onRetry={reload} />}

        <section aria-labelledby="games">
          <SectionHead eyebrow="Game categories" title={<span id="games">Pick your game</span>} />
          <GameCategoryFilter games={data?.games ?? []} value={game} onChange={setGame} />
        </section>

        <section>
          <SectionHead eyebrow="Featured" title="Featured tournaments" action={<Link to="/tournaments" className="font-bold text-violet-300 hover:text-white">See all →</Link>} />
          {loading ? <LoadingSkeleton /> : featured.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((t, i) => <TournamentCard key={t.id} tournament={t} index={i} featured={i === 0} />)}</div>
          ) : <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No active tournaments for {game} right now.</p>}
        </section>

        <section>
          <SectionHead eyebrow="Up next" title="Upcoming matches" />
          {loading ? <LoadingSkeleton count={2} /> : upcoming.length ? (
            <div className="grid gap-5 md:grid-cols-2">{upcoming.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}</div>
          ) : <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No upcoming matches for {game}.</p>}
        </section>

        <section>
          <SectionHead eyebrow="How it works" title="From spectator to strategist" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([Icon, title, text], i) => (
              <li key={title} className="relative rounded-2xl border border-line bg-card p-6 transition hover:border-brand/60">
                <span className="absolute right-5 top-4 font-mono text-4xl font-black text-white/5">0{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/20 text-violet-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-brand/50 bg-gradient-to-br from-brand/40 via-[#2b1d45] to-card p-8 sm:p-12 glow">
          <div className="anim-drift absolute -right-20 -top-20 h-72 w-72 rounded-full bg-mint/20 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-black sm:text-5xl">Every match lives on Twitch.</h2>
            <p className="mt-3 text-lg text-violet-100">Watch the official broadcasts, hang out in chat with millions of fans, and catch your favorite creators co-streaming the biggest moments.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://www.twitch.tv/directory/category/esports" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-ink transition hover:bg-mint">Explore esports on Twitch <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
              <Link to="/predictions" className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3.5 font-bold transition hover:bg-white/10">Start predicting</Link>
            </div>
            <p className="mt-5 text-xs text-violet-200/70">Twitch Arena is an unofficial hackathon concept and is not affiliated with Twitch.</p>
          </div>
        </section>
      </div>
    </>
  )
}
