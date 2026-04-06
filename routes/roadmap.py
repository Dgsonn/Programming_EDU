from flask import Blueprint, jsonify, request
from models import get_db
from utils import api_login_required, current_user_id

roadmap_bp = Blueprint('roadmap', __name__)


@roadmap_bp.route('/api/roadmap', methods=['GET'])
@api_login_required
def get_roadmap():
    uid  = current_user_id()
    conn = get_db()
    rows = conn.execute(
        'SELECT item_id FROM roadmap_progress WHERE user_id=? AND done=1', (uid,)
    ).fetchall()
    conn.close()
    return jsonify({'doneItems': [r['item_id'] for r in rows]})


@roadmap_bp.route('/api/roadmap/<item_id>', methods=['PUT'])
@api_login_required
def update_roadmap(item_id):
    uid  = current_user_id()
    done = int(request.get_json().get('done', False))
    conn = get_db()
    conn.execute(
        '''INSERT INTO roadmap_progress VALUES (?,?,?)
           ON CONFLICT(user_id, item_id) DO UPDATE SET done=excluded.done''',
        (uid, item_id, done)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})