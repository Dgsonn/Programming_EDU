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
    /* Bài 7 — CHỌN cột phân tích: pick (X) + exclude (ban) */
    if (k === 'stat_select') {
      const ss = st.stat_select || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">cột → ?</span></div>';
      return '<div class="mlf-chips">' +
        (ss.pick || []).map(p => '<span class="mlf-chip x">' + esc(p.col) + '</span>').join('') +
        (ss.exclude || []).map(e => '<span class="mlf-chip ban">🚫 ' + esc(e.col) + '</span>').join('') +
        '</div>';
    }
    /* Bài 7 — ma trận cov/corr: node hiện CỘT mục tiêu (final) xếp hạng */
    if (k === 'stat_matrix') {
      const sm = st.stat || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">' + (sm.mode === 'corr' ? 'r' : 'cov') + ' → ?</span></div>';
      const hc = sm.highlight_col, cols = sm.cols || [], grid = sm.grid || [];
      return '<div class="mlf-sc-mini">' + grid.map(function (row, i) {
        if (i === hc) return '';
        var v = row[hc];
        return '<span class="mlf-sc-cell"><i>' + esc(cols[i]) + '</i><b>' + esc(sm.mode === 'corr' ? v.toFixed(2) : v.toFixed(1)) + '</b></span>';
      }).join('') + '</div>';
    }
    /* Bài 8 — ĐƯỜNG ŷ=w·x+b: node hiện phương trình đường (+ badge lệch nếu residual) */
    if (k === 'regline') {
      const rg = st.reg || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">ŷ → ?</span></div>';
      return '<div class="mlf-chips"><span class="mlf-chip x">ŷ = ' + esc(rg.w) + '·x + ' + esc(rg.b) + '</span>' +
        (rg.mode === 'residual' ? '<span class="mlf-chip warn">Σ lệch</span>' : (rg.mode === 'predict' ? '<span class="mlf-chip xnew">12 dự đoán</span>' : '')) + '</div>';
    }
    /* Bài 9 — MSE: node hiện mode (lỗi có dấu / ô lỗi² / so A-B) */
    if (k === 'mse_step') {
      const ms = st.mse || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">MSE → ?</span></div>';
      if (ms.mode === 'compare') {
        const xs = table.dataRows.map(function (r) { return parseFloat(r[0]); });
        const ys = table.dataRows.map(function (r) { return parseFloat(r[1]); });
        return '<div class="mlf-chips">' + (ms.compare || []).map(function (L) {
          let s = 0; for (let i = 0; i < xs.length; i++) { const e = L.w * xs[i] + L.b - ys[i]; s += e * e; }
          return '<span class="mlf-chip x">' + esc(L.label) + ' ' + (s / xs.length).toFixed(1) + '</span>';
        }).join('') + '</div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip ' + (ms.mode === 'squared' ? 'warn' : 'x') + '">' +
        (ms.mode === 'squared' ? '12 ô lỗi²' : '12 lỗi có dấu') + '</span></div>';
    }
    /* Bài 10 — LOSS CURVE: chạy GD từ table → node hiện MSE đầu→cuối */
    if (k === 'gd_curve') {
      const gd = st.gd || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">loss → ?</span></div>';
      const r = gdRun(gd.lr || 0.01, gd.steps || 200);
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">MSE ' + Math.round(r.hist[0]) + ' → ' + Math.round(r.hist[r.hist.length - 1]) + '</span></div>';
    }
    /* Bài 11 — AUDIT LinearRegression trên nhãn 0/1: node theo mode */
    if (k === 'linaudit') {
      const la = st.lin || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">audit → ?</span></div>';
      if (la.mode === 'fit') {
        return '<div class="mlf-chips"><span class="mlf-chip x">ŷ = ' + esc(la.w) + '·x + ' + esc(la.b) + '</span></div>';
      }
      const pr = la.probe || [];
      const lo = pr.map(function (v) { return la.w * v + la.b; });
      const bel = lo.filter(function (v) { return v < 0; }).length;
      const abv = lo.filter(function (v) { return v > 1; }).length;
      if (la.mode === 'probe') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">' + bel + ' &lt; 0</span>' +
          '<span class="mlf-chip warn">' + abv + ' &gt; 1</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip x">' + pr.length + ' nhãn 0/1</span>' +
        '<span class="mlf-chip warn">range vẫn hỏng</span></div>';
    }
    /* Bài 12 — đường ống score → sigmoid → bảng: node theo mode */
    if (k === 'sigmoid_pipe') {
      const sg = st.sig || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">z → p ?</span></div>';
      const pr = sg.probe || [];
      const zs = pr.map(function (v) { return sg.w * v + sg.b; });
      const ps = zs.map(function (z) { return 1 / (1 + Math.exp(-z)); });
      const lo = Math.min.apply(null, zs), hi = Math.max.apply(null, zs);
      if (sg.mode === 'score') {
        return '<div class="mlf-chips"><span class="mlf-chip x">z ' + lo.toFixed(2) + ' → ' + hi.toFixed(2) + '</span>' +
          '<span class="mlf-chip warn">không bị chặn</span></div>';
      }
      const pLo = Math.min.apply(null, ps), pHi = Math.max.apply(null, ps);
      if (sg.mode === 'squash') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">p ' + pLo.toFixed(3) + ' → ' + pHi.toFixed(3) + '</span>' +
          '<span class="mlf-chip clu clu-1">0 điểm ngoài dải</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip x">' + pr.length + ' dòng · x·z·p</span></div>';
    }
    /* Bài 13 — ranh giới 2D: node theo mode score/sign/boundary */
    if (k === 'boundary_2d') {
      const bd = st.bnd || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">z → phía ?</span></div>';
      const zs = table.dataRows.map(function (r) { return bd.w1 * parseFloat(r[0]) + bd.w2 * parseFloat(r[1]) + bd.bias; });
      if (bd.mode === 'score') {
        return '<div class="mlf-chips"><span class="mlf-chip x">z ' + Math.min.apply(null, zs).toFixed(2) + ' → ' + Math.max.apply(null, zs).toFixed(2) + '</span></div>';
      }
      const neg = zs.filter(function (v) { return v < 0; }).length, pos = zs.length - neg;
      if (bd.mode === 'sign') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">' + neg + ' Rớt</span>' +
          '<span class="mlf-chip clu clu-1">' + pos + ' Đậu</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip x">đường z = 0</span>' +
        '<span class="mlf-chip clu clu-1">' + neg + '·' + pos + '</span></div>';
    }
    /* Bài 14 — so độ phức tạp: node theo mode fit/measure/select */
    if (k === 'complexity_fit') {
      const cx = st.cx || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">bậc [1,3,12] ?</span></div>';
      if (cx.mode === 'fit') {
        return '<div class="mlf-chips"><span class="mlf-chip x">fit 3 bậc</span><span class="mlf-chip warn">1 · 3 · 12</span></div>';
      }
      if (cx.mode === 'measure') {
        return '<div class="mlf-chips"><span class="mlf-chip x">train ↓</span><span class="mlf-chip clu clu-1">check chữ U</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">best = bậc 3</span></div>';
    }
    /* Bài 15 — chia 3 phòng: node theo mode test/val/seal */
    if (k === 'split_rooms') {
      const sr = st.sr || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">chia 600/200/200 ?</span></div>';
      if (sr.mode === 'test') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">200 test 🔒</span><span class="mlf-chip x">800 tạm</span></div>';
      }
      if (sr.mode === 'val') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">600 train</span><span class="mlf-chip warn">200 val</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">600/200/200 ✓</span></div>';
    }
    /* C3-Bài 1 — Dimension Stress Test: node theo mode baseline/noise/separate */
    if (k === 'dim_stress') {
      const dm = st.dim || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">chiều → ?</span></div>';
      if (dm.mode === 'baseline') {
        return '<div class="mlf-chips"><span class="mlf-chip x">' + dm.dims + ' chiều</span>' +
          '<span class="mlf-chip clu clu-1">acc ' + Math.round(dm.accuracy * 100) + '%</span></div>';
      }
      if (dm.mode === 'noise') {
        const last = (dm.items || [])[(dm.items || []).length - 1] || {};
        return '<div class="mlf-chips"><span class="mlf-chip warn">' + (dm.items || []).length + ' mức chiều</span>' +
          '<span class="mlf-chip warn">tới ' + (last.contrast || 0).toFixed(2) + '</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">tách hiệu ứng ✓</span></div>';
    }
    /* C3-Bài 2 — PCA transformer: node theo mode units/fit/transform */
    if (k === 'pca_transform') {
      const pc = st.pca || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">PCA → ?</span></div>';
      if (pc.mode === 'units') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">15 feature · thang lệch nhau</span></div>';
      }
      if (pc.mode === 'fit') {
        return '<div class="mlf-chips"><span class="mlf-chip x">PC1 ' + Math.round(pc.evr[0] * 100) + '%</span>' +
          '<span class="mlf-chip x">PC2 ' + Math.round(pc.evr[1] * 100) + '%</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">' + pc.shapes[0].join('×') + ' + ' + pc.shapes[1].join('×') + '</span></div>';
    }
    /* C3-Bài 3 — Explained variance selection: node theo mode spectrum/targets/validate */
    if (k === 'variance_selection') {
      const vs = st.varsel || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">phổ → ?</span></div>';
      if (vs.mode === 'spectrum') {
        return '<div class="mlf-chips"><span class="mlf-chip x">PC1 ' + Math.round(vs.evr[0] * 100) + '%</span>' +
          '<span class="mlf-chip x">PC2 ' + Math.round(vs.evr[1] * 100) + '%</span></div>';
      }
      if (vs.mode === 'targets') {
        return '<div class="mlf-chips">' + (vs.targets || []).map(function (t) {
          return '<span class="mlf-chip warn">' + Math.round(t.target * 100) + '%→n=' + t.n + '</span>';
        }).join('') + '</div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">n=' + vs.chosen_n + ' · acc ' + Math.round(vs.chosen_acc * 100) + '%</span></div>';
    }
    /* C3-Bài 4 — PCA visual audit: node theo mode project/label/compare */
    if (k === 'pca_audit') {
      const pa = st.audit || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">audit → ?</span></div>';
      if (pa.mode === 'project') {
        return '<div class="mlf-chips"><span class="mlf-chip x">PC1/PC2 · ' + pa.n + ' điểm</span></div>';
      }
      if (pa.mode === 'label') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">tách lớp rõ</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip x">raw ' + Math.round(pa.raw_acc * 100) + '%</span>' +
        '<span class="mlf-chip clu clu-1">pca ' + Math.round(pa.pca_acc * 100) + '%</span></div>';
    }
    /* C3-Bài 5 — SVM margin: node theo mode baseline/tune/rbf */
    if (k === 'svm_margin') {
      const sv = st.svm || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">SVC → ?</span></div>';
      if (sv.mode === 'baseline') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">F1 ' + sv.f1.toFixed(2) + '</span><span class="mlf-chip warn">' + sv.n_sv + ' SV</span></div>';
      }
      if (sv.mode === 'tune') {
        return '<div class="mlf-chips">' + (sv.rows || []).map(function (r) {
          return '<span class="mlf-chip warn">C=' + r.c + ': ' + r.f1.toFixed(2) + '</span>';
        }).join('') + '</div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">RBF F1 ' + sv.f1.toFixed(2) + '</span><span class="mlf-chip clu clu-1">' + sv.n_sv + ' SV</span></div>';
    }
    /* C3-Bài 6 — Unsupervised contract: node theo mode contract/fit/audit */
    if (k === 'cluster_contract') {
      const cc = st.cluster || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">contract → ?</span></div>';
      if (cc.mode === 'contract') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">X only ✓</span><span class="mlf-chip clu clu-1">0 rò rỉ</span></div>';
      }
      if (cc.mode === 'fit') {
        return '<div class="mlf-chips"><span class="mlf-chip x">silhouette ' + cc.silhouette.toFixed(2) + '</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">ARI ' + cc.ari.toFixed(2) + '</span><span class="mlf-chip clu clu-1">bất biến ✓</span></div>';
    }
    /* C3-Bài 7 — K-means stability: node theo mode raw/scaled/crescent */
    if (k === 'kmeans_stability') {
      const ks = st.kstab || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">K-means → ?</span></div>';
      if (ks.mode === 'raw') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">inertia ' + Math.round(ks.inertia) + '</span></div>';
      }
      if (ks.mode === 'scaled') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">inertia ' + ks.inertia.toFixed(1) + '</span><span class="mlf-chip clu clu-1">ARI ' + ks.stability_min.toFixed(1) + '</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip warn">ARI ' + ks.ari_shape.toFixed(2) + '</span><span class="mlf-chip warn">từ chối</span></div>';
    }
    /* C3-Bài 8 — Choose k: node theo mode sweep/stability/decide */
    if (k === 'kselect') {
      const kd = st.kselect || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">k → ?</span></div>';
      if (kd.mode === 'sweep') {
        return '<div class="mlf-chips"><span class="mlf-chip x">7 candidate k</span></div>';
      }
      if (kd.mode === 'stability') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">' + (kd.flagged || []).length + ' k không ổn định</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">k=' + kd.chosen_k + ' ✓</span></div>';
    }
    /* C3-Bài 9 — Shape-aware bench: node theo mode lock/tune/compare */
    if (k === 'shape_bench') {
      const sb = st.shape || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">bench → ?</span></div>';
      if (sb.mode === 'lock') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">1 representation ✓</span></div>';
      }
      if (sb.mode === 'tune') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">eps=' + sb.best_eps + ' ✓</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">DBSCAN ARI ' + sb.dbscan_ari.toFixed(2) + '</span><span class="mlf-chip warn">KMeans ' + sb.kmeans_ari.toFixed(2) + '</span></div>';
    }
    /* C3-Bài 10 — Perceptron trace: node theo mode manual/converge/xor */
    if (k === 'perceptron_trace') {
      const pt = st.pct || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">perceptron → ?</span></div>';
      if (pt.mode === 'manual') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">error ' + pt.error + '</span></div>';
      }
      if (pt.mode === 'converge') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">' + pt.epochs + ' epoch → 0 lỗi</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip warn">50 epoch, không hội tụ</span></div>';
    }
    /* C3-Bài 11 — Gradient flow console: node theo mode d1/d5/d10 */
    if (k === 'gradient_flow_console') {
      const gf = st.gf || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">gradient → ?</span></div>';
      if (gf.mode === 'd1') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">cả 2 còn khoẻ</span></div>';
      }
      if (gf.mode === 'd5') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">sigmoid tụt ' + Math.round(gf.ratio) + '×</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip warn">sigmoid ≈0, ReLU ' + Math.round(gf.ratio) + '× lớn hơn</span></div>';
    }
    /* C3-Bài 12 — Network shape builder: node theo mode shapes/activation/run */
    if (k === 'network_shape_builder') {
      const nsb = st.nsb || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">network → ?</span></div>';
      if (nsb.mode === 'shapes') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">4 tham số khớp shape</span></div>';
      }
      if (nsb.mode === 'activation') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">ReLU+Sigmoid ✓</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip warn">' + Math.round(nsb.dead_frac * 100) + '% A1 = 0</span></div>';
    }
    /* C3-Bài 13 — Gradient graph builder: node theo mode output/hidden/check */
    if (k === 'gradient_graph_builder') {
      const gg = st.gg || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">gradient → ?</span></div>';
      if (gg.mode === 'output') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">dZ2 ' + gg.dz2_shape + '</span></div>';
      }
      if (gg.mode === 'hidden') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">dW1 ' + gg.dw1_shape + '</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">rel error ≈' + gg.max_rel.toExponential(1) + '</span></div>';
    }
    /* C3-Bài 14 — Neural experiment designer: node theo mode params/curves/lock */
    if (k === 'neural_experiment_designer') {
      const ned = st.ned || {};
      if (!revealed) return '<div class="mlf-chips"><span class="mlf-chip ghost">experiment → ?</span></div>';
      if (ned.mode === 'params') {
        return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">3 kiến trúc</span></div>';
      }
      if (ned.mode === 'curves') {
        return '<div class="mlf-chips"><span class="mlf-chip warn">A/C có vấn đề</span></div>';
      }
      return '<div class="mlf-chips"><span class="mlf-chip clu clu-1">F1=' + ned.metrics.f1.toFixed(2) + '</span></div>';
    }
    return '';
  }

  /* GD chạy từ table.dataRows (khớp compute_gradients Python: 2·mean(err·x), 2·mean(err)) — Bài 10 */
  function gdRun(lr, steps) {
    const xs = table.dataRows.map(function (r) { return parseFloat(r[0]); });
    const ys = table.dataRows.map(function (r) { return parseFloat(r[1]); });
    const nn = xs.length; let w = 0, b = 0; const hist = [];
    for (let s = 0; s < steps; s++) {
      let sw = 0, sb = 0;
      for (let i = 0; i < nn; i++) { const e = w * xs[i] + b - ys[i]; sw += e * xs[i]; sb += e; }
      w -= lr * 2 * sw / nn; b -= lr * 2 * sb / nn;
      let m = 0; for (let i = 0; i < nn; i++) { const e = w * xs[i] + b - ys[i]; m += e * e; } m /= nn;
      hist.push(m);
    }
    return { hist: hist, w: w, b: b };
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
    /* Bài 7 — CHỌN cột phân tích: 5 cột PHÂN TÍCH vs student_id ĐỨNG NGOÀI */
    if (k === 'stat_select') {
      const ss = st.stat_select || {};
      return '<div class="mlf-scene mlf-scale-select">' +
        '<div class="mlf-sc-col mlf-sc-in"><div class="mlf-sc-colhead">📊 PHÂN TÍCH — 5 cột số</div>' +
          (ss.pick || []).map(p => '<div class="mlf-sc-row ok"><span class="mlf-chip x">' + esc(p.col) + '</span></div>').join('') +
        '</div>' +
        '<div class="mlf-sc-col mlf-sc-out"><div class="mlf-sc-colhead">🚫 ĐỨNG NGOÀI</div>' +
          (ss.exclude || []).map(e => '<div class="mlf-sc-row ban"><span class="mlf-chip ban">' + esc(e.icon || '🚫') + ' ' + esc(e.col) + '</span>' +
            '<span class="mlf-sc-why">' + esc(e.why || '') + '</span></div>').join('') +
        '</div></div>';
    }
    /* Bài 7 — ma trận cov/corr 5×5 heatmap; corr tô màu theo r [−1,1], cột final tô vàng */
    if (k === 'stat_matrix') {
      const sm = st.stat || {};
      const cols = sm.cols || [], grid = sm.grid || [], hc = sm.highlight_col;
      const isCorr = sm.mode === 'corr';
      const cell = function (v, ri, ci) {
        let cls = 'mlf-mat-cell';
        if (ci === hc || ri === hc) cls += ' mlf-mat-hl';
        if (ri === ci) cls += ' mlf-mat-diag';
        let style = '';
        if (isCorr) {
          const a = Math.min(1, Math.abs(v));
          const rgb = v >= 0 ? '56,189,248' : '248,113,113';
          style = 'background:rgba(' + rgb + ',' + (a * 0.5).toFixed(2) + ')';
        }
        return '<td class="' + cls + '" style="' + style + '">' + esc(isCorr ? v.toFixed(2) : v.toFixed(1)) + '</td>';
      };
      return '<div class="mlf-scene mlf-mat-scene">' +
        '<div class="mlf-mat-wrap"><table class="mlf-mat"><thead><tr><th></th>' +
          cols.map((c, i) => '<th class="' + (i === hc ? 'mlf-mat-hl' : '') + '">' + esc(c) + '</th>').join('') + '</tr></thead>' +
        '<tbody>' + grid.map((row, ri) => '<tr><th class="' + (ri === hc ? 'mlf-mat-hl' : '') + '">' + esc(cols[ri]) + '</th>' +
          row.map((v, ci) => cell(v, ri, ci)).join('') + '</tr>').join('') + '</tbody></table></div>' +
        (sm.note ? '<div class="mlf-qc-note">' + sm.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 8 — ĐƯỜNG DỰ ĐOÁN: scatter (từ table) + đường ŷ=w·x+b; mode params/predict/residual */
    if (k === 'regline') {
      const rg = st.reg || {};
      const w = rg.w || 0, b = rg.b || 0, mode = rg.mode || 'params';
      const xs = table.dataRows.map(function (r) { return parseFloat(r[0]); });
      const ys = table.dataRows.map(function (r) { return parseFloat(r[1]); });
      const nn = xs.length;
      const xmax = Math.ceil(Math.max.apply(null, xs)) + 1;
      const ymax = Math.ceil(Math.max.apply(null, ys) / 10) * 10 + 10;
      const W = 480, H = 250, padL = 34, padR = 12, padT = 22, padB = 26;
      const px = function (v) { return (padL + (v / xmax) * (W - padL - padR)); };
      const py = function (v) { return ((H - padB) - (Math.max(0, Math.min(ymax, v)) / ymax) * (H - padT - padB)); };
      let grid = '';
      [0, ymax / 2, ymax].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + py(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + py(g).toFixed(1) + '" stroke="rgba(148,163,184,0.14)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (py(g) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#64748B">' + Math.round(g) + '</text>';
      });
      let res = '', preds = '', sse = 0;
      for (let i = 0; i < nn; i++) {
        const yh = w * xs[i] + b;
        sse += (yh - ys[i]) * (yh - ys[i]);
        if (mode === 'residual') res += '<line x1="' + px(xs[i]).toFixed(1) + '" y1="' + py(ys[i]).toFixed(1) + '" x2="' + px(xs[i]).toFixed(1) + '" y2="' + py(yh).toFixed(1) + '" stroke="#FB923C" stroke-width="1.5" opacity="0.7"/>';
        if (mode === 'predict') preds += '<circle cx="' + px(xs[i]).toFixed(1) + '" cy="' + py(yh).toFixed(1) + '" r="3" fill="#38BDF8" opacity="0.9"/>';
      }
      // clip đường vào khung
      const cands = [];
      [0, xmax].forEach(function (xe) { const ye = w * xe + b; if (ye >= -0.01 && ye <= ymax + 0.01) cands.push([xe, ye]); });
      if (Math.abs(w) > 1e-9) [0, ymax].forEach(function (ye) { const xe = (ye - b) / w; if (xe >= -0.01 && xe <= xmax + 0.01) cands.push([xe, ye]); });
      let line = '';
      if (cands.length >= 2) { cands.sort(function (p, q) { return p[0] - q[0]; }); const a = cands[0], z = cands[cands.length - 1]; line = '<line x1="' + px(a[0]).toFixed(1) + '" y1="' + py(a[1]).toFixed(1) + '" x2="' + px(z[0]).toFixed(1) + '" y2="' + py(z[1]).toFixed(1) + '" stroke="#38BDF8" stroke-width="2.8" stroke-linecap="round"/>'; }
      let pts = '';
      for (let i = 0; i < nn; i++) pts += '<circle cx="' + px(xs[i]).toFixed(1) + '" cy="' + py(ys[i]).toFixed(1) + '" r="3.4" fill="#E2E8F0" stroke="#0B1220" stroke-width="1"/>';
      const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="đường dự đoán">' +
        grid + res + line + preds + pts +
        '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="#94A3B8">study_hours →</text>' +
        '<text x="10" y="11" font-size="10" fill="#94A3B8">final_score</text></svg>';
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head"><span class="mlf-reg-eq">ŷ = ' + esc(w) + '·x + ' + esc(b) + '</span>' +
          (mode === 'residual' ? '<span class="mlf-reg-err">TỔNG LỖI ≈ <b>' + Math.round(sse).toLocaleString('vi-VN') + '</b></span>' : '') + '</div>' +
        svg +
        (rg.note ? '<div class="mlf-qc-note">' + rg.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 9 — MSE: residual (đoạn) / squared (ô vuông lỗi²) / compare (2 thanh MSE A vs B) */
    if (k === 'mse_step') {
      const ms = st.mse || {};
      const xs = table.dataRows.map(function (r) { return parseFloat(r[0]); });
      const ys = table.dataRows.map(function (r) { return parseFloat(r[1]); });
      const nn = xs.length;
      function mseLine(w, b) { let s = 0; for (let i = 0; i < nn; i++) { const e = w * xs[i] + b - ys[i]; s += e * e; } return s / nn; }
      if (ms.mode === 'compare') {
        const cmp = (ms.compare || []).map(function (L) { return { label: L.label, w: L.w, b: L.b, mse: mseLine(L.w, L.b) }; });
        const mx = Math.max.apply(null, cmp.map(function (c) { return c.mse; })) || 1;
        const best = cmp.slice().sort(function (a, b) { return a.mse - b.mse; })[0];
        return '<div class="mlf-scene mlf-mse-compare">' +
          cmp.map(function (c) {
            return '<div class="mlf-mse-row' + (c === best ? ' is-best' : '') + '"><span class="mlf-mse-lab">Đường ' + esc(c.label) + ' <i>ŷ=' + esc(c.w) + '·x+' + esc(c.b) + '</i></span>' +
              '<span class="mlf-mse-bar"><span class="mlf-mse-fill" style="width:' + Math.max(4, Math.round(c.mse / mx * 100)) + '%"></span></span>' +
              '<span class="mlf-mse-val">MSE ' + c.mse.toFixed(1) + (c === best ? ' ✓' : '') + '</span></div>';
          }).join('') +
          (ms.note ? '<div class="mlf-qc-note">' + ms.note + '</div>' : '') +
        '</div>';
      }
      // residual / squared — scatter + line
      const w = ms.w || 0, b = ms.b || 0;
      const xmax = Math.ceil(Math.max.apply(null, xs)) + 1;
      const ymax = Math.ceil(Math.max.apply(null, ys) / 10) * 10 + 20;
      const W = 480, H = 250, padL = 34, padR = 12, padT = 22, padB = 26;
      const px = function (v) { return (padL + (v / xmax) * (W - padL - padR)); };
      const py = function (v) { return ((H - padB) - (Math.max(0, Math.min(ymax, v)) / ymax) * (H - padT - padB)); };
      let grid = '';
      [0, ymax / 2, ymax].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + py(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + py(g).toFixed(1) + '" stroke="rgba(148,163,184,0.14)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (py(g) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#64748B">' + Math.round(g) + '</text>';
      });
      let extra = '', seg = '';
      for (let i = 0; i < nn; i++) {
        const yh = w * xs[i] + b, ypt = py(ys[i]), yhp = py(yh);
        seg += '<line x1="' + px(xs[i]).toFixed(1) + '" y1="' + ypt.toFixed(1) + '" x2="' + px(xs[i]).toFixed(1) + '" y2="' + yhp.toFixed(1) + '" stroke="#FB923C" stroke-width="1.6"/>';
        if (ms.mode === 'squared') {
          const side = Math.abs(ypt - yhp), top = Math.min(ypt, yhp);
          extra += '<rect x="' + px(xs[i]).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + side.toFixed(1) + '" height="' + side.toFixed(1) + '" fill="#FB923C" fill-opacity="0.18" stroke="#FB923C" stroke-opacity="0.5"/>';
        }
      }
      const cands = [];
      [0, xmax].forEach(function (xe) { const ye = w * xe + b; if (ye >= -0.01 && ye <= ymax + 0.01) cands.push([xe, ye]); });
      if (Math.abs(w) > 1e-9) [0, ymax].forEach(function (ye) { const xe = (ye - b) / w; if (xe >= -0.01 && xe <= xmax + 0.01) cands.push([xe, ye]); });
      let line = '';
      if (cands.length >= 2) { cands.sort(function (p, q) { return p[0] - q[0]; }); const a = cands[0], z = cands[cands.length - 1]; line = '<line x1="' + px(a[0]).toFixed(1) + '" y1="' + py(a[1]).toFixed(1) + '" x2="' + px(z[0]).toFixed(1) + '" y2="' + py(z[1]).toFixed(1) + '" stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round"/>'; }
      let pts = '';
      for (let i = 0; i < nn; i++) pts += '<circle cx="' + px(xs[i]).toFixed(1) + '" cy="' + py(ys[i]).toFixed(1) + '" r="3.2" fill="#E2E8F0" stroke="#0B1220" stroke-width="1"/>';
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head"><span class="mlf-reg-eq">ŷ = ' + esc(w) + '·x + ' + esc(b) + '</span>' +
          '<span class="mlf-reg-err">MSE ≈ <b>' + mseLine(w, b).toFixed(1) + '</b></span></div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="MSE ' + esc(ms.mode) + '">' +
          grid + extra + seg + line + pts +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="#94A3B8">study_hours →</text>' +
          '<text x="10" y="11" font-size="10" fill="#94A3B8">final_score</text></svg>' +
        (ms.note ? '<div class="mlf-qc-note">' + ms.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 10 — LOSS CURVE: chạy GD live từ table → vẽ MSE theo bước, tụt tới đáy */
    if (k === 'gd_curve') {
      const gd = st.gd || {};
      const steps = gd.steps || 200, lr = gd.lr || 0.01;
      const r = gdRun(lr, steps);
      const hist = r.hist;
      const W = 480, H = 250, padL = 46, padR = 14, padT = 24, padB = 26;
      const yMax = Math.max.apply(null, hist);
      const px = function (i) { return (padL + (i / Math.max(1, steps - 1)) * (W - padL - padR)); };
      const py = function (v) { return ((H - padB) - (Math.max(0, Math.min(yMax, v)) / yMax) * (H - padT - padB)); };
      let grid = '';
      [0, yMax / 2, yMax].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + py(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + py(g).toFixed(1) + '" stroke="rgba(148,163,184,0.13)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (py(g) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#64748B">' + (g >= 1000 ? (g / 1000).toFixed(1) + 'k' : Math.round(g)) + '</text>';
      });
      let poly = '';
      hist.forEach(function (v, i) { poly += px(i).toFixed(1) + ',' + py(v).toFixed(1) + ' '; });
      return '<div class="mlf-scene mlf-gdc-scene">' +
        '<div class="mlf-reg-head"><span class="mlf-reg-eq">' + steps + ' bước · α = ' + esc(lr) + '</span>' +
          '<span class="mlf-reg-err">MSE <b>' + Math.round(hist[0]) + ' → ' + Math.round(hist[hist.length - 1]) + '</b> · đường cuối ŷ=' + r.w.toFixed(1) + '·x+' + Math.round(r.b) + '</span></div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="loss curve MSE theo bước">' +
          grid + '<polyline points="' + poly.trim() + '" fill="none" stroke="#34D399" stroke-width="2.4"/>' +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="#94A3B8">bước →</text>' +
          '<text x="10" y="11" font-size="10" fill="#94A3B8">MSE</text></svg>' +
        (gd.note ? '<div class="mlf-qc-note">' + gd.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 11 — AUDIT: scatter nhãn 0/1 + đường thẳng thò khỏi dải [0,1] */
    if (k === 'linaudit') {
      const la = st.lin || {};
      const w = la.w, b = la.b, mode = la.mode || 'fit';
      const pr = la.probe || [];
      const thr = la.threshold != null ? la.threshold : 0.5;
      const xMin = -3, xMax = 15, yMin = -0.75, yMax = 1.95;
      const W = 500, H = 260, padL = 40, padR = 14, padT = 22, padB = 26;
      const PX = function (v) { return (padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR)); };
      const PY = function (v) { return ((H - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)); };
      const yh = function (v) { return w * v + b; };
      let zones =
        '<rect x="' + padL + '" y="' + PY(yMax).toFixed(1) + '" width="' + (W - padL - padR) + '" height="' + (PY(1) - PY(yMax)).toFixed(1) + '" fill="rgba(248,113,113,0.09)"/>' +
        '<rect x="' + padL + '" y="' + PY(0).toFixed(1) + '" width="' + (W - padL - padR) + '" height="' + (PY(yMin) - PY(0)).toFixed(1) + '" fill="rgba(248,113,113,0.09)"/>' +
        '<rect x="' + padL + '" y="' + PY(1).toFixed(1) + '" width="' + (W - padL - padR) + '" height="' + (PY(0) - PY(1)).toFixed(1) + '" fill="rgba(52,211,153,0.08)"/>';
      let grid = '';
      [0, 1].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + PY(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + PY(g).toFixed(1) + '" stroke="rgba(52,211,153,0.45)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (PY(g) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#64748B">' + g + '</text>';
      });
      if (mode === 'threshold') {
        grid += '<line x1="' + padL + '" y1="' + PY(thr).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + PY(thr).toFixed(1) + '" stroke="rgba(251,191,36,0.6)" stroke-dasharray="4 3"/>' +
          '<text x="' + (W - padR - 2) + '" y="' + (PY(thr) - 4).toFixed(1) + '" text-anchor="end" font-size="8.5" fill="#FCD34D">ngưỡng ' + thr + '</text>';
      }
      let pts = '';
      table.dataRows.forEach(function (r) {
        const xv = parseFloat(r[0]), yv = parseFloat(r[1]);
        pts += '<circle cx="' + PX(xv).toFixed(1) + '" cy="' + PY(yv).toFixed(1) + '" r="2.8" fill="' + (yv ? '#7DD3FC' : '#94A3B8') + '" opacity="0.6"/>';
      });
      const line = '<line x1="' + PX(xMin).toFixed(1) + '" y1="' + PY(yh(xMin)).toFixed(1) + '" x2="' + PX(xMax).toFixed(1) + '" y2="' + PY(yh(xMax)).toFixed(1) + '" stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round"/>';
      let pm = '';
      if (mode !== 'fit') {
        pr.forEach(function (v) {
          const yv = yh(v), bad = (yv < 0 || yv > 1);
          const fill = (mode === 'threshold' && !bad) ? (yv >= thr ? '#34D399' : '#94A3B8') : (bad ? '#F87171' : '#34D399');
          pm += '<circle cx="' + PX(v).toFixed(1) + '" cy="' + PY(yv).toFixed(1) + '" r="' + (bad ? 4.2 : 3.2) + '" fill="' + fill + '" stroke="#0B1220" stroke-width="1"/>';
        });
      }
      const lo = pr.map(yh);
      const bel = lo.filter(function (v) { return v < 0; }).length;
      const abv = lo.filter(function (v) { return v > 1; }).length;
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head"><span class="mlf-reg-eq">ŷ = ' + esc(w) + '·x + ' + esc(b) + '</span>' +
          (mode !== 'fit' ? '<span class="mlf-reg-err"><b>' + bel + '</b> điểm &lt; 0 · <b>' + abv + '</b> điểm &gt; 1</span>' : '<span class="mlf-reg-err">60 nhãn 0/1 · fit không lỗi</span>') + '</div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="audit đường thẳng trên nhãn nhị phân">' +
          zones + grid + pts + line + pm +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="#94A3B8">study_hours →</text>' +
          '<text x="10" y="11" font-size="10" fill="#94A3B8">output</text></svg>' +
        (la.note ? '<div class="mlf-qc-note">' + la.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 12 — SCORE z (không chặn) → SIGMOID (0,1) → BẢNG x·z·p */
    if (k === 'sigmoid_pipe') {
      const sg = st.sig || {};
      const w = sg.w, b = sg.b, mode = sg.mode || 'score';
      const pr = sg.probe || [];
      const zOf = function (v) { return w * v + b; };
      const sig = function (z) { return 1 / (1 + Math.exp(-z)); };
      const zs = pr.map(zOf), ps = zs.map(sig);

      /* TRẠM 3 — lưới 12 ô x·z·p (không dùng bảng dài để cảnh không phải cuộn) */
      if (mode === 'table') {
        const cells = pr.map(function (v, i) {
          const t = ps[i];                       // 0..1 → độ đậm màu
          return '<div class="mlf-sgt-cell" style="--t:' + t.toFixed(3) + '">' +
            '<span class="mlf-sgt-x">x ' + v + '</span>' +
            '<span class="mlf-sgt-z">z ' + zs[i].toFixed(2) + '</span>' +
            '<span class="mlf-sgt-p">p ' + ps[i].toFixed(3) + '</span></div>';
        }).join('');
        return '<div class="mlf-scene mlf-sgt-scene">' +
          '<div class="mlf-reg-head"><span class="mlf-reg-eq">x → z → p</span>' +
            '<span class="mlf-reg-err">z ' + zs[0].toFixed(2) + ' … ' + zs[zs.length - 1].toFixed(2) +
            ' · p ' + ps[0].toFixed(3) + ' … ' + ps[ps.length - 1].toFixed(3) + '</span></div>' +
          '<div class="mlf-sgt-grid">' + cells + '</div>' +
          (sg.note ? '<div class="mlf-qc-note">' + sg.note + '</div>' : '') +
        '</div>';
      }

      const isScore = (mode === 'score');
      const yMin = isScore ? Math.min(-5, Math.min.apply(null, zs) - 0.6) : -0.35;
      const yMax = isScore ? Math.max(6, Math.max.apply(null, zs) + 0.6) : 1.35;
      const xMin = -3, xMax = 15;
      const W = 500, H = 190, padL = 40, padR = 14, padT = 22, padB = 26;
      const PX = function (v) { return (padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR)); };
      const PY = function (v) { return ((H - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)); };

      // dải hợp lệ (0,1) + vùng ngoài
      let zones =
        '<rect x="' + padL + '" y="' + PY(yMax).toFixed(1) + '" width="' + (W - padL - padR) +
          '" height="' + Math.max(0, PY(1) - PY(yMax)).toFixed(1) + '" fill="rgba(248,113,113,0.09)"/>' +
        '<rect x="' + padL + '" y="' + PY(0).toFixed(1) + '" width="' + (W - padL - padR) +
          '" height="' + Math.max(0, PY(yMin) - PY(0)).toFixed(1) + '" fill="rgba(248,113,113,0.09)"/>' +
        '<rect x="' + padL + '" y="' + PY(1).toFixed(1) + '" width="' + (W - padL - padR) +
          '" height="' + Math.max(0, PY(0) - PY(1)).toFixed(1) + '" fill="rgba(52,211,153,0.08)"/>';
      let grid = '';
      [0, 1].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + PY(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + PY(g).toFixed(1) + '" stroke="rgba(52,211,153,0.45)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (PY(g) + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="#64748B">' + g + '</text>';
      });
      let curve = '', pm = '';
      if (isScore) {
        // đường thẳng score: vẽ hết khung, marker đỏ vì nằm ngoài (0,1)
        curve = '<line x1="' + PX(xMin).toFixed(1) + '" y1="' + PY(zOf(xMin)).toFixed(1) + '" x2="' + PX(xMax).toFixed(1) +
          '" y2="' + PY(zOf(xMax)).toFixed(1) + '" stroke="#FBBF24" stroke-width="2.6" stroke-linecap="round"/>';
        pr.forEach(function (v, i) {
          const out = (zs[i] < 0 || zs[i] > 1);
          pm += '<circle cx="' + PX(v).toFixed(1) + '" cy="' + PY(zs[i]).toFixed(1) + '" r="3.2" fill="' + (out ? '#FBBF24' : '#34D399') + '" stroke="#0B1220" stroke-width="1"/>';
        });
        grid += '<text x="' + (padL + 4) + '" y="' + (PY(1) - 4).toFixed(1) + '" font-size="8.5" fill="#6EE7B7">dải (0,1)</text>';
      } else {
        const pts = [];
        for (let i = 0; i <= 140; i++) {
          const xv = xMin + (xMax - xMin) * (i / 140);
          pts.push(PX(xv).toFixed(1) + ',' + PY(sig(zOf(xv))).toFixed(1));
        }
        curve = '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#38BDF8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>';
        const xc = -b / w;
        grid += '<line x1="' + padL + '" y1="' + PY(0.5).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + PY(0.5).toFixed(1) + '" stroke="rgba(56,189,248,0.45)" stroke-dasharray="4 3"/>' +
          '<circle cx="' + PX(xc).toFixed(1) + '" cy="' + PY(0.5).toFixed(1) + '" r="3.4" fill="#38BDF8"/>' +
          '<text x="' + (PX(xc) - 9).toFixed(1) + '" y="' + (PY(0.5) - 6).toFixed(1) + '" text-anchor="end" font-size="8.5" fill="#7DD3FC">z = 0 → p = 0.5</text>';
        pr.forEach(function (v, i) {
          pm += '<circle cx="' + PX(v).toFixed(1) + '" cy="' + PY(ps[i]).toFixed(1) + '" r="3.2" fill="#34D399" stroke="#0B1220" stroke-width="1"/>';
        });
      }
      const head = isScore
        ? '<span class="mlf-reg-eq">z = ' + esc(w) + '·x + ' + esc(b) + '</span><span class="mlf-reg-err">z <b>' +
            zs[0].toFixed(2) + '</b> … <b>' + zs[zs.length - 1].toFixed(2) + '</b> · ngoài (0,1) — score, chưa phải p</span>'
        : '<span class="mlf-reg-eq">p = 1/(1+e^(−z))</span><span class="mlf-reg-err">p <b>' +
            Math.min.apply(null, ps).toFixed(3) + '</b> … <b>' + Math.max.apply(null, ps).toFixed(3) + '</b> · <b>0</b> điểm ngoài dải</span>';
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head">' + head + '</div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="' + (isScore ? 'score tuyến tính không bị chặn' : 'đường cong sigmoid trong dải xác suất') + '">' +
          zones + grid + curve + pm +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="#94A3B8">study_hours →</text>' +
          '<text x="10" y="11" font-size="10" fill="#94A3B8">' + (isScore ? 'z (score)' : 'p (xác suất)') + '</text></svg>' +
        (sg.note ? '<div class="mlf-qc-note">' + sg.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 13 — canvas 2D: SCORE (tô theo z) → DẤU (2 màu + phía) → RANH GIỚI (đường z=0 + tô nửa mặt phẳng) */
    if (k === 'boundary_2d') {
      const bd = st.bnd || {};
      const w1 = bd.w1, w2 = bd.w2, bias = bd.bias, mode = bd.mode || 'score';
      const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
      const W = 460, H = 210, padL = 30, padR = 14, padT = 22, padB = 24;
      const PX = function (v) { return (padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR)); };
      const PY = function (v) { return ((H - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)); };
      const zOf = function (a, b) { return w1 * a + w2 * b + bias; };
      const rows = table.dataRows.map(function (r) { return [parseFloat(r[0]), parseFloat(r[1])]; });
      const zs = rows.map(function (p) { return zOf(p[0], p[1]); });
      const zLo = Math.min.apply(null, zs), zHi = Math.max.apply(null, zs);
      const neg = zs.filter(function (v) { return v < 0; }).length, pos = zs.length - neg;

      // tô nửa mặt phẳng z>=0 (clip 1 cạnh) — chỉ ở mode boundary
      function halfPlane() {
        const rect = [[xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]];
        const out = [];
        for (let i = 0; i < rect.length; i++) {
          const cur = rect[i], prev = rect[(i + 3) % 4];
          const zc = zOf(cur[0], cur[1]), zp = zOf(prev[0], prev[1]);
          if (zc >= 0) {
            if (zp < 0) { const t = zp / (zp - zc); out.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]); }
            out.push(cur);
          } else if (zp >= 0) { const t = zp / (zp - zc); out.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]); }
        }
        return out;
      }
      function lineSeg() {
        const edges = [[[xMin, yMin], [xMax, yMin]], [[xMax, yMin], [xMax, yMax]], [[xMax, yMax], [xMin, yMax]], [[xMin, yMax], [xMin, yMin]]];
        const hits = [];
        edges.forEach(function (e) {
          const za = zOf(e[0][0], e[0][1]), zb = zOf(e[1][0], e[1][1]);
          if ((za >= 0) !== (zb >= 0)) { const t = za / (za - zb); hits.push([e[0][0] + t * (e[1][0] - e[0][0]), e[0][1] + t * (e[1][1] - e[0][1])]); }
        });
        return hits.length >= 2 ? [hits[0], hits[1]] : null;
      }

      let fill = '', line = '', lbl = '';
      if (mode === 'boundary') {
        const hp = halfPlane();
        if (hp.length >= 3) fill = '<polygon points="' + hp.map(function (p) { return PX(p[0]).toFixed(1) + ',' + PY(p[1]).toFixed(1); }).join(' ') + '" fill="rgba(52,211,153,0.12)"/>';
        const seg = lineSeg();
        if (seg) {
          line = '<line x1="' + PX(seg[0][0]).toFixed(1) + '" y1="' + PY(seg[0][1]).toFixed(1) + '" x2="' + PX(seg[1][0]).toFixed(1) + '" y2="' + PY(seg[1][1]).toFixed(1) + '" stroke="#38BDF8" stroke-width="2.6" stroke-linecap="round"/>';
          // nhãn Đậu ĐẶT ở góc thực sự có z>0 (chọn giữa trên-phải và dưới-phải theo dấu)
          const yD = zOf(xMax, yMax) >= 0 ? (padT + 10) : (H - padB - 6);
          lbl = '<text x="' + (W - padR - 2) + '" y="' + yD + '" text-anchor="end" font-size="8" fill="#6EE7B7">Đậu</text>';
        }
      }
      let pts = '';
      rows.forEach(function (p, i) {
        let col;
        if (mode === 'score') {
          const t = Math.max(0, Math.min(1, (zs[i] - zLo) / (zHi - zLo || 1)));  // nhạt→đậm theo z
          col = 'rgba(' + Math.round(248 - t * 196) + ',' + Math.round(113 + t * 98) + ',' + Math.round(113 + t * 40) + ',0.9)';
        } else {
          col = zs[i] >= 0 ? '#34D399' : '#F87171';
        }
        pts += '<circle cx="' + PX(p[0]).toFixed(1) + '" cy="' + PY(p[1]).toFixed(1) + '" r="3.4" fill="' + col + '" stroke="#0B1220" stroke-width="1"/>';
      });
      const head = mode === 'score'
        ? '<span class="mlf-reg-eq">z = X @ w + b</span><span class="mlf-reg-err">z <b>' + zLo.toFixed(2) + '</b> … <b>' + zHi.toFixed(2) + '</b> · chưa cắt nhãn</span>'
        : mode === 'sign'
          ? '<span class="mlf-reg-eq">sides = (z ≥ 0)</span><span class="mlf-reg-err"><b>' + neg + '</b> Rớt · <b>' + pos + '</b> Đậu · ngưỡng z = 0</span>'
          : '<span class="mlf-reg-eq">đường z = 0</span><span class="mlf-reg-err">tách <b>' + neg + '</b> Rớt khỏi <b>' + pos + '</b> Đậu</span>';
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head">' + head + '</div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="ranh giới quyết định 2 feature">' +
          fill + line + lbl + pts +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="9.5" fill="#94A3B8">study_hours →</text>' +
          '<text x="10" y="11" font-size="9.5" fill="#94A3B8">↑ quiz_score</text></svg>' +
        (bd.note ? '<div class="mlf-qc-note">' + bd.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 14 — so độ phức tạp: FIT (3 đường) → MEASURE (bảng train/check) → SELECT (chọn bậc 3) */
    if (k === 'complexity_fit') {
      const cx = st.cx || {};
      const mode = cx.mode || 'fit';
      const models = cfg.models || [];
      const yMin = cfg.y_min != null ? cfg.y_min : 15, yMax = cfg.y_max != null ? cfg.y_max : 65;
      const xMin = 0, xMax = 10;
      const W = 460, H = 200, padL = 34, padR = 12, padT = 20, padB = 24;
      const PX = function (v) { return (padL + ((v - xMin) / (xMax - xMin)) * (W - padL - padR)); };
      const PY = function (v) { return ((H - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)); };
      const clampY = function (v) { return Math.max(yMin - 2, Math.min(yMax + 2, v)); };
      const polyval = function (c, x) { return c.reduce(function (a, k) { return a * x + k; }, 0); };
      const colOf = function (s) { return s === 'over' ? '#F87171' : s === 'good' ? '#34D399' : '#FBBF24'; };

      /* MEASURE — bảng train/check thay vì đồ thị (số là chính) */
      if (mode === 'measure') {
        const bestCk = Math.min.apply(null, models.map(function (m) { return m.check_mse; }));
        const rows = models.map(function (m) {
          const bad = m.check_mse > 30;
          const best = m.check_mse === bestCk;
          const ck = m.check_mse >= 1000 ? Math.round(m.check_mse).toLocaleString('en-US') : m.check_mse.toFixed(2);
          const mark = bad ? ' 🔴' : (best ? ' ✓ đáy U' : '');   // ✓ CHỈ cho check nhỏ nhất
          return '<div class="mlf-cxm-row"><span class="mlf-cxm-d" style="color:' + colOf(m.state) + '">bậc ' + m.d + '</span>' +
            '<span class="mlf-cxm-tr">train ' + m.train_mse.toFixed(2) + '</span>' +
            '<span class="mlf-cxm-ck" style="color:' + (bad ? '#F87171' : best ? '#6EE7B7' : '#94A3B8') + '">check ' + ck + mark + '</span></div>';
        }).join('');
        return '<div class="mlf-scene mlf-cxm-scene">' +
          '<div class="mlf-reg-head"><span class="mlf-reg-eq">train ↓ · check hình chữ U</span></div>' +
          '<div class="mlf-cxm-tbl">' + rows + '</div>' +
          (cx.note ? '<div class="mlf-qc-note">' + cx.note + '</div>' : '') +
        '</div>';
      }

      // FIT + SELECT — vẽ scatter (subset) + đường
      let grid = '';
      [20, 40, 60].forEach(function (g) {
        grid += '<line x1="' + padL + '" y1="' + PY(g).toFixed(1) + '" x2="' + (W - padR) + '" y2="' + PY(g).toFixed(1) + '" stroke="rgba(148,163,184,0.09)"/>' +
          '<text x="' + (padL - 5) + '" y="' + (PY(g) + 3).toFixed(1) + '" text-anchor="end" font-size="8" fill="#64748B">' + g + '</text>';
      });
      let pts = '';
      table.dataRows.forEach(function (r) {
        pts += '<circle cx="' + PX(parseFloat(r[0])).toFixed(1) + '" cy="' + PY(parseFloat(r[1])).toFixed(1) + '" r="2.8" fill="#94A3B8" stroke="#0B1220" stroke-width="0.7"/>';
      });
      let curves = '';
      const shown = mode === 'select' ? models.filter(function (m) { return m.state === 'good'; }) : models;
      shown.forEach(function (m) {
        const pp = [];
        for (let i = 0; i <= 160; i++) { const xv = xMin + (xMax - xMin) * (i / 160); pp.push(PX(xv).toFixed(1) + ',' + PY(clampY(polyval(m.coeffs, xv))).toFixed(1)); }
        const em = (mode === 'select');
        curves += '<polyline points="' + pp.join(' ') + '" fill="none" stroke="' + colOf(m.state) + '" stroke-width="' + (em ? 3 : 2) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (em ? 1 : 0.9) + '"/>';
      });
      const head = mode === 'select'
        ? '<span class="mlf-reg-eq">best = bậc 3</span><span class="mlf-reg-err">check <b>8.23</b> — đáy chữ U</span>'
        : '<span class="mlf-reg-eq">3 bậc cùng 1 dữ liệu</span><span class="mlf-reg-err">bậc 1 thẳng · 3 mượt · 12 răng cưa</span>';
      return '<div class="mlf-scene mlf-reg-scene">' +
        '<div class="mlf-reg-head">' + head + '</div>' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="đường fit theo độ phức tạp">' +
          grid + pts + curves +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="9.5" fill="#94A3B8">x →</text>' +
          '<text x="10" y="11" font-size="9.5" fill="#94A3B8">↑ y</text></svg>' +
        (cx.note ? '<div class="mlf-qc-note">' + cx.note + '</div>' : '') +
      '</div>';
    }
    /* Bài 15 — chia 3 phòng: card TRAIN/VAL/TEST theo mode, phòng đang thao tác sáng lên */
    if (k === 'split_rooms') {
      const sr = st.sr || {};
      const mode = sr.mode || 'test';
      const total = sr.total || 1000, posR = sr.pos_ratio != null ? sr.pos_ratio : 0.70;
      // trạng thái mỗi phòng theo mode: 'active' (vừa cắt) · 'pending' (chưa) · 'done'
      const state = {
        test: mode === 'test' ? 'active' : 'done',
        val: mode === 'test' ? 'pending' : (mode === 'val' ? 'active' : 'done'),
        train: mode === 'seal' || mode === 'val' ? (mode === 'val' ? 'active' : 'done') : 'pending'
      };
      function card(kind, name, n, lock) {
        const cls = state[kind];
        const pos = Math.round(n * posR);
        const barW = (pos / Math.max(1, n) * 100).toFixed(1);
        const col = kind === 'train' ? '#34D399' : kind === 'val' ? '#FBBF24' : '#F87171';
        return '<div class="mlf-spl-room is-' + cls + '">' +
          '<div class="mlf-spl-name">' + lock + name + '</div>' +
          '<div class="mlf-spl-n" style="color:' + (cls === 'pending' ? '#475569' : col) + '">' + (cls === 'pending' ? '—' : n) + '</div>' +
          '<div class="mlf-spl-bar"><div class="mlf-spl-barpos" style="width:' + (cls === 'pending' ? 0 : barW) + '%;background:' + col + '"></div></div>' +
          '<div class="mlf-spl-lab">' + (cls === 'pending' ? 'chưa tách' : 'Đậu ' + Math.round(posR * 100) + '%') + '</div></div>';
      }
      const head = mode === 'test'
        ? '<span class="mlf-reg-eq">tách TEST 20%</span><span class="mlf-reg-err">200 niêm phong · 800 tạm</span>'
        : mode === 'val'
          ? '<span class="mlf-reg-eq">tách VAL 0.25×800</span><span class="mlf-reg-err">600 train · 200 val (= 20% gốc)</span>'
          : '<span class="mlf-reg-eq">600 / 200 / 200 ✓</span><span class="mlf-reg-err">không giẫm nhau · Đậu 70% cả ba</span>';
      return '<div class="mlf-scene mlf-spl-scene">' +
        '<div class="mlf-reg-head">' + head + '</div>' +
        '<div class="mlf-spl-rooms">' +
          card('train', 'Train', sr.n_train || 600, '') +
          card('val', 'Val', sr.n_val || 200, '') +
          card('test', 'Test', sr.n_test || 200, '🔒 ') +
        '</div>' +
        (sr.note ? '<div class="mlf-qc-note">' + sr.note + '</div>' : '') +
      '</div>';
    }
    /* C3-Bài 1 — Dimension Stress Test: baseline (2ch) → thêm nhiễu (20→100ch, cùng
       n_samples/seed) → tách hiệu ứng (thêm mẫu KHÔNG cứu được, bỏ nhiễu thì cứu được) */
    if (k === 'dim_stress') {
      const dm = st.dim || {};
      if (dm.mode === 'baseline') {
        const c = dm.contrast, a = dm.accuracy;
        const wNear = Math.max(2, Math.round(c * 100));
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📐 Baseline<br><b>' + dm.dims + ' chiều tín hiệu · ' + dm.n_samples + ' học sinh</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>khoảng cách XA NHẤT</span><div class="mlf-dist-bar"><i class="cyan" style="width:100%"></i></div><b>chuẩn</b></div>' +
            '<div class="mlf-dist"><span>khoảng cách GẦN NHẤT</span><div class="mlf-dist-bar"><i class="pass" style="width:' + wNear + '%"></i></div><b>' + c.toFixed(3) + '</b></div>' +
          '</div>' +
          '<div class="mlf-verdict is-on big">✅ Rõ ràng — accuracy validation ' + Math.round(a * 100) + '%</div>' +
        '</div>';
      }
      if (dm.mode === 'noise') {
        const items = dm.items || [];
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🌫️ Thêm nhiễu<br><b>giữ ' + dm.n_samples + ' học sinh, cùng seed</b></div>' +
          '<div class="mlf-dists">' +
            items.map(function (it) {
              const w = Math.max(2, Math.round(it.contrast * 100));
              return '<div class="mlf-dist"><span>' + it.dims + ' chiều</span><div class="mlf-dist-bar"><i class="' +
                (it.dims <= 2 ? 'pass' : 'warn') + '" style="width:' + w + '%"></i></div><b>' + it.contrast.toFixed(3) + '</b></div>';
            }).join('') +
          '</div>' +
          '<div class="mlf-dim-note">Tương phản gần/xa <b>tăng dần về 1</b> — accuracy KNN validation ' +
            items.map(function (it) { return Math.round(it.accuracy * 100) + '%'; }).join(' → ') + '.</div>' +
        '</div>';
      }
      const as_ = dm.add_samples || {}, rn = dm.remove_noise || {};
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔍 Tách hiệu ứng<br><b>2 thí nghiệm — mỗi lần chỉ đổi 1 biến</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>+mẫu ' + as_.from_n + '→' + as_.to_n + ' (giữ ' + as_.dims + 'ch)</span>' +
            '<div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(as_.contrast_to * 100) + '%"></i></div><b>' + as_.contrast_to.toFixed(3) + '</b></div>' +
          '<div class="mlf-dist"><span>−nhiễu ' + rn.from_dims + '→' + rn.to_dims + 'ch (giữ ' + rn.n_samples + ' mẫu)</span>' +
            '<div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(rn.contrast_to * 100) + '%"></i></div><b>' + rn.contrast_to.toFixed(3) + '</b></div>' +
        '</div>' +
        '<div class="mlf-dim-note">Thêm mẫu (giữ nguyên chiều) <b>hầu như không đổi</b> tương phản (' +
          as_.contrast_from.toFixed(3) + ' → ' + as_.contrast_to.toFixed(3) + ', acc ' + Math.round(as_.acc_from * 100) + '% → ' + Math.round(as_.acc_to * 100) + '%) — ' +
          'trong khi bỏ chiều nhiễu (giữ nguyên số mẫu) kéo tương phản gần về 0 và acc lên ' + Math.round(rn.acc_to * 100) + '%. ' +
          '<b>Số chiều, không phải số mẫu</b>, mới là nguyên nhân co hẹp khoảng cách ở đây.</div>' +
      '</div>';
    }
    /* C3-Bài 2 — PCA transformer: units warning → fit (PC axes+loadings) → transform (leakage-safe) */
    if (k === 'pca_transform') {
      const pc = st.pca || {};
      if (pc.mode === 'units') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📏 15 feature hành vi<br><b>thang đo lệch nhau rất xa</b></div>' +
          '<div class="mlf-dists">' +
            (pc.ranges || []).map(function (r) {
              const w = Math.max(4, Math.round(r.pct));
              return '<div class="mlf-dist"><span>' + r.name + '</span><div class="mlf-dist-bar"><i class="warn" style="width:' + w + '%"></i></div><b>' + r.range + '</b></div>';
            }).join('') +
          '</div>' +
          '<div class="mlf-dim-note">Đơn vị lệch nhau hàng chục đến hàng trăm lần — <b>phải StandardScaler trước khi fit PCA</b>, nếu không PCA sẽ chỉ "nhìn thấy" feature có thang đo lớn nhất.</div>' +
        '</div>';
      }
      if (pc.mode === 'fit') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🧭 Fit PCA(2) trên TRAIN<br><b>' + (pc.n_train || 210) + ' học sinh, KHÔNG dùng validation</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>PC1 — tải mạnh nhất</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round(pc.evr[0] * 100) + '%"></i></div><b>' + (pc.top1 && pc.top1[0]) + '</b></div>' +
            '<div class="mlf-dist"><span>PC2 — tải mạnh nhất</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(pc.evr[1] * 100) + '%"></i></div><b>' + (pc.top1 && pc.top1[1]) + '</b></div>' +
          '</div>' +
          '<div class="mlf-pca-axes"><span class="mlf-pca-axis-chip">PC1 = ' + Math.round(pc.evr[0] * 100) + '% variance</span>' +
            '<span class="mlf-pca-axis-chip">PC2 = ' + Math.round(pc.evr[1] * 100) + '% variance</span></div>' +
          '<div class="mlf-dim-note">PC1 gom nhóm "mức độ tương tác" (login, video, tải tài nguyên); PC2 gom nhóm "tính đều đặn" (nộp đúng hạn, streak). PCA <b>không nhìn nhãn pass_fail</b> — đây thuần là hướng phương sai cao nhất.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔒 Transform validation<br><b>KHÔNG refit — dùng lại scaler/PCA đã học từ train</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>Z_train</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>' + pc.shapes[0].join('×') + '</b></div>' +
          '<div class="mlf-dist"><span>Z_val</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round((pc.shapes[1][0] / pc.shapes[0][0]) * 100) + '%"></i></div><b>' + pc.shapes[1].join('×') + '</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ Cùng 1 hệ toạ độ học từ train — validation chỉ transform(), không refit</div>' +
      '</div>';
    }
    /* C3-Bài 3 — Explained variance selection: spectrum → targets → validate */
    if (k === 'variance_selection') {
      const vs = st.varsel || {};
      if (vs.mode === 'spectrum') {
        const maxV = Math.max.apply(null, vs.evr);
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📊 Full PCA trên train<br><b>40 feature → phổ phương sai của từng thành phần</b></div>' +
          '<div class="mlf-var-spectrum">' + vs.evr.map(function (v) {
            return '<div class="mlf-var-bar" style="height:' + Math.max(3, Math.round((v / maxV) * 100)) + '%" title="' + Math.round(v * 100) + '%"></div>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">6 thành phần đầu gánh gần hết phương sai (PC1 ' + Math.round(vs.evr[0] * 100) + '% → PC6 ' + Math.round(vs.evr[5] * 100) + '%), 9 thành phần còn lại gần như chỉ là nhiễu (&lt;1% mỗi thành phần).</div>' +
        '</div>';
      }
      if (vs.mode === 'targets') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🎯 3 mốc phương sai tích luỹ<br><b>số component NHỎ NHẤT đạt mỗi mốc</b></div>' +
          '<div class="mlf-dists">' +
            (vs.targets || []).map(function (t) {
              return '<div class="mlf-dist"><span>mốc ' + Math.round(t.target * 100) + '%</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round(t.cum * 100) + '%"></i></div><b>n=' + t.n + '</b></div>';
            }).join('') +
          '</div>' +
          '<div class="mlf-dim-note">Mốc càng cao → cần càng nhiều component. Nhưng mốc "đẹp" (95%) chỉ là LỰA CHỌN THIẾT KẾ — không có quy luật nào bắt buộc phải chọn đúng con số này.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔬 Kiểm tra downstream validation<br><b>1 classifier CỐ ĐỊNH, đổi n_components</b></div>' +
        '<div class="mlf-dists">' +
          (vs.rows || []).map(function (r) {
            return '<div class="mlf-dist"><span>n=' + r.n + ' (' + Math.round(r.cum * 100) + '% var)</span><div class="mlf-dist-bar"><i class="' + (r.n === vs.chosen_n ? 'pass' : 'warn') + '" style="width:' + Math.round(r.acc * 100) + '%"></i></div><b>' + Math.round(r.acc * 100) + '%</b></div>';
          }).join('') +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ n=' + vs.chosen_n + ' (mốc 90%) — accuracy nhảy vọt so với n=3 (mốc 80%): tín hiệu nhãn nằm ở thành phần phương sai THẤP, không phải PC1/PC2</div>' +
      '</div>';
    }
    /* C3-Bài 4 — PCA visual audit: project (unlabeled) → label (tô màu) → compare (raw vs PCA) */
    if (k === 'pca_audit') {
      const pa = st.audit || {};
      const pts = pa.points || [];
      const xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      const xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
      const ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
      const W = 320, H = 200, pad = 16;
      const px = function (v) { return pad + ((v - xmin) / (xmax - xmin || 1)) * (W - 2 * pad); };
      const py = function (v) { return (H - pad) - ((v - ymin) / (ymax - ymin || 1)) * (H - 2 * pad); };
      if (pa.mode === 'project' || pa.mode === 'label') {
        const showLabel = pa.mode === 'label';
        let dots = '';
        pts.forEach(function (p) {
          const col = showLabel ? (p[2] === 1 ? '#34D399' : '#F87171') : '#67E8F9';
          dots += '<circle cx="' + px(p[0]).toFixed(1) + '" cy="' + py(p[1]).toFixed(1) + '" r="4" fill="' + col + '" opacity="0.8"/>';
        });
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<svg viewBox="0 0 ' + W + ' ' + H + '" class="mlf-reg-svg" role="img" aria-label="scatter PC1/PC2">' + dots +
            '<text x="' + (W / 2) + '" y="' + (H - 3) + '" text-anchor="middle" font-size="9.5" fill="#94A3B8">PC1 →</text>' +
            '<text x="6" y="11" font-size="9.5" fill="#94A3B8">↑ PC2</text></svg>' +
          (showLabel
            ? '<div class="mlf-audit-legend"><span><i class="mlf-audit-dot" style="background:#34D399"></i>Đậu</span><span><i class="mlf-audit-dot" style="background:#F87171"></i>Rớt</span></div>' +
              '<div class="mlf-dim-note">Tách lớp khá rõ theo trục PC1 — nhưng đây MỚI CHỈ LÀ hình ảnh, chưa phải bằng chứng validation.</div>'
            : '<div class="mlf-dim-note">' + pa.n + ' điểm CHƯA tô nhãn — PCA hoàn toàn không biết ai Đậu ai Rớt khi chiếu.</div>') +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔬 Đầu dò cố định<br><b>so accuracy: feature gốc vs PCA(2)</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>Feature gốc (20 chiều)</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(pa.raw_acc * 100) + '%"></i></div><b>' + Math.round(pa.raw_acc * 100) + '%</b></div>' +
          '<div class="mlf-dist"><span>PCA (2 chiều)</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round(pa.pca_acc * 100) + '%"></i></div><b>' + Math.round(pa.pca_acc * 100) + '%</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ PCA(2) giữ gần như nguyên vẹn accuracy so với 20 feature gốc — bằng chứng THẬT, không chỉ dựa vào việc "biểu đồ trông đẹp"</div>' +
      '</div>';
    }
    /* C3-Bài 5 — SVM margin: baseline linear → tune C → thử RBF */
    if (k === 'svm_margin') {
      const sv = st.svm || {};
      if (sv.mode === 'baseline') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📐 Pipeline(StandardScaler, linear SVC)<br><b>C=1.0 · dữ liệu 2 vòng tròn đồng tâm</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>Validation F1</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(sv.f1 * 100) + '%"></i></div><b>' + sv.f1.toFixed(2) + '</b></div>' +
            '<div class="mlf-dist"><span>Support vectors</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round((sv.n_sv / sv.n_train) * 100) + '%"></i></div><b>' + sv.n_sv + '/' + sv.n_train + '</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">F1 chỉ ' + sv.f1.toFixed(2) + ' — GẦN NHƯ MỌI điểm train trở thành support vector (' + sv.n_sv + '/' + sv.n_train + '): dấu hiệu đường thẳng KHÔNG đủ sức tách 2 vòng tròn lồng nhau.</div>' +
        '</div>';
      }
      if (sv.mode === 'tune') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🎚️ Tune C trên validation<br><b>margin rộng/hẹp — vẫn CÙNG kernel linear</b></div>' +
          '<div class="mlf-dists">' +
            (sv.rows || []).map(function (r) {
              return '<div class="mlf-dist"><span>C=' + r.c + ' (' + r.desc + ')</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(r.f1 * 100) + '%"></i></div><b>F1 ' + r.f1.toFixed(2) + '</b></div>';
            }).join('') +
          '</div>' +
          '<div class="mlf-dim-note">C nhỏ → hành lang rộng, chấp nhận nhiều điểm lấn margin. C lớn → hành lang hẹp, ép sát training. Nhưng CẢ HAI vẫn F1 thấp — đổi C không giải quyết được vấn đề kernel SAI hình dạng.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🌀 Thử kernel RBF<br><b>C=1.0, gamma="scale"</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>Validation F1</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(sv.f1 * 100) + '%"></i></div><b>' + sv.f1.toFixed(2) + '</b></div>' +
          '<div class="mlf-dist"><span>Support vectors</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round((sv.n_sv / sv.n_train) * 100) + '%"></i></div><b>' + sv.n_sv + '/' + sv.n_train + '</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ RBF: F1 nhảy lên ' + sv.f1.toFixed(2) + ', support vectors giảm mạnh — bằng chứng CHÍNH ĐÁNG để chọn kernel phi tuyến ở đây, không phải chỉ vì "linear không hoạt động"</div>' +
      '</div>';
    }
    /* C3-Bài 6 — Unsupervised contract: định nghĩa câu hỏi → fit KMeans+silhouette → audit ARI */
    if (k === 'cluster_contract') {
      const cc = st.cluster || {};
      if (cc.mode === 'contract') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📋 ExperimentSpec<br><b>feature = X (activity, consistency) · nhãn NIÊM PHONG</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>Target vào fit?</span><div class="mlf-dist-bar"><i class="pass" style="width:5%"></i></div><b>KHÔNG</b></div>' +
            '<div class="mlf-dist"><span>ID/nhãn vào feature?</span><div class="mlf-dist-bar"><i class="pass" style="width:5%"></i></div><b>KHÔNG</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">Trước khi fit bất cứ gì: khai báo rõ feature nào được dùng, thuật toán nào, metric NỘI BỘ nào — và xác nhận KHÔNG có target/ID nào lọt vào.</div>' +
        '</div>';
      }
      if (cc.mode === 'fit') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🔍 KMeans(k=3).fit(X_scaled)<br><b>240 học sinh — KHÔNG dùng nhãn</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>Silhouette (nội bộ)</span><div class="mlf-dist-bar"><i class="cyan" style="width:' + Math.round(cc.silhouette * 100) + '%"></i></div><b>' + cc.silhouette.toFixed(2) + '</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">Silhouette đo ĐỘ TÁCH BIỆT nội tại giữa các cụm — hoàn toàn không cần nhãn ngoài. Đây là bằng chứng ĐẦU TIÊN, trước khi mở nhãn niêm phong.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔓 Mở nhãn niêm phong — audit SAU fit<br><b>so cluster_id với external_labels</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>ARI (gốc)</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(cc.ari * 100) + '%"></i></div><b>' + cc.ari.toFixed(3) + '</b></div>' +
          '<div class="mlf-dist"><span>ARI (sau hoán vị ID)</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(cc.ari * 100) + '%"></i></div><b>' + cc.ari.toFixed(3) + '</b></div>' +
          '<div class="mlf-dist"><span>"Accuracy" thô trên ID gốc</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(cc.naive_acc * 100) + '%"></i></div><b>' + (cc.naive_acc * 100).toFixed(1) + '%</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ ARI KHÔNG đổi khi hoán vị cluster_id (permutation-invariant) — trong khi "accuracy" thô rơi gần 0%. Đây chính là vì sao ARI đúng, accuracy thô SAI cho bài toán clustering.</div>' +
      '</div>';
    }
    /* C3-Bài 7 — K-means stability: raw+n_init1 → scale+n_init20 → crescent (từ chối) */
    if (k === 'kmeans_stability') {
      const ks = st.kstab || {};
      if (ks.mode === 'raw') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">⚠️ Feature THÔ, n_init=1<br><b>1 feature lệch thang đo ×20</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>Inertia</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>' + Math.round(ks.inertia).toLocaleString('vi-VN') + '</b></div>' +
            '<div class="mlf-dist"><span>Silhouette</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(ks.silhouette * 100) + '%"></i></div><b>' + ks.silhouette.toFixed(2) + '</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">Inertia = ' + Math.round(ks.inertia).toLocaleString('vi-VN') + ' — con số KHỔNG LỒ, không đọc được, vì 1 feature bị lệch thang đo ×20 áp đảo khoảng cách. n_init=1 cũng dễ kẹt local minimum.</div>' +
        '</div>';
      }
      if (ks.mode === 'scaled') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">✅ StandardScaler + n_init=20<br><b>4 seed [1, 7, 42, 99]</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>Inertia</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>' + ks.inertia.toFixed(1) + '</b></div>' +
            '<div class="mlf-dist"><span>Silhouette</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(ks.silhouette * 100) + '%"></i></div><b>' + ks.silhouette.toFixed(2) + '</b></div>' +
          '</div>' +
          '<div class="mlf-kstab-row">' + (ks.stability || []).map(function (v) { return '<span class="mlf-kstab-chip">ARI ' + v.toFixed(1) + '</span>'; }).join('') + '</div>' +
          '<div class="mlf-dim-note">Sau khi scale: inertia đọc được (' + ks.inertia.toFixed(1) + '), và ARI giữa 4 seed khác nhau đều = 1.0 — kết quả ỔN ĐỊNH, không phụ thuộc lần khởi tạo.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🌙 Dữ liệu hình lưỡi liềm (crescent)<br><b>K-means vẫn CHẠY — nhưng đúng không?</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>ARI vs cấu trúc thật</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(ks.ari_shape * 100) + '%"></i></div><b>' + ks.ari_shape.toFixed(2) + '</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">🚫 ARI chỉ ' + ks.ari_shape.toFixed(2) + ' so với hình dạng thật — K-means giả định cụm HÌNH CẦU, không phù hợp với 2 lưỡi liềm lồng nhau. Inertia/silhouette THẤP không cứu được giả định sai hình dạng.</div>' +
      '</div>';
    }
    /* C3-Bài 8 — Choose k: sweep candidate → stability flag → rationale/reject */
    if (k === 'kselect') {
      const kd = st.kselect || {};
      if (kd.mode === 'sweep') {
        const rows = kd.rows || [];
        const maxSil = Math.max.apply(null, rows.map(function (r) { return r.sil; }));
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📊 Sweep k=2..8<br><b>inertia + silhouette mỗi k</b></div>' +
          '<div class="mlf-kselect-row">' + rows.map(function (r) {
            return '<span class="mlf-kselect-chip' + (r.sil === maxSil ? ' is-best' : '') + '">k=' + r.k + ': sil ' + r.sil.toFixed(2) + '</span>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">Silhouette đạt ĐỈNH rõ ở k=' + kd.peak_k + ' (' + maxSil.toFixed(3) + ') — và inertia có 1 "khuỷu tay" (elbow) đúng ngay tại đó. 2 chỉ số ĐỒNG THUẬN ở dữ liệu này.</div>' +
        '</div>';
      }
      if (kd.mode === 'stability') {
        const rows = kd.rows || [];
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🔁 Stability qua 3 seed [1, 7, 42]<br><b>ARI trung bình mỗi k</b></div>' +
          '<div class="mlf-kselect-row">' + rows.map(function (r) {
            return '<span class="mlf-kselect-chip' + (r.flagged ? ' is-flag' : '') + '">k=' + r.k + ': ' + r.stability.toFixed(2) + (r.flagged ? ' ⚠️' : '') + '</span>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">k=2..5 ổn định tuyệt đối (ARI=1.0). k=7 rớt xuống 0.806 — bị GẮN CỜ vì kết quả đổi khá nhiều giữa các lần khởi tạo khác nhau.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">✅ Áp ràng buộc, chốt rationale<br><b>k=' + kd.chosen_k + ' — hội tụ ĐỦ bằng chứng</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>Silhouette đỉnh</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>k=' + kd.chosen_k + '</b></div>' +
          '<div class="mlf-dist"><span>Elbow rõ</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>k=' + kd.chosen_k + '</b></div>' +
          '<div class="mlf-dist"><span>Ổn định (ARI)</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>1.0</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ k=' + kd.chosen_k + ' được CẢ 3 bằng chứng ủng hộ. Nếu dữ liệu là NGẪU NHIÊN (silhouette thấp-phẳng ở mọi k), rationale đúng phải là "TỪ CHỐI chọn k" — không ép ra 1 con số.</div>' +
      '</div>';
    }
    /* C3-Bài 9 — Shape-aware bench: khoá scale chung → tune DBSCAN → so giả định thuật toán */
    if (k === 'shape_bench') {
      const sb = st.shape || {};
      if (sb.mode === 'lock') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🔒 1 StandardScaler DUY NHẤT<br><b>KMeans + DBSCAN + Complete-link CÙNG dùng 1 X</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>KMeans dùng X nào?</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>X chung</b></div>' +
            '<div class="mlf-dist"><span>DBSCAN dùng X nào?</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>X chung</b></div>' +
            '<div class="mlf-dist"><span>Complete-link dùng X nào?</span><div class="mlf-dist-bar"><i class="pass" style="width:100%"></i></div><b>X chung</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">Khoá 1 representation CHUNG cho cả 3 thuật toán — nếu mỗi model được tiền xử lý khác nhau, so sánh sau đó sẽ không còn công bằng.</div>' +
        '</div>';
      }
      if (sb.mode === 'tune') {
        const rows = sb.rows || [];
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🎛️ Tune eps (min_samples=6 cố định)<br><b>trạng thái 1-cụm/toàn nhiễu bị gắn cờ</b></div>' +
          '<div class="mlf-shape-row">' + rows.map(function (r) {
            return '<span class="mlf-shape-chip' + (r.flagged ? ' is-flag' : '') + '">eps=' + r.eps + ': ' + r.clusters + ' cụm, ' + r.noise + ' nhiễu' + (r.flagged ? ' ⚠️' : '') + '</span>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">eps quá nhỏ (0.15-0.2) → vỡ vụn thành hàng chục cụm giả. eps quá lớn (0.4) → gộp thành 1 cụm DUY NHẤT (silhouette không tính được — None). eps=0.35 là điểm "vừa đủ".</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">⚖️ So giả định thuật toán (ARI vs hình thật)<br><b>không chỉ tin 1 con số silhouette</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>KMeans (giả định hình cầu)</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(sb.kmeans_ari * 100) + '%"></i></div><b>ARI ' + sb.kmeans_ari.toFixed(2) + '</b></div>' +
          '<div class="mlf-dist"><span>DBSCAN (giả định mật độ)</span><div class="mlf-dist-bar"><i class="pass" style="width:' + Math.round(sb.dbscan_ari * 100) + '%"></i></div><b>ARI ' + sb.dbscan_ari.toFixed(2) + '</b></div>' +
          '<div class="mlf-dist"><span>Complete-link (giả định compact)</span><div class="mlf-dist-bar"><i class="warn" style="width:' + Math.round(sb.agg_ari * 100) + '%"></i></div><b>ARI ' + sb.agg_ari.toFixed(2) + '</b></div>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ DBSCAN khớp ĐÚNG hình lưỡi liềm thật (ARI=1.0) dù silhouette của nó THẤP HƠN KMeans — vì silhouette thiên vị cụm lồi/gọn. Không thuật toán nào "luôn tốt nhất" — phải khớp GIẢ ĐỊNH với HÌNH DẠNG dữ liệu.</div>' +
      '</div>';
    }
    /* C3-Bài 10 — Perceptron trace: 1 update tay → train separable hội tụ → XOR không hội tụ */
    if (k === 'perceptron_trace') {
      const pt = st.pct || {};
      if (pt.mode === 'manual') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">✋ 1 update tay trên điểm (' + pt.point.join(',') + ')<br><b>w: [' + pt.w_before.join(',') + '] → [' + pt.w_after.join(',') + ']</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>score = w·x+b</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>' + pt.score + '</b></div>' +
            '<div class="mlf-dist"><span>pred vs nhãn thật</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>' + pt.pred + ' vs ' + pt.label + '</b></div>' +
            '<div class="mlf-dist"><span>error = y - pred</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>' + pt.error + '</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">Update CHỈ xảy ra vì error ≠ 0: w += lr·error·x, b += lr·error — đúng 1 lần, không đụng vào điểm đã đúng.</div>' +
        '</div>';
      }
      if (pt.mode === 'converge') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">✅ Train trên dữ liệu TÁCH TUYẾN TÍNH được (AND)<br><b>hội tụ sau ' + pt.epochs + ' epoch — 0 lỗi</b></div>' +
          '<div class="mlf-pct-row">' + pt.mistakes.map(function (m, i) {
            return '<span class="mlf-pct-chip' + (m === 0 ? ' is-converged' : '') + '">epoch ' + (i + 1) + ': ' + m + ' lỗi</span>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">Số lỗi mỗi epoch GIẢM DẦN về 0 — đây chính là bằng chứng hội tụ khi dữ liệu tách tuyến tính được.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">⚠️ Chuyển sang XOR (KHÔNG tách tuyến tính được)<br><b>' + pt.epochs + ' epoch — KHÔNG hội tụ</b></div>' +
        '<div class="mlf-pct-row">' + pt.sample_mistakes.map(function (m) {
          return '<span class="mlf-pct-chip is-flag">' + m + '</span>';
        }).join('') + '</div>' +
        '<div class="mlf-verdict is-on big">🚫 Không hội tụ trên XOR KHÔNG có nghĩa code sai — đây là GIỚI HẠN NĂNG LỰC của 1 perceptron tuyến tính (không có epoch nào đủ để giải). Không được kết luận "trained successfully" chỉ vì code chạy xong.</div>' +
      '</div>';
    }
    /* C3-Bài 11 — Gradient flow console: cùng tín hiệu qua 1 → 5 → 10 lớp, so sigmoid vs ReLU */
    if (k === 'gradient_flow_console') {
      const gf = st.gf || {};
      const logPct = function (v) { return Math.max(2, Math.min(100, (Math.log10(v) + 7) * (100 / 7))); };
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">🔬 Depth=' + gf.depth + ' — cùng tín hiệu, 2 activation khác nhau<br><b>gradient_product = tích dồn gradient qua ' + gf.depth + ' lớp</b></div>' +
        '<div class="mlf-dists">' +
          '<div class="mlf-dist"><span>sigmoid</span><div class="mlf-dist-bar"><i class="warn" style="width:' + logPct(gf.sigmoid_prod).toFixed(0) + '%"></i></div><b>' + gf.sigmoid_prod.toExponential(2) + '</b></div>' +
          '<div class="mlf-dist"><span>ReLU</span><div class="mlf-dist-bar"><i class="pass" style="width:' + logPct(gf.relu_prod).toFixed(0) + '%"></i></div><b>' + gf.relu_prod.toExponential(2) + '</b></div>' +
        '</div>' +
        '<div class="mlf-gf-row">' +
          '<span class="mlf-gf-chip is-sigmoid">sigmoid ' + gf.sigmoid_prod.toExponential(2) + '</span>' +
          '<span class="mlf-gf-chip is-relu">ReLU lớn hơn ' + Math.round(gf.ratio) + '×</span>' +
        '</div>' +
        '<div class="mlf-dim-note">' + gf.note + '</div>' +
      '</div>';
    }
    /* C3-Bài 12 — Network shape builder: bảng shape → activation compat → forward run thật */
    if (k === 'network_shape_builder') {
      const nsb = st.nsb || {};
      if (nsb.mode === 'shapes') {
        const sh = nsb.shapes || {};
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">📐 Đặt batch/input/hidden/output size<br><b>4 tham số được sinh ra tự động, khớp shape</b></div>' +
          '<div class="mlf-nsb-row">' +
            '<span class="mlf-nsb-chip is-ok">W1 ' + sh.W1 + '</span>' +
            '<span class="mlf-nsb-chip is-ok">b1 ' + sh.b1 + '</span>' +
            '<span class="mlf-nsb-chip is-ok">W2 ' + sh.W2 + '</span>' +
            '<span class="mlf-nsb-chip is-ok">b2 ' + sh.b2 + '</span>' +
          '</div>' +
          '<div class="mlf-dim-note">n_in=3 → hidden=4 → output=1: W1 nối (n_in,hidden), W2 nối (hidden,output) — số cột lớp trước LUÔN khớp số hàng lớp sau.</div>' +
        '</div>';
      }
      if (nsb.mode === 'activation') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">🎛️ Chọn activation ẩn/output<br><b>' + nsb.hidden + ' (ẩn) + ' + nsb.output + ' (output) — khớp bài toán nhị phân</b></div>' +
          '<div class="mlf-nsb-row">' +
            '<span class="mlf-nsb-chip is-ok">' + nsb.hidden + ' ẩn ✓</span>' +
            '<span class="mlf-nsb-chip is-ok">' + nsb.output + ' output ✓</span>' +
            '<span class="mlf-nsb-chip is-flag">' + nsb.bad_output + ' ✗</span>' +
          '</div>' +
          '<div class="mlf-dim-note">Nhị phân → Sigmoid (1 xác suất). ' + nsb.bad_output + ' SAI vì không khớp hợp đồng output nhị phân — dù code vẫn chạy được.</div>' +
        '</div>';
      }
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">▶ Chạy forward thật trên batch 5 mẫu<br><b>P trong [' + nsb.p_min.toFixed(3) + ', ' + nsb.p_max.toFixed(3) + ']</b></div>' +
        '<div class="mlf-nsb-row">' + (nsb.p || []).map(function (v) {
          return '<span class="mlf-nsb-chip is-ok">P=' + v.toFixed(3) + '</span>';
        }).join('') + '</div>' +
        '<div class="mlf-verdict is-on big">⚠️ A1 (hidden activation) có ' + Math.round(nsb.dead_frac * 100) + '% giá trị = 0 (ReLU "chết" ở vùng âm, đúng chủ đề Bài 11) — mỗi P vẫn là 1 xác suất hợp lệ trong (0,1), không phải nhãn cứng.</div>' +
      '</div>';
    }
    /* C3-Bài 13 — Gradient graph builder: nối dZ2 output → dA1/dZ1 hidden → gradient_check thật */
    if (k === 'gradient_graph_builder') {
      const gg = st.gg || {};
      if (gg.mode === 'output') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">1️⃣ Nối đạo hàm loss ở OUTPUT<br><b>dZ2 = (P − y) / m</b></div>' +
          '<div class="mlf-gg-row">' +
            '<span class="mlf-gg-chip is-ok">dZ2 shape ' + gg.dz2_shape + '</span>' +
            '<span class="mlf-gg-chip is-ok">dW2 = A1ᵀ@dZ2</span>' +
            '<span class="mlf-gg-chip is-ok">db2 = dZ2.sum(axis=0) = ' + gg.db2_val.toFixed(4) + '</span>' +
          '</div>' +
          '<div class="mlf-dim-note">dZ2 là ĐIỂM XUẤT PHÁT của mọi gradient — mọi dW/db khác đều suy ra từ đây qua chain rule, KHÔNG tính lại từ loss mỗi lần.</div>' +
        '</div>';
      }
      if (gg.mode === 'hidden') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">2️⃣ Lan tiếp về lớp ẩn<br><b>dA1 = dZ2@W2ᵀ → dZ1 = dA1 · (Z1&gt;0)</b></div>' +
          '<div class="mlf-gg-row">' +
            '<span class="mlf-gg-chip is-ok">dA1 ' + gg.da1_shape + '</span>' +
            '<span class="mlf-gg-chip is-ok">dZ1 ' + gg.dz1_shape + ' (ReLU mask)</span>' +
            '<span class="mlf-gg-chip is-ok">dW1 ' + gg.dw1_shape + '</span>' +
          '</div>' +
          '<div class="mlf-dim-note">ReLU mask (Z1&gt;0) CHỈ cho gradient đi qua những unit đã "sống" ở forward pass — dùng lại ĐÚNG cache, không tính Z1 lại từ đầu.</div>' +
        '</div>';
      }
      const re = gg.rel_errors || {};
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">3️⃣ Chạy gradient_check thật (finite-difference)<br><b>relative error lớn nhất ≈ ' + gg.max_rel.toExponential(1) + '</b></div>' +
        '<div class="mlf-gg-row">' +
          Object.keys(re).map(function (k2) {
            return '<span class="mlf-gg-chip is-ok">' + k2 + ': ' + re[k2].toExponential(1) + '</span>';
          }).join('') +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ Relative error ~1e-9 — analytical gradient KHỚP numerical gradient, đủ bằng chứng để tin backward_two_layer đúng, không chỉ "vì loss giảm trên dữ liệu thấy được".</div>' +
      '</div>';
    }
    /* C3-Bài 14 — Neural experiment designer: param count → curves/instability → khoá checkpoint & test */
    if (k === 'neural_experiment_designer') {
      const ned = st.ned || {};
      if (ned.mode === 'params') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">1️⃣ Lắp MLP + task contract<br><b>1 logit output + BCEWithLogitsLoss (nhị phân)</b></div>' +
          '<div class="mlf-ned-row">' + (ned.candidates || []).map(function (c) {
            return '<span class="mlf-ned-chip">' + c.name + ': ' + c.params + ' tham số</span>';
          }).join('') + '</div>' +
          '<div class="mlf-dim-note">Param count sinh ra TỰ ĐỘNG từ kiến trúc (input_dim→hidden→1) — càng nhiều hidden unit, càng nhiều tham số, càng dễ overfit trên dữ liệu nhỏ.</div>' +
        '</div>';
      }
      if (ned.mode === 'curves') {
        return '<div class="mlf-scene mlf-scene-reg">' +
          '<div class="mlf-newcard">2️⃣ Train trong ngân sách epoch cố định<br><b>A thiếu năng lực · C dư năng lực (nếu không early-stop)</b></div>' +
          '<div class="mlf-dists">' +
            '<div class="mlf-dist"><span>A (hidden=2): train≈' + ned.a_train_final.toFixed(3) + ', val≈' + ned.a_val_final.toFixed(3) + '</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>UNDERFIT</b></div>' +
            '<div class="mlf-dist"><span>C (hidden=256, không early-stop): train≈' + ned.c_train_final.toFixed(3) + ', val≈' + ned.c_val_final.toFixed(3) + '</span><div class="mlf-dist-bar"><i class="warn" style="width:100%"></i></div><b>OVERFIT</b></div>' +
          '</div>' +
          '<div class="mlf-dim-note">A: cả 2 đường cùng CAO và gần nhau (thiếu năng lực để học). C (nếu bỏ qua validation): train rất THẤP nhưng val lại CAO hơn hẳn mức đáy của nó — khoảng cách train-val ngày càng doãng ra.</div>' +
        '</div>';
      }
      const m = ned.metrics;
      return '<div class="mlf-scene mlf-scene-reg">' +
        '<div class="mlf-newcard">3️⃣ Áp early stopping, mở test ĐÚNG 1 LẦN<br><b>B (hidden=16) — khoá checkpoint epoch ' + ned.best_epoch + '</b></div>' +
        '<div class="mlf-ned-row">' +
          '<span class="mlf-ned-chip is-ok">best_val ' + ned.best_val.toFixed(3) + '</span>' +
          '<span class="mlf-ned-chip is-ok">accuracy ' + m.accuracy.toFixed(3) + '</span>' +
          '<span class="mlf-ned-chip is-ok">F1 ' + m.f1.toFixed(3) + '</span>' +
        '</div>' +
        '<div class="mlf-verdict is-on big">✅ Checkpoint chọn bằng VALIDATION (không phải train loss thấp nhất), test chỉ mở SAU KHI đã chốt model — đây mới là quy trình đáng bảo vệ, không phải "thử đến khi test đẹp".</div>' +
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
