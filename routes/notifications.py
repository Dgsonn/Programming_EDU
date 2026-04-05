from flask import Blueprint, jsonify, request
from models import get_db
from utils import api_login_required, current_user_id

notif_bp = Blueprint('notifications', __name__)


@notif_bp.route('/api/notifications', methods=['GET'])
@api_login_required
def get_notifications():
    uid  = current_user_id()
    conn = get_db()
    row  = conn.execute('SELECT * FROM notifications WHERE user_id=?', (uid,)).fetchone()
    conn.close()
    if not row:
        return jsonify({'emailNotif': True, 'pushNotif': False, 'studyRemind': True, 'contentUpdate': False})
    return jsonify({
        'emailNotif':    bool(row['email_notif']),
        'pushNotif':     bool(row['push_notif']),
        'studyRemind':   bool(row['study_remind']),
        'contentUpdate': bool(row['content_update'])
    })


@notif_bp.route('/api/notifications', methods=['PUT'])
@api_login_required
def update_notifications():
    uid  = current_user_id()
    data = request.get_json()
    conn = get_db()
    conn.execute(
        '''INSERT INTO notifications VALUES (?,?,?,?,?)
           ON CONFLICT(user_id) DO UPDATE SET
             email_notif=excluded.email_notif,
             push_notif=excluded.push_notif,
             study_remind=excluded.study_remind,
             content_update=excluded.content_update''',
        (uid,
         int(data.get('emailNotif', True)),
         int(data.get('pushNotif', False)),
         int(data.get('studyRemind', True)),
         int(data.get('contentUpdate', False)))
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
