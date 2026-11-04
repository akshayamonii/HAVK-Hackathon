import { useEffect } from 'react'
import { X, Check } from 'lucide-react'

const pct = (t) => (t.wins + t.losses ? Math.round((t.wins / (t.wins + t.losses)) * 100) : 0)

function Column({ team, selected, disabled, onPredict }) {
  const rate = pct(team)
  return (
    <div className={`rounded-2xl border p-5 transition ${selected ? 'border-mint bg-mint/10' : 'border-line bg-black/20'}`}>
      <h3 className="truncate text-xl font-black">{team.name}</h3>
      <p className="text-sm text-muted">{team.region} · {team.game}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-black/30 p-2"><dt className="text-[10px] uppercase tracking-wider text-muted">Wins</dt><dd className="text-lg font-bold text-mint">{team.wins}</dd></div>
        <div className="rounded-xl bg-black/30 p-2"><dt className="text-[10px] uppercase tracking-wider text-muted">Losses</dt><dd className="text-lg font-bold text-red-400">{team.losses}</dd></div>
        <div className="rounded-xl bg-black/30 p-2"><dt className="text-[10px] uppercase tracking-wider text-muted">Win %</dt><dd className="text-lg font-bold">{rate}%</dd></div>
      </dl>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40" aria-hidden="true"><div className="h-full rounded-full bg-gradient-to-r from-brand to-mint" style={{ width: `${rate}%` }} /></div>
      <button type="button" onClick={() => onPredict(team.id)} disabled={disabled}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'bg-mint text-ink' : 'bg-brand hover:bg-violet-500'}`}>
        {selected && <Check className="h-4 w-4" aria-hidden="true" />} {selected ? 'Your pick' : 'Predict Winner'}
      </button>
    </div>
  )
}

export default function TeamComparison({ teamA, teamB, selectedId, disabled, onPredict, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Team comparison" className="anim-rise w-full max-w-2xl rounded-3xl border border-brand/50 bg-card p-6 glow" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Head to head</h2>
          <button type="button" onClick={onClose} aria-label="Close comparison" className="rounded-lg p-1 text-muted hover:bg-white/5 hover:text-white" autoFocus><X /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Column team={teamA} selected={selectedId === teamA.id} disabled={disabled} onPredict={onPredict} />
          <Column team={teamB} selected={selectedId === teamB.id} disabled={disabled} onPredict={onPredict} />
        </div>
      </div>
    </div>
  )
}
