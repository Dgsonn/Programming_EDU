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
  let routeEl = null;       /* STAGE 2c: SVG path for getPointAtLength */
  let manifestEl = null;    /* STAGE 2c: clipboard panel */
  let manifestTtlEl = null;
  let manifestBodyEl = null;
  let manifestSubEl = null;
  let stationEls = {};
  let statusEl = null;
  let lastProgress = 0;
  let lastIsComplete = false;
  let activeStations = [];
  let runBtnEl = null;
  /* STAGE 2c: current truck position as fraction (0..1) along path */
  let currentTruckF = 0;
  /* Phase A (Fix 4 v5) state */
  let isRunning = false;
  let currentZoneFills = {};
  let currentIsComplete = false;
  /* FIX 2g-A4: expected + userBuilt dùng cho chẩn đoán khi feedback sai */
  let lastExpected = '';
  let lastUserBuilt = '';

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

  /* ═════ Build stations from drop_zones ═════
   * v43 STAGE 2b §0 PREREQUISITE: RANK map cho EXECUTION order.
   * Bài 1 [select,from,where] → sort → [from,where,select] → Kho→FROM→WHERE→SELECT.
   * Zone KHÔNG có trong RANK (setup/chain/join...) → giữ thứ tự gốc, xếp CUỐI.
   * Q1=B adaptive — CHỈ render station cho drop_zones CÓ THẬT (KHÔNG ghost 5-station).
   */
  const EXEC_RANK = { 'from-line':1, 'where-line':2, 'group-line':3, 'having-line':4, 'select-line':5, 'order-line':6 };

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

    /* Stable sort by RANK; unknown zones go cuối với original order */
    const sortedZones = dropZones
      .map((z, idx) => ({ z, idx }))
      .sort((a, b) => {
        const ra = EXEC_RANK[a.z.id];
        const rb = EXEC_RANK[b.z.id];
        if (ra !== undefined && rb !== undefined) return ra - rb;
        if (ra !== undefined) return -1;  /* ranked trước unknown */
        if (rb !== undefined) return 1;
        return a.idx - b.idx;  /* both unknown → giữ thứ tự gốc */
      })
      .map(({ z }) => z);

    const zoneStations = sortedZones.map(z => {
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

    /* ═════ STAGE 2g — Build QUERY LINE MAP HTML (replaces town map) ═════
     * KEEP engine: SVG route path + getPointAtLength + station positions + truck motion via rotate.
     * RE-SKIN theo mockup v2 (`docs/step3_queryline_mockup.html`):
     *   Nền: navy radial + lưới blueprint mờ + node-dữ liệu mờ.
     *   Ga: silhouette nhà → node lục giác + glyph + chip số thứ tự.
     *   Landmark: tháp PE → origin hub 2 vòng cyan + text PE + sub nguồn dữ liệu.
     *   Vehicle: top-down truck → capsule data-packet + đuôi glow + badge N dòng.
     */
  /* FIX 2g-B: thứ tự thực thi cho mỗi zone (chip số cạnh ga — dạy "viết ≠ chạy") */
  var EXEC_ORDER = ['from-line', 'where-line', 'group-line', 'having-line', 'select-line', 'order-line'];
  var ZONE_STROKE = {
    'from-line':'#FBBF24','where-line':'#34D399',
    'group-line':'#A78BFA','having-line':'#FB923C',
    'select-line':'#22D3EE','order-line':'#F472B6',
  };

  function buildTownMapHTML(activeStations, table) {
    var routeD = 'M 110 525 L 110 460 Q 110 445 125 445 L 240 445 Q 255 445 255 430 L 255 360 Q 255 345 270 345 L 395 345 Q 410 345 410 330 L 410 250 Q 410 235 425 235 L 510 235 Q 525 235 525 220 L 525 130 Q 525 115 510 115 L 305 115 Q 290 115 290 100 L 290 70';
    var bgDots = [[92,180,3],[510,150,3],[120,470,3],[500,430,3],[470,540,3],[70,330,3],[380,60,3],[220,75,3]].map(function(d){return '<circle class="bgnode" cx="'+d[0]+'" cy="'+d[1]+'" r="'+d[2]+'"/>';}).join('');
    var peHub = '<g class="pe-hub-group" transform="translate(110, 525)"><circle class="pe-hub" cx="0" cy="0" r="21" fill="none" stroke="#22D3EE" stroke-width="2"/><circle class="pe-hub-inner" cx="0" cy="0" r="11" fill="none" stroke="#22D3EE" stroke-width="2"/><text class="pe-txt" x="0" y="4" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" font-weight="800" fill="#22D3EE">PE</text></g><text class="pe-sub" x="110" y="572" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="500" fill="#7f93ad">nguồn dữ liệu</text>';
    function stationNode(s, ord) {
      var z = s.zone || '', stroke = ZONE_STROKE[z] || '#94a3b8';
      var glyph;
      if (z === 'from-line')        glyph = '<path d="M16,24 h28 M16,29 h28 M16,34 h22" fill="none" stroke="'+stroke+'" stroke-width="1.6" stroke-linecap="round"/>';
      else if (z === 'where-line')  glyph = '<path d="M19,22 h22 l-7,9 v8 h-8 v-8 z" fill="none" stroke="'+stroke+'" stroke-width="1.6" stroke-linejoin="round"/>';
      else if (z === 'select-line') glyph = '<path d="M19,26 h22 M19,32 h22 M19,38 h14" fill="none" stroke="'+stroke+'" stroke-width="1.6" stroke-linecap="round"/>';
      else if (z === 'group-line')  glyph = '<circle cx="22" cy="30" r="3" fill="none" stroke="'+stroke+'" stroke-width="1.6"/><circle cx="38" cy="30" r="3" fill="none" stroke="'+stroke+'" stroke-width="1.6"/><line x1="25" y1="30" x2="35" y2="30" stroke="'+stroke+'" stroke-width="1.6"/>';
      else                          glyph = '<path d="M16,28 h28 M30,22 v14" fill="none" stroke="'+stroke+'" stroke-width="1.6" stroke-linecap="round"/>';
      return '<svg class="qnode-svg" viewBox="0 0 60 60"><polygon class="qnode-hex" points="30,8 52,22 52,42 30,56 8,42 8,22" fill="#0e1726" stroke="'+stroke+'" stroke-width="1.7"/>' + glyph + (ord > 0 ? '<circle class="qnode-order" cx="49" cy="14" r="9" fill="#0a0f1c" stroke="rgba(148,163,184,.4)" stroke-width="1"/><text class="qnode-order-t" x="49" y="17.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#aebfd6">'+ord+'</text>' : '') + '</svg>';
    }
    /* FIX 2g-B: ord số dựa trên thứ tự THỰC TẾ trong bài (contiguous) — Bài 1 (3 zones) hiện 1,2,3 chứ không 1,2,5 */
    var presentZones = activeStations.map(function(s){return s.zone;}).filter(function(z){return z && EXEC_ORDER.indexOf(z) >= 0;}).sort(function(a,b){return EXEC_ORDER.indexOf(a) - EXEC_ORDER.indexOf(b);});

    var stationsHTML = activeStations.map(function(s) {
      var ord = (s.zone && presentZones.indexOf(s.zone) >= 0) ? presentZones.indexOf(s.zone) + 1 : 0;
      return '<div class="town-station qnode" data-town-station="'+s.id+'"'+(s.zone?' data-zone="'+s.zone+'"':'')+'><div class="town-station-bldg">'+stationNode(s, ord)+'</div><div class="town-station-tag"><span class="town-station-label">'+s.label+'</span><span class="town-station-check">✓</span></div></div>';
    }).join('');
    var truck = '<div class="town-truck packet" data-town-truck><div class="pk-rot"><div class="pk-trail"></div><div class="pk-body"></div></div><div class="pk-badge town-truck-badge" data-town-truck-badge>'+table.dataRows.length+' dòng</div></div>';
    var manifest = '<div class="town-manifest" data-town-manifest><div class="town-manifest-ttl" data-town-manifest-ttl>DỮ LIỆU</div><div class="town-manifest-body" data-town-manifest-body></div><div class="town-manifest-sub" data-town-manifest-sub></div></div>';
    var brand = '<div class="town-brand"><span class="town-brand-dot"></span><b>PE_TEST</b> · TUYẾN TRUY VẤN</div>';
    var compass = '<div class="town-compass"><b>N</b></div>';
    return '<div class="town-map" data-town-map>'+brand+compass+'<svg class="town-svg" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet"><rect class="map-grid" width="600" height="600" fill="url(#qline-grid)" mask="url(#qline-mask)"/>'+bgDots+'<path class="town-route-shadow" d="'+routeD+'"/><path class="town-route" d="'+routeD+'"/><path class="town-route-flow" d="'+routeD+'"/>'+peHub+'</svg><div class="town-stations">'+stationsHTML+'</div>'+truck+manifest+'</div>';
  }

  /* FIX 2g-B: SVG defs cho blueprint grid + vignette mask (inject 1 lần) */
  (function injectQlineDefs() {
    if (typeof document === 'undefined' || document.getElementById('qline-defs')) return;
    var d = document.createElement('div'); d.id = 'qline-defs';
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0"><defs><pattern id="qline-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148,163,184,.045)" stroke-width="1"/></pattern><mask id="qline-mask"><rect width="600" height="600" fill="url(#qline-vignette)"/></mask><radialGradient id="qline-vignette" cx="50%" cy="42%" r="50%"><stop offset="50%" stop-color="white" stop-opacity="1"/><stop offset="92%" stop-color="white" stop-opacity="0"/></radialGradient></defs></svg>';
    document.body.appendChild(d);
  })();


  /* placeStationsOnPath — uses getPointAtLength on .town-route to position each station.
   * §B: Stations sit ON the route, ordered by f (Kho=0, FROM=.30, WHERE=.62, SELECT=1). */
  function placeStationsOnPath() {
    var route = trackEl.querySelector('.town-route');
    if (!route) return;
    var total = route.getTotalLength();
    var fMap = { 'start': 0, 'from-line': 0.30, 'where-line': 0.62, 'group-line': 0.45,
                 'having-line': 0.75, 'select-line': 1.0, 'order-line': 0.88, 'join-line': 0.18,
                 'setup-zone': 0.10, 'chain-zone': 0.50, 'slice-zone': 0.92,
                 'select-zone': 1.0, 'inject-zone': 0.55 };
    activeStations.forEach(function(s) {
      var el = trackEl.querySelector('[data-town-station="' + s.id + '"]');
      if (!el) return;
      var f = fMap[s.id === 'start' ? 'start' : (s.zone || s.id)];
      if (f === undefined) f = activeStations.indexOf(s) / Math.max(1, activeStations.length - 1);
      var p = route.getPointAtLength(Math.max(0, Math.min(1, f)) * total);
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    });
  }

  /* v6.3 STAGE 2c init() — town map replaces vertical pipeline */
    var townHTML = buildTownMapHTML(activeStations, table);
    trackEl.innerHTML = townHTML;
    trackEl.className = 'town-map-track';  /* container for the map */

    root.appendChild(trackEl);

    /* FIX 2g-B1: ResizeObserver — ép map VUÔNG theo min(parent_w, parent_h, 600).
       Lý do: CSS aspect-ratio:1/1 + max-height:100% KHÔNG ép width khi max-height cap (browser chỉ cap height).
       → dùng JS set pixel size = min(600, parent_w, parent_h) để map vuông + fit container @ mọi viewport. */
    var mapEl = trackEl.querySelector('.town-map');
    var sizeMapToParent = function() {
      if (!mapEl) return;
      var r = mountEl.getBoundingClientRect();
      var w = r.width, h = r.height;
      /* Trừ phần data-preview + btn đã có sẵn nếu có siblings trong mountEl — trackEl chỉ là 1 child. */
      var siblings = Array.from(mountEl.children).filter(function(c){ return c !== root; });
      var siblingH = 0;
      siblings.forEach(function(s){ siblingH += s.getBoundingClientRect().height; });
      var trackRect = trackEl.getBoundingClientRect();
      var availableW = Math.max(0, w - 40);   /* 40 = padding tối đa của mount (~18+20) */
      var availableH = Math.max(0, trackRect.height || (h - siblingH - 40));
      var size = Math.min(600, availableW, availableH);
      if (size > 0) {
        mapEl.style.width = size + 'px';
        mapEl.style.height = size + 'px';
      }
    };
    sizeMapToParent();
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(sizeMapToParent);
      ro.observe(mountEl);
      ro.observe(trackEl);
    } else {
      window.addEventListener('resize', sizeMapToParent);
    }
    window.__peMapSizer = sizeMapToParent;  /* expose for probe/reset */

    /* Position stations ON the path (must happen AFTER innerHTML insert + path in DOM) */
    placeStationsOnPath();

    /* stationEls keyed by station id */
    stationEls = {};
    activeStations.forEach(s => {
      stationEls[s.id] = trackEl.querySelector('[data-town-station="' + s.id + '"]');
    });
    /* Town truck ref */
    truckEl = trackEl.querySelector('[data-town-truck]');
    /* Route path ref (for getPointAtLength in driveTruckTo) */
    routeEl = trackEl.querySelector('.town-route');
    /* Manifest refs */
    manifestEl = trackEl.querySelector('[data-town-manifest]');
    manifestTtlEl = trackEl.querySelector('[data-town-manifest-ttl]');
    manifestBodyEl = trackEl.querySelector('[data-town-manifest-body]');
    manifestSubEl = trackEl.querySelector('[data-town-manifest-sub]');

    activeStations.forEach(s => {
      if (stationEls[s.id]) {
        stationEls[s.id].addEventListener('click', () => showStationHint(s));
      }
    });

    /* Phase A (Fix 4 v5) — Run Query button */
    runBtnEl = document.createElement('button');
    runBtnEl.className = 'run-query-btn';
    runBtnEl.innerHTML = '▶ Chạy Query';
    runBtnEl.disabled = true;
    runBtnEl.addEventListener('click', function() { window.runQuery(); });
    root.appendChild(runBtnEl);

    /* v6.2 STEP 2a FIX-3: Sound toggle → MOVE to .step3-topbar (Q1=B) */
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
    const topbar = document.querySelector('.step3-topbar');
    if (topbar) topbar.appendChild(soundBtn);
    else root.appendChild(soundBtn);

    /* v6.3 STAGE 2c: Init — place truck ở Kho (f=0), instantiate vị trí, sau đó play arrival chime */
    if (truckEl && routeEl) {
      var total = routeEl.getTotalLength();
      var startP = routeEl.getPointAtLength(0);
      truckEl.style.left = startP.x + 'px';
      truckEl.style.top = startP.y + 'px';
      truckEl.style.transform = 'translate(-50%, -50%) rotate(0deg)';
      currentTruckF = 0;
      sfxEngine();
      setTimeout(() => sfxChime(), 600);
    }
    lastProgress = 0;
    lastIsComplete = false;

    window.__pipeline = { stations: stationEls, table, activeStations, route: routeEl };
  }

  /* renderStationDataPlaceholder + renderMiniTable — REMOVED in STAGE 2c.
   * Town map dùng renderStationMiniTable + manifest panel riêng. */

  /* v6.3 STAGE 2c — driveTruckTo(f, instant, duration).
   * Spec §C: SVG path route → getPointAtLength + rAF đặt xe + atan2 xoay đầu xe theo heading.
   * • instant=true: skip animation, đặt vị trí ngay (cho reset/init).
   * • instant=false: rAF animation duration (default 550ms) với ease-in-out cubic.
   * • Truck bám đường, xoay theo heading tại mỗi frame. */
  function driveTruckTo(f, instant, duration) {
    if (!truckEl || !routeEl) return;
    if (typeof f !== 'number') f = 0;
    f = Math.max(0, Math.min(1, f));
    if (instant) {
      currentTruckF = f;
      setTruckAtF(f);
      return Promise.resolve();
    }
    duration = duration || 1200;
    var fromF = currentTruckF;
    var t0 = performance.now();
    /* A2: add is-driving class to enable wheel spin + exhaust puff + headlight scan */
    if (truckEl) truckEl.classList.add('is-driving');
    return new Promise(function(resolve) {
      function fr(now) {
        var k = Math.min(1, (now - t0) / duration);
        /* ease-in-out cubic */
        k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        var curF = fromF + (f - fromF) * k;
        currentTruckF = curF;
        setTruckAtF(curF);
        if (k < 1) requestAnimationFrame(fr);
        else {
          if (truckEl) truckEl.classList.remove('is-driving');
          resolve();
        }
      }
      requestAnimationFrame(fr);
    });
  }

  /* setTruckAtF — set truck position + rotation at fraction f along route.
   * Uses getPointAtLength for (x,y) and atan2 between (f, f+0.004) for heading. */
  function setTruckAtF(f) {
    if (!truckEl || !routeEl) return;
    var total = routeEl.getTotalLength();
    var p = routeEl.getPointAtLength(f * total);
    var p2 = routeEl.getPointAtLength(Math.min(total, (f + 0.004) * total));
    var angle = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
    truckEl.style.left = p.x + 'px';
    truckEl.style.top = p.y + 'px';
    truckEl.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg)';
  }

  /* ═════ UPDATE — Phase A behavior (no auto-truck-movement) ═════ */
  function update(state) {
    state = state || {};
    if (!trackEl) return;

    const table = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;
    const zoneFills = state.zoneFills || {};

    /* ── 1. Compute progress for narration (count consecutive filled zones) ── */
    let progress = 0;
    for (let i = 1; i < activeStations.length; i++) {
      const zoneId = activeStations[i].zone;
      if (zoneId && zoneFills[zoneId]) {
        progress = i;
      } else {
        break;
      }
    }

    /* ── 2. Phase A: track drops + flash acknowledge (NO truck move, NO data viz yet) ── */
    let hasAnyInput = false;
    activeStations.forEach((s, i) => {
      if (!stationEls[s.id]) return;
      const filled = !!(s.zone && zoneFills[s.zone]);
      if (filled) {
        hasAnyInput = true;
        stationEls[s.id].classList.add('has-input');
        /* Flash acknowledge when newly filled (transition from not-filled → filled) */
        if (!stationEls[s.id].classList.contains('flash')) {
          stationEls[s.id].classList.add('flash');
          setTimeout(() => {
            if (stationEls[s.id]) stationEls[s.id].classList.remove('flash');
          }, 400);
        }
      } else {
        stationEls[s.id].classList.remove('has-input');
      }
    });

    /* ── 3. Phase A: Enable/disable Run button ── */
    if (runBtnEl) {
      runBtnEl.disabled = !hasAnyInput || isRunning;
    }

    /* ── 4. Phase A: Store state for runQuery() ── */
    currentZoneFills = zoneFills;
    currentIsComplete = !!state.isComplete;
    /* FIX 2g-A4: lưu expected SQL + user-built để showFeedback chẩn đoán khi sai */
    lastExpected = (state.expected || '').toUpperCase();
    lastUserBuilt = (state.userBuilt || '').toUpperCase();

    /* ── 5. Narration ── */
    updateNarration(state, progress);

    /* ── 6. Phase A: NO auto-celebrate, NO auto-state-complete (runQuery handles those) ── */
    lastIsComplete = !!state.isComplete;
  }

  /* updateStationData + updateStationDataSimple + updateStationTag + updateTruckCargo
   * — REMOVED in STAGE 2c. Town map uses SVG mechanism + manifest panel. */

  /* §A2/§B6: Apply/clear container state classes for correct feedback.
     is-correct = one-time pulse + sparkle (§A2), state-correct = persistent green border (§B6). */
  function setContainerComplete(isComplete) {
    var container = document.querySelector('.step3-exercise');
    if (!container) return;
    container.classList.remove('is-correct', 'state-correct', 'is-incorrect', 'state-incorrect');
    if (isComplete) {
      container.classList.add('is-correct', 'state-correct');
    }
  }

  /* ═════ Phase A (Fix 4 v5) — Execution Engine ═════ */

  /* resetExecutionVisuals — clear .executing/.completed/.error from stations, clear feedback UI */
  function resetExecutionVisuals() {
    activeStations.forEach(s => {
      if (stationEls[s.id]) {
        stationEls[s.id].classList.remove('executing', 'error');
      }
    });
    var old = document.querySelector('.query-feedback');
    if (old) old.remove();
    var oldExp = document.querySelector('.query-explanation');
    if (oldExp) oldExp.remove();
  }

  /* showStationResult — REMOVED in STAGE 2c. runQuery now writes directly to manifest + station mechanism. */

  /* executeStation — per-clause SQL transformer.
     Input: text (zone's filled content). Output: { data, display, matchedRows, selectedCols, error } */
  function executeStation(station, input, currentData, sourceTable) {
    var zone = station.zone;
    var text = String(input || '').trim();

    if (zone === 'from-line') {
      return {
        data: { rows: sourceTable.dataRows.slice(), columns: sourceTable.columns.slice() },
        display: 'loaded', error: false
      };
    }

    if (zone === 'where-line') {
      var matched = parseWhereRows(text, sourceTable);
      if (matched === null) {
        return { error: true, display: 'error' };
      }
      if (matched.length === 0) {
        return { error: true, display: 'error' };
      }
      var filtered = currentData.rows.filter(function(_, i) { return matched.indexOf(i) >= 0; });
      return {
        data: { rows: filtered, columns: currentData.columns },
        display: 'filtered', matchedRows: matched, error: false
      };
    }

    if (zone === 'select-line') {
      var cols = text.split(',').map(function(c) { return c.trim(); }).filter(Boolean);
      if (cols.length === 0) {
        return { error: true, display: 'error' };
      }
      return {
        data: { rows: currentData.rows, columns: cols },
        display: 'projected', selectedCols: cols, error: false
      };
    }

    /* GROUP BY, ORDER BY, etc. — pass through */
    return { data: currentData, display: 'simple', error: false };
  }

  /* ═════ v6.1 Helpers ═════ */

  /* v6.2 STAGE 2b §3: moveTruckToStation — anticipation 120ms + travel 550ms + arrival 150ms.
   * Spec §6: "anticipation 120ms trước travel: scaleY(0.85) + lùi nhẹ.
   *          arrival: overshoot translateY(+4px) → settle 150ms."
   * Travel dùng CSS transition transform cubic-bezier(0.65,0,0.35,1) 550ms.
   * Anticipation + arrival qua keyframe animations (.truck-anticipating / .truck-arriving).
   * Total ~820ms per movement.
   */
  /* v6.3 STAGE 2c — driveTruckToStation(stationId).
   * Anticipation 120ms (scaleY .85) → driveTruckTo f (550ms ease-in-out, rAF) → arrival 150ms (scaleY 1.05 → 1).
   * Returns a Promise resolved when arrival settles. */
  function driveTruckToStation(stationId) {
    if (!truckEl || !routeEl) return Promise.resolve();
    var station = activeStations.find(function(s) { return s.id === stationId; });
    if (!station) return Promise.resolve();
    var fMap = { 'start': 0, 'from-line': 0.30, 'where-line': 0.62, 'group-line': 0.45,
                 'having-line': 0.75, 'select-line': 1.0, 'order-line': 0.88, 'join-line': 0.18,
                 'setup-zone': 0.10, 'chain-zone': 0.50, 'slice-zone': 0.92,
                 'select-zone': 1.0, 'inject-zone': 0.55 };
    var f = fMap[station.id === 'start' ? 'start' : (station.zone || station.id)];
    if (f === undefined) f = activeStations.indexOf(station) / Math.max(1, activeStations.length - 1);

    /* 1. ANTICIPATION 120ms — scaleY 0.85 + retreat (CSS keyframe) */
    truckEl.classList.add('truck-anticipating');
    return new Promise(function(resolve) {
      setTimeout(function() {
        truckEl.classList.remove('truck-anticipating');
        /* 2. TRAVEL 550ms ease-in-out cubic, rAF */
        driveTruckTo(f, false, 1200).then(function() {
          /* 3. ARRIVAL overshoot → settle 150ms */
          truckEl.classList.add('truck-arriving');
          setTimeout(function() {
            truckEl.classList.remove('truck-arriving');
            resolve();
          }, 150);
        });
      }, 120);
    });
  }

  /* v6.2 STAGE 2b §4: updateTruckBadge — Q2=A digit-bounce + flash module-accent.
   * Số cũ: scale(1→0) + fade 120ms. Số mới: scale(0→1.2→1) 160ms + 1 nhịp flash module-accent.
   * Flash dùng --module-accent, KHÔNG dùng màu zone (tránh nhiễu/spoiler).
   * Total ~280ms. Skip nếu count không đổi.
   */
  function updateTruckBadge(newCount) {
    if (!truckEl) return;
    var badge = truckEl.querySelector('[data-town-truck-badge]');
    if (!badge) return;
    var oldText = badge.textContent.trim();
    var newText = String(newCount);
    if (oldText === newText) return;

    /* Build digit-bounce DOM: old (out) + new (in) */
    badge.innerHTML = '';
    var oldDigit = document.createElement('span');
    oldDigit.className = 'badge-digit badge-digit-out';
    oldDigit.textContent = oldText;
    var newDigit = document.createElement('span');
    newDigit.className = 'badge-digit badge-digit-in';
    newDigit.textContent = newText;
    badge.appendChild(oldDigit);
    badge.appendChild(newDigit);

    /* 1 nhịp flash module-accent trên badge container */
    badge.classList.remove('flash');
    void badge.offsetWidth;
    badge.classList.add('flash');

    /* Cleanup sau 280ms → reset về plain text */
    setTimeout(function() {
      badge.classList.remove('flash');
      badge.innerHTML = '';
      badge.textContent = newText;
    }, 280);
  }

  /* renderStationMiniTable — render with .filtered-out/.col-hidden classes (v6.1) */
  function renderStationMiniTable(inputData, result, sourceTable) {
    var cols = sourceTable.columns;
    var rows = inputData.rows;

    var headerHTML = cols.map(function(c) {
      var hidden = result.selectedCols && result.selectedCols.indexOf(c) === -1
                   && result.selectedCols.indexOf('*') === -1;
      return '<th class="' + (hidden ? 'col-hidden' : '') + '">' + escapeHtml(c) + '</th>';
    }).join('');

    var rowsHTML = rows.map(function(row, i) {
      var filteredOut = result.matchedRows && result.matchedRows.indexOf(i) === -1;
      var cls = filteredOut ? 'filtered-out' : 'filtered-in';
      var cells = cols.map(function(c, ci) {
        var hidden = result.selectedCols && result.selectedCols.indexOf(c) === -1
                     && result.selectedCols.indexOf('*') === -1;
        return '<td class="' + (hidden ? 'col-hidden' : '') + '">' + escapeHtml(row[ci]) + '</td>';
      }).join('');
      return '<tr class="' + cls + '">' + cells + '</tr>';
    }).join('');

    return '<table class="station-mini-table">' +
           '<thead><tr>' + headerHTML + '</tr></thead>' +
           '<tbody>' + rowsHTML + '</tbody></table>';
  }

  /* getStepLogText — Vietnamese text per station result */
  function getStepLogText(station, result, data) {
    if (result.error) return '⚠ Lỗi xử lý';
    var zone = station.zone;
    if (zone === 'from-line') return '📦 Tải ' + data.rows.length + ' dòng';
    if (zone === 'where-line') {
      var matched = result.matchedRows ? result.matchedRows.length : 0;
      return '🚧 Lọc: ' + matched + '/' + data.rows.length + ' dòng khớp';
    }
    if (zone === 'select-line') {
      var cols = result.selectedCols ? result.selectedCols.length : 0;
      return '📤 Chọn ' + cols + ' cột';
    }
    if (zone === 'group-line') return '📊 Gom nhóm: ' + data.rows.length + ' nhóm';
    if (zone === 'order-line') return '📈 Sắp xếp: ' + data.rows.length + ' dòng';
    if (zone === 'having-line') return '🔍 Lọc nhóm: ' + data.rows.length + ' nhóm';
    return '✓ Xong';
  }

  /* ═════ v6.1 runQuery — sequential execution with station expansion + data viz ═════ */
  function runQuery() {
    if (isRunning) return;
    if (!currentZoneFills || Object.keys(currentZoneFills).length === 0) return;
    runQueryAsync();
  }

  function runQueryAsync() {
    isRunning = true;
    if (runBtnEl) { runBtnEl.disabled = true; runBtnEl.innerHTML = '⏳ Đang chạy...'; }
    /* FIX 2g-A1: gate route-flow — turn ON chỉ khi xe đi (user: "xe đứng thì đường chạy như rắn").
       gate CSS: `.town-map.is-running .town-route-flow { animation-play-state: running }` */
    if (trackEl) {
      var townMap = trackEl.querySelector('.town-map');
      if (townMap) townMap.classList.add('is-running');
    }

    /* Reset town-map state: clear station classes + manifest + mechanism visuals */
    activeStations.forEach(function(s) {
      var el = stationEls[s.id];
      if (el) el.classList.remove('active', 'done', 'error', 'executing', 'has-input');
    });
    if (manifestEl) {
      manifestEl.classList.remove('show');
      if (manifestBodyEl) manifestBodyEl.innerHTML = '';
      if (manifestSubEl) manifestSubEl.textContent = '';
      if (manifestTtlEl) { manifestTtlEl.textContent = '📋 Phiếu giao hàng'; manifestTtlEl.style.color = ''; }
    }
    if (trackEl) {
      trackEl.querySelectorAll('.sil-box').forEach(function(b) {
        b.style.opacity = '0';
        b.style.transform = '';
        b.classList.remove('kept', 'dropped');
      });
      trackEl.querySelectorAll('.sil-barrier').forEach(function(b) {
        b.style.transform = 'translateX(0)';
      });
    }
    /* Clear all truck indicators .driving */
    document.querySelectorAll('.pipeline-truck-indicator').forEach(function(t) {
      t.classList.remove('driving');
    });

    var table = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;

    /* Remove orphan pipeline-truck-indicator if any (v6.2 cleanup) */
    document.querySelectorAll('.pipeline-truck-indicator').forEach(function(t) {
      t.classList.remove('driving');
    });

    /* SQL semantic order (RANK từ 2b) */
    var semanticOrder = ['from-line', 'where-line', 'group-line', 'having-line', 'select-line', 'order-line'];
    var filledStations = [];
    semanticOrder.forEach(function(zoneId) {
      if (currentZoneFills[zoneId]) {
        var station = activeStations.find(function(s) { return s.zone === zoneId; });
        if (station) filledStations.push({ station: station, input: currentZoneFills[zoneId] });
      }
    });
    activeStations.forEach(function(s) {
      if (s.zone && s.id !== 'start' && currentZoneFills[s.zone]) {
        var exists = filledStations.some(function(f) { return f.station.zone === s.zone; });
        if (!exists) filledStations.push({ station: s, input: currentZoneFills[s.zone] });
      }
    });

    var currentData = { rows: table.dataRows.slice(), columns: table.columns.slice() };

    /* Async sequence — §F pacing ~1s/station (Q4=B) */
    (async function() {
      for (var i = 0; i < filledStations.length; i++) {
        var entry = filledStations[i];
        var stationEl = stationEls[entry.station.id];
        if (!stationEl) continue;

        /* 1. Truck drive → station (anticipation 120 + travel 550 + arrival 150 = 820ms) */
        sfxEngine();
        await driveTruckToStation(entry.station.id);

        /* 2. Mark station active (glow) */
        stationEl.classList.add('active');

        /* 3. Execute SQL clause */
        var result = executeStation(entry.station, entry.input, currentData, table);

        /* 4. Update manifest (replaces old station-data-area) */
        updateManifest(entry.station, result, currentData, table);

        /* 5. Per-zone mechanism animation (§B.3) */
        if (!result.error) {
          await runStationMechanism(entry.station, result, currentData, table);
        }

        /* 6. Update truck badge — Q2=A digit-bounce */
        if (!result.error) {
          updateTruckBadge(result.data.rows.length);
        }

        /* 7. Wait for badge animation + let user READ manifest (~1.5s pause) */
        await wait(1500);

        /* 8. Mark done / error */
        stationEl.classList.remove('active');
        if (result.error) {
          stationEl.classList.add('error');
          shakeTruck();
          finishExecution(false);
          return;
        }
        stationEl.classList.add('done');
        sfxChime();
        currentData = result.data;
        await wait(80);
      }
      finishExecution();
    })();
  }

  /* wait — Promise-based delay */
  function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  /* updateManifest — fill manifest panel (§D: 280px, font 12.5px) */
  function updateManifest(station, result, data, table) {
    if (!manifestEl || !manifestBodyEl) return;
    if (manifestTtlEl) {
      var titles = {
        'from-line': '📦 FROM — tải bảng',
        'where-line': '🚧 WHERE — lọc',
        'group-line': '📊 GROUP BY — gom nhóm',
        'having-line': '🔍 HAVING — lọc nhóm',
        'select-line': '📤 SELECT — chọn cột',
        'order-line': '📈 ORDER BY — sắp xếp'
      };
      manifestTtlEl.textContent = titles[station.zone] || ('📋 ' + station.label);
      manifestTtlEl.style.color = result.error ? '#EF4444' : '';
    }
    if (result.error) {
      manifestBodyEl.innerHTML = '<div class="manifest-error">⚠ Lỗi xử lý</div>';
    } else {
      manifestBodyEl.innerHTML = renderStationMiniTable(data, result, table);
      var rows = manifestBodyEl.querySelectorAll('.station-mini-table tbody tr');
      rows.forEach(function(tr, idx) { tr.style.setProperty('--i', idx); });
    }
    if (manifestSubEl) {
      manifestSubEl.textContent = getStepLogText(station, result, data);
    }
    manifestEl.classList.add('show');
  }

  /* runStationMechanism — per-zone visual (§B.3 CƠ CHẾ nhìn thấy) */
  function runStationMechanism(station, result, data, table) {
    var zone = station.zone;
    if (zone === 'from-line') return mechFrom(result);
    if (zone === 'where-line') return mechWhere(result);
    if (zone === 'select-line') return mechSelect(result);
    return wait(150);
  }

  /* FROM — 4 cargo boxes fade in (stagger 80ms) */
  function mechFrom() {
    var boxes = trackEl.querySelectorAll('.silhouette-from .sil-box');
    if (!boxes.length) return wait(200);
    var promises = [];
    boxes.forEach(function(b, i) {
      promises.push(new Promise(function(resolve) {
        setTimeout(function() {
          b.style.transition = 'opacity 220ms ease-out';
          b.style.opacity = '1';
          resolve();
        }, i * 80);
      }));
    });
    return Promise.all(promises).then(function() { return wait(150); });
  }

  /* WHERE — gate filter: matched highlight xanh, unmatched fade+drop. Barrier lift. */
  function mechWhere(result) {
    var boxes = trackEl.querySelectorAll('.silhouette-from .sil-box');
    if (!boxes.length) return wait(200);
    var matched = result.matchedRows || [];
    var promises = [];
    boxes.forEach(function(b, i) {
      promises.push(new Promise(function(resolve) {
        setTimeout(function() {
          b.style.transition = 'opacity 250ms, transform 350ms cubic-bezier(0.5, 0, 0.5, 1)';
          if (matched.indexOf(i) >= 0) {
            b.style.transform = 'translateY(-3px)';
            b.classList.add('kept');
          } else {
            b.style.opacity = '0.15';
            b.style.transform = 'translateY(8px)';
            b.classList.add('dropped');
          }
          resolve();
        }, i * 90);
      }));
    });
    var barriers = trackEl.querySelectorAll('.silhouette-where .sil-barrier');
    if (barriers.length) {
      barriers.forEach(function(b) { b.style.transition = 'transform 300ms ease-out'; });
      barriers[0].style.transform = 'translateY(-4px)';
      if (barriers[1]) barriers[1].style.transform = 'translateY(-4px)';
    }
    return Promise.all(promises).then(function() { return wait(250); });
  }

  /* SELECT — dock windows highlight cyan */
  function mechSelect(result) {
    var headers = trackEl.querySelectorAll('.silhouette-select .sil-window');
    if (!headers.length) return wait(200);
    var promises = [];
    headers.forEach(function(h, i) {
      promises.push(new Promise(function(resolve) {
        setTimeout(function() {
          h.style.transition = 'fill 200ms, opacity 200ms';
          h.setAttribute('fill', '#22D3EE');
          h.style.opacity = '1';
          resolve();
        }, i * 60);
      }));
    });
    return Promise.all(promises).then(function() { return wait(150); });
  }

    function finishExecution(success) {
      if (success === undefined) success = currentIsComplete;
      if (success) {
        celebrate();
        setContainerComplete(true);
        showFeedback('correct');
      } else {
        setContainerComplete(false);
        showFeedback('incorrect');
      }
      isRunning = false;
      /* FIX 2g-A1: gate OFF sau khi xong — đường chảy tắt khi xe dừng (đúng tinh thần route = dữ liệu di chuyển) */
      if (trackEl) {
        var townMap = trackEl.querySelector('.town-map');
        if (townMap) townMap.classList.remove('is-running');
      }
      if (runBtnEl) {
        runBtnEl.disabled = false;
        runBtnEl.innerHTML = success ? '↻ Chạy lại' : '▶ Thử lại';
      }
    }

  /* FIX 2g-A4: chẩn đoán sai ở đâu (thay vì generic "✗ Chưa đúng") */
  function diagnoseDiff(userSQL, expectedSQL) {
    if (!userSQL || !expectedSQL) return '';
    var norm = function(s) {
      return (s || '').replace(/;$/, '').replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1').trim().toUpperCase();
    };
    var u = norm(userSQL), e = norm(expectedSQL);
    if (u === e) return '';
    /* Parse clause-by-clause */
    var uParts = {
      select: (u.match(/SELECT\s+(.+?)\s+FROM/) || [])[1],
      from:   (u.match(/FROM\s+([\w_]+)/) || [])[1],
      where:  (u.match(/WHERE\s+(.+)$/) || [])[1],
    };
    var eParts = {
      select: (e.match(/SELECT\s+(.+?)\s+FROM/) || [])[1],
      from:   (e.match(/FROM\s+([\w_]+)/) || [])[1],
      where:  (e.match(/WHERE\s+(.+)$/) || [])[1],
    };
    var tips = [];
    /* Missing clause */
    if (!uParts.from && eParts.from) tips.push('Thiếu FROM — máy không biết truy vấn bảng nào.');
    else if (uParts.from && eParts.from && uParts.from !== eParts.from) tips.push('FROM khác: bạn dùng "' + uParts.from + '" nhưng đáp án là "' + eParts.from + '".');
    if (!uParts.select && eParts.select) tips.push('Thiếu SELECT.');
    else if (uParts.select && eParts.select && uParts.select !== eParts.select) tips.push('SELECT khác: bạn "' + uParts.select + '" — đáp án "' + eParts.select + '".');
    if (eParts.where && !uParts.where) tips.push('Thiếu WHERE — cần lọc để ra đúng 1 dòng.');
    else if (uParts.where && eParts.where && uParts.where !== eParts.where) tips.push('WHERE khác: bạn "' + uParts.where + '" — đáp án "' + eParts.where + '".');
    if (tips.length === 0) {
      /* Clauses match but exact string differs (extra spaces, semicolons, ordering) */
      tips.push('Cú pháp gần đúng — kiểm tra khoảng trắng, dấu phẩy, thứ tự.');
    }
    return tips.slice(0, 3).join(' ');
  }

  /* Brilliant-style feedback pill + action buttons */
  function showFeedback(type) {
    var old = document.querySelector('.query-feedback');
    if (old) old.remove();

    /* Append to .step-pane (NOT .step3-exercise which has overflow:hidden) */
    var container = document.querySelector('.step-pane[data-step="3"]') ||
                    document.querySelector('.step3-exercise') || mountEl;
    var fb = document.createElement('div');
    fb.className = 'query-feedback ' + type;

    if (type === 'correct') {
      fb.innerHTML =
        '<span class="feedback-pill correct">✓ Chính xác!</span>' +
        '<div class="feedback-actions">' +
          '<button class="feedback-btn outlined" data-action="explain">Tại sao?</button>' +
          '<button class="feedback-btn filled correct" data-action="continue">Tiếp tục →</button>' +
        '</div>';
    } else {
      var diagnosis = diagnoseDiff(lastUserBuilt, lastExpected);
      fb.innerHTML =
        '<span class="feedback-pill incorrect">✗ Chưa đúng.</span>' +
        (diagnosis ? '<div class="feedback-diagnosis">' + diagnosis + '</div>' : '') +
        '<div class="feedback-actions">' +
          '<button class="feedback-btn outlined" data-action="hint">Xem gợi ý</button>' +
          '<button class="feedback-btn filled incorrect" data-action="retry">Thử lại</button>' +
        '</div>';
    }
    container.appendChild(fb);

    /* Event delegation for action buttons */
    fb.addEventListener('click', function(e) {
      var btn = e.target.closest('button[data-action]');
      if (!btn) return;
      var action = btn.dataset.action;
      if (action === 'explain') {
        window.showQueryExplanation();
      } else if (action === 'continue') {
        if (typeof window.goToStep === 'function') window.goToStep(4);
      } else if (action === 'hint') {
        var firstFilled = filledStations[0];
        if (firstFilled) window.showStationHint(firstFilled.station);
      } else if (action === 'retry') {
        window.runQuery();
      }
    });
  }

  /* showQueryExplanation — minimal new (per user instruction):
     Display step-by-step explanation by calling showStationHint for each filled station in sequence.
     User sees hints appear in the status bar one after another. */
  function showQueryExplanation() {
    var filledList = [];
    for (var i = 1; i < activeStations.length; i++) {
      var s = activeStations[i];
      if (s.zone && currentZoneFills[s.zone]) {
        filledList.push(s);
      }
    }
    if (filledList.length === 0) return;

    /* Show each hint sequentially with 1.5s gap (status bar updates) */
    filledList.forEach(function(station, idx) {
      setTimeout(function() {
        showStationHint(station);
      }, idx * 1500);
    });
  }

  /* Expose Phase A functions to global scope for inline onclick handlers */
  window.runQuery = runQuery;
  window.showQueryExplanation = showQueryExplanation;
  /* activeStations read-only access (for showStationHint button etc.) */
  Object.defineProperty(window, 'activeStations', {
    get: function() { return activeStations; }
  });

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

  /* A4: Expose parseWhereRows + executeStation cho helper PE_runSQL (dùng chung step 3 + step 4) */
  window.PE_parseWhereRows = parseWhereRows;
  window.PE_executeStation = executeStation;

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
    if (!truckEl) truckEl = trackEl.querySelector('[data-town-truck]');
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
    /* STAGE 2c reset: clear town-station states + manifest + mechanism visuals + truck */
    activeStations.forEach(s => {
      if (stationEls[s.id]) {
        stationEls[s.id].classList.remove('active', 'done', 'error', 'has-input', 'flash', 'executing', 'arriving');
      }
    });
    if (trackEl) {
      trackEl.querySelectorAll('.sil-box').forEach(b => {
        b.style.opacity = '0';
        b.style.transform = '';
        b.classList.remove('kept', 'dropped');
      });
      trackEl.querySelectorAll('.sil-barrier').forEach(b => { b.style.transform = 'translateX(0)'; });
      trackEl.querySelectorAll('.silhouette-select .sil-window').forEach(w => {
        w.setAttribute('fill', '#FCD34D');
      });
    }
    if (manifestEl) {
      manifestEl.classList.remove('show');
      if (manifestBodyEl) manifestBodyEl.innerHTML = '';
      if (manifestSubEl) manifestSubEl.textContent = '';
      if (manifestTtlEl) { manifestTtlEl.textContent = '📋 Phiếu giao hàng'; manifestTtlEl.style.color = ''; }
    }
    /* Truck instant về Kho (f=0) */
    driveTruckTo(0, true);
    /* Truck badge về initial row count */
    if (truckEl) {
      var badge = truckEl.querySelector('[data-town-truck-badge]');
      var initTable = (window.__pipeline && window.__pipeline.table) || DEFAULT_TABLE;
      if (badge) {
        badge.classList.remove('flash');
        badge.innerHTML = '';
        badge.textContent = String(initTable.dataRows.length);
      }
    }
    /* Container state */
    setContainerComplete(false);
    resetExecutionVisuals();
    isRunning = false;
    currentZoneFills = {};
    currentIsComplete = false;
    if (runBtnEl) {
      runBtnEl.disabled = true;
      runBtnEl.innerHTML = '▶ Chạy Query';
    }
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
