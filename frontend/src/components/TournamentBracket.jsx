import { ChevronRight, Crown, RotateCcw, Save, Loader2, Lock } from 'lucide-react'
import BracketMatch from './BracketMatch'

export default function TournamentBracket({ bracket, onCompare }) {
  const { semis, final, officialFinalists, picks, pick, reset, save, saving, locked, dirty, previewOnly } = bracket
  const teamName = new Map(semis.flatMap((m) => [m.team1, m.team2]).filter(Boolean).map((t) => [t.id, t]))
  const finalTeams = officialFinalists ? [final.team1, final.team2] : semis.map((s) => teamName.get(picks[s.id]) ?? null)
  const championId = final ? (final.winner_id ?? picks[final.id]) : null
  const champion = teamName.get(championId)
  const actualChampion = Boolean(final?.winner_id)

  return (
    <div>
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="space-y-4">
          {semis.map((m) => (
            <BracketMatch key={m.id} label={`Semifinal ${m.slot}`} teams={[m.team1, m.team2]} selectedId={picks[m.id]} winnerId={m.winner_id}
              disabled={locked || m.status !== 'upcoming'} note={m.status !== 'upcoming' ? 'Match started. Picks are closed.' : null}
              onPick={(teamId) => pick(m.id, teamId)} onCompare={() => onCompare(m)} />
          ))}
        </div>
        <ChevronRight className="mx-auto hidden h-8 w-8 text-brand lg:block" aria-hidden="true" />
        {final && (
          <BracketMatch label={officialFinalists ? 'Championship final' : 'Championship final · preview'} teams={finalTeams} selectedId={picks[final.id]} winnerId={final.winner_id}
            disabled={locked || !finalTeams[0] || !finalTeams[1]}
            note={officialFinalists ? null : 'Built from your semifinal picks. Saved once the official finalists are known.'}
            onPick={(teamId) => pick(final.id, teamId)} />
        )}
        <ChevronRight className="mx-auto hidden h-8 w-8 text-brand lg:block" aria-hidden="true" />
        <div className={`relative overflow-hidden rounded-2xl border p-6 text-center transition ${champion ? 'border-amber-300/60 bg-gradient-to-b from-amber-300/15 to-card' : 'border-line bg-card'}`} aria-live="polite">
          <Crown className={`mx-auto h-10 w-10 ${champion ? 'anim-float text-amber-300' : 'text-muted'}`} aria-hidden="true" />
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">{actualChampion ? 'Champion' : 'Predicted champion'}</p>
          <p className="mt-1 text-2xl font-black">{champion?.name ?? 'Make your picks'}</p>
          {champion && !actualChampion && previewOnly && <p className="mt-2 text-xs text-amber-200/80">Preview only, not saved to the server</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {locked ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted"><Lock className="h-4 w-4" aria-hidden="true" /> Predictions are closed for this tournament.</p>
        ) : (
          <>
            <button type="button" onClick={save} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-60 glow">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save predictions'}
            </button>
            <button type="button" onClick={reset} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 font-bold text-muted transition hover:border-white hover:text-white">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset bracket
            </button>
            {dirty && <span className="text-sm text-amber-300">Unsaved changes</span>}
          </>
        )}
      </div>
    </div>
  )
}
