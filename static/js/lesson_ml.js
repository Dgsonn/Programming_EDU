/* lesson_ml.js — orchestrator cho khóa Machine Learning (PE Web).
 * Điều hướng 4 step, quản lý Pyodide Web Worker, Monaco editor, chấm 4 tầng.
 * Mỗi step render theo `type` khai báo trong lesson_content_ml.js:
 *   step_1: story_rounds | table_lens
 *   step_2: sort_scenarios | role_rounds
 *   step_3: spec_builder | experiment_rounds | xy_builder
 *   step_4: Full Python IDE (Monaco + grader 4 tầng chạy thật trong Pyodide) */
(function () {
  'use strict';

  const CONTENT = window.LESSON_CONTENT_ML;
  const lessonIdx1 = (window.LESSON_IDX || 0) + 1; // 1-based
  const lesson = CONTENT.lessons.find((l) => l.index === lessonIdx1);

  // Bài chưa build (index ngoài phạm vi content) — báo rõ, KHÔNG rơi im lặng về Bài 1.
  if (!lesson) {
    const stage = document.querySelector('.lesson-stage');
    if (stage) {
      stage.innerHTML = '<div class="ml-not-ready">' +
        '<h2>Bài ' + lessonIdx1 + ' đang được xây dựng 🏗️</h2>' +
        '<p>Khóa Machine Learning đang mở dần từng bài. Bạn hãy quay lại trang khóa học nhé.</p>' +
        '<a class="ml-btn ml-btn-primary" href="/courses/ml">Về trang khóa học</a></div>';
    }
    const footer = document.querySelector('.lesson-footer');
    if (footer) footer.hidden = true;
    return;
  }

  const state = {
    step: 1,
    hearts: 3,
    xp: 0,
    step1Done: false,
    step2Done: false,
    step3Done: false,
    step4Passed: false,
    reqSeq: 0,
    pendingReq: null,
    monacoEditor: null,
    experimentRevealed: new Set(['dataset']),
  };

  // ── Worker lifecycle ──────────────────────────────────────────────────────
  const worker = new Worker('/static/js/ml_worker.js');
  worker.onmessage = (e) => {
    const msg = e.data || {};
    if (msg.type === 'progress') {
      const dot = document.getElementById('ml-runtime-dot');
      const label = document.getElementById('ml-runtime-label');
      if (label) label.textContent = msg.label || '';
      if (msg.stage === 'ready' && dot) dot.classList.add('ml-runtime-ready');
    } else if (msg.type === 'run_result' && msg.reqId === state.pendingReq) {
      onRunResult(msg.result);
    } else if (msg.type === 'grade_result' && msg.reqId === state.pendingReq) {
      onGradeResult(msg.result);
    } else if (msg.type === 'fatal_error') {
      console.error('[ml_worker] fatal:', msg.error);
      const label = document.getElementById('ml-runtime-label');
      if (label) label.textContent = 'Lỗi runtime — thử tải lại trang.';
    }
  };

  function requestGrade(code) {
    state.pendingReq = ++state.reqSeq;
    setIdeBusy(true);
    worker.postMessage({ type: 'grade', reqId: state.pendingReq, code, lessonFn: lesson.step_4.grader_fn });
  }

  function setIdeBusy(busy) {
    const runBtn = document.getElementById('ml-btn-run');
    const submitBtn = document.getElementById('ml-btn-submit');
    if (runBtn) runBtn.disabled = busy;
    if (submitBtn) submitBtn.disabled = busy;
    if (runBtn) runBtn.classList.toggle('ml-btn-busy', busy);
  }

  let lastSubmitWasSubmit = false;
  function onGradeResult(result) {
    setIdeBusy(false);
    const stdoutEl = document.getElementById('ml-stdout');
    if (stdoutEl) stdoutEl.textContent = result.stdout || '(không có output)';
    const layerMap = { output: 'output_ok', code: 'code_ok', behavior: 'behavior_ok', risk: 'risk_ok' };
    const msgMap = { output: 'output_msg', code: 'code_msg', behavior: 'behavior_msg', risk: 'risk_msg' };
    document.querySelectorAll('.ml-grade-row').forEach((row) => {
      const layer = row.dataset.layer;
      const ok = !!result[layerMap[layer]];
      const icon = row.querySelector('.ml-grade-icon');
      const msg = row.querySelector('.ml-grade-msg');
      icon.textContent = ok ? '✓' : '✗';
      row.classList.toggle('ml-grade-ok', ok);
      row.classList.toggle('ml-grade-bad', !ok);
      if (msg) msg.textContent = result[msgMap[layer]] || '';
    });
    if (result.grader_error) {
      if (stdoutEl) stdoutEl.textContent = result.grader_error;
    }
    if (result.overall_pass) {
      if (!state.step4Passed) {
        state.step4Passed = true;
        state.xp += lesson.xp_reward;
        updateXP();
        saveProgress();
      }
      if (lastSubmitWasSubmit) {
        if (window.confetti) window.confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        showSuccessOverlay();
      }
    } else if (lastSubmitWasSubmit) {
      loseHeart();
    }
  }

  function onRunResult() { setIdeBusy(false); }

  function loseHeart() {
    if (state.hearts <= 0) return;
    state.hearts--;
    const icons = document.querySelectorAll('#hearts-display .fa-heart');
    icons.forEach((el, i) => { if (i >= state.hearts) el.classList.add('heart-lost'); });
  }

  function updateXP() {
    const el = document.getElementById('xp-count');
    if (el) el.textContent = state.xp;
  }

  /* Tiến độ khóa ML: cùng cơ chế localStorage như khóa DB Design (pe_progress_*) —
   * trang /courses/ml đọc key này để mở khóa node roadmap. */
  function saveProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem('pe_progress_ml') || '[]');
      if (!stored.includes(lesson.index)) stored.push(lesson.index);
      localStorage.setItem('pe_progress_ml', JSON.stringify(stored));
    } catch (e) { /* localStorage bị chặn — bỏ qua, không chặn học */ }
  }

  function showSuccessOverlay() {
    document.getElementById('success-title').textContent = 'HOÀN THÀNH — ' + lesson.badge;
    document.getElementById('success-message').textContent = lesson.step_4.success_message;
    const nextBtn = document.getElementById('success-next');
    if (nextBtn) {
      const hasNext = lesson.index < (CONTENT.total_lessons || CONTENT.lessons.length);
      const nextBuilt = CONTENT.lessons.some((l) => l.index === lesson.index + 1);
      if (hasNext && nextBuilt) {
        nextBtn.hidden = false;
        nextBtn.href = '/lesson/ml?lesson=' + (lesson.index + 1);
        nextBtn.innerHTML = 'Bài ' + (lesson.index + 1) + ' →';
      } else {
        nextBtn.hidden = false;
        nextBtn.href = '/courses/ml';
        nextBtn.textContent = 'Về trang khóa học';
      }
    }
    document.getElementById('success-overlay').hidden = false;
  }

  // ── Shared: micro-check (trắc nghiệm 1 câu, dùng ở story_rounds + table_lens) ──
  function renderMicroCheck(mountEl, mc, onCorrect) {
    mountEl.hidden = false;
    mountEl.innerHTML = `<div class="ml-mc-question">${mc.question}</div>` +
      mc.options.map((o) => `<button class="ml-mc-option" data-correct="${o.correct}">${o.text}</button>`).join('') +
      '<div class="ml-mc-feedback" hidden></div>';
    mountEl.querySelectorAll('.ml-mc-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const correct = btn.dataset.correct === 'true';
        mountEl.querySelectorAll('.ml-mc-option').forEach((b) => (b.disabled = true));
        btn.classList.add(correct ? 'ml-mc-correct' : 'ml-mc-wrong');
        const fb = mountEl.querySelector('.ml-mc-feedback');
        fb.hidden = false;
        fb.textContent = correct ? mc.feedback_correct : mc.feedback_wrong;
        if (correct) onCorrect();
        else {
          loseHeart();
          // Cho làm lại sau khi sai (mất tim) — không kẹt bài
          setTimeout(() => {
            mountEl.querySelectorAll('.ml-mc-option').forEach((b) => {
              b.disabled = false; b.classList.remove('ml-mc-wrong');
            });
          }, 1600);
        }
      });
    });
  }

  function completeStep1() {
    if (state.step1Done) return;
    state.step1Done = true;
    state.xp += 5; updateXP();
    updateNavFooter();
  }
  function completeStep2() {
    if (state.step2Done) return;
    state.step2Done = true;
    state.xp += 10; updateXP();
    updateNavFooter();
  }
  function completeStep3() {
    if (state.step3Done) return;
    state.step3Done = true;
    state.xp += 10; updateXP();
    updateNavFooter();
  }

  // ══════════════════════ STEP 1 ══════════════════════
  function renderStep1() {
    document.getElementById('lesson-title').textContent = 'Bài ' + lesson.index + ' — ' + lesson.title;
    document.getElementById('s1-topic-tag').textContent = lesson.step_1.topic_tag;
    const banner = document.getElementById('ml-story-banner');
    banner.hidden = false;
    banner.innerHTML = lesson.step_1.intro_html;
    const mount = document.getElementById('ml-s1-mount');
    if (lesson.step_1.type === 'table_lens') renderTableLens(mount);
    else if (lesson.step_1.type === 'issue_hunt') renderIssueHunt(mount);
    else renderStoryRounds(mount);
  }

  /* story_rounds — mở từng luồng flow, xong hết → micro-check */
  function renderStoryRounds(mount) {
    const s1 = lesson.step_1;
    let html = '<div class="ml-round-grid">';
    s1.rounds.forEach((r, i) => {
      html += `<div class="ml-round-card" data-round="${i}">
        <div class="ml-round-label">${r.label}</div>
        <button class="ml-btn ml-btn-ghost ml-round-open" data-round="${i}">Mở luồng <i class="fa-solid fa-play"></i></button>
        <div class="ml-round-flow" hidden></div>
        <div class="ml-round-note" hidden>${r.note}</div>
      </div>`;
    });
    html += '</div><div class="ml-microcheck" id="ml-s1-check" hidden></div>';
    mount.innerHTML = html;

    mount.querySelectorAll('.ml-round-open').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.ml-round-card');
        const idx = Number(btn.dataset.round);
        const flowEl = card.querySelector('.ml-round-flow');
        flowEl.hidden = false;
        flowEl.innerHTML = s1.rounds[idx].flow.map((step, i) =>
          `<span class="ml-flow-node">${step}</span>` + (i < s1.rounds[idx].flow.length - 1 ? '<span class="ml-flow-arrow">→</span>' : '')
        ).join('');
        card.querySelector('.ml-round-note').hidden = false;
        btn.disabled = true;
        const opened = mount.querySelectorAll('.ml-round-open:disabled').length;
        if (opened === s1.rounds.length) {
          renderMicroCheck(document.getElementById('ml-s1-check'), s1.micro_check, completeStep1);
        }
      });
    });
  }

  /* table_lens — bấm dòng / tên cột / ô trong bảng dữ liệu → chú giải 3 tầng */
  function renderTableLens(mount) {
    const s1 = lesson.step_1;
    const cols = s1.table.columns;
    let html = '<div class="ml-lens-tasks">' + s1.tasks.map((t) =>
      `<div class="ml-lens-task" data-task="${t.key}"><span class="ml-lens-task-dot"></span>${t.label}</div>`
    ).join('') + '</div>';
    html += '<div class="ml-lens-wrap"><table class="ml-lens-table"><thead><tr><th class="ml-lens-idx">#</th>';
    cols.forEach((c, ci) => {
      html += `<th class="ml-lens-th" data-col="${ci}">${c.label}<span class="ml-lens-unit">${c.unit}</span></th>`;
    });
    html += '</tr></thead><tbody>';
    s1.table.rows.forEach((row, ri) => {
      html += `<tr><td class="ml-lens-idx ml-lens-rowbtn" data-row="${ri}">${ri + 1}</td>`;
      row.forEach((v, ci) => { html += `<td class="ml-lens-cell" data-row="${ri}" data-col="${ci}">${v}</td>`; });
      html += '</tr>';
    });
    html += `</tbody></table><div class="ml-lens-more">… còn ${s1.table.total_rows - s1.table.rows.length} dòng nữa (tổng ${s1.table.total_rows} dòng × ${cols.length} cột)</div></div>`;
    html += '<div class="ml-lens-note" id="ml-lens-note" hidden></div>';
    html += '<div class="ml-microcheck" id="ml-s1-check" hidden></div>';
    mount.innerHTML = html;

    const doneTasks = new Set();
    function hit(taskKey, note, highlightFn) {
      mount.querySelectorAll('.ml-lens-hl-row, .ml-lens-hl-col, .ml-lens-hl-cell').forEach((el) =>
        el.classList.remove('ml-lens-hl-row', 'ml-lens-hl-col', 'ml-lens-hl-cell'));
      highlightFn();
      const noteEl = document.getElementById('ml-lens-note');
      noteEl.hidden = false;
      noteEl.textContent = note;
      doneTasks.add(taskKey);
      const chip = mount.querySelector(`.ml-lens-task[data-task="${taskKey}"]`);
      if (chip) chip.classList.add('ml-lens-task-done');
      if (doneTasks.size === s1.tasks.length) {
        renderMicroCheck(document.getElementById('ml-s1-check'), s1.micro_check, completeStep1);
      }
    }
    const noteOf = (key) => (s1.tasks.find((t) => t.key === key) || {}).note || '';
    mount.querySelectorAll('.ml-lens-rowbtn').forEach((el) => {
      el.addEventListener('click', () => hit('row', noteOf('row'), () => {
        mount.querySelectorAll(`td[data-row="${el.dataset.row}"]`).forEach((td) => td.classList.add('ml-lens-hl-row'));
        el.classList.add('ml-lens-hl-row');
      }));
    });
    mount.querySelectorAll('.ml-lens-th').forEach((el) => {
      el.addEventListener('click', () => hit('col', noteOf('col'), () => {
        el.classList.add('ml-lens-hl-col');
        mount.querySelectorAll(`td.ml-lens-cell[data-col="${el.dataset.col}"]`).forEach((td) => td.classList.add('ml-lens-hl-col'));
      }));
    });
    mount.querySelectorAll('.ml-lens-cell').forEach((el) => {
      el.addEventListener('click', () => hit('cell', noteOf('cell'), () => el.classList.add('ml-lens-hl-cell')));
    });
  }

  /* issue_hunt — bảng có các ô lỗi được đánh dấu; bấm từng ô để nhận diện loại lỗi */
  function renderIssueHunt(mount) {
    const s1 = lesson.step_1;
    const cols = s1.table.columns;
    const issueAt = {};
    s1.issues.forEach((iss, k) => { issueAt[(iss.col === null ? 'r' : 'c') + iss.row + '_' + iss.col] = k; });

    let html = '<div class="ml-lens-tasks">' + s1.issues.map((iss, k) =>
      `<div class="ml-lens-task" data-issue="${k}"><span class="ml-lens-task-dot"></span>${iss.label}</div>`
    ).join('') + '</div>';
    html += '<div class="ml-lens-wrap"><table class="ml-lens-table"><thead><tr><th class="ml-lens-idx">#</th>';
    cols.forEach((c) => { html += `<th class="ml-lens-th-static">${c.label}<span class="ml-lens-unit">${c.unit}</span></th>`; });
    html += '</tr></thead><tbody>';
    s1.table.rows.forEach((row, ri) => {
      const rowIssue = issueAt['r' + ri + '_null'];
      html += `<tr><td class="ml-lens-idx ${rowIssue !== undefined ? 'ml-issue-cell' : ''}" ${rowIssue !== undefined ? `data-issue="${rowIssue}"` : ''}>${ri + 1}</td>`;
      row.forEach((v, ci) => {
        const k = issueAt['c' + ri + '_' + ci];
        html += `<td class="${k !== undefined ? 'ml-issue-cell' : 'ml-lens-static'}" ${k !== undefined ? `data-issue="${k}"` : ''}>${v}</td>`;
      });
      html += '</tr>';
    });
    html += `</tbody></table><div class="ml-lens-more">${s1.table.footnote || ''}</div></div>`;
    html += '<div class="ml-lens-note" id="ml-issue-note" hidden></div>';
    html += '<div class="ml-microcheck" id="ml-s1-check" hidden></div>';
    mount.innerHTML = html;

    const found = new Set();
    mount.querySelectorAll('.ml-issue-cell').forEach((el) => {
      el.addEventListener('click', () => {
        const k = Number(el.dataset.issue);
        const iss = s1.issues[k];
        el.classList.add('ml-issue-found');
        const note = document.getElementById('ml-issue-note');
        note.hidden = false;
        note.innerHTML = `<b>${iss.label}</b> — ${iss.note}`;
        found.add(k);
        const chip = mount.querySelector(`.ml-lens-task[data-issue="${k}"]`);
        if (chip) chip.classList.add('ml-lens-task-done');
        if (found.size === s1.issues.length) {
          renderMicroCheck(document.getElementById('ml-s1-check'), s1.micro_check, completeStep1);
        }
      });
    });
  }

  // ══════════════════════ STEP 2 ══════════════════════
  function renderStep2() {
    const mount = document.getElementById('ml-s2-mount');
    if (lesson.step_2.type === 'role_rounds') renderRoleRounds(mount);
    else renderSortScenarios(mount);
  }

  /* sort_scenarios — kéo thẻ vào ngăn (bins tùy bài) rồi phân loại tình huống */
  function renderSortScenarios(mount) {
    const s2 = lesson.step_2;
    let html = '<p class="ml-step-instr">' + s2.intro_html + '</p>';
    html += '<div class="ml-tep-board">';
    html += '<div class="ml-tep-cards" id="ml-tep-cards">' +
      s2.cards.map((c, i) => `<div class="ml-tep-card" data-idx="${i}" tabindex="0">${c.text}</div>`).join('') +
      '</div>';
    html += '<div class="ml-tep-bins">' +
      s2.bins.map((b) =>
        `<div class="ml-tep-bin" data-role="${b.key}"><div class="ml-tep-bin-label">${b.label}</div><div class="ml-tep-bin-drop"></div></div>`
      ).join('') + '</div></div>';
    html += '<div class="ml-tep-feedback" id="ml-tep-feedback" hidden></div>';
    html += `<div class="ml-scenario-block" id="ml-scenario-block" hidden><h3>${s2.scenario_intro}</h3><div class="ml-scenario-list"></div></div>`;
    mount.innerHTML = html;

    const placements = {};
    let selectedCard = null;
    mount.querySelectorAll('.ml-tep-card').forEach((card) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('ml-tep-placed')) return;
        mount.querySelectorAll('.ml-tep-card').forEach((c) => c.classList.remove('ml-tep-selected'));
        card.classList.add('ml-tep-selected');
        selectedCard = card;
      });
    });
    mount.querySelectorAll('.ml-tep-bin').forEach((bin) => {
      bin.addEventListener('click', () => {
        if (!selectedCard) return;
        const idx = Number(selectedCard.dataset.idx);
        const cardData = s2.cards[idx];
        const correct = cardData.role === bin.dataset.role;
        const chip = document.createElement('div');
        chip.className = 'ml-tep-chip ' + (correct ? 'ml-tep-chip-ok' : 'ml-tep-chip-bad');
        chip.textContent = cardData.text;
        bin.querySelector('.ml-tep-bin-drop').appendChild(chip);
        selectedCard.classList.add('ml-tep-placed');
        selectedCard.style.visibility = 'hidden';
        placements[idx] = correct;
        if (!correct) {
          const fb = document.getElementById('ml-tep-feedback');
          fb.hidden = false;
          fb.textContent = s2.wrong_feedback;
          // Thẻ distractor BẮT BUỘC phải thả (để hoàn thành board) → chỉ nhắc, không trừ tim.
          // Chỉ trừ tim khi đặt SAI một thẻ có vai trò thật.
          if (cardData.role !== 'distractor') loseHeart();
        }
        selectedCard = null;
        if (Object.keys(placements).length === s2.cards.length) revealScenarios(mount, s2);
      });
    });
  }

  function revealScenarios(mount, s2) {
    const block = document.getElementById('ml-scenario-block');
    block.hidden = false;
    const list = block.querySelector('.ml-scenario-list');
    const opts = s2.scenario_options;
    list.innerHTML = s2.scenarios.map((s, i) =>
      `<div class="ml-scenario-row" data-idx="${i}">
        <div class="ml-scenario-text">${s.text}</div>
        <div class="ml-scenario-btns">${opts.map((o) => `<button class="ml-btn ml-btn-ghost" data-answer="${o.key}">${o.label}</button>`).join('')}</div>
        <div class="ml-scenario-explain" hidden></div>
      </div>`
    ).join('');
    let answered = 0;
    list.querySelectorAll('.ml-scenario-row').forEach((row) => {
      const idx = Number(row.dataset.idx);
      row.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (row.classList.contains('ml-scenario-answered')) return;
          const correct = btn.dataset.answer === s2.scenarios[idx].answer;
          row.querySelectorAll('button').forEach((b) => (b.disabled = true));
          btn.classList.add(correct ? 'ml-mc-correct' : 'ml-mc-wrong');
          const ex = row.querySelector('.ml-scenario-explain');
          ex.hidden = false;
          ex.textContent = s2.scenarios[idx].explain;
          row.classList.add('ml-scenario-answered');
          answered++;
          if (!correct) loseHeart();
          if (answered === s2.scenarios.length) completeStep2();
        });
      });
    });
  }

  /* role_rounds — gán Feature/Target/Không dùng cho từng cột, theo từng nhiệm vụ */
  function renderRoleRounds(mount) {
    const s2 = lesson.step_2;
    let html = '<p class="ml-step-instr">' + s2.intro_html + '</p><div id="ml-role-rounds"></div>' +
      `<div class="ml-tep-feedback" id="ml-role-misconception" hidden>${s2.misconception}</div>`;
    mount.innerHTML = html;
    renderRoleRound(0);

    function renderRoleRound(rIdx) {
      const round = s2.rounds[rIdx];
      const holder = document.getElementById('ml-role-rounds');
      const div = document.createElement('div');
      div.className = 'ml-role-round';
      div.dataset.round = rIdx;
      div.innerHTML = `<div class="ml-role-title">${round.title}</div>
        <div class="ml-role-task">${round.task_html}</div>
        <div class="ml-role-grid">` +
        s2.columns.map((c) =>
          `<div class="ml-role-row" data-col="${c.key}">
            <span class="ml-role-colname">${c.label}</span>
            <span class="ml-role-btns">${s2.role_options.map((o) =>
              `<button class="ml-role-opt" data-role="${o.key}">${o.label}</button>`).join('')}</span>
            <span class="ml-role-mark"></span>
          </div>`).join('') +
        `</div>
        <button class="ml-btn ml-btn-primary ml-role-check" disabled>Kiểm tra</button>
        <div class="ml-role-reveal" hidden></div>`;
      holder.appendChild(div);

      const chosen = {};
      div.querySelectorAll('.ml-role-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rowEl = btn.closest('.ml-role-row');
          rowEl.querySelectorAll('.ml-role-opt').forEach((b) => b.classList.remove('ml-role-opt-sel'));
          btn.classList.add('ml-role-opt-sel');
          chosen[rowEl.dataset.col] = btn.dataset.role;
          div.querySelector('.ml-role-check').disabled = Object.keys(chosen).length < s2.columns.length;
        });
      });
      div.querySelector('.ml-role-check').addEventListener('click', () => {
        let allOk = true;
        s2.columns.forEach((c) => {
          const ok = chosen[c.key] === round.roles[c.key];
          const mark = div.querySelector(`.ml-role-row[data-col="${c.key}"] .ml-role-mark`);
          mark.textContent = ok ? '✓' : '✗';
          mark.className = 'ml-role-mark ' + (ok ? 'ml-role-mark-ok' : 'ml-role-mark-bad');
          if (!ok) allOk = false;
        });
        if (allOk) {
          const rev = div.querySelector('.ml-role-reveal');
          rev.hidden = false;
          rev.innerHTML = '<code>' + round.reveal + '</code>';
          div.querySelector('.ml-role-check').disabled = true;
          div.querySelectorAll('.ml-role-opt').forEach((b) => (b.disabled = true));
          if (rIdx + 1 < s2.rounds.length) renderRoleRound(rIdx + 1);
          else {
            document.getElementById('ml-role-misconception').hidden = false;
            completeStep2();
          }
        } else {
          loseHeart();
          const rev = div.querySelector('.ml-role-reveal');
          rev.hidden = false;
          rev.innerHTML = '<span class="ml-role-hint">' + round.wrong_hint + '</span>';
        }
      });
    }
  }

  // ══════════════════════ STEP 3 ══════════════════════
  function renderStep3() {
    const mount = document.getElementById('ml-s3-mount');
    const t = lesson.step_3.type;
    if (t === 'experiment_rounds') renderExperimentRounds(mount);
    else if (t === 'xy_builder') renderXyBuilder(mount);
    else renderSpecBuilder(mount);
  }

  /* spec_builder — điền dần ExperimentSpec (Bài 1) */
  function renderSpecBuilder(mount) {
    mount.innerHTML = `<p class="ml-step-instr">${lesson.step_3.mission}</p>
      <div class="ml-spec-grid" id="ml-spec-grid"></div>
      <button class="ml-btn ml-btn-ghost" id="ml-btn-code-preview" hidden><i class="fa-solid fa-code"></i> Xem code được sinh ra</button>
      <pre class="ml-code-preview" id="ml-code-preview" hidden></pre>
      <div class="ml-s3-note" id="ml-s3-note" hidden>${lesson.step_3.completion_note}</div>`;
    renderSpecGrid();
  }

  function renderSpecGrid() {
    const grid = document.getElementById('ml-spec-grid');
    grid.innerHTML = lesson.step_3.spec_fields.map((f) => {
      const isRevealed = !f.reveal_after || state.experimentRevealed.has(f.reveal_after);
      const isFilled = state.experimentRevealed.has(f.key);
      return `<div class="ml-spec-field ${isFilled ? 'ml-spec-filled' : ''} ${!isRevealed ? 'ml-spec-locked' : ''}" data-key="${f.key}">
        <div class="ml-spec-label">${f.label}</div>
        ${isRevealed
          ? (isFilled
            ? `<div class="ml-spec-value">${f.value}</div>`
            : `<button class="ml-btn ml-btn-ghost ml-spec-fill-btn" data-key="${f.key}">+ Điền</button>`)
          : '<div class="ml-spec-value ml-spec-dim">— chưa mở khóa —</div>'}
      </div>`;
    }).join('');
    grid.querySelectorAll('.ml-spec-fill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.experimentRevealed.add(btn.dataset.key);
        renderSpecGrid();
        if (state.experimentRevealed.size === lesson.step_3.spec_fields.length) {
          document.getElementById('ml-btn-code-preview').hidden = false;
          document.getElementById('ml-s3-note').hidden = false;
          completeStep3();
        }
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'ml-btn-code-preview') {
      const pre = document.getElementById('ml-code-preview');
      pre.hidden = false;
      pre.textContent = lesson.step_3.code_preview_template;
    }
  });

  /* experiment_rounds — mỗi round: spec cố định → chọn loại bài toán → chạy → output + code */
  function renderExperimentRounds(mount) {
    const s3 = lesson.step_3;
    mount.innerHTML = `<p class="ml-step-instr">${s3.mission}</p><div id="ml-exp-rounds"></div>
      <div class="ml-s3-note" id="ml-s3-note" hidden>${s3.completion_note}</div>`;
    renderExpRound(0);

    function renderExpRound(rIdx) {
      const round = s3.rounds[rIdx];
      const holder = document.getElementById('ml-exp-rounds');
      const div = document.createElement('div');
      div.className = 'ml-exp-round';
      div.dataset.round = rIdx;
      div.innerHTML = `<div class="ml-role-title">${round.title}</div>
        <div class="ml-exp-fixed">${round.fixed.map((f) =>
          `<div class="ml-spec-field ml-spec-filled"><div class="ml-spec-label">${f.label}</div><div class="ml-spec-value">${f.value}</div></div>`).join('')}</div>
        <div class="ml-exp-choose">
          <span class="ml-exp-choose-label">${round.choose.label}</span>
          ${s3.choose_options.map((o) => `<button class="ml-btn ml-btn-ghost ml-exp-opt" data-key="${o.key}">${o.label}</button>`).join('')}
        </div>
        <div class="ml-exp-runwrap" hidden>
          <button class="ml-btn ml-btn-primary ml-exp-run"><i class="fa-solid fa-play"></i> Chạy thí nghiệm</button>
        </div>
        <div class="ml-exp-result" hidden>
          <pre class="ml-code-preview ml-exp-code"></pre>
          <div class="ml-exp-output"></div>
          <div class="ml-round-note"></div>
        </div>`;
      holder.appendChild(div);

      div.querySelectorAll('.ml-exp-opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.dataset.key === round.choose.answer) {
            div.querySelectorAll('.ml-exp-opt').forEach((b) => (b.disabled = true));
            btn.classList.add('ml-mc-correct');
            div.querySelector('.ml-exp-runwrap').hidden = false;
          } else {
            btn.classList.add('ml-mc-wrong');
            btn.disabled = true;
            loseHeart();
          }
        });
      });
      div.querySelector('.ml-exp-run').addEventListener('click', () => {
        const res = div.querySelector('.ml-exp-result');
        res.hidden = false;
        res.querySelector('.ml-exp-code').textContent = round.code;
        res.querySelector('.ml-exp-output').textContent = round.output;
        res.querySelector('.ml-round-note').hidden = false;
        res.querySelector('.ml-round-note').textContent = round.note;
        div.querySelector('.ml-exp-run').disabled = true;
        if (rIdx + 1 < s3.rounds.length) renderExpRound(rIdx + 1);
        else {
          document.getElementById('ml-s3-note').hidden = false;
          completeStep3();
        }
      });
    }
  }

  /* xy_builder — thả từng cột vào vùng X / y / Không dùng; bắt leakage tại chỗ */
  function renderXyBuilder(mount) {
    const s3 = lesson.step_3;
    mount.innerHTML = `<p class="ml-step-instr">${s3.mission}</p><div id="ml-xy-rounds"></div>
      <div class="ml-s3-note" id="ml-s3-note" hidden>${s3.completion_note}</div>`;
    renderXyRound(0);

    function renderXyRound(rIdx) {
      const round = s3.rounds[rIdx];
      // Bài 4 dùng zones/columns RIÊNG từng round (2 cột × 2 vùng, không ngợp 6 vùng)
      const zones = round.zones || s3.zones;
      const columns = round.columns || s3.columns;
      const holder = document.getElementById('ml-xy-rounds');
      const div = document.createElement('div');
      div.className = 'ml-xy-round';
      div.innerHTML = `<div class="ml-role-title">${round.title}</div>
        ${round.task_html ? `<div class="ml-role-task">${round.task_html}</div>` : ''}
        <div class="ml-tep-board">
          <div class="ml-tep-cards">${columns.map((c) =>
            `<div class="ml-tep-card ml-xy-card" data-col="${c.key}" tabindex="0">${c.label}</div>`).join('')}</div>
          <div class="ml-tep-bins">${zones.map((z) =>
            `<div class="ml-tep-bin ml-xy-zone" data-zone="${z.key}"><div class="ml-tep-bin-label">${z.label}</div><div class="ml-tep-bin-drop"></div></div>`).join('')}</div>
        </div>
        <div class="ml-tep-feedback ml-xy-warn" hidden></div>
        <div class="ml-exp-result ml-xy-reveal" hidden>
          <pre class="ml-code-preview"></pre>
          <div class="ml-exp-output"></div>
        </div>`;
      holder.appendChild(div);

      let selected = null;
      const placed = {};
      div.querySelectorAll('.ml-xy-card').forEach((card) => {
        card.addEventListener('click', () => {
          if (card.classList.contains('ml-tep-placed')) return;
          div.querySelectorAll('.ml-xy-card').forEach((c) => c.classList.remove('ml-tep-selected'));
          card.classList.add('ml-tep-selected');
          selected = card;
        });
      });
      div.querySelectorAll('.ml-xy-zone').forEach((zone) => {
        zone.addEventListener('click', () => {
          if (!selected) return;
          const colKey = selected.dataset.col;
          const zoneKey = zone.dataset.zone;
          const correct = round.roles[colKey] === zoneKey;
          const warn = div.querySelector('.ml-xy-warn');
          if (!correct) {
            loseHeart();
            warn.hidden = false;
            // leak_warnings lồng theo zone: {zoneKey: {colKey: message}}
            const lw = round.leak_warnings && round.leak_warnings[zoneKey] && round.leak_warnings[zoneKey][colKey];
            warn.textContent = lw ||
              `${colKey} không thuộc vùng này trong "${round.title}". Nghĩ theo: model được phép NHÌN gì lúc dự đoán?`;
            selected.classList.remove('ml-tep-selected');
            selected = null;
            return;
          }
          warn.hidden = true;
          const chip = document.createElement('div');
          chip.className = 'ml-tep-chip ml-tep-chip-ok';
          chip.textContent = colKey;
          zone.querySelector('.ml-tep-bin-drop').appendChild(chip);
          selected.classList.add('ml-tep-placed');
          selected.style.visibility = 'hidden';
          placed[colKey] = zoneKey;
          selected = null;
          if (Object.keys(placed).length === columns.length) {
            const rev = div.querySelector('.ml-xy-reveal');
            rev.hidden = false;
            rev.querySelector('.ml-code-preview').textContent = round.code;
            rev.querySelector('.ml-exp-output').textContent = round.reveal;
            if (rIdx + 1 < s3.rounds.length) renderXyRound(rIdx + 1);
            else {
              document.getElementById('ml-s3-note').hidden = false;
              completeStep3();
            }
          }
        });
      });
    }
  }

  // ══════════════════════ STEP 4 — Full Python IDE ══════════════════════
  function renderStep4() {
    document.getElementById('ml-s4-instructions').innerHTML = lesson.step_4.prompt_html +
      '<details class="ml-hints"><summary>Gợi ý</summary><ul>' +
      lesson.step_4.hints.map((h) => `<li>${h}</li>`).join('') + '</ul></details>';
    initMonaco();
  }

  function initMonaco() {
    if (state.monacoEditor) return;
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
      state.monacoEditor = monaco.editor.create(document.getElementById('ml-monaco-host'), {
        value: lesson.step_4.starter_code,
        language: 'python',
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: { enabled: false },
        automaticLayout: true,
      });
      document.getElementById('ml-btn-run').addEventListener('click', () => {
        lastSubmitWasSubmit = false;
        requestGrade(state.monacoEditor.getValue());
      });
      document.getElementById('ml-btn-submit').addEventListener('click', () => {
        lastSubmitWasSubmit = true;
        requestGrade(state.monacoEditor.getValue());
      });
    });
  }

  // ── Step navigation ────────────────────────────────────────────────────────
  function goToStep(n) {
    if (n > 4) {
      // "Hoàn thành ✓" ở step 4 — mở lại overlay tổng kết (có nút bài tiếp theo)
      if (state.step4Passed) showSuccessOverlay();
      return;
    }
    if (n < 1) return;
    document.querySelectorAll('.step-pane').forEach((el) => el.classList.remove('active'));
    document.querySelector(`.step-pane[data-step="${n}"]`).classList.add('active');
    document.querySelectorAll('.progress-step').forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.toggle('active', s === n);
      el.classList.toggle('done', s < n);
    });
    state.step = n;
    if (n === 1 && !document.getElementById('ml-s1-mount').innerHTML) renderStep1();
    if (n === 2 && !document.getElementById('ml-s2-mount').innerHTML) renderStep2();
    if (n === 3 && !document.getElementById('ml-s3-mount').innerHTML) renderStep3();
    if (n === 4 && !document.getElementById('ml-s4-instructions').innerHTML) renderStep4();
    updateNavFooter();
  }

  function updateNavFooter() {
    const backBtn = document.getElementById('nav-back');
    const nextBtn = document.getElementById('nav-next');
    backBtn.disabled = state.step === 1;
    const doneMap = { 1: state.step1Done, 2: state.step2Done, 3: state.step3Done, 4: state.step4Passed };
    if (state.step === 4) {
      nextBtn.textContent = state.step4Passed ? 'Hoàn thành ✓' : 'Submit để hoàn thành';
      nextBtn.disabled = !state.step4Passed;
    } else {
      nextBtn.innerHTML = 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
      nextBtn.disabled = !doneMap[state.step];
    }
  }

  window.MLLesson = {
    nextStep: () => goToStep(state.step + 1),
    prevStep: () => goToStep(state.step - 1),
  };

  renderStep1();
  updateNavFooter();
})();
