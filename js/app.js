var API = 'http://localhost:5000/api';

var activeFilter = "all";
var searchQuery  = "";

var pageLabels = {
  dashboard:   "Dashboard",
  courses:     "Khóa học",
  "my-courses": "Khóa học của tôi",
  settings:    "Cài đặt"
};

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
          '<img src="' + c.image + '" alt="' + c.title + '" />',
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
            '<button class="cta-btn"',
              ' onclick="toggleEnroll(\'' + c.id + '\',' + c.enrolled + ')"',
              ' onmouseenter="ctaHover(this,\'' + c.color + '\',\'' + c.accentColor + '\')"',
              ' onmouseleave="ctaLeave(this)">',
              (c.enrolled ? 'Tiếp tục học' : 'Đăng ký') + ' →',
            '</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join("");
  }).join("");
}

/* ── My Courses rendering ── */
function renderMyCourses() {
  var container = document.getElementById("enrolled-list");
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
          '<button class="continue-btn" style="background:linear-gradient(135deg,' + c.color + ',' + c.accentColor + ');box-shadow:0 4px 12px ' + c.color + '40">▶ Tiếp tục học</button>',
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
    .then(function(r) { return r.json(); })
    .then(function() { loadAll(); })
    .catch(function(err) { console.error('Lỗi đăng ký:', err); });
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
  el.style.boxShadow  = "0 8px 24px " + color + "25";
  el.style.borderColor = color + "40";
}
function unhoverStat(el) {
  el.style.boxShadow  = "0 2px 8px rgba(0,0,0,0.04)";
  el.style.borderColor = "#F3F4F6";
}
function hoverCard(el, color)  { el.style.borderColor = color + "40"; }
function unhoverCard(el)       { el.style.borderColor = "#F3F4F6"; }
function ctaHover(btn, c, ac)  { btn.style.background = "linear-gradient(135deg," + c + "," + ac + ")"; btn.style.color = "#fff"; btn.style.boxShadow = "0 4px 12px " + c + "50"; }
function ctaLeave(btn)         { btn.style.background = "#F3F4F6"; btn.style.color = "#6B7280"; btn.style.boxShadow = "none"; }

/* ── Update DOM helpers ── */
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = val;
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
    fetch(API + '/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
    fetch(API + '/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifData)
    })
  ])
    .then(function() {
      loadUser();
      alert('Đã lưu thay đổi!');
    })
    .catch(function(err) { console.error('Lỗi lưu:', err); });
}

/* ── Change password ── */
function changePassword() {
  var current = prompt('Nhập mật khẩu hiện tại:');
  if (!current) return;
  var newPw = prompt('Nhập mật khẩu mới:');
  if (!newPw) return;
  var confirm = prompt('Nhập lại mật khẩu mới:');
  if (newPw !== confirm) { alert('Mật khẩu mới không khớp!'); return; }
  fetch(API + '/user/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current: current, new: newPw })
  })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.ok) alert('Đổi mật khẩu thành công!');
      else alert('Lỗi: ' + res.error);
    })
    .catch(function(err) { console.error('Lỗi đổi mật khẩu:', err); });
}

/* ── API loaders ── */
function loadUser() {
  fetch(API + '/user')
    .then(function(r) { return r.json(); })
    .then(function(u) {
      setText('sidebar-name', u.name.split(' ').slice(-1)[0]);
      setText('sidebar-role', u.role);
      setText('banner-name', u.name.split(' ').slice(-1)[0]);
      setText('chip-name', u.name.split(' ').slice(-1)[0]);
      setText('settings-profile-name', u.name);
      setText('settings-profile-email', u.email);
      setVal('field-name', u.name);
      setVal('field-email', u.email);
      setVal('field-phone', u.phone);
      setVal('field-birthday', u.birthday);
    })
    .catch(function(err) { console.error('Lỗi tải user:', err); });
}

function loadCourses() {
  return fetch(API + '/courses')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      courses = data;
      renderCourses();
    });
}

function loadEnrolled() {
  return fetch(API + '/enrolled')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      enrolledCourses = data;
      renderMyCourses();
      renderProgress();
    });
}

function loadStats() {
  return fetch(API + '/stats')
    .then(function(r) { return r.json(); })
    .then(function(s) {
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
    .then(function(r) { return r.json(); })
    .then(function(n) {
      setToggle('toggle-email',   n.emailNotif);
      setToggle('toggle-push',    n.pushNotif);
      setToggle('toggle-remind',  n.studyRemind);
      setToggle('toggle-content', n.contentUpdate);
    });
}

function setToggle(id, on) {
  var el = document.getElementById(id);
  if (!el) return;
  if (on) el.classList.add('on'); else el.classList.remove('on');
}

function loadAll() {
  loadUser();
  loadStats();
  loadCourses();
  loadEnrolled();
  loadNotifications();
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function() {
  loadAll();
});
