/* course_ml.js — trang chi tiết khóa Machine Learning Cơ bản (Course 1 — ML Foundations).
 * Bố cục + cơ chế giống course_db_design.js (roadmap snake node path, tiến độ
 * localStorage pe_progress_ml + /api/courses-enrolled), nhưng file RIÊNG —
 * không đụng 3 trang DB Design đã audit sạch. Roadmap 5 module (DB chỉ có 3). */

/* ── Giáo trình Course 1 — 15 bài · 5 module ── */
var ML_MODULE_NAMES = {
  1: 'ML Problem Framing',
  2: 'Data Readiness',
  3: 'Linear Regression Foundations',
  4: 'Logistic Classification Foundations',
  5: 'Generalization & Honest Evaluation'
};

var ML_LESSONS = [
  { n: 1,  m: 1, t: 'ML vs Lập trình truyền thống',                min: 18 },
  { n: 2,  m: 1, t: 'Bài toán ML này thuộc loại nào?',             min: 19 },
  { n: 3,  m: 1, t: 'Dataset trong mắt model — X và y',            min: 19 },
  { n: 4,  m: 2, t: 'Hiểu kiểu dữ liệu trước khi train',           min: 19 },
  { n: 5,  m: 2, t: 'Làm sạch dữ liệu bẩn',                        min: 19 },
  { n: 6,  m: 2, t: 'Scale feature — không để 1 đơn vị lấn át',    min: 19 },
  { n: 7,  m: 2, t: 'Đọc dữ liệu bằng thống kê cơ bản',            min: 19 },
  { n: 8,  m: 3, t: 'Vẽ đường dự đoán đầu tiên',                   min: 19 },
  { n: 9,  m: 3, t: 'Đo lỗi model bằng MSE',                       min: 19 },
  { n: 10, m: 3, t: 'Gradient Descent — model tự chỉnh đường',     min: 20 },
  { n: 11, m: 4, t: 'Vì sao Linear Regression không phân loại được', min: 19 },
  { n: 12, m: 4, t: 'Sigmoid — biến score thành xác suất',         min: 19 },
  { n: 13, m: 4, t: 'Decision Boundary — luật tách 2 lớp',         min: 19 },
  { n: 14, m: 5, t: 'Underfit, Good Fit và Overfit',               min: 20 },
  { n: 15, m: 5, t: 'Chia Train / Validation / Test',              min: 20 }
];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ── Hero time = tổng phút giáo trình, làm tròn giờ (quy ước dự án) ── */
(function updateHeroTime() {
  var totalMin = ML_LESSONS.reduce(function (s, l) { return s + (l.min || 0); }, 0);
  var el = document.getElementById('cd-hero-time');
  if (!el) return;
  el.textContent = totalMin < 60 ? '~' + totalMin + ' phút' : '~' + Math.round(totalMin / 60) + ' giờ';
})();

/* ── Module hoàn thành (generic theo số module thực tế) ── */
function computeModuleCompletion(completedSet) {
  var by = {};
  ML_LESSONS.forEach(function (l) { (by[l.m] = by[l.m] || []).push(l.n); });
  var done = {};
  Object.keys(by).forEach(function (m) {
    done[m] = by[m].length > 0 && by[m].every(function (n) { return completedSet.has(n); });
  });
  return done;
}

function applySkillUnlocks(completedSet) {
  var skills = document.querySelectorAll('.cd-skill-item');
  if (!skills.length) return;
  var mod = computeModuleCompletion(completedSet);
  var staggerByModule = {};
  skills.forEach(function (el) {
    var m = el.dataset.module;
    el.classList.remove('is-locked', 'is-unlocked');
    if (mod[m]) {
      el.classList.add('is-unlocked');
      staggerByModule[m] = staggerByModule[m] || 0;
      el.style.setProperty('--i', String(staggerByModule[m]));
      staggerByModule[m] += 1;
    } else {
      el.classList.add('is-locked');
    }
  });
}

/* ── Prereq: ✓ xanh nếu đã ghi danh khóa python ── */
function applyPrereqStatus(enrolledList) {
  var hasPython = (enrolledList || []).some(function (e) { return e && e.id === 'python'; });
  var item = document.querySelector('[data-prereq="python"]');
  if (!item) return;
  var status = item.querySelector('.cd-req-status');
  if (!status) return;
  status.classList.remove('is-unmet', 'is-met');
  if (hasPython) {
    status.classList.add('is-met');
    var icon = status.querySelector('i');
    if (icon) icon.className = 'fas fa-check';
  } else {
    status.classList.add('is-unmet');
  }
}

/* ── Tiến độ: API → localStorage pe_progress_ml → CURRENT_LESSON_IDX ── */
function resolveUserProgress() {
  return new Promise(function (resolve) {
    fetch('/api/courses-enrolled', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var enrolled = (data && data.enrolled) || [];
        var me = enrolled.find(function (e) { return e.id === 'ml'; });
        var apiCompletedCount = me ? (me.completedLessons || 0) : 0;
        var serverCurrent = (typeof CURRENT_LESSON_IDX === 'number') ? (CURRENT_LESSON_IDX + 1) : 1;

        var stored = [];
        try { stored = JSON.parse(localStorage.getItem('pe_progress_ml') || '[]'); } catch (e) {}
        var completedSet = new Set();
        if (Array.isArray(stored)) {
          stored.forEach(function (n) { if (typeof n === 'number') completedSet.add(n); });
        }
        for (var i = 1; i <= apiCompletedCount; i++) completedSet.add(i);

        var lsMax = 0;
        completedSet.forEach(function (n) { if (n > lsMax) lsMax = n; });
        var currentIdx = Math.max(serverCurrent, lsMax + 1, apiCompletedCount + 1);

        resolve({ completedSet: completedSet, currentIdx: currentIdx, enrolledList: enrolled });
      })
      .catch(function () {
        var stored = [];
        try { stored = JSON.parse(localStorage.getItem('pe_progress_ml') || '[]'); } catch (e) {}
        var completedSet = new Set(stored.filter(function (n) { return typeof n === 'number'; }));
        var lsMax = 0;
        completedSet.forEach(function (n) { if (n > lsMax) lsMax = n; });
        var currentIdx = (typeof CURRENT_LESSON_IDX === 'number')
          ? Math.max(CURRENT_LESSON_IDX + 1, lsMax + 1)
          : Math.max(1, lsMax + 1);
        resolve({ completedSet: completedSet, currentIdx: currentIdx, enrolledList: [] });
      });
  });
}

/* ── Roadmap: snake node path, 5 module zone ── */
(function renderRoadmap() {
  var container = document.getElementById('cd-roadmap');
  if (!container) return;

  var byModule = {};
  ML_LESSONS.forEach(function (l) { (byModule[l.m] = byModule[l.m] || []).push(l); });
  var moduleIds = Object.keys(byModule).map(Number).sort(function (a, b) { return a - b; });

  function splitRows(arr) {
    var rows = [];
    for (var i = 0; i < arr.length; i += 3) rows.push(arr.slice(i, i + 3));
    return rows;
  }

  var html = '';
  moduleIds.forEach(function (mIdx) {
    var lessonsM = byModule[mIdx];
    html += '<div class="cd-roadmap-module" data-module="' + mIdx + '">';
    html += '<div class="cd-roadmap-module-hd">';
    html += '<span class="cd-roadmap-module-hd-num">MODULE ' + mIdx + '</span>';
    html += '<span class="cd-roadmap-module-hd-name">' + ML_MODULE_NAMES[mIdx] + '</span>';
    html += '<span class="cd-roadmap-module-hd-meta">' + lessonsM.length + ' bài</span>';
    html += '</div>';
    splitRows(lessonsM).forEach(function (row, rowIdx) {
      var reverse = (rowIdx % 2 === 1) ? ' reverse' : '';
      html += '<div class="cd-roadmap-row' + reverse + '">';
      row.forEach(function (lesson) {
        html += '<a href="/lesson/ml?lesson=' + lesson.n + '" class="cd-roadmap-node js-roadmap-node" data-lesson="' + lesson.n + '" data-module="' + lesson.m + '" data-boss="0">';
        html += '<div class="cd-roadmap-node-circle">';
        html += '<span class="cd-roadmap-node-num">' + lesson.n + '</span>';
        html += '</div>';
        html += '<div class="cd-roadmap-node-title">Bài ' + lesson.n + ': ' + escapeHtml(lesson.t) + '</div>';
        html += '</a>';
      });
      for (var p = row.length; p < 3; p++) html += '<div class="cd-roadmap-empty"></div>';
      html += '</div>';
    });
    html += '</div>';
  });
  container.innerHTML = html;

  function applyStates(completedSet, currentIdx) {
    container.querySelectorAll('.js-roadmap-node').forEach(function (node) {
      var n = parseInt(node.dataset.lesson, 10);
      node.classList.remove('completed', 'current', 'locked');
      if (completedSet.has(n)) {
        node.classList.add('completed');
      } else if (n === currentIdx) {
        node.classList.add('current');
        node.id = 'current-lesson';
      } else if (n < currentIdx) {
        node.classList.add('completed');
      } else {
        node.classList.add('locked');
        node.removeAttribute('href');
      }
    });
  }

  resolveUserProgress().then(function (progress) {
    applyStates(progress.completedSet, progress.currentIdx);
    applySkillUnlocks(progress.completedSet);
    applyPrereqStatus(progress.enrolledList);
  });
})();

function goLesson() {
  var el = document.getElementById('current-lesson');
  if (el && el.getAttribute('href')) { window.location = el.getAttribute('href'); return; }
  window.location = LESSON_URL + '?lesson=' + (CURRENT_LESSON_IDX + 1);
}

/* ── Enroll / Unenroll ── */
function enroll() {
  var btn = document.getElementById('enroll-btn');
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  fetch('/api/courses/' + COURSE_ID + '/enroll', {
    method: 'POST',
    headers: { 'X-CSRFToken': document.querySelector('meta[name=csrf-token]').content }
  })
  .then(function (r) { return r.json(); })
  .then(function (d) {
    if (d.ok) window.location.reload();
    else {
      btn.disabled = false;
      btn.textContent = 'Đăng ký ngay – Miễn phí';
      alert(d.error || 'Lỗi, thử lại.');
    }
  })
  .catch(function () {
    btn.disabled = false;
    btn.textContent = 'Đăng ký ngay – Miễn phí';
  });
}

function unenroll() {
  if (!confirm('Bạn có chắc muốn hủy đăng ký khóa Machine Learning?\nToàn bộ tiến độ sẽ bị xóa.')) return;
  var btn = document.getElementById('unenroll-btn');
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  fetch('/api/courses/' + COURSE_ID + '/enroll', {
    method: 'DELETE',
    headers: { 'X-CSRFToken': document.querySelector('meta[name=csrf-token]').content }
  })
  .then(function (r) { return r.json(); })
  .then(function (d) {
    if (d.ok) window.location.reload();
    else { btn.disabled = false; btn.textContent = 'Hủy đăng ký'; }
  })
  .catch(function () { btn.disabled = false; btn.textContent = 'Hủy đăng ký'; });
}

/* ── Topbar helpers (theme / user menu / bell) — cùng khuôn các trang course ── */
(function () {
  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }
  window.toggleTheme = function () {
    var isDark = !document.body.classList.contains('dark');
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
  applyTheme(localStorage.getItem('theme') === 'dark');
})();

function toggleUserMenu() {
  var btn = document.getElementById('user-chip-btn');
  var menu = document.getElementById('user-dropdown');
  var open = menu.classList.contains('open');
  closeBellPanel();
  if (open) {
    menu.classList.remove('open'); btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    menu.classList.add('open'); btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

document.addEventListener('click', function (e) {
  var userWrap = document.getElementById('user-chip-wrap');
  if (userWrap && !userWrap.contains(e.target)) {
    var btn = document.getElementById('user-chip-btn');
    var menu = document.getElementById('user-dropdown');
    menu.classList.remove('open'); btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  var bellWrap = document.getElementById('bell-wrap');
  if (bellWrap && !bellWrap.contains(e.target)) closeBellPanel();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var btn = document.getElementById('user-chip-btn');
    var menu = document.getElementById('user-dropdown');
    if (menu) { menu.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    closeBellPanel();
  }
});

var _bellNotifs = [
  { icon: '🤖', text: 'Khóa Machine Learning Cơ bản vừa ra mắt — Python thật trong trình duyệt!', time: 'Vừa xong', unread: true },
  { icon: '🔥', text: 'Streak 7 ngày liên tiếp! Tiếp tục phát huy nhé!', time: '2 giờ trước', unread: true },
  { icon: '🏅', text: 'Bạn đã đạt huy hiệu "Người mới bắt đầu". Chúc mừng!', time: '3 ngày trước', unread: false }
];

function _renderBellItems() {
  var body = document.getElementById('bell-panel-body');
  if (!body) return;
  body.innerHTML = _bellNotifs.map(function (n, i) {
    return '<div class="bell-item' + (n.unread ? ' unread' : '') + '" onclick="readBellItem(' + i + ')">'
      + '<div class="bell-item-icon">' + n.icon + '</div>'
      + '<div class="bell-item-body"><div class="bell-item-text">' + n.text + '</div>'
      + '<div class="bell-item-time">' + n.time + '</div></div>'
      + (n.unread ? '<div class="bell-unread-dot"></div>' : '') + '</div>';
  }).join('');
}

function _updateBellDot() {
  var dot = document.getElementById('bell-dot');
  if (!dot) return;
  dot.style.display = _bellNotifs.some(function (n) { return n.unread; }) ? '' : 'none';
}

function toggleBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn = document.getElementById('bell-btn');
  var open = panel.classList.contains('open');
  if (open) { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  else { _renderBellItems(); panel.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

function closeBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn = document.getElementById('bell-btn');
  if (panel) panel.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function readBellItem(idx) {
  if (_bellNotifs[idx]) { _bellNotifs[idx].unread = false; _renderBellItems(); _updateBellDot(); }
}

function markAllBellRead() {
  _bellNotifs.forEach(function (n) { n.unread = false; });
  _renderBellItems(); _updateBellDot();
}

/* ── Interactive Star Rating (stub, giống trang DB) ── */
(function () {
  var fillEl = document.querySelector('.star-avg-fill');
  if (fillEl) fillEl.style.width = (fillEl.dataset.fill || 0) + '%';

  var container = document.getElementById('starInteractive');
  var rateVal = document.getElementById('userRateVal');
  if (!container || !rateVal) return;

  var stars = container.querySelectorAll('.si-star');
  var selectedRating = 0;
  var LABELS = {
    0.5: 'Quá tệ', 1: 'Rất tệ', 1.5: 'Tệ', 2: 'Không tốt',
    2.5: 'Tạm được', 3: 'Bình thường', 3.5: 'Khá ổn',
    4: 'Tốt', 4.5: 'Rất tốt', 5: 'Xuất sắc! 🎉'
  };

  function paintStars(val) {
    stars.forEach(function (star, i) {
      var n = i + 1;
      star.classList.remove('star-full', 'star-half');
      if (val >= n) star.classList.add('star-full');
      else if (val >= n - 0.5) star.classList.add('star-half');
    });
  }

  function updateLabel(val) {
    rateVal.textContent = val ? val + ' ★  ' + (LABELS[val] || '') : '—';
  }

  stars.forEach(function (star) {
    star.addEventListener('mousemove', function (e) {
      var rect = star.getBoundingClientRect();
      var isLeft = (e.clientX - rect.left) < rect.width / 2;
      var n = parseInt(star.dataset.star);
      paintStars(isLeft ? n - 0.5 : n);
      updateLabel(isLeft ? n - 0.5 : n);
    });
    star.addEventListener('click', function (e) {
      var rect = star.getBoundingClientRect();
      var isLeft = (e.clientX - rect.left) < rect.width / 2;
      var n = parseInt(star.dataset.star);
      selectedRating = isLeft ? n - 0.5 : n;
      paintStars(selectedRating);
      updateLabel(selectedRating);
    });
  });

  container.addEventListener('mouseleave', function () {
    paintStars(selectedRating);
    updateLabel(selectedRating);
  });

  paintStars(0);
})();
