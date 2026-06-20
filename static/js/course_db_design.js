// Cập nhật trạng thái bài học dựa trên tiến độ
(function updateLessonStatuses() {
  const completed = CURRENT_LESSON_IDX;
  const allLessons = document.querySelectorAll('.cd-lesson');
  allLessons.forEach(function(lesson, idx) {
    const icon = lesson.querySelector('.cd-lesson-icon');
    const title = lesson.querySelector('.cd-lesson-title');
    lesson.classList.remove('done', 'current', 'locked');
    if (idx < completed) {
      lesson.classList.add('done');
      icon.textContent = '✓';
      lesson.style.cursor = 'pointer';
      lesson.onclick = function() { window.location = LESSON_URL + '?lesson=' + idx; };
    } else if (idx === completed && completed > 0) {
      lesson.classList.add('current');
      icon.textContent = '▶';
      lesson.id = 'current-lesson';
      lesson.style.cursor = 'pointer';
      lesson.onclick = function() { window.location = LESSON_URL + '?lesson=' + idx; };
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

function goLesson() {
  var el = document.getElementById('current-lesson');
  if (el) { el.click(); return; }
  window.location = LESSON_URL + '?lesson=' + CURRENT_LESSON_IDX;
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
