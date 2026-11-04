# Twitch Arena: Frontend

Watch. Predict. Compete. An unofficial hackathon concept, not affiliated with Twitch.

## Run

    npm install
    npm run dev

Open http://localhost:5173

The app talks to the Flask API at http://127.0.0.1:5000/api. To change it, create `.env.local` with `VITE_API_URL=http://host:port/api`.

If the backend is unreachable, the app shows an "offline / demo data" banner and uses fictional data from `src/data/mock.js`. Offline picks stay on the device and are never reported as saved to the server.

## Structure

- `src/pages`: Home, Tournaments (also /predictions), TournamentDetails, Leaderboard
- `src/components`: Navbar, Hero, Footer, TournamentCard, MatchCard, CountdownTimer, GameCategoryFilter, TournamentBracket, BracketMatch, TeamComparison, LeaderboardTable, LoadingSkeleton, ErrorState, ToastNotification
- `src/services/api.js`: API contract functions; `src/services/loaders.js`: page data loaders
- `src/hooks`: useResource (fetch + offline fallback), useBracket (prediction logic), useCountdown

## Backend notes

The final-match prediction is only POSTed once `/tournaments/:id/matches` returns a final with both `team1` and `team2` set. Until then it is a preview.
The frontend needs CORS enabled on the Flask API (for example, `flask-cors`).
