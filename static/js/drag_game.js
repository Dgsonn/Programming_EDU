/* ============================================================================
 * drag_game.js — Brilliant-style "Query Pipeline" (v5 dynamic stations)
 *
 * Stations are built dynamically from the lesson's drop_zones.
 * Simple lessons (SELECT/FROM/WHERE) get 4 stations.
 * Complex lessons (JOIN/GROUP BY/ORDER BY) get more stations automatically.
 *
 * Public API:
 *   window.DragGame.init({lesson, dropZones})
 *   window.DragGame.update({zoneFills, isComplete})
 *   window.DragGame.reset()
 * ============================================================================ */

(function () {
  'use strict';

  /* ═════ Zone → Station mapping ═════ */
  const ZONE_CONFIG = {
    'select-line':  { icon: '📤', label: 'SELECT',   sub: 'Chọn cột',      hint: 'Chọn cột cần xuất. Cú pháp: <code>SELECT cột1, cột2</code>' },
    'from-line':    { icon: '📦', label: 'FROM',     sub: 'Tải bảng',      hint: 'Toàn bộ bảng được nạp vào. Cú pháp: <code>FROM bảng JOIN bảng2 ON ...</code>' },
    'where-line':   { icon: '🚧', label: 'WHERE',    sub: 'Lọc dòng',      hint: 'Chỉ giữ lại dòng thỏa điều kiện. Cú pháp: <code>WHERE cột = giá_trị</code>' },
    'group-line':   { icon: '📊', label: 'GROUP BY', sub: 'Gom nhóm',      hint: 'Gom dòng theo cột + tính aggregate. Cú pháp: <code>GROUP BY cột</code>' },
    'order-line':   { icon: '📈', label: 'ORDER BY', sub: 'Sắp xếp',      hint: 'Sắp xếp kết quả. Cú pháp: <code>ORDER BY cột DESC LIMIT n</code>' },
    'setup-zone':   { icon: '⚙️', label: 'Setup',    sub: 'Khởi tạo',     hint: 'Khởi tạo model + manager.' },
    'chain-zone':   { icon: '🔗', label: 'Chain',    sub: 'Nối methods',   hint: 'Nối các method: filter → select_related → order_by.' },
    'slice-zone':   { icon: '✂️', label: 'Slice',    sub: 'Giới hạn',     hint: 'Giới hạn số kết quả: <code>[:10]</code> = LIMIT 10.' },
    'select-zone':  { icon: '📤', label: 'SELECT',   sub: 'Chọn cột',     hint: 'Chọn cột cần xuất.' },
    'inject-zone':  { icon: '💉', label: 'Inject',   sub: 'Chèn SQL',     hint: 'Phần SQL bị inject — quan sát cách attacker phá logic query.' },
  };

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
  let stationEls = {};
  let statusEl = null;
  let lastProgress = 0;
  let lastIsComplete = false;
  let activeStations = [];

  /* ═════ SOUND ═════ */
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

  function sfxEngine() { playTone(80, 0.4, 'sawtooth', 0.04); }
  function sfxBump()   { playTone(180, 0.15, 'square', 0.18); setTimeout(() => playTone(90, 0.18, 'sawtooth', 0.12), 50); }
  function sfxChime()  { playTone(660, 0.12, 'sine', 0.15); setTimeout(() => playTone(880, 0.18, 'sine', 0.18), 80); setTimeout(() => playTone(1100, 0.25, 'sine', 0.12), 180); }
  function sfxCrash()  { playTone(120, 0.4, 'sawtooth', 0.2); setTimeout(() => playTone(60, 0.3, 'square', 0.15), 100); }

  window.DragGameSound = {
    toggle: () => {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem('truck-sound', soundEnabled ? 'on' : 'off'); } catch(e) {}
      if (soundEnabled) sfxChime();
      return soundEnabled;
    },
    isOn: () => soundEnabled,
  };

  /* ═════ Build stations from drop_zones ═════ */
  function buildStations(dropZones) {
    const start = { id: 'start', icon: '🏠', label: 'Kho', sub: 'Bắt đầu', zone: null };

    if (!dropZones || !dropZones.length) {
      return [
        start,
        { id: 'from-line',   icon: '📦', label: 'FROM',   sub: 'Tải bảng',    zone: 'from-line' },
        { id: 'where-line',  icon: '🚧', label: 'WHERE',  sub: 'Lọc dòng',    zone: 'where-line' },
        { id: 'select-line', icon: '📤', label: 'SELECT', sub: 'Xuất kết quả', zone: 'select-line' }
      ];
    }

    const zoneStations = dropZones.map(z => {
      const cfg = ZONE_CONFIG[z.id] || { icon: '📋', label: z.id, sub: '' };
      return { id: z.id, icon: cfg.icon, label: cfg.label, sub: cfg.sub, zone: z.id };
    });

    return [start, ...zoneStations];
  }

  /* ═════ INIT ═════ */
  function init(opts) {
    opts = opts || {};
    mountEl = document.getElementById('drag-game-mount');
    if (!mountEl) return;
    mountEl.innerHTML = '';

    const lesson = opts.lesson || {};
    const table = (lesson.drag_map && lesson.drag_map.table) || DEFAULT_TABLE;
    const dropZones = opts.dropZones || null;

    activeStations = buildStations(dropZones);

    const root = document.createElement('div');
    root.className = 'pipeline-root';
    mountEl.appendChild(root);

    trackEl = document.createElement('div');
    trackEl.className = 'pipeline';

    const stationCount = activeStations.length;
    trackEl.style.setProperty('--station-count', stationCount);

    trackEl.innerHTML = `
      <div class="pipeline-truck-row">
        <div class="pipeline-rail">
          ${activeStations.slice(1).map((_, i) => `
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
        ${activeStations.map(s => `
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

    stationEls = {};
    activeStations.forEach(s => {
      stationEls[s.id] = trackEl.querySelector(`[data-station="${s.id}"]`);
    });
    truckEl = trackEl.querySelector('[data-truck]');

    activeStations.forEach(s => {
      if (stationEls[s.id]) {
        stationEls[s.id].addEventListener('click', () => showStationHint(s));
      }
    });

    statusEl = document.createElement('div');
    statusEl.className = 'pipeline-status';
    statusEl.innerHTML = `
      <span class="status-dot"></span>
      <span class="status-text">Sẵn sàng. Kéo khối lệnh vào drop-zone để bắt đầu truy vấn.</span>
    `;
    root.appendChild(statusEl);

    const soundBtn = document.createElement('button');
    soundBtn.className = 'pipeline-sound-toggle';
    if (!soundEnabled) soundBtn.classList.add('muted');
    soundBtn.innerHTML = soundEnabled ? '🔊' : '🔇';
    soundBtn.title = soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh';
    soundBtn.addEventListener('click', () => {
      const on = window.DragGameSound.toggle();
      soundBtn.classList.toggle('muted', !on);
      soundBtn.innerHTML = on ? '🔊' : '🔇';
      soundBtn.title = on ? 'Tắt âm thanh' : 'Bật âm thanh';
    });
    root.appendChild(soundBtn);

    if (truckEl) {
      truckEl.classList.add('driving');
      requestAnimationFrame(() => {
        const startLeft = -80;
        truckEl.style.setProperty('--tx', startLeft + 'px');
        requestAnimationFrame(() => moveTruckTo(0, false));
        setTimeout(() => truckEl.classList.remove('driving'), 900);
        setTimeout(() => sfxEngine(), 200);
        setTimeout(() => sfxChime(), 1000);
      });
    }
    lastProgress = 0;
    lastIsComplete = false;

    window.__pipeline = { stations: stationEls, table, activeStations };
  }

  function renderStationDataPlaceholder(stationId, table) {
    return `<div class="data-empty">
      <span class="data-empty-dot"></span>
      <span class="data-empty-text">${stationId === 'start' ? '—' : 'chờ dữ liệu'}</span>
    </div>`;
  }

  function renderMiniTable(table, opts) {
    opts = opts || {};
    const cols = table.columns;
    const rows = table.dataRows;
    const hasColFilter = opts.selectedCols && opts.selectedCols.length;
    const hasRowFilter = opts.matchedRows && opts.matchedRows.length !== undefined;

    const headersHTML = cols.map(c => {
      const isSelected = !hasColFilter || opts.selectedCols.includes(c);
      return `<span class="mini-th ${isSelected ? 'selected' : 'dimmed'}">${escapeHtml(c)}</span>`;
    }).join('');

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

  function moveTruckTo(stationIdx, instant) {
    if (!trackEl) return;
    if (!truckEl) truckEl = trackEl.querySelector('[data-truck]');
    if (!truckEl) return;

    const stationDomEls = trackEl.querySelectorAll('.pipeline-station');
    const target = stationDomEls[stationIdx];
    if (!target) return;

    const trackRect = trackEl.getBoundingClientRect();
    const stationRect = target.getBoundingClientRect();
    const targetX = stationRect.left + stationRect.width / 2 - trackRect.left;

    if (instant) {
      truckEl.style.transition = 'none';
      truckEl.style.setProperty('--tx', targetX + 'px');
      requestAnimationFrame(() => { truckEl.style.transition = ''; });
      return;
    }

    truckEl.classList.add('driving');

    if (stationIdx > 0) {
      const rail = trackEl.querySelector(`[data-rail="${stationIdx - 1}"]`);
      if (rail) {
        rail.classList.remove('flowing');
        void rail.offsetWidth;
        rail.classList.add('flowing');
        setTimeout(() => rail.classList.remove('flowing'), 900);
      }
    }

    truckEl.style.setProperty('--tx', targetX + 'px');
    sfxEngine();

    const onArrival = (e) => {
      if (e.propertyName !== 'transform') return;
      truckEl.classList.remove('driving');
      truckEl.classList.add('arriving');
      target.classList.add('arriving');
      sfxChime();
      setTimeout(() => {
        truckEl.classList.remove('arriving');
        target.classList.remove('arriving');
      }, 700);
      truckEl.removeEventListener('transitionend', onArrival);
    };
    truckEl.addEventListener('transitionend', onArrival);
  }

  /* ═════ UPDATE — dynamic zone-based progress ═════ */
  function update(state) {
    state = state || {};
    if (!trackEl) return;

    const table = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;
    const zoneFills = state.zoneFills || {};

    /* ── 1. Compute progress: count consecutive filled zones (skip 'start') ── */
    let progress = 0;
    for (let i = 1; i < activeStations.length; i++) {
      const zoneId = activeStations[i].zone;
      if (zoneId && zoneFills[zoneId]) {
        progress = i;
      } else {
        break;
      }
    }

    /* ── 2. Reset visual states ── */
    activeStations.forEach(s => {
      if (stationEls[s.id]) stationEls[s.id].classList.remove('active', 'completed', 'error', 'arriving');
    });

    /* ── 3. Apply station states ── */
    activeStations.forEach((s, i) => {
      if (!stationEls[s.id]) return;
      if (i <= progress) stationEls[s.id].classList.add('active');
      if (s.zone && zoneFills[s.zone]) stationEls[s.id].classList.add('completed');
    });

    /* ── 4. Data visualizations (FROM, WHERE, SELECT get special treatment) ── */
    updateStationData('start', table, { state: 'empty' });

    activeStations.forEach(s => {
      if (s.id === 'start') return;
      if (!zoneFills[s.zone]) {
        updateStationData(s.id, table, { state: 'empty' });
        return;
      }

      const tag = zoneFills[s.zone];
      if (s.zone === 'from-line') {
        updateStationData(s.id, table, { state: 'loaded', selectedCols: null, matchedRows: null });
      } else if (s.zone === 'where-line') {
        const matchedIdx = parseWhereRows(tag, table);
        updateStationData(s.id, table, { state: 'filtered', selectedCols: null, matchedRows: matchedIdx || [] });
      } else if (s.zone === 'select-line') {
        const cols = (typeof tag === 'string') ? tag.split(',').map(c => c.trim()) : [];
        const whereTag = zoneFills['where-line'];
        const matchedIdx = whereTag ? parseWhereRows(whereTag, table) : null;
        updateStationData(s.id, table, { state: 'projected', selectedCols: cols, matchedRows: matchedIdx });
      } else {
        updateStationDataSimple(s.id, s.label, tag);
      }
    });

    /* ── 5. Cargo tags ── */
    updateStationTag('start', null);
    activeStations.forEach(s => {
      if (s.id === 'start') return;
      updateStationTag(s.id, zoneFills[s.zone] || null);
    });

    /* ── 6. Move truck ── */
    if (progress !== lastProgress) {
      moveTruckTo(progress, false);
      lastProgress = progress;
    }

    /* ── 7. Narration ── */
    updateNarration(state, progress);

    /* ── 8. Completion celebration ── */
    if (state.isComplete && !lastIsComplete) {
      celebrate();
    }
    lastIsComplete = !!state.isComplete;
  }

  function updateStationData(stationId, table, opts) {
    const el = stationEls[stationId];
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

  function updateStationDataSimple(stationId, label, text) {
    const el = stationEls[stationId];
    if (!el) return;
    const slot = el.querySelector(`[data-station-data="${stationId}"]`);
    if (!slot) return;
    slot.innerHTML = `<div class="data-simple">
      <span class="data-simple-icon">✓</span>
      <span class="data-simple-text">${escapeHtml(String(text).substring(0, 60))}</span>
    </div>`;
    slot.classList.add('has-data');
  }

  function updateStationTag(stationId, text) {
    const el = stationEls[stationId];
    if (!el) return;
    const tag = el.querySelector(`[data-station-tag="${stationId}"]`);
    if (!tag) return;
    if (text) {
      tag.innerHTML = `<span class="cargo-pill">${escapeHtml(String(text).substring(0, 50))}</span>`;
      tag.classList.add('has-text');
    } else {
      tag.innerHTML = '';
      tag.classList.remove('has-text');
    }
  }

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

  function showStationHint(station) {
    if (!statusEl) return;
    const text = statusEl.querySelector('.status-text');
    const cfg = ZONE_CONFIG[station.zone || station.id];
    if (cfg && cfg.hint) {
      text.innerHTML = `💡 ${cfg.hint}`;
    } else if (station.id === 'start') {
      text.innerHTML = '💡 Điểm xuất phát — query chưa có dữ liệu nào. Bắt đầu bằng kéo khối lệnh vào drop-zone.';
    }
  }

  function updateNarration(state, progress) {
    if (!statusEl) return;
    const text = statusEl.querySelector('.status-text');
    if (!text) return;

    statusEl.classList.remove('warn', 'ok');

    if (progress === 0) {
      text.innerHTML = `Sẵn sàng. Kéo khối lệnh vào drop-zone để bắt đầu truy vấn.`;
    } else if (state.isComplete) {
      text.innerHTML = `🎉 Query hoàn chỉnh! Tất cả các phần đã khớp.`;
      statusEl.classList.add('ok');
    } else {
      const current = activeStations[progress];
      const next = activeStations[progress + 1];
      if (next) {
        text.innerHTML = `✅ Đã hoàn thành <strong>${current.label}</strong>. Tiếp theo: kéo <strong>${next.label}</strong> vào drop-zone.`;
      } else {
        text.innerHTML = `📤 Đang hoàn thiện query. Kiểm tra lại thứ tự các khối.`;
      }
    }
  }

  function shakeTruck() {
    if (!truckEl) truckEl = trackEl.querySelector('[data-truck]');
    if (!truckEl) return;
    truckEl.classList.remove('shake');
    void truckEl.offsetWidth;
    truckEl.classList.add('shake');
    setTimeout(() => truckEl.classList.remove('shake'), 700);
    sfxBump();
    sfxCrash();
    spawnDustParticles();
  }

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

  function reset() {
    activeStations.forEach(s => {
      if (stationEls[s.id]) stationEls[s.id].classList.remove('active', 'completed', 'error', 'arriving');
    });
    if (trackEl) {
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
    }
    moveTruckTo(0, true);
    if (statusEl) {
      statusEl.classList.remove('warn', 'ok');
      statusEl.querySelector('.status-text').innerHTML =
        `Sẵn sàng. Kéo khối lệnh vào drop-zone để bắt đầu truy vấn.`;
    }
    lastProgress = 0;
    lastIsComplete = false;
  }

  function celebrate() {
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 90, spread: 70, origin: { y: 0.5 },
        colors: ['#06B6D4', '#10B981', '#F59E0B', '#FBBF24']
      });
    }
    sfxChime();
    setTimeout(() => sfxChime(), 200);
    setTimeout(() => sfxChime(), 400);

    activeStations.forEach((s, i) => {
      setTimeout(() => {
        if (stationEls[s.id]) {
          stationEls[s.id].classList.add('arriving');
          setTimeout(() => stationEls[s.id].classList.remove('arriving'), 600);
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

  window.DragGame = {
    init: init,
    update: update,
    reset: reset
  };
})();
