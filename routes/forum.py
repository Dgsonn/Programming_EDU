from flask import Blueprint, jsonify, request
from db import get_db
from utils import api_login_required, current_user_id, _is_admin

forum_bp = Blueprint('forum', __name__)

_CATEGORIES = ('question', 'share', 'discuss')


def _paging():
    """Đọc page/per_page từ query string, trả (page, per_page, offset)."""
    page = max(1, request.args.get('page', 1, type=int))
    per_page = min(50, max(1, request.args.get('per_page', 10, type=int)))
    return page, per_page, (page - 1) * per_page


def _can_modify(conn, table, row_id):
    """Trả (row, error_response). Chủ sở hữu HOẶC admin mới được sửa/xóa."""
    row = conn.execute(f'SELECT user_id FROM {table} WHERE id=%s', (row_id,)).fetchone()
    if not row:
        label = 'bài viết' if table == 'posts' else 'bình luận'
        return None, (jsonify({'error': f'Không tìm thấy {label}'}), 404)
    uid = current_user_id()
    if row['user_id'] != uid and not _is_admin(uid):
        return None, (jsonify({'error': 'Không có quyền chỉnh sửa nội dung này'}), 403)
    return row, None


# ───────────────────────── Bài viết ─────────────────────────

@forum_bp.route('/api/posts', methods=['GET'])
@api_login_required
def list_posts():
    page, per_page, offset = _paging()
    category = (request.args.get('category') or '').strip()
    sort = request.args.get('sort', 'newest')

    where = ''
    params = []
    if category and category in _CATEGORIES:
        where = 'WHERE p.category = %s'
        params.append(category)

    order = {
        'oldest': 'p.created_at ASC',
        'likes':  'p.like_count DESC, p.created_at DESC',
    }.get(sort, 'p.created_at DESC')

    conn = get_db()
    try:
        count_where = where.replace('p.', '')
        total = conn.execute(
            f'SELECT COUNT(*) AS n FROM posts {count_where}', tuple(params)
        ).fetchone()['n']

        rows = conn.execute(
            f'''SELECT p.id, p.user_id, p.category, p.title, p.content,
                       p.like_count, p.created_at, p.updated_at,
                       u.name AS author_name
                FROM posts p
                LEFT JOIN users u ON u.id = p.user_id
                {where}
                ORDER BY {order}
                LIMIT %s OFFSET %s''',
            tuple(params) + (per_page, offset)
        ).fetchall()
    finally:
        conn.close()

    return jsonify({
        'posts': [dict(r) for r in rows],
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': (total + per_page - 1) // per_page,
    })


@forum_bp.route('/api/posts', methods=['POST'])
@api_login_required
def create_post():
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    category = data.get('category', 'discuss')
    if category not in _CATEGORIES:
        category = 'discuss'
    title = (data.get('title') or '').strip()

    conn = get_db()
    try:
        row = conn.execute(
            '''INSERT INTO posts (user_id, category, title, content)
               VALUES (%s, %s, %s, %s) RETURNING id''',
            (current_user_id(), category, title, content)
        ).fetchone()
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True, 'id': row['id']})


@forum_bp.route('/api/posts/<int:post_id>', methods=['GET'])
@api_login_required
def get_post(post_id):
    conn = get_db()
    row = conn.execute(
        '''SELECT p.id, p.user_id, p.category, p.title, p.content,
                  p.like_count, p.created_at, p.updated_at,
                  u.name AS author_name
           FROM posts p
           LEFT JOIN users u ON u.id = p.user_id
           WHERE p.id = %s''',
        (post_id,)
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Không tìm thấy bài viết'}), 404
    return jsonify(dict(row))


@forum_bp.route('/api/posts/<int:post_id>', methods=['PUT'])
@api_login_required
def update_post(post_id):
    data = request.get_json(silent=True) or {}
    fields = {}
    if 'title' in data:
        fields['title'] = (data.get('title') or '').strip()
    if 'content' in data:
        content = (data.get('content') or '').strip()
        if not content:
            return jsonify({'error': 'Nội dung không được để trống'}), 400
        fields['content'] = content
    if 'category' in data:
        category = data.get('category')
        if category not in _CATEGORIES:
            return jsonify({'error': 'Danh mục không hợp lệ'}), 400
        fields['category'] = category
    if not fields:
        return jsonify({'error': 'Không có dữ liệu để cập nhật'}), 400

    conn = get_db()
    try:
        _, err = _can_modify(conn, 'posts', post_id)
        if err:
            return err
        set_clause = ', '.join(f'{col}=%s' for col in fields)
        conn.execute(
            f'UPDATE posts SET {set_clause}, updated_at=now() WHERE id=%s',
            tuple(fields.values()) + (post_id,)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@forum_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@api_login_required
def delete_post(post_id):
    conn = get_db()
    try:
        _, err = _can_modify(conn, 'posts', post_id)
        if err:
            return err
        conn.execute('DELETE FROM posts WHERE id=%s', (post_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


# ───────────────────────── Bình luận ─────────────────────────

@forum_bp.route('/api/posts/<int:post_id>/comments', methods=['GET'])
@api_login_required
def list_comments(post_id):
    page, per_page, offset = _paging()
    conn = get_db()
    try:
        post = conn.execute('SELECT id FROM posts WHERE id=%s', (post_id,)).fetchone()
        if not post:
            return jsonify({'error': 'Không tìm thấy bài viết'}), 404

        total = conn.execute(
            'SELECT COUNT(*) AS n FROM comments WHERE post_id=%s', (post_id,)
        ).fetchone()['n']

        rows = conn.execute(
            '''SELECT c.id, c.post_id, c.user_id, c.content,
                      c.created_at, c.updated_at, u.name AS author_name
               FROM comments c
               LEFT JOIN users u ON u.id = c.user_id
               WHERE c.post_id = %s
               ORDER BY c.created_at ASC
               LIMIT %s OFFSET %s''',
            (post_id, per_page, offset)
        ).fetchall()
    finally:
        conn.close()

    return jsonify({
        'comments': [dict(r) for r in rows],
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': (total + per_page - 1) // per_page,
    })


@forum_bp.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@api_login_required
def create_comment(post_id):
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    conn = get_db()
    try:
        post = conn.execute('SELECT id FROM posts WHERE id=%s', (post_id,)).fetchone()
        if not post:
            return jsonify({'error': 'Không tìm thấy bài viết'}), 404
        row = conn.execute(
            '''INSERT INTO comments (post_id, user_id, content)
               VALUES (%s, %s, %s) RETURNING id''',
            (post_id, current_user_id(), content)
        ).fetchone()
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True, 'id': row['id']})


@forum_bp.route('/api/comments/<int:comment_id>', methods=['PUT'])
@api_login_required
def update_comment(comment_id):
    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()
    if not content:
        return jsonify({'error': 'Nội dung không được để trống'}), 400

    conn = get_db()
    try:
        _, err = _can_modify(conn, 'comments', comment_id)
        if err:
            return err
        conn.execute(
            'UPDATE comments SET content=%s, updated_at=now() WHERE id=%s',
            (content, comment_id)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@forum_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@api_login_required
def delete_comment(comment_id):
    conn = get_db()
    try:
        _, err = _can_modify(conn, 'comments', comment_id)
        if err:
            return err
        conn.execute('DELETE FROM comments WHERE id=%s', (comment_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})
