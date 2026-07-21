/* ============================================================================
 * ml_flow_map.js — Map "DÒNG CHẢY PIPELINE ML" (skin riêng khóa ML, 2026-07-18c)
 *
 * KHÔNG phải minh họa — là REPRESENTATION của logic + hệ thống đằng sau code
 * (Computational Thinking, user chốt 7 quyết định qua AskUserQuestion):
 *   · 2 tầng: node có mini-visual bên trong + SÂN KHẤU lớn diễn biến đổi
 *   · node hiện INPUT tĩnh, GIẤU kết quả tới khi chạy
 *   · chạy = step machine: dừng từng trạm + narration, bấm "Bước tiếp ▶"
 *   · xong: click lại trạm bất kỳ để xem lại cảnh của trạm đó
 *   · TRAIN/PREDICT thể hiện ĐÚNG nearest-centroid của SimpleClassifier
 *
 * Anatomy shell giữ nguyên: cột phải (zones/bank/solution.py), chấm qua
 * lesson_db_design.updateTruckGrid → MLFlowMap.update({zoneFills, zoneCorrect,
 * wrongLines, isComplete}). Nút chạy mang class .run-query-btn để tái dùng
 * delegation hydrate-typed-code của shell.
 *
 * Public API (giống DragGame): MLFlowMap.init({lesson, dropZones}) / .update() / .reset()
 * ============================================================================ */
(function () {
  'use strict';

  let mountEl = null;
  let cfg = null;          // lesson.step_3.ml_flow
  let table = null;        // lesson.drag_map.table
  let stations = [];       // cfg.stations (theo thứ tự zone)
  let runBtn = null;
  let stageEl = null;
  let rootEl = null;       // đợt 4: giữ ref để auto-fit scale
  let fitTimer = null;
  let zoneIds = [];        // Bài 2: thứ tự drop_zones — map số dòng sai → trạm
  let state = { phase: 'idle', idx: -1, done: false };
  let grading = { zoneFills: {}, zoneCorrect: {}, wrongLines: [], isComplete: false };

  /* ── Đợt 4 (user chốt 2026-07-19): AUTO CO map theo màn hình — giữ nguyên bố cục,
     zoom(k) cả .mlf-root để trọn pipeline + bảng + nút Run lọt cột trái ở zoom 100%.
     Dùng CSS zoom (reflow THẬT) thay transform: transform giữ layout box gốc nên phải
     bù width/height tay — width đổi lại reflow ra chiều cao KHÁC số đã đo → nút Run
     từng văng khỏi vùng clip (bug screenshot 2026-07-19). zoom co cả layout, đo lại
     hội tụ sau ≤3 vòng. Sàn k=0.55 — dưới sàn thì cột cuộn phần dư. */
  function fitScale() {
    if (!rootEl || !mountEl || !document.body.contains(rootEl)) return;
    rootEl.style.zoom = '';
    /* Chuẩn đo = CONTENT BOX của mount (mount có padding 18×2 + overflow:hidden là
       thứ THẬT SỰ cắt nội dung — đo theo chiều cao cột từng làm nút Run bị xén). */
    const cs = getComputedStyle(mountEl);
    const avail = mountEl.clientHeight
      - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0) - 2;
    if (avail <= 120) return;
    let k = 1;
    for (let i = 0; i < 3; i++) {
      const vis = rootEl.getBoundingClientRect().height;
      if (!vis || vis <= avail + 2) break;
      k = Math.max(0.5, k * (avail / vis));
      rootEl.style.zoom = String(k);
      if (k <= 0.501) break;
    }
  }

  function scheduleFit() {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitScale, 120);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ── mini bảng nguồn (node KHO + sân khấu idle) ── */
  function tableHTML(extraCls, maxRows) {
    const rows = maxRows ? table.dataRows.slice(0, maxRows) : table.dataRows;
    return '<table class="mlf-table ' + (extraCls || '') + '"><thead><tr>' +
      table.columns.map(c => '<th>' + esc(c) + '</th>').join('') +
      '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map(v => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') +
      (maxRows && table.dataRows.length > maxRows
        ? '<tr class="mlf-table-more"><td colspan="' + table.columns.length + '">⋯ đủ ' + table.dataRows.length + ' dòng</td></tr>' : '') +
      '</tbody></table>';
  }

  /* Bài 2 (branch): 1 trạm có thể ôm NHIỀU zone — key node = zone đầu tiên */
  function stKey(st) { return st.zone || (st.zones && st.zones[0]) || ''; }
  function stationIndexForZone(zoneId) {
    return stations.findIndex(s => s.zone === zoneId || (s.zones || []).indexOf(zoneId) >= 0);
  }

  /* ── phần RESULT của node theo kind — ẩn ("?") tới khi reveal ── */
  function nodeResultHTML(st, revealed) {
    const k = st.result_kind;
    if (k === 'xy_split') {
      const sp = st.split || {};
      if (!revealed) {
        return '<div class="mlf-chips"><span class="mlf-chip ghost">X → ?</span><span class="mlf-chip ghost">y → ?</span><span class="mlf-chip ghost">X_new → ?</span></div>';
      }
      return '<div class="mlf-chips">' +
        '<span class="mlf-chip x">X · ' + esc(sp.x_desc || 'đặc trưng') + '</span>' +
        '<span class="mlf-chip y">y · ' + esc(sp.y_desc || 'nhãn') + '</span>' +
        '<span class="mlf-chip xnew">X_new · ' + esc(sp.new_desc || 'hồ sơ mới') + '</span></div>';
    }
    if (k === 'model_empty') {
      return revealed
        ? '<div class="mlf-modelbox is-on">model — RỖNG · chưa có tri thức</div>'
        : '<div class="mlf-modelbox">model — ?</div>';
    }
    if (k === 'centroids') {
      const c = st.centroids || {};
      return '<div class="mlf-portraits">' +
        '<div class="mlf-portrait fail' + (revealed ? ' is-on' : '') + '"><span class="mlf-portrait-t">🔴 ' + esc((c.fail || {}).title || 'RỚT trung bình') + '</span><span class="mlf-portrait-v">' + (revealed ? esc((c.fail || {}).vals || '') : '?') + '</span></div>' +
        '<div class="mlf-portrait pass' + (revealed ? ' is-on' : '') + '"><span class="mlf-portrait-t">🟢 ' + esc((c.pass || {}).title || 'ĐẬU trung bình') + '</span><span class="mlf-portrait-v">' + (revealed ? esc((c.pass || {}).vals || '') : '?') + '</span></div></div>';
    }
    if (k === 'nearest') {
      const d = st.dist || {};
      return '<div class="mlf-predict-row">' +
        '<span class="mlf-chip xnew">👤 ' + esc(st.profile || '') + '</span>' +
        '<span class="mlf-arrow-r">→</span>' +
        (revealed
          ? '<span class="mlf-verdict is-on">' + esc(st.verdict || '') + '</span>' +
            '<span class="mlf-dist-mini">Δ ĐẬU ≈ ' + esc(d.pass) + ' · Δ RỚT ≈ ' + esc(d.fail) + '</span>'
          : '<span class="mlf-verdict">nhãn: ?</span>') +
        '</div>';
    }
    /* Bài 2 — REGRESSION: tổng các đóng góp w·x (least squares thật) */
    if (k === 'reg_sum') {
      const rg = st.reg || {};
      return '<div class="mlf-predict-row">' +
        '<span class="mlf-chip xnew">👤 ' + esc(rg.xnew || '') + '</span>' +
        '<span class="mlf-arrow-r">→</span>' +
        (revealed
          ? '<span class="mlf-verdict is-on">' + esc(rg.total || '') + '</span>' +
            '<span class="mlf-dist-mini">' + (rg.parts || []).map(p => (p.val >= 0 && p !== (rg.parts || [])[0] ? '+' : '') + p.val).join(' ') + '</span>'
          : '<span class="mlf-verdict">điểm: ?</span>') +
        '</div>';
    }
    /* Bài 2 — CLUSTERING: k nhóm với sĩ số thật, ID tùy ý */
    if (k === 'clusters') {
      const cu = st.clusters || {};
      const gs = cu.groups || [];
      return '<div class="mlf-chips">' +
        (revealed
          ? gs.map(g => '<span class="mlf-chip clu clu-' + g.id + '">C' + g.id + ' · ' + g.n + ' hv</span>').join('')
          : gs.map(() => '<span class="mlf-chip ghost">nhóm ?</span>').join('')) +
        '</div>';
    }
    /* Bài 3 — HỢP ĐỒNG X/y theo nhiệm vụ: reveal shape + dtype + cột bị gạch */
    if (k === 'roles_split') {
      const ro = st.roles || {};
      if (!revealed) {
        return '<div class="mlf-chips"><span class="mlf-chip ghost">X → ?</span><span class="mlf-chip ghost">y → ?</span><span class="mlf-chip ghost">bỏ → ?</span></div>';
      }
      return '<div class="mlf-chips">' +
        '<span class="mlf-chip x">' + esc(ro.x_shape || 'X') + '</span>' +
        '<span class="mlf-chip y">' + esc(ro.y_shape || 'y') + '</span>' +
        (ro.banned && ro.banned.length ? '<span class="mlf-chip ban">🚫 ' + esc(ro.banned[0].col) + '</span>' : '') +
        '</div>';
    }
    /* Bài 4 — 4 NHÓM KIỂU NGỮ NGHĨA: mỗi cột feature nhận 1 nhãn nhóm */
    if (k === 'type_groups') {
      const tg = (st.type_groups || {}).groups || [];
      return '<div class="mlf-chips">' +
        (revealed
          ? tg.map(g => '<span class="mlf-chip tg tg-' + esc(g.kind) + '">' + esc(g.col) + ' · ' + esc(g.tag) + '</span>').join('')
          : tg.map(() => '<span class="mlf-chip ghost">nhóm ?</span>').join('')) +
        '</div>';
    }
    /* Bài 4 — READINESS CARD: X/y chốt + cột loại + cảnh báo encoding */
    if (k === 'readiness') {
      const rd = st.readiness || {};
      if (!revealed) {
        return '<div class="mlf-chips"><span class="mlf-chip ghost">X → ?</span><span class="mlf-chip ghost">y → ?</span><span class="mlf-chip ghost">⚠ ?</span></div>';
      }
      return '<div class="mlf-chips">' +
        '<span class="mlf-chip x">' + esc(rd.x_shape || 'X') + '</span>' +
        '<span class="mlf-chip y">' + esc(rd.y_shape || 'y') + '</span>' +
        ((rd.warns || []).length ? '<span class="mlf-chip warn">⚠ ' + (rd.warns || []).length + ' cột cần xử lý' : '') +
        '</div>';
    }
    /* Bài 5 — BẢNG ĐẾM chất lượng: 5 chỉ số (dòng·trùng·sai·thiếu·cờ) đổi sau mỗi vòng */
    if (k === 'quality_counts') {
      const qc = st.quality || {};
      const af = qc.after || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">đếm → ?</span></div>';
      return '<div class="mlf-qc-mini">' + qcMiniHTML(qc.before || {}, af, qc.changed || []) + '</div>';
    }
    /* Bài 6 — CHỌN cột scale: 3 feature số (X) + 3 cột đứng ngoài (ban) */
    if (k === 'scale_select') {
      const ss = st.scale_select || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">cột → ?</span></div>';
      return '<div class="mlf-chips">' +
        (ss.pick || []).map(p => '<span class="mlf-chip x">🎚 ' + esc(p.col) + '</span>').join('') +
        (ss.exclude || []).map(e => '<span class="mlf-chip ban">🚫 ' + esc(e.col) + '</span>').join('') +
        '</div>';
    }
    /* Bài 6 — SCALE stats: σ mỗi cột (thô → 1) hoặc verify mean0/std1 */
    if (k === 'scale_stats') {
      const sc = st.scale || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">σ → ?</span></div>';
      return '<div class="mlf-sc-mini">' + (sc.rows || []).map(function (r) {
        const short = String(r.col).split('_')[0];
        const bs = r.before_std >= 100 ? Math.round(r.before_std) : r.before_std;
        return '<span class="mlf-sc-cell"><i>' + esc(short) + '</i><b>' +
          (sc.mode === 'verify' ? 'σ1·μ0' : ('σ' + esc(bs) + '→1')) + '</b></span>';
      }).join('') + '</div>';
    }
    return '';
  }

  /* 5 chỉ số chất lượng dữ liệu — compact (node) */
  var QC_KEYS = [
    { k: 'rows', label: 'dòng', full: 'DÒNG' }, { k: 'dup', label: 'trùng', full: 'TRÙNG 100%' },
    { k: 'invalid', label: 'sai', full: 'SAI (phạm vi/danh mục)' }, { k: 'missing', label: 'thiếu', full: 'THIẾU (NaN)' },
    { k: 'flag', label: 'cờ', full: 'CẮM CỜ' }
  ];
  function qcMiniHTML(before, after, changed) {
    return QC_KEYS.map(function (m) {
      var v = after[m.k];
      if (v === undefined) v = before[m.k];
      var chg = changed.indexOf(m.k) >= 0;
      var dir = '';
      if (chg && before[m.k] !== undefined && after[m.k] !== undefined) {
        dir = after[m.k] > before[m.k] ? ' qc-up' : (after[m.k] < before[m.k] ? ' qc-down' : '');
      }
      return '<span class="mlf-qc-cell' + (chg ? ' qc-chg' + dir : '') + '"><b>' + esc(v) + '</b><i>' + m.label + '</i></span>';
    }).join('');
  }

  function nodeHTML(st, i) {
    return '<div class="mlf-node" data-mlf-node="' + stKey(st) + '">' +
      '<div class="mlf-node-head">' +
        '<span class="mlf-ord">' + (i + 1) + '</span>' +
        '<span class="mlf-icon">' + st.icon + '</span>' +
        '<span class="mlf-node-title"><b>' + esc(st.label) + '</b><i>' + esc(st.sub) + '</i></span>' +
        '<span class="mlf-node-state" data-mlf-state></span>' +
      '</div>' +
      '<div class="mlf-node-body" data-mlf-body>' + nodeResultHTML(st, false) + '</div>' +
      '</div>';
  }

  /* ── SÂN KHẤU: cảnh lớn theo trạm ── */
  function sceneHTML(st) {
    const k = st.result_kind;
    if (k === 'xy_split') {
      const sp = st.split || {};
      const featIdx = table.columns.map((c, i) => i).filter(i => (sp.features || []).indexOf(table.columns[i]) >= 0);
      const targetIdx = table.columns.indexOf(sp.target);
      const rows = table.dataRows;
      return '<div class="mlf-scene mlf-scene-split">' +
        '<table class="mlf-table mlf-table-stage"><thead><tr>' +
        table.columns.map((c, i) =>
          '<th class="' + (featIdx.indexOf(i) >= 0 ? 'hl-x' : (i === targetIdx ? 'hl-y' : '')) + '">' + esc(c) + '</th>').join('') +
        '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map((v, i) =>
          '<td class="' + (featIdx.indexOf(i) >= 0 ? 'hl-x' : (i === targetIdx ? 'hl-y' : '')) + '">' + esc(v) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>' +
        '<div class="mlf-scene-side">' +
          '<div class="mlf-legend"><span class="mlf-chip x">X = ' + (sp.features || []).length + ' cột đặc trưng</span>' +
          '<span class="mlf-chip y">y = ' + esc(sp.target || '') + '</span>' +
          '<span class="mlf-chip xnew">X_new = 👤 ' + esc(sp.new_profile || '') + ' (chưa nhãn)</span></div>' +
        '</div></div>';
    }
    if (k === 'model_empty') {
      return '<div class="mlf-scene mlf-scene-model"><div class="mlf-bigbox">🤖<br>model</div>' +
        '<div class="mlf-bigbox-note">RỖNG — chưa đọc hồ sơ nào.<br>Cách nó sẽ học: tính <b>chân dung trung bình</b> của từng nhóm.</div></div>';
    }
    if (k === 'centroids') {
      const c = st.centroids || {};
      return '<div class="mlf-scene mlf-scene-fit">' +
        '<div class="mlf-fit-src">12 hồ sơ + nhãn</div><div class="mlf-arrow-r big">→</div>' +
        '<div class="mlf-portrait fail is-on big"><span class="mlf-portrait-t">🔴 ' + esc((c.fail || {}).title || '') + '</span><span class="mlf-portrait-v">' + esc((c.fail || {}).vals || '') + '</span><span class="mlf-portrait-n">' + esc((c.fail || {}).n || '') + '</span></div>' +
        '<div class="mlf-portrait pass is-on big"><span class="mlf-portrait-t">🟢 ' + esc((c.pass || {}).title || '') + '</span><span class="mlf-portrait-v">' + esc((c.pass || {}).vals || '') + '</span><span class="mlf-portrait-n">' + esc((c.pass || {}).n || '') + '</span></div>' +
        '</div>';
    }
    if (k === 'nearest') {
      const d = st.dist || {};
      const maxD = Math.max(d.pass || 1, d.fail || 1);
      const wp = Math.max(6, Math.round((d.pass / maxD) * 100));
      const wf = Math.max(6, Math.round((d.fail / maxD) * 100));
      return '<div class="mlf-scene mlf-scene-nearest">' +
        '<div class="mlf-newcard">👤 Hồ sơ mới<br><b>' + esc(st.profile || '') + '</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>khoảng cách → 🟢 ĐẬU</span><div class="mlf-dist-bar"><i class="pass" style="width:' + wp + '%"></i></div><b>≈ ' + esc(d.pass) + '</b></div>' +
          '<div class="mlf-dist"><span>khoảng cách → 🔴 RỚT</span><div class="mlf-dist-bar"><i class="fail" style="width:' + wf + '%"></i></div><b>≈ ' + esc(d.fail) + '</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">' + esc(st.verdict || '') + '</div>' +
        '</div>';
    }
    /* Bài 2 — REGRESSION: cộng đóng góp từng feature (trọng số least squares thật) */
    if (k === 'reg_sum') {
      const rg = st.reg || {};
      const parts = rg.parts || [];
      const maxV = Math.max.apply(null, parts.map(p => Math.abs(p.val))) || 1;
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">👤 Hồ sơ mới<br><b>' + esc(rg.xnew || '') + '</b></div>' +
        '<div class="mlf-dists">' +
          parts.map(p => {
            const w = Math.max(6, Math.round((Math.abs(p.val) / maxV) * 100));
            const neg = p.val < 0;
            return '<div class="mlf-dist"><span>' + esc(p.label) + '</span>' +
              '<div class="mlf-dist-bar"><i class="' + (neg ? 'fail' : 'reg') + '" style="width:' + w + '%"></i></div>' +
              '<b>' + (neg ? '−' : '+') + Math.abs(p.val) + '</b></div>';
          }).join('') +
        '</div>' +
        '<div class="mlf-verdict is-on big">' + esc(rg.total || '') + '</div>' +
        '</div>';
    }
    /* Bài 2 — CLUSTERING: bảng tô màu nhóm THẬT, cột target GẠCH BỎ */
    if (k === 'clusters') {
      const cu = st.clusters || {};
      const banned = cu.banned || [];
      const labels = cu.labels || [];
      const gs = cu.groups || [];
      return '<div class="mlf-scene mlf-scene-clu">' +
        '<table class="mlf-table mlf-table-stage"><thead><tr>' +
        table.columns.map(c => '<th class="' + (banned.indexOf(c) >= 0 ? 'hl-ban' : '') + '">' +
          (banned.indexOf(c) >= 0 ? '🚫 ' : '') + esc(c) + '</th>').join('') +
        '<th>nhóm</th></tr></thead><tbody>' +
        table.dataRows.map((r, ri) => '<tr class="clu-row-' + labels[ri] + '">' +
          r.map((v, ci) => '<td class="' + (banned.indexOf(table.columns[ci]) >= 0 ? 'hl-ban' : '') + '">' + esc(v) + '</td>').join('') +
          '<td><b>C' + labels[ri] + '</b></td></tr>').join('') +
        '</tbody></table>' +
        '<div class="mlf-scene-side">' +
          '<div class="mlf-legend">' +
            gs.map(g => '<span class="mlf-chip clu clu-' + g.id + '">C' + g.id + ' · ' + g.n + ' hv · ' + esc(g.center) + '</span>').join('') +
          '</div>' +
          (cu.note ? '<div class="mlf-clu-note">🔀 ' + esc(cu.note) + '</div>' : '') +
        '</div></div>';
    }
    /* Bài 3 — bảng tô 3 VAI TRÒ theo nhiệm vụ: X tím · y vàng · BỎ gạch xám kèm lý do */
    if (k === 'roles_split') {
      const ro = st.roles || {};
      const xCols = ro.x || [];
      const banned = (ro.banned || []).map(b => b.col);
      const cls = (c) => xCols.indexOf(c) >= 0 ? 'hl-x' : (c === ro.y ? 'hl-y' : (banned.indexOf(c) >= 0 ? 'hl-ban' : ''));
      return '<div class="mlf-scene mlf-scene-clu mlf-scene-roles">' +
        '<table class="mlf-table mlf-table-stage"><thead><tr>' +
        table.columns.map(c => '<th class="' + cls(c) + '">' + (banned.indexOf(c) >= 0 ? '🚫 ' : '') + esc(c) + '</th>').join('') +
        '</tr></thead><tbody>' +
        table.dataRows.map(r => '<tr>' + r.map((v, ci) =>
          '<td class="' + cls(table.columns[ci]) + '">' + esc(v) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>' +
        '<div class="mlf-scene-side">' +
          '<div class="mlf-legend">' +
            '<span class="mlf-chip x">' + esc(ro.x_shape || 'X') + '</span>' +
            '<span class="mlf-chip y">' + esc(ro.y_shape || 'y') + (ro.y_note ? ' · ' + esc(ro.y_note) : '') + '</span>' +
          '</div>' +
          (ro.banned || []).map(b => '<div class="mlf-clu-note">🚫 <b>' + esc(b.col) + '</b> — ' + esc(b.why || '') + '</div>').join('') +
        '</div></div>';
    }
    /* Bài 4 — bảng tô 4 NHÓM kiểu ngữ nghĩa; cột ngoài nhóm (ID/target) mờ đi */
    if (k === 'type_groups') {
      const tg = (st.type_groups || {}).groups || [];
      const byCol = {};
      tg.forEach(g => { byCol[g.col] = g; });
      const cls = (c) => byCol[c] ? 'hl-tg hl-tg-' + byCol[c].kind : 'hl-dim';
      return '<div class="mlf-scene mlf-scene-clu mlf-scene-roles">' +
        '<table class="mlf-table mlf-table-stage"><thead><tr>' +
        table.columns.map(c => '<th class="' + cls(c) + '">' + esc(c) + (byCol[c] ? '<i class="mlf-tg-tag">' + esc(byCol[c].tag) + '</i>' : '') + '</th>').join('') +
        '</tr></thead><tbody>' +
        table.dataRows.map(r => '<tr>' + r.map((v, ci) =>
          '<td class="' + cls(table.columns[ci]) + '">' + esc(v) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>' +
        '<div class="mlf-scene-side">' +
          tg.map(g => '<div class="mlf-clu-note"><span class="mlf-chip tg tg-' + esc(g.kind) + '">' + esc(g.tag) + '</span> <b>' + esc(g.col) + '</b> — ' + esc(g.note || '') + '</div>').join('') +
        '</div></div>';
    }
    /* Bài 4 — READINESS CARD: thẻ chốt schema sẵn sàng train */
    if (k === 'readiness') {
      const rd = st.readiness || {};
      return '<div class="mlf-scene mlf-readiness">' +
        '<div class="mlf-ready-head">📋 ' + esc(rd.title || 'READINESS CARD — schema sẵn sàng?') + '</div>' +
        '<div class="mlf-ready-grid">' +
          '<div class="mlf-ready-row ok"><span class="mlf-chip x">' + esc(rd.x_shape || 'X') + '</span><span>' + esc(rd.x_note || '') + '</span></div>' +
          '<div class="mlf-ready-row ok"><span class="mlf-chip y">' + esc(rd.y_shape || 'y') + '</span><span>' + esc(rd.y_note || '') + '</span></div>' +
          (rd.excluded || []).map(b => '<div class="mlf-ready-row ban"><span class="mlf-chip ban">🚫 ' + esc(b.col) + '</span><span>' + esc(b.why || '') + '</span></div>').join('') +
          (rd.warns || []).map(w => '<div class="mlf-ready-row warn"><span class="mlf-chip warn">⚠ ' + esc(w.col) + '</span><span>' + esc(w.note || '') + '</span></div>').join('') +
        '</div>' +
        (rd.verdict ? '<div class="mlf-ready-verdict">✅ ' + esc(rd.verdict) + '</div>' : '') +
        '</div>';
    }
    /* Bài 5 — BẢNG ĐẾM chất lượng: 5 chỉ số before → after, chỉ số đổi được tô + mũi tên */
    if (k === 'quality_counts') {
      const qc = st.quality || {};
      const before = qc.before || {}, after = qc.after || {}, changed = qc.changed || [];
      return '<div class="mlf-scene mlf-qc-scene">' +
        '<div class="mlf-qc-grid">' + QC_KEYS.map(function (m) {
          const b = before[m.k], a = (after[m.k] !== undefined ? after[m.k] : b);
          const chg = changed.indexOf(m.k) >= 0;
          const up = chg && a > b, down = chg && a < b;
          return '<div class="mlf-qc-card' + (chg ? ' qc-chg' : '') + (up ? ' qc-up' : '') + (down ? ' qc-down' : '') + '">' +
            '<div class="mlf-qc-label">' + esc(m.full || m.label) + '</div>' +
            '<div class="mlf-qc-val">' +
              (chg && b !== a ? '<s>' + esc(b) + '</s> <span class="qc-ar">→</span> <b>' + esc(a) + '</b>' : '<b>' + esc(a) + '</b>') +
            '</div></div>';
        }).join('') + '</div>' +
        (qc.note ? '<div class="mlf-qc-note">' + qc.note + '</div>' : '') +
        '</div>';
    }
    /* Bài 6 — CHỌN cột: 2 cột SCALE vs ĐỨNG NGOÀI, kèm lý do */
    if (k === 'scale_select') {
      const ss = st.scale_select || {};
      return '<div class="mlf-scene mlf-scale-select">' +
        '<div class="mlf-sc-col mlf-sc-in"><div class="mlf-sc-colhead">🎚️ SCALE — feature số</div>' +
          (ss.pick || []).map(p => '<div class="mlf-sc-row ok"><span class="mlf-chip x">' + esc(p.col) + '</span>' +
            '<span class="mlf-sc-why">σ ≈ ' + esc(p.std) + '</span></div>').join('') +
        '</div>' +
        '<div class="mlf-sc-col mlf-sc-out"><div class="mlf-sc-colhead">🚫 ĐỨNG NGOÀI scaler</div>' +
          (ss.exclude || []).map(e => '<div class="mlf-sc-row ban"><span class="mlf-chip ban">' + esc(e.icon || '🚫') + ' ' + esc(e.col) + '</span>' +
            '<span class="mlf-sc-why">' + esc(e.why || '') + '</span></div>').join('') +
        '</div></div>';
    }
    /* Bài 6 — SCALE stats: equalizer σ thô→1 (transform) hoặc grid verify mean0/std1 */
    if (k === 'scale_stats') {
      const sc = st.scale || {};
      const rows = sc.rows || [];
      if (sc.mode === 'verify') {
        return '<div class="mlf-scene mlf-scale-verify">' +
          '<div class="mlf-scv-grid">' + rows.map(function (r) {
            return '<div class="mlf-scv-card"><div class="mlf-scv-col">' + esc(r.col) + '</div>' +
              '<div class="mlf-scv-line">mean <b>' + Number(r.after_mean || 0).toFixed(2) + '</b> <span class="mlf-scv-ok">✓ ≈ 0</span></div>' +
              '<div class="mlf-scv-line">std <b>' + Number(r.after_std || 1).toFixed(2) + '</b> <span class="mlf-scv-ok">✓ ≈ 1</span></div></div>';
          }).join('') + '</div>' +
          (sc.note ? '<div class="mlf-qc-note">' + sc.note + '</div>' : '') +
        '</div>';
      }
      const maxStd = Math.max.apply(null, rows.map(r => r.before_std || 0)) || 1;
      return '<div class="mlf-scene mlf-scale-stats">' +
        '<div class="mlf-scs-rows">' + rows.map(function (r, i) {
          const bw = Math.max(3, Math.round((r.before_std / maxStd) * 100));
          const bs = r.before_std >= 100 ? Math.round(r.before_std) : r.before_std;
          return '<div class="mlf-scs-row">' +
            '<span class="mlf-scs-name">' + esc(r.col) + '</span>' +
            '<span class="mlf-scs-bars">' +
              '<span class="mlf-scs-before"><span class="mlf-scs-bfill sc-fill-' + i + '" style="width:' + bw + '%"></span><i>σ ' + esc(bs) + '</i></span>' +
              '<span class="mlf-scs-arrow">→</span>' +
              '<span class="mlf-scs-after"><span class="mlf-scs-afill sc-fill-' + i + '" style="width:44%"></span><i>σ 1.0</i></span>' +
            '</span></div>';
        }).join('') + '</div>' +
        (sc.note ? '<div class="mlf-qc-note">' + sc.note + '</div>' : '') +
      '</div>';
    }
    return '';
  }

  function showStageIdle() {
    stageEl.innerHTML =
      '<div class="mlf-stage-head"><span>🗄 ' + esc(table.name) + '</span><span class="mlf-stage-sub">' + esc((cfg.source && cfg.source.sub) || (table.dataRows.length + ' dòng')) + '</span></div>' +
      '<div class="mlf-stage-body">' + tableHTML('mlf-table-stage', 0) + '</div>' +
      '<div class="mlf-stage-foot">Lắp ' + (zoneIds.length || 4) + ' dòng lệnh (kéo hoặc tự gõ) rồi bấm <b>' +
        esc(cfg.run_label || '▶ Chạy Pipeline') + '</b> — sân khấu này sẽ diễn từng phép biến đổi.</div>';
    scheduleFit();
  }

  function showScene(i, replay) {
    const st = stations[i];
    stageEl.innerHTML =
      '<div class="mlf-stage-head"><span>' + st.icon + ' Trạm ' + (i + 1) + '/' + stations.length + ' — ' + esc(st.label) + '</span>' +
      (replay ? '<span class="mlf-stage-sub">xem lại</span>' : '') + '</div>' +
      '<div class="mlf-stage-body">' + sceneHTML(st) + '</div>' +
      '<div class="mlf-narration">💬 ' + st.narration + '</div>' +
      '<div class="mlf-stage-foot">' +
      (replay
        ? '<button class="mlf-next" data-mlf-close>Đóng — về bảng nguồn</button>'
        : '<button class="mlf-next" data-mlf-next>' + (i === stations.length - 1 ? 'Hoàn thành ✓' : 'Bước tiếp ▶') + '</button>') +
      '</div>';
    const btn = stageEl.querySelector('[data-mlf-next]');
    if (btn) btn.addEventListener('click', advance);
    const closeBtn = stageEl.querySelector('[data-mlf-close]');
    if (closeBtn) closeBtn.addEventListener('click', showStageIdle);
    stageEl.classList.remove('mlf-stage-pop');
    void stageEl.offsetWidth;
    stageEl.classList.add('mlf-stage-pop');
    scheduleFit();
  }

  function setNodeState(i, phase) {
    const st = stations[i];
    const el = mountEl.querySelector('[data-mlf-node="' + stKey(st) + '"]');
    if (!el) return;
    /* 'reveal' chỉ thay body — KHÔNG đụng class trạng thái (từng gỡ nhầm is-active) */
    if (phase === 'reveal') {
      const body = el.querySelector('[data-mlf-body]');
      if (body) body.innerHTML = nodeResultHTML(st, true);
      return;
    }
    el.classList.remove('is-active', 'is-done', 'is-error');
    const stateEl = el.querySelector('[data-mlf-state]');
    if (phase === 'active') { el.classList.add('is-active'); if (stateEl) stateEl.textContent = '…'; }
    if (phase === 'done') { el.classList.add('is-done'); if (stateEl) stateEl.textContent = '✓'; }
    if (phase === 'error') { el.classList.add('is-error'); if (stateEl) stateEl.textContent = '✗'; }
    if (phase === '') { const se = el.querySelector('[data-mlf-state]'); if (se) se.textContent = ''; }
  }

  function showPill(kind, text) {
    const old = document.querySelector('.query-feedback');
    if (old) old.remove();
    const wrap = document.querySelector('[data-step3-wrapper]') || mountEl;
    const div = document.createElement('div');
    div.className = 'query-feedback ' + (kind === 'correct' ? 'correct' : 'incorrect');
    div.innerHTML = kind === 'correct'
      ? '<span class="qf-msg">✓ Chính xác!</span>'
      : '<span class="qf-msg">✗ ' + esc(text || 'Chưa đúng') + '</span><button class="qf-retry" onclick="this.parentElement.remove()">Đóng</button>';
    wrap.appendChild(div);
  }

  function setWrapperState(ok) {
    const wrap = document.querySelector('[data-step3-wrapper]');
    if (!wrap) return;
    wrap.classList.remove('step3-state-correct', 'step3-state-wrong');
    if (ok === true) wrap.classList.add('step3-state-correct');
    if (ok === false) wrap.classList.add('step3-state-wrong');
  }

  /* ── step machine ── */
  function startRun() {
    if (state.phase === 'running') return;
    /* Đợt 4: nút Run KHÔNG bao giờ disabled (button disabled nuốt click → delegation
       hydrate typed-code của shell không chạy được — bug user báo 2026-07-19).
       Chưa lắp/gõ gì → nhắc việc, không chấm sai. */
    if (!Object.keys(grading.zoneFills || {}).length) {
      showPill('incorrect', 'Chưa có dòng lệnh nào — kéo khối hoặc gõ đủ ' + (zoneIds.length || 4) + ' dòng vào solution.py rồi bấm Chạy.');
      return;
    }
    /* chấm: dòng sai/thiếu → dừng ở node đó, chỉ báo SỐ dòng (không làm hộ) */
    if (!grading.isComplete) {
      const wrong = grading.wrongLines && grading.wrongLines.length ? grading.wrongLines : null;
      let errIdx = -1;
      /* dòng sai (1-based theo drop_zones) → trạm chứa zone đó (Bài 2: 1 trạm ôm 2 zone) */
      if (wrong) {
        const zid = zoneIds[wrong[0] - 1];
        errIdx = zid ? stationIndexForZone(zid) : wrong[0] - 1;
        if (errIdx < 0) errIdx = wrong[0] - 1;
      }
      for (let i = 0; i < stations.length; i++) setNodeState(i, i === errIdx ? 'error' : '');
      showPill('incorrect', wrong ? 'Chưa đúng — xem lại dòng ' + wrong.join(', ') : 'Chưa đúng — kiểm tra thứ tự các dòng lệnh');
      setWrapperState(false);
      return;
    }
    document.querySelectorAll('.query-feedback').forEach(e => e.remove());
    setWrapperState(null);
    state = { phase: 'running', idx: 0, done: false };
    runBtn.disabled = true;
    runBtn.innerHTML = '⏳ Đang chạy…';
    stepInto(0);
  }

  function stepInto(i) {
    stations.forEach((s, j) => setNodeState(j, j < i ? 'done' : ''));
    setNodeState(i, 'active');
    setNodeState(i, 'reveal');
    showScene(i, false);
    const nodeEl = mountEl.querySelector('[data-mlf-node="' + stKey(stations[i]) + '"]');
    if (nodeEl && nodeEl.scrollIntoView) nodeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function advance() {
    const i = state.idx;
    setNodeState(i, 'done');
    if (i >= stations.length - 1) {
      state = { phase: 'done', idx: -1, done: true };
      runBtn.disabled = false;
      runBtn.innerHTML = '↻ Chạy lại';
      showStageDone();
      showPill('correct');
      setWrapperState(true);
      if (window.confetti) {
        window.confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
        window.confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
      }
      return;
    }
    state.idx = i + 1;
    stepInto(state.idx);
  }

  function showStageDone() {
    stageEl.innerHTML =
      '<div class="mlf-stage-head"><span>✅ Pipeline hoàn chỉnh</span></div>' +
      '<div class="mlf-stage-body"><div class="mlf-done-note">' + (cfg.done_note || 'Bạn vừa xem cả hệ thống vận hành. Click lại bất kỳ trạm nào để mổ xẻ phép biến đổi của trạm đó.') + '</div></div>';
    scheduleFit();
  }

  /* ── public API ── */
  window.MLFlowMap = {
    active: false,

    init(opts) {
      const lesson = opts.lesson || {};
      cfg = (lesson.step_3 && lesson.step_3.ml_flow) || null;
      table = (lesson.drag_map && lesson.drag_map.table) || { name: '?', columns: [], dataRows: [] };
      if (!cfg) return false;
      stations = cfg.stations || [];
      zoneIds = (opts.dropZones || (lesson.step_3 && lesson.step_3.drop_zones) || []).map(z => z.id);
      mountEl = document.getElementById('drag-game-mount');
      if (!mountEl) return false;
      mountEl.innerHTML = '';
      state = { phase: 'idle', idx: -1, done: false };
      grading = { zoneFills: {}, zoneCorrect: {}, wrongLines: [], isComplete: false };

      const root = document.createElement('div');
      root.className = 'mlf-root';
      /* mount là flex container (shell) — flex:none để root KHÔNG bị bóp chiều cao
         (squash từng làm content tràn box → đo đạc fit sai hết) */
      root.style.flex = 'none';
      const srcNode =
        '<div class="mlf-node mlf-node-src"><div class="mlf-node-head"><span class="mlf-icon">🗄</span>' +
          '<span class="mlf-node-title"><b class="mono">' + esc(table.name) + '</b><i>' + esc((cfg.source && cfg.source.sub) || '') + '</i></span></div>' +
          '<div class="mlf-node-body">' + tableHTML('', 3) + '</div></div>';
      /* Bài 2 (layout 'branch'): 1 bảng → 3 NHÁNH song song (user chốt 2026-07-19);
         mặc định (Bài 1): pipeline dọc nối link. */
      const flowHtml = cfg.layout === 'branch'
        ? '<div class="mlf-flow mlf-flow-branch">' + srcNode +
            '<div class="mlf-split" aria-hidden="true">' + stations.map(() => '<span></span>').join('') + '</div>' +
            '<div class="mlf-branch-row">' + stations.map((st, i) => nodeHTML(st, i)).join('') + '</div>' +
          '</div>'
        : '<div class="mlf-flow">' + srcNode +
            stations.map((st, i) => '<div class="mlf-link" aria-hidden="true"><span></span></div>' + nodeHTML(st, i)).join('') +
          '</div>';
      root.innerHTML =
        '<div class="mlf-brand"><span class="mlf-brand-dot"></span><b>PE_TEST</b> · ' + esc(cfg.brand || 'DÒNG CHẢY PIPELINE ML') + '</div>' +
        flowHtml +
        '<div class="mlf-dock"><div class="mlf-stage" data-mlf-stage></div></div>';
      mountEl.appendChild(root);

      stageEl = root.querySelector('[data-mlf-stage]');
      showStageIdle();

      runBtn = document.createElement('button');
      /* class run-query-btn: tái dùng delegation hydrate typed-code của shell.
         Đợt 4: KHÔNG disabled — click trên button disabled không phát event nên
         luồng gõ-code (hydrate lúc Run) chết; thiếu input thì startRun tự nhắc. */
      runBtn.className = 'run-query-btn mlf-run';
      runBtn.innerHTML = cfg.run_label || '▶ Chạy Pipeline';
      runBtn.addEventListener('click', startRun);
      root.querySelector('.mlf-dock').appendChild(runBtn);

      /* click node xem lại sau khi hoàn thành */
      root.querySelectorAll('[data-mlf-node]').forEach(el => {
        el.addEventListener('click', () => {
          if (!state.done) return;
          const zone = el.getAttribute('data-mlf-node');
          const idx = stations.findIndex(s => stKey(s) === zone);
          if (idx >= 0) showScene(idx, true);
        });
      });

      /* đợt 4: auto-fit — đo sau layout đầu + đo lại khi font mono load xong đổi metric */
      rootEl = root;
      requestAnimationFrame(fitScale);
      setTimeout(fitScale, 450);
      if (!window.__mlfFitWired) {
        window.__mlfFitWired = true;
        window.addEventListener('resize', scheduleFit);
      }

      this.active = true;
      return true;
    },

    update(payload) {
      grading = payload || grading;
      /* Đợt 4: không toggle disabled theo zoneFills nữa — nút luôn sống,
         startRun tự phân nhánh nhắc/chấm. */
    },

    reset() {
      if (!mountEl) return;
      state = { phase: 'idle', idx: -1, done: false };
      stations.forEach((s, i) => {
        setNodeState(i, '');
        const el = mountEl.querySelector('[data-mlf-node="' + stKey(s) + '"] [data-mlf-body]');
        if (el) el.innerHTML = nodeResultHTML(stations[i], false);
      });
      if (stageEl) showStageIdle();
      if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = (cfg && cfg.run_label) || '▶ Chạy Pipeline'; }
      document.querySelectorAll('.query-feedback').forEach(e => e.remove());
      setWrapperState(null);
    }
  };
})();
