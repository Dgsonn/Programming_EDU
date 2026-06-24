from flask import Blueprint, jsonify, request, render_template
from db import get_db
from utils import admin_required, api_admin_required

admin_bp = Blueprint('admin', __name__)


# ───────────────────────── Trang quản trị ─────────────────────────

@admin_bp.route('/admin')
@admin_required
def admin_page():
    return render_template('admin.html')


def _sync_lesson_count(conn, course_id):
    """Đồng bộ cột courses.lessons với số bài giảng thực tế."""
    conn.execute(
        'UPDATE courses SET lessons = '
        '(SELECT COUNT(*) FROM lessons WHERE course_id=%s) WHERE id=%s',
        (course_id, course_id)
    )


# ───────────────────────── CRUD khóa học ─────────────────────────

_COURSE_FIELDS = (
    'title', 'subtitle', 'description', 'image', 'level',
    'duration', 'students', 'color', 'accent_color', 'tag',
)


@admin_bp.route('/api/admin/courses', methods=['GET'])
@api_admin_required
def list_courses():
    conn = get_db()
    rows = conn.execute('SELECT * FROM courses ORDER BY id').fetchall()
    conn.close()
    return jsonify({'courses': [dict(r) for r in rows]})


@admin_bp.route('/api/admin/courses', methods=['POST'])
@api_admin_required
def create_course():
    data = request.get_json(silent=True) or {}
    course_id = (data.get('id') or '').strip()
    title = (data.get('title') or '').strip()

    if not course_id:
        return jsonify({'error': 'Thiếu id khóa học'}), 400
    if not title:
        return jsonify({'error': 'Thiếu tiêu đề khóa học'}), 400

    conn = get_db()
    try:
        if conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone():
            return jsonify({'error': 'Id khóa học đã tồn tại'}), 400

        cols = ['id', 'title'] + [f for f in _COURSE_FIELDS if f != 'title']
        vals = [course_id, title] + [data.get(f) for f in _COURSE_FIELDS if f != 'title']
        placeholders = ', '.join(['%s'] * len(cols))
        conn.execute(
            f'INSERT INTO courses ({", ".join(cols)}) VALUES ({placeholders})',
            tuple(vals)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@admin_bp.route('/api/admin/courses/<course_id>', methods=['PUT'])
@api_admin_required
def update_course(course_id):
    data = request.get_json(silent=True) or {}
    updates = {f: data[f] for f in _COURSE_FIELDS if f in data}
    if not updates:
        return jsonify({'error': 'Không có dữ liệu để cập nhật'}), 400

    conn = get_db()
    try:
        if not conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone():
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        set_clause = ', '.join(f'{col}=%s' for col in updates)
        conn.execute(
            f'UPDATE courses SET {set_clause} WHERE id=%s',
            tuple(updates.values()) + (course_id,)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@admin_bp.route('/api/admin/courses/<course_id>', methods=['DELETE'])
@api_admin_required
def delete_course(course_id):
    conn = get_db()
    try:
        if not conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone():
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        enrolled = conn.execute(
            'SELECT 1 FROM enrollments WHERE course_id=%s LIMIT 1', (course_id,)
        ).fetchone()
        if enrolled:
            return jsonify({'error': 'Không thể xóa: vẫn còn học viên đăng ký khóa học này'}), 409

        conn.execute('DELETE FROM courses WHERE id=%s', (course_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


# ───────────────────────── CRUD bài giảng ─────────────────────────

@admin_bp.route('/api/admin/courses/<course_id>/lessons', methods=['GET'])
@api_admin_required
def list_lessons(course_id):
    conn = get_db()
    rows = conn.execute(
        'SELECT * FROM lessons WHERE course_id=%s ORDER BY sort_order, id',
        (course_id,)
    ).fetchall()
    conn.close()
    return jsonify({'lessons': [dict(r) for r in rows]})


@admin_bp.route('/api/admin/lessons', methods=['POST'])
@api_admin_required
def create_lesson():
    data = request.get_json(silent=True) or {}
    course_id = (data.get('course_id') or '').strip()
    title = (data.get('title') or '').strip()

    if not course_id:
        return jsonify({'error': 'Thiếu course_id'}), 400
    if not title:
        return jsonify({'error': 'Thiếu tiêu đề bài giảng'}), 400

    conn = get_db()
    try:
        if not conn.execute('SELECT id FROM courses WHERE id=%s', (course_id,)).fetchone():
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        conn.execute(
            'INSERT INTO lessons (course_id, module, title, content, sort_order) '
            'VALUES (%s, %s, %s, %s, %s)',
            (course_id, data.get('module', ''), title,
             data.get('content', ''), data.get('sort_order', 0))
        )
        _sync_lesson_count(conn, course_id)
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@admin_bp.route('/api/admin/lessons/<int:lesson_id>', methods=['PUT'])
@api_admin_required
def update_lesson(lesson_id):
    data = request.get_json(silent=True) or {}
    fields = ('module', 'title', 'content', 'sort_order')
    updates = {f: data[f] for f in fields if f in data}
    if not updates:
        return jsonify({'error': 'Không có dữ liệu để cập nhật'}), 400
    if 'title' in updates and not (updates['title'] or '').strip():
        return jsonify({'error': 'Tiêu đề bài giảng không được để trống'}), 400

    conn = get_db()
    try:
        if not conn.execute('SELECT id FROM lessons WHERE id=%s', (lesson_id,)).fetchone():
            return jsonify({'error': 'Không tìm thấy bài giảng'}), 404

        set_clause = ', '.join(f'{col}=%s' for col in updates)
        conn.execute(
            f'UPDATE lessons SET {set_clause} WHERE id=%s',
            tuple(updates.values()) + (lesson_id,)
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})


@admin_bp.route('/api/admin/lessons/<int:lesson_id>', methods=['DELETE'])
@api_admin_required
def delete_lesson(lesson_id):
    conn = get_db()
    try:
        row = conn.execute('SELECT course_id FROM lessons WHERE id=%s', (lesson_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Không tìm thấy bài giảng'}), 404

        conn.execute('DELETE FROM lessons WHERE id=%s', (lesson_id,))
        _sync_lesson_count(conn, row['course_id'])
        conn.commit()
    finally:
        conn.close()
    return jsonify({'ok': True})
