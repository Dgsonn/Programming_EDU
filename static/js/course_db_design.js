// Cập nhật trạng thái bài học dựa trên tiến độ
(function updateLessonStatuses() {
  // Cap completed at actual lesson count (PART 2 = 10 bài, không theo cũ 60 bài)
  const allLessons = document.querySelectorAll('.cd-lesson');
  const totalLessons = allLessons.length;
  const completed = Math.min(CURRENT_LESSON_IDX, totalLessons);
  allLessons.forEach(function(lesson, idx) {
    const icon = lesson.querySelector('.cd-lesson-icon');
    const title = lesson.querySelector('.cd-lesson-title');
    lesson.classList.remove('done', 'current', 'locked');
    if (idx < completed) {
      lesson.classList.add('done');
      icon.textContent = '✓';
      lesson.style.cursor = 'pointer';
      lesson.onclick = function() { window.location = LESSON_URL + '?lesson=' + (idx + 1); };
    } else if (idx === completed && completed > 0) {
      lesson.classList.add('current');
      icon.textContent = '▶';
      lesson.id = 'current-lesson';
      lesson.style.cursor = 'pointer';
      lesson.onclick = function() { window.location = LESSON_URL + '?lesson=' + (idx + 1); };
      // Thêm badge Tiếp tục
      if (!lesson.querySelector('.cd-lesson-badge')) {
        var badge = document.createElement('span');
        badge.className = 'cd-lesson-badge';
        badge.textContent = 'Tiếp tục';
        lesson.querySelector('.cd-lesson-num').replaceWith(badge);
      }
    } else {
      lesson.classList.add('locked');
      icon.textContent = '○';
    }
  });
})();

function toggleModule(hd) {
  hd.classList.toggle('open');
  hd.nextElementSibling.classList.toggle('open');
}

/* ============================================================================
 * C8 — Course Detail Improvements
 * - Hero time: compute total minutes from lessons.min, update #cd-hero-time
 * - Skills: progressive unlock animation when module completed
 * - Prereq: green ✓ if user enrolled in any cpp/java/python course (proxy for SQL basics)
 * Files: course_db_design.html + .css + .js
 * ========================================================================== */

/* ═══ 2026-07-04: trang chi tiết dùng CHUNG cho 3 khóa DB Design (saga GameHub) ═══
 * Course id đọc từ <body data-course>; mọi text/roadmap/link lấy theo COURSE_PAGE_META. */
var CD_COURSE_ID = (document.body && document.body.dataset.course) || 'db_design';

var COURSE_PAGE_META = {
  db_design: {
    heroTitle: 'Database Design Cơ bản',
    heroSubtitle: 'Phần 1 — Xây nền tảng GameHub · ER Mapping, Phụ thuộc hàm & Chuẩn hóa — theo giáo trình Silberschatz',
    moduleNames: { 1: 'ER Model & Mapping', 2: 'FD & Normalization', 3: 'Application Design' },
    lessonBase: '/lesson/db_design'
  },
  db_design_tc: {
    heroTitle: 'Database Design Trung cấp',
    heroSubtitle: 'Phần 2 — GameHub Community · Advanced SQL, Big Data & Storage/Index — Ticket #21–#41',
    moduleNames: { 1: 'Advanced SQL', 2: 'Big Data & Analytics', 3: 'Storage, Indexing & Performance' },
    lessonBase: '/lesson/db_design_tc',
    lessons: [
      { n: 1,  m: 1, t: 'SQL từ ngôn ngữ lập trình — JDBC & Cursor', min: 25 },
      { n: 2,  m: 1, t: 'Functions & Stored Procedures',             min: 20 },
      { n: 3,  m: 1, t: 'Trigger — database tự phản ứng',            min: 20 },
      { n: 4,  m: 1, t: 'Recursive Queries (WITH RECURSIVE)',        min: 22 },
      { n: 5,  m: 2, t: 'Star Schema (Fact + Dim)',                  min: 20 },
      { n: 6,  m: 2, t: 'ROLLUP & CUBE',                             min: 20 },
      { n: 7,  m: 2, t: 'MapReduce',                                 min: 20 },
      { n: 8,  m: 2, t: 'JSON Document Store',                       min: 18 },
      { n: 9,  m: 2, t: 'OLAP Slice-Dice-Drilldown',                 min: 20 },
      { n: 10, m: 2, t: 'Tumbling Windows (Streaming)',              min: 20 },
      { n: 11, m: 3, t: 'Storage Hierarchy',                         min: 15 },
      { n: 12, m: 3, t: 'Sequential vs Random Access',               min: 15 },
      { n: 13, m: 3, t: 'Buffer Manager',                            min: 18 },
      { n: 14, m: 3, t: 'Record Layout & Heap File',                 min: 18 },
      { n: 15, m: 3, t: 'Row-Store vs Column-Store',                 min: 15 },
      { n: 16, m: 3, t: 'Index cơ bản (Search Key)',                 min: 15 },
      { n: 17, m: 3, t: 'Dense / Sparse / Clustering / Secondary',   min: 18 },
      { n: 18, m: 3, t: 'B+-Tree (Lookup + Range)',                  min: 22 },
      { n: 19, m: 3, t: 'Composite & Bitmap Index',                  min: 18 },
      { n: 20, m: 3, t: 'Capstone: Index × EXPLAIN Storage',         min: 25 },
      { n: 21, m: 3, t: 'Boss Battle — Social Graph Detective', boss: true, min: 30 }
    ]
  },
  db_design_nc: {
    heroTitle: 'Database Design Nâng cao',
    heroSubtitle: 'Phần 3 — GameHub Marketplace · Engine, Concurrency & Recovery — Ticket #42–#66',
    moduleNames: { 1: 'Engine Room (Query Processing)', 2: 'Concurrency Control', 3: 'Crash Recovery' },
    lessonBase: '/lesson/db_design_nc',
    lessons: [
      { n: 1,  m: 1, t: 'SQL → Execution Plan',                      min: 20 },
      { n: 2,  m: 1, t: 'Cost: Block Transfer + Random I/O',         min: 20 },
      { n: 3,  m: 1, t: 'Full Scan vs Index Scan',                   min: 18 },
      { n: 4,  m: 1, t: 'External Sort-Merge',                       min: 20 },
      { n: 5,  m: 1, t: 'Join I: Nested / Block / Indexed',          min: 22 },
      { n: 6,  m: 1, t: 'Join II: Merge + Hash Join',                min: 22 },
      { n: 7,  m: 1, t: 'Aggregation: Sort vs Hash',                 min: 18 },
      { n: 8,  m: 1, t: 'Materialization vs Pipelining',             min: 18 },
      { n: 9,  m: 1, t: 'Optimizer: Pushdown, Join Reorder',         min: 20 },
      { n: 10, m: 1, t: 'Cost-Based Optimizer + EXPLAIN + MV',       min: 25 },
      { n: 11, m: 2, t: 'Vì sao transaction đồng thời gây lỗi',      min: 18 },
      { n: 12, m: 2, t: 'S/X Locks — Compatibility Matrix',          min: 18 },
      { n: 13, m: 2, t: '2PL — Growing & Shrinking',                 min: 20 },
      { n: 14, m: 2, t: 'Deadlock + Wait-for Graph',                 min: 20 },
      { n: 15, m: 2, t: 'Multiple Granularity + Intention Lock',     min: 20 },
      { n: 16, m: 2, t: 'Phantom + Index Locking',                   min: 20 },
      { n: 17, m: 2, t: 'Optimistic Concurrency',                    min: 20 },
      { n: 18, m: 2, t: 'MVCC + Snapshot Isolation',                 min: 22 },
      { n: 19, m: 2, t: 'Lost Update + Write Skew + FOR UPDATE',     min: 22 },
      { n: 20, m: 2, t: 'Version Number (User Interaction)',         min: 18 },
      { n: 21, m: 3, t: 'Failure Classification + Storage',          min: 15 },
      { n: 22, m: 3, t: 'Log Records + Commit Point',                min: 18 },
      { n: 23, m: 3, t: 'WAL + Checkpoint + Crash Recovery',         min: 22 },
      { n: 24, m: 3, t: 'ARIES Overview',                            min: 25 },
      { n: 25, m: 3, t: 'Boss Battle — Engine Under Fire', boss: true, min: 35 }
    ]
  }
};

/** Course lesson data (shared with C2 roadmap + C8 hero time) */
var COURSE_LESSONS = [
  // Module 1 — ER Mapping (B1-B7) — 7 bài (was 6; thêm M:N junction)
  { n: 1,  m: 1, t: 'Entity & Primary Key',                       min: 15 },
  { n: 2,  m: 1, t: 'Composite + Multivalued + Derived',         min: 12 },
  { n: 3,  m: 1, t: 'Foreign Key & JOIN',                        min: 15 },
  { n: 4,  m: 1, t: 'Foreign Key & 1:N',                         min: 15 },
  { n: 5,  m: 1, t: 'M:N & Bảng trung gian',                     min: 18 },
  { n: 6,  m: 1, t: 'Weak Entity & Khóa chính tổng hợp',         min: 14 },
  { n: 7,  m: 1, t: 'Mapping ER → Bảng',                         min: 18 },
  // Module 2 — Normalization (B8-B14) — 7 bài (BCNF↔3NF swap; Boss still cuối)
  { n: 8,  m: 2, t: 'Redundancy & Phụ thuộc hàm (FD)',           min: 18 },
  { n: 9,  m: 2, t: '1NF — Nguyên tử hóa',                       min: 15 },
  { n: 10, m: 2, t: '2NF — Phụ thuộc đầy đủ',                    min: 15 },
  { n: 11, m: 2, t: '3NF — Phụ thuộc bắc cầu',                   min: 15 },
  { n: 12, m: 2, t: 'BCNF — Phân rã phi tổn thất',               min: 20 },
  { n: 13, m: 2, t: '4NF — Phụ thuộc đa trị',                    min: 15 },
  { n: 14, m: 2, t: 'Boss Battle — Diễn đàn GuildBoard', boss: true, min: 30 },
  // Module 3 — App Design (B15-B20) — 6 bài (was 5; thêm Web Services)
  { n: 15, m: 3, t: 'JSON trong Relational DB',                  min: 18 },
  { n: 16, m: 3, t: 'Spatial Data & Truy vấn tọa độ',           min: 18 },
  { n: 17, m: 3, t: 'ORM (Django)',                              min: 18 },
  { n: 18, m: 3, t: 'Web Services — REST/AJAX',                  min: 18 },
  { n: 19, m: 3, t: 'SQL Injection',                             min: 18 },
  { n: 20, m: 3, t: 'Password Security',                         min: 20 }
];

/* Áp meta theo course: Basic giữ COURSE_LESSONS gốc; TC/NC lấy từ meta.
 * Hero title/subtitle + <title> tab cũng đổi theo khóa. */
var CD_META = COURSE_PAGE_META[CD_COURSE_ID] || COURSE_PAGE_META.db_design;
if (CD_META.lessons) COURSE_LESSONS = CD_META.lessons;
(function applyCourseHero() {
  var t = document.querySelector('.cd-hero-title');
  var s = document.querySelector('.cd-hero-subtitle');
  if (t) t.textContent = CD_META.heroTitle;
  if (s) s.textContent = CD_META.heroSubtitle;
  document.title = CD_META.heroTitle + ' – Programming EDU';
})();

/** Format minutes → Vietnamese-friendly time string */
function formatCourseTime(totalMin) {
  if (!totalMin || totalMin <= 0) return '—';
  var h = Math.floor(totalMin / 60);
  var m = totalMin % 60;
  if (h === 0) return '~' + m + ' phút';
  if (m === 0) return '~' + h + ' giờ';
  return '~' + h + ' giờ ' + m + ' phút';
}

/** C8-1: Update hero time from lessons.min (sync, runs on page load) */
(function updateHeroTime() {
  var totalMin = COURSE_LESSONS.reduce(function (s, l) { return s + (l.min || 0); }, 0);
  var el = document.getElementById('cd-hero-time');
  if (el) el.textContent = formatCourseTime(totalMin);
})();

/** Determine which modules are completed given a set of completed lesson numbers
 *  (M1: 1-7, M2: 8-14, M3: 15-20 — per curriculum 18→20 renumber) */
function computeModuleCompletion(completedSet) {
  // Generic theo COURSE_LESSONS (mỗi khóa có phân bố module khác nhau)
  var by = { 1: [], 2: [], 3: [] };
  COURSE_LESSONS.forEach(function (l) { by[l.m].push(l.n); });
  var done = function (arr) { return arr.length > 0 && arr.every(function (n) { return completedSet.has(n); }); };
  return { m1: done(by[1]), m2: done(by[2]), m3: done(by[3]) };
}

/** C8-2: Apply progressive unlock to .cd-skill-item based on module completion */
function applySkillUnlocks(completedSet) {
  var skills = document.querySelectorAll('.cd-skill-item');
  if (!skills.length) return;
  var mod = computeModuleCompletion(completedSet);

  // Track stagger index per module (so M1 unlocks animate first, M2 next, etc.)
  var staggerByModule = { 1: 0, 2: 0, 3: 0 };

  skills.forEach(function (el) {
    var m = parseInt(el.dataset.module, 10);
    var unlocked = (m === 1 && mod.m1) || (m === 2 && mod.m2) || (m === 3 && mod.m3);

    el.classList.remove('is-locked', 'is-unlocked');
    if (unlocked) {
      el.classList.add('is-unlocked');
      el.style.setProperty('--i', String(staggerByModule[m]));
      staggerByModule[m] += 1;
    } else {
      el.classList.add('is-locked');
    }
  });
}

/** C8-3: Prereq indicator — green ✓ if user has SQL basics (proxy: enrolled in cpp/java/python) */
function applyPrereqStatus(enrolledList) {
  var hasProgrammingBasics = (enrolledList || []).some(function (e) {
    return e && (e.id === 'cpp' || e.id === 'java' || e.id === 'python');
  });

  var item = document.querySelector('[data-prereq="sql"]');
  if (!item) return;
  var status = item.querySelector('.cd-req-status');
  if (!status) return;

  status.classList.remove('is-unmet', 'is-met');
  if (hasProgrammingBasics) {
    status.classList.add('is-met');
    var icon = status.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-check';
    }
  } else {
    status.classList.add('is-unmet');
    // Keep lock icon (default)
  }
}

/** Shared progress resolver: tries API → localStorage → server fallback */
function resolveUserProgress() {
  return new Promise(function (resolve) {
    fetch('/api/courses-enrolled', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var enrolled = (data && data.enrolled) || [];
        var me = enrolled.find(function (e) { return e.id === 'db_design'; });
        var apiCompletedCount = me ? (me.completedLessons || 0) : 0;
        var serverCurrent = (typeof CURRENT_LESSON_IDX === 'number')
          ? (CURRENT_LESSON_IDX + 1)
          : 1;

        var stored = [];
        try { stored = JSON.parse(localStorage.getItem('pe_progress_db_design') || '[]'); } catch (e) {}
        var completedSet = new Set();
        if (Array.isArray(stored)) {
          stored.forEach(function (n) { if (typeof n === 'number') completedSet.add(n); });
        }
        for (var i = 1; i <= apiCompletedCount; i++) completedSet.add(i);

        var lsMax = 0;
        completedSet.forEach(function (n) { if (n > lsMax) lsMax = n; });
        var currentIdx = Math.max(serverCurrent, lsMax + 1, apiCompletedCount + 1);

        resolve({
          completedSet: completedSet,
          currentIdx: currentIdx,
          enrolledList: enrolled
        });
      })
      .catch(function () {
        // Network error fallback
        var stored = [];
        try { stored = JSON.parse(localStorage.getItem('pe_progress_db_design') || '[]'); } catch (e) {}
        var completedSet = new Set(stored.filter(function (n) { return typeof n === 'number'; }));
        var lsMax = 0;
        completedSet.forEach(function (n) { if (n > lsMax) lsMax = n; });
        var currentIdx = (typeof CURRENT_LESSON_IDX === 'number')
          ? Math.max(CURRENT_LESSON_IDX + 1, lsMax + 1)
          : Math.max(1, lsMax + 1);

        resolve({
          completedSet: completedSet,
          currentIdx: currentIdx,
          enrolledList: []
        });
      });
  });
}

/* ============================================================================
 * C2 — Course Roadmap Visual (Brilliant-style node path)
 * Renders 20 nodes in snake layout, 3 module zones, B14 = boss hexagon.
 * State: backend API (/api/courses-enrolled) → localStorage → CURRENT_LESSON_IDX
 * ========================================================================== */
(function renderRoadmap() {
  var container = document.getElementById('cd-roadmap');
  if (!container) return;

  // Lesson data — use shared COURSE_LESSONS (with .min field for C8 hero time)
  var lessons = COURSE_LESSONS;

  var moduleNames = CD_META.moduleNames;

  // Group by module
  var byModule = { 1: [], 2: [], 3: [] };
  lessons.forEach(function (l) { byModule[l.m].push(l); });

  // Split each module into rows of 3 (snake alternating)
  function splitRows(arr) {
    var rows = [];
    for (var i = 0; i < arr.length; i += 3) {
      rows.push(arr.slice(i, i + 3));
    }
    return rows;
  }

  // Build HTML
  var html = '';
  [1, 2, 3].forEach(function (mIdx) {
    var lessonsM = byModule[mIdx];
    var rows = splitRows(lessonsM);
    html += '<div class="cd-roadmap-module" data-module="' + mIdx + '">';
    html += '<div class="cd-roadmap-module-hd">';
    html += '<span class="cd-roadmap-module-hd-num">MODULE ' + mIdx + '</span>';
    html += '<span class="cd-roadmap-module-hd-name">' + moduleNames[mIdx] + '</span>';
    html += '<span class="cd-roadmap-module-hd-meta">' + lessonsM.length + ' bài</span>';
    html += '</div>';
    rows.forEach(function (row, rowIdx) {
      var reverse = (rowIdx % 2 === 1) ? ' reverse' : '';
      html += '<div class="cd-roadmap-row' + reverse + '">';
      row.forEach(function (lesson) {
        var bossCls = lesson.boss ? ' boss' : '';
        html += '<a href="' + CD_META.lessonBase + '?lesson=' + lesson.n + '" class="cd-roadmap-node js-roadmap-node" data-lesson="' + lesson.n + '" data-module="' + lesson.m + '" data-boss="' + (lesson.boss ? '1' : '0') + '">';
        html += '<div class="cd-roadmap-node-circle' + bossCls + '">';
        html += '<span class="cd-roadmap-node-num">' + lesson.n + '</span>';
        html += '</div>';
        html += '<div class="cd-roadmap-node-title">Bài ' + lesson.n + ': ' + escapeHtml(lesson.t) + '</div>';
        html += '</a>';
      });
      // Pad empty slots for last row if < 3
      for (var p = row.length; p < 3; p++) {
        html += '<div class="cd-roadmap-empty"></div>';
      }
      html += '</div>';
    });
    html += '</div>';
  });
  container.innerHTML = html;

  // Fetch progress: try API first, fallback localStorage, fallback server CURRENT_LESSON_IDX
  function applyStates(completedSet, currentIdx) {
    var nodes = container.querySelectorAll('.js-roadmap-node');
    nodes.forEach(function (node) {
      var n = parseInt(node.dataset.lesson, 10);
      node.classList.remove('completed', 'current', 'locked');
      if (completedSet.has(n)) {
        node.classList.add('completed');
      } else if (n === currentIdx) {
        node.classList.add('current');
      } else if (n < currentIdx) {
        // Server says they're at currentIdx, so earlier = completed
        node.classList.add('completed');
      } else {
        node.classList.add('locked');
        node.removeAttribute('href');
      }
    });
  }

  // C8: Use shared progress resolver + apply skills + prereq
  resolveUserProgress().then(function (progress) {
    applyStates(progress.completedSet, progress.currentIdx);
    applySkillUnlocks(progress.completedSet);     // C8-2: progressive unlock
    applyPrereqStatus(progress.enrolledList);     // C8-3: prereq indicator
  });

  // Save lesson as completed when user clicks (best-effort, local only)
  container.addEventListener('click', function (e) {
    var node = e.target.closest('.js-roadmap-node');
    if (!node) return;
    var n = parseInt(node.dataset.lesson, 10);
    try {
      var stored = JSON.parse(localStorage.getItem('pe_progress_db_design') || '[]');
      if (!stored.includes(n)) stored.push(n);
      localStorage.setItem('pe_progress_db_design', JSON.stringify(stored));
    } catch (e) {}
  });
})();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function goLesson() {
  var el = document.getElementById('current-lesson');
  if (el) { el.click(); return; }
  window.location = LESSON_URL + '?lesson=' + (CURRENT_LESSON_IDX + 1);
}

// Scroll đến bài học hiện tại
(function() {
  var el = document.getElementById('current-lesson');
  if (el) {
    // Mở module chứa bài học hiện tại
    var moduleBody = el.closest('.cd-module-body');
    if (moduleBody) {
      moduleBody.classList.add('open');
      moduleBody.previousElementSibling.classList.add('open');
    }
    setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500);
  }
})();

function enroll() {
  var btn = document.getElementById('enroll-btn');
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  fetch('/api/courses/' + COURSE_ID + '/enroll', {
    method: 'POST',
    headers: { 'X-CSRFToken': document.querySelector('meta[name=csrf-token]').content }
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok) window.location.reload();
    else {
      btn.disabled = false;
      btn.textContent = 'Đăng ký ngay – Miễn phí';
      alert(d.error || 'Lỗi, thử lại.');
    }
  })
  .catch(function() {
    btn.disabled = false;
    btn.textContent = 'Đăng ký ngay – Miễn phí';
  });
}

function unenroll() {
  if (!confirm('Bạn có chắc muốn hủy đăng ký khóa học Database Design?\nToàn bộ tiến độ sẽ bị xóa.')) return;
  var btn = document.getElementById('unenroll-btn');
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  fetch('/api/courses/' + COURSE_ID + '/enroll', {
    method: 'DELETE',
    headers: { 'X-CSRFToken': document.querySelector('meta[name=csrf-token]').content }
  })
  .then(function(r) { return r.json(); })
  .then(function(d) {
    if (d.ok) window.location.reload();
    else { btn.disabled = false; btn.textContent = 'Hủy đăng ký'; }
  })
  .catch(function() { btn.disabled = false; btn.textContent = 'Hủy đăng ký'; });
}

(function() {
  function applyTheme(isDark) {
    document.body.classList.toggle('dark', isDark);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  }
  window.toggleTheme = function() {
    var isDark = !document.body.classList.contains('dark');
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
  applyTheme(localStorage.getItem('theme') === 'dark');
})();

function toggleUserMenu() {
  var wrap = document.getElementById('user-chip-wrap');
  var btn  = document.getElementById('user-chip-btn');
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

document.addEventListener('click', function(e) {
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

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var btn = document.getElementById('user-chip-btn');
    var menu = document.getElementById('user-dropdown');
    if (menu) { menu.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    closeBellPanel();
  }
});

var _bellNotifs = [
  { icon: '🗄️', text: 'Khóa học Database Design vừa được thêm mới!', time: 'Vừa xong', unread: true },
  { icon: '🔥', text: 'Streak 7 ngày liên tiếp! Tiếp tục phát huy nhé!', time: '2 giờ trước', unread: true },
  { icon: '🏅', text: 'Bạn đã đạt huy hiệu "Người mới bắt đầu". Chúc mừng!', time: '3 ngày trước', unread: false },
];

function _renderBellItems() {
  var body = document.getElementById('bell-panel-body');
  if (!body) return;
  body.innerHTML = _bellNotifs.map(function(n, i) {
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
  dot.style.display = _bellNotifs.some(function(n) { return n.unread; }) ? '' : 'none';
}

function toggleBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn   = document.getElementById('bell-btn');
  var open  = panel.classList.contains('open');
  if (open) { panel.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  else { _renderBellItems(); panel.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

function closeBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn   = document.getElementById('bell-btn');
  if (panel) panel.classList.remove('open');
  if (btn)   btn.setAttribute('aria-expanded', 'false');
}

function readBellItem(idx) {
  if (_bellNotifs[idx]) { _bellNotifs[idx].unread = false; _renderBellItems(); _updateBellDot(); }
}

function markAllBellRead() {
  _bellNotifs.forEach(function(n) { n.unread = false; });
  _renderBellItems(); _updateBellDot();
}

/* ── Interactive Star Rating ── */
(function () {
  var fillEl = document.querySelector('.star-avg-fill');
  if (fillEl) fillEl.style.width = (fillEl.dataset.fill || 0) + '%';

  var container = document.getElementById('starInteractive');
  var rateVal   = document.getElementById('userRateVal');
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
      if (val >= n)            star.classList.add('star-full');
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
