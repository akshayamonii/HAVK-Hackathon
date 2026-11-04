const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/$/, '')

export const USER_ID = 'demo-user' // demo identity only, not authentication

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}
export class NetworkError extends Error {}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  } catch {
    throw new NetworkError('Backend unreachable')
  }
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status)
  return body
}

export const getHealth = () => request('/health')
export const getGames = () => request('/games')
export const getTournaments = () => request('/tournaments')
export const getTournament = (id) => request(`/tournaments/${id}`)
export const getTournamentMatches = (id) => request(`/tournaments/${id}/matches`)
export const getTeam = (id) => request(`/teams/${id}`)
export const getPredictions = () => request(`/predictions?user_id=${USER_ID}`)
export const getLeaderboard = () => request('/leaderboard')
export const savePrediction = (matchId, predictedWinnerId) =>
  request('/predictions', {
    method: 'POST',
    body: JSON.stringify({ user_id: USER_ID, match_id: matchId, predicted_winner_id: predictedWinnerId }),
  })
