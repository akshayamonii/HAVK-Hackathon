import { Link } from 'react-router-dom'
import { Trophy, Crown, ArrowRight, Radio } from 'lucide-react'
import CountdownTimer from './CountdownTimer'

export default function Hero({ featured }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="bg-grid absolute inset-0" />
        <div className="anim-drift absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand/30 blur-[120px]" />
        <div className="anim-drift absolute right-0 top-40 h-80 w-80 rounded-full bg-mint/15 blur-[120px]" style={{ animationDelay: '-6s' }} />
      </div>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <div className="anim-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-mint">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" /> Esports on Twitch
          </span>
          <h1 className="text-glow mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">THE ARENA <span className="bg-gradient-to-r from-brand to-mint bg-clip-text text-transparent">AWAITS.</span></h1>
          <p className="mt-4 text-2xl font-bold text-violet-200">Watch. Predict. Compete.</p>
          <p className="mt-4 max-w-xl text-lg text-muted">Follow the biggest tournaments on Twitch, call the winners in an interactive bracket, and climb the leaderboard against the whole community.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/tournaments" className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-bold transition hover:bg-violet-500 glow">Explore Tournaments <ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
            <Link to="/predictions" className="inline-flex items-center gap-2 rounded-xl border border-mint/60 px-6 py-3.5 font-bold text-mint transition hover:bg-mint hover:text-ink">Make Predictions</Link>
          </div>
        </div>

        <div className="anim-float relative mx-auto w-full max-w-md" aria-label="Featured tournament">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-brand/30 blur-3xl" aria-hidden="true" />
          <div className="rounded-[2rem] border border-brand/50 bg-gradient-to-br from-[#2b1d45] to-card p-6 glow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-mint">Featured</span>
              <Trophy className="h-6 w-6 text-amber-300" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-2xl font-black">{featured?.name ?? 'Twitch Arena Championship'}</h2>
            <p className="text-sm text-muted">{featured?.game ?? 'Valorant'} · 4 teams · single elimination</p>
            <div className="mt-5 space-y-2" aria-hidden="true">
              {['Semifinal 1', 'Semifinal 2'].map((s) => (
                <div key={s} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-2.5 text-sm"><span className="text-muted">{s}</span><span className="font-bold">? vs ?</span></div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-mint/40 bg-mint/10 px-4 py-2.5 text-sm"><span className="inline-flex items-center gap-2 font-bold text-mint"><Crown className="h-4 w-4" /> Champion</span><span className="font-bold">Your pick</span></div>
            </div>
            {featured && <div className="mt-5"><p className="mb-2 text-xs uppercase tracking-widest text-muted">Starts in</p><CountdownTimer target={featured.start_time} /></div>}
          </div>
        </div>
      </div>
    </section>
  )
}
