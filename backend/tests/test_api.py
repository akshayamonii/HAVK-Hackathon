import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import create_app
from database import connect
from seed import seed_db


@pytest.fixture
def app(tmp_path):
    return create_app({'TESTING': True, 'DATABASE': str(tmp_path/'test.sqlite3'), 'DEMO_ADMIN_ENABLED': True})


@pytest.fixture
def client(app):
    return app.test_client()


def pick(client, match=1, winner=1, user='tester'):
    return client.post('/api/predictions', json={'user_id':user, 'match_id':match, 'predicted_winner_id':winner})


def resolve(client, match, winner):
    return client.post('/api/demo/resolve', json={'match_id':match,'winner_id':winner})


def test_health(client):
    assert client.get('/api/health').json == {'status':'ok'}


def test_games(client):
    assert len(client.get('/api/games').json) == 4
    assert client.get('/api/games').json[0]['slug'] == 'valorant'


def test_tournaments(client):
    rows = client.get('/api/tournaments').json
    assert len(rows) == 4 and all(t['is_demo'] is True and t['team_count'] == 4 for t in rows)
    assert len(client.get('/api/tournaments?game=valorant&status=upcoming&search=Championship').json) == 1
    assert client.get('/api/tournaments?search=%27%20OR%201=1--').json == []


def test_details(client):
    item = client.get('/api/tournaments/1').json
    assert item['name'] == 'Twitch Arena Championship' and len(item['teams']) == 4
    assert client.get('/api/tournaments/2').json['champion_id'] == 5


def test_matches(client):
    rows = client.get('/api/tournaments/1/matches').json
    assert [r['id'] for r in rows] == [1,2,3]
    assert rows[0]['team1'] == {'id':1,'name':'Phantom'}
    assert rows[2]['team1'] is None and rows[2]['team2'] is None
    assert rows[0]['next_match_id'] == 3 and rows[1]['next_slot'] == 2


def test_team(client):
    assert client.get('/api/teams/1').json['wins'] == 12


def test_save_and_update(client):
    first = pick(client).json
    assert first['message'] == 'Prediction saved'
    second = pick(client,winner=2).json
    assert first['id'] == second['id']
    saved = client.get('/api/predictions?user_id=tester').json
    assert len(saved) == 1 and saved[0]['predicted_winner_id'] == 2


def test_invalid_team(client):
    assert pick(client,winner=3).status_code == 400
    assert client.get('/api/predictions?user_id=tester').json == []


def test_completed_and_unknown_participants(client):
    assert pick(client,4,5).status_code == 409
    assert pick(client,3,1).status_code == 409


def test_deadline(app,client):
    connection = connect(app.config['DATABASE'])
    with connection:
        connection.execute("UPDATE matches SET prediction_deadline='2000-01-01T00:00:00Z' WHERE id=1")
    connection.close()
    assert pick(client).status_code == 409


def test_advancement_and_champion(client):
    assert pick(client).status_code == 200
    assert resolve(client,1,1).status_code == 200
    final = client.get('/api/tournaments/1/matches').json[2]
    assert final['team1']['id'] == 1 and final['team2'] is None
    assert resolve(client,2,4).status_code == 200
    final = client.get('/api/tournaments/1/matches').json[2]
    assert final['team2']['id'] == 4
    assert pick(client,3,4).status_code == 200
    assert resolve(client,3,4).status_code == 200
    tournament = client.get('/api/tournaments/1').json
    assert tournament['champion_id'] == 4 and tournament['status'] == 'completed'
    assert pick(client,3,4).status_code == 409


def test_invalid_and_repeated_results(client):
    assert resolve(client,1,3).status_code == 400
    assert resolve(client,3,1).status_code == 409
    assert resolve(client,1,1).status_code == 200
    assert resolve(client,1,1).status_code == 200
    assert resolve(client,1,2).status_code == 409
    assert client.get('/api/tournaments/1/matches').json[2]['team1']['id'] == 1


def test_conflicting_advancement_rolls_back(app,client):
    connection = connect(app.config['DATABASE'])
    with connection:
        connection.execute('UPDATE matches SET team1_id=2 WHERE id=3')
    connection.close()
    assert resolve(client,1,1).status_code == 409
    assert client.get('/api/tournaments/1/matches').json[0]['winner_id'] is None


def test_leaderboard_and_accuracy(client):
    rows = client.get('/api/leaderboard').json
    assert rows[0] == {'user_id':'oracle','username':'oracle','points':40,'correct_picks':3,'resolved_picks':3,'accuracy':100.0}
    clutch = next(r for r in rows if r['user_id']=='clutch')
    assert clutch['points'] == 30 and clutch['accuracy'] == 66.67
    assert pick(client).status_code == 200
    tester = next(r for r in client.get('/api/leaderboard').json if r['user_id']=='tester')
    assert tester['resolved_picks'] == 0 and tester['accuracy'] == 0
    resolve(client,1,1)
    tester = next(r for r in client.get('/api/leaderboard').json if r['user_id']=='tester')
    assert tester['points'] == 10 and tester['accuracy'] == 100


@pytest.mark.parametrize('path', ['/api/tournaments/999','/api/tournaments/999/matches','/api/teams/999','/api/teams/nope'])
def test_missing(client,path):
    response = client.get(path)
    assert response.status_code == 404 and 'error' in response.json


@pytest.mark.parametrize('data', [{}, {'user_id':'x','match_id':True,'predicted_winner_id':1}, {'user_id':'','match_id':1,'predicted_winner_id':1}, [], None])
def test_invalid_body(client,data):
    assert client.post('/api/predictions',json=data).status_code == 400


def test_malformed_and_missing_ids(client):
    assert client.post('/api/predictions',data='{',content_type='application/json').status_code == 400
    assert pick(client,999,1).status_code == 404
    assert resolve(client,999,1).status_code == 404
    assert client.get('/api/predictions').status_code == 400


def test_seed_idempotent(app,client):
    pick(client)
    resolve(client,1,1)
    before = client.get('/api/tournaments/1/matches').json
    seed_db(app.config['DATABASE'])
    assert client.get('/api/tournaments/1/matches').json == before
    assert len(client.get('/api/predictions?user_id=tester').json) == 1
    assert len(client.get('/api/tournaments').json) == 4


def test_admin_disabled(app):
    app.config['DEMO_ADMIN_ENABLED'] = False
    assert resolve(app.test_client(),1,1).status_code == 404


def test_cors(client):
    assert client.get('/api/health',headers={'Origin':'http://localhost:5173'}).headers['Access-Control-Allow-Origin'] == 'http://localhost:5173'
    assert 'Access-Control-Allow-Origin' not in client.get('/api/health',headers={'Origin':'https://unknown.example'}).headers
