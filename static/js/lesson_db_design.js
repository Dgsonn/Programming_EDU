/* ============================================================================
 * lesson_db_design.js — Database Design lesson page logic
 * Drives the 4-step pipeline UI:
 *   Step 1: render theory (primer + visual DB + mission)
 *   Step 2: render MCQ with micro-interactions
 *   Step 3: drag-to-query with two-way sync to live IDE display
 *   Step 4: CodeMirror SQL editor + run + validate
 *
 * Data: window.LESSON_CONTENT['db_design'] (loaded from lesson_content.js)
 * Editor: CodeMirror 6 (loaded from CDN)
 * ============================================================================ */

(function () {
  'use strict';

  /* ─── State ───────────────────────────────────────────────────── */
  const state = {
    currentStep: 1,
    currentLesson: null,
    currentLessonIdx: 0,
    mcqLocked: false,
    step3Blocks: {},        // zone id → block element
    step3Placed: new Set(), // block token that has been placed
    step3History: [],       // undo stack — array of {zoneId, token, type}
    hintLevel: 0,
    xpEarned: 0,
    cmEditor: null,
    hearts: 3,               // Duolingo-style lives
    streakActive: true,
    mcqAnswers: [],         // Q1/Q2 user picks
    miniGamePlacements: {}, // chipId -> binId
    miniGameLocked: false,
    challengeState: null     // mode-specific state for step 4 dispatcher
  };

  const SYNTAX_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
                           'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS',
                           'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN',
                           'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
                           'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
                           'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW',
                           'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
                           'CHECK', 'DEFAULT', 'AUTO_INCREMENT', 'SERIAL'];

  /* ─── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  /* ── LeetCode-style tabs (Step 4) ─────────────────────────────── */
  function bindLeetCodeTabs() {
    // All .lc-tabs groups in Step 4 left pane
    document.querySelectorAll('.lc-tabs').forEach(tabsContainer => {
      const tabs = tabsContainer.querySelectorAll('.lc-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          // Active state for tabs
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          // Find sibling content within the same parent .pane
          const pane = tabsContainer.closest('.pane');
          if (!pane) return;
          // If we have data-tab, show matching content
          pane.querySelectorAll('.lc-tab-content').forEach(content => {
            if (content.dataset.tab === target) {
              content.classList.add('active');
            } else {
              content.classList.remove('active');
            }
          });
        });
      });
    });
  }

  /* ── Duolingo-style celebration (confetti) ────────────────────── */
  function celebrate() {
    if (typeof window.confetti === 'function') {
      // Fire from both sides for a "burst" feel
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#06B6D4', '#10B981', '#F59E0B', '#F97316']
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#06B6D4', '#10B981', '#F59E0B', '#F97316']
      });
    }
  }

  function init() {
    const data = window.LESSON_CONTENT && window.LESSON_CONTENT['db_design'];
    if (!data || !data.lessons || data.lessons.length === 0) {
      console.error('LESSON_CONTENT[db_design] not found');
      showError('Không tìm thấy nội dung bài học. Vui lòng liên hệ admin.');
      return;
    }

    // Get lesson index from URL or default to 0
    const params = new URLSearchParams(window.location.search);
    const idx = parseInt(params.get('lesson') || '0', 10);
    state.currentLessonIdx = Math.max(0, Math.min(idx, data.lessons.length - 1));
    state.currentLesson = data.lessons[state.currentLessonIdx];

    // Allow override of accent color per course
    if (data.accent_color) {
      document.documentElement.style.setProperty('--primary', data.accent_color);
    }

    // Bind Step 4 LeetCode-style tabs
    bindLeetCodeTabs();
    // Bind inline hint button for MCQ (if user clicks an option that needs hint)
    bindMCQInlineHints();

    renderStep1();
    renderStep2();
    renderStep3();
    initStep4();

    // Default to step 1
    goToStep(1);
  }

  function showError(msg) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;background:#0B1121;color:#94A3B8;font-family:Inter,sans-serif;">
        <div style="font-size:48px">⚠️</div>
        <div style="font-size:18px;color:#F1F5F9">${msg}</div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 1 — Theory
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep1() {
    const l = state.currentLesson;
    const s1 = l.step_1;

    document.getElementById('lesson-title').textContent = l.title;

    if (!s1) {
      document.querySelector('.step-1-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 1 / 4</span></div>
        <h1 class="lesson-title">${l.title}</h1>
        <p class="lesson-intro" style="opacity:0.5;font-style:italic;">
          Nội dung bài học này đang được cập nhật. Hãy thử bài khác trong roadmap.
        </p>
        <button class="next-btn primary" onclick="goToStep(2)">Tạm bỏ qua, tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Primer goals
    const goalList = document.getElementById('goal-list');
    goalList.innerHTML = '';
    (s1.primer.goal || []).forEach(g => {
      const li = document.createElement('li');
      li.innerHTML = g;
      goalList.appendChild(li);
    });

    // Intro & example
    document.getElementById('lesson-intro').innerHTML = s1.primer.intro || '';
    document.getElementById('lesson-example').innerHTML = s1.primer.example || '';

    // Theory extended (optional field — only show when present in data)
    const theoryEl = document.getElementById('theory-extended');
    const theoryContentEl = document.getElementById('theory-extended-content');
    if (s1.theory_extended && theoryEl && theoryContentEl) {
      theoryContentEl.innerHTML = s1.theory_extended;
      theoryEl.hidden = false;
    } else if (theoryEl) {
      theoryEl.hidden = true;
    }

    // Syntax example (optional field — only show when present in data)
    const syntaxEl = document.getElementById('syntax-example');
    const syntaxCodeEl = document.getElementById('syntax-example-code');
    const syntaxExplainEl = document.getElementById('syntax-example-explain');
    if (s1.syntax_example && syntaxEl && syntaxCodeEl && syntaxExplainEl) {
      syntaxCodeEl.innerHTML = highlightSimpleSQL(s1.syntax_example.code || '');
      syntaxExplainEl.innerHTML = s1.syntax_example.explain || '';
      syntaxEl.hidden = false;
    } else if (syntaxEl) {
      syntaxEl.hidden = true;
    }

    // Visual DB — Interactive Table Explorer (3D schema + linked data table)
    if (window.TableExplorer && s1.visual && s1.visual.schema) {
      window.TableExplorer.mount('#visual-db-panel', {
        schema: s1.visual.schema,
        data: s1.visual.data_preview || []
      });
    } else if (s1.visual && s1.visual.schema) {
      // Fallback to plain tables (only if visual is provided)
      renderSchemaTable(s1.visual.schema);
      renderDataTable(s1.visual.data_preview, s1.visual.schema);
    }

    // ── SVG Primer diagram (Premium — opt-in, không phá fallback) ──
    if (s1.visual && s1.visual.svg) {
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) {
        renderSVGPrimer(svgMount, s1.visual);
      }
    } else if (s1.visual && s1.visual.diagram) {
      // Diagram-as-data: {type: 'er'|'nf'|'flow', ...}
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) renderDiagramFromData(svgMount, s1.visual.diagram);
    } else {
      const svgMount = document.getElementById('primer-svg-mount');
      if (svgMount) svgMount.innerHTML = '';
    }
    // If neither, the panel will be hidden by the decomp-game block below

    // Decomp Game (Normal Forms Bài 6-10) — show ONLY when present
    if (s1.decomp_game) {
      if (window.DecompGame) {
        window.DecompGame.init({
          decomp: s1.decomp_game,
          onComplete: () => {
            // Award XP and show inline celebration
            const stageCount = (s1.decomp_game.stages || [s1.decomp_game]).length;
            addXP(30 * stageCount);
            celebrate();
          }
        });
      }
      // Hide the redundant static schema/data panels for Normal Form lessons —
      // the decomp game is the visual focus.
      const visualDbPanel = document.getElementById('visual-db-panel');
      if (visualDbPanel) visualDbPanel.style.display = 'none';
    } else {
      // Ensure the visual DB panel is visible for non-NF lessons
      const visualDbPanel = document.getElementById('visual-db-panel');
      if (visualDbPanel) visualDbPanel.style.display = '';
      // Clear any leftover decomp mount
      const decMount = document.getElementById('decomp-game-mount');
      if (decMount) decMount.innerHTML = '';
    }

    // Mission
    document.getElementById('mission-text').innerHTML = s1.mission || '';

    // Premium concept cards (shadcn Card-inspired) — opt-in
    const conceptMount = document.getElementById('concept-cards-mount');
    if (conceptMount) {
      if (s1.concept_cards && s1.concept_cards.length) {
        conceptMount.innerHTML = s1.concept_cards.map(c => `
          <div class="concept-card">
            <div class="concept-card-head">
              <div class="concept-card-icon"><i class="fa-solid ${escapeHtml(c.icon || 'fa-lightbulb')}"></i></div>
              <div class="concept-card-title">${c.title || ''}</div>
            </div>
            <div class="concept-card-body">${c.body || ''}</div>
          </div>
        `).join('');
      } else {
        conceptMount.innerHTML = '';
      }
    }
  }

  function renderSchemaTable(schema) {
    const wrap = document.getElementById('schema-table');
    document.getElementById('schema-table-name').textContent = schema.table_name;
    wrap.innerHTML = '';

    schema.columns.forEach(col => {
      const row = document.createElement('div');
      row.className = 'schema-row';
      row.innerHTML = `
        <span class="col-icon">${col.icon || (col.key === 'PK' ? '🔑' : '○')}</span>
        <span class="col-name">${col.name}</span>
        <span class="col-type">${col.type}</span>
        ${col.key ? `<span class="col-key">${col.key}</span>` : ''}
      `;
      wrap.appendChild(row);
    });
  }

  function renderDataTable(data, schema) {
    const table = document.getElementById('data-table');
    document.getElementById('data-row-count').textContent = `${data.length} rows`;
    table.innerHTML = '';

    // Header
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    schema.columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.name + (col.key === 'PK' ? ' 🔑' : '');
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach((cell, i) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (schema.columns[i] && schema.columns[i].key === 'PK') {
          td.classList.add('pk-cell');
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 2 — MCQ (2 questions + optional mini-game bonus)
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep2() {
    const l = state.currentLesson;
    const s2 = l.step_2;
    state.mcqAnswers = [];
    state.mcqLocked = false;

    if (!s2) {
      document.querySelector('.step-2-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 2 / 4</span></div>
        <h2 class="mcq-question">Nội dung trắc nghiệm đang cập nhật</h2>
        <button class="next-btn primary" onclick="goToStep(3)">Tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Backward compat: if old schema (s2.question + s2.options), wrap into mcq[0]
    let mcqList = s2.mcq;
    if (!mcqList && s2.question && s2.options) {
      mcqList = [{ question: s2.question, options: s2.options }];
    }
    if (!mcqList || mcqList.length === 0) {
      document.querySelector('.step-2-content').innerHTML = `
        <div class="eyebrow-row"><span class="step-pill">Bước 2 / 4</span></div>
        <h2 class="mcq-question">Nội dung trắc nghiệm đang cập nhật</h2>
        <button class="next-btn primary" onclick="goToStep(3)">Tiếp tục <i class="fa-solid fa-arrow-right"></i></button>
      `;
      return;
    }

    // Render first question (we'll progressively unlock Q2)
    renderMCQQuestion(0, mcqList);

    // Render mini-game if exists
    renderMiniGame(s2.mini_game);
  }

  function renderMCQQuestion(qIdx, mcqList) {
    const q = mcqList[qIdx];
    const total = mcqList.length;
    const counter = total > 1 ? `<span style="opacity:0.6;font-weight:500;">(${qIdx + 1}/${total})</span>` : '';
    document.getElementById('mcq-question').innerHTML = `${q.question} ${counter}`;
    const wrap = document.getElementById('mcq-options');
    wrap.innerHTML = '';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-option';
      btn.dataset.correct = opt.correct;
      btn.dataset.qIdx = qIdx;
      btn.dataset.optIdx = i;
      const letter = String.fromCharCode(65 + i);
      btn.innerHTML = `
        <span class="opt-letter">${letter}</span>
        <span>${opt.text}</span>
      `;
      btn.addEventListener('click', () => handleMCQClick(btn, opt, qIdx, mcqList));
      wrap.appendChild(btn);
    });

    // Hide explain/inline-hint until answered
    document.getElementById('mcq-explain').classList.add('hidden');
    document.getElementById('inline-hint').classList.add('hidden');
    document.getElementById('btn-next-step3').classList.add('hidden');
  }

  function handleMCQClick(btn, opt, qIdx, mcqList) {
    if (state.mcqLocked) return;
    state.mcqLocked = true;
    state.mcqAnswers[qIdx] = opt;

    const options = document.querySelectorAll(`.mcq-option[data-q-idx="${qIdx}"]`);

    if (opt.correct) {
      btn.classList.add('correct');
      showMCQExplain('Chính xác! Tuyệt vời 🎉');
      addXP(15);
      celebrate();
    } else {
      btn.classList.add('wrong');
      loseHeart();
      setTimeout(() => {
        options.forEach(o => {
          if (o.dataset.correct === 'true') o.classList.add('correct');
          else o.classList.add('dimmed', 'disabled');
        });
        showMCQExplain('Chưa đúng rồi — đáp án đúng đã highlight. Đọc kỹ rồi tiếp tục nhé!');
      }, 600);
    }

    options.forEach(o => { if (o !== btn) o.classList.add('disabled'); });

    // Move to next question OR enable "next step" button
    setTimeout(() => {
      const nextIdx = qIdx + 1;
      if (nextIdx < mcqList.length) {
        state.mcqLocked = false;
        renderMCQQuestion(nextIdx, mcqList);
      } else {
        // All questions done — check mini-game status
        const mg = state.currentLesson.step_2.mini_game;
        if (mg && !isMiniGameSolved()) {
          // Mini-game still unsolved → keep button hidden but unlock "Try mini-game"
          showMCQExplain('Câu hỏi xong rồi! 🎉 Thử mini-game bên dưới để ghi điểm thêm nhé.');
        } else {
          document.getElementById('btn-next-step3').classList.remove('hidden');
          if (mg && isMiniGameSolved()) addXP(10);
        }
      }
    }, opt.correct ? 600 : 1200);
  }

  function isMiniGameSolved() {
    const mg = state.currentLesson.step_2 && state.currentLesson.step_2.mini_game;
    if (!mg) return true; // no mini-game → "solved" trivially
    // Premium: dùng cờ chung (match/order/bug_spot set khi solve)
    if (state.miniGameSolved === true) return true;
    // Classify (cũ): check placements
    const sol = mg.solution || {};
    const placements = state.miniGamePlacements;
    for (const chipId in sol) {
      if (placements[chipId] !== sol[chipId]) return false;
    }
    return Object.keys(placements).length === Object.keys(sol).length;
  }

  /* ── Mini-game engine (drag chips into bins) ───────────────────── */
  function renderMiniGame(mg) {
    const wrap = document.getElementById('mini-game');
    if (!mg) {
      wrap.hidden = true;
      return;
    }
    // Premium dispatch: nếu có type, route sang renderer tương ứng
    if (mg.type === 'match') return renderMiniGameMatch(wrap, mg);
    if (mg.type === 'order') return renderMiniGameOrder(wrap, mg);
    if (mg.type === 'bug_spot') return renderMiniGameBugSpot(wrap, mg);
    // Mặc định: classify (backward compat — cũ không có type)
    wrap.hidden = false;
    state.miniGamePlacements = {};
    state.miniGameLocked = false;

    document.getElementById('mini-game-title').textContent = mg.title || 'Phân loại nhanh';
    document.getElementById('mini-game-instruction').innerHTML = mg.instruction || '';
    document.getElementById('mini-game-feedback').classList.add('hidden');
    document.getElementById('btn-mini-reset').onclick = () => renderMiniGame(mg);

    // Render chips
    const chipsHost = document.getElementById('mini-game-chips');
    chipsHost.innerHTML = '';
    (mg.chips || []).forEach(chip => {
      const el = document.createElement('div');
      el.className = 'mini-chip';
      el.draggable = true;
      el.dataset.chipId = chip.id;
      el.innerHTML = `<i class="fa-solid fa-cube"></i> ${chip.label}`;
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', chip.id);
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      chipsHost.appendChild(el);
    });

    // Render bins
    const binsHost = document.getElementById('mini-game-bins');
    binsHost.innerHTML = '';
    (mg.bins || []).forEach(bin => {
      const el = document.createElement('div');
      el.className = 'mini-bin';
      el.dataset.binId = bin.id;
      el.dataset.correct = bin.correct; // 'true' or 'false' (which one represents correct answer)
      const iconClass = bin.correct === 'true' ? 'fa-check' : 'fa-xmark';
      el.innerHTML = `
        <div class="mini-bin-label">
          <span class="bin-icon"><i class="fa-solid ${iconClass}"></i></span>
          ${bin.label}
        </div>
        <div class="mini-bin-chips" data-bin-chips></div>
      `;
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const chipId = e.dataTransfer.getData('text/plain');
        handleMiniDrop(chipId, bin.id);
      });
      binsHost.appendChild(el);
    });
  }

  function handleMiniDrop(chipId, binId) {
    if (state.miniGameLocked) return;
    // Remove from previous bin (if placed)
    if (state.miniGamePlacements[chipId]) {
      const oldBinId = state.miniGamePlacements[chipId];
      const oldBin = document.querySelector(`.mini-bin[data-bin-id="${oldBinId}"] .mini-bin-chips`);
      const oldChip = oldBin && oldBin.querySelector(`[data-chip-id="${chipId}"]`);
      if (oldChip) {
        // Send chip back to source pool
        const chipsHost = document.getElementById('mini-game-chips');
        const fullChip = (state.currentLesson.step_2.mini_game.chips || []).find(c => c.id === chipId);
        oldChip.remove();
        const newEl = document.createElement('div');
        newEl.className = 'mini-chip';
        newEl.draggable = true;
        newEl.dataset.chipId = chipId;
        newEl.innerHTML = `<i class="fa-solid fa-cube"></i> ${fullChip.label}`;
        attachMiniChipDrag(newEl, chipId);
        chipsHost.appendChild(newEl);
      }
    }
    state.miniGamePlacements[chipId] = binId;
    // Move visual chip
    const fullChip = (state.currentLesson.step_2.mini_game.chips || []).find(c => c.id === chipId);
    if (!fullChip) return;
    const newBin = document.querySelector(`.mini-bin[data-bin-id="${binId}"] .mini-bin-chips`);
    const sourcePool = document.getElementById('mini-game-chips');
    // Remove from source pool
    const sourceChip = sourcePool.querySelector(`[data-chip-id="${chipId}"]`);
    if (sourceChip) sourceChip.remove();
    // Add to new bin
    const newEl = document.createElement('div');
    newEl.className = 'mini-chip placed';
    newEl.dataset.chipId = chipId;
    newEl.innerHTML = `<i class="fa-solid fa-cube"></i> ${fullChip.label}`;
    attachMiniChipDrag(newEl, chipId);
    newBin.appendChild(newEl);
  }

  function attachMiniChipDrag(el, chipId) {
    el.addEventListener('dragstart', e => {
      if (state.miniGameLocked) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', chipId);
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  }

  window.checkMiniGame = function() {
    const mg = state.currentLesson.step_2 && state.currentLesson.step_2.mini_game;
    if (!mg || state.miniGameLocked) return;
    state.miniGameLocked = true;

    const sol = mg.solution || {};
    const placements = state.miniGamePlacements;
    const fb = document.getElementById('mini-game-feedback');
    fb.classList.remove('hidden', 'correct', 'wrong');

    let allCorrect = Object.keys(sol).length === Object.keys(placements).length;
    if (allCorrect) {
      for (const chipId in sol) {
        if (placements[chipId] !== sol[chipId]) { allCorrect = false; break; }
      }
    }

    // Color the bins
    document.querySelectorAll('.mini-bin').forEach(binEl => {
      const binId = binEl.dataset.binId;
      const chipEls = binEl.querySelectorAll('.mini-bin-chips .mini-chip');
      chipEls.forEach(chipEl => {
        const chipId = chipEl.dataset.chipId;
        if (sol[chipId] === binId) {
          chipEl.style.background = 'var(--success-soft)';
          chipEl.style.borderColor = 'var(--success)';
          chipEl.style.color = 'var(--success)';
        } else {
          chipEl.style.background = 'var(--danger-soft)';
          chipEl.style.borderColor = 'var(--danger)';
          chipEl.style.color = 'var(--danger)';
        }
      });
    });

    if (allCorrect) {
      fb.classList.add('correct');
      fb.innerHTML = '<i class="fa-solid fa-trophy"></i> Hoàn hảo! Bạn đã phân loại đúng hết. +15 XP';
      addXP(15);
      celebrate();
    } else {
      fb.classList.add('wrong');
      const correctCount = Object.keys(sol).filter(c => placements[c] === sol[c]).length;
      fb.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Đúng ${correctCount}/${Object.keys(sol).length}. Bấm 🔄 để thử lại.`;
    }

    // Enable "next step" button regardless (mini-game is bonus)
    document.getElementById('btn-next-step3').classList.remove('hidden');
  };

  function showMCQExplain(text) {
    const el = document.getElementById('mcq-explain');
    document.getElementById('mcq-explain-text').textContent = text;
    el.classList.remove('hidden');
  }

  /* Floating tooltip on pill click — tells user which zone this block belongs to.
   * Brilliant-style: passive hint, doesn't auto-place. User must still drag. */
  function showPillHint(pill, blockType, zoneName) {
    // Remove any existing tooltip
    const existing = document.querySelector('.pill-hint-tooltip');
    if (existing) existing.remove();

    const tip = document.createElement('div');
    tip.className = 'pill-hint-tooltip';

    const typeNames = {
      'kw':  'SQL keyword',
      'col': 'tên cột',
      'tbl': 'tên bảng',
      'op':  'toán tử so sánh',
      'val': 'giá trị',
      'fn':  'hàm SQL'
    };
    const typeName = typeNames[blockType] || 'khối lệnh';

    tip.innerHTML = `
      <div class="pill-hint-row">
        <span class="pill-hint-label">Loại:</span>
        <span class="pill-hint-val">${typeName}</span>
      </div>
      <div class="pill-hint-row">
        <span class="pill-hint-label">Thuộc về:</span>
        <span class="pill-hint-val pill-hint-zone">${zoneName || 'chưa rõ'}</span>
      </div>
      <div class="pill-hint-foot">Kéo thả — không tự động đặt nhé</div>
    `;
    document.body.appendChild(tip);

    // Position above pill
    const rect = pill.getBoundingClientRect();
    tip.style.left = (rect.left + rect.width / 2) + 'px';
    tip.style.top  = (rect.top - 8 + window.scrollY) + 'px';
    requestAnimationFrame(() => tip.classList.add('visible'));

    // Auto-dismiss after 2.4s or on next click anywhere
    const dismiss = () => {
      tip.classList.remove('visible');
      setTimeout(() => tip.remove(), 250);
      document.removeEventListener('click', dismiss, true);
    };
    setTimeout(dismiss, 2400);
    setTimeout(() => document.addEventListener('click', dismiss, true), 50);
  }

  /* Map zone id → friendly Vietnamese name for the pill hint tooltip */
  function zoneIdToName(zoneId, s3) {
    const map = {
      'select-line':  'SELECT (cột cần lấy)',
      'from-line':    'FROM (bảng nguồn)',
      'where-line':   'WHERE (điều kiện lọc)',
      'join-line':    'JOIN (kết bảng)',
      'on-line':      'ON (điều kiện nối)',
      'groupby-line': 'GROUP BY (nhóm)',
      'having-line':  'HAVING (lọc nhóm)',
      'orderby-line': 'ORDER BY (sắp xếp)',
      'limit-line':   'LIMIT (giới hạn)'
    };
    if (map[zoneId]) return map[zoneId];
    // Fallback to lesson config
    const z = s3.drop_zones.find(z => z.id === zoneId);
    if (z) return z.label || zoneId;
    return zoneId || null;
  }

  function showInlineHint(text) {
    const el = document.getElementById('inline-hint');
    if (!el) return;
    document.getElementById('inline-hint-text').textContent = text;
    el.classList.remove('hidden');
  }

  function bindMCQInlineHints() {
    // No-op: hints show automatically on wrong answer
    // (Reserved for future "Show Hint" button)
  }

  /* ── Hearts system (Duolingo-style) ───────────────────────────── */
  function loseHeart() {
    if (state.hearts <= 0) return;
    state.hearts--;
    updateHeartsDisplay();
    // Shake animation
    const heartsEl = document.getElementById('hearts-display');
    if (heartsEl) {
      heartsEl.classList.add('shake');
      setTimeout(() => heartsEl.classList.remove('shake'), 400);
    }
  }

  function updateHeartsDisplay() {
    const heartsEl = document.getElementById('hearts-display');
    if (!heartsEl) return;
    const icons = heartsEl.querySelectorAll('i');
    icons.forEach((icon, i) => {
      if (i >= state.hearts) {
        icon.classList.add('lost');
      } else {
        icon.classList.remove('lost');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 3 — Hybrid Drag-Query + Live IDE
   * ═══════════════════════════════════════════════════════════════ */
  function renderStep3() {
    const l = state.currentLesson;
    const s3 = l.step_3;

    if (!s3) {
      document.querySelector('section[data-step="3"] .split-pane').innerHTML = `
        <div style="padding:40px;color:var(--text-400);text-align:center;width:100%;">
          Nội dung kéo thả đang cập nhật.
        </div>
      `;
      return;
    }

    // Branch: flagship mechanic nếu có step_3.flagship
    if (s3.flagship) {
      renderFlagshipStep3(s3.flagship);
      return;
    }

    // Sticky mission banner
    renderStep3Mission(l.step_1);

    // Compact data preview (schema) in top of left pane
    renderStep3DataPreview(l.step_1);

    renderDropZones(s3);
    renderBlockBank(s3);
    state.step3Blocks = {};   // zoneId -> array of {token, type}
    state.step3Placed = new Set();
    state.step3History = [];
    state.step3XPAwarded = false;  // A4: reset XP guard cho Step 3 completion mới
    updateUndoButton();

    // Build Truck Grid map (big, in bottom of left pane, always visible)
    if (window.DragGame) {
      window.DragGame.init({
        lesson: l,
        expectedSql: s3.expected_sql
      });
    }

    // Reset scroll position so user always lands on top (drop zones visible, not bank)
    const rightPane = document.querySelector('.hybrid-layout .pane-right .drag-area');
    if (rightPane) rightPane.scrollTop = 0;

    updateIDEFromBlocks();
  }

  /* ── Flagship Step 3 mechanics (6 bài đặc biệt) ─────────────────────── */
  function renderFlagshipStep3(f) {
    const splitPane = document.querySelector('section[data-step="3"] .split-pane');
    const instruction = `<div class="flagship-banner" style="background:linear-gradient(135deg,#06b6d4,#a855f7);padding:14px 18px;border-radius:10px;color:#fff;margin-bottom:16px;line-height:1.6;">
      <div style="font-size:12px;letter-spacing:1.5px;opacity:0.85;margin-bottom:4px;">🏆 FLAGSHIP MECHANIC</div>
      <div style="font-size:14px;font-weight:500;">${f.instruction || ''}</div>
    </div>`;

    // A2 fix: dispatcher pattern + auto-init DnD theo type
    if (f.type === 'match_game') {
      splitPane.innerHTML = instruction + renderFlagshipMatch(f);
      setTimeout(() => initFlagshipMatchDnD(), 100);
    } else if (f.type === 'split_game') {
      splitPane.innerHTML = instruction + renderFlagshipSplit(f);
      setTimeout(() => initFlagshipSplitDnD(), 100);
    } else if (f.type === 'bug_spot') {
      splitPane.innerHTML = instruction + renderFlagshipBugSpot(f);
      setTimeout(() => initFlagshipBugSpotDnD(), 100);
    } else if (f.type === 'join_builder') {
      splitPane.innerHTML = instruction + renderFlagshipJoin(f);
      setTimeout(() => initFlagshipJoinDnD(), 100);
    } else {
      splitPane.innerHTML = instruction + '<div>Mechanic chưa hỗ trợ.</div>';
    }
  }

  /* ── Match Game (Bài 6 — Mapping ER) ────────────────────────────────── */
  function renderFlagshipMatch(f) {
    const sortedCards = [...f.cards].sort(() => Math.random() - 0.5);
    return `
      <div class="match-game" style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;">
        ${sortedCards.map(c => `
          <div class="match-slot" data-slot-order="${c.order}" data-card-id="${c.id}"
               style="background:rgba(6,182,212,0.08);border:2px dashed var(--primary);border-radius:8px;padding:14px 8px;text-align:center;min-height:80px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${c.order}</div>
            <div class="match-card-text" style="font-size:12px;line-height:1.4;">${c.text}</div>
          </div>
        `).join('')}
      </div>
      <div class="match-bank" style="margin-top:18px;padding:14px;background:rgba(168,85,247,0.06);border:2px solid #a855f7;border-radius:8px;display:flex;flex-wrap:wrap;gap:8px;">
        ${sortedCards.map(c => `
          <div class="match-card" data-card-id="${c.id}" draggable="true"
               style="background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;padding:10px 12px;border-radius:6px;cursor:grab;font-size:12px;line-height:1.4;user-select:none;">
            ${c.text}
          </div>
        `).join('')}
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipMatch()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipMatch()">Reset</button>
        <div id="flagship-match-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Split Game (Bài 9, 12 — 2NF, 4NF) ─────────────────────────────── */
  function renderFlagshipSplit(f) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:18px;margin-top:12px;">
        <div class="split-source" style="background:rgba(239,68,68,0.06);border:2px solid #ef4444;border-radius:8px;padding:14px;">
          <div style="font-size:12px;font-weight:600;color:#ef4444;margin-bottom:10px;">📦 BẢNG NGUỒN: ${f.source.name}</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
            ${f.source.columns.map(c => `
              <div class="split-col" data-col-name="${c.name}" draggable="true"
                   style="background:#1f2937;border:1px solid #ef4444;border-radius:6px;padding:8px 10px;cursor:grab;font-size:12px;">
                ${c.icon} ${c.name}
              </div>
            `).join('')}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${f.targets.map(t => `
            <div class="split-target" data-target-name="${t.name}"
                 style="background:rgba(34,197,94,0.06);border:2px dashed #22c55e;border-radius:8px;padding:14px;min-height:80px;">
              <div style="font-size:12px;font-weight:600;color:#22c55e;margin-bottom:4px;">${t.icon} BẢNG ĐÍCH: ${t.name}</div>
              <div style="font-size:11px;color:var(--text-400);margin-bottom:10px;">${t.description}</div>
              <div class="split-target-chips" style="display:flex;flex-wrap:wrap;gap:6px;min-height:30px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipSplit()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipSplit()">Reset</button>
        <button class="btn-secondary" onclick="showFlagshipSplitHint()">💡 Gợi ý</button>
        <div id="flagship-split-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Bug Spot (Bài 17, 18 — SQLi, Password) ────────────────────────── */
  function renderFlagshipBugSpot(f) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:12px;">
        <div class="bug-bank" style="display:flex;flex-direction:column;gap:8px;">
          ${f.chips.map(c => `
            <div class="bug-chip" data-chip-id="${c.id}" draggable="true"
                 style="background:rgba(168,85,247,0.08);border:2px solid #a855f7;border-radius:8px;padding:12px;cursor:grab;font-size:13px;line-height:1.5;font-family:'JetBrains Mono',monospace;">
              ${c.label}
            </div>
          `).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${f.bins.map(b => `
            <div class="bug-bin" data-bin-id="${b.id}"
                 style="background:rgba(34,197,94,${b.id === 'safe' ? '0.06' : '0.06'});border:2px dashed ${b.id === 'safe' ? '#22c55e' : '#ef4444'};border-radius:8px;padding:14px;min-height:120px;">
              <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:${b.id === 'safe' ? '#22c55e' : '#ef4444'};">${b.label}</div>
              <div class="bug-bin-chips" data-bin-chips style="display:flex;flex-direction:column;gap:6px;min-height:40px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipBugSpot()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipBugSpot()">Reset</button>
        <button class="btn-secondary" onclick="showFlagshipBugSpotHint()">💡 Gợi ý</button>
        <div id="flagship-bugspot-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  /* ── Join Builder (Bài 13 — Boss Battle 4-table JOIN) ─────────────── */
  function renderFlagshipJoin(f) {
    return `
      <div style="background:rgba(6,182,212,0.04);border:1px solid rgba(6,182,212,0.2);border-radius:8px;padding:14px;margin-bottom:14px;font-size:13px;line-height:1.6;">
        <strong style="color:var(--primary);">📊 Schema:</strong>
        <code class="code">gamer(g_id PK, nickname)</code> ·
        <code class="code">inventory_bridge(g_id, game_id, purchase_date) PK composite</code> ·
        <code class="code">game(game_id PK, title, st_id)</code> ·
        <code class="code">studio(st_id PK, st_name)</code>
      </div>
      <div class="join-blocks" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;padding:10px;background:rgba(168,85,247,0.05);border-radius:6px;">
        ${[...f.blocks].sort(() => Math.random() - 0.5).map((b, i) => `
          <span class="join-block" data-block-idx="${i}" draggable="true"
                style="background:linear-gradient(135deg,#1f2937,#374151);color:#fff;padding:6px 10px;border-radius:5px;cursor:grab;font-family:'JetBrains Mono',monospace;font-size:11px;border:1px solid rgba(255,255,255,0.1);">${b.token}</span>
        `).join('')}
      </div>
      <div class="join-target" id="join-target"
           style="background:#0a0e1a;border:1px solid rgba(6,182,212,0.3);border-radius:8px;padding:18px;min-height:140px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:2;color:#cbd5e1;display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start;">
        <span style="color:var(--text-400);font-size:12px;">↓ Kéo các thẻ SQL vào đây theo đúng thứ tự...</span>
      </div>
      <div style="margin-top:18px;display:flex;gap:10px;">
        <button class="btn-primary" onclick="checkFlagshipJoin()">Kiểm tra</button>
        <button class="btn-secondary" onclick="resetFlagshipJoin()">Reset</button>
        <div id="flagship-join-result" style="margin-left:auto;font-weight:600;"></div>
      </div>
    `;
  }

  function renderDropZones(s3) {
    const stack = document.getElementById('drop-zones');
    stack.innerHTML = '';

    s3.drop_zones.forEach(zone => {
      const line = document.createElement('div');
      line.className = 'drop-line';
      line.dataset.zone = zone.id;
      line.innerHTML = `
        <span class="drop-line-prompt">${zone.placeholder.split(' ')[0]}</span>
        <span class="drop-line-slot" data-slot="${zone.id}">${zone.placeholder.split(' ').slice(1).join(' ') || '...'}</span>
        <span class="broken-tooltip" data-broken-tooltip="${zone.id}">⚠️ Thứ tự chưa đúng — thử kéo swap trong slot</span>
      `;

      line.addEventListener('dragover', e => {
        e.preventDefault();
        line.classList.add('drag-over');
      });
      line.addEventListener('dragleave', () => line.classList.remove('drag-over'));
      line.addEventListener('drop', e => {
        e.preventDefault();
        line.classList.remove('drag-over');
        /* v3 redesign: use unified handler that supports both bank pills
           (token-only payload) and placed pills (__MOVE__:... payload).
           Drop on empty slot area → append at end. */
        const payload = e.dataTransfer.getData('text/plain');
        handleZoneOrPillDrop(zone.id, payload, null);
      });

      stack.appendChild(line);
    });
  }

  function renderBlockBank(s3) {
    const bank = document.getElementById('block-bank');
    bank.innerHTML = '';

    // Shuffle blocks randomly per load (Fisher-Yates) so user can't memorize order
    const shuffled = [...s3.blocks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.forEach(b => {
      const pill = document.createElement('div');
      pill.className = `logic-pill pill-${b.type}`;
      pill.textContent = b.token;
      pill.draggable = true;
      pill.dataset.type = b.type;
      pill.dataset.token = b.token;
      pill.dataset.slot = b.slot;

      // NO color anchor dot — pills are fully neutral (user-requested redesign).
      // User must figure out where each block goes by reasoning, not by matching colors.
      // Only a subtle border-left per type (kw/col/tbl/op/val) hints at "loại dữ liệu",
      // not at "zone đích". See CSS .logic-pill.pill-* rules.

      // Click = "where does this go?" — show a small floating tooltip near the pill
      // with the target zone name. Brilliant-style: passive hint, doesn't auto-place.
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const zoneId = slotToZone(b.slot, s3);
        const zoneName = zoneIdToName(zoneId, s3);
        showPillHint(pill, b.type, zoneName);
      });

      // Drag = the ONLY way to place. While dragging, light up the matching
      // zone with a steady glow so the user gets continuous feedback.
      pill.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', b.token);
        e.dataTransfer.effectAllowed = 'move';
        const zoneId = slotToZone(b.slot, s3);
        if (zoneId) {
          const zoneEl = document.querySelector(`.drop-line[data-zone="${zoneId}"]`);
          if (zoneEl) zoneEl.classList.add('drag-target-hint');
        }
      });
      pill.addEventListener('dragend', () => {
        document.querySelectorAll('.drop-line.drag-target-hint')
          .forEach(el => el.classList.remove('drag-target-hint'));
      });

      bank.appendChild(pill);
    });

    // Make bank a drop target so user can drag placed pills back here to remove
    bank.addEventListener('dragover', e => {
      const data = e.dataTransfer.types.includes('text/plain');
      if (data) {
        e.preventDefault();
        bank.classList.add('drag-over');
      }
    });
    bank.addEventListener('dragleave', e => {
      if (e.target === bank) bank.classList.remove('drag-over');
    });
    bank.addEventListener('drop', e => {
      e.preventDefault();
      bank.classList.remove('drag-over');
      /* v3 redesign: payload is __MOVE__:zoneId:token now.
         Dragging a placed pill to the bank = remove from zone. */
      const payload = e.dataTransfer.getData('text/plain');
      if (payload && payload.startsWith('__MOVE__:')) {
        const parts = payload.split(':');
        const zoneId = parts[1];
        const token = parts[2];
        removeBlockFromZone(zoneId, token);
      }
    });
  }

  /** Remove a placed block from a drop-zone (drag-back-to-bank flow) */
  function removeBlockFromZone(zoneId, token) {
    const arr = state.step3Blocks[zoneId];
    if (!arr) return;
    const idx = arr.findIndex(b => b.token === token);
    if (idx < 0) return;
    arr.splice(idx, 1);
    state.step3Placed.delete(token);

    // Re-enable bank pill
    document.querySelectorAll(`#block-bank .logic-pill[data-token="${token}"]`)
      .forEach(p => p.classList.remove('locked'));

    // Re-render the slot cleanly
    renderZone(zoneId, null);
    updateIDEFromBlocks();
  }

  // Populate Step 3 sticky mission banner from step_1.mission
  function renderStep3Mission(s1) {
    const el = document.getElementById('step3-mission-text');
    if (!el) return;
    el.innerHTML = s1.mission || 'Kéo thả các khối lệnh vào drop-zone để xây dựng câu SQL.';
  }

  // Populate compact schema preview in top of left pane (Step 3)
  // Reads step_1.visual.schema (already used by Step 1's visual-db).
  function renderStep3DataPreview(s1) {
    const el = document.getElementById('step3-data-content');
    if (!el) return;
    const schema = s1 && s1.visual && s1.visual.schema;
    if (!schema || !Array.isArray(schema.columns) || schema.columns.length === 0) {
      el.innerHTML = '<div class="data-preview-empty">Không có schema cho bài này.</div>';
      return;
    }
    const name = schema.table_name || 'table';
    const cols = schema.columns.map(c => {
      const pk = c.key === 'PK' ? 'pk' : '';
      return `<div class="dp-col ${pk}">
        <span>${pk ? '🔑 ' : ''}${c.name}</span>
        <span class="dp-col-type">${c.type || ''}</span>
      </div>`;
    }).join('');
    el.innerHTML = `
      <div class="dp-table">
        <div class="dp-table-name"><i class="fa-solid fa-table"></i> ${name}</div>
        ${cols}
      </div>
    `;
  }

  /** Map block.slot hint → drop zone id. Falls back to first non-keyword zone for keywords. */
  function slotToZone(slot, s3) {
    const map = {
      'kw-select': 'select-line',
      'kw-from':   'from-line',
      'kw-where':  'where-line',
      'kw-join':   'from-line',
      'kw-on':     'from-line',
      'kw-and':    'where-line',
      'kw-or':     'where-line',
      'col-1':     'select-line',
      'col-2':     'select-line',
      'col-3':     'select-line',
      'col-4':     'select-line',
      'col-on':    'from-line',
      'col-on2':   'from-line',
      'tbl':       'from-line',
      'tbl2':      'from-line',
      'tbl3':      'from-line',
      'wcol':      'where-line',
      'wcol-1':    'where-line',
      'wcol-2':    'where-line',
      'op':        'where-line',
      'op-1':      'where-line',
      'op-2':      'where-line',
      'val':       'where-line',
      'val-1':     'where-line',
      'val-2':     'where-line'
    };
    if (map[slot]) return map[slot];

    // Keyword → first zone that hasn't been started
    // Other → last zone with a keyword block
    if (slot && slot.startsWith('kw-')) {
      return s3.drop_zones.find(z => !state.step3Blocks[z.id] || state.step3Blocks[z.id].length === 0)?.id;
    }
    // For non-keywords, append to last zone with content
    for (let i = s3.drop_zones.length - 1; i >= 0; i--) {
      const zid = s3.drop_zones[i].id;
      if (state.step3Blocks[zid] && state.step3Blocks[zid].length > 0) {
        return zid;
      }
    }
    return s3.drop_zones[0].id;
  }

  /** Color for the anchor dot on bank pills and the matching zone border.
   *  Must match the --zone-color values in lesson_db_design.css. */
  const ZONE_COLORS = {
    'select-line':  '#06B6D4',
    'from-line':    '#F59E0B',
    'join-line':    '#F59E0B',
    'on-line':      '#A855F7',
    'where-line':   '#10B981',
    'groupby-line': '#8B5CF6',
    'having-line':  '#14B8A6',
    'orderby-line': '#EC4899',
    'limit-line':   '#FBBF24'
  };

  function getZoneColor(zoneId) {
    return ZONE_COLORS[zoneId] || null;
  }

  function placeBlockInSlot(pill, zoneId, slotEl) {
    pill.classList.add('locked');

    slotEl.classList.add('filled');

    // Clear placeholder text (keep for re-rendering)
    if (slotEl.children.length === 0 && slotEl.textContent.trim() !== '') {
      slotEl.innerHTML = '';
    }

    /* v3 redesign: NO auto-sort.
     * User's drop order is preserved exactly. If the order is wrong (e.g. WHERE: 101 then =)
     * the IDE will show the broken SQL and the subtle "broken" tooltip will guide them.
     * This forces the user to think about clause structure instead of being rescued by
     * a magical re-sorter.
     */
    const s3 = state.currentLesson.step_3;
    const newBlock = { token: pill.dataset.token, type: pill.dataset.type };

    if (!state.step3Blocks[zoneId]) state.step3Blocks[zoneId] = [];
    const arr = state.step3Blocks[zoneId];
    /* Always append at end — preserve drop order */
    arr.push(newBlock);
    state.step3Placed.add(pill.dataset.token);

    renderZone(zoneId, slotEl);
    updateIDEFromBlocks();
  }

  /** Re-render a drop-zone slot from state.step3Blocks[zoneId].
   *  Each placed pill is BOTH draggable (to swap/move/remove) AND a drop
   *  target (for in-slot drag-to-swap UX). The payload encodes intent:
   *    '__MOVE__:fromZone:token'  → user dragged from this zone (move/swap/remove)
   *    'token'                    → user dragged from bank (place new)
   */
  function renderZone(zoneId, slotEl) {
    if (!slotEl) slotEl = document.querySelector(`[data-slot="${zoneId}"]`);
    if (!slotEl) return;
    const arr = state.step3Blocks[zoneId] || [];
    slotEl.innerHTML = '';
    if (arr.length === 0) {
      const zDef = state.currentLesson.step_3.drop_zones.find(z => z.id === zoneId);
      slotEl.innerHTML = zDef ? (zDef.placeholder.split(' ').slice(1).join(' ') || '...') : '...';
      slotEl.classList.remove('filled');
      return;
    }
    slotEl.classList.add('filled');
    arr.forEach((b, i) => {
      if (i > 0) slotEl.appendChild(document.createTextNode(' '));
      const np = document.createElement('span');
      np.className = `logic-pill pill-${b.type}`;
      np.textContent = b.token;
      np.dataset.token = b.token;
      np.dataset.type = b.type;
      np.dataset.zoneId = zoneId;
      np.dataset.zoneIdx = i;
      np.draggable = true;

      /* Drag start — payload indicates "moving this pill from this zone" */
      np.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', '__MOVE__:' + zoneId + ':' + b.token);
        e.dataTransfer.effectAllowed = 'move';
        np.classList.add('dragging-back');
      });
      np.addEventListener('dragend', () => np.classList.remove('dragging-back'));

      /* Drop target — let user drop on a pill to swap (same zone) or
         move (different zone). The pill-level handler runs BEFORE the
         slot-level one because we call stopPropagation below. */
      np.addEventListener('dragover', e => {
        e.preventDefault();
        np.classList.add('swap-target');
      });
      np.addEventListener('dragleave', () => np.classList.remove('swap-target'));
      np.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        np.classList.remove('swap-target');
        const payload = e.dataTransfer.getData('text/plain');
        handleZoneOrPillDrop(zoneId, payload, np);
      });

      slotEl.appendChild(np);
    });
  }

  /* Unified drop handler — called from BOTH the slot's drop listener AND
     each pill's drop listener. Determines intent from payload:
       • 'token'                  → from bank, place new
       • '__MOVE__:from:token'    → from another zone, move (or swap if same zone)
     `targetEl` (optional) is the specific pill that received the drop, used
     to determine where in the zone the moved/placed pill should be inserted. */
  function handleZoneOrPillDrop(toZoneId, payload, targetEl) {
    if (!payload) return;

    let fromZoneId = null;
    let token;

    if (payload.startsWith('__MOVE__:')) {
      const parts = payload.split(':');
      fromZoneId = parts[1];
      token = parts[2];
    } else {
      token = payload;
    }

    /* Determine insertion index — where in the zone does this go?
     * -1 means "append at end". A target pill means "insert before it". */
    let insertIdx = -1;
    if (targetEl && targetEl.classList && targetEl.classList.contains('logic-pill')) {
      const targetToken = targetEl.dataset.token;
      const arr = state.step3Blocks[toZoneId] || [];
      insertIdx = arr.findIndex(b => b.token === targetToken);
      if (insertIdx < 0) insertIdx = -1;
    }

    if (fromZoneId) {
      moveBlockBetweenZones(fromZoneId, toZoneId, token, insertIdx);
    } else {
      placeFromBankAtPosition(toZoneId, token, insertIdx);
    }
  }

  /* Move a placed pill from one zone to another (or swap positions within
     the same zone). insertIdx = -1 means append at end.

     Swap semantics (SAME zone, drop onto another pill):
       True swap — the dragged pill takes the target's position, and the
       target pill takes the dragged pill's ORIGINAL position. This is
       what users expect when they drag-drop within a list to reorder.

       Concrete trace for [WHERE, id, =, 101] with drag 101 (idx 3) onto id (idx 1):
         arr[3] ↔ arr[1]  →  [WHERE, 101, =, id] ✓

     Cross-zone (different from/to zones):
       Just move — source goes to target zone at insertIdx, source zone
       loses the block. Target pill (if any) stays at its position (the
       source is inserted BEFORE the target).
  */
  function moveBlockBetweenZones(fromZone, toZone, token, insertIdx) {
    const fromArr = state.step3Blocks[fromZone];
    if (!fromArr) return;
    const srcIdx = fromArr.findIndex(b => b.token === token);
    if (srcIdx < 0) return;

    /* ── Cross-zone: simple move ─────────────────────────── */
    if (fromZone !== toZone) {
      const [block] = fromArr.splice(srcIdx, 1);
      if (!state.step3Blocks[toZone]) state.step3Blocks[toZone] = [];
      const toArr = state.step3Blocks[toZone];

      if (insertIdx < 0 || insertIdx > toArr.length) {
        toArr.push(block);
      } else {
        toArr.splice(insertIdx, 0, block);
      }

      renderZone(fromZone, null);
      renderZone(toZone, null);
      updateIDEFromBlocks();
      return;
    }

    /* ── Same zone: true swap ────────────────────────────── */
    /* No-op if drop would be at end (-1) or onto self */
    if (insertIdx < 0 || srcIdx === insertIdx) return;

    /* True swap — both pills exchange positions, others unaffected */
    const tmp = fromArr[srcIdx];
    fromArr[srcIdx] = fromArr[insertIdx];
    fromArr[insertIdx] = tmp;

    renderZone(toZone, null);
    updateIDEFromBlocks();
  }

  /* Place a bank pill into a zone at a specific position. Used for both
     append-at-end (insertIdx=-1) and insert-before-target-pill cases. */
  function placeFromBankAtPosition(zoneId, token, insertIdx) {
    const pill = Array.from(document.querySelectorAll('#block-bank .logic-pill'))
      .find(p => p.dataset.token === token);
    if (!pill) return;

    /* Validate type — pills that don't match zone.accepts bounce back. */
    const s3 = state.currentLesson.step_3;
    const blockDef = s3.blocks.find(b => b.token === token);
    const zone = s3.drop_zones.find(z => z.id === zoneId);
    if (blockDef && zone && !zone.accepts.includes(blockDef.type)) {
      pill.classList.add('error');
      setTimeout(() => pill.classList.remove('error'), 500);
      return;
    }

    pill.classList.add('locked');

    const newBlock = { token: pill.dataset.token, type: pill.dataset.type };
    if (!state.step3Blocks[zoneId]) state.step3Blocks[zoneId] = [];
    const arr = state.step3Blocks[zoneId];

    if (insertIdx < 0 || insertIdx > arr.length) {
      arr.push(newBlock);
    } else {
      arr.splice(insertIdx, 0, newBlock);
    }
    state.step3Placed.add(pill.dataset.token);

    renderZone(zoneId, null);
    updateIDEFromBlocks();
  }

  // (Undo removed — use drag-back to bank to remove individual blocks,
  //  or click Reset to clear everything.)

  window.handleDragReset = function() {
    if (!state.currentLesson) return;
    state.step3Blocks = {};
    state.step3Placed = new Set();
    state.step3History = [];
    // Re-enable all pills
    document.querySelectorAll('#block-bank .logic-pill').forEach(p => p.classList.remove('locked'));
    // Re-render all zones
    const s3 = state.currentLesson.step_3;
    s3.drop_zones.forEach(zone => {
      const slotEl = document.querySelector(`[data-slot="${zone.id}"]`);
      if (slotEl) {
        slotEl.innerHTML = zone.placeholder.split(' ').slice(1).join(' ') || '...';
        slotEl.classList.remove('filled');
      }
    });
    updateIDEFromBlocks();
    if (window.DragGame) window.DragGame.reset();
  };

  // No-op stub (kept for backwards compat — undo button was removed from HTML)
  function updateUndoButton() { /* no-op */ }

  function updateIDEFromBlocks() {
    const s3 = state.currentLesson.step_3;
    if (!s3) return;

    // Build SQL in canonical order, preserving zone order then within-zone order.
    // Auto-insert comma between two consecutive column-type tokens in the same zone
    // (e.g. SELECT name, price) — matches natural SQL convention.
    const parts = [];
    s3.drop_zones.forEach(zone => {
      const blocks = state.step3Blocks[zone.id];
      if (!blocks || !blocks.length) return;

      blocks.forEach((b, idx) => {
        parts.push(b.token);
        // Comma only between two value-type tokens in the SELECT clause
        // (col,col / col,fn / fn,col). Skip between value and operator (col,op / op,val).
        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
          if (isValueType(b.type) && isValueType(next.type)) {
            parts.push(',');
          }
        }
      });
    });

    const sql = parts.join(' ').trim().replace(/\s+,/g, ',');
    const ideCode = document.getElementById('ide-code');
    if (ideCode) ideCode.innerHTML = highlightSQL(sql);
    const ideCharCount = document.getElementById('ide-char-count');
    if (ideCharCount) ideCharCount.textContent = `${sql.length} ký tự`;
    if (document.getElementById('ide-line-numbers')) {
      renderLineNumbers(Math.max(1, sql.split('\n').length));
    }

    // ── Drive Truck Grid animation in right pane ────────────────
    updateTruckGrid();

    // ── Apply "broken" subtle warning if SQL is invalid ─────────
    applyBrokenState(sql, s3);

    updateRevealHint();
  }

  /* v3 redesign: Subtle "broken" feedback when user has placed all blocks
   * but the order is wrong (SQL doesn't match expected). The slot gets a
   * yellow tint + tooltip suggesting they swap order. No shake, no red —
   * gentle nudge that respects the user's effort.
   */
  function applyBrokenState(builtSql, s3) {
    if (!s3 || !s3.expected_sql) return;

    const expected = (s3.expected_sql || '').replace(/;$/, '').trim().replace(/\s+/g, ' ').toUpperCase();
    const built = (builtSql || '').replace(/\s+/g, ' ').toUpperCase();

    /* Only show "broken" if:
     *   1. User has placed ALL the expected blocks (count matches)
     *   2. But the built SQL doesn't match expected (order/format wrong)
     */
    const totalBlocks = Object.values(state.step3Blocks).reduce((s, a) => s + a.length, 0);
    const totalAvailable = s3.blocks.length;
    const allPlaced = totalBlocks === totalAvailable;
    const isBroken = allPlaced && built !== expected;

    s3.drop_zones.forEach(zone => {
      const lineEl = document.querySelector(`.drop-line[data-zone="${zone.id}"]`);
      if (!lineEl) return;
      if (isBroken) {
        lineEl.classList.add('broken');
      } else {
        lineEl.classList.remove('broken');
      }
    });
  }

  /* Extract a clean summary of placed blocks to feed DragGame.update().
     Pulls: fromTable (FROM-zone tbl token), columns (SELECT-zone col tokens),
     whereFilter (WHERE-zone reconstructed as "col op val"). Also returns
     isComplete=true when the SQL matches expected exactly. */
  function updateTruckGrid() {
    if (!window.DragGame) return;
    const s3 = state.currentLesson.step_3;
    if (!s3) return;

    const fromZone  = state.step3Blocks['from-line']  || [];
    const selZone   = state.step3Blocks['select-line']|| [];
    const whereZone = state.step3Blocks['where-line'] || [];

    const fromTable = fromZone.find(b => b.type === 'tbl')?.token || null;
    const columns   = selZone.filter(b => b.type === 'col').map(b => b.token);

    // Reconstruct WHERE expression: col op val (ignore the WHERE kw itself)
    const whereParts = whereZone
      .filter(b => b.type !== 'kw')
      .map(b => b.token);
    const whereFilter = whereParts.length ? whereParts.join(' ') : null;

    // Check completion: full SQL matches expected_sql (case-insensitive)
    const expected = (s3.expected_sql || '').replace(/;$/, '').trim().replace(/\s+/g, ' ').toUpperCase();
    const builtSQL = buildSQLString().replace(/\s+/g, ' ').toUpperCase();
    const isComplete = builtSQL === expected;

    window.DragGame.update({
      fromTable: fromTable,
      columns: columns,
      whereFilter: whereFilter,
      isComplete: isComplete
    });
  }

  function buildSQLString() {
    const s3 = state.currentLesson.step_3;
    const parts = [];
    s3.drop_zones.forEach(zone => {
      const blocks = state.step3Blocks[zone.id];
      if (!blocks || !blocks.length) return;
      blocks.forEach((b, idx) => {
        parts.push(b.token);
        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          // Comma only between two value-type tokens (col/fn/val) in same zone
          // Skip between value and operator (col,op / op,val) — those use space
          const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
          if (isValueType(b.type) && isValueType(next.type)) {
            parts.push(',');
          }
        }
      });
    });
    return parts.join(' ').trim().replace(/\s+,/g, ',');
  }

  function updateRevealHint() {
    const s3 = state.currentLesson.step_3;
    const totalBlocks = Object.values(state.step3Blocks).reduce((sum, arr) => sum + arr.length, 0);
    const totalAvailable = s3.blocks.length;
    const totalZones = s3.drop_zones.length;
    const filledZones = s3.drop_zones.filter(z => state.step3Blocks[z.id] && state.step3Blocks[z.id].length).length;

    const hintEl = document.getElementById('reveal-hint-text');
    if (!hintEl) return; // element removed in new compact layout

    if (totalBlocks === 0) {
      hintEl.innerHTML = 'Bắt đầu bằng cách kéo khối <strong>SELECT</strong> vào dòng đầu tiên.';
    } else if (filledZones < totalZones) {
      const next = s3.drop_zones.find(z => !state.step3Blocks[z.id] || state.step3Blocks[z.id].length === 0);
      if (next && s3.reveal_hints && s3.reveal_hints[next.id]) {
        hintEl.innerHTML = s3.reveal_hints[next.id];
      }
    } else if (totalBlocks < totalAvailable) {
      hintEl.innerHTML = 'Còn thừa khối lệnh chưa dùng. Có thể bạn đã chọn dư — bỏ qua cũng được, hoặc bấm <strong>Tới Tự Code</strong>.';
    } else {
      // All filled — check match (use same build logic as updateIDEFromBlocks)
      const parts = [];
      s3.drop_zones.forEach(zone => {
        const blocks = state.step3Blocks[zone.id];
        if (!blocks || !blocks.length) return;
        blocks.forEach((b, idx) => {
          parts.push(b.token);
          if (idx < blocks.length - 1) {
            const next = blocks[idx + 1];
            const isValueType = t => t === 'col' || t === 'fn' || t === 'val';
            if (isValueType(b.type) && isValueType(next.type)) parts.push(',');
          }
        });
      });
      const genStr = parts.join(' ').trim().replace(/\s+,/g, ',');
      const expected = s3.expected_sql.replace(/;$/, '').trim();

      const genNorm = genStr.replace(/\s+/g, ' ');
      const expNorm = expected.replace(/\s+/g, ' ');

      if (genNorm.toUpperCase() === expNorm.toUpperCase()) {
        hintEl.innerHTML = '🎉 Hoàn hảo! Câu SQL khớp 100%. Bấm <strong>Tới Tự Code</strong> để sang bước 4.';
        hintEl.parentElement.style.background = 'rgba(16, 185, 129, 0.08)';
        hintEl.parentElement.style.borderTopColor = 'rgba(16, 185, 129, 0.25)';
        hintEl.parentElement.style.color = 'var(--success)';
        // Guard A4: chỉ cộng XP Step 3 đúng 1 lần mỗi completion
        if (!state.step3XPAwarded) {
          state.step3XPAwarded = true;
          addXP(30);
        }
      } else {
        hintEl.innerHTML = '⚠️ Cú pháp gần đúng nhưng chưa khớp. Kiểm tra lại thứ tự hoặc dấu phẩy giữa các cột.';
        hintEl.parentElement.style.background = 'rgba(245, 158, 11, 0.08)';
        hintEl.parentElement.style.borderTopColor = 'rgba(245, 158, 11, 0.25)';
        hintEl.parentElement.style.color = 'var(--warning)';
      }
    }
  }

  function renderLineNumbers(n) {
    const el = document.getElementById('ide-line-numbers');
    el.innerHTML = Array.from({ length: n }, (_, i) => i + 1).join('<br>');
  }

  function highlightSQL(sql) {
    if (!sql) return '<span class="t-comment">-- Query của bạn sẽ hiện ở đây</span>';

    // Tokenize: keywords, strings, numbers, identifiers
    const tokens = sql.split(/(\s+|[;,()'])/);
    return tokens.map(t => {
      const upper = t.toUpperCase().trim();
      if (!t.trim()) return t;
      if (SYNTAX_KEYWORDS.includes(upper)) return `<span class="t-keyword">${escapeHtml(t)}</span>`;
      if (/^['"]/.test(t)) return `<span class="t-string">${escapeHtml(t)}</span>`;
      if (/^\d/.test(t)) return `<span class="t-number">${escapeHtml(t)}</span>`;
      if (/^[=<>!+\-*/]/.test(t)) return `<span class="t-operator">${escapeHtml(t)}</span>`;
      return escapeHtml(t);
    }).join('');
  }

  /* Simple SQL highlighter for static syntax example display (Step 1).
     Lighter than highlightSQL — only colors keywords, strings, numbers, comments. */
  function highlightSimpleSQL(code) {
    if (!code) return '';
    let html = escapeHtml(code);
    // Comments first (-- and #) so they don't get touched by keyword regex
    html = html.replace(/(--[^\n]*)/g, '<span class="sk-comment">$1</span>');
    // Keywords (case-insensitive, word boundary)
    const kwRe = new RegExp('\\b(' + SYNTAX_KEYWORDS.join('|') + ')\\b', 'gi');
    html = html.replace(kwRe, '<span class="sk-kw">$1</span>');
    // String literals
    html = html.replace(/('[^']*')/g, '<span class="sk-str">$1</span>');
    // Numbers (skip those already inside a span)
    html = html.replace(/(?<![>])\b(\d+\.?\d*)\b(?![<])/g, '<span class="sk-num">$1</span>');
    return html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ═══════════════════════════════════════════════════════════════
   * STEP 4 — Pure Code (CodeMirror + Run + Validate)
   * Dispatches to 4 challenge types: full_ide / mcq_code / fill_blank / bug_fix
   * ═══════════════════════════════════════════════════════════════ */
  function initStep4() {
    const l = state.currentLesson;
    const s4 = l.step_4;

    if (!s4) {
      document.querySelector('#step-4 .split-pane').innerHTML = `
        <div style="padding:40px;color:var(--text-400);text-align:center;width:100%;">
          Nội dung tự code đang cập nhật.
        </div>
      `;
      return;
    }

    // Determine challenge type (default: full_ide)
    const challengeType = l.challenge_type || s4.challenge_type || 'full_ide';
    state.challengeState = { type: challengeType, submitted: false };

    // Title + prompt
    document.getElementById('step4-title').textContent = l.title;
    document.getElementById('step4-prompt').innerHTML = s4.prompt || '';

    // Schema (left side) — common across all types
    renderStep4Schema(s4);

    // Premium enhanced: nếu có s4.schema thì render với CSS mới (ghi đè fallback)
    const schemaMount = document.getElementById('step4-schema');
    if (schemaMount && s4.schema && s4.schema.table_name) {
      enhanceStep4Schema(schemaMount, s4);
    }

    // Premium: hint panel với 4 levels (progressive)
    const hintMount = document.getElementById('step4-hint-mount');
    if (hintMount && s4.hints && s4.hints.length) {
      enhanceHintPanel(hintMount, s4);
    } else if (hintMount) {
      hintMount.innerHTML = '';
    }

    // Hide ALL challenge panes first
    document.querySelectorAll('.challenge-pane').forEach(p => { p.hidden = true; });

    // Dispatch to correct renderer
    const targetPane = document.querySelector(`.challenge-pane[data-challenge="${challengeType}"]`);
    if (targetPane) {
      targetPane.hidden = false;
      if (challengeType === 'full_ide') initChallengeFullIDE(s4, targetPane);
      else if (challengeType === 'mcq_code') initChallengeMCQCode(s4, targetPane);
      else if (challengeType === 'fill_blank') initChallengeFillBlank(s4, targetPane);
      else if (challengeType === 'bug_fix') initChallengeBugFix(s4, targetPane);
    }

    // Reset terminal
    const term = document.getElementById('terminal-output');
    term.innerHTML = '<span class="prompt-arrow">$</span> Đang chờ bạn hoàn thành thử thách...';
  }

  function renderStep4Schema(s4) {
    const schemaEl = document.getElementById('step4-schema');
    if (!schemaEl) return;
    // Guard: data có thể thiếu schema (vd: bài mcq_code không cần schema panel)
    if (!s4 || !s4.schema || !s4.schema.table_name) {
      schemaEl.innerHTML = '<div style="font-size:12px;color:var(--text-400);font-style:italic;padding:12px;">Không có schema cho bài này.</div>';
      return;
    }
    schemaEl.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:var(--text-500);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">
        <i class="fa-solid fa-table"></i> ${s4.schema.table_name}
      </div>
    `;
    s4.schema.columns.forEach(col => {
      const row = document.createElement('div');
      row.className = 'schema-row';
      row.innerHTML = `
        <span class="col-icon">${col.key === 'PK' ? '🔑' : '○'}</span>
        <span class="col-name">${col.name}</span>
        <span class="col-type">${col.type}</span>
        ${col.key ? `<span class="col-key">${col.key}</span>` : ''}
      `;
      schemaEl.appendChild(row);
    });
    if (s4.schema.data && s4.schema.data.length) {
      const dataWrap = document.createElement('div');
      dataWrap.style.marginTop = '12px';
      dataWrap.innerHTML = `
        <div style="font-size:10px;font-weight:700;color:var(--text-500);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Sample Data</div>
        <table class="data-table" style="font-size:11px;">
          <thead><tr>${s4.schema.columns.map(c => `<th>${c.name}</th>`).join('')}</tr></thead>
          <tbody>${s4.schema.data.map(r => `<tr>${r.map((c, i) => `<td class="${s4.schema.columns[i].key === 'PK' ? 'pk-cell' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      `;
      schemaEl.appendChild(dataWrap);
    }
  }

  /* ── Challenge type: full_ide (CodeMirror) ─────────────────────── */
  function initChallengeFullIDE(s4, pane) {
    pane.innerHTML = '<div id="code-editor" style="flex:1;display:flex;flex-direction:column;min-height:0;"></div>';
    if (window.CodeMirror) {
      state.cmEditor = CodeMirror(pane.querySelector('#code-editor'), {
        value: s4.starter || '-- Viết query của bạn ở đây\n',
        mode: 'text/x-sql',
        theme: 'material-darker',
        lineNumbers: true,
        indentUnit: 2,
        tabSize: 2,
        autofocus: false,
        matchBrackets: true
      });
      state.cmEditor.on('change', () => {
        if (state.hintLevel > 0) {
          state.hintLevel = 0;
          document.getElementById('step4-hint-card').classList.add('hidden');
        }
      });
    } else {
      pane.querySelector('#code-editor').innerHTML =
        `<textarea id="cm-fallback" style="flex:1;width:100%;background:#0F172A;color:#F1F5F9;font-family:'JetBrains Mono',monospace;font-size:14px;padding:16px;border:none;outline:none;resize:none;line-height:1.7;">${s4.starter || ''}</textarea>`;
    }
  }

  /* ── Challenge type: mcq_code (4 query options) ────────────────── */
  function initChallengeMCQCode(s4, pane) {
    state.challengeState.mcqCodeLocked = false;
    state.challengeState.mcqCodeAnswer = null;
    const host = pane.querySelector('#mcq-code-host');
    host.innerHTML = `
      <p class="mcq-code-question">${s4.prompt || 'Chọn câu SQL đúng:'}</p>
      <div class="mcq-code-options" id="mcq-code-options"></div>
    `;
    const wrap = host.querySelector('#mcq-code-options');
    (s4.options || []).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mcq-code-option';
      btn.dataset.correct = opt.correct;
      btn.dataset.optIdx = i;
      btn.innerHTML = `
        <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
        <pre style="margin:0;background:transparent;padding:0;font-family:inherit;color:inherit;white-space:pre-wrap;">${escapeHtml(opt.text)}</pre>
      `;
      btn.addEventListener('click', () => handleMCQCodeClick(btn, opt, s4));
      wrap.appendChild(btn);
    });
  }

  function handleMCQCodeClick(btn, opt, s4) {
    if (state.challengeState.mcqCodeLocked) return;
    state.challengeState.mcqCodeLocked = true;
    state.challengeState.mcqCodeAnswer = opt;

    const options = document.querySelectorAll('.mcq-code-option');
    if (opt.correct) {
      btn.classList.add('correct');
      addXP(15);
      celebrate();
      flashTerminal('success', `✓ Đúng rồi! Đáp án chính là option này.\n\n→ ${s4.xp_reward || 50} XP + 10 Gems!`);
      setTimeout(showSuccess, 1000);
    } else {
      btn.classList.add('wrong');
      loseHeart();
      setTimeout(() => {
        options.forEach(o => {
          if (o.dataset.correct === 'true') o.classList.add('correct');
          else o.classList.add('dimmed');
        });
        flashTerminal('error', `✗ Sai rồi — đáp án đúng đã highlight.\n${opt.explain || 'Đọc lại đề bài và schema bên trái.'}`);
      }, 400);
    }
  }

  /* ── Challenge type: fill_blank (partial SQL with input boxes) ─── */
  function initChallengeFillBlank(s4, pane) {
    state.challengeState.fillBlankAnswers = {};
    const host = pane.querySelector('#fill-blank-host');
    // s4.template = 'SELECT ____ FROM ____ WHERE ____ = ____;'
    // s4.blanks = [{id, hint, expected}]
    const template = s4.template || '';
    const blanks = s4.blanks || [];

    let html = `<p class="fill-blank-instruction">${s4.prompt || 'Điền các từ khóa/cột còn thiếu vào chỗ trống:'}</p>`;
    html += '<div class="fill-blank-code" id="fill-blank-code">';
    // Replace ____ with input
    const parts = template.split('____');
    parts.forEach((part, i) => {
      html += escapeHtml(part);
      if (i < parts.length - 1) {
        const blank = blanks[i] || { id: `b${i}`, hint: '' };
        html += `<input type="text" class="fill-blank-input" data-blank-idx="${i}" placeholder="${blank.hint || '?'}" autocomplete="off" spellcheck="false" />`;
      }
    });
    html += '</div>';
    if (blanks.length > 0) {
      html += `<p class="fill-blank-hint"><i class="fa-solid fa-keyboard"></i> Gợi ý: ${blanks.map(b => `<code>${b.hint || b.expected}</code>`).join(' · ')}</p>`;
    }
    host.innerHTML = html;
  }

  /* ── Challenge type: bug_fix (fix wrong SQL) ──────────────────── */
  function initChallengeBugFix(s4, pane) {
    state.challengeState.bugFix = { answer: s4.buggy || '' };
    const host = pane.querySelector('#bug-fix-host');
    const lines = (s4.buggy || '').split('\n');
    const buggyLineIdx = s4.buggy_line !== undefined ? s4.buggy_line : 0;

    let html = `<div class="bug-fix-brief">${s4.prompt || '<strong>Bug:</strong> Query dưới đây chạy SAI. Sửa cho ra kết quả đúng. (Click vào dòng lỗi để edit)'}</div>`;
    html += '<div class="bug-fix-editor" id="bug-fix-editor" contenteditable="true" spellcheck="false">';
    lines.forEach((line, i) => {
      const isBuggy = (i === buggyLineIdx);
      html += `<span class="bug-fix-line${isBuggy ? ' buggy' : ''}" data-line-idx="${i}">${escapeHtml(line) || '&nbsp;'}</span>`;
    });
    html += '</div>';
    html += '<p class="fill-blank-hint" style="margin-top:8px;"><i class="fa-solid fa-bug"></i> Dòng được tô đỏ là dòng nghi ngờ — bạn click trực tiếp vào đó để sửa.</p>';
    host.innerHTML = html;
  }

  /* ── Dispatcher: Run / Submit (used by onclick) ────────────────── */
  window.handleChallengeRun = function(isSubmit) {
    const s4 = state.currentLesson.step_4;
    const type = state.challengeState && state.challengeState.type || 'full_ide';
    if (type === 'full_ide') return runCodeIDE(isSubmit);
    if (type === 'mcq_code') {
      // mcq_code handles its own click; Run button is mostly disabled / informative
      flashTerminal('info', 'Chọn 1 trong 4 đáp án bên trên rồi bấm Submit để chốt.');
      return;
    }
    if (type === 'fill_blank') return runCodeFillBlank(isSubmit);
    if (type === 'bug_fix') return runCodeBugFix(isSubmit);
  };

  window.handleChallengeReset = function() {
    initStep4();
  };

  function runCodeIDE(isSubmit) {
    const userCode = state.cmEditor
      ? state.cmEditor.getValue().trim()
      : (document.getElementById('cm-fallback') || {}).value || '';
    const term = document.getElementById('terminal-output');
    const s4 = state.currentLesson.step_4;

    if (!userCode) {
      flashTerminal('error', '[!] Bạn chưa nhập query nào. Hãy thử gõ SELECT ... và nhấn Run.');
      return;
    }
    flashTerminal('info', `$ ${isSubmit ? 'Đang submit...' : 'Đang chạy thử...'}`);

    setTimeout(() => {
      const result = validateSQL(userCode, s4.expected_sql);
      if (result.correct) {
        flashTerminal('success', `✓ Accepted! (0.04s)\n\n${result.feedback || 'Đáp án đúng 100%.'}\n\n→ ${s4.xp_reward || 50} XP + 10 Gems!`);
        addXP(s4.xp_reward || 50);
        if (isSubmit) { celebrate(); setTimeout(showSuccess, 1200); }
      } else {
        flashTerminal('error', `✗ Wrong Answer\n\n${result.error || 'Query chưa đúng.'}\n\n${result.suggestion || ''}`);
        if (isSubmit) loseHeart();
        if (s4.hints && s4.hints.length > 0) showNextHint();
      }
    }, 600);
  }

  function runCodeFillBlank(isSubmit) {
    const inputs = document.querySelectorAll('.fill-blank-input');
    const s4 = state.currentLesson.step_4;
    const blanks = s4.blanks || [];

    let correct = 0;
    inputs.forEach((inp, i) => {
      const expected = (blanks[i] && blanks[i].expected || '').trim().toUpperCase();
      const got = inp.value.trim().toUpperCase();
      inp.classList.remove('correct', 'wrong');
      if (got === expected) {
        inp.classList.add('correct');
        correct++;
      } else {
        inp.classList.add('wrong');
      }
    });

    if (correct === inputs.length) {
      flashTerminal('success', `✓ Tuyệt vời! Bạn đã điền đúng ${correct}/${inputs.length} ô.\n\n→ ${s4.xp_reward || 50} XP!`);
      addXP(s4.xp_reward || 50);
      if (isSubmit) { celebrate(); setTimeout(showSuccess, 1200); }
    } else {
      flashTerminal('error', `✗ Đúng ${correct}/${inputs.length}. Kiểm tra lại các ô tô đỏ.`);
      if (isSubmit) loseHeart();
    }
  }

  function runCodeBugFix(isSubmit) {
    const editor = document.getElementById('bug-fix-editor');
    const s4 = state.currentLesson.step_4;
    if (!editor) return;
    const userSQL = editor.innerText.trim();
    const result = validateSQL(userSQL, s4.expected_sql);

    if (result.correct) {
      flashTerminal('success', `✓ Đã sửa xong! Query giờ trả về kết quả đúng.\n\n→ ${s4.xp_reward || 50} XP!`);
      addXP(s4.xp_reward || 50);
      if (isSubmit) { celebrate(); setTimeout(showSuccess, 1200); }
    } else {
      flashTerminal('error', `✗ Vẫn còn lỗi. ${result.error || 'Kiểm tra lại từng dòng.'}`);
      if (isSubmit) loseHeart();
    }
  }

  function flashTerminal(kind, text) {
    const term = document.getElementById('terminal-output');
    const cls = kind === 'success' ? 'success-line' : kind === 'error' ? 'error-line' : 'info-line';
    term.innerHTML = `<span class="${cls}">${escapeHtml(text)}</span>`;
  }

  function validateSQL(userSQL, expectedSQL) {
    const u = normalizeSQL(userSQL);
    const e = normalizeSQL(expectedSQL);

    // Exact match (case-insensitive, whitespace-insensitive)
    if (u === e) {
      return { correct: true, feedback: 'Cú pháp và giá trị khớp hoàn toàn với đáp án mong đợi.' };
    }

    // Clause-by-clause analysis
    const uClauses = extractClauses(userSQL);
    const eClauses = extractClauses(expectedSQL);

    const errors = [];

    // Check SELECT
    if (!uClauses.select) {
      errors.push('Thiếu mệnh đề SELECT.');
    } else if (uClauses.select !== eClauses.select) {
      errors.push(`SELECT không khớp: bạn chọn "${uClauses.select}" nhưng đáp án cần "${eClauses.select}".`);
    }

    // Check FROM
    if (!uClauses.from) {
      errors.push('Thiếu mệnh đề FROM — máy không biết truy vấn bảng nào.');
    } else if (uClauses.from !== eClauses.from) {
      errors.push(`FROM không khớp: bạn dùng "${uClauses.from}" nhưng đáp án là "${eClauses.from}".`);
    }

    // Check WHERE
    if (eClauses.where && !uClauses.where) {
      errors.push('Thiếu mệnh đề WHERE — cần lọc điều kiện để lấy đúng 1 record.');
    } else if (eClauses.where && uClauses.where && uClauses.where !== eClauses.where) {
      errors.push(`WHERE không khớp: bạn viết "${uClauses.where}" nhưng đáp án cần "${eClauses.where}".`);
    }

    if (errors.length === 0) {
      // Clauses match but exact string differs (e.g. extra spaces, optional semicolons)
      return { correct: true, feedback: 'Câu query hợp lệ về mặt logic.' };
    }

    return {
      correct: false,
      error: errors.join(' '),
      suggestion: 'Thử so sánh với từng dòng của đáp án. Bạn có thể bấm nút "💡 Gợi ý" bên trái.'
    };
  }

  function normalizeSQL(s) {
    return s
      .replace(/;$/, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([,()])\s*/g, '$1')
      .replace(/\s*=\s*/g, '=')
      .trim()
      .toUpperCase();
  }

  function extractClauses(sql) {
    const result = { select: null, from: null, where: null };
    const upper = sql.toUpperCase();

    // SELECT ... FROM
    const selectMatch = upper.match(/SELECT\s+(.+?)\s+FROM/i);
    if (selectMatch) result.select = selectMatch[1].trim().replace(/\s+/g, '').toUpperCase();

    // FROM
    const fromMatch = upper.match(/FROM\s+(\w+)/i);
    if (fromMatch) result.from = fromMatch[1].trim().toUpperCase();

    // WHERE
    const whereMatch = upper.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|;|$)/i);
    if (whereMatch) result.where = whereMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();

    return result;
  }

  function showNextHint() {
    const s4 = state.currentLesson.step_4;
    if (!s4.hints || state.hintLevel >= s4.hints.length) return;

    const hint = s4.hints[state.hintLevel];
    document.getElementById('hint-level').textContent = `Gợi ý ${state.hintLevel + 1}/${s4.hints.length}`;
    document.getElementById('hint-text').innerHTML = hint.text;
    document.getElementById('step4-hint-card').classList.remove('hidden');
    state.hintLevel++;
  }

  // Backward compat: keep window.runCode for any leftover references
  window.runCode = runCodeIDE;
  window.showNextHint = showNextHint;

  /* ═══════════════════════════════════════════════════════════════
   * Navigation
   * ═══════════════════════════════════════════════════════════════ */
  const STEP_NAMES = {
    1: 'Lý thuyết',
    2: 'Trắc nghiệm',
    3: 'Kéo thả',
    4: 'Tự code'
  };
  const TOTAL_STEPS = 4;

  function updateNavFooter() {
    const step = state.currentStep;
    const backBtn = document.getElementById('nav-back');
    const nextBtn = document.getElementById('nav-next');
    const currentEl = document.getElementById('nav-step-current');
    const nameEl = document.getElementById('nav-step-name');

    if (backBtn) backBtn.disabled = step <= 1;
    if (nextBtn) nextBtn.disabled = step >= TOTAL_STEPS;

    if (currentEl) {
      if (currentEl.textContent !== String(step)) {
        currentEl.textContent = String(step);
        currentEl.classList.remove('bump');
        // force reflow to restart animation
        void currentEl.offsetWidth;
        currentEl.classList.add('bump');
        setTimeout(() => currentEl.classList.remove('bump'), 300);
      }
    }
    if (nameEl) nameEl.textContent = STEP_NAMES[step] || '';
  }

  window.navBack = function () {
    if (state.currentStep > 1) window.goToStep(state.currentStep - 1);
  };

  window.navNext = function () {
    if (state.currentStep < TOTAL_STEPS) window.goToStep(state.currentStep + 1);
  };

  // Keyboard shortcuts: ←/→ navigate, but only when not typing in an input/editor
  function isEditingText() {
    const ae = document.activeElement;
    if (!ae) return false;
    const tag = (ae.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (ae.isContentEditable) return true;
    // CodeMirror's content is a .CodeMirror element with its own input
    if (ae.closest && ae.closest('.CodeMirror')) return true;
    return false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (isEditingText()) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      window.navBack();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      window.navNext();
    }
  });

  window.goToStep = function (step) {
    if (step < 1 || step > TOTAL_STEPS) return;

    // Update panes
    document.querySelectorAll('.step-pane').forEach(p => p.classList.remove('active'));
    document.querySelector(`.step-pane[data-step="${step}"]`).classList.add('active');

    // Update progress track
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      el.classList.remove('active', 'done');
      const stepNum = i + 1;
      if (stepNum < step) el.classList.add('done');
      else if (stepNum === step) el.classList.add('active');
    });

    state.currentStep = step;
    updateNavFooter();

    // Refresh CodeMirror layout (CodeMirror needs explicit refresh after becoming visible)
    if (step === 4 && state.cmEditor) {
      setTimeout(() => state.cmEditor.refresh(), 100);
    }

    // Reset Truck Grid when entering Step 3 (fresh puzzle state)
    if (step === 3 && window.DragGame) {
      window.DragGame.reset();
    }

    // Init challenge pane on entering step 4
    if (step === 4) {
      // Re-init challenge to make sure layout/CodeMirror is correct
      // (initStep4 was called once at page load — refresh it on step entry)
      const c = state.challengeState;
      if (!c) {
        initStep4();
      } else if (c.type === 'full_ide' && state.cmEditor) {
        // CodeMirror refresh already handled above
      }
    }
  };

  window.exitLesson = function () {
    if (confirm('Bạn có chắc muốn thoát? Tiến độ bài này sẽ KHÔNG được lưu (chưa hoàn thành).')) {
      window.location.href = '/courses/db_design';
    }
  };

  window.reportBug = function () {
    const subject = encodeURIComponent(`[Báo lỗi] Bài ${state.currentLessonIdx + 1}: ${state.currentLesson.title}`);
    window.location.href = `mailto:support@programming-edu.com?subject=${subject}`;
  };

  /* ═══════════════════════════════════════════════════════════════
   * Success modal
   * ═══════════════════════════════════════════════════════════════ */
  function showSuccess() {
    document.getElementById('success-message').textContent =
      state.currentLesson.step_4.success_message || 'Bạn đã hoàn thành bài học!';
    document.getElementById('reward-xp').textContent = `+${state.currentLesson.step_4.xp_reward || 50}`;
    document.getElementById('success-modal').classList.remove('hidden');
  }

  window.closeSuccess = function () {
    document.getElementById('success-modal').classList.add('hidden');
  };

  window.nextLesson = function () {
    const data = window.LESSON_CONTENT['db_design'];
    const nextIdx = state.currentLessonIdx + 1;
    if (nextIdx < data.lessons.length) {
      window.location.href = `/lesson/db_design?lesson=${nextIdx}`;
    } else {
      window.location.href = '/courses/db_design';
    }
  };

  /* ═══════════════════════════════════════════════════════════════
   * XP counter
   * ═══════════════════════════════════════════════════════════════ */
  function addXP(amount) {
    state.xpEarned += amount;
    const el = document.getElementById('xp-current');
    if (!el) return;
    el.textContent = state.xpEarned;
    el.parentElement.style.transform = 'scale(1.15)';
    setTimeout(() => { el.parentElement.style.transform = 'scale(1)'; }, 200);
  }

  /* ═══════════════════════════════════════════════════════════════
   * FLAGSHIP STEP 3 HANDLERS — INSIDE IIFE (A1+A3 fix)
   * Was outside IIFE before → ReferenceError khi truy cập state/renderStep3
   * Now lives inside IIFE → có thể truy cập state, renderStep3, goToStep, addXP
   * ═══════════════════════════════════════════════════════════════ */

  // A3: completeStep wrapper — chuyển sang Step 4 + cộng XP (1 lần)
  function completeStep3() {
    if (!state.step3XPAwarded) {
      state.step3XPAwarded = true;
      addXP(30);
    }
    goToStep(4);
  }

  /* ── Match Game (Bài 6 — Mapping ER) ────────────────────────────────── */
  function initFlagshipMatchDnD() {
    document.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.cardId);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.match-slot').forEach(slot => {
      slot.addEventListener('dragover', e => { e.preventDefault(); slot.style.background = 'rgba(168,85,247,0.15)'; });
      slot.addEventListener('dragleave', e => { slot.style.background = ''; });
      slot.addEventListener('drop', e => {
        e.preventDefault();
        slot.style.background = '';
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.querySelector(`.match-card[data-card-id="${cardId}"]`);
        if (card) {
          const prev = card.parentElement;
          if (prev.classList.contains('match-slot')) {
            prev.querySelector('.match-card-text').textContent = prev.dataset.cardId;
            prev.style.background = '';
          }
          slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div>`;
          slot.appendChild(card);
          card.style.width = '100%';
        }
      });
    });
    document.querySelectorAll('.match-slot').forEach(slot => {
      slot.addEventListener('click', e => {
        const card = slot.querySelector('.match-card');
        if (card) {
          const bank = document.querySelector('.match-bank');
          bank.appendChild(card);
          card.style.width = 'auto';
          slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div><div class="match-card-text" style="font-size:12px;line-height:1.4;color:var(--text-400);">(trống)</div>`;
        }
      });
    });
  }

  window.checkFlagshipMatch = function() {
    initFlagshipMatchDnD();
    const slots = document.querySelectorAll('.match-slot');
    let correct = 0, total = slots.length;
    const f = state.currentLesson.step_3.flagship;
    slots.forEach(slot => {
      const expectedOrder = parseInt(slot.dataset.slotOrder);
      const card = slot.querySelector('.match-card');
      if (card) {
        const cardOrder = f.cards.find(c => c.id === card.dataset.cardId)?.order;
        if (cardOrder === expectedOrder) {
          correct++;
          slot.style.background = 'rgba(34,197,94,0.15)';
          slot.style.borderColor = '#22c55e';
          slot.style.borderStyle = 'solid';
        } else {
          slot.style.background = 'rgba(239,68,68,0.15)';
          slot.style.borderColor = '#ef4444';
          slot.style.borderStyle = 'solid';
        }
      } else {
        slot.style.background = 'rgba(239,68,68,0.15)';
        slot.style.borderColor = '#ef4444';
        slot.style.borderStyle = 'solid';
      }
    });
    const result = document.getElementById('flagship-match-result');
    if (correct === total) {
      result.textContent = `🎉 Hoàn hảo! ${correct}/${total} bước đúng thứ tự.`;
      result.style.color = 'var(--success)';
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} đúng. Thử lại!`;
      result.style.color = 'var(--danger)';
    }
  };

  window.resetFlagshipMatch = function() {
    const f = state.currentLesson.step_3.flagship;
    const bank = document.querySelector('.match-bank');
    const slots = document.querySelectorAll('.match-slot');
    if (!bank) return;
    bank.innerHTML = '';
    slots.forEach(slot => {
      slot.innerHTML = `<div style="font-size:11px;color:var(--text-400);margin-bottom:6px;">Bước ${slot.dataset.slotOrder}</div><div class="match-card-text" style="font-size:12px;line-height:1.4;color:var(--text-400);">(trống)</div>`;
      slot.style.background = '';
      slot.style.borderColor = '';
      slot.style.borderStyle = '';
    });
    // Fisher-Yates shuffle (fix biased sort)
    const cards = [...f.cards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(c => {
      const div = document.createElement('div');
      div.className = 'match-card';
      div.dataset.cardId = c.id;
      div.setAttribute('draggable', 'true');
      div.style.cssText = 'background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;padding:10px 12px;border-radius:6px;cursor:grab;font-size:12px;line-height:1.4;user-select:none;';
      div.textContent = c.text;
      div.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; });
      bank.appendChild(div);
    });
    const r = document.getElementById('flagship-match-result');
    if (r) { r.textContent = ''; }
  };

  /* ── Split Game (Bài 9, 12 — 2NF, 4NF) ─────────────────────────────── */
  function initFlagshipSplitDnD() {
    document.querySelectorAll('.split-col').forEach(col => {
      col.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', col.dataset.colName);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.split-target').forEach(target => {
      target.addEventListener('dragover', e => { e.preventDefault(); target.style.background = 'rgba(34,197,94,0.15)'; });
      target.addEventListener('dragleave', e => { target.style.background = ''; });
      target.addEventListener('drop', e => {
        e.preventDefault();
        target.style.background = '';
        const colName = e.dataTransfer.getData('text/plain');
        const col = document.querySelector(`.split-col[data-col-name="${colName}"]`);
        if (col) {
          const chipsHost = target.querySelector('.split-target-chips');
          const span = document.createElement('span');
          span.className = 'split-target-chip';
          span.dataset.colName = colName;
          span.textContent = col.textContent;
          span.style.cssText = 'background:#1f2937;border:1px solid #22c55e;border-radius:5px;padding:5px 8px;font-size:12px;cursor:pointer;';
          span.addEventListener('click', () => {
            const source = document.querySelector('.split-source > div:last-child');
            if (source) source.appendChild(col);
            span.remove();
          });
          chipsHost.appendChild(span);
          col.remove();
        }
      });
    });
  }

  window.checkFlagshipSplit = function() {
    initFlagshipSplitDnD();
    const f = state.currentLesson.step_3.flagship;
    let correct = 0, total = 0;
    f.solution && Object.entries(f.solution).forEach(([target, cols]) => total += cols.length);

    f.solution && Object.entries(f.solution).forEach(([targetName, expectedCols]) => {
      const target = document.querySelector(`.split-target[data-target-name="${targetName}"]`);
      if (!target) return;
      const placedChips = target.querySelectorAll('.split-target-chip');
      const placedNames = Array.from(placedChips).map(c => c.dataset.colName);
      expectedCols.forEach(c => {
        if (placedNames.includes(c)) correct++;
      });
    });
    const result = document.getElementById('flagship-split-result');
    if (correct === total && total > 0) {
      result.textContent = `🎉 Hoàn hảo! ${correct}/${total} cột đúng chỗ.`;
      result.style.color = 'var(--success)';
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} cột đúng. Thử lại!`;
      result.style.color = 'var(--danger)';
    }
  };

  window.resetFlagshipSplit = function() {
    renderStep3();
    const r = document.getElementById('flagship-split-result');
    if (r) r.textContent = '';
  };

  window.showFlagshipSplitHint = function() {
    const f = state.currentLesson.step_3.flagship;
    alert('💡 Gợi ý: ' + (f.hint || 'Xem lại lý thuyết trong Step 1.'));
  };

  /* ── Bug Spot (Bài 17, 18 — SQLi, Password) ────────────────────────── */
  function initFlagshipBugSpotDnD() {
    document.querySelectorAll('.bug-chip').forEach(chip => {
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', chip.dataset.chipId);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    document.querySelectorAll('.bug-bin').forEach(bin => {
      bin.addEventListener('dragover', e => { e.preventDefault(); bin.style.background = 'rgba(168,85,247,0.15)'; });
      bin.addEventListener('dragleave', e => { bin.style.background = ''; });
      bin.addEventListener('drop', e => {
        e.preventDefault();
        bin.style.background = '';
        const chipId = e.dataTransfer.getData('text/plain');
        const chip = document.querySelector(`.bug-chip[data-chip-id="${chipId}"]`);
        if (chip) {
          const chipsHost = bin.querySelector('.bug-bin-chips');
          const clone = chip.cloneNode(true);
          clone.style.cursor = 'pointer';
          clone.addEventListener('click', () => {
            document.querySelector('.bug-bank').appendChild(chip);
            clone.remove();
          });
          chipsHost.appendChild(clone);
          chip.remove();
        }
      });
    });
  }

  window.checkFlagshipBugSpot = function() {
    initFlagshipBugSpotDnD();
    const f = state.currentLesson.step_3.flagship;
    let correct = 0, total = f.chips.length;
    f.chips.forEach(c => {
      const placed = document.querySelector(`.bug-bin .bug-chip[data-chip-id="${c.id}"]`);
      if (placed && f.solution[c.id] === placed.closest('.bug-bin').dataset.binId) {
        correct++;
        placed.style.background = 'rgba(34,197,94,0.2)';
        placed.style.borderColor = '#22c55e';
      } else if (placed) {
        placed.style.background = 'rgba(239,68,68,0.2)';
        placed.style.borderColor = '#ef4444';
      }
    });
    const result = document.getElementById('flagship-bugspot-result');
    if (correct === total && total > 0) {
      result.textContent = `🎉 Hoàn hảo! Phân loại đúng cả ${total}.`;
      result.style.color = 'var(--success)';
      completeStep3();
    } else {
      result.textContent = `${correct}/${total} đúng. Thử lại!`;
      result.style.color = 'var(--danger)';
    }
  };

  window.resetFlagshipBugSpot = function() {
    renderStep3();
    const r = document.getElementById('flagship-bugspot-result');
    if (r) r.textContent = '';
  };

  window.showFlagshipBugSpotHint = function() {
    const f = state.currentLesson.step_3.flagship;
    alert('💡 Gợi ý: ' + (f.hint || 'Xem lại lý thuyết trong Step 1.'));
  };

  /* ── Join Builder (Bài 13 — Boss Battle 4-table JOIN) ─────────────── */
  function initFlagshipJoinDnD() {
    const target = document.getElementById('join-target');
    if (!target) return;
    document.querySelectorAll('.join-block').forEach(b => {
      b.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', b.dataset.blockIdx);
        e.dataTransfer.effectAllowed = 'move';
      });
      b.addEventListener('dblclick', () => {
        target.appendChild(b);
        updateJoinIDE();
      });
    });
    target.addEventListener('dragover', e => { e.preventDefault(); target.style.background = '#0e1424'; });
    target.addEventListener('dragleave', e => { target.style.background = ''; });
    target.addEventListener('drop', e => {
      e.preventDefault();
      target.style.background = '';
      const idx = e.dataTransfer.getData('text/plain');
      const b = document.querySelector(`.join-block[data-block-idx="${idx}"]`);
      if (b) {
        target.appendChild(b);
        updateJoinIDE();
      }
    });
  }

  function updateJoinIDE() {
    const target = document.getElementById('join-target');
    if (!target) return;
    const blocks = target.querySelectorAll('.join-block');
    const sql = Array.from(blocks).map(b => b.textContent).join(' ');
    const ide = document.querySelector('.code-editor textarea, .ide-textarea');
    if (ide) ide.value = sql;
  }

  window.checkFlagshipJoin = function() {
    const f = state.currentLesson.step_3.flagship;
    const target = document.getElementById('join-target');
    const placed = target.querySelectorAll('.join-block');
    const placedTokens = Array.from(placed).map(b => b.textContent);
    const expectedTokens = f.blocks.map(b => b.token);
    const placedStr = placedTokens.join(' ').replace(/\s+/g, ' ').trim();
    const expectedStr = expectedTokens.join(' ').replace(/\s+/g, ' ').trim();
    const result = document.getElementById('flagship-join-result');
    if (placedStr === expectedStr) {
      result.textContent = '🎉 Hoàn hảo! 4-table JOIN đúng thứ tự!';
      result.style.color = 'var(--success)';
      completeStep3();
    } else {
      result.textContent = `Sai thứ tự hoặc thiếu thẻ. Đặt ${placed.length}/${expectedTokens.length}.`;
      result.style.color = 'var(--danger)';
    }
  };

  window.resetFlagshipJoin = function() {
    renderStep3();
    const r = document.getElementById('flagship-join-result');
    if (r) r.textContent = '';
  };

  /* ═══════════════════════════════════════════════════════════════
   * PREMIUM RENDERERS — shadcn/Brilliant inspired
   * Thêm 2026-06-21: SVG primer + 3 mini-game mới + step4 enhanced
   * ═══════════════════════════════════════════════════════════════ */

  /* ── A. SVG Primer renderer ────────────────────────────────── */
  // Mở SVG inline an toàn (chỉ chấp nhận trusted content từ lesson_content.js)
  // Không user-input, không fetch từ external → safe.
  function renderSVGPrimer(mountEl, visual) {
    if (!mountEl) return;
    if (visual.svg) {
      // Direct SVG string
      mountEl.innerHTML = `<div class="primer-svg">${visual.svg}</div>`;
    } else {
      mountEl.innerHTML = '';
    }
  }

  // Render diagram từ data object (tiện cho editor — không phải raw SVG)
  // Hỗ trợ 3 loại: 'er' | 'nf' | 'flow'
  function renderDiagramFromData(mountEl, diagram) {
    if (!mountEl || !diagram || !diagram.type) return;
    let html = '';
    if (diagram.type === 'er') {
      html = buildERDiagramHTML(diagram);
    } else if (diagram.type === 'nf') {
      html = buildNormalizePairHTML(diagram);
    } else if (diagram.type === 'flow') {
      html = buildQueryFlowHTML(diagram);
    } else {
      mountEl.innerHTML = '';
      return;
    }
    mountEl.innerHTML = `<div class="primer-svg">${html}</div>`;
  }

  // ER diagram: 1+ entities, mỗi entity có name + columns; optional connectors
  function buildERDiagramHTML(d) {
    const entities = d.entities || [];
    const connectors = d.connectors || [];
    const width = d.width || 600;
    const height = d.height || 280;
    const colW = 170;
    const rowH = 22;
    const headerH = 30;
    const entityPositions = [];

    // ARIA: Mô tả tổng quan sơ đồ cho screen reader
    const ariaSummary = entities.map(e => `${e.name} (${(e.columns || []).length} cột)`).join(', ');
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sơ đồ ER gồm: ${ariaSummary}">`;

    // Compute entity positions
    const totalW = entities.length * (colW + 40) - 40;
    const startX = (width - totalW) / 2;
    entities.forEach((e, i) => {
      const x = startX + i * (colW + 40);
      const h = headerH + (e.columns || []).length * rowH + 14;
      const y = (height - h) / 2;
      entityPositions.push({ x, y, w: colW, h, name: e.name });
    });

    // Draw connectors first (behind entities)
    connectors.forEach(c => {
      const from = entityPositions.find(p => p.name === c.from);
      const to = entityPositions.find(p => p.name === c.to);
      if (!from || !to) return;
      const x1 = from.x + from.w;
      const y1 = from.y + from.h / 2;
      const x2 = to.x;
      const y2 = to.y + to.h / 2;
      const midX = (x1 + x2) / 2;
      svg += `<path class="er-connector" d="M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}" aria-label="Mối quan hệ giữa ${c.from} và ${c.to}${c.label ? ': ' + c.label : ''}" />`;
      // Cardinality labels
      svg += `<text class="er-cardinality" x="${x1 + 10}" y="${y1 - 6}">${c.fromCard || '1'}</text>`;
      svg += `<text class="er-cardinality" x="${x2 - 10}" y="${y2 - 6}">${c.toCard || 'N'}</text>`;
      // Label in middle
      if (c.label) {
        svg += `<text class="er-connector-label" x="${midX}" y="${(y1 + y2) / 2 - 6}">${escapeXml(c.label)}</text>`;
      }
    });

    // Draw entities
    entities.forEach((e, i) => {
      const pos = entityPositions[i];
      const cls = e.weak ? 'er-entity-rect weak' : 'er-entity-rect';
      svg += `<rect class="${cls}" x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" role="img" aria-label="Entity ${e.name} với ${(e.columns || []).length} cột" />`;
      // Header
      svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${headerH}" fill="rgba(6,182,212,0.18)" />`;
      svg += `<text class="er-entity-title" x="${pos.x + pos.w / 2}" y="${pos.y + 20}">${escapeXml(e.name)}</text>`;
      // Columns
      (e.columns || []).forEach((col, j) => {
        const cy = pos.y + headerH + 14 + j * rowH;
        const isPk = col.key === 'PK';
        const isDerived = col.derived === true;
        let cls = 'er-col';
        if (isPk) cls += ' pk';
        if (isDerived) cls += ' derived';
        const icon = isPk ? '🔑 ' : (col.icon ? col.icon + ' ' : '');
        svg += `<text class="${cls}" x="${pos.x + 12}" y="${cy}">${icon}${escapeXml(col.name)}</text>`;
        if (col.type) {
          svg += `<text class="er-col" x="${pos.x + pos.w - 12}" y="${cy}" text-anchor="end" fill="var(--text-500)">${col.type}</text>`;
        }
      });
    });

    // Notes
    if (d.note) {
      svg += `<text class="er-connector-label" x="${width / 2}" y="${height - 8}">${escapeXml(d.note)}</text>`;
    }

    svg += `</svg>`;
    return svg;
  }

  // Normalization before/after: d.before, d.after (mỗi cái là {title, columns, rows, violations, fixes})
  function buildNormalizePairHTML(d) {
    const before = d.before || {};
    const after = d.after || {};
    let html = `<div class="nf-pair">`;
    html += `<div class="nf-side before">
      <div class="nf-side-label">${escapeHtml(before.title || 'TRƯỚC')}</div>
      <table class="nf-table">
        <thead><tr>${(before.columns || []).map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${(before.rows || []).map((row, ri) =>
          `<tr>${row.map((cell, ci) => {
            const v = (before.violations || {})[`${ri}-${ci}`];
            const cls = v ? 'violation' : '';
            return `<td class="${cls}">${escapeHtml(String(cell))}${v ? ` ⚠️` : ''}</td>`;
          }).join('')}</tr>`
        ).join('')}</tbody>
      </table>
    </div>`;
    html += `<div class="nf-arrow"><i class="fa-solid fa-arrow-right"></i></div>`;
    html += `<div class="nf-side after">
      <div class="nf-side-label">${escapeHtml(after.title || 'SAU')}</div>
      <table class="nf-table">
        <thead><tr>${(after.columns || []).map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${(after.rows || []).map((row, ri) =>
          `<tr>${row.map((cell, ci) => {
            const f = (after.fixes || {})[`${ri}-${ci}`];
            const cls = f ? 'fixed' : '';
            return `<td class="${cls}">${escapeHtml(String(cell))}${f ? ` ✓` : ''}</td>`;
          }).join('')}</tr>`
        ).join('')}</tbody>
      </table>
    </div>`;
    if (d.note) {
      html += `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--text-400); text-align: center; margin-top: 4px;">${escapeHtml(d.note)}</div>`;
    }
    html += `</div>`;
    return html;
  }

  // Query flow: vertical, 3-6 steps
  function buildQueryFlowHTML(d) {
    const steps = d.steps || [];
    let html = `<div class="qf-flow">`;
    steps.forEach((step, i) => {
      html += `<div class="qf-step">
        <div class="qf-step-icon"><i class="fa-solid ${escapeHtml(step.icon || 'fa-circle')}"></i></div>
        <div class="qf-step-label">
          <strong>${escapeHtml(step.title)}</strong>
          <span>${escapeHtml(step.sub || '')}</span>
        </div>
        ${step.payload ? `<span class="qf-payload">${escapeHtml(step.payload)}</span>` : ''}
      </div>`;
      if (i < steps.length - 1) html += `<div class="qf-arrow-down"></div>`;
    });
    html += `</div>`;
    return html;
  }

  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── B. Mini-game: Match (nối cặp) ──────────────────────── */
  // Data: { type:'match', title, instruction, pairs:[{left,right}], solution:{leftId:rightId} }
  function renderMiniGameMatch(container, mg) {
    if (!container || !mg) return;
    const pairs = mg.pairs || [];
    // Shuffle right column for game
    const rights = pairs.map(p => p.right).slice();
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rights[i], rights[j]] = [rights[j], rights[i]];
    }
    const matches = {}; // leftId -> rightId
    let selectedLeft = null;

    let html = `<div class="mini-game" data-mg-type="match">
      <div class="mini-game-title"><i class="fa-solid fa-link"></i> ${escapeHtml(mg.title || 'Nối cặp')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Click chọn 1 ô bên trái, rồi click ô tương ứng bên phải để nối cặp.'}</div>
      <div class="mg-match-board">
        <div class="mg-match-col mg-match-left" id="mg-match-left">
          ${pairs.map(p => `<div class="mg-match-item" data-left-id="${escapeHtml(p.leftId || p.left)}">${escapeHtml(p.left)}</div>`).join('')}
        </div>
        <div class="mg-match-line-col" id="mg-match-lines"></div>
        <div class="mg-match-col mg-match-right" id="mg-match-right">
          ${rights.map(r => `<div class="mg-match-item" data-right-id="${escapeHtml(r.id || r)}">${escapeHtml(r.label || r)}</div>`).join('')}
        </div>
      </div>
      <div id="mg-match-feedback" class="mg-match-feedback" style="display:none;"></div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="mg-order-btn" id="mg-match-check">Kiểm tra</button>
        <button class="mg-order-btn secondary" id="mg-match-reset">Làm lại</button>
      </div>
    </div>`;
    container.innerHTML = html;

    // Wire up click
    container.querySelectorAll('#mg-match-left .mg-match-item').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('matched')) return;
        container.querySelectorAll('#mg-match-left .mg-match-item.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedLeft = el.dataset.leftId;
      });
    });
    container.querySelectorAll('#mg-match-right .mg-match-item').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('matched')) return;
        if (!selectedLeft) {
          flashTip(container, 'Chọn 1 ô bên trái trước!');
          return;
        }
        matches[selectedLeft] = el.dataset.rightId;
        // Visual hint: highlight pair
        const leftEl = container.querySelector(`#mg-match-left .mg-match-item[data-left-id="${selectedLeft}"]`);
        leftEl.style.outline = '2px solid var(--primary)';
        el.style.outline = '2px solid var(--primary)';
        setTimeout(() => { leftEl.style.outline = ''; el.style.outline = ''; }, 600);
        selectedLeft = null;
        container.querySelectorAll('#mg-match-left .mg-match-item.selected').forEach(s => s.classList.remove('selected'));
      });
    });

    container.querySelector('#mg-match-check').onclick = () => {
      const sol = mg.solution || {};
      let allCorrect = pairs.length === Object.keys(matches).length;
      let correctCount = 0;
      Object.keys(matches).forEach(leftId => {
        if (sol[leftId] === matches[leftId]) correctCount++;
      });
      if (allCorrect && correctCount === pairs.length) {
        // Mark all matched
        container.querySelectorAll('.mg-match-item').forEach(el => el.classList.add('matched'));
        showMiniFeedback(container, 'mg-match-feedback', true, `Hoàn hảo! Nối đúng ${correctCount}/${pairs.length} cặp. +${mg.xp || 20} XP`);
        awardXP(mg.xp || 20);
      } else {
        showMiniFeedback(container, 'mg-match-feedback', false, `Sai ${pairs.length - correctCount} cặp. Thử lại nhé!`);
      }
    };
    container.querySelector('#mg-match-reset').onclick = () => renderMiniGameMatch(container, mg);
  }

  /* ── C. Mini-game: Order (kéo thả sắp xếp) ─────────────── */
  // Data: { type:'order', title, instruction, items:[{id,label}], solution:{id:order} }
  function renderMiniGameOrder(container, mg) {
    if (!container || !mg) return;
    const items = (mg.items || []).slice();
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    let html = `<div class="mini-game" data-mg-type="order">
      <div class="mini-game-title"><i class="fa-solid fa-sort"></i> ${escapeHtml(mg.title || 'Sắp xếp thứ tự')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Kéo thả để sắp xếp theo đúng thứ tự.'}</div>
      <div class="mg-order-list" id="mg-order-list">
        ${items.map((it, i) => `<div class="mg-order-item" draggable="true" data-item-id="${escapeHtml(it.id)}">
          <span class="mg-order-num">${i + 1}</span>
          <span class="mg-order-label">${escapeHtml(it.label)}</span>
          <span class="mg-order-grip"><i class="fa-solid fa-grip-vertical"></i></span>
        </div>`).join('')}
      </div>
      <div id="mg-order-feedback" class="mg-match-feedback" style="display:none;"></div>
      <div style="margin-top:12px;display:flex;gap:8px;">
        <button class="mg-order-btn" id="mg-order-check">Kiểm tra</button>
        <button class="mg-order-btn secondary" id="mg-order-reset">Làm lại</button>
      </div>
    </div>`;
    container.innerHTML = html;

    // Drag-drop reordering
    const list = container.querySelector('#mg-order-list');
    let dragEl = null;
    list.querySelectorAll('.mg-order-item').forEach(el => {
      el.addEventListener('dragstart', e => {
        dragEl = el;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => el.classList.add('dragging'), 0);
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        list.querySelectorAll('.mg-order-item').forEach(x => x.classList.remove('drag-over'));
        // Renumber
        list.querySelectorAll('.mg-order-num').forEach((n, i) => n.textContent = i + 1);
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        if (dragEl && dragEl !== el) {
          const allItems = [...list.querySelectorAll('.mg-order-item')];
          const dragIdx = allItems.indexOf(dragEl);
          const dropIdx = allItems.indexOf(el);
          if (dragIdx < dropIdx) el.after(dragEl);
          else el.before(dragEl);
          list.querySelectorAll('.mg-order-num').forEach((n, i) => n.textContent = i + 1);
        }
      });
    });

    container.querySelector('#mg-order-check').onclick = () => {
      const sol = mg.solution || {};
      const order = [...list.querySelectorAll('.mg-order-item')].map((el, i) => ({ id: el.dataset.itemId, pos: i + 1 }));
      let correct = 0;
      order.forEach(o => { if (sol[o.id] === o.pos) correct++; });
      list.querySelectorAll('.mg-order-item').forEach(el => {
        const id = el.dataset.itemId;
        if (sol[id] === [...list.querySelectorAll('.mg-order-item')].indexOf(el) + 1) {
          el.classList.add('correct'); el.classList.remove('wrong');
        } else {
          el.classList.add('wrong'); el.classList.remove('correct');
        }
      });
      if (correct === order.length) {
        showMiniFeedback(container, 'mg-order-feedback', true, `Hoàn hảo! Đúng ${correct}/${order.length} vị trí. +${mg.xp || 20} XP`);
        awardXP(mg.xp || 20);
      } else {
        showMiniFeedback(container, 'mg-order-feedback', false, `Sai ${order.length - correct} vị trí. Số đỏ = sai, xanh = đúng.`);
      }
    };
    container.querySelector('#mg-order-reset').onclick = () => renderMiniGameOrder(container, mg);
  }

  /* ── D. Mini-game: Bug Spot (tìm lỗi trong code) ──────── */
  // Data: { type:'bug_spot', title, instruction, code:'SELECT * FORM...', bugs:[{line, char, type, description}], xp }
  function renderMiniGameBugSpot(container, mg) {
    if (!container || !mg) return;
    const code = mg.code || '';
    const lines = code.split('\n');
    let selectedLine = null;

    let html = `<div class="mini-game" data-mg-type="bug_spot">
      <div class="mini-game-title"><i class="fa-solid fa-bug"></i> ${escapeHtml(mg.title || 'Tìm lỗi')}</div>
      <div class="mini-game-instr">${mg.instruction || 'Click vào dòng code có lỗi.'}</div>
      <div class="mg-bugspot-instr"><strong>Số dòng:</strong> ${lines.length} · <strong>Loại lỗi cần tìm:</strong> ${escapeHtml(mg.bugType || 'syntax')}</div>
      <div class="mg-bugspot-code">${lines.map((ln, i) =>
        `<div class="mg-bugspot-line" data-line="${i + 1}"><span class="mg-bugspot-lineno">${i + 1}</span><span>${escapeHtml(ln) || '&nbsp;'}</span></div>`
      ).join('')}</div>
      <div class="mg-bugspot-actions" style="margin-top:10px;">
        <button class="mg-bugspot-btn" id="mg-bug-check">Kiểm tra</button>
        <button class="mg-bugspot-btn secondary" id="mg-bug-reset">Làm lại</button>
      </div>
      <div id="mg-bug-feedback" class="mg-match-feedback" style="display:none;"></div>
    </div>`;
    container.innerHTML = html;

    container.querySelectorAll('.mg-bugspot-line').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
        container.querySelectorAll('.mg-bugspot-line.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedLine = parseInt(el.dataset.line);
      });
    });

    container.querySelector('#mg-bug-check').onclick = () => {
      if (!selectedLine) { flashTip(container, 'Chọn 1 dòng trước!'); return; }
      const bugs = mg.bugs || [];
      const hit = bugs.find(b => b.line === selectedLine);
      if (hit) {
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.remove('selected');
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.add('correct');
        showMiniFeedback(container, 'mg-bug-feedback', true, `Đúng rồi! ${hit.description || ''} +${mg.xp || 25} XP`);
        awardXP(mg.xp || 25);
      } else {
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.remove('selected');
        container.querySelector(`.mg-bugspot-line[data-line="${selectedLine}"]`).classList.add('wrong');
        const correctLine = bugs[0]?.line;
        showMiniFeedback(container, 'mg-bug-feedback', false, `Sai rồi. Dòng đúng là dòng ${correctLine}. Thử lại!`);
      }
    };
    container.querySelector('#mg-bug-reset').onclick = () => renderMiniGameBugSpot(container, mg);
  }

  function showMiniFeedback(container, feedbackId, ok, msg) {
    const el = container.querySelector('#' + feedbackId);
    if (!el) return;
    el.style.display = 'flex';
    el.classList.toggle('wrong', !ok);
    el.innerHTML = `<i class="fa-solid ${ok ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${msg}`;
  }
  function flashTip(container, msg) {
    const tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;bottom:12px;right:12px;background:var(--warning);color:#1A1A1A;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;z-index:10;';
    tip.textContent = msg;
    container.style.position = 'relative';
    container.appendChild(tip);
    setTimeout(() => tip.remove(), 1800);
  }

  // Hook vào addXP (nếu chưa có thì stub)
  function awardXP(n) {
    if (typeof window.addXP === 'function') window.addXP(n);
  }

  /* ── E. Step 4 enhanced schema (dùng CSS mới) ───────────── */
  function enhanceStep4Schema(container, s4) {
    if (!container || !s4 || !s4.schema) return;
    const schema = s4.schema;
    const data = s4.schema.data || s4.data || [];
    // Render schema chính + related_schemas (nếu có) — user cần thấy tất cả bảng để JOIN
    const renderOneTable = (tbl) => {
      const tblData = tbl.data || [];
      return `<div class="step4-schema-card">
        <div class="schema-head">
          <i class="fa-solid fa-table"></i>
          <span class="table-name">${escapeHtml(tbl.table_name)}</span>
          <span class="row-count">${tblData.length} rows</span>
        </div>
        <div class="schema-rows">
          ${(tbl.columns || []).map(col => `
            <div class="schema-row">
              <span class="col-name">${col.icon ? col.icon + ' ' : ''}${escapeHtml(col.name)}</span>
              <span class="col-type">${escapeHtml(col.type || '')}</span>
              ${col.key ? `<span class="col-key">${escapeHtml(col.key)}</span>` : ''}
            </div>
          `).join('')}
        </div>
        ${tblData.length > 0 ? `
          <div class="data-preview">
            <table class="data-table">
              <thead><tr>${(tbl.columns || []).map(c => `<th>${escapeHtml(c.name)}</th>`).join('')}</tr></thead>
              <tbody>${tblData.map(row => `<tr>${row.map((cell, i) =>
                `<td class="${tbl.columns[i]?.key === 'PK' ? 'pk-cell' : ''}">${escapeHtml(String(cell))}</td>`
              ).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        ` : ''}
      </div>`;
    };
    let html = renderOneTable(schema);
    // Nếu có related_schemas (vd: JOIN nhiều bảng), render thêm
    if (s4.related_schemas && Array.isArray(s4.related_schemas)) {
      s4.related_schemas.forEach(relSchema => {
        html += renderOneTable(relSchema);
      });
    }
    container.innerHTML = html;
  }

  /* ── F. Hint panel 4 levels (progressive reveal) ──────────── */
  function enhanceHintPanel(container, s4) {
    if (!container || !s4 || !s4.hints) return;
    const hints = s4.hints;
    let currentLevel = 0;
    let html = `<div class="hint-panel" id="hint-panel">
      <div class="hint-panel-head"><i class="fa-solid fa-lightbulb"></i> Gợi ý (${hints.length} cấp độ)</div>
      <div class="hint-level-tabs" id="hint-level-tabs">
        ${hints.map((h, i) => `<button class="hint-level-tab${i === 0 ? ' active' : ''}" data-level="${i}">Cấp ${i + 1}</button>`).join('')}
      </div>
      <div class="hint-panel-body" id="hint-body">${hints[0]?.text || ''}</div>
    </div>`;
    container.innerHTML = html;
    container.querySelectorAll('.hint-level-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const lvl = parseInt(tab.dataset.level);
        container.querySelectorAll('.hint-level-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#hint-body').innerHTML = hints[lvl]?.text || '';
      });
    });
  }
})();

