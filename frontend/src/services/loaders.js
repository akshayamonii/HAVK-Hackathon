import * as api from './api'

export async function loadHome() {
  const [games, tournaments] = await Promise.all([api.getGames(), api.getTournaments()])
  const active = tournaments.filter((t) => t.status !== 'completed')
  const lists = await Promise.all(active.map((t) => api.getTournamentMatches(t.id)))
  const upcoming = active
    .flatMap((t, i) => lists[i].filter((m) => m.status === 'upcoming' && m.team1 && m.team2).map((m) => ({ ...m, tournament: t })))
    .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at))
  return { games, tournaments, upcoming }
}

export async function loadTournamentDetail(id) {
  const [tournament, matches, predictions] = await Promise.all([api.getTournament(id), api.getTournamentMatches(id), api.getPredictions()])
  const teamIds = [...new Set(matches.flatMap((m) => [m.team1?.id, m.team2?.id]).filter(Boolean))]
  const teams = await Promise.all(teamIds.map(api.getTeam))
  return { tournament, matches, predictions, teams }
}
