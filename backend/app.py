"""Twitch Arena JSON API. Demo identities are not authentication."""
import os
import sqlite3
from datetime import datetime, timezone
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from database import DEFAULT_DATABASE, connect, init_db
from seed import seed_db, timestamp


class APIError(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_mapping(DATABASE=os.getenv('DATABASE_PATH', DEFAULT_DATABASE),
                            DEMO_ADMIN_ENABLED=os.getenv('DEMO_ADMIN_ENABLED', '').lower() == 'true',
                            SEED_DATA=True)
    app.config.update(config or {})
    init_db(app.config['DATABASE'])
    if app.config['SEED_DATA']:
        seed_db(app.config['DATABASE'])
    origins = ['http://localhost:5173', 'http://127.0.0.1:5173']
    origins.extend(x.strip() for x in os.getenv('FRONTEND_ORIGIN', '').split(',') if x.strip())
    CORS(app, resources={r'/api/*': {'origins': origins}})

    def db():
        if 'db' not in g:
            g.db = connect(app.config['DATABASE'])
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        connection = g.pop('db', None)
        if connection is not None:
            connection.close()

    @app.errorhandler(APIError)
    def api_error(error):
        return jsonify(error=error.message), error.status

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    @app.errorhandler(Exception)
    def unexpected(error):
        app.logger.exception('API request failed')
        return jsonify(error='Unexpected server failure'), 500

    def require_row(sql, args, name):
        row = db().execute(sql, args).fetchone()
        if row is None:
            raise APIError(f'{name} not found', 404)
        return row

    def body():
        value = request.get_json(silent=True)
        if not isinstance(value, dict):
            raise APIError('Request body must be a JSON object')
        return value

    def integer(value, name):
        if type(value) is not int or value <= 0:
            raise APIError(f'{name} must be a positive integer')
        return value

    def identity(value):
        if not isinstance(value, str) or not value.strip() or len(value) > 100:
            raise APIError('user_id must be a nonempty string of at most 100 characters')
        return value.strip()

    tournament_sql = '''SELECT t.*, g.name AS game, g.slug AS game_slug,
        (SELECT count(*) FROM tournament_teams tt WHERE tt.tournament_id=t.id) AS team_count
        FROM tournaments t JOIN games g ON g.id=t.game_id'''

    def tournament_dict(row):
        result = dict(row)
        result['is_demo'] = bool(result['is_demo'])
        return result

    @app.get('/api/health')
    def health():
        return jsonify(status='ok')

    @app.get('/api/games')
    def games():
        return jsonify([dict(r) for r in db().execute('SELECT * FROM games ORDER BY id')])

    @app.get('/api/tournaments')
    def tournaments():
        clauses, args = [], []
        for key, column in [('status','t.status'), ('search','t.name')]:
            if request.args.get(key):
                clauses.append(f'{column} ' + ('LIKE ?' if key == 'search' else '= ?'))
                args.append('%'+request.args[key]+'%' if key == 'search' else request.args[key])
        if request.args.get('game'):
            clauses.append('(g.slug=? OR g.name=? OR CAST(g.id AS TEXT)=?)')
            args.extend([request.args['game']]*3)
        sql = tournament_sql + (' WHERE '+' AND '.join(clauses) if clauses else '') + ' ORDER BY t.id'
        return jsonify([tournament_dict(r) for r in db().execute(sql, args)])

    @app.get('/api/tournaments/<int:tournament_id>')
    def tournament(tournament_id):
        result = tournament_dict(require_row(tournament_sql+' WHERE t.id=?', (tournament_id,), 'Tournament'))
        result['teams'] = [dict(r) for r in db().execute('SELECT teams.* FROM teams JOIN tournament_teams tt ON tt.team_id=teams.id WHERE tt.tournament_id=? ORDER BY teams.id', (tournament_id,))]
        return jsonify(result)

    @app.get('/api/tournaments/<int:tournament_id>/matches')
    def matches(tournament_id):
        require_row('SELECT id FROM tournaments WHERE id=?', (tournament_id,), 'Tournament')
        result = []
        for row in db().execute('SELECT * FROM matches WHERE tournament_id=? ORDER BY round_order,slot', (tournament_id,)):
            item = dict(row)
            for slot in (1,2):
                team = db().execute('SELECT id,name FROM teams WHERE id=?', (item[f'team{slot}_id'],)).fetchone()
                item[f'team{slot}'] = dict(team) if team else None
            result.append(item)
        return jsonify(result)

    @app.get('/api/teams/<int:team_id>')
    def team(team_id):
        return jsonify(dict(require_row('SELECT t.*,g.name AS game FROM teams t JOIN games g ON g.id=t.game_id WHERE t.id=?', (team_id,), 'Team')))

    @app.post('/api/predictions')
    def save_prediction():
        data = body()
        user = identity(data.get('user_id'))
        match_id = integer(data.get('match_id'), 'match_id')
        winner = integer(data.get('predicted_winner_id'), 'predicted_winner_id')
        connection = db()
        with connection:
            connection.execute('BEGIN IMMEDIATE')
            match = require_row('SELECT * FROM matches WHERE id=?', (match_id,), 'Match')
            if match['status'] != 'upcoming' or datetime.fromisoformat(match['prediction_deadline'].replace('Z','+00:00')) <= datetime.now(timezone.utc):
                raise APIError('Prediction locked', 409)
            if match['team1_id'] is None or match['team2_id'] is None:
                raise APIError('Official participants are not determined', 409)
            if winner not in (match['team1_id'], match['team2_id']):
                raise APIError('Predicted winner must be a match participant')
            now = timestamp(datetime.now(timezone.utc))
            connection.execute('INSERT INTO users VALUES (?,?,?) ON CONFLICT(id) DO NOTHING', (user,user,now))
            connection.execute('''INSERT INTO predictions(user_id,match_id,predicted_winner_id,created_at)
                VALUES (?,?,?,?) ON CONFLICT(user_id,match_id) DO UPDATE SET
                predicted_winner_id=excluded.predicted_winner_id''', (user,match_id,winner,now))
            result = dict(connection.execute('SELECT id,user_id,match_id,predicted_winner_id FROM predictions WHERE user_id=? AND match_id=?', (user,match_id)).fetchone())
        return jsonify(**result, message='Prediction saved')

    @app.get('/api/predictions')
    def predictions():
        user = identity(request.args.get('user_id'))
        return jsonify([dict(r) for r in db().execute('SELECT id,user_id,match_id,predicted_winner_id FROM predictions WHERE user_id=? ORDER BY match_id', (user,))])

    @app.get('/api/leaderboard')
    def leaderboard():
        rows = db().execute('''SELECT u.id AS user_id,u.username,
            COALESCE(SUM(CASE WHEN m.status='completed' AND p.predicted_winner_id=m.winner_id
                THEN CASE WHEN m.round='final' THEN 20 ELSE 10 END ELSE 0 END),0) AS points,
            SUM(CASE WHEN m.status='completed' AND p.predicted_winner_id=m.winner_id THEN 1 ELSE 0 END) AS correct_picks,
            SUM(CASE WHEN m.status='completed' THEN 1 ELSE 0 END) AS resolved_picks
            FROM users u LEFT JOIN predictions p ON p.user_id=u.id
            LEFT JOIN matches m ON m.id=p.match_id GROUP BY u.id''')
        result = []
        for row in rows:
            item = dict(row)
            item['accuracy'] = round(100*item['correct_picks']/item['resolved_picks'], 2) if item['resolved_picks'] else 0
            result.append(item)
        result.sort(key=lambda x: (-x['points'], -x['accuracy'], x['user_id']))
        return jsonify(result)

    @app.post('/api/demo/resolve')
    def resolve():
        if app.config['DEMO_ADMIN_ENABLED'] is not True:
            raise APIError('Resource not found', 404)
        data = body()
        match_id = integer(data.get('match_id'), 'match_id')
        winner = integer(data.get('winner_id'), 'winner_id')
        connection = db()
        with connection:
            connection.execute('BEGIN IMMEDIATE')
            match = require_row('SELECT * FROM matches WHERE id=?', (match_id,), 'Match')
            if match['status'] == 'completed':
                if match['winner_id'] != winner:
                    raise APIError('An official result cannot be changed', 409)
                return jsonify(match_id=match_id, winner_id=winner, message='Result already recorded')
            if match['team1_id'] is None or match['team2_id'] is None:
                raise APIError('Official participants are not determined', 409)
            if winner not in (match['team1_id'],match['team2_id']):
                raise APIError('Winner must be a match participant')
            if match['next_match_id'] is not None:
                target = require_row('SELECT * FROM matches WHERE id=?', (match['next_match_id'],), 'Destination match')
                column = f"team{match['next_slot']}_id"
                other = f"team{3-match['next_slot']}_id"
                if target['tournament_id'] != match['tournament_id'] or target['round_order'] <= match['round_order'] or target['status'] != 'upcoming' or target[column] not in (None,winner) or target[other] == winner:
                    raise APIError('Conflicting bracket state', 409)
                connection.execute(f'UPDATE matches SET {column}=? WHERE id=?', (winner,target['id']))
            elif match['round'] != 'final':
                raise APIError('Semifinal has no advancement destination', 409)
            connection.execute("UPDATE matches SET winner_id=?,status='completed' WHERE id=?", (winner,match_id))
            if match['round'] == 'final':
                connection.execute("UPDATE tournaments SET champion_id=?,status='completed' WHERE id=?", (winner,match['tournament_id']))
            else:
                connection.execute("UPDATE tournaments SET status='live' WHERE id=?", (match['tournament_id'],))
        return jsonify(match_id=match_id, winner_id=winner, message='Official result recorded')

    return app


if __name__ == '__main__':
    create_app().run(host='127.0.0.1', port=int(os.getenv('PORT', '5000')), debug=False)
