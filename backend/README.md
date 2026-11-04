# Twitch Arena backend

Python 3.11+ Flask API with persistent SQLite data. All tournaments and team statistics are fictional demo data. Files and commands below are relative to `backend/`.

## Run on Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python database.py
.\.venv\Scripts\python seed.py
.\.venv\Scripts\python app.py
```

Alternatively activate the environment and run `python app.py`. On macOS/Linux use `python3 -m venv .venv` and `.venv/bin/python` for subsequent commands. The app initializes and seeds automatically on startup; explicit initialization commands are optional. Repeated startup preserves existing predictions and official results. Upcoming dates are relative to the first seed time. To regenerate an expired demo, stop the app and choose a new `DATABASE_PATH`.

API base URL: `http://127.0.0.1:5000/api`. Run tests with:

```powershell
.\.venv\Scripts\python -m pytest -q
```

Tests use temporary databases and never touch the demo database.

## Configuration

`.env.example` documents environment variables; files are not automatically loaded. Set them in your shell before starting:

```powershell
$env:DEMO_ADMIN_ENABLED = 'true'
$env:FRONTEND_ORIGIN = 'https://your-frontend.example'
```

`DATABASE_PATH` defaults to `backend/arena.sqlite3`, `PORT` to 5000. Production origins can be comma separated. CORS permits localhost and 127.0.0.1 on port 5173 by default. The server binds to loopback. The demo result endpoint is disabled by default and has no authentication: enable exclusively for trusted local demonstrations. CORS is not authentication. User IDs are client-supplied demo identities, not authenticated accounts; add real authentication before public deployment.

## Frontend integration

GET endpoints return bare JSON arrays or objects, without an envelope:

- `/api/health`: `{"status":"ok"}`.
- `/api/games`: integer IDs, names and slugs.
- `/api/tournaments`: name, game, status, UTC dates, team_count, boolean is_demo, and champion_id. Optional `game` accepts slug, name or numeric ID; `status` and `search` can be combined.
- `/api/tournaments/1`: tournament fields plus participating teams.
- `/api/tournaments/1/matches`: matches ordered by round_order and slot; nested team1/team2 objects are null until official participants are known. Includes deadline and next_match_id/next_slot.
- `/api/teams/1`: team details and game name.
- `/api/predictions?user_id=demo-user`: saved predictions.
- `/api/leaderboard`: points descending, then accuracy descending, then user ID for stable ties. Accuracy is a percentage rounded to two decimal places.

POST `/api/predictions` with `{"user_id":"demo-user","match_id":1,"predicted_winner_id":1}`. Returns id, user_id, match_id, predicted_winner_id and `message: "Prediction saved"`. Repeating a user/match pair updates the existing prediction. Unseen demo identities are created automatically. User IDs are strings as required by the contract; game, tournament, team, match and prediction IDs are integers. Both official participants must be known and the match must be upcoming with a future prediction deadline.

Featured bracket: matches 1 and 2 feed slots 1 and 2 of final match 3. Phantom (1) plays Nova (2); Titan (3) plays Vortex (4). With demo admin enabled, POST `/api/demo/resolve` with `{"match_id":1,"winner_id":1}`, then `{"match_id":2,"winner_id":3}`. The final now accepts predictions for teams 1 and 3. Resolve match 3 to set champion_id and complete the tournament. Replaying an identical result is safe; changing a recorded result returns 409. Advancement and result changes commit atomically. Hypothetical picks never alter the official bracket.

Correct semifinals earn 10 points and finals 20. Only completed matches count in accuracy; users with no resolved picks have zero accuracy. Seeded oracle/clutch/rookie users have 40/30/0 points from historical tournament 2. All scoring is computed on the server.

Errors use `{"error":"message"}`: 400 invalid input, 404 missing resource (including disabled demo administration), 409 locked prediction or conflicting result, and 500 unexpected failure without internal details.
