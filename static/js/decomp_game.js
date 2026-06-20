/* ============================================================================
 * decomp_game.js — Drag-drop Table Decomposition Game (Normal Forms)
 *
 * For Bài 6-10 (1NF, 2NF, 3NF, BCNF, Boss Battle).
 * Student sees a DENORMALIZED source table and must drag its columns into
 * NORMALIZED target tables (creating primary keys, foreign keys, etc).
 *
 * Public API:
 *   window.DecompGame.init({decomp, onComplete})  — build the game into #decomp-game-mount
 *   window.DecompGame.reset()                     — restart the current stage
 *   window.DecompGame.nextStage()                 — advance to next stage (Bài 10)
 * ============================================================================ */

(function () {
  'use strict';

  let mountEl = null;          // #decomp-game-mount
  let state = null;            // current decomp config + student state
  let onCompleteCb = null;     // callback when all stages pass
  let currentStageIdx = 0;     // for Bài 10 multi-stage
  let lastCompleted = false;   // dedupe onComplete fires
  let chipCounter = 0;         // global counter for unique chip IDs (shared FKs)

  /* ═════ INIT ═════ */
  function init(opts) {
    opts = opts || {};
    state = opts.decomp || null;
    onCompleteCb = opts.onComplete || null;
    currentStageIdx = 0;
    lastCompleted = false;

    mountEl = document.getElementById('decomp-game-mount');
    if (!mountEl) return;
    if (!state) {
      mountEl.innerHTML = '';
      return;
    }

    render();
  }

  function reset() {
    currentStageIdx = 0;
    lastCompleted = false;
    if (state) render();
  }

  function nextStage() {
    if (!state || !state.stages) return;
    if (currentStageIdx < state.stages.length - 1) {
      currentStageIdx++;
      lastCompleted = false;
      render();
    }
  }

  function getCurrentStage() {
    if (!state) return null;
    if (state.stages) return state.stages[currentStageIdx];
    return state;
  }

  /* ═════ RENDER — main UI for current stage ═════ */
  function render() {
    if (!mountEl) return;
    mountEl.innerHTML = '';
    const stage = getCurrentStage();
    if (!stage) return;

    // Rule banner
    const banner = document.createElement('div');
    banner.className = 'decomp-rule';
    banner.innerHTML = `
      <span class="decomp-rule-icon">⚔️</span>
      <div class="decomp-rule-text">
        <strong>${escapeHtml(stage.rule_label || 'Nhiệm vụ chuẩn hóa')}</strong>
        <span>${escapeHtml(stage.rule)}</span>
      </div>
    `;
    mountEl.appendChild(banner);

    // Multi-stage progress (Bài 10)
    if (state.stages && state.stages.length > 1) {
      const prog = document.createElement('div');
      prog.className = 'decomp-stages-progress';
      state.stages.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'decomp-stage-dot';
        if (i < currentStageIdx) dot.classList.add('done');
        if (i === currentStageIdx) dot.classList.add('active');
        dot.textContent = i + 1;
        prog.appendChild(dot);
        if (i < state.stages.length - 1) {
          const line = document.createElement('span');
          line.className = 'decomp-stage-line';
          if (i < currentStageIdx) line.classList.add('done');
          prog.appendChild(line);
        }
      });
      const stageTitle = document.createElement('div');
      stageTitle.className = 'decomp-stage-title';
      stageTitle.innerHTML = `🗡️ <strong>Stage ${currentStageIdx + 1}/${state.stages.length}</strong> — ${escapeHtml(stage.stage_title || stage.rule_label || '')}`;
      mountEl.appendChild(prog);
      mountEl.appendChild(stageTitle);
    }

    // Mission description
    if (stage.mission) {
      const mission = document.createElement('div');
      mission.className = 'decomp-mission';
      mission.innerHTML = `<span class="decomp-mission-icon">🎯</span> ${stage.mission}`;
      mountEl.appendChild(mission);
    }

    // Workspace: source table on top, target tables on bottom
    const workspace = document.createElement('div');
    workspace.className = 'decomp-workspace';

    // Source table
    const sourceWrap = document.createElement('div');
    sourceWrap.className = 'decomp-source';
    sourceWrap.innerHTML = `
      <div class="decomp-source-head">
        <span class="decomp-source-icon">📦</span>
        <span class="decomp-source-title">Bảng gốc (chưa chuẩn hóa):</span>
        <span class="decomp-source-name">${escapeHtml(stage.source_table.name)}</span>
      </div>
      <div class="decomp-source-chips" data-source></div>
      <div class="decomp-source-data">
        ${renderSourceData(stage.source_table)}
      </div>
    `;
    workspace.appendChild(sourceWrap);

    // Target tables
    const targetWrap = document.createElement('div');
    targetWrap.className = 'decomp-targets';
    (stage.target_tables || []).forEach(tgt => {
      const tgtEl = document.createElement('div');
      tgtEl.className = 'decomp-target';
      tgtEl.dataset.targetName = tgt.name;
      tgtEl.innerHTML = `
        <div class="decomp-target-head">
          <span class="decomp-target-icon">${tgt.icon || '📋'}</span>
          <span class="decomp-target-title">${escapeHtml(tgt.name)}</span>
        </div>
        <div class="decomp-target-desc">${escapeHtml(tgt.description || '')}</div>
        <div class="decomp-target-cols" data-target="${escapeHtml(tgt.name)}">
          <div class="decomp-target-empty">↳ Kéo cột vào đây</div>
        </div>
        <div class="decomp-target-status" data-status="${escapeHtml(tgt.name)}"></div>
      `;
      targetWrap.appendChild(tgtEl);
    });
    workspace.appendChild(targetWrap);
    mountEl.appendChild(workspace);

    // Wire drag-drop on source + each target list FIRST (sets up event listeners on empty containers)
    wireDropZones(stage);

    // Populate source chips AFTER wiring so the source chips exist
    const sourceChipsEl = sourceWrap.querySelector('[data-source]');
    (stage.source_table.columns || []).forEach(col => {
      const chip = createChip(col);
      sourceChipsEl.appendChild(chip);
    });

    // Action bar
    const actions = document.createElement('div');
    actions.className = 'decomp-actions';
    actions.innerHTML = `
      <button class="decomp-btn decomp-btn-secondary" data-action="reset">
        <i class="fa-solid fa-rotate-left"></i> Reset
      </button>
      <button class="decomp-btn decomp-btn-secondary" data-action="hint">
        <i class="fa-solid fa-lightbulb"></i> Gợi ý
      </button>
      <button class="decomp-btn decomp-btn-primary" data-action="validate">
        <i class="fa-solid fa-check"></i> Kiểm tra
      </button>
    `;
    mountEl.appendChild(actions);

    // Hint box
    const hintBox = document.createElement('div');
    hintBox.className = 'decomp-hint-box hidden';
    hintBox.id = 'decomp-hint-box';
    hintBox.innerHTML = `<i class="fa-solid fa-lightbulb"></i> <span></span>`;
    mountEl.appendChild(hintBox);

    // Result bar
    const result = document.createElement('div');
    result.className = 'decomp-result hidden';
    result.id = 'decomp-result';
    mountEl.appendChild(result);

    // Bind action buttons
    actions.querySelector('[data-action="reset"]').addEventListener('click', () => {
      render();
    });
    actions.querySelector('[data-action="hint"]').addEventListener('click', () => {
      showHint(stage.hint);
    });
    actions.querySelector('[data-action="validate"]').addEventListener('click', () => {
      validateStage();
    });
  }

  function renderSourceData(table) {
    const cols = table.columns || [];
    const data = (table.data || []).slice(0, 4);
    if (!data.length) return '';
    let html = '<table class="decomp-source-tbl"><thead><tr>';
    cols.forEach(c => {
      const pk = c.key === 'PK' ? '🔑 ' : '';
      html += `<th>${pk}${escapeHtml(c.name)}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.forEach(row => {
      html += '<tr>';
      row.forEach((cell, i) => {
        const c = cols[i];
        const cls = c && c.icon === '⚠️' ? 'class="decomp-cell-warn"' : '';
        html += `<td ${cls}>${escapeHtml(String(cell))}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function createChip(col) {
    const chip = document.createElement('div');
    chip.className = 'decomp-chip';
    chip.draggable = true;
    const chipId = 'c' + (++chipCounter);
    chip.dataset.chipId = chipId;
    chip.dataset.colName = col.name;
    chip.dataset.colType = col.type || '';
    chip.dataset.colKey = col.key || '';
    chip.dataset.colIcon = col.icon || '';
    chip.innerHTML = `
      <span class="decomp-chip-key">${col.key === 'PK' ? '🔑' : (col.icon || '○')}</span>
      <span class="decomp-chip-name">${escapeHtml(col.name)}</span>
      <span class="decomp-chip-type">${escapeHtml(col.type || '')}</span>
    `;
    chip.addEventListener('dragstart', (e) => {
      // Use chipId for uniqueness (handles shared FK columns)
      e.dataTransfer.setData('text/plain', chipId);
      e.dataTransfer.effectAllowed = 'move';
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });
    return chip;
  }

  /* ═════ Drag-drop wiring ═════ */
  function wireDropZones(stage) {
    // Each target column list is a drop zone
    const targetLists = mountEl.querySelectorAll('[data-target]');
    targetLists.forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.classList.add('drag-over');
      });
      list.addEventListener('dragleave', () => {
        list.classList.remove('drag-over');
      });
      list.addEventListener('drop', (e) => {
        e.preventDefault();
        list.classList.remove('drag-over');
        const chipId = e.dataTransfer.getData('text/plain');
        if (!chipId) return;
        moveChipToTarget(chipId, list.dataset.target);
      });
    });

    // Source is also a drop zone (allow moving chips back)
    const source = mountEl.querySelector('[data-source]');
    if (source) {
      source.addEventListener('dragover', (e) => {
        e.preventDefault();
        source.classList.add('drag-over');
      });
      source.addEventListener('dragleave', () => {
        source.classList.remove('drag-over');
      });
      source.addEventListener('drop', (e) => {
        e.preventDefault();
        source.classList.remove('drag-over');
        const chipId = e.dataTransfer.getData('text/plain');
        if (!chipId) return;
        moveChipToSource(chipId);
      });
    }

    // Click chip → cycle: source → target1 → target2 → ... → source
    mountEl.querySelectorAll('.decomp-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Find current location
        const parent = chip.parentElement;
        if (parent.dataset.source !== undefined) {
          // In source — move to first target
          const firstTarget = stage.target_tables[0];
          if (firstTarget) moveChipToTarget(chip.dataset.chipId, firstTarget.name);
        } else if (parent.dataset.target) {
          // In a target — move to next target, or back to source
          const targets = stage.target_tables || [];
          const idx = targets.findIndex(t => t.name === parent.dataset.target);
          if (idx >= 0 && idx < targets.length - 1) {
            moveChipToTarget(chip.dataset.chipId, targets[idx + 1].name);
          } else {
            moveChipToSource(chip.dataset.chipId);
          }
        }
      });
    });
  }

  function moveChipToTarget(chipId, targetName) {
    const chip = mountEl.querySelector(`.decomp-chip[data-chip-id="${cssEscape(chipId)}"]`);
    if (!chip) return;
    const targetList = mountEl.querySelector(`[data-target="${cssEscape(targetName)}"]`);
    if (!targetList) return;
    // Remove empty placeholder
    const empty = targetList.querySelector('.decomp-target-empty');
    if (empty) empty.remove();
    // Mark PK on first chip added to a target — only if it didn't already have PK from source
    const existing = targetList.querySelectorAll('.decomp-chip');
    if (existing.length === 0 && chip.dataset.colKey !== 'PK') {
      // Only auto-add PK if the chip didn't come pre-marked as PK
      // (Pre-marked PK from source keeps its original key)
    }
    targetList.appendChild(chip);
    clearResult();
  }

  function moveChipToSource(chipId) {
    const chip = mountEl.querySelector(`.decomp-chip[data-chip-id="${cssEscape(chipId)}"]`);
    if (!chip) return;
    const source = mountEl.querySelector('[data-source]');
    if (!source) return;
    // Restore original key/icon (in case it was auto-assigned)
    const origKey = chip.dataset.colKey;
    const origIcon = chip.dataset.colIcon;
    // Don't strip PK if it was set in source
    if (origKey === 'PK') {
      chip.querySelector('.decomp-chip-key').textContent = '🔑';
    } else if (origIcon === '⚠️') {
      chip.querySelector('.decomp-chip-key').textContent = '⚠️';
    } else {
      chip.querySelector('.decomp-chip-key').textContent = '○';
    }
    source.appendChild(chip);
    // Restore empty placeholders for now-empty targets
    mountEl.querySelectorAll('[data-target]').forEach(list => {
      if (list.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'decomp-target-empty';
        empty.textContent = '↳ Kéo cột vào đây';
        list.appendChild(empty);
      }
    });
    clearResult();
  }

  /* ═════ Validation ═════ */
  function validateStage() {
    const stage = getCurrentStage();
    if (!stage) return;
    const solution = stage.solution || {};
    const targetTables = stage.target_tables || [];

    let correctTables = 0;
    let totalErrors = 0;

    targetTables.forEach(tgt => {
      const list = mountEl.querySelector(`[data-target="${cssEscape(tgt.name)}"]`);
      const statusEl = mountEl.querySelector(`[data-status="${cssEscape(tgt.name)}"]`);
      if (!list || !statusEl) return;

      const placedCols = Array.from(list.querySelectorAll('.decomp-chip'))
        .map(c => c.dataset.colName);

      const expected = solution[tgt.name] || [];
      const sortedPlaced = [...placedCols].sort();
      const sortedExpected = [...expected].sort();
      const matches = JSON.stringify(sortedPlaced) === JSON.stringify(sortedExpected);

      if (matches) {
        statusEl.className = 'decomp-target-status ok';
        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đúng! (${placedCols.length} cột)`;
        list.classList.add('target-ok');
        list.classList.remove('target-err');
        correctTables++;
      } else {
        statusEl.className = 'decomp-target-status err';
        const missing = sortedExpected.filter(c => !sortedPlaced.includes(c));
        const extra = sortedPlaced.filter(c => !sortedExpected.includes(c));
        let msg = `<i class="fa-solid fa-circle-xmark"></i> Chưa đúng`;
        if (missing.length) msg += ` — thiếu: <code>${escapeHtml(missing.join(', '))}</code>`;
        if (extra.length) msg += ` — thừa: <code>${escapeHtml(extra.join(', '))}</code>`;
        statusEl.innerHTML = msg;
        list.classList.add('target-err');
        list.classList.remove('target-ok');
        totalErrors++;
      }
    });

    // Show result
    const result = mountEl.querySelector('#decomp-result');
    if (correctTables === targetTables.length && targetTables.length > 0) {
      result.className = 'decomp-result success';
      const isMulti = state.stages && currentStageIdx < state.stages.length - 1;
      const isLast = state.stages && currentStageIdx === state.stages.length - 1;
      const ctaText = isLast ? 'Hoàn thành Boss Battle! 🎉' :
                      isMulti ? `Stage ${currentStageIdx + 2}/${state.stages.length} →` :
                      'Hoàn thành! Tiếp tục Bước 2 →';
      result.innerHTML = `
        <div class="decomp-result-icon">🎉</div>
        <div class="decomp-result-text">
          <strong>Chuẩn hóa thành công!</strong>
          <span>Tất cả ${targetTables.length} bảng đã đúng cấu trúc.</span>
        </div>
        <button class="decomp-btn decomp-btn-primary" id="decomp-next-btn">${escapeHtml(ctaText)}</button>
      `;
      result.classList.remove('hidden');
      const nextBtn = result.querySelector('#decomp-next-btn');
      nextBtn.addEventListener('click', () => {
        if (state.stages && currentStageIdx < state.stages.length - 1) {
          nextStage();
        } else {
          if (!lastCompleted && typeof onCompleteCb === 'function') {
            lastCompleted = true;
            onCompleteCb({ stages: state.stages ? state.stages.length : 1 });
          }
        }
      });
    } else {
      result.className = 'decomp-result error';
      result.innerHTML = `
        <div class="decomp-result-icon">❌</div>
        <div class="decomp-result-text">
          <strong>${correctTables}/${targetTables.length} bảng đúng</strong>
          <span>Kiểm tra lại các cột đã kéo — dùng nút "Reset" để thử lại từ đầu.</span>
        </div>
      `;
      result.classList.remove('hidden');
    }
  }

  function showHint(hint) {
    const box = mountEl.querySelector('#decomp-hint-box');
    if (!box) return;
    box.querySelector('span').textContent = hint || 'Đọc kỹ rule banner phía trên — nó cho biết tiêu chí tách bảng.';
    box.classList.remove('hidden');
  }

  function clearResult() {
    const result = mountEl.querySelector('#decomp-result');
    if (result) result.classList.add('hidden');
    mountEl.querySelectorAll('.decomp-target-status').forEach(s => {
      s.className = 'decomp-target-status';
      s.innerHTML = '';
    });
    mountEl.querySelectorAll('[data-target]').forEach(l => {
      l.classList.remove('target-ok', 'target-err');
    });
  }

  /* ═════ Utility ═════ */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function cssEscape(s) {
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  /* ═════ Public API ═════ */
  window.DecompGame = {
    init: init,
    reset: reset,
    nextStage: nextStage
  };
})();
