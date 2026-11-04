// DEMO DATA ONLY. Used when the Flask backend is unreachable. Everything here is fictional.
const hoursFromNow = (h) => new Date(Date.now() + h * 36e5).toISOString()

export const MOCK_GAMES = [
  { id: 1, name: 'Valorant', slug: 'valorant' },
  { id: 2, name: 'League of Legends', slug: 'league-of-legends' },
  { id: 3, name: 'Counter-Strike 2', slug: 'counter-strike-2' },
  { id: 4, name: 'Rocket League', slug: 'rocket-league' },
]

const TEAM_NAMES = [
  ['Phantom', 'Nova', 'Vortex', 'Ember'],
  ['Tidebreakers', 'Iron Lantern', 'Solar Choir', 'Night Orchard'],
  ['Static Minds', 'Brass Wolves', 'Cold Harbor', 'Redline Co'],
  ['Turbo Hearts', 'Gravity Well', 'Skyline FC', 'Boost Theory'],
]
const REGIONS = ['NA', 'EU', 'APAC', 'LATAM']

export const MOCK_TEAMS = MOCK_GAMES.flatMap((g, gi) =>
  TEAM_NAMES[gi].map((name, i) => ({
    id: gi * 4 + i + 1,
    name,
    game: g.name,
    region: REGIONS[(gi + i) % 4],
    wins: 14 - i * 2 - (gi % 2),
    losses: 3 + i * 2 + (gi % 3),
  })),
)

const gameIndex = (name) => MOCK_GAMES.findIndex((g) => g.name === name)

export const MOCK_TOURNAMENTS = [
  { id: 1, name: 'Twitch Arena Championship', game: 'Valorant', status: 'upcoming', start_time: '2026-11-07T19:00:00Z', team_count: 4, is_demo: true },
  { id: 2, name: 'Rift Series Finals', game: 'League of Legends', status: 'live', start_time: hoursFromNow(-1), team_count: 4, is_demo: true },
  { id: 3, name: 'Strike Open Qualifier', game: 'Counter-Strike 2', status: 'upcoming', start_time: hoursFromNow(30), team_count: 4, is_demo: true },
  { id: 4, name: 'Overdrive Cup', game: 'Rocket League', status: 'upcoming', start_time: hoursFromNow(52), team_count: 4, is_demo: true },
  { id: 5, name: 'Apex Invitational', game: 'Valorant', status: 'completed', start_time: hoursFromNow(-72), team_count: 4, is_demo: true },
  { id: 6, name: 'Lantern Cup', game: 'League of Legends', status: 'upcoming', start_time: hoursFromNow(100), team_count: 4, is_demo: true },
]

const ref = (t) => ({ id: t.id, name: t.name })

export function mockMatches(tournamentId) {
  const t = MOCK_TOURNAMENTS.find((x) => x.id === Number(tournamentId))
  if (!t) return null
  const [a, b, c, d] = MOCK_TEAMS.filter((x) => x.game === t.game)
  const start = new Date(t.start_time).getTime()
  const iso = (offsetH) => new Date(start + offsetH * 36e5).toISOString()
  const done = t.status === 'completed'
  const live = t.status === 'live'
  const base = { tournament_id: t.id, team1: null, team2: null, winner_id: null }
  return [
    { ...base, id: t.id * 10 + 1, round: 'semifinal', round_order: 1, slot: 1, team1: ref(a), team2: ref(b), winner_id: done || live ? a.id : null, status: done || live ? 'completed' : 'upcoming', scheduled_at: iso(0) },
    { ...base, id: t.id * 10 + 2, round: 'semifinal', round_order: 1, slot: 2, team1: ref(c), team2: ref(d), winner_id: done ? c.id : null, status: done ? 'completed' : live ? 'live' : 'upcoming', scheduled_at: iso(1) },
    { ...base, id: t.id * 10 + 3, round: 'final', round_order: 2, slot: 1, team1: done ? ref(a) : null, team2: done ? ref(c) : null, winner_id: done ? a.id : null, status: done ? 'completed' : 'upcoming', scheduled_at: iso(3) },
  ]
}

const LOCAL_KEY = 'arena.offlinePicks.demo-user'
const localPredictions = () => {
  const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}')
  return Object.entries(stored).map(([match_id, predicted_winner_id], i) => ({ id: i + 1, user_id: 'demo-user', match_id: Number(match_id), predicted_winner_id }))
}

export const MOCK_LEADERBOARD = [
  { user_id: 'nova_nine', username: 'nova_nine', points: 90, correct_picks: 9, resolved_picks: 10, accuracy: 90 },
  { user_id: 'clutchqueen', username: 'clutchqueen', points: 80, correct_picks: 8, resolved_picks: 10, accuracy: 80 },
  { user_id: 'rotation_rex', username: 'rotation_rex', points: 70, correct_picks: 7, resolved_picks: 9, accuracy: 78 },
  { user_id: 'demo-user', username: 'demo-user', points: 50, correct_picks: 5, resolved_picks: 7, accuracy: 71 },
  { user_id: 'peekaboo', username: 'peekaboo', points: 40, correct_picks: 4, resolved_picks: 6, accuracy: 67 },
  { user_id: 'lagspike', username: 'lagspike', points: 30, correct_picks: 3, resolved_picks: 6, accuracy: 50 },
  { user_id: 'ace_or_bust', username: 'ace_or_bust', points: 20, correct_picks: 2, resolved_picks: 5, accuracy: 40 },
]

export const mock = {
  games: () => MOCK_GAMES,
  tournaments: () => MOCK_TOURNAMENTS,
  leaderboard: () => MOCK_LEADERBOARD,
  home: () => {
    const active = MOCK_TOURNAMENTS.filter((t) => t.status !== 'completed')
    const upcoming = active
      .flatMap((t) => mockMatches(t.id).filter((m) => m.status === 'upcoming' && m.team1 && m.team2).map((m) => ({ ...m, tournament: t })))
      .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at))
    return { games: MOCK_GAMES, tournaments: MOCK_TOURNAMENTS, upcoming }
  },
  detail: (id) => {
    const tournament = MOCK_TOURNAMENTS.find((t) => t.id === Number(id))
    if (!tournament) throw new Error('Tournament not found')
    return {
      tournament,
      matches: mockMatches(id),
      teams: MOCK_TEAMS.filter((t) => gameIndex(t.game) === gameIndex(tournament.game)),
      predictions: localPredictions(),
    }
  },
}
export { gameIndex, LOCAL_KEY }
