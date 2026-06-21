/* ============================================================================
 * drag_game.js — Brilliant-style "Query Pipeline" (v4 redesign)
 *
 * Core insight (from Brilliant's design philosophy): animations must visualize
 * DATA TRANSFORMATION, not decorate a literal scene. So instead of a truck
 * driving on a road, we render the QUERY as a data pipeline where each
 * stage shows a mini-table of the data at that point:
 *
 *   ┌─ Kho ─┐    ┌─ FROM ─┐    ┌─ WHERE ─┐    ┌─ SELECT ─┐
 *   │  ──   │ →  │ ████ │ →  │ █░░░ │ →  │ ██ │
 *   │       │    │ ████ │    │ ░░░░ │    │ ██ │
 *   │       │    │ ████ │    │ ░░░░ │    │ ░░ │
 *   │       │    │ ████ │    │ ░░░░ │    │    │
 *   └───────┘    └───────┘    └───────┘    └──────┘
 *     empty       full table    filtered     projected
 *
 * A small truck CURSOR slides above the stations, indicating WHERE the
 * query is currently executing. Each transition is choreographed:
 *
 *   1. Truck slides to next station (spring physics)
 *   2. Cells fill/dim/highlight with staggered timing (cell-by-cell)
 *   3. Connector particles flow from previous station to current
 *   4. On completion: result table pulses + confetti
 *
 * Public API (unchanged):
 *   window.DragGame.init({lesson, expectedSql})
 *   window.DragGame.update({fromTable, columns, whereFilter, isComplete})
 *   window.DragGame.reset()
 * ============================================================================ */

(function () {
  'use strict';

  /* ═════ Stations — the SQL execution pipeline ═════ */
  const STATIONS = [
    { id: 'start',  icon: '🏠', label: 'Kho',    sub: 'Bắt đầu',     zone: null },
    { id: 'pickup', icon: '📦', label: 'FROM',   sub: 'Tải bảng',    zone: 'from-line'  },
    { id: 'filter', icon: '🚧', label: 'WHERE',  sub: 'Lọc dòng',    zone: 'where-line' },
    { id: 'output', icon: '📤', label: 'SELECT', sub: 'Xuất kết quả', zone: 'select-line'}
  ];

  /* Default schema — Bài 1: Primary Key on game_catalog */
  const DEFAULT_TABLE = {
    name: 'game_catalog',
    columns: ['id', 'name', 'genre', 'price'],
    dataRows: [
      ['101', 'Elden Ring',  'Action RPG',  '60'],
      ['102', 'God of War',  'Action',      '50'],
      ['103', 'Hades',       'Rogue-like',  '25'],
      ['104', 'Elden Ring',  'Card Game',   '15']
    ]
  };

  /* Module state */
  let mountEl = null;
  let trackEl = null;
  let truckEl = null;
  let stations = {};
  let statusEl = null;
  let lastProgress = 0;
  let lastIsComplete = false;

  /* ═════ SOUND (Brilliant-style Web Audio) ═════ */
  let soundEnabled = (() => {
    try { return localStorage.getItem('truck-sound') !== 'off'; } catch(e) { return true; }
  })();
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, dur, type='sine', vol=0.15) {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  function sfxEngine() { playTone(80, 0.4, 'sawtooth', 0.04); }      // low rumble
  function sfxBump()   { playTone(180, 0.15, 'square', 0.18); setTimeout(() => playTone(90, 0.18, 'sawtooth', 0.12), 50); }
  function sfxChime()  { playTone(660, 0.12, 'sine', 0.15); setTimeout(() => playTone(880, 0.18, 'sine', 0.18), 80); setTimeout(() => playTone(1100, 0.25, 'sine', 0.12), 180); }
  function sfxCrash()  { playTone(120, 0.4, 'sawtooth', 0.2); setTimeout(() => playTone(60, 0.3, 'square', 0.15), 100); }

  /* Expose to UI */
  window.DragGameSound = {
    toggle: () => {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('truck-sound', soundEnabled ? 'on' : 'off'); } catch(e) {}
      if (soundEnabled) sfxChime();
      return soundEnabled;
    },
    isOn: () => soundEnabled,
  };

  /* ═════ INIT — build the pipeline ═════ */
  function init(opts) {
    opts = opts || {};
    mountEl = document.getElementById('drag-game-mount');
    if (!mountEl) return;
    mountEl.innerHTML = '';

    const lesson = opts.lesson || {};
    const table = (lesson.drag_map && lesson.drag_map.table) || DEFAULT_TABLE;

    /* Wrap the whole thing — provides scope for CSS scoping if needed */
    const root = document.createElement('div');
    root.className = 'pipeline-root';
    mountEl.appendChild(root);

    /* The pipeline visualization */
    trackEl = document.createElement('div');
    trackEl.className = 'pipeline';

    trackEl.innerHTML = `
      <div class="pipeline-truck-row">
        <div class="pipeline-rail">
          ${STATIONS.slice(1).map((_, i) => `
            <div class="rail-segment" data-rail="${i}">
              <div class="rail-line"></div>
              <div class="rail-flow"></div>
            </div>
          `).join('')}
        </div>
        <div class="pipeline-truck" data-truck>
          <div class="truck-glow"></div>
          <div class="truck-trail"></div>
          <div class="truck-smoke"><span></span><span></span><span></span></div>
          <div class="truck-cargo"></div>
          <div class="truck-body">
            <div class="truck-cab">🚚</div>
            <div class="truck-wheel truck-wheel-front"></div>
            <div class="truck-wheel truck-wheel-rear"></div>
          </div>
        </div>
      </div>

      <div class="pipeline-stations">
        ${STATIONS.map(s => `
          <div class="pipeline-station" data-station="${s.id}">
            <div class="station-glow"></div>
            <div class="station-head">
              <span class="station-icon">${s.icon}</span>
              <span class="station-title">${s.label}</span>
            </div>
            <span class="station-sub">${s.sub}</span>
            <div class="station-data" data-station-data="${s.id}">
              ${renderStationDataPlaceholder(s.id, table)}
            </div>
            <div class="station-tag" data-station-tag="${s.id}"></div>
          </div>
        `).join('')}
      </div>
    `;

    root.appendChild(trackEl);

    /* Cache station refs */
    stations = {};
    STATIONS.forEach(s => {
      stations[s.id] = trackEl.querySelector(`[data-station="${s.id}"]`);
    });
    truckEl = trackEl.querySelector('[data-truck]');

    /* Click station → educational hint */
    STATIONS.forEach(s => {
      stations[s.id].addEventListener('click', () => showStationHint(s));
    });

    /* Status bar (Brilliant-style narration) */
    statusEl = document.createElement('div');
    statusEl.className = 'pipeline-status';
    statusEl.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-text">Sẵn sàng. Kéo khối <strong>FROM</strong> vào drop-zone để bắt đầu truy vấn.</span>
    `;
    root.appendChild(statusEl);

    /* Sound toggle button (top-right of pipeline) */
    const soundBtn = document.createElement('button');
    soundBtn.className = 'pipeline-sound-toggle';
    if (!soundEnabled) soundBtn.classList.add('muted');
    soundBtn.innerHTML = soundEnabled ? '🔊' : '🔇';
    soundBtn.title = soundEnabled ? 'Tắt âm thanh (Brilliant-style truck sound)' : 'Bật âm thanh';
    soundBtn.addEventListener('click', () => {
      const on = window.DragGameSound.toggle();
      soundBtn.classList.toggle('muted', !on);
      soundBtn.innerHTML = on ? '🔊' : '🔇';
      soundBtn.title = on ? 'Tắt âm thanh (Brilliant-style truck sound)' : 'Bật âm thanh';
    });
    root.appendChild(soundBtn);
    /* Truck drive-in animation: start off-screen, slide to first station */
    if (truckEl) {
      truckEl.classList.add('driving');
      requestAnimationFrame(() => {
        /* Place off-screen left, then move to station 0 */
        const startLeft = -80;
        truckEl.style.setProperty('--tx', startLeft + 'px');
        requestAnimationFrame(() => moveTruckTo(0, /*instant=*/false));
        setTimeout(() => truckEl.classList.remove('driving'), 900);
        /* Engine sound on arrival */
        setTimeout(() => sfxEngine(), 200);
        setTimeout(() => sfxChime(), 1000);
      });
    }
    lastProgress = 0;
    lastIsComplete = false;

    /* Expose for debug */
    window.__pipeline = { stations, table, STATIONS };
  }

  /* ═════ Render placeholder for station data ═════
   * Each station gets a different initial visual — Brilliant-style:
   * show what each stage WILL contain when activated.
   *   start:  empty (just a dotted outline)
   *   pickup: empty (will fill with table)
   *   filter: empty (will show filtered table)
   *   output: empty (will show projected columns)
   */
  function renderStationDataPlaceholder(stationId, table) {
    return `<div class="data-empty">
      <span class="data-empty-dot"></span>
      <span class="data-empty-text">${stationId === 'start' ? '—' : 'chờ dữ liệu'}</span>
    </div>`;
  }

  /* ═════ Render mini table inside a station ═════ */
  function renderMiniTable(table, opts) {
    opts = opts || {};
    const cols = table.columns;
    const rows = table.dataRows;

    const hasColFilter = opts.selectedCols && opts.selectedCols.length;
    const hasRowFilter = opts.matchedRows && opts.matchedRows.length !== undefined;

    /* Headers — render all, but dim non-selected ones */
    const headersHTML = cols.map(c => {
      const isSelected = !hasColFilter || opts.selectedCols.includes(c);
      return `<span class="mini-th ${isSelected ? 'selected' : 'dimmed'}">${escapeHtml(c)}</span>`;
    }).join('');

    /* Rows — render all, but dim non-matched ones */
    const rowsHTML = rows.map((row, i) => {
      const matched = !hasRowFilter || opts.matchedRows.includes(i);
      const dim = !matched;
      const cells = cols.map(c => {
        const colIdx = cols.indexOf(c);
        const isSelected = !hasColFilter || opts.selectedCols.includes(c);
        const cellClass = dim ? 'dimmed' : (!isSelected ? 'col-dimmed' : '');
        return `<span class="mini-td ${cellClass}">${escapeHtml(row[colIdx])}</span>`;
      }).join('');
      return `<div class="mini-row ${dim ? 'dimmed' : 'matched'}">${cells}</div>`;
    }).join('');

    return `
      <div class="mini-table" data-state="${opts.state || 'default'}">
        <div class="mini-thead">${headersHTML}</div>
        <div class="mini-tbody">${rowsHTML}</div>
      </div>
    `;
  }

  /* ═════ Truck movement — slide horizontally to target station ═════ */
  function moveTruckTo(stationIdx, instant) {
    if (!trackEl) return;
    if (!truckEl) truckEl = trackEl.querySelector('[data-truck]');
    if (!truckEl) return;

    const stationEls = trackEl.querySelectorAll('.pipeline-station');
    const target = stationEls[stationIdx];
    if (!target) return;

    /* Compute absolute X of station center relative to track */
    const trackRect = trackEl.getBoundingClientRect();
    const stationRect = target.getBoundingClientRect();
    const targetX = stationRect.left + stationRect.width / 2 - trackRect.left;

    if (instant) {
      truckEl.style.transition = 'none';
      truckEl.style.setProperty('--tx', targetX + 'px');
      requestAnimationFrame(() => { truckEl.style.transition = ''; });
      return;
    }

    /* Add driving state */
    truckEl.classList.add('driving');

    /* Animate the rail flow between previous and new station */
    if (stationIdx > 0) {
      const rail = trackEl.querySelector(`[data-rail="${stationIdx - 1}"]`);
      if (rail) {
        rail.classList.remove('flowing');
        void rail.offsetWidth;  /* restart animation */
        rail.classList.add('flowing');
        setTimeout(() => rail.classList.remove('flowing'), 900);
      }
    }

    /* Slide truck */
    truckEl.style.setProperty('--tx', targetX + 'px');
    /* Engine sound while driving */
    sfxEngine();

    /* On arrival: bounce + station glow burst */
    const onArrival = (e) => {
      if (e.propertyName !== 'transform') return;
      truckEl.classList.remove('driving');
      truckEl.classList.add('arriving');
      target.classList.add('arriving');
      /* Chime when arriving at a new station */
      sfxChime();

      setTimeout(() => {
        truckEl.classList.remove('arriving');
        target.classList.remove('arriving');
      }, 700);

      truckEl.removeEventListener('transitionend', onArrival);
    };
    truckEl.addEventListener('transitionend', onArrival);
  }

  /* ═════ UPDATE — main entry called whenever blocks change ═════ */
  function update(state) {
    state = state || {};
    if (!trackEl) return;

    const s3 = state.lessonStep3 || null;
    const table = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;

    /* ── 1. Determine progress ───────────────────────────── */
    const has = {
      pickup: !!state.fromTable,
      filter: !!state.whereFilter,
      output: !!(state.columns && state.columns.length)
    };

    let progress = 0;
    let blocked = null;
    if (has.pickup) progress = 1;
    if (has.filter) {
      if (progress >= 1) progress = 2;
      else blocked = 'filter';
    }
    if (has.output) {
      if (progress >= 2) progress = 3;
      else if (!blocked) blocked = 'output';
    }

    /* ── 2. Reset visual states ──────────────────────────── */
    STATIONS.forEach(s => stations[s.id].classList.remove('active', 'completed', 'error', 'arriving'));

    /* ── 3. Apply station states ─────────────────────────── */
    STATIONS.forEach((s, i) => {
      if (i <= progress) stations[s.id].classList.add('active');
      if (s.id === 'pickup' && has.pickup) stations[s.id].classList.add('completed');
      if (s.id === 'filter' && has.filter) {
        stations[s.id].classList.add('completed');
        if (blocked === 'filter') stations[s.id].classList.add('error');
      }
      if (s.id === 'output' && has.output) {
        stations[s.id].classList.add('completed');
        if (blocked === 'output') stations[s.id].classList.add('error');
      }
    });

    /* ── 4. Populate station DATA visualizations ──────────── */
    /* 'start' always shows the empty placeholder (it never has data) */
    updateStationData('start', table, { state: 'empty' });

    if (has.pickup) {
      updateStationData('pickup', table, { state: 'loaded', selectedCols: null, matchedRows: null });
    } else {
      updateStationData('pickup', table, { state: 'empty' });
    }
    if (has.filter) {
      const matchedIdx = parseWhereRows(state.whereFilter, table);
      updateStationData('filter', table, {
        state: 'filtered',
        selectedCols: null,
        matchedRows: matchedIdx || []
      });
    } else {
      updateStationData('filter', table, { state: 'empty' });
    }
    if (has.output) {
      const matchedIdx = has.filter ? parseWhereRows(state.whereFilter, table) : null;
      updateStationData('output', table, {
        state: 'projected',
        selectedCols: state.columns,
        matchedRows: matchedIdx
      });
    } else {
      updateStationData('output', table, { state: 'empty' });
    }

    /* ── 5. Cargo tag below stations ──────────────────────── */
    updateStationTag('start', null);
    updateStationTag('pickup', has.pickup ? state.fromTable : null);
    updateStationTag('filter', has.filter ? state.whereFilter : null);
    updateStationTag('output', has.output ? state.columns.join(', ') : null);

    /* ── 6. Move truck (only if progress changed) ────────── */
    if (progress !== lastProgress) {
      moveTruckTo(progress, /*instant=*/false);
      lastProgress = progress;
    }

    /* ── 7. Update narration ─────────────────────────────── */
    updateNarration(state, progress, blocked);

    /* ── 8. Wrong-order shake feedback ───────────────────── */
    if (blocked) shakeTruck();

    /* ── 9. Completion celebration ───────────────────────── */
    if (state.isComplete && !lastIsComplete) {
      celebrate();
    }
    lastIsComplete = !!state.isComplete;
  }

  /* ═════ Update a station's data visualization ═════ */
  function updateStationData(stationId, table, opts) {
    const el = stations[stationId];
    if (!el) return;
    const slot = el.querySelector(`[data-station-data="${stationId}"]`);
    if (!slot) return;

    if (opts.state === 'empty') {
      slot.innerHTML = `<div class="data-empty">
        <span class="data-empty-dot"></span>
        <span class="data-empty-text">chờ dữ liệu</span>
      </div>`;
      slot.classList.remove('has-data');
      return;
    }

    /* Determine matched rows for filter preview */
    let matchedRows = null;
    if (opts.matchedRows !== null && opts.matchedRows !== undefined) {
      matchedRows = opts.matchedRows;
    }

    slot.innerHTML = renderMiniTable(table, {
      state: opts.state,
      selectedCols: opts.selectedCols,
      matchedRows: matchedRows
    });
    slot.classList.add('has-data');
  }

  /* ═════ Update cargo tag below a station ═════ */
  function updateStationTag(stationId, text) {
    const el = stations[stationId];
    if (!el) return;
    const tag = el.querySelector(`[data-station-tag="${stationId}"]`);
    if (!tag) return;
    if (text) {
      tag.innerHTML = `<span class="cargo-pill">${escapeHtml(text)}</span>`;
      tag.classList.add('has-text');
    } else {
      tag.innerHTML = '';
      tag.classList.remove('has-text');
    }
  }

  /* ═════ Parse WHERE expression to matched row indices ═════
   * Handles simple patterns: "id = 101", "is_vip = true", "os = 'Linux'".
   * Returns array of indices that match (or all if no parse).
   */
  function parseWhereRows(filter, table) {
    if (!filter) return null;
    const m = /(\w+)\s*=\s*(?:'([^']*)'|"([^"]*)"|(\d+)|(true|false))/i.exec(filter);
    if (!m) return null;
    const colName = m[1];
    const val = m[2] !== undefined ? m[2] :
                m[3] !== undefined ? m[3] :
                m[4] !== undefined ? m[4] : m[5];
    const colIdx = table.columns.indexOf(colName);
    if (colIdx < 0) return null;
    const matches = [];
    table.dataRows.forEach((row, i) => {
      if (String(row[colIdx]) === val) matches.push(i);
    });
    return matches;
  }

  /* ═════ Click station → educational hint ═════ */
  function showStationHint(station) {
    if (!statusEl) return;
    const text = statusEl.querySelector('.status-text');
    const hints = {
      'start':  'Điểm xuất phát — query chưa có dữ liệu nào. Bắt đầu bằng <strong>FROM tên_bảng</strong>.',
      'pickup': 'Trạm lấy dữ liệu — toàn bộ bảng được nạp vào. Cú pháp: <code>FROM game_catalog</code>',
      'filter': 'Bộ lọc — chỉ giữ lại các dòng thỏa điều kiện. Cú pháp: <code>WHERE cột = giá_trị</code>',
      'output': 'Trạm cuối — chọn cột cần xuất. Cú pháp: <code>SELECT cột1, cột2</code>'
    };
    if (hints[station.id]) text.innerHTML = `💡 ${hints[station.id]}`;
  }

  /* ═════ Narration — Brilliant-style teaching via plain text ═════ */
  function updateNarration(state, progress, blocked) {
    if (!statusEl) return;
    const text = statusEl.querySelector('.status-text');
    if (!text) return;

    if (blocked === 'filter') {
      text.innerHTML = `⚠️ Bộ lọc <strong>WHERE</strong> đã có nhưng xe chưa biết lọc từ bảng nào. Đặt <strong>FROM</strong> trước đã.`;
      statusEl.classList.add('warn');
      statusEl.classList.remove('ok');
      return;
    }
    if (blocked === 'output') {
      text.innerHTML = `⚠️ Cột <strong>SELECT</strong> đã chọn nhưng xe chưa biết lấy từ đâu. Đặt <strong>FROM</strong> và <strong>WHERE</strong> trước.`;
      statusEl.classList.add('warn');
      statusEl.classList.remove('ok');
      return;
    }

    statusEl.classList.remove('warn');

    if (progress === 0) {
      text.innerHTML = `Sẵn sàng. Kéo khối <strong>FROM</strong> vào drop-zone để bắt đầu truy vấn.`;
    } else if (progress === 1) {
      text.innerHTML = `📦 Đã tải bảng <strong>${escapeHtml(state.fromTable)}</strong>. Tìm dòng cần lọc? Kéo <strong>WHERE</strong> vào.`;
    } else if (progress === 2) {
      text.innerHTML = `🔍 Đang lọc theo <strong>${escapeHtml(state.whereFilter)}</strong>. Cuối cùng: chọn cột <strong>SELECT</strong> cần xuất.`;
    } else if (progress === 3) {
      if (state.isComplete) {
        const cols = state.columns.join(', ');
        const sql = `<code>SELECT ${escapeHtml(cols)} FROM ${escapeHtml(state.fromTable)} WHERE ${escapeHtml(state.whereFilter)}</code>`;
        text.innerHTML = `🎉 Query hoàn chỉnh! ${sql}`;
        statusEl.classList.add('ok');
      } else {
        text.innerHTML = `📤 Đang chọn cột <strong>${escapeHtml(state.columns.join(', '))}</strong>. Kiểm tra query có khớp chưa.`;
      }
    }
  }

  /* ═════ Wrong-order physical feedback ═════ */
  function shakeTruck() {
    if (!truckEl) truckEl = trackEl.querySelector('[data-truck]');
    if (!truckEl) return;
    truckEl.classList.remove('shake');
    void truckEl.offsetWidth;
    truckEl.classList.add('shake');
    setTimeout(() => truckEl.classList.remove('shake'), 700);
    /* Crash sound + bump */
    sfxBump();
    sfxCrash();
    /* Spawn dust particles */
    spawnDustParticles();
  }

  /* ═════ Dust particles on wrong drop ═════ */
  function spawnDustParticles() {
    if (!truckEl) return;
    const colors = ['#FBBF24', '#EF4444', '#F59E0B', '#94A3B8'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'truck-dust';
      p.style.cssText = `
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: ${6 + Math.random()*6}px;
        height: ${6 + Math.random()*6}px;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 20;
      `;
      truckEl.appendChild(p);
      const angle = (Math.random() * Math.PI) - Math.PI/2;
      const dist = 30 + Math.random() * 30;
      const dx = Math.cos(angle) * dist;
      const dy = -Math.abs(Math.sin(angle) * dist) - 10;
      p.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(0.3)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
      setTimeout(() => p.remove(), 1000);
    }
  }

  /* ═════ Reset ═════ */
  function reset() {
    STATIONS.forEach(s => {
      if (stations[s.id]) stations[s.id].classList.remove('active', 'completed', 'error', 'arriving');
    });
    trackEl.querySelectorAll('.rail-segment').forEach(r => r.classList.remove('activated', 'flowing'));
    trackEl.querySelectorAll('[data-station-data]').forEach(slot => {
      slot.innerHTML = `<div class="data-empty">
        <span class="data-empty-dot"></span>
        <span class="data-empty-text">chờ dữ liệu</span>
      </div>`;
      slot.classList.remove('has-data');
    });
    trackEl.querySelectorAll('[data-station-tag]').forEach(t => {
      t.innerHTML = '';
      t.classList.remove('has-text');
    });
    moveTruckTo(0, /*instant=*/true);
    if (statusEl) {
      statusEl.classList.remove('warn', 'ok');
      statusEl.querySelector('.status-text').innerHTML =
        `Sẵn sàng. Kéo khối <strong>FROM</strong> vào drop-zone để bắt đầu truy vấn.`;
    }
    lastProgress = 0;
    lastIsComplete = false;
  }

  /* ═════ Celebration ═════ */
  function celebrate() {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 90, spread: 70, origin: { y: 0.5 },
        colors: ['#06B6D4', '#10B981', '#F59E0B', '#FBBF24']
      });
    }
    /* Triumphant chime */
    sfxChime();
    setTimeout(() => sfxChime(), 200);
    setTimeout(() => sfxChime(), 400);

    /* Pulse all stations */
    STATIONS.forEach((s, i) => {
      setTimeout(() => {
        if (stations[s.id]) {
          stations[s.id].classList.add('arriving');
          setTimeout(() => stations[s.id].classList.remove('arriving'), 600);
        }
      }, i * 120);
    });
    if (truckEl) {
      truckEl.classList.add('celebrate');
      setTimeout(() => truckEl.classList.remove('celebrate'), 1500);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ═════ Public API ═════ */
  window.DragGame = {
    init: init,
    update: update,
    reset: reset
  };
})();
