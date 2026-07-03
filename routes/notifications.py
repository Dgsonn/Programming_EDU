from flask import Blueprint, jsonify, request
from db import get_db
from utils import api_login_required, current_user_id

notif_bp = Blueprint('notifications', __name__)


# ───────────────────────── Cài đặt thông báo ─────────────────────────
# Bảng notification_settings (trước đây tên "notifications" — đã đổi tên theo ERD).

@notif_bp.route('/api/notifications', methods=['GET'])
@api_login_required
def get_notifications():
    uid  = current_user_id()
    conn = get_db()
    row  = conn.execute('SELECT * FROM notification_settings WHERE user_id=%s', (uid,)).fetchone()
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
        '''INSERT INTO notification_settings
               (user_id, email_notif, push_notif, study_remind, content_update)
           VALUES (%s,%s,%s,%s,%s)
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


# ───────────────────────── Dòng thông báo (feed) ─────────────────────────
# Bảng notifications (feed) — hiện lên chuông. Tạo tự động khi user được @mention.

@notif_bp.route('/api/notifications/feed', methods=['GET'])
@api_login_required
def list_feed():
    uid  = current_user_id()
    conn = get_db()
    rows = conn.execute(
        '''SELECT id, type, title, body, ref_type, ref_id, is_read, created_at
           FROM notifications WHERE user_id=%s
           ORDER BY created_at DESC LIMIT 30''',
        (uid,)
    ).fetchall()
    unread = conn.execute(
        'SELECT COUNT(*) AS n FROM notifications WHERE user_id=%s AND is_read=FALSE', (uid,)
    ).fetchone()['n']
    conn.close()
    return jsonify({'items': [dict(r) for r in rows], 'unread': unread})


@notif_bp.route('/api/notifications/feed/<int:notif_id>/read', methods=['POST'])
@api_login_required
def mark_read(notif_id):
    uid  = current_user_id()
    conn = get_db()
    conn.execute(
        'UPDATE notifications SET is_read=TRUE WHERE id=%s AND user_id=%s', (notif_id, uid)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@notif_bp.route('/api/notifications/feed/read-all', methods=['POST'])
@api_login_required
def mark_all_read():
    uid  = current_user_id()
    conn = get_db()
    conn.execute(
        'UPDATE notifications SET is_read=TRUE WHERE user_id=%s AND is_read=FALSE', (uid,)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})
