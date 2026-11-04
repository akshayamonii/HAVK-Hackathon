import { useEffect, useMemo, useState } from 'react'
import { savePrediction, NetworkError } from '../services/api'
import { LOCAL_KEY } from '../data/mock'
import { useApp } from '../context/AppContext'

const draftKey = (userId, tid) => `arena.draft.${userId}.${tid}`
const readJson = (key) => JSON.parse(localStorage.getItem(key) ?? '{}')

export function useBracket({ tournament, matches, predictions }) {
  const { userId, toast } = useApp()
  const semis = useMemo(() => matches.filter((m) => m.round === 'semifinal').sort((a, b) => a.slot - b.slot), [matches])
  const final = useMemo(() => matches.find((m) => m.round === 'final'), [matches])
  const officialFinalists = final?.team1 && final?.team2 ? [final.team1.id, final.team2.id] : null

  const serverPicks = useMemo(() => {
    const ids = new Set(matches.map((m) => m.id))
    return Object.fromEntries(predictions.filter((p) => ids.has(p.match_id)).map((p) => [p.match_id, p.predicted_winner_id]))
  }, [matches, predictions])

  const [saved, setSaved] = useState(serverPicks)
  const [picks, setPicks] = useState(() => ({ ...serverPicks, ...readJson(draftKey(userId, tournament.id)) }))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    localStorage.setItem(draftKey(userId, tournament.id), JSON.stringify(picks))
  }, [picks, userId, tournament.id])

  const locked = tournament.status === 'completed' || semis.every((m) => m.status !== 'upcoming')

  const pick = (matchId, teamId) => {
    if (locked) return
    setPicks((prev) => {
      const next = { ...prev, [matchId]: teamId }
      if (final && !officialFinalists && semis.some((s) => s.id === matchId)) {
        const finalists = semis.map((s) => next[s.id])
        if (!finalists.includes(next[final.id])) delete next[final.id]
      }
      return next
    })
  }

  const reset = () => {
    setPicks({})
    toast('Bracket cleared. Predictions already saved on the server are unchanged until you save new ones.', 'info')
  }

  // Only matches the backend accepts: upcoming semifinals, and the final once official finalists are known.
  const savable = [...semis, ...(officialFinalists && final ? [final] : [])].filter((m) => m.status === 'upcoming')
  const toSave = savable.filter((m) => picks[m.id] && picks[m.id] !== saved[m.id])
  const previewOnly = Boolean(final && !officialFinalists && picks[final.id])

  const save = async () => {
    if (!toSave.length) {
      toast(previewOnly ? 'Your championship pick is a preview. It can be saved once the official finalists are known.' : 'Nothing new to save.', 'info')
      return
    }
    setSaving(true)
    try {
      for (const m of toSave) await savePrediction(m.id, picks[m.id])
      setSaved((s) => ({ ...s, ...Object.fromEntries(toSave.map((m) => [m.id, picks[m.id]])) }))
      toast(previewOnly ? 'Semifinal picks saved to the server. The championship pick is a preview only.' : 'Predictions saved to the server.', 'success')
    } catch (err) {
      if (err instanceof NetworkError) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...readJson(LOCAL_KEY), ...Object.fromEntries(toSave.map((m) => [m.id, picks[m.id]])) }))
        toast('Backend is offline. Picks are kept on this device only and were NOT saved to the server.', 'warning')
      } else {
        toast(err.message, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return { semis, final, officialFinalists, picks, pick, reset, save, saving, locked, dirty: toSave.length > 0, previewOnly }
}
