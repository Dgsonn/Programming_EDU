var API = '/api';

var courses         = [];
var enrolledCourses = [];
var activeFilter    = "all";
var searchQuery     = "";

// Bảng liên kết khóa học → trang bài học
var COURSE_URLS = {
  'cpp':     '/giaodien',
  'python':  '/lesson/python',
  'java':    '/lesson/java',
  'htmlcss': '/lesson/htmlcss',
};

var pageLabels = {
  dashboard: "Dashboard",
  courses:   "Khóa học",
  roadmap:   "Lộ trình",
  settings:  "Cài đặt"
};

var ROADMAPS = [
  {
    id: 'frontend', title: 'Frontend Web', icon: '🌐', color: '#4A9EE0',
    phases: [
      { name: 'Nền tảng',    items: ['HTML5 cơ bản', 'CSS3 & Flexbox', 'CSS Grid', 'Responsive Design'] },
      { name: 'JavaScript',  items: ['JS cơ bản', 'DOM & Events', 'ES6+', 'Async/Await', 'Fetch API'] },
      { name: 'Framework',   items: ['React cơ bản', 'React Hooks', 'React Router', 'State Management'] },
      { name: 'Triển khai',  items: ['Git & GitHub', 'Vite / Webpack', 'Testing cơ bản', 'Deploy Vercel'] }
    ]
  },
  {
    id: 'backend', title: 'Backend', icon: '⚙️', color: '#E84545',
    phases: [
      { name: 'Ngôn ngữ',   items: ['Python hoặc Java', 'OOP cơ bản', 'Xử lý file & JSON', 'Regex'] },
      { name: 'Database',   items: ['SQL cơ bản', 'SQLite / PostgreSQL', 'ORM (SQLAlchemy)', 'Migrations'] },
      { name: 'API',        items: ['REST API', 'Flask / Spring Boot', 'Authentication & JWT', 'CORS'] },
      { name: 'DevOps',     items: ['Linux cơ bản', 'Docker cơ bản', 'Nginx', 'Deploy VPS'] }
    ]
  },
  {
    id: 'python', title: 'Python & AI', icon: '🤖', color: '#10B981',
    phases: [
      { name: 'Python',     items: ['Cú pháp cơ bản', 'List / Dict / Set', 'OOP Python', 'Thư viện chuẩn'] },
      { name: 'Data',       items: ['NumPy', 'Pandas', 'Matplotlib', 'Jupyter Notebook'] },
      { name: 'ML cơ bản', items: ['Scikit-learn', 'Linear Regression', 'Classification', 'Đánh giá model'] },
      { name: 'Deep Learning', items: ['Neural Network', 'TensorFlow / PyTorch', 'CNN / RNN', 'LLM & Prompt'] }
    ]
  },
  {
    id: 'cpp', title: 'C/C++ Systems', icon: '💻', color: '#F59E0B',
    phases: [
      { name: 'C cơ bản',   items: ['Biến & Kiểu dữ liệu', 'Vòng lặp & Điều kiện', 'Hàm & Con trỏ', 'Mảng & String'] },
      { name: 'C nâng cao', items: ['Quản lý bộ nhớ', 'Struct & Enum', 'File I/O', 'Linked List'] },
      { name: 'C++ OOP',    items: ['Class & Object', 'Kế thừa', 'Polymorphism', 'Template'] },
      { name: 'Ứng dụng',   items: ['STL (vector, map)', 'Thuật toán cơ bản', 'Embedded cơ bản', 'Dự án thực tế'] }
    ]
  }
];

var activeRoadmap  = 'frontend';
var doneItems      = {};

/* ── Handle 401 (chưa đăng nhập) ── */
function handleFetch(r) {
  if (r.status === 401) { window.location = '/login'; return null; }
  return r.json();
}

/* ── Navigation ── */
function navigate(page) {
  document.querySelectorAll(".page").forEach(function(p) { p.classList.remove("active"); });
  var target = document.getElementById("page-" + page) || document.getElementById("page-dashboard");
  target.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(function(b) {
    b.classList.remove("active");
    var ch = b.querySelector(".nav-chevron");
    if (ch) ch.remove();
  });
  var active = document.querySelector(".nav-btn[data-page='" + page + "']");
  if (active) {
    active.classList.add("active");
    var ch = document.createElement("span");
    ch.className = "nav-chevron";
    ch.textContent = "›";
    active.appendChild(ch);
  }

  document.getElementById("topbar-title").textContent = pageLabels[page] || "Dashboard";

  // Chỉ hiện search bar ở trang Khóa học
  var sw = document.getElementById("search-wrap");
  if (sw) sw.style.visibility = (page === "courses") ? "visible" : "hidden";
}

/* ── Course rendering ── */
function renderCourses() {
  var grid  = document.getElementById("courses-grid");
  var empty = document.getElementById("empty-state");
  var q = searchQuery.toLowerCase();

  var filtered = courses.filter(function(c) {
    var matchSearch = c.title.toLowerCase().indexOf(q) >= 0 || c.description.toLowerCase().indexOf(q) >= 0;
    var matchFilter = activeFilter === "all" ||
                      (activeFilter === "enrolled"     && c.enrolled) ||
                      (activeFilter === "not-enrolled" && !c.enrolled);
    return matchSearch && matchFilter;
  });

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = filtered.map(function(c) {
    return [
      '<div class="course-card" onmouseenter="hoverCard(this,\'' + c.color + '\')" onmouseleave="unhoverCard(this)">',
        '<div class="card-img-wrap">',
          '<img src="/' + c.image + '" alt="' + c.title + '" />',
          '<div class="card-overlay"></div>',
          '<div class="badge-level" style="background:linear-gradient(135deg,' + c.color + ',' + c.accentColor + ')">' + c.level + '</div>',
          c.enrolled ? '<div class="badge-enrolled">Đã đăng ký</div>' : '',
          '<div class="card-title-overlay">',
            '<div class="card-tag">' + c.tag + '</div>',
            '<h3>' + c.title + '</h3>',
          '</div>',
        '</div>',
        '<div class="card-body">',
          '<div class="card-desc">' + c.description + '</div>',
          '<div class="card-stats">',
            '<span class="card-stat">⏱ ' + c.duration + '</span>',
            '<span class="card-stat">👥 ' + c.students + '</span>',
            '<span class="card-stat"><span class="star">★</span> <span class="rating">' + c.rating + '</span></span>',
          '</div>',
          '<div class="card-footer">',
            '<span class="card-lessons">📖 ' + c.lessons + ' bài học</span>',
            (function() {
              if (c.enrolled) {
                var goUrl = COURSE_URLS[c.id] || '#';
                return '<div style="display:flex;align-items:center;gap:6px">' +
                  '<button class="cta-btn"' +
                    ' onclick="window.location=\'' + goUrl + '\'"' +
                    ' onmouseenter="ctaHover(this,\'' + c.color + '\',\'' + c.accentColor + '\')"' +
                    ' onmouseleave="ctaLeave(this)">Tiếp tục học →</button>' +
                  '<button title="Hủy đăng ký"' +
                    ' onclick="unenroll(\'' + c.id + '\',\'' + c.title.replace(/'/g, "\\'") + '\')"' +
                    ' style="width:34px;height:34px;border-radius:10px;border:1px solid #E5E7EB;background:none;cursor:pointer;font-size:14px;color:#9CA3AF;transition:all 0.2s;flex-shrink:0"' +
                    ' onmouseenter="this.style.background=\'#FEF2F2\';this.style.borderColor=\'#FCA5A5\';this.style.color=\'#EF4444\'"' +
                    ' onmouseleave="this.style.background=\'none\';this.style.borderColor=\'#E5E7EB\';this.style.color=\'#9CA3AF\'">✕</button>' +
                '</div>';
              }
              return '<button class="cta-btn"' +
                ' onclick="toggleEnroll(\'' + c.id + '\',false)"' +
                ' onmouseenter="ctaHover(this,\'' + c.color + '\',\'' + c.accentColor + '\')"' +
                ' onmouseleave="ctaLeave(this)">Đăng ký →</button>';
            })(),
          '</div>',
        '</div>',
      '</div>'
    ].join("");
  }).join("");
}

/* ── My Courses rendering ── */
function renderMyCourses() {
  var container = document.getElementById("enrolled-list");
  if (!enrolledCourses.length) {
    container.innerHTML = '<p style="color:#9CA3AF;font-size:14px;padding:24px 0">Bạn chưa đăng ký khóa học nào. <a href="#" onclick="navigate(\'courses\')" style="color:#4A9EE0">Khám phá khóa học →</a></p>';
    return;
  }
  container.innerHTML = enrolledCourses.map(function(c) {
    return [
      '<div class="enrolled-card"',
        ' onmouseenter="this.style.boxShadow=\'0 12px 30px ' + c.color + '30\';this.style.borderColor=\'' + c.color + '30\'"',
        ' onmouseleave="this.style.boxShadow=\'0 2px 12px rgba(0,0,0,0.04)\';this.style.borderColor=\'#F3F4F6\'">',
        '<div class="enrolled-top">',
          '<div class="enrolled-left">',
            '<div class="enrolled-icon" style="background:linear-gradient(135deg,' + c.color + '20,' + c.accentColor + '10);border:2px solid ' + c.color + '30">' + c.icon + '</div>',
            '<div class="enrolled-info">',
              '<h3>' + c.title + '</h3>',
              '<div class="subtitle">' + c.subtitle + '</div>',
              '<div class="enrolled-meta">',
                '<span>✅ ' + c.completedLessons + '/' + c.totalLessons + ' bài</span>',
                '<span>⏰ ' + c.timeSpent + ' / ' + c.duration + '</span>',
              '</div>',
            '</div>',
          '</div>',
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px">',
            '<button class="continue-btn"' +
              ' style="background:linear-gradient(135deg,' + c.color + ',' + c.accentColor + ');box-shadow:0 4px 12px ' + c.color + '40"' +
              (COURSE_URLS[c.id] ? ' onclick="window.location=\'' + COURSE_URLS[c.id] + '\'"' : '') +
              '>▶ Tiếp tục học</button>',
            '<button onclick="unenroll(\'' + c.id + '\',\'' + c.title.replace(/'/g, "\\'") + '\')"' +
              ' style="background:none;border:1px solid #E5E7EB;color:#9CA3AF;font-size:12px;font-weight:600;cursor:pointer;padding:6px 14px;border-radius:10px;transition:all 0.2s;white-space:nowrap"' +
              ' onmouseenter="this.style.borderColor=\'#FCA5A5\';this.style.color=\'#EF4444\';this.style.background=\'#FEF2F2\'"' +
              ' onmouseleave="this.style.borderColor=\'#E5E7EB\';this.style.color=\'#9CA3AF\';this.style.background=\'none\'">',
              '✕ Hủy đăng ký',
            '</button>',
          '</div>',
        '</div>',
        '<div class="prog-section">',
          '<div class="prog-label"><span>Tiến độ hoàn thành</span><span style="color:' + c.color + ';font-weight:700">' + c.progress + '%</span></div>',
          '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' + c.progress + '%;background:linear-gradient(90deg,' + c.color + ',' + c.accentColor + ');box-shadow:0 0 8px ' + c.color + '60"></div></div>',
        '</div>',
        '<div class="lesson-grid">',
          '<div class="lesson-box" style="background:#F9FAFB;border:1px solid #F3F4F6"><div class="lbl">Bài học gần nhất</div><div class="val">' + c.lastLesson + '</div></div>',
          '<div class="lesson-box" style="background:' + c.color + '08;border:1px solid ' + c.color + '20"><div class="lbl">Bài tiếp theo</div><div class="val" style="color:' + c.color + '">' + c.nextLesson + '</div></div>',
        '</div>',
      '</div>'
    ].join("");
  }).join("");
}

/* ── Progress section on Dashboard ── */
function renderProgress() {
  var grid = document.getElementById("progress-grid");
  if (!grid) return;
  if (!enrolledCourses.length) {
    grid.innerHTML = '<p style="color:#9CA3AF;font-size:14px">Chưa đăng ký khóa học nào.</p>';
    return;
  }
  grid.innerHTML = enrolledCourses.map(function(c) {
    return [
      '<div class="progress-row">',
        '<div class="prog-icon" style="background:' + c.color + '15">' + c.icon + '</div>',
        '<div class="prog-bar-wrap">',
          '<div class="prog-header">',
            '<span class="prog-name">' + c.title + '</span>',
            '<span class="prog-pct" style="color:' + c.color + '">' + c.progress + '%</span>',
          '</div>',
          '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' + c.progress + '%;background:linear-gradient(90deg,' + c.color + ',' + c.accentColor + ')"></div></div>',
        '</div>',
      '</div>'
    ].join("");
  }).join("");
}

/* ── Enroll / Unenroll ── */
function toggleEnroll(courseId, isEnrolled) {
  var method = isEnrolled ? 'DELETE' : 'POST';
  fetch(API + '/courses/' + courseId + '/enroll', { method: method })
    .then(handleFetch)
    .then(function(d) { if (d) loadAll(); })
    .catch(function(err) { console.error('Lỗi đăng ký:', err); });
}

var pendingUnenrollId = null;

function unenroll(courseId, courseTitle) {
  pendingUnenrollId = courseId;
  document.getElementById('unenroll-course-name').textContent = '"' + courseTitle + '"';
  document.getElementById('unenrollModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUnenrollModal() {
  document.getElementById('unenrollModal').classList.remove('active');
  document.body.style.overflow = '';
  pendingUnenrollId = null;
}

function handleUnenrollOverlayClick(e) {
  if (e.target === document.getElementById('unenrollModal')) closeUnenrollModal();
}

function confirmUnenroll() {
  if (!pendingUnenrollId) return;
  var courseId = pendingUnenrollId;
  closeUnenrollModal();
  fetch(API + '/courses/' + courseId + '/enroll', { method: 'DELETE' })
    .then(handleFetch)
    .then(function(d) { if (d) loadAll(); })
    .catch(function(err) { console.error('Lỗi hủy đăng ký:', err); });
}

/* ── Filters & search ── */
function filterCourses() {
  searchQuery = document.getElementById("search-input").value;
  renderCourses();
}

function setFilter(btn, filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
  btn.classList.add("active");
  renderCourses();
}

/* ── Toggle switches ── */
function toggleSwitch(btn) { btn.classList.toggle("on"); }

/* ── Hover helpers ── */
function hoverStat(el, color) {
  el.style.boxShadow   = "0 8px 24px " + color + "25";
  el.style.borderColor = color + "40";
}
function unhoverStat(el) {
  el.style.boxShadow   = "0 2px 8px rgba(0,0,0,0.04)";
  el.style.borderColor = "#F3F4F6";
}
function hoverCard(el, color)  { el.style.borderColor = color + "40"; }
function unhoverCard(el)       { el.style.borderColor = "#F3F4F6"; }
function ctaHover(btn, c, ac)  { btn.style.background = "linear-gradient(135deg," + c + "," + ac + ")"; btn.style.color = "#fff"; btn.style.boxShadow = "0 4px 12px " + c + "50"; }
function ctaLeave(btn)         { btn.style.background = "#F3F4F6"; btn.style.color = "#6B7280"; btn.style.boxShadow = "none"; }

/* ── DOM helpers ── */
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function setVal(id, val)  { var el = document.getElementById(id); if (el) el.value = val; }
function setToggle(id, on) {
  var el = document.getElementById(id);
  if (!el) return;
  if (on) el.classList.add('on'); else el.classList.remove('on');
}

/* ── Save settings ── */
function saveSettings() {
  var userData = {
    name:     document.getElementById("field-name").value,
    email:    document.getElementById("field-email").value,
    phone:    document.getElementById("field-phone").value,
    birthday: document.getElementById("field-birthday").value
  };
  var notifData = {
    emailNotif:    document.getElementById('toggle-email').classList.contains('on'),
    pushNotif:     document.getElementById('toggle-push').classList.contains('on'),
    studyRemind:   document.getElementById('toggle-remind').classList.contains('on'),
    contentUpdate: document.getElementById('toggle-content').classList.contains('on')
  };
  Promise.all([
    fetch(API + '/user', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }),
    fetch(API + '/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notifData) })
  ])
    .then(function() { loadUser(); alert('Đã lưu thay đổi!'); })
    .catch(function(err) { console.error('Lỗi lưu:', err); });
}

/* ── Change password ── */
function changePassword() {
  var current = prompt('Nhập mật khẩu hiện tại:');
  if (!current) return;
  var newPw = prompt('Nhập mật khẩu mới:');
  if (!newPw) return;
  if (prompt('Nhập lại mật khẩu mới:') !== newPw) { alert('Mật khẩu mới không khớp!'); return; }
  fetch(API + '/user/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current: current, new: newPw })
  })
    .then(handleFetch)
    .then(function(res) { if (res) { if (res.ok) alert('Đổi mật khẩu thành công!'); else alert('Lỗi: ' + res.error); } })
    .catch(function(err) { console.error('Lỗi:', err); });
}

/* ── API loaders ── */
function loadUser() {
  fetch(API + '/user')
    .then(handleFetch)
    .then(function(u) {
      if (!u) return;
      setText('sidebar-name', u.name.split(' ').slice(-1)[0]);
      setText('sidebar-role', u.role);
      setText('banner-name', u.name.split(' ').slice(-1)[0]);
      setText('chip-name', u.name.split(' ').slice(-1)[0]);
      setText('settings-profile-name', u.name);
      setText('settings-profile-email', u.email);
      setVal('field-name', u.name);
      setVal('field-email', u.email);
      setVal('field-phone', u.phone || '');
      setVal('field-birthday', u.birthday || '');
    });
}

function loadCourses() {
  return fetch(API + '/courses')
    .then(handleFetch)
    .then(function(data) { if (data) { courses = data; renderCourses(); } });
}

function loadEnrolled() {
  return fetch(API + '/enrolled')
    .then(handleFetch)
    .then(function(data) { if (data) { enrolledCourses = data; renderMyCourses(); renderProgress(); } });
}

function loadStats() {
  return fetch(API + '/stats')
    .then(handleFetch)
    .then(function(s) {
      if (!s) return;
      setText('stat-enrolled', s.enrolledCount);
      setText('stat-total-hours', s.totalHours);
      setText('stat-streak', s.streakDays + ' ngày');
      setText('stat-certificates', s.certificates);
      setText('my-stat-count', s.enrolledCount);
      setText('my-stat-hours', s.totalHours);
      setText('my-stat-avg', s.avgProgress + '%');
    });
}

function loadNotifications() {
  return fetch(API + '/notifications')
    .then(handleFetch)
    .then(function(n) {
      if (!n) return;
      setToggle('toggle-email',   n.emailNotif);
      setToggle('toggle-push',    n.pushNotif);
      setToggle('toggle-remind',  n.studyRemind);
      setToggle('toggle-content', n.contentUpdate);
    });
}

function loadAll() {
  loadUser();
  loadStats();
  loadCourses();
  loadEnrolled();
  loadNotifications();
  loadRoadmap();
}

/* ── Roadmap ── */
function loadRoadmap() {
  fetch(API + '/roadmap')
    .then(handleFetch)
    .then(function(data) {
      if (!data) return;
      doneItems = {};
      data.doneItems.forEach(function(id) { doneItems[id] = true; });
      renderRoadmapTabs();
      renderRoadmap();
    });
}

function renderRoadmapTabs() {
  var tabs = document.getElementById('roadmap-tabs');
  if (!tabs) return;
  tabs.innerHTML = ROADMAPS.map(function(r) {
    var active = r.id === activeRoadmap ? ' active' : '';
    return '<button class="filter-btn' + active + '" onclick="switchRoadmap(\'' + r.id + '\')">' +
           r.icon + ' ' + r.title + '</button>';
  }).join('');
}

function switchRoadmap(id) {
  activeRoadmap = id;
  renderRoadmapTabs();
  renderRoadmap();
}

function renderRoadmap() {
  var container = document.getElementById('roadmap-content');
  if (!container) return;
  var rm = ROADMAPS.find(function(r) { return r.id === activeRoadmap; });
  if (!rm) return;

  var totalItems = rm.phases.reduce(function(s, p) { return s + p.items.length; }, 0);
  var doneCount  = rm.phases.reduce(function(s, p) {
    return s + p.items.filter(function(item) { return doneItems[rm.id + ':' + item]; }).length;
  }, 0);
  var pct = totalItems ? Math.round(doneCount / totalItems * 100) : 0;

  var html = '<div style="margin-bottom:20px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<span style="font-size:14px;color:#6B7280">Tiến độ tổng thể</span>' +
      '<span style="font-weight:700;color:' + rm.color + '">' + pct + '%</span>' +
    '</div>' +
    '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + rm.color + ',#888);transition:width 0.4s"></div></div>' +
  '</div>';

  html += '<div class="roadmap-grid">';
  rm.phases.forEach(function(phase, pi) {
    var phDone = phase.items.filter(function(item) { return doneItems[rm.id + ':' + item]; }).length;
    html += '<div class="roadmap-phase">' +
      '<div class="roadmap-phase-header" style="border-left:3px solid ' + rm.color + '">' +
        '<div>' +
          '<div class="roadmap-phase-title">Giai đoạn ' + (pi + 1) + ': ' + phase.name + '</div>' +
          '<div class="roadmap-phase-sub">' + phDone + '/' + phase.items.length + ' hoàn thành</div>' +
        '</div>' +
        '<div class="roadmap-phase-pct" style="color:' + rm.color + '">' + Math.round(phDone / phase.items.length * 100) + '%</div>' +
      '</div>';

    phase.items.forEach(function(item) {
      var itemId = rm.id + ':' + item;
      var done   = !!doneItems[itemId];
      html += '<div class="roadmap-item' + (done ? ' done' : '') + '" onclick="toggleRoadmapItem(\'' + itemId + '\')">' +
        '<div class="roadmap-check" style="' + (done ? 'background:' + rm.color + ';border-color:' + rm.color : '') + '">' +
          (done ? '✓' : '') +
        '</div>' +
        '<span>' + item + '</span>' +
      '</div>';
    });

    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function toggleRoadmapItem(itemId) {
  doneItems[itemId] = !doneItems[itemId];
  renderRoadmap();
  fetch(API + '/roadmap/' + encodeURIComponent(itemId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: doneItems[itemId] })
  }).then(handleFetch).catch(function(e) { console.error(e); });
}

/* ── Dynamic date ── */
function updateDate() {
  var days   = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  var months = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
                'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12'];
  var now = new Date();
  var el  = document.querySelector('.topbar .sub');
  if (el) el.textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ', ' + now.getFullYear();
}

/* ── Dark / Light mode ── */
function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
  var isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function() {
  applyTheme(localStorage.getItem('theme') === 'dark');
  updateDate();
  loadAll();
});

/* -- giaodien -- */
  let currentDrag = null;
  const draggables = document.querySelectorAll('.logic-card');
  const zones = document.querySelectorAll('.drop-target');

        draggables.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      currentDrag = card;
      card.style.opacity = '0.4';
      card.style.transform = 'scale(0.9)';
    });
            card.addEventListener('dragend', () => {
    card.style.opacity = '1';
  card.style.transform = 'scale(1)';
            });
        });

        zones.forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('hovering');
    });
            zone.addEventListener('dragleave', () => {
    zone.classList.remove('hovering');
            });
            zone.addEventListener('drop', (e) => {
    zone.classList.remove('hovering');
  zone.classList.add('filled');

  const val = currentDrag.innerText;
  const codeVal = currentDrag.getAttribute('data-val');

  // Hiển thị khối lệnh vào ô thả
  zone.innerHTML = `<div class="logic-card ${currentDrag.classList.contains('block-blue') ? 'block-blue' : 'block-orange'} !m-0 !shadow-none !border-none !py-1 !px-4 text-sm">${val}</div>`;

  // Update Compiler UI
  if(zone.id === 'zone-cond') {
                    const target = document.getElementById('code-cond');
  target.innerText = codeVal;
  target.classList.remove('text-white/20');
  target.classList.add('text-orange-400', 'bg-orange-500/10');
                }
  if(zone.id === 'zone-act') {
                    const target = document.getElementById('code-act');
  target.innerText = codeVal;
  target.classList.remove('text-white/20');
  target.classList.add('text-brand-secondary', 'bg-blue-500/10');
                }
            });
        });

  function runMission() {
            const cond = document.getElementById('code-cond').innerText;
  const act = document.getElementById('code-act').innerText;
  const output = document.getElementById('output-text');
  const hint = document.getElementById('hint-box');

  if(cond === 'pin < 20' && act === 'charge()') {
    output.innerHTML = "<span class='text-green-400 font-bold'>> [OK] Pin đang ở mức 15%. Robot đang di chuyển về trạm sạc... VROOM VROOM!</span>";
  confetti({
    particleCount: 150,
  spread: 70,
  origin: {y: 0.6 },
  colors: ['#58CC02', '#1CB0F6', '#FF4B4B']
                });
                setTimeout(() => {
    document.getElementById('success-modal').classList.remove('hidden');
                }, 1000);
            } else if (cond === '________' || act === '________') {
    output.innerHTML = "<span class='text-yellow-400'>> [Hệ thống] Bạn chưa lấp đầy các ô trống kìa!</span>";
            } else {
    output.innerHTML = "<span class='text-red-400'>> [LỖI] Ối! Pin đang yếu mà bạn bắt Robot đi ngủ/tắt nguồn là hỏng đấy. Thử lại nhé!</span>";
  hint.innerText = "Gợi ý: Hãy chọn 'Pin < 20' và 'Về trạm sạc'!";
  hint.classList.remove('text-white/30');
  hint.classList.add('text-red-400');
            }
        }

  function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
        }
