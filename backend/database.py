"""SQLite connections and idempotent schema initialization."""
import sqlite3
from pathlib import Path

DEFAULT_DATABASE = str(Path(__file__).with_name('arena.sqlite3'))


def connect(path=DEFAULT_DATABASE):
    db = sqlite3.connect(path, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys = ON')
    return db


def init_db(path=DEFAULT_DATABASE):
    db = connect(path)
    try:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE);
        CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, game_id INTEGER NOT NULL REFERENCES games(id),
            status TEXT NOT NULL CHECK(status IN ('upcoming','live','completed')),
            start_time TEXT NOT NULL, end_time TEXT NOT NULL,
            is_demo INTEGER NOT NULL DEFAULT 1 CHECK(is_demo IN (0,1)),
            champion_id INTEGER REFERENCES teams(id));
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL, game_id INTEGER NOT NULL REFERENCES games(id),
            region TEXT NOT NULL, wins INTEGER NOT NULL CHECK(wins >= 0),
            losses INTEGER NOT NULL CHECK(losses >= 0), UNIQUE(name,game_id));
        CREATE TABLE IF NOT EXISTS tournament_teams (
            tournament_id INTEGER REFERENCES tournaments(id), team_id INTEGER REFERENCES teams(id),
            PRIMARY KEY(tournament_id,team_id));
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY, tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
            round TEXT NOT NULL CHECK(round IN ('semifinal','final')),
            round_order INTEGER NOT NULL CHECK(round_order > 0), slot INTEGER NOT NULL CHECK(slot > 0),
            team1_id INTEGER REFERENCES teams(id), team2_id INTEGER REFERENCES teams(id),
            winner_id INTEGER REFERENCES teams(id),
            status TEXT NOT NULL CHECK(status IN ('upcoming','live','completed')),
            scheduled_at TEXT NOT NULL, prediction_deadline TEXT NOT NULL,
            next_match_id INTEGER REFERENCES matches(id), next_slot INTEGER CHECK(next_slot IN (1,2)),
            UNIQUE(tournament_id,round_order,slot), UNIQUE(next_match_id,next_slot),
            CHECK(team1_id IS NULL OR team2_id IS NULL OR team1_id != team2_id),
            CHECK((next_match_id IS NULL) = (next_slot IS NULL)),
            CHECK((status = 'completed' AND winner_id IS NOT NULL AND team1_id IS NOT NULL
                   AND team2_id IS NOT NULL AND winner_id IN (team1_id,team2_id))
                  OR (status != 'completed' AND winner_id IS NULL)),
            FOREIGN KEY(tournament_id,team1_id) REFERENCES tournament_teams(tournament_id,team_id),
            FOREIGN KEY(tournament_id,team2_id) REFERENCES tournament_teams(tournament_id,team_id));
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
            match_id INTEGER NOT NULL REFERENCES matches(id),
            predicted_winner_id INTEGER NOT NULL REFERENCES teams(id), created_at TEXT NOT NULL,
            UNIQUE(user_id,match_id));
        CREATE INDEX IF NOT EXISTS tournaments_game_status ON tournaments(game_id,status);
        CREATE INDEX IF NOT EXISTS teams_game ON teams(game_id);
        CREATE INDEX IF NOT EXISTS matches_tournament ON matches(tournament_id,round_order,slot);
        CREATE INDEX IF NOT EXISTS predictions_match ON predictions(match_id);
        ''')
    finally:
        db.close()


if __name__ == '__main__':
    import os
    init_db(os.getenv('DATABASE_PATH', DEFAULT_DATABASE))
