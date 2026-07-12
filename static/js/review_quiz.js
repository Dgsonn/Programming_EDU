/* review_quiz.js — FE-06: Quiz ôn tập cấp khóa học (block #review-quiz-block
   trong course_detail.html). Backend: routes/quizzes.py.
   Đáp án đúng chỉ backend biết — FE chỉ nhận {id, text} cho từng option. */

let currentQuiz = null;

function _csrfHeader() {
  const meta = document.querySelector('meta[name=csrf-token]');
  return meta ? { 'X-CSRFToken': meta.content } : {};
}

/* Dữ liệu câu hỏi/option đến từ content_json — escape trước khi đưa vào innerHTML */
function _esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

async function startReviewQuiz(courseId) {
  const btn = document.querySelector('#quiz-idle .quiz-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang tạo quiz…'; }
  try {
    const res = await fetch(`/api/courses/${courseId}/quiz/generate`, {
      method: 'POST',
      headers: _csrfHeader()
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Không thể tạo quiz');
      return;
    }
    currentQuiz = { id: data.quiz_id, total: data.total, answers: {} };
    renderQuizRunner(data.questions);
  } catch (e) {
    alert('Lỗi mạng, thử lại sau.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Bắt đầu ôn tập'; }
  }
}

function renderQuizRunner(questions) {
  document.getElementById('quiz-idle').style.display = 'none';
  const runner = document.getElementById('quiz-runner');
  runner.style.display = 'block';
  runner.innerHTML = questions.map(q => `
    <div class="quiz-q" data-no="${q.question_no}">
      <p class="quiz-q-text">${q.question_no}. ${_esc(q.question)}</p>
      ${q.options.map(o => `
        <label class="quiz-opt">
          <input type="radio" name="q${q.question_no}" value="${_esc(o.id)}"
                 onchange="setAnswer(${q.question_no}, this.value)"> ${_esc(o.text)}
        </label>`).join('')}
    </div>`).join('') +
    `<button type="button" class="quiz-btn primary" id="quiz-submit-btn" onclick="submitReviewQuiz()">Nộp bài</button>`;
  runner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setAnswer(qno, selected) { currentQuiz.answers[qno] = selected; }

async function submitReviewQuiz() {
  const answered = Object.keys(currentQuiz.answers).length;
  if (answered < currentQuiz.total &&
      !confirm(`Bạn mới trả lời ${answered}/${currentQuiz.total} câu. Nộp luôn?`)) {
    return;
  }
  const btn = document.getElementById('quiz-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang chấm…'; }
  const answers = Object.entries(currentQuiz.answers)
    .map(([question_no, selected]) => ({ question_no: Number(question_no), selected }));
  try {
    const res = await fetch(`/api/quizzes/${currentQuiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ..._csrfHeader() },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Nộp bài thất bại');
      if (btn) { btn.disabled = false; btn.textContent = 'Nộp bài'; }
      return;
    }
    renderQuizResult(data);
  } catch (e) {
    alert('Lỗi mạng, thử lại sau.');
    if (btn) { btn.disabled = false; btn.textContent = 'Nộp bài'; }
  }
}

function renderQuizResult(result) {
  const runner = document.getElementById('quiz-runner');
  runner.innerHTML = `
    <p class="quiz-score">Điểm: ${result.score}/${result.total} (${result.percentage}%)</p>
    ${result.review.map(r => `
      <div class="quiz-review-item ${r.is_correct ? 'correct' : 'wrong'}">
        <p class="quiz-q-text">${r.question_no}. ${_esc(r.question)}</p>
        <p>Bạn chọn: <b>${r.your_answer != null ? _esc(r.your_answer) : '(bỏ trống)'}</b>
           — Đáp án đúng: <b>${_esc(r.correct_answer)}</b></p>
        ${r.explanation ? `<p class="quiz-explain">${_esc(r.explanation)}</p>` : ''}
      </div>`).join('')}
    <button type="button" class="quiz-btn secondary" onclick="location.reload()">Làm lại từ đầu</button>`;
}
