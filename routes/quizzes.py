"""
routes/quizzes.py
─────────────────────────────────────────────────────────────
FE-06: Quiz ôn tập cấp khóa học.

POST /api/courses/<course_id>/quiz/generate
  Body (optional): { "num_questions": 8 }  # clamp 5-10
  Sinh ngẫu nhiên N câu MCQ từ content_json->'step_2' của các bài
  user đã completed trong khóa; lưu SNAPSHOT vào quizzes.questions_json.
  Response KHÔNG chứa field "correct" (đáp án chỉ backend biết).

POST /api/quizzes/<quiz_id>/submit
  Body: { "answers": [ { "question_no": 1, "selected": "b" }, ... ] }
  Backend tự chấm bằng snapshot đã lưu — không tin điểm FE gửi lên.
  Mỗi quiz chỉ nộp 1 lần (nộp lại → 409).
"""
import random

from flask import Blueprint, jsonify, request
from psycopg2.extras import Json

from db import get_db
from utils import api_login_required, current_user_id

quizzes_bp = Blueprint('quizzes', __name__)

MIN_QUESTIONS = 5
MAX_QUESTIONS = 10
DEFAULT_QUESTIONS = 8


@quizzes_bp.route('/api/courses/<course_id>/quiz/generate', methods=['POST'])
@api_login_required
def generate_quiz(course_id):
    data = request.get_json(silent=True) or {}
    num_questions = data.get('num_questions')
    if not isinstance(num_questions, int):
        num_questions = DEFAULT_QUESTIONS
    num_questions = max(MIN_QUESTIONS, min(MAX_QUESTIONS, num_questions))

    uid  = current_user_id()
    conn = get_db()
    try:
        course = conn.execute(
            'SELECT id FROM courses WHERE id=%s', (course_id,)
        ).fetchone()
        if not course:
            return jsonify({'error': 'Không tìm thấy khóa học'}), 404

        # step_2 của các bài user đã completed trong khóa này.
        # Toán tử JSONB "?" (tồn tại key) phải escape thành "??" vì psycopg2
        # dùng %s paramstyle — nhưng wrapper conn.execute không đụng dấu ?,
        # nên dùng hàm tương đương jsonb_exists() cho an toàn.
        rows = conn.execute(
            '''SELECT l.id AS lesson_id, l.lesson_code,
                      l.content_json->'step_2' AS q
               FROM lessons l
               JOIN lesson_progress lp
                 ON lp.lesson_id = l.id AND lp.user_id = %s
                AND lp.status = 'completed'
               WHERE l.course_id = %s
                 AND l.content_json IS NOT NULL
                 AND jsonb_exists(l.content_json, 'step_2')''',
            (uid, course_id)
        ).fetchall()

        # Gom pool câu hỏi. step_2 có 2 dạng dữ liệu:
        #   - dạng thật (lesson_content*.js): {"mcq": [{question, options}, ...]}
        #   - dạng spec FE-06 gốc:            {question, options}
        pool = []

        def _add(lesson, q):
            if isinstance(q, dict) and q.get('question') and isinstance(q.get('options'), list):
                pool.append({
                    'lesson_id':   lesson['lesson_id'],
                    'lesson_code': lesson['lesson_code'],
                    'question':    q['question'],
                    'options':     q['options'],
                })

        for r in rows:
            s2 = r['q']
            if not isinstance(s2, dict):
                continue
            if isinstance(s2.get('mcq'), list):
                for item in s2['mcq']:
                    _add(r, item)
            else:
                _add(r, s2)

        if len(pool) < MIN_QUESTIONS:
            return jsonify({
                'error': 'Cần hoàn thành ít nhất 5 bài có câu hỏi để tạo quiz ôn tập.',
                'available': len(pool),
            }), 400

        n = min(num_questions, len(pool))
        picked = random.sample(pool, n)
        questions = [
            {
                'question_no': i + 1,
                'lesson_id':   p['lesson_id'],
                'lesson_code': p['lesson_code'],
                'question':    p['question'],
                'options':     p['options'],
            }
            for i, p in enumerate(picked)
        ]

        row = conn.execute(
            '''INSERT INTO quizzes (user_id, course_id, status, questions_json)
               VALUES (%s, %s, 'generated', %s) RETURNING id''',
            (uid, course_id, Json(questions))
        ).fetchone()
        conn.commit()
        quiz_id = row['id']
    finally:
        conn.close()

    # PHẢI lọc bỏ field "correct" trước khi trả cho FE
    safe_questions = [
        {
            'question_no': q['question_no'],
            'lesson_code': q['lesson_code'],
            'question':    q['question'],
            'options':     [{'id': o.get('id'), 'text': o.get('text')}
                            for o in q['options']],
        }
        for q in questions
    ]
    return jsonify({
        'quiz_id':   quiz_id,
        'course_id': course_id,
        'total':     len(safe_questions),
        'questions': safe_questions,
    })


@quizzes_bp.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@api_login_required
def submit_quiz(quiz_id):
    data    = request.get_json(silent=True) or {}
    answers = data.get('answers')
    if not isinstance(answers, list):
        return jsonify({'error': 'Thiếu hoặc sai định dạng answers'}), 400

    # map question_no -> selected (bỏ qua entry sai định dạng)
    selected_by_no = {}
    for a in answers:
        if isinstance(a, dict) and isinstance(a.get('question_no'), int):
            selected_by_no[a['question_no']] = a.get('selected')

    uid  = current_user_id()
    conn = get_db()
    try:
        quiz = conn.execute(
            'SELECT id, user_id, status, questions_json FROM quizzes WHERE id=%s',
            (quiz_id,)
        ).fetchone()
        if not quiz:
            return jsonify({'error': 'Không tìm thấy quiz'}), 404
        if quiz['user_id'] != uid:
            return jsonify({'error': 'Quiz này không thuộc về bạn'}), 403
        if quiz['status'] == 'submitted':
            return jsonify({'error': 'Quiz này đã nộp rồi'}), 409

        questions = quiz['questions_json'] or []
        score  = 0
        review = []
        answers_json = []
        for q in questions:
            qno      = q.get('question_no')
            selected = selected_by_no.get(qno)
            correct_answer = next(
                (o.get('id') for o in q.get('options', []) if o.get('correct')),
                None
            )
            # explanation của option user chọn (nếu có) — dữ liệu thật kèm
            # giải thích từng đáp án, FE dùng cho màn hình review
            explanation = next(
                (o.get('explanation') for o in q.get('options', [])
                 if o.get('id') == (selected if selected is not None else correct_answer)),
                None
            )
            is_correct = selected is not None and selected == correct_answer
            if is_correct:
                score += 1
            review.append({
                'question_no':    qno,
                'question':       q.get('question'),
                'your_answer':    selected,
                'correct_answer': correct_answer,
                'is_correct':     is_correct,
                'explanation':    explanation,
            })
            answers_json.append({
                'question_no':    qno,
                'question':       q.get('question'),
                'selected':       selected,
                'correct_answer': correct_answer,
                'is_correct':     is_correct,
            })

        total = len(questions)
        conn.execute(
            '''INSERT INTO review_quiz_results (quiz_id, user_id, score, total, answers_json)
               VALUES (%s, %s, %s, %s, %s)''',
            (quiz_id, uid, score, total, Json(answers_json))
        )
        conn.execute(
            "UPDATE quizzes SET status='submitted' WHERE id=%s", (quiz_id,)
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({
        'score':      score,
        'total':      total,
        'percentage': round(score * 100 / total) if total else 0,
        'review':     review,
    })


@quizzes_bp.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
@api_login_required
def get_quiz(quiz_id):
    """Đọc lại 1 quiz của chính user — kèm kết quả nếu đã nộp (FE reload
    màn review không mất dữ liệu). Quiz chưa nộp thì trả câu hỏi ĐÃ LỌC đáp án."""
    uid  = current_user_id()
    conn = get_db()
    try:
        quiz = conn.execute(
            'SELECT id, user_id, course_id, status, questions_json, created_at '
            'FROM quizzes WHERE id=%s', (quiz_id,)
        ).fetchone()
        if not quiz or quiz['user_id'] != uid:
            # 404 cho cả quiz người khác — không lộ quiz nào tồn tại
            return jsonify({'error': 'Không tìm thấy quiz'}), 404

        out = {
            'quiz_id':    quiz['id'],
            'course_id':  quiz['course_id'],
            'status':     quiz['status'],
            'created_at': quiz['created_at'].isoformat() if quiz['created_at'] else None,
        }
        if quiz['status'] == 'submitted':
            result = conn.execute(
                '''SELECT score, total, answers_json, submitted_at
                   FROM review_quiz_results WHERE quiz_id=%s
                   ORDER BY submitted_at DESC LIMIT 1''', (quiz_id,)
            ).fetchone()
            if result:
                out['result'] = {
                    'score':        result['score'],
                    'total':        result['total'],
                    'percentage':   round(result['score'] * 100 / result['total'])
                                    if result['total'] else 0,
                    'review':       result['answers_json'],
                    'submitted_at': result['submitted_at'].isoformat()
                                    if result['submitted_at'] else None,
                }
        else:
            out['questions'] = [
                {
                    'question_no': q.get('question_no'),
                    'lesson_code': q.get('lesson_code'),
                    'question':    q.get('question'),
                    'options':     [{'id': o.get('id'), 'text': o.get('text')}
                                    for o in q.get('options', [])],
                }
                for q in (quiz['questions_json'] or [])
            ]
            out['total'] = len(quiz['questions_json'] or [])
        return jsonify(out)
    finally:
        conn.close()


@quizzes_bp.route('/api/courses/<course_id>/quiz/history', methods=['GET'])
@api_login_required
def quiz_history(course_id):
    """Lịch sử các lượt quiz ôn tập đã nộp của user trong 1 khóa."""
    uid  = current_user_id()
    conn = get_db()
    try:
        rows = conn.execute(
            '''SELECT r.quiz_id, r.score, r.total, r.submitted_at
               FROM review_quiz_results r
               JOIN quizzes q ON q.id = r.quiz_id
               WHERE r.user_id = %s AND q.course_id = %s
               ORDER BY r.submitted_at DESC
               LIMIT 50''',
            (uid, course_id)
        ).fetchall()
        return jsonify({'history': [
            {
                'quiz_id':      r['quiz_id'],
                'score':        r['score'],
                'total':        r['total'],
                'percentage':   round(r['score'] * 100 / r['total']) if r['total'] else 0,
                'submitted_at': r['submitted_at'].isoformat() if r['submitted_at'] else None,
            }
            for r in rows
        ]})
    finally:
        conn.close()
