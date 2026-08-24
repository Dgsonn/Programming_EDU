/* ============================================================================
 * lesson_ml_basic.js — Driver UI cho khóa "ML cơ bản" (bản dịu mắt).
 *
 * Trách nhiệm:
 *   - Đọc lesson_idx từ URL (?lesson=N, 1-based) → lấy bài từ LESSON_CONTENT['ml_basic']
 *   - Render 4 step-pane (lý thuyết / MCQ / kéo thả / tự code)
 *   - Quản lý step navigation (prev/next, progress bar)
 *   - Lưu progress vào localStorage (key: mlb_progress)
 *   - Step 2: MCQ — chấm đúng/sai
 *   - Step 3: Kéo thả — HTML5 drag-and-drop, so với solution
 *   - Step 4: Tự code — chạy user code trong sandbox Function, gọi check() từ lesson
 *
 * Public hooks (optional, dùng để test từ console):
 *   - window.MLB.lesson (object hiện tại)
 *   - window.MLB.gotoStep(n)
 *   - window.MLB.markComplete()
 * ========================================================================== */

(function () {
  'use strict';

  /* ─── Tiện ích ─────────────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQueryParam(name, defVal) {
    var s = window.location.search.substring(1);
    var parts = s.split('&');
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('=');
      if (decodeURIComponent(kv[0]) === name) {
        return kv.length > 1 ? decodeURIComponent(kv[1]) : '';
      }
    }
    return defVal;
  }

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem('mlb_progress') || '{}'); }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem('mlb_progress', JSON.stringify(p)); } catch (e) { /* quota / private mode */ }
  }

  /* ─── State ────────────────────────────────────────────────────────── */
  var lessons = (window.LESSON_CONTENT && window.LESSON_CONTENT.ml_basic && window.LESSON_CONTENT.ml_basic.lessons) || [];

  // 1-based từ URL, fallback về body[data-lesson-idx] (0-based) + 1
  var lessonParam = parseInt(getQueryParam('lesson', '0'), 10);
  var lessonIdxFromBody = parseInt((document.body.getAttribute('data-lesson-idx') || '0'), 10);
  var lessonNumber = (lessonParam > 0) ? lessonParam : (lessonIdxFromBody + 1);
  if (isNaN(lessonNumber) || lessonNumber < 1) lessonNumber = 1;
  if (lessonNumber > lessons.length) lessonNumber = lessons.length;

  var currentLesson = lessons[lessonNumber - 1];
  var currentStep = 1; /* 1..4 */
  var stepCompleted = { 1: false, 2: false, 3: false, 4: false };

  /* ─── Render header progress (4 chấm tròn) ────────────────────────── */
  function renderStepProgress() {
    var steps = $$('.mlb-step');
    steps.forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.remove('is-active', 'is-done');
      if (s < currentStep) el.classList.add('is-done');
      else if (s === currentStep) el.classList.add('is-active');
    });
  }

  /* ─── Render nội dung 1 step ───────────────────────────────────────── */
  function renderStep1() {
    var s = currentLesson.step_1;
    var blocks = s.blocks || [];
    var html = '<div class="mlb-step-pane is-active" data-step="1">'
             +   '<span class="mlb-step-eyebrow">Bước 1 / 4 · ' + escapeHtml(s.title || 'Lý thuyết') + '</span>'
             +   '<h1 class="mlb-step-title">' + escapeHtml(currentLesson.title) + '</h1>'
             +   '<p class="mlb-step-subtitle">' + escapeHtml(currentLesson.subtitle) + '</p>';

    blocks.forEach(function (b) {
      if (b.type === 'p') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block"><p>' + b.html + '</p></div></div>';
      } else if (b.type === 'h3') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   '<h3><i class="' + (b.icon || 'fa-solid fa-circle') + '"></i> ' + escapeHtml(b.text) + '</h3>'
              + '</div></div>';
      } else if (b.type === 'ul') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block"><ul>'
              +   b.items.map(function (li) { return '<li>' + li + '</li>'; }).join('')
              + '</ul></div></div>';
      } else if (b.type === 'ol') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block"><ol>'
              +   b.items.map(function (li) { return '<li>' + li + '</li>'; }).join('')
              + '</ol></div></div>';
      } else if (b.type === 'code') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   '<pre style="background: var(--mlb-bg); border: 1px solid var(--mlb-border); border-radius: var(--mlb-radius-sm); padding: 14px 18px; font-family: var(--mlb-font-m); font-size: 14px; line-height: 1.65; color: var(--mlb-text); margin: 0; overflow-x: auto;">'
              +     escapeHtml(b.code)
              +   '</pre>'
              + '</div></div>';
      } else if (b.type === 'callout') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-callout">' + b.html + '</div></div>';
      } else if (b.type === 'compare') {
        var items = b.items.map(function (it) {
          return '<div>'
               +   '<h4>' + (it.icon ? it.icon + ' ' : '') + escapeHtml(it.title) + '</h4>'
               +   '<p>' + it.body + '</p>'
               + '</div>';
        }).join('');
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   '<div class="mlb-concept-compare">' + items + '</div>'
              + '</div></div>';
      } else if (b.type === 'stat') {
        var statsHtml = b.items.map(function (it) {
          return '<div class="mlb-stat-tile">'
               +   (it.icon ? '<span class="mlb-stat-icon">' + it.icon + '</span>' : '')
               +   '<span class="mlb-stat-value">' + escapeHtml(it.value) + '</span>'
               +   '<span class="mlb-stat-label">' + escapeHtml(it.label) + '</span>'
               + '</div>';
        }).join('');
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   '<div class="mlb-stat-row">' + statsHtml + '</div>'
              + '</div></div>';
      } else if (b.type === 'table') {
        var theadHtml = '<tr>' + b.headers.map(function (h) { return '<th>' + escapeHtml(h) + '</th>'; }).join('') + '</tr>';
        var tbodyHtml = b.rows.map(function (row) {
          return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
        }).join('');
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   (b.caption ? '<div class="mlb-table-caption">' + b.caption + '</div>' : '')
              +   '<div class="mlb-table-wrap"><table class="mlb-data-table"><thead>' + theadHtml + '</thead><tbody>' + tbodyHtml + '</tbody></table></div>'
              + '</div></div>';
      } else if (b.type === 'quote') {
        html += '<div class="mlb-theory-card"><div class="mlb-theory-block">'
              +   '<blockquote class="mlb-quote">'
              +     '<p>' + b.text + '</p>'
              +     (b.author ? '<cite>— ' + escapeHtml(b.author) + '</cite>' : '')
              +   '</blockquote>'
              + '</div></div>';
      }
    });

    html += '</div>';
    return html;
  }

  function renderStep2() {
    var s = currentLesson.step_2;
    var optsHtml = s.options.map(function (o) {
      return '<button class="mlb-mcq-option" data-letter="' + escapeHtml(o.letter) + '" type="button">'
           +   '<span class="mlb-mcq-letter">' + escapeHtml(o.letter) + '</span>'
           +   '<span>' + o.text + '</span>'
           + '</button>';
    }).join('');

    var bonusHtml = '';
    if (s.bonus) {
      var b = s.bonus;
      var poolHtml = b.chips.map(function (c) {
        return '<div class="mlb-drag-chip" draggable="true" data-chip-id="' + escapeHtml(c.id) + '">'
             +   '<span class="mlb-drag-chip-text">' + escapeHtml(c.text) + '</span>'
             +   '<span class="mlb-drag-chip-x" title="Bấm để trả về pool">×</span>'
             + '</div>';
      }).join('');
      var zonesHtml = b.zones.map(function (z) {
        return '<div class="mlb-drag-zone" data-zone-id="' + escapeHtml(z.id) + '">'
             +   '<div class="mlb-drag-zone-label">' + (z.icon ? z.icon + ' ' : '') + escapeHtml(z.label) + '</div>'
             +   '<div class="mlb-drag-zone-chips" data-zone-chips="' + escapeHtml(z.id) + '"></div>'
             + '</div>';
      }).join('');
      bonusHtml = '<div class="mlb-bonus-wrap">'
                +   '<span class="mlb-bonus-badge"><i class="fa-solid fa-gift"></i> Mini-game bonus</span>'
                +   '<p class="mlb-drag-help">' + b.help + '</p>'
                +   '<div class="mlb-drag-pool-label"><i class="fa-solid fa-box-open"></i> Kho chip</div>'
                +   '<div class="mlb-drag-pool" id="mlb-bonus-pool">' + poolHtml + '</div>'
                +   '<div class="mlb-drag-zones" id="mlb-bonus-zones">' + zonesHtml + '</div>'
                +   '<div class="mlb-drag-actions" style="margin-top:18px; display:flex; gap:10px;">'
                +     '<button class="mlb-btn mlb-btn-primary" id="mlb-bonus-check" type="button">'
                +       '<i class="fa-solid fa-check"></i> Kiểm tra bonus'
                +     '</button>'
                +     '<button class="mlb-btn mlb-btn-ghost" id="mlb-bonus-reset" type="button">'
                +       '<i class="fa-solid fa-rotate"></i> Làm lại'
                +     '</button>'
                +   '</div>'
                +   '<div class="mlb-drag-feedback" id="mlb-bonus-feedback"></div>'
                + '</div>';
    }

    return '<div class="mlb-step-pane is-active" data-step="2">'
         +   '<span class="mlb-step-eyebrow">Bước 2 / 4 · ' + escapeHtml(s.title || 'Trắc nghiệm') + '</span>'
         +   '<h1 class="mlb-step-title">Câu hỏi</h1>'
         +   '<div class="mlb-mcq-card">'
         +     '<p class="mlb-mcq-question">' + s.question + '</p>'
         +     '<div class="mlb-mcq-options" id="mlb-mcq-options">' + optsHtml + '</div>'
         +     '<div class="mlb-mcq-feedback" id="mlb-mcq-feedback"></div>'
         +     bonusHtml
         +   '</div>'
         + '</div>';
  }

  function renderStep3() {
    var s = currentLesson.step_3;
    var poolHtml = s.blocks.map(function (b) {
      return '<div class="mlb-pipeline-block" draggable="true" data-block-id="' + escapeHtml(b.id) + '">' + escapeHtml(b.code) + '</div>';
    }).join('');

    var slotsHtml = '';
    for (var i = 0; i < s.blocks.length; i++) {
      slotsHtml += '<div class="mlb-pipeline-slot" data-slot-index="' + i + '">'
                 +   '<span class="mlb-pipeline-slot-num">' + (i + 1) + '</span>'
                 +   '<div class="mlb-pipeline-slot-body" data-slot-body="' + i + '">'
                 +     '<span class="mlb-pipeline-slot-placeholder">Kéo dòng lệnh vào đây…</span>'
                 +   '</div>'
                 + '</div>';
    }

    return '<div class="mlb-step-pane is-active" data-step="3">'
         +   '<span class="mlb-step-eyebrow">Bước 3 / 4 · ' + escapeHtml(s.title || 'Kéo thả') + '</span>'
         +   '<h1 class="mlb-step-title">Lắp pipeline</h1>'
         +   '<div class="mlb-drag-card">'
         +     '<p class="mlb-pipeline-scenario">' + s.scenario_html + '</p>'
         +     '<div class="mlb-pipeline-given-label"><i class="fa-solid fa-lock"></i> Đã có sẵn — không cần kéo, chỉ dùng lại</div>'
         +     '<pre class="mlb-pipeline-given">' + escapeHtml(s.given_code) + '</pre>'
         +     '<div class="mlb-pipeline-pool-label"><i class="fa-solid fa-box-open"></i> Kho khối lệnh (kéo từ đây)</div>'
         +     '<div class="mlb-pipeline-pool" id="mlb-pipeline-pool">' + poolHtml + '</div>'
         +     '<div class="mlb-pipeline-slots-label"><i class="fa-solid fa-arrow-down-1-9"></i> Thứ tự chạy (thả đúng thứ tự)</div>'
         +     '<div class="mlb-pipeline-slots" id="mlb-pipeline-slots">' + slotsHtml + '</div>'
         +     '<div class="mlb-pipeline-actions">'
         +       '<button class="mlb-btn mlb-btn-primary" id="mlb-pipeline-run" type="button">'
         +         '<i class="fa-solid fa-play"></i> Chạy Pipeline'
         +       '</button>'
         +       '<button class="mlb-btn mlb-btn-ghost" id="mlb-pipeline-reset" type="button">'
         +         '<i class="fa-solid fa-rotate"></i> Làm lại'
         +       '</button>'
         +     '</div>'
         +     '<div class="mlb-pipeline-output" id="mlb-pipeline-output"></div>'
         +     (s.hint ? '<div class="mlb-code-hint"><i class="fa-solid fa-lightbulb"></i> Gợi ý: ' + s.hint + '</div>' : '')
         +   '</div>'
         + '</div>';
  }

  function renderStep4() {
    var s = currentLesson.step_4;
    var stepsHtml = (s.steps || []).map(function (st) { return '<li>' + st + '</li>'; }).join('');

    var problemHtml = '<div class="mlb-problem-card">'
      +   '<div class="mlb-problem-section">'
      +     '<span class="mlb-problem-badge"><i class="fa-solid fa-book-open"></i> Bối cảnh</span>'
      +     '<p>' + s.context_html + '</p>'
      +   '</div>'
      +   '<div class="mlb-problem-section">'
      +     '<span class="mlb-problem-badge is-teal"><i class="fa-solid fa-earth-asia"></i> Trong thực tế</span>'
      +     '<p>' + s.real_world_html + '</p>'
      +   '</div>'
      +   '<div class="mlb-problem-section">'
      +     '<span class="mlb-problem-badge is-purple"><i class="fa-solid fa-list-ol"></i> Các bước</span>'
      +     '<ol>' + stepsHtml + '</ol>'
      +   '</div>'
      +   '<div class="mlb-problem-section">'
      +     '<span class="mlb-problem-badge is-green"><i class="fa-solid fa-bullseye"></i> Kết quả mong đợi</span>'
      +     '<p>' + s.expected_html + '</p>'
      +   '</div>'
      +   (s.hint
          ? '<details class="mlb-problem-hint"><summary><i class="fa-solid fa-lightbulb"></i> Cần gợi ý?</summary><div class="mlb-problem-hint-body">' + s.hint + '</div></details>'
          : '')
      + '</div>';

    return '<div class="mlb-step-pane is-active" data-step="4">'
         +   '<span class="mlb-step-eyebrow">Bước 4 / 4 · ' + escapeHtml(s.title || 'Tự code') + '</span>'
         +   '<h1 class="mlb-step-title">Viết code của bạn</h1>'
         +   '<div class="mlb-step4-split">'
         +     '<div class="mlb-step4-col mlb-step4-col-left">' + problemHtml + '</div>'
         +     '<div class="mlb-step4-col mlb-step4-col-right">'
         +       '<div class="mlb-code-card">'
         +         '<div class="mlb-code-editor-wrap">'
         +           '<div class="mlb-code-editor-cm" id="mlb-code-editor-cm"></div>'
         +         '</div>'
         +         '<div class="mlb-code-actions">'
         +           '<button class="mlb-btn mlb-btn-primary" id="mlb-code-run" type="button">'
         +             '<i class="fa-solid fa-play"></i> Chạy &amp; chấm'
         +           '</button>'
         +           '<button class="mlb-btn mlb-btn-ghost" id="mlb-code-reset" type="button">'
         +             '<i class="fa-solid fa-rotate"></i> Khôi phục mẫu'
         +           '</button>'
         +         '</div>'
         +         '<div class="mlb-code-result-label"><i class="fa-solid fa-terminal"></i> Kết quả</div>'
         +         '<div class="mlb-code-result" id="mlb-code-result">'
         +           '<span class="mlb-code-result-idle">Bấm "Chạy &amp; chấm" để xem kết quả ở đây…</span>'
         +         '</div>'
         +       '</div>'
         +     '</div>'
         +   '</div>'
         + '</div>';
  }

  /* ─── Gắn handlers cho step 2 (MCQ) ────────────────────────────────── */
  function attachStep2Handlers() {
    var opts = $$('#mlb-mcq-options .mlb-mcq-option');
    var feedback = $('#mlb-mcq-feedback');
    var correct = currentLesson.step_2.correct;
    var answered = false;

    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        var letter = btn.getAttribute('data-letter');
        var isCorrect = (letter === correct);
        answered = true;
        opts.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute('data-letter') === correct) b.classList.add('is-correct');
        });
        if (!isCorrect) btn.classList.add('is-wrong');

        feedback.classList.add('is-shown');
        feedback.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        feedback.innerHTML = isCorrect
          ? currentLesson.step_2.feedback_correct
          : currentLesson.step_2.feedback_wrong;

        if (isCorrect) {
          stepCompleted[2] = true;
          updateFooter();
        }
      });
    });

    if (currentLesson.step_2.bonus) attachBonusHandlers();
  }

  /* ─── Gắn handlers cho mini-game bonus (dưới MCQ, Bước 2) ──────────── */
  function attachBonusHandlers() {
    var b = currentLesson.step_2.bonus;
    var draggedChip = null;

    $$('#mlb-bonus-pool .mlb-drag-chip, #mlb-bonus-zones .mlb-drag-chip').forEach(function (chip) {
      chip.addEventListener('dragstart', function (e) {
        draggedChip = chip;
        chip.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.getAttribute('data-chip-id'));
      });
      chip.addEventListener('dragend', function () {
        chip.classList.remove('is-dragging');
        draggedChip = null;
      });
      chip.addEventListener('click', function () {
        if (chip.classList.contains('is-placed') && !chip.classList.contains('is-correct') && !chip.classList.contains('is-wrong')) {
          var pool = $('#mlb-bonus-pool');
          if (pool) {
            pool.appendChild(chip);
            chip.classList.remove('is-placed');
          }
        }
      });
    });

    function attachDropTarget(el) {
      if (!el) return;
      el.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('is-drop-target');
      });
      el.addEventListener('dragleave', function () {
        el.classList.remove('is-drop-target');
      });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        el.classList.remove('is-drop-target');
        if (draggedChip) {
          el.appendChild(draggedChip);
          draggedChip.classList.add('is-placed');
        }
      });
    }
    attachDropTarget($('#mlb-bonus-pool'));
    $$('#mlb-bonus-zones .mlb-drag-zone').forEach(attachDropTarget);

    var checkBtn = $('#mlb-bonus-check');
    if (checkBtn) checkBtn.addEventListener('click', function () {
      var correctCount = 0;
      var totalChips = b.chips.length;
      $$('#mlb-bonus-pool .mlb-drag-chip, #mlb-bonus-zones .mlb-drag-chip').forEach(function (c) { c.classList.remove('is-correct', 'is-wrong'); });
      $$('#mlb-bonus-zones .mlb-drag-zone').forEach(function (z) { z.classList.remove('is-correct', 'is-wrong'); });

      b.chips.forEach(function (c) {
        var chipEl = $('.mlb-drag-chip[data-chip-id="' + c.id + '"]');
        if (!chipEl) return;
        var zoneEl = chipEl.closest('.mlb-drag-zone');
        var placedZoneId = zoneEl ? zoneEl.getAttribute('data-zone-id') : null;
        if (placedZoneId && b.solution[c.id] === placedZoneId) {
          chipEl.classList.add('is-correct');
          correctCount++;
        } else {
          chipEl.classList.add('is-wrong');
        }
      });

      $$('#mlb-bonus-zones .mlb-drag-zone').forEach(function (z) {
        var chipsInZone = $$('.mlb-drag-chip', z);
        var allOk = chipsInZone.length > 0 && chipsInZone.every(function (c) { return c.classList.contains('is-correct'); });
        var anyWrong = chipsInZone.some(function (c) { return c.classList.contains('is-wrong'); });
        if (allOk) z.classList.add('is-correct');
        if (anyWrong) z.classList.add('is-wrong');
      });

      var feedback = $('#mlb-bonus-feedback');
      feedback.classList.add('is-shown');
      if (correctCount === totalChips) {
        feedback.classList.add('is-correct');
        feedback.classList.remove('is-wrong');
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + b.feedback_correct;
      } else {
        feedback.classList.add('is-wrong');
        feedback.classList.remove('is-correct');
        feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> ' + b.feedback_wrong
                           + ' <br><small>Đúng ' + correctCount + '/' + totalChips + ' chip. Bonus không bắt buộc để qua bài — nhưng thử lại cho vui!</small>';
      }
    });

    var resetBtn = $('#mlb-bonus-reset');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      var pool = $('#mlb-bonus-pool');
      $$('#mlb-bonus-pool .mlb-drag-chip, #mlb-bonus-zones .mlb-drag-chip').forEach(function (c) {
        pool.appendChild(c);
        c.classList.remove('is-placed', 'is-correct', 'is-wrong');
      });
      $$('#mlb-bonus-zones .mlb-drag-zone').forEach(function (z) { z.classList.remove('is-correct', 'is-wrong'); });
      var fb = $('#mlb-bonus-feedback');
      fb.classList.remove('is-shown', 'is-correct', 'is-wrong');
      fb.textContent = '';
    });
  }

  /* ─── Gắn handlers cho step 3 (Pipeline builder — kéo khối lệnh JS thật) ─
     Kéo các khối code (đã cho sẵn nội dung, KHÔNG phải HS tự viết logic — đó
     là việc của Bước 4) vào đúng THỨ TỰ chạy, rồi bấm "Chạy Pipeline" để
     thực thi thật bằng new Function(). Sai thứ tự → lỗi runtime thật
     (vd: dùng biến trước khi khai báo), giống hệt code thật chạy sai. ───── */
  function attachStep3Handlers() {
    var s = currentLesson.step_3;
    var draggedBlock = null;

    function wireBlock(block) {
      block.addEventListener('dragstart', function (e) {
        draggedBlock = block;
        block.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', block.getAttribute('data-block-id'));
      });
      block.addEventListener('dragend', function () {
        block.classList.remove('is-dragging');
        draggedBlock = null;
      });
      block.addEventListener('click', function () {
        if (block.classList.contains('is-placed')) {
          var pool = $('#mlb-pipeline-pool');
          var slotBody = block.closest('.mlb-pipeline-slot-body');
          if (pool) {
            pool.appendChild(block);
            block.classList.remove('is-placed');
          }
          if (slotBody) {
            slotBody.innerHTML = '<span class="mlb-pipeline-slot-placeholder">Kéo dòng lệnh vào đây…</span>';
          }
        }
      });
    }
    $$('.mlb-pipeline-block').forEach(wireBlock);

    function attachDropTarget(el) {
      if (!el) return;
      el.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('is-drop-target');
      });
      el.addEventListener('dragleave', function () {
        el.classList.remove('is-drop-target');
      });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        el.classList.remove('is-drop-target');
        if (!draggedBlock) return;
        if (el.id === 'mlb-pipeline-pool') {
          el.appendChild(draggedBlock);
          draggedBlock.classList.remove('is-placed');
          return;
        }
        // Slot: chỉ nhận khi đang trống
        var body = $('.mlb-pipeline-slot-body', el);
        if (!body || body.querySelector('.mlb-pipeline-block')) return;
        body.innerHTML = '';
        body.appendChild(draggedBlock);
        draggedBlock.classList.add('is-placed');
      });
    }
    attachDropTarget($('#mlb-pipeline-pool'));
    $$('.mlb-pipeline-slot').forEach(attachDropTarget);

    $('#mlb-pipeline-run').addEventListener('click', function () {
      var output = $('#mlb-pipeline-output');
      var slots = $$('.mlb-pipeline-slot-body');
      var orderedIds = [];
      var complete = true;
      slots.forEach(function (body) {
        var blockEl = body.querySelector('.mlb-pipeline-block');
        if (!blockEl) { complete = false; return; }
        orderedIds.push(blockEl.getAttribute('data-block-id'));
      });

      output.classList.remove('is-shown', 'is-pass', 'is-fail');
      if (!complete) {
        output.classList.add('is-shown', 'is-fail');
        output.textContent = 'Bạn cần thả đủ ' + s.blocks.length + ' khối lệnh vào các ô theo thứ tự trước khi chạy.';
        return;
      }

      var outcome;
      try {
        outcome = s.run(orderedIds);
      } catch (e) {
        outcome = { pass: false, message: 'Lỗi khi chấm: ' + e.message };
      }
      output.classList.add('is-shown', outcome.pass ? 'is-pass' : 'is-fail');
      output.textContent = outcome.message;
      stepCompleted[3] = !!outcome.pass;
      updateFooter();
    });

    $('#mlb-pipeline-reset').addEventListener('click', function () {
      var pool = $('#mlb-pipeline-pool');
      $$('.mlb-pipeline-block').forEach(function (b) {
        pool.appendChild(b);
        b.classList.remove('is-placed');
      });
      $$('.mlb-pipeline-slot-body').forEach(function (body) {
        body.innerHTML = '<span class="mlb-pipeline-slot-placeholder">Kéo dòng lệnh vào đây…</span>';
      });
      var output = $('#mlb-pipeline-output');
      output.classList.remove('is-shown', 'is-pass', 'is-fail');
      output.textContent = '';
      stepCompleted[3] = false;
      updateFooter();
    });
  }

  /* ─── Gắn handlers cho step 4 (Tự code) ───────────────────────────── */
  function attachStep4Handlers() {
    var result = $('#mlb-code-result');
    var s = currentLesson.step_4;
    var cmHost = $('#mlb-code-editor-cm');
    var cm = null;
    var fallbackTextarea = null;

    if (window.CodeMirror) {
      cm = window.CodeMirror(cmHost, {
        value: s.starter,
        mode: 'javascript',
        theme: 'material-darker',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        autofocus: false,
        matchBrackets: true
      });
      // CodeMirror cần refresh() sau khi được chèn vào pane mới hiện ra, nếu không
      // sẽ vẽ sai chiều rộng (bug kinh điển của CodeMirror trong container display:none → block).
      setTimeout(function () { cm.refresh(); }, 0);
    } else {
      // Fallback nếu CDN CodeMirror không tải được — vẫn dùng textarea trần như trước.
      cmHost.innerHTML = '<textarea class="mlb-code-editor" id="mlb-code-editor-fallback" spellcheck="false" rows="14"></textarea>';
      fallbackTextarea = $('#mlb-code-editor-fallback');
      fallbackTextarea.value = s.starter;
    }

    function getCode() { return cm ? cm.getValue() : fallbackTextarea.value; }
    function setCode(v) { if (cm) cm.setValue(v); else fallbackTextarea.value = v; }

    $('#mlb-code-run').addEventListener('click', function () {
      result.classList.remove('is-shown', 'is-pass', 'is-fail');
      var outcome;
      try {
        outcome = s.check(getCode());
      } catch (e) {
        outcome = { pass: false, message: 'Lỗi khi chấm: ' + e.message, passed: 0, total: s.tests.length };
      }
      result.classList.add('is-shown');
      var consoleHtml = '';
      if (outcome.consoleLines && outcome.consoleLines.length) {
        consoleHtml = '<div class="mlb-code-console">'
          + outcome.consoleLines.map(function (line) {
              return '<div class="mlb-code-console-line">&gt; ' + escapeHtml(line) + '</div>';
            }).join('')
          + '</div>';
      }
      if (outcome.pass) {
        result.classList.add('is-pass');
        result.innerHTML = consoleHtml + '<div class="mlb-code-result-msg"><i class="fa-solid fa-circle-check"></i> ' + escapeHtml(outcome.message) + '</div>';
        stepCompleted[4] = true;
      } else {
        result.classList.add('is-fail');
        result.innerHTML = consoleHtml + '<div class="mlb-code-result-msg"><i class="fa-solid fa-circle-xmark"></i> ' + escapeHtml(outcome.message) + '</div>';
        stepCompleted[4] = false;
      }
      updateFooter();
    });

    $('#mlb-code-reset').addEventListener('click', function () {
      setCode(s.starter);
      result.classList.remove('is-shown', 'is-pass', 'is-fail');
      result.textContent = '';
      stepCompleted[4] = false;
      updateFooter();
    });
  }

  /* ─── Điều hướng step ─────────────────────────────────────────────── */
  function gotoStep(n) {
    if (n < 1 || n > 4) return;
    currentStep = n;
    // Re-render stage
    var stage = $('#mlb-lesson-stage');
    if (!stage) return;
    stage.classList.toggle('mlb-stage-wide', n === 4);
    if (n === 1) stage.innerHTML = renderStep1();
    else if (n === 2) { stage.innerHTML = renderStep2(); attachStep2Handlers(); }
    else if (n === 3) { stage.innerHTML = renderStep3(); attachStep3Handlers(); }
    else if (n === 4) { stage.innerHTML = renderStep4(); attachStep4Handlers(); }

    renderStepProgress();
    updateFooter();
    // Scroll lên đầu
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function updateFooter() {
    var prev = $('#mlb-prev-btn');
    var next = $('#mlb-next-btn');
    var status = $('#mlb-footer-status');
    if (prev) prev.disabled = (currentStep === 1);
    if (status) status.textContent = 'Bước ' + currentStep + ' / 4';
    if (next) {
      // Chế độ xem trước toàn khóa: không khóa nút "Tiếp theo" ở bất kỳ bước nào —
      // vẫn chấm và tô đúng/sai bình thường, chỉ không CHẶN việc đi tiếp.
      next.disabled = false;
      if (currentStep === 1) {
        next.innerHTML = (currentLesson && lessonNumber >= lessons.length)
          ? 'Hoàn thành <i class="fa-solid fa-flag-checkered"></i>'
          : 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
      } else if (currentStep === 2 || currentStep === 3) {
        next.innerHTML = 'Tiếp theo <i class="fa-solid fa-arrow-right"></i>';
      } else if (currentStep === 4) {
        next.innerHTML = (lessonNumber >= lessons.length)
          ? 'Hoàn thành khóa <i class="fa-solid fa-flag-checkered"></i>'
          : 'Qua bài sau <i class="fa-solid fa-arrow-right"></i>';
      }
    }
  }

  function markLessonComplete() {
    if (!currentLesson) return;
    var p = loadProgress();
    p[currentLesson.id] = { completed: true, ts: Date.now() };
    saveProgress(p);
  }

  function goNext() {
    if (currentStep < 4) {
      gotoStep(currentStep + 1);
    } else {
      // Hoàn thành bài
      markLessonComplete();
      if (lessonNumber < lessons.length) {
        window.location.href = '/lesson/ml_basic?lesson=' + (lessonNumber + 1);
      } else {
        // Hết khóa — về trang chi tiết
        window.location.href = '/courses/ml_basic';
      }
    }
  }
  function goPrev() {
    if (currentStep > 1) gotoStep(currentStep - 1);
  }

  /* ─── Khởi tạo ────────────────────────────────────────────────────── */
  function init() {
    if (!currentLesson) {
      var stage = $('#mlb-lesson-stage');
      if (stage) stage.innerHTML = '<div class="mlb-loading">Không tìm thấy nội dung bài học.</div>';
      return;
    }

    // Restore step đã hoàn thành (nếu có) — đơn giản: nếu user revisit, mở lại step 1
    // để xem lại lý thuyết, không auto-jump tới step cuối.
    gotoStep(1);

    // Gắn footer nav
    var prevBtn = $('#mlb-prev-btn');
    var nextBtn = $('#mlb-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Expose public hooks
    window.MLB = {
      lesson: currentLesson,
      gotoStep: gotoStep,
      markComplete: markLessonComplete
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
