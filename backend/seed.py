"""Fictional demo data; repeated seeding preserves predictions and results."""
from datetime import datetime, timedelta, timezone
from database import DEFAULT_DATABASE, connect, init_db


def timestamp(value):
    return value.astimezone(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')


def seed_db(path=DEFAULT_DATABASE):
    init_db(path)
    now = datetime.now(timezone.utc)
    db = connect(path)
    try:
        with db:
            # One transaction and marker prevent partial or repeated demo insertion.
            db.execute('BEGIN IMMEDIATE')
            if db.execute('SELECT 1 FROM tournaments WHERE id=1').fetchone():
                return
            games = ['Valorant', 'League of Legends', 'Counter-Strike 2', 'Rocket League']
            for i, name in enumerate(games, 1):
                db.execute('INSERT INTO games VALUES (?,?,?)', (i, name, name.lower().replace(' ', '-')))
            for user in ['demo-user', 'oracle', 'clutch', 'rookie']:
                db.execute('INSERT INTO users VALUES (?,?,?)', (user, user, timestamp(now)))
            names = ['Twitch Arena Championship', 'Rift Legends Cup', 'Strike Masters', 'Rocket Rally']
            for i, name in enumerate(names, 1):
                completed = i == 2
                start = now + timedelta(days=-7 if completed else i + 2)
                db.execute('INSERT INTO tournaments VALUES (?,?,?,?,?,?,1,NULL)',
                           (i, name, i, 'completed' if completed else 'upcoming', timestamp(start), timestamp(start + timedelta(hours=6))))
                team_names = ['Phantom', 'Nova', 'Titan', 'Vortex'] if i == 1 else [f'{prefix} {suffix}' for prefix, suffix in zip(['Crimson', 'Solar', 'Arctic', 'Neon'], ['Wolves', 'Hawks', 'Dragons', 'Foxes'])]
                ids = []
                for j, team in enumerate(team_names):
                    tid = (i - 1) * 4 + j + 1
                    ids.append(tid)
                    db.execute('INSERT INTO teams VALUES (?,?,?,?,?,?)', (tid, team, i, ['NA','EU','APAC','NA'][j], 12-j*2, 3+j))
                    db.execute('INSERT INTO tournament_teams VALUES (?,?)', (i, tid))
                base = (i - 1) * 3
                # Insert final first to satisfy advancement foreign keys.
                for offset, round_name, order, slot, t1, t2, dest_slot in [
                    (3, 'final', 2, 1, ids[0] if completed else None, ids[2] if completed else None, None),
                    (1, 'semifinal', 1, 1, ids[0], ids[1], 1),
                    (2, 'semifinal', 1, 2, ids[2], ids[3], 2)]:
                    scheduled = start + timedelta(hours=4 if offset == 3 else offset-1)
                    db.execute('INSERT INTO matches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                               (base+offset, i, round_name, order, slot, t1, t2, t1 if completed else None,
                                'completed' if completed else 'upcoming', timestamp(scheduled), timestamp(scheduled),
                                base+3 if dest_slot else None, dest_slot))
                if completed:
                    db.execute('UPDATE tournaments SET champion_id=? WHERE id=?', (ids[0], i))
            for user, picks in [('oracle', [5,7,5]), ('clutch', [5,8,5]), ('rookie', [6,8,7])]:
                for match, pick in zip([4,5,6], picks):
                    db.execute('INSERT INTO predictions(user_id,match_id,predicted_winner_id,created_at) VALUES (?,?,?,?)', (user, match, pick, timestamp(now-timedelta(days=8))))
    finally:
        db.close()


if __name__ == '__main__':
    import os
    seed_db(os.getenv('DATABASE_PATH', DEFAULT_DATABASE))
