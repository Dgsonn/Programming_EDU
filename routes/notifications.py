from flask import Blueprint, jsonify, request
from models import get_db

notif_bp = Blueprint('notifications', __name__)


@notif_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    conn = get_db()
    row  = conn.execute('SELECT * FROM notifications WHERE user_id=1').fetchone()
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
def update_notifications():
    data = request.get_json()
    conn = get_db()
    conn.execute(
        '''INSERT INTO notifications VALUES (1,?,?,?,?)
           ON CONFLICT(user_id) DO UPDATE SET
             email_notif=excluded.email_notif,
             push_notif=excluded.push_notif,
             study_remind=excluded.study_remind,
             content_update=excluded.content_update''',
        (
            int(data.get('emailNotif', True)),
            int(data.get('pushNotif', False)),
            int(data.get('studyRemind', True)),
            int(data.get('contentUpdate', False))
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
