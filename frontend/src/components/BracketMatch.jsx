import { Check, Scale } from 'lucide-react'

function TeamSlot({ team, selected, winner, disabled, onPick }) {
  if (!team) return <div className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">TBD</div>
  return (
    <button type="button" onClick={() => onPick(team.id)} disabled={disabled} aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left font-bold transition
        ${selected ? 'border-mint bg-mint/15 text-white shadow-[0_0_24px_-6px_rgba(0,229,185,.7)]' : 'border-line bg-black/20 hover:border-brand hover:bg-brand/10'}
        ${disabled ? 'cursor-not-allowed opacity-80 hover:border-line hover:bg-black/20' : ''}`}>
      <span className="truncate">{team.name}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-mint" aria-label="Your pick" />}
      {winner && <span className="shrink-0 text-xs font-black uppercase tracking-wider text-amber-300">Won</span>}
    </button>
  )
}

export default function BracketMatch({ label, teams, selectedId, winnerId, disabled, note, onPick, onCompare }) {
  const [a, b] = teams
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
        {onCompare && a && b && (
          <button type="button" onClick={onCompare} className="inline-flex items-center gap-1 text-xs font-bold text-violet-300 hover:text-white">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" /> Compare
          </button>
        )}
      </div>
      <div className="space-y-2">
        <TeamSlot team={a} selected={a && selectedId === a.id} winner={a && winnerId === a.id} disabled={disabled || !a} onPick={onPick} />
        <TeamSlot team={b} selected={b && selectedId === b.id} winner={b && winnerId === b.id} disabled={disabled || !b} onPick={onPick} />
      </div>
      {note && <p className="mt-3 text-xs text-muted">{note}</p>}
    </div>
  )
}
