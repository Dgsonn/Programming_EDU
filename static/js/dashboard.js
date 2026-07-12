/* ═══════════════════════════════════════════════════════
   dashboard.js — tất cả JS riêng cho dashboard.html
   ═══════════════════════════════════════════════════════ */

/* Lớp bảo vệ độc lập: đảm bảo trang Roadmap/Skills luôn được khởi tạo
   khi điều hướng tới, kể cả khi 1 đoạn code khác phía dưới trong file
   này lỗi (1 lỗi JS ở top-level sẽ chặn các IIFE phía sau không chạy). */
(function () {
  var _orig = window.navigate;
  window.navigate = function (page) {
    _orig(page);
    try {
      if (page === 'roadmap' && typeof window.initRoadmapPage === 'function') {
        window.initRoadmapPage();
      }
    } catch (e) { console.error('[roadmap] init error:', e); }
  };
})();

/* ── User avatar dropdown ── */
function toggleUserMenu() {
  var wrap = document.getElementById('user-chip-wrap');
  var btn = document.getElementById('user-chip-btn');
  var menu = document.getElementById('user-dropdown');
  var open = menu.classList.contains('open');
  if (open) {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeUserMenu() {
  var btn = document.getElementById('user-chip-btn');
  var menu = document.getElementById('user-dropdown');
  menu.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', function (e) {
  var wrap = document.getElementById('user-chip-wrap');
  if (wrap && !wrap.contains(e.target)) closeUserMenu();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeUserMenu();
});

/* Sync tên hiển thị trong dropdown header khi mở */
var _origToggleUserMenu = toggleUserMenu;
toggleUserMenu = function () {
  var n = document.getElementById('chip-name');
  var d = document.getElementById('udh-name');
  if (n && d) d.textContent = n.textContent;
  closeBellPanel();
  _origToggleUserMenu();
};

/* ── Bell notification panel — nối với /api/notifications/feed (DB thật) ── */
var _bellNotifs = [];
var _BELL_ICON = { mention: '💬', comment_reply: '↩️', system: '🔔' };

function _bellTimeAgo(iso) {
  if (!iso) return '';
  var s = /[Zz]|[+][0-9]/.test(iso) ? iso : String(iso).replace(' ', 'T') + 'Z';
  var diff = Math.floor((Date.now() - new Date(s).getTime()) / 1000);
  if (isNaN(diff)) return '';
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
  return Math.floor(diff / 86400) + ' ngày trước';
}

function _escBell(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadBellNotifs() {
  return fetch('/api/notifications/feed')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      _bellNotifs = (d.items || []).map(function (n) {
        return {
          id: n.id, icon: _BELL_ICON[n.type] || '🔔',
          title: n.title || '', body: n.body || '',
          time: _bellTimeAgo(n.created_at), unread: !n.is_read,
          refType: n.ref_type || null, refId: n.ref_id || null
        };
      });
      _renderBellItems();
      _updateBellDot();
    })
    .catch(function () {});
}

function _renderBellItems() {
  var body = document.getElementById('bell-panel-body');
  if (!body) return;
  if (!_bellNotifs.length) {
    body.innerHTML = '<div class="bell-empty"><div class="bell-empty-icon">🔕</div><div>Chưa có thông báo nào</div></div>';
    return;
  }
  body.innerHTML = _bellNotifs.map(function (n, i) {
    return '<div class="bell-item' + (n.unread ? ' unread' : '') + '" onclick="readBellItem(' + i + ')" role="menuitem" tabindex="0">'
      + '<div class="bell-item-icon">' + n.icon + '</div>'
      + '<div class="bell-item-body">'
      + '<div class="bell-item-text">' + _escBell(n.title) + (n.body ? ': ' + _escBell(n.body) : '') + '</div>'
      + '<div class="bell-item-time">' + _escBell(n.time) + '</div>'
      + '</div>'
      + (n.unread ? '<div class="bell-unread-dot"></div>' : '')
      + '</div>';
  }).join('');
}

function _updateBellDot() {
  var dot = document.getElementById('bell-dot');
  if (!dot) return;
  var hasUnread = _bellNotifs.some(function (n) { return n.unread; });
  dot.style.display = hasUnread ? '' : 'none';
}

function toggleBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn = document.getElementById('bell-btn');
  var open = panel.classList.contains('open');
  if (open) {
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    closeUserMenu();
    loadBellNotifs();   // tải mới mỗi lần mở
    _renderBellItems();
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn = document.getElementById('bell-btn');
  if (panel) panel.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// Điều hướng tới bài viết của thông báo và mở khung bình luận chứa @mention.
function _focusForumPost(postId) {
  closeBellPanel();
  if (typeof window.navigate === 'function') window.navigate('forum');
  // renderPosts chạy async (chờ API) -> thử tìm card nhiều lần rồi scroll + mở comment.
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var card = document.getElementById('fpc-' + postId);
    if (card) {
      clearInterval(timer);
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Nhấp nháy nhẹ để user nhận ra bài
      card.style.transition = 'box-shadow .3s';
      card.style.boxShadow = '0 0 0 2px var(--blue, #3B82F6)';
      setTimeout(function () { card.style.boxShadow = ''; }, 1600);
      // Mở khung bình luận để thấy @mention
      if (typeof window.forumToggleComments === 'function') {
        var section = document.getElementById('fpc-cmt-' + postId);
        if (section && !section.classList.contains('open')) window.forumToggleComments(postId);
      }
    } else if (tries > 40) {  // ~10s (Neon cold-start) rồi bỏ cuộc
      clearInterval(timer);
    }
  }, 250);
}

function readBellItem(idx) {
  var n = _bellNotifs[idx];
  if (!n) return;
  if (n.unread) {
    n.unread = false;
    _renderBellItems();
    _updateBellDot();
    if (n.id) fetch('/api/notifications/feed/' + n.id + '/read', { method: 'POST' }).catch(function () {});
  }
  // Di chuyển tới bài viết có @mention
  if (n.refType === 'post' && n.refId) _focusForumPost(n.refId);
}

function markAllBellRead() {
  _bellNotifs.forEach(function (n) { n.unread = false; });
  _renderBellItems();
  _updateBellDot();
  fetch('/api/notifications/feed/read-all', { method: 'POST' }).catch(function () {});
}

// Tải thông báo lúc vào trang để cập nhật chấm đỏ trên chuông
if (document.readyState !== 'loading') loadBellNotifs();
else document.addEventListener('DOMContentLoaded', loadBellNotifs);

document.addEventListener('click', function (e) {
  var wrap = document.getElementById('bell-wrap');
  if (wrap && !wrap.contains(e.target)) closeBellPanel();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeBellPanel();
});

/* ═══════════════════════════════════════════════════════
   Modal đổi mật khẩu
   ═══════════════════════════════════════════════════════ */
function openChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  modal.classList.add('active');
  document.body.classList.add('cp-modal-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('cpCurrent').focus(), 300);
}

function closeChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  modal.classList.remove('active');
  document.body.classList.remove('cp-modal-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.getElementById('cpForm').reset();
    resetCpUI();
  }, 300);
}

function resetCpUI() {
  document.getElementById('cpStrength').className = 'cp-strength';
  document.getElementById('cpStrengthLabel').textContent = '';
  document.getElementById('cpCurrentMsg').textContent = '';
  document.getElementById('cpConfirmMsg').textContent = '';
}

(function () {
  var cpModal = document.getElementById('changePasswordModal');
  if (cpModal) {
    cpModal.addEventListener('click', (e) => {
      if (e.target.id === 'changePasswordModal') closeChangePasswordModal();
    });
  }
})();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    var cpModal = document.getElementById('changePasswordModal');
    var unModal = document.getElementById('unenrollModal');
    if (cpModal && cpModal.classList.contains('active'))
      closeChangePasswordModal();
    if (unModal && unModal.classList.contains('active'))
      closeUnenrollModal();
  }
});

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  btn.innerHTML = isPassword
    ? `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
       <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
       <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
       <line x1="2" y1="2" x2="22" y2="22"></line>
     </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
       <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
       <circle cx="12" cy="12" r="3"></circle>
     </svg>`;
}

function checkStrength(pwd) {
  const strength = document.getElementById('cpStrength');
  const label = document.getElementById('cpStrengthLabel');

  if (!pwd) {
    strength.className = 'cp-strength';
    label.textContent = '';
    return;
  }

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = ['', 'Yếu', 'Trung bình', 'Khá mạnh', 'Mạnh'];
  strength.className = 'cp-strength level-' + score;
  label.textContent = levels[score];

  checkMatch();
}

function checkMatch() {
  const newPwd = document.getElementById('cpNew').value;
  const confirm = document.getElementById('cpConfirm').value;
  const msg = document.getElementById('cpConfirmMsg');

  if (!confirm) {
    msg.textContent = '';
    msg.className = 'cp-msg';
    return;
  }

  if (newPwd === confirm) {
    msg.textContent = '✓ Mật khẩu khớp';
    msg.className = 'cp-msg success';
  } else {
    msg.textContent = '✗ Mật khẩu không khớp';
    msg.className = 'cp-msg';
  }
}

(function () {
  var cpSubmitBtn = document.getElementById('cpSubmitBtn');
  if (cpSubmitBtn) {
    cpSubmitBtn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'cp-ripple';
      ripple.style.width = ripple.style.height = '20px';
      ripple.style.left = (e.clientX - rect.left - 10) + 'px';
      ripple.style.top = (e.clientY - rect.top - 10) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }
})();

(function () {
  var cpForm = document.getElementById('cpForm');
  if (!cpForm) return;
  cpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPwd = document.getElementById('cpCurrent').value;
  const newPwd = document.getElementById('cpNew').value;
  const confirmPwd = document.getElementById('cpConfirm').value;
  const submitBtn = document.getElementById('cpSubmitBtn');
  const currentMsg = document.getElementById('cpCurrentMsg');

  if (newPwd.length < 8) {
    alert('Mật khẩu mới phải có ít nhất 8 ký tự');
    return;
  }
  if (newPwd !== confirmPwd) {
    document.getElementById('cpConfirmMsg').textContent = '✗ Mật khẩu không khớp';
    return;
  }
  if (currentPwd === newPwd) {
    currentMsg.textContent = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/user/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current: currentPwd,
        new: newPwd
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✓ Đổi mật khẩu thành công!');
      closeChangePasswordModal();
    } else {
      currentMsg.textContent = data.error || 'Mật khẩu hiện tại không đúng';
    }

  } catch (err) {
    console.error('Change password error:', err);
    currentMsg.textContent = 'Không kết nối được máy chủ. Vui lòng thử lại.';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
  });
})();

/* ═══════════════════════════════════════════════════════
   Kỹ năng — toggle helpers
   ═══════════════════════════════════════════════════════ */
function skSetToggle(hd) {
  var body = hd.nextElementSibling;
  var open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  var arrow = hd.querySelector('.sk-arrow');
  if (arrow) arrow.style.transform = open ? '' : 'rotate(90deg)';
}
function skSkillToggle(row) {
  var sub = row.nextElementSibling;
  sub.style.display = sub.style.display === 'block' ? 'none' : 'block';
}

/* ═══════════════════════════════════════════════════════
   Kỹ năng — load & render
   ═══════════════════════════════════════════════════════ */
(function () {
  var _skillsLoaded = false;

  function badge(pct) {
    if (pct === 0) return '<span class="sk-badge new">Chưa bắt đầu</span>';
    if (pct >= 70) return '<span class="sk-badge achieved">Đạt ✓</span>';
    return '<span class="sk-badge review">Cần ôn</span>';
  }

  function fillColor(pct) {
    if (pct === 0) return '#E5E7EB';
    if (pct >= 70) return 'linear-gradient(90deg,#10B981,#059669)';
    return 'linear-gradient(90deg,#F59E0B,#D97706)';
  }

  function donutChart(pct) {
    var color = pct >= 70 ? '#10B981' : (pct > 0 ? '#F59E0B' : '#D1D5DB');
    var bg = 'conic-gradient(' + color + ' ' + pct + '%, #E5E7EB ' + pct + '% 100%)';
    return '<div class="sk-donut" style="background:' + bg + '">' +
      '<div class="sk-donut-inner"><span class="sk-donut-pct">' + pct + '%</span></div>' +
      '</div>';
  }

  function renderSkills(data) {
    var sets = data.skill_sets || [];
    var total = 0, achieved = 0, review = 0, unstarted = 0;
    sets.forEach(function (bs) {
      bs.skills.forEach(function (sk) {
        total++;
        if (sk.progress === 0) unstarted++;
        else if (sk.progress >= 70) achieved++;
        else review++;
      });
    });

    var sum = document.getElementById('sk-summary');
    var filt = window._skFilter || 'all';
    function tab(key, val, label, color) {
      var active = filt === key;
      return '<button type="button" class="sk-tab' + (active ? ' active' : '') + '" data-filter="' + key + '" onclick="skSetFilter(\'' + key + '\')" style="' + (active && color ? 'border-color:' + color + '33;color:' + color : '') + '">' +
        '<div class="v"' + (color ? ' style="color:' + color + '"' : '') + '>' + val + '</div><div class="l">' + label + '</div></button>';
    }
    sum.innerHTML =
      tab('all', total, 'Tổng', null) +
      tab('achieved', achieved, 'Đã đạt ✓', '#10B981') +
      tab('review', review, 'Cần ôn', '#F59E0B') +
      tab('none', unstarted, 'Chưa bắt đầu', '#64748B');

    var grid = document.getElementById('sk-grid');
    if (!sets.length) { grid.innerHTML = '<div style="color:#9CA3AF;font-size:14px;padding:24px;">Chưa có dữ liệu kỹ năng.</div>'; return; }

    var defaultOpen = document.getElementById('page-skills').classList.contains('active');

    grid.innerHTML = sets.map(function (bs) {
      var setStatus = bs.progress >= 70 ? 'achieved' : (bs.progress > 0 ? 'review' : 'none');
      if (filt !== 'all' && filt !== setStatus) return '';
      var skillRows = bs.skills.map(function (sk) {
        var subItems = sk.sub_skills.map(function (sub) {
          var cls = sub.done ? 'done' : 'todo';
          return '<div class="sk-sub">' +
            '<span class="sk-sub-dot ' + cls + '"></span>' +
            '<span class="sk-sub-title ' + cls + '">' + sub.title + '</span>' +
            '</div>';
        }).join('');
        return '<div class="sk-skill">' +
          '<div class="sk-skill-row" onclick="skSkillToggle(this)">' +
          '<div class="sk-skill-top">' +
          '<span class="sk-skill-name">' + sk.title + '</span>' +
          '<span class="sk-skill-pct">' + sk.progress + '%</span>' +
          badge(sk.progress) +
          '</div>' +
          '<div class="sk-skill-bar-wrap">' +
          '<div class="sk-skill-bar"><div class="sk-skill-fill" style="width:' + sk.progress + '%;background:' + fillColor(sk.progress) + '"></div></div>' +
          '</div>' +
          '</div>' +
          '<div class="sk-sub-list" style="display:none">' + subItems + '</div>' +
          '</div>';
      }).join('');

      var setAchieved = bs.skills.filter(function (sk) { return sk.progress >= 70; }).length;
      var setTotal = bs.skills.length;
      return '<div class="sk-set">' +
        '<div class="sk-set-hd" onclick="skSetToggle(this)">' +
        '<span class="sk-set-icon">' + bs.icon + '</span>' +
        '<div class="sk-set-info">' +
        '<div class="sk-set-title">' + bs.title + '</div>' +
        '<div class="sk-set-meta">' + setAchieved + '/' + setTotal + ' kỹ năng đạt</div>' +
        '</div>' +
        badge(bs.progress) +
        donutChart(bs.progress) +
        '<span class="sk-arrow"' + (defaultOpen ? ' style="transform:rotate(90deg)"' : '') + '>▶</span>' +
        '</div>' +
        '<div class="sk-body" style="display:' + (defaultOpen ? 'block' : 'none') + '">' + skillRows + '</div>' +
        '</div>';
    }).join('');
  }

  var _skillsData = null;
  function loadSkills() {
    if (_skillsLoaded) return;
    _skillsLoaded = true;
    fetch('/api/skills')
      .then(function (r) { return r.json(); })
      .then(function (data) { _skillsData = data; renderSkills(data); })
      .catch(function () {
        document.getElementById('sk-grid').innerHTML =
          '<div style="color:#EF4444;font-size:14px;padding:24px;">Không tải được dữ liệu kỹ năng.</div>';
      });
  }
  window.skSetFilter = function (key) {
    window._skFilter = key;
    if (_skillsData) renderSkills(_skillsData);
  };

  var _origNavigate = window.navigate;
  window.navigate = function (page) {
    _origNavigate(page);
    if (page === 'skills') loadSkills();
    if (page === 'roadmap' && typeof window.initRoadmapPage === 'function') {
      window.initRoadmapPage();
    }
  };
  window._loadSkillsGlobal = loadSkills;
})();

/* ═══════════════════════════════════════════════════════
   Diễn đàn cộng đồng
   ═══════════════════════════════════════════════════════ */
(function () {

  /* ── Forum API Layer — gọi thẳng Flask API thật (routes/forum.py) ──
     Trước đây là mock localStorage nên like/comment không lưu được. Giờ mọi
     thao tác đi thẳng Postgres. Cookie session tự gửi (same-origin), không cần
     thêm credentials. ─────────────────────────────────────────────────── */
  var forumApi = {
    getPosts: function (opts) {
      opts = opts || {};
      var qs = 'per_page=50';
      if (opts.mine) qs += '&mine=1';
      return fetch('/api/posts?' + qs).then(function (r) { return r.json(); });
    },
    createPost: function (payload) {
      return fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); });
    },
    react: function (postId, reactionKey) {
      return fetch('/api/posts/' + postId + '/react', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: reactionKey })
      }).then(function (r) { return r.json(); });
    },
    reactComment: function (commentId, reactionKey) {
      return fetch('/api/comments/' + commentId + '/react', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: reactionKey })
      }).then(function (r) { return r.json(); });
    },
    getComments: function (postId) {
      return fetch('/api/posts/' + postId + '/comments?per_page=50').then(function (r) { return r.json(); });
    },
    addComment: function (postId, text, parentCommentId) {
      return fetch('/api/posts/' + postId + '/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, parent_comment_id: parentCommentId || null })
      }).then(function (r) { return r.json(); });
    },
    deletePost: function (postId) {
      return fetch('/api/posts/' + postId, { method: 'DELETE' }).then(function (r) { return r.json(); });
    }
  };

  /* Chuyển row API (category/content/author_name/created_at) -> model UI (cat/body/author/time). */
  function _apiTime(s) {
    if (!s) return Date.now();
    // created_at là TIMESTAMP không timezone -> append 'Z' để parse thành UTC,
    // nếu không new Date() coi là giờ local và timeAgo() sẽ lệch theo múi giờ.
    var iso = /[Zz]|[+][0-9]/.test(s) ? s : s.replace(' ', 'T') + 'Z';
    var t = new Date(iso).getTime();
    return isNaN(t) ? Date.now() : t;
  }
  function _emptyReactions() { return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }; }
  function _apiPostToUi(row) {
    return {
      id: row.id, cat: row.category, title: row.title || '', body: row.content || '',
      userId: row.user_id || null,
      author: row.author_name || 'Ẩn danh', avatar: '🙋', time: _apiTime(row.created_at),
      reactions: row.reactions || _emptyReactions(), myReaction: row.my_reaction || null,
      comments: row.comment_count || 0, commentList: null, media: []
    };
  }
  function _apiCommentToUi(row) {
    return {
      id: row.id, author: row.author_name || 'Ẩn danh', avatar: '🧑',
      time: _apiTime(row.created_at), text: row.content || '',
      reactions: row.reactions || _emptyReactions(), myReaction: row.my_reaction || null,
      parent_comment_id: row.parent_comment_id || null, replies: []
    };
  }
  /* Dựng cây 1 cấp từ mảng comment phẳng của API. */
  function _buildCommentTree(flat) {
    var byId = {}, roots = [];
    flat.forEach(function (row) { byId[row.id] = _apiCommentToUi(row); });
    flat.forEach(function (row) {
      var node = byId[row.id];
      if (row.parent_comment_id && byId[row.parent_comment_id]) {
        node.replyTo = byId[row.parent_comment_id].author;
        byId[row.parent_comment_id].replies.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }
  function _isAdminUser() {
    return !!(window.__currentUser && window.__currentUser.role === 'admin');
  }
  /* Cache comment tree theo postId (lazy-load khi mở khung bình luận). */
  var _commentsCache = {};
  /* Mảng post vừa render — để reaction handler patch tại chỗ, không cần GET lại. */
  var _lastRenderedPosts = [];

  /* ═══════════════════════════════════════════════════════
     Predictive Comment Prefetch System
     — IntersectionObserver + hover + request queue —
     ═══════════════════════════════════════════════════════ */
  var _prefetchInFlight = {};   // postId -> Promise (đang fetch)
  var _prefetchQueue = [];      // [{postId, priority}] — chờ xử lý
  var _prefetchActive = 0;      // số request đang chạy
  var _PREFETCH_CONCURRENCY = 2; // tối đa 2 request song song
  var _commentObserver = null;  // IntersectionObserver instance

  // Prefetch chỉ fetch + cache, KHÔNG render. Trả Promise.
  function _prefetchComments(postId) {
    // Bỏ qua mock posts
    if (_isMockPost(postId)) return Promise.resolve();
    // Đã có cache → skip
    if (_commentsCache[postId]) return Promise.resolve();
    // Đang fetch → trả promise hiện tại
    if (_prefetchInFlight[postId]) return _prefetchInFlight[postId];

    var p = forumApi.getComments(postId).then(function (res) {
      var tree = _buildCommentTree((res && res.comments) || []);
      _commentsCache[postId] = tree;
      // Cập nhật badge nếu post đang hiển thị
      var post = _lastRenderedPosts.find(function (pp) { return String(pp.id) === String(postId); });
      if (post) {
        post.comments = tree.length;
        _setCommentBadge(postId, tree.length);
      }
      delete _prefetchInFlight[postId];
      _prefetchActive--;
      _drainPrefetchQueue();
    }).catch(function () {
      delete _prefetchInFlight[postId];
      _prefetchActive--;
      _drainPrefetchQueue();
    });
    _prefetchInFlight[postId] = p;
    _prefetchActive++;
    return p;
  }

  // Thêm postId vào hàng đợi prefetch (priority: 1=high, 2=medium, 3=low)
  function _enqueuePrefetch(postId, priority) {
    if (_isMockPost(postId)) return;
    if (_commentsCache[postId]) return;
    if (_prefetchInFlight[postId]) return;
    // Tránh duplicate trong queue
    for (var i = 0; i < _prefetchQueue.length; i++) {
      if (_prefetchQueue[i].postId === postId) {
        // Nâng priority nếu request mới ưu tiên hơn
        if (priority < _prefetchQueue[i].priority) _prefetchQueue[i].priority = priority;
        return;
      }
    }
    _prefetchQueue.push({ postId: postId, priority: priority || 3 });
    _drainPrefetchQueue();
  }

  // Xử lý queue: chạy tối đa _PREFETCH_CONCURRENCY request cùng lúc
  function _drainPrefetchQueue() {
    while (_prefetchActive < _PREFETCH_CONCURRENCY && _prefetchQueue.length > 0) {
      // Sort theo priority (thấp = ưu tiên hơn)
      _prefetchQueue.sort(function (a, b) { return a.priority - b.priority; });
      var next = _prefetchQueue.shift();
      // Double-check cache (có thể đã được fetch bởi request khác)
      if (_commentsCache[next.postId] || _prefetchInFlight[next.postId]) continue;
      _prefetchComments(next.postId);
    }
  }

  // IntersectionObserver: khi post card sắp vào viewport → enqueue prefetch
  function _setupCommentObserver() {
    // Hủy observer cũ nếu có
    if (_commentObserver) { _commentObserver.disconnect(); _commentObserver = null; }
    // Không hỗ trợ IntersectionObserver → fallback prefetch 3 post đầu
    if (typeof IntersectionObserver === 'undefined') {
      _lastRenderedPosts.slice(0, 3).forEach(function (p) {
        if (!_isMockPost(p.id)) _enqueuePrefetch(String(p.id), 3);
      });
      return;
    }

    _commentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var postId = card.id.replace('fpc-', '');
        if (!postId) return;
        // Prefetch post này (medium priority)
        _enqueuePrefetch(postId, 2);
        // Dự đoán: prefetch post KẾ TIẾP trong danh sách (low priority)
        var nextCard = card.nextElementSibling;
        if (nextCard && nextCard.id && nextCard.id.startsWith('fpc-')) {
          var nextId = nextCard.id.replace('fpc-', '');
          _enqueuePrefetch(nextId, 3);
        }
        // Đã prefetch → ngừng theo dõi post này
        _commentObserver.unobserve(card);
      });
    }, {
      root: null,
      rootMargin: '300px 0px',  // Bắt đầu prefetch khi post còn cách 300px
      threshold: 0
    });

    // Observe tất cả post cards trong danh sách
    var list = document.getElementById('forum-list');
    if (!list) return;
    var cards = list.querySelectorAll('.forum-post-card[id^="fpc-"]');
    cards.forEach(function (card) {
      var postId = card.id.replace('fpc-', '');
      // Chỉ observe post thật chưa có cache
      if (!_isMockPost(postId) && !_commentsCache[postId]) {
        _commentObserver.observe(card);
      }
    });
  }

  // Hover prefetch: khi user di chuột vào nút comment → fetch ngay (high priority)
  function _setupHoverPrefetch() {
    var list = document.getElementById('forum-list');
    if (!list) return;
    // Dùng event delegation để tránh gắn listener lên từng nút
    list.addEventListener('mouseenter', function (e) {
      var btn = e.target.closest('.fpc-comment-btn');
      if (!btn) return;
      var postId = btn.id.replace('fpc-cmtbtn-', '');
      if (!postId || _isMockPost(postId)) return;
      if (_commentsCache[postId]) return;
      // High priority — user đang hướng tới bấm
      _enqueuePrefetch(postId, 1);
    }, true);
  }
  var _hoverPrefetchSetup = false;

  var CAT_LABELS = { question: '❓ Câu hỏi', share: '💡 Chia sẻ', discuss: '💬 Thảo luận' };
  var CAT_COLORS = { question: '#F87171', share: '#FCD34D', discuss: '#A78BFA' };
  var CAT_BG = { question: 'rgba(248,113,113,0.1)', share: 'rgba(252,211,77,0.1)', discuss: 'rgba(167,139,250,0.1)' };

  var REACT_EMOJIS = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
  var REACT_LABELS = { like: 'Thích', love: 'Yêu thích', haha: 'Haha', wow: 'Wow', sad: 'Buồn', angry: 'Phẫn nộ' };

  var _forumMediaFiles = [];

  var _currentCat = 'all';
  var _currentSort = 'newest';
  var _selectedCat = 'question';
  var _cmtSortMap = {};

  var MOCK_POSTS = [
    {
      id: 'm1', cat: 'question',
      title: 'Làm thế nào để hiểu rõ về con trỏ trong C/C++?',
      body: 'Mình đang học C++ nhưng phần con trỏ khá khó hiểu, đặc biệt là con trỏ đôi (double pointer). Mọi người có thể giải thích hoặc gợi ý tài liệu dễ hiểu không?',
      author: 'Trần Minh Tuấn', avatar: '🧑‍💻',
      time: Date.now() - 2 * 3600 * 1000,
      reactions: { like: 10, love: 2, haha: 0, wow: 2, sad: 0, angry: 0 }, myReaction: null,
      comments: 3,
      commentList: [
        { id: 'c1a', author: 'Nguyễn Văn An', avatar: '👨‍💻', time: Date.now() - 100 * 60 * 1000, text: 'Con trỏ đôi về bản chất là một con trỏ trỏ tới một con trỏ khác. Bạn thử hình dung bộ nhớ như một dãy ô, mỗi ô có địa chỉ riêng — con trỏ chỉ là biến lưu địa chỉ đó thôi!', reactions: { like: 4, love: 1, haha: 0, wow: 0, sad: 0, angry: 0 }, myReaction: null, replies: [{ id: 'r1a', author: 'Trần Minh Tuấn', avatar: '🧑‍💻', time: Date.now() - 85 * 60 * 1000, text: 'Cảm ơn bạn! Cách so sánh với dãy ô bộ nhớ dễ hình dung lắm, mình hiểu ngay rồi!', replyTo: 'Nguyễn Văn An' }] },
        { id: 'c1b', author: 'Lê Thị Hoa', avatar: '👩‍🏫', time: Date.now() - 60 * 60 * 1000, text: 'Mình học từ sách "C Programming Language" của Kernighan & Ritchie, phần con trỏ giải thích rất trực quan. Bạn nên thử debug từng bước để thấy giá trị thay đổi.', reactions: { like: 2, love: 0, haha: 0, wow: 1, sad: 0, angry: 0 }, myReaction: null, replies: [] },
        { id: 'c1c', author: 'Phạm Đức Huy', avatar: '🧑‍🎓', time: Date.now() - 20 * 60 * 1000, text: 'Series C++ của The Cherno trên YouTube giải thích con trỏ bằng hình ảnh rất dễ hiểu. Mình đã học từ đó và hiểu ngay sau 2 video!', reactions: { like: 6, love: 2, haha: 0, wow: 0, sad: 0, angry: 0 }, myReaction: null, replies: [] },
      ],
    },
    {
      id: 'm2', cat: 'share',
      title: 'Tổng hợp 10 extension VSCode hữu ích nhất cho lập trình viên Python',
      body: 'Sau một thời gian dùng VSCode để code Python, mình tổng hợp lại các extension mình thấy thực sự hữu ích. Hi vọng giúp ích cho mọi người: Pylance, Black Formatter, Python Debugger...',
      author: 'Nguyễn Hà Linh', avatar: '👩‍💻',
      time: Date.now() - 5 * 3600 * 1000,
      reactions: { like: 25, love: 7, haha: 0, wow: 0, sad: 0, angry: 0 }, myReaction: null,
      comments: 2,
      commentList: [
        { id: 'c2a', author: 'Trần Bình', avatar: '🧑‍💻', time: Date.now() - 3 * 3600 * 1000, text: 'Mình thêm GitLens vào danh sách nhé, siêu hữu ích khi làm việc nhóm, xem ai commit gì ngay trong editor.' },
        { id: 'c2b', author: 'Mai Anh', avatar: '👩‍🎓', time: Date.now() - 1 * 3600 * 1000, text: 'Docker extension cũng rất tiện nếu bạn hay dùng container. Quản lý image và container ngay trong VSCode luôn.' },
      ],
    },
    {
      id: 'm3', cat: 'discuss',
      title: 'Nên học Java hay Python trước khi học Machine Learning?',
      body: 'Mình đang phân vân giữa Java và Python để bắt đầu. Mình nghe nói Python phổ biến hơn trong ML, nhưng Java lại mạnh hơn về OOP. Mọi người nghĩ sao?',
      author: 'Lê Văn Đức', avatar: '🧑‍🎓',
      time: Date.now() - 24 * 3600 * 1000,
      reactions: { like: 14, love: 3, haha: 1, wow: 3, sad: 0, angry: 0 }, myReaction: null,
      comments: 3,
      commentList: [
        { id: 'c3a', author: 'Hoàng Nam', avatar: '👨‍💻', time: Date.now() - 20 * 3600 * 1000, text: 'Python chắc chắn rồi! Hầu hết thư viện ML như TensorFlow, PyTorch, scikit-learn đều Python-first. Java không có hệ sinh thái ML mạnh như vậy.' },
        { id: 'c3b', author: 'Thu Hương', avatar: '👩‍💻', time: Date.now() - 15 * 3600 * 1000, text: 'Mình cũng từng phân vân như bạn, cuối cùng chọn Python và không hối hận. NumPy + Pandas là bộ đôi không thể thiếu, học Python để dùng được 2 thư viện này.' },
        { id: 'c3c', author: 'Việt Anh', avatar: '🧑', time: Date.now() - 5 * 3600 * 1000, text: 'Java mạnh về enterprise và Android, nhưng cho ML thì Python win tuyệt đối. Bắt đầu Python đi bạn, 2-3 tháng là dùng được thư viện cơ bản rồi.' },
      ],
    },
    {
      id: 'm4', cat: 'share',
      title: 'Mình đã hoàn thành khóa học HTML/CSS sau 3 tuần — Chia sẻ kinh nghiệm',
      body: 'Sau 3 tuần học chăm chỉ, mình đã hoàn thành khóa HTML/CSS. Bí quyết của mình là học mỗi ngày ít nhất 1 tiếng và làm project nhỏ ngay sau khi học xong mỗi phần.',
      author: 'Phạm Thị Mai', avatar: '👩‍🎓',
      time: Date.now() - 2 * 24 * 3600 * 1000,
      reactions: { like: 30, love: 12, haha: 0, wow: 5, sad: 0, angry: 0 }, myReaction: null,
      comments: 2,
      commentList: [
        { id: 'c4a', author: 'Minh Khoa', avatar: '🧑‍💻', time: Date.now() - 40 * 3600 * 1000, text: 'Chúc mừng bạn! 3 tuần là rất nhanh đó. Bước tiếp theo bạn định học JavaScript hay framework nào không?' },
        { id: 'c4b', author: 'Ngọc Linh', avatar: '👩‍🎓', time: Date.now() - 30 * 3600 * 1000, text: 'Làm project nhỏ sau mỗi bài là cách hay nhất để nhớ kiến thức lâu dài. Mình cũng áp dụng phương pháp này và tiến bộ rất nhanh!' },
      ],
    },
    {
      id: 'm5', cat: 'question',
      title: 'Git merge vs Git rebase — khi nào nên dùng cái nào?',
      body: 'Mình hay bị nhầm lẫn giữa merge và rebase. Anh/chị nào có thể giải thích sự khác biệt và khi nào thì nên dùng từng loại không ạ?',
      author: 'Hoàng Quốc Bảo', avatar: '🧑',
      time: Date.now() - 3 * 24 * 3600 * 1000,
      reactions: { like: 7, love: 1, haha: 0, wow: 1, sad: 0, angry: 0 }, myReaction: null,
      comments: 2,
      commentList: [
        { id: 'c5a', author: 'Đức Thịnh', avatar: '👨‍💻', time: Date.now() - 60 * 3600 * 1000, text: 'Merge giữ lại lịch sử đầy đủ, thích hợp cho feature branch lớn. Rebase tạo lịch sử linear sạch hơn, hay dùng trước khi merge vào main để commit gọn gàng.' },
        { id: 'c5b', author: 'Khánh An', avatar: '👩‍💻', time: Date.now() - 48 * 3600 * 1000, text: 'Rule of thumb: không rebase nhánh public đã push lên remote vì sẽ thay đổi lịch sử ảnh hưởng người khác. Chỉ rebase nhánh local của mình thôi nhé!' },
      ],
    },
  ];

  // Lấy post thật từ API, đã map sang model UI. Trả Promise<Array>.
  function loadPosts() {
    return forumApi.getPosts().then(function (res) {
      return (res.posts || []).map(_apiPostToUi);
    });
  }

  /* ── Follow user (nút Theo dõi cạnh tên tác giả trong forum) ─────────── */
  var _followingIds = {};      // userId -> true (những người mình đang follow)
  var _followingLoaded = false;

  function _loadFollowing() {
    var me = window.__currentUser;
    if (!me || !me.id) return Promise.resolve();
    return fetch('/api/users/' + me.id + '/following')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        _followingIds = {};
        ((d && d.following) || []).forEach(function (u) { _followingIds[u.id] = true; });
        _followingLoaded = true;
      })
      .catch(function () { /* offline/lỗi: nút vẫn hoạt động, chỉ thiếu trạng thái đầu */ });
  }

  window.toggleFollow = function (userId, btn) {
    var isFollowing = !!_followingIds[userId];
    btn.disabled = true;
    fetch('/api/users/' + userId + '/follow', { method: isFollowing ? 'DELETE' : 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          if (d.following) _followingIds[userId] = true;
          else delete _followingIds[userId];
          // Cập nhật MỌI nút follow của user này đang hiển thị
          document.querySelectorAll('.fpc-follow-btn[data-user-id="' + userId + '"]').forEach(function (b) {
            b.classList.toggle('following', !!d.following);
            b.textContent = d.following ? 'Đang theo dõi' : '+ Theo dõi';
          });
        }
      })
      .catch(function () {})
      .then(function () { btn.disabled = false; });
  };

  function _followBtnHtml(p) {
    var me = window.__currentUser || {};
    if (!p.userId || !me.id || p.userId === me.id) return '';
    var isF = !!_followingIds[p.userId];
    return '<button class="fpc-follow-btn' + (isF ? ' following' : '') + '"'
      + ' data-user-id="' + p.userId + '"'
      + ' style="margin-left:8px;font-size:11px;padding:2px 8px;border-radius:12px;border:1px solid var(--border,#d1d5db);background:transparent;cursor:pointer;color:inherit"'
      + ' onclick="event.stopPropagation();toggleFollow(' + p.userId + ', this)">'
      + (isF ? 'Đang theo dõi' : '+ Theo dõi') + '</button>';
  }

  // Async: post thật từ DB; admin thấy kèm 5 bài demo (MOCK_POSTS) ở đầu để
  // biết mà quản lý — user thường chỉ thấy bài thật.
  function getAllPostsAsync() {
    return loadPosts().then(function (realPosts) {
      return _isAdminUser() ? MOCK_POSTS.concat(realPosts) : realPosts;
    });
  }

  function filteredSorted(posts) {
    if (_currentCat !== 'all') posts = posts.filter(function (p) { return p.cat === _currentCat; });
    var q = (typeof _forumTextQ !== 'undefined' && _forumTextQ) ? _forumTextQ : '';
    if (q) posts = posts.filter(function (p) {
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    });
    if (_currentSort === 'likes') posts.sort(function (a, b) { return (b.reactions?.like || 0) - (a.reactions?.like || 0); });
    else if (_currentSort === 'oldest') posts.sort(function (a, b) { return a.time - b.time; });
    else posts.sort(function (a, b) { return b.time - a.time; });
    return posts;
  }

  function timeAgo(ts) {
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    return Math.floor(diff / 86400) + ' ngày trước';
  }

  // Reload posts from API and re-render. Trả Promise để caller chờ được.
  function reloadPosts() {
    return getAllPostsAsync().then(function (allP) {
      var posts = filteredSorted(allP);
      _renderPosts(posts);
    });
  }

  function renderPosts() {
    // Show loading state
    var list = document.getElementById('forum-list');
    var empty = document.getElementById('forum-empty');
    if (list) list.innerHTML = '<div class="forum-loading">Đang tải...</div>';

    // Load from API (uses forumApi which can be swapped to real API)
    // Nạp danh sách following trước 1 lần để nút "Theo dõi" hiện đúng trạng thái
    var followReady = _followingLoaded ? Promise.resolve() : _loadFollowing();
    Promise.all([getAllPostsAsync(), followReady]).then(function (res) {
      var posts = filteredSorted(res[0]);
      _renderPosts(posts);
    });
  }

  function _renderPosts(posts) {
    _lastRenderedPosts = posts;
    var list = document.getElementById('forum-list');
    var empty = document.getElementById('forum-empty');
    if (!list) return;

    if (!posts.length) {
      list.innerHTML = '';
      empty && empty.classList.remove('hidden');
      return;
    }
    empty && empty.classList.add('hidden');

    list.innerHTML = posts.map(function (p, idx) {
      var catColor = CAT_COLORS[p.cat] || '#6B7280';
      var catBg = CAT_BG[p.cat] || '#F3F4F6';
      var catLabel = CAT_LABELS[p.cat] || p.cat;
      var excerpt = p.body.length > 160 ? p.body.slice(0, 157) + '...' : p.body;

      var reactions = p.reactions || { like: p.likes || 0 };
      var myReaction = p.myReaction || null;
      var totalR = Object.values(reactions).reduce(function (a, b) { return a + b; }, 0);
      var liked = !!myReaction;
      var reactClass = myReaction ? ('reacted-' + myReaction) : '';

      var pickerItems = Object.keys(REACT_EMOJIS).map(function (k) {
        return '<span class="reaction-item" onclick="forumSetReaction(\'' + p.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
      }).join('');

      var mediaPart = '';
      if (p.media && p.media.length) {
        mediaPart = '<div class="fpc-media-row">' + p.media.map(function (m) {
          if (m.type === 'video') {
            return '<video src="' + m.url + '" class="fpc-media-item" controls muted></video>';
          }
          return '<img src="' + m.url + '" class="fpc-media-item" alt="ảnh" />';
        }).join('') + '</div>';
      }

      return (
        '<div class="forum-post-card fx-fade-up" id="fpc-' + p.id + '" style="animation-delay:' + Math.min(idx * 0.04, 0.3) + 's">' +
        '<div class="fpc-top">' +
        '<div class="fpc-avatar" style="background:' + avatarColor(p.author) + '">' + (p.author || '?').charAt(0).toUpperCase() + '</div>' +
        '<div class="fpc-meta">' +
        '<span class="fpc-author">' + p.author + _followBtnHtml(p) + '</span>' +
        '<span class="fpc-time">' + timeAgo(p.time) + '</span>' +
        '</div>' +
        '<span class="fpc-cat-tag" style="background:' + catBg + ';color:' + catColor + '">' + catLabel + '</span>' +
        '</div>' +
        '<div class="fpc-title">' + escHtml(p.title) + '</div>' +
        '<div class="fpc-excerpt">' + escHtml(excerpt) + '</div>' +
        mediaPart +
        '<div class="fpc-actions">' +
        '<div class="fpc-react-wrap">' +
        '<button class="fpc-react-btn' + (liked ? ' liked' : '') + ' ' + reactClass + '" onclick="forumSetReaction(\'' + p.id + '\',\'' + (myReaction || 'like') + '\')">' +
        '<span data-icon="thumbs-up" data-size="13"' + (liked ? ' data-color="#60A5FA"' : '') + '></span> Thích' +
        (totalR > 0 ? ' <span class="fpc-react-count">' + totalR + '</span>' : '') +
        '</button>' +
        '<div class="reaction-picker">' + pickerItems + '</div>' +
        '</div>' +
        '<button class="fpc-comment-btn" id="fpc-cmtbtn-' + p.id + '" onclick="forumToggleComments(\'' + p.id + '\')">' +
        '<span data-icon="message-circle" data-size="13"></span> ' + p.comments + ' bình luận' +
        '</button>' +
        '<button class="fpc-share-btn" onclick="event.stopPropagation()"><span data-icon="share2" data-size="13"></span> Chia sẻ</button>' +
        '</div>' +
        '<div class="fpc-comments" id="fpc-cmt-' + p.id + '">' +
        '<div class="fpc-cmt-sort-bar">' +
        '<span class="fpc-cmt-sort-label">Bình luận</span>' +
        '<div class="fpc-cmt-sort-btns">' +
        '<button class="fpc-cmt-sort-btn active" id="fpc-csort-newest-' + p.id + '" onclick="forumSetCmtSort(\'' + p.id + '\',\'newest\')">↓ Mới nhất</button>' +
        '<button class="fpc-cmt-sort-btn" id="fpc-csort-oldest-' + p.id + '" onclick="forumSetCmtSort(\'' + p.id + '\',\'oldest\')">↑ Cũ nhất</button>' +
        '</div>' +
        '</div>' +
        '<div class="fpc-cmt-list" id="fpc-cmt-list-' + p.id + '"></div>' +
        '<div class="fpc-cmt-input-row">' +
        '<div class="fpc-cmt-avatar-col">' +
        '<div class="fpc-cmt-avatar fpc-cmt-me">🧑</div>' +
        '</div>' +
        '<div class="fpc-cmt-compose">' +
        '<input class="fpc-cmt-input" id="fpc-cmt-inp-' + p.id + '" placeholder="Viết bình luận..." ' +
        'onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();forumAddComment(\'' + p.id + '\');}" />' +
        '<button class="fpc-cmt-send" onclick="forumAddComment(\'' + p.id + '\')" title="Gửi (Enter)">↑</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }).join('');
    if (window.mountIcons) mountIcons(list);

    // Kích hoạt prefetch system sau mỗi lần render posts
    // Dùng requestIdleCallback nếu có, để không chặn paint
    var _schedPrefetch = window.requestIdleCallback || function (cb) { setTimeout(cb, 100); };
    _schedPrefetch(function () {
      _setupCommentObserver();
      if (!_hoverPrefetchSetup) {
        _setupHoverPrefetch();
        _hoverPrefetchSetup = true;
      }
    });

    // Nếu vừa được điều hướng từ "Trang của tôi" tới 1 bài cụ thể → cuộn tới + highlight
    if (_pendingScrollPostId) {
      var targetCard = document.getElementById('fpc-' + _pendingScrollPostId);
      _pendingScrollPostId = null;
      if (targetCard) {
        requestAnimationFrame(function () {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.style.transition = 'box-shadow .4s';
          targetCard.style.boxShadow = '0 0 0 3px rgba(59,130,246,.55)';
          setTimeout(function () { targetCard.style.boxShadow = ''; }, 2000);
        });
      }
    }
  }

  /* Mở diễn đàn và cuộn tới đúng bài — gọi từ "Bài đăng của tôi" trên Trang của tôi.
     Reset bộ lọc/tìm kiếm để bài chắc chắn nằm trong danh sách render. */
  var _pendingScrollPostId = null;
  window.forumOpenPost = function (postId) {
    _pendingScrollPostId = String(postId);
    _currentCat = 'all';
    _currentSort = 'newest';
    _forumTextQ = '';
    var si = document.getElementById('forum-search-input');
    if (si) si.value = '';
    document.querySelectorAll('#forum-tabs .filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.cat === 'all');
    });
    window.navigate('forum');
  };

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var _AVATAR_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#10B981', '#EC4899', '#06B6D4', '#F59E0B', '#EF4444'];
  function avatarColor(name) {
    var s = String(name || '?');
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return _AVATAR_COLORS[h % _AVATAR_COLORS.length];
  }

  window.forumSetCat = function (btn, cat) {
    document.querySelectorAll('#forum-tabs .filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    _currentCat = cat;
    renderPosts();
  };

  window.forumSetSort = function (val) {
    _currentSort = val;
    renderPosts();
  };

  window.forumToggleLike = function (postId) {
    forumSetReaction(postId, 'like');
  };

  /* ── Patch DOM tại chỗ cho reaction post — không re-render toàn bộ ── */
  function _patchPostReactionDOM(postId, reactions, myReaction) {
    var card = document.getElementById('fpc-' + postId);
    if (!card) return;
    var wrap = card.querySelector('.fpc-react-wrap');
    if (!wrap) return;
    var btn = wrap.querySelector('.fpc-react-btn');
    if (!btn) return;

    var totalR = Object.values(reactions).reduce(function (a, b) { return a + b; }, 0);
    var liked = !!myReaction;

    // Update button classes
    btn.className = 'fpc-react-btn' + (liked ? ' liked' : '') + (myReaction ? ' reacted-' + myReaction : '');

    // Update onclick to toggle current reaction
    btn.setAttribute('onclick', "forumSetReaction('" + postId + "','" + (myReaction || 'like') + "')");

    // Update icon color
    var icon = btn.querySelector('[data-icon]');
    if (icon) {
      if (liked) { icon.setAttribute('data-color', '#60A5FA'); } else { icon.removeAttribute('data-color'); }
      if (window.mountIcons) mountIcons(btn);
    }

    // Update count
    var countEl = btn.querySelector('.fpc-react-count');
    if (totalR > 0) {
      if (countEl) {
        countEl.textContent = totalR;
      } else {
        var span = document.createElement('span');
        span.className = 'fpc-react-count';
        span.textContent = totalR;
        btn.appendChild(span);
      }
    } else if (countEl) {
      countEl.remove();
    }

    // Quick pop animation on the button
    btn.style.transform = 'scale(1.15)';
    setTimeout(function () { btn.style.transform = ''; }, 180);
  }

  window.forumSetReaction = function (postId, key) {
    function applyReaction(post) {
      if (!post.reactions) {
        post.reactions = { like: post.likes || 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
        post.likes = 0;
      }
      var prev = post.myReaction || null;
      if (prev === key) {
        post.myReaction = null;
        if (post.reactions[key] > 0) post.reactions[key]--;
      } else {
        if (prev && post.reactions[prev] > 0) post.reactions[prev]--;
        post.myReaction = key;
        post.reactions[key] = (post.reactions[key] || 0) + 1;
      }
    }
    var mockIdx = MOCK_POSTS.findIndex(function (p) { return p.id === postId; });
    if (mockIdx !== -1) {
      // MOCK_POSTS (chỉ admin thấy) — thao tác cục bộ, patch DOM tại chỗ
      applyReaction(MOCK_POSTS[mockIdx]);
      _patchPostReactionDOM(postId, MOCK_POSTS[mockIdx].reactions, MOCK_POSTS[mockIdx].myReaction);
    } else {
      // Bài thật — optimistic update: patch DOM ngay, API chạy nền
      var post = _lastRenderedPosts.find(function (p) { return String(p.id) === String(postId); });
      if (post) {
        // Optimistic: update data ngay
        applyReaction(post);
        _patchPostReactionDOM(postId, post.reactions, post.myReaction);
      }
      // Gọi API nền — nếu server trả khác thì patch lại
      forumApi.react(postId, key).then(function (res) {
        if (!res || res.error) return;
        if (post) {
          post.reactions = res.reactions;
          post.myReaction = res.my_reaction;
          _patchPostReactionDOM(postId, res.reactions, res.my_reaction);
        }
      });
    }
  };

  /* ── Create box inline (giống Forum.tsx: 1 textarea, không modal) ── */
  window.forumInlinePickType = function (btn) {
    document.querySelectorAll('.fcb-type-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    _selectedCat = btn.dataset.val;
  };

  window.forumInlineInput = function (val) {
    var btn = document.getElementById('fcb-submit-btn');
    if (btn) btn.disabled = !val.trim();
  };

  window.forumSubmitInline = function () {
    var ta = document.getElementById('forum-inline-body');
    var body = (ta.value || '').trim();
    if (!body) return;
    var firstLine = body.split('\n')[0];
    var title = firstLine.length > 80 ? firstLine.slice(0, 77) + '…' : firstLine;

    forumApi.createPost({ category: _selectedCat, title: title, content: body }).then(function (res) {
      if (res && res.error) { alert(res.error); return; }
      ta.value = '';
      document.getElementById('fcb-submit-btn').disabled = true;
      _selectedCat = 'question';
      document.querySelectorAll('.fcb-type-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.val === 'question');
      });
      _currentCat = 'all';
      _currentSort = 'newest';
      document.querySelectorAll('#forum-tabs .filter-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.cat === 'all');
      });
      reloadPosts();
    });
  };

  function _isMockPost(postId) {
    return MOCK_POSTS.findIndex(function (p) { return p.id === postId; }) !== -1;
  }

  // Cập nhật số bình luận trên nút, giữ icon (không dùng getAllPostsAsync -> đỡ 1 request).
  function _setCommentBadge(postId, count) {
    var btn = document.getElementById('fpc-cmtbtn-' + postId);
    if (!btn) return;
    btn.innerHTML = '<span data-icon="message-circle" data-size="13"></span> ' + count + ' bình luận';
    if (window.mountIcons) mountIcons(btn);
  }

  // Tải lại comment 1 post từ API -> cache -> render + cập nhật badge.
  function _refreshComments(postId) {
    return forumApi.getComments(postId).then(function (res) {
      var tree = _buildCommentTree((res && res.comments) || []);
      _commentsCache[postId] = tree;
      forumRenderComments(postId);
      var post = _lastRenderedPosts.find(function (p) { return String(p.id) === String(postId); });
      if (post) post.comments = tree.length;
      _setCommentBadge(postId, tree.length);
    });
  }

  // Tìm 1 comment hoặc reply theo id trong cây (id API là int, onclick truyền string).
  function _findCommentNode(tree, id) {
    for (var i = 0; i < tree.length; i++) {
      if (String(tree[i].id) === String(id)) return tree[i];
      var reps = tree[i].replies || [];
      for (var j = 0; j < reps.length; j++) {
        if (String(reps[j].id) === String(id)) return reps[j];
      }
    }
    return null;
  }

  window.forumToggleComments = function (postId) {
    var section = document.getElementById('fpc-cmt-' + postId);
    var btn = document.getElementById('fpc-cmtbtn-' + postId);
    if (!section) return;
    var isOpen = section.classList.toggle('open');
    if (btn) btn.classList.toggle('active', isOpen);
    if (isOpen) {
      if (_isMockPost(postId)) {
        // Mock posts: render ngay từ MOCK_POSTS
        forumRenderComments(postId);
      } else if (_commentsCache[postId]) {
        // Đã prefetch xong → render ngay, không chờ API
        forumRenderComments(postId);
      } else if (_prefetchInFlight[postId]) {
        // Prefetch đang chạy → chờ nó xong rồi render (không tạo request mới)
        _prefetchInFlight[postId].then(function () {
          forumRenderComments(postId);
        });
      } else {
        // Chưa có gì → fetch + render (fallback)
        _refreshComments(postId);
      }
      setTimeout(function () {
        var inp = document.getElementById('fpc-cmt-inp-' + postId);
        if (inp) inp.focus();
      }, 80);
    }
  };

  window.forumRenderComments = function (postId) {
    var list = document.getElementById('fpc-cmt-list-' + postId);
    if (!list) return;
    var mockPost = MOCK_POSTS.find(function (p) { return p.id === postId; });
    var cmts = mockPost
      ? ((mockPost.commentList || []).slice())
      : ((_commentsCache[postId] || []).slice());
    var sortDir = _cmtSortMap[postId] || 'newest';
    cmts.sort(function (a, b) { return sortDir === 'oldest' ? a.time - b.time : b.time - a.time; });
    if (!cmts.length) {
      list.innerHTML = '<p class="fpc-cmt-empty">Chưa có bình luận nào. Hãy là người đầu tiên! 👋</p>';
      return;
    }
    list.innerHTML = cmts.map(function (c, i) {
      var isLast = (i === cmts.length - 1);
      var reactions = c.reactions || {};
      var myReaction = c.myReaction || null;
      var totalR = Object.values(reactions).reduce(function (a, b) { return a + b; }, 0);
      var reactEmoji = myReaction ? REACT_EMOJIS[myReaction] : '👍';
      var reactLabel = myReaction ? REACT_LABELS[myReaction] : 'Thích';
      var reactCls = myReaction ? 'cmt-reacted-' + myReaction : '';
      var replies = c.replies || [];

      var pickerHtml = Object.keys(REACT_EMOJIS).map(function (k) {
        return '<span class="fpc-cmt-react-item" onclick="forumSetCmtReaction(\'' + postId + '\',\'' + c.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
      }).join('');

      var reactSummaryHtml = '';
      if (totalR > 0) {
        var topEmojis = Object.keys(reactions)
          .filter(function (k) { return reactions[k] > 0; })
          .sort(function (a, b) { return reactions[b] - reactions[a]; })
          .slice(0, 2).map(function (k) { return REACT_EMOJIS[k]; }).join('');
        reactSummaryHtml = '<span class="fpc-cmt-react-summary">' + topEmojis + ' ' + totalR + '</span>';
      }

      var repliesHtml = replies.map(function (r) {
        var rReactions = r.reactions || {};
        var rMyReaction = r.myReaction || null;
        var rTotalR = Object.values(rReactions).reduce(function (a, b) { return a + b; }, 0);
        var rReactEmoji = rMyReaction ? REACT_EMOJIS[rMyReaction] : '👍';
        var rReactLabel = rMyReaction ? REACT_LABELS[rMyReaction] : 'Thích';
        var rReactCls = rMyReaction ? 'cmt-reacted-' + rMyReaction : '';
        var rPickerHtml = Object.keys(REACT_EMOJIS).map(function (k) {
          return '<span class="fpc-cmt-react-item" onclick="forumSetReplyReaction(\'' + postId + '\',\'' + c.id + '\',\'' + r.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
        }).join('');
        var rSummaryHtml = '';
        if (rTotalR > 0) {
          var rTopEmojis = Object.keys(rReactions)
            .filter(function (k) { return rReactions[k] > 0; })
            .sort(function (a, b) { return rReactions[b] - rReactions[a]; })
            .slice(0, 2).map(function (k) { return REACT_EMOJIS[k]; }).join('');
          rSummaryHtml = '<span class="fpc-cmt-react-summary">' + rTopEmojis + ' ' + rTotalR + '</span>';
        }
        return (
          '<div class="fpc-reply-item">' +
          '<div class="fpc-reply-avatar">' + (r.avatar || '🧑') + '</div>' +
          '<div class="fpc-reply-body">' +
          '<div class="fpc-cmt-bubble">' +
          '<span class="fpc-cmt-author">' + escHtml(r.author) + '</span>' +
          (r.replyTo ? '<span class="fpc-reply-to"> @' + escHtml(r.replyTo) + '</span> ' : '') +
          '<p class="fpc-cmt-text">' + escHtml(r.text) + '</p>' +
          '</div>' +
          '<div class="fpc-cmt-actions">' +
          '<span class="fpc-cmt-time-inline">' + timeAgo(r.time) + '</span>' +
          '<div class="fpc-cmt-react-wrap">' +
          '<button class="fpc-cmt-act-btn fpc-cmt-like-btn ' + rReactCls + '" onclick="forumSetReplyReaction(\'' + postId + '\',\'' + c.id + '\',\'' + r.id + '\',\'' + (rMyReaction || 'like') + '\')">' +
          rReactEmoji + ' ' + rReactLabel +
          '</button>' +
          '<div class="fpc-cmt-reaction-picker">' + rPickerHtml + '</div>' +
          '</div>' +
          rSummaryHtml +
          '<button class="fpc-cmt-act-btn fpc-cmt-reply-btn" onclick="forumToggleReply(\'' + postId + '\',\'' + c.id + '\',\'' + escHtml(r.author) + '\')">Trả lời</button>' +
          '</div>' +
          '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="fpc-cmt-item" id="fpc-ci-' + postId + '-' + c.id + '">' +
        '<div class="fpc-cmt-avatar-col">' +
        '<div class="fpc-cmt-avatar">' + (c.avatar || '🧑') + '</div>' +
        '<div class="fpc-cmt-vline"></div>' +
        '</div>' +
        '<div class="fpc-cmt-body">' +
        '<div class="fpc-cmt-bubble">' +
        '<span class="fpc-cmt-author">' + escHtml(c.author) + '</span>' +
        '<p class="fpc-cmt-text">' + escHtml(c.text) + '</p>' +
        '</div>' +
        '<div class="fpc-cmt-actions">' +
        '<span class="fpc-cmt-time-inline">' + timeAgo(c.time) + '</span>' +
        '<div class="fpc-cmt-react-wrap">' +
        '<button class="fpc-cmt-act-btn fpc-cmt-like-btn ' + reactCls + '" onclick="forumSetCmtReaction(\'' + postId + '\',\'' + c.id + '\',\'' + (myReaction || 'like') + '\')">' +
        reactEmoji + ' ' + reactLabel +
        '</button>' +
        '<div class="fpc-cmt-reaction-picker">' + pickerHtml + '</div>' +
        '</div>' +
        reactSummaryHtml +
        '<button class="fpc-cmt-act-btn fpc-cmt-reply-btn" onclick="forumToggleReply(\'' + postId + '\',\'' + c.id + '\',\'' + escHtml(c.author) + '\')">Trả lời</button>' +
        '</div>' +
        (repliesHtml ? '<div class="fpc-replies-list">' + repliesHtml + '</div>' : '') +
        '<div class="fpc-reply-input-row" id="fpc-reply-row-' + postId + '-' + c.id + '" style="display:none">' +
        '<div class="fpc-reply-avatar">🧑</div>' +
        '<div class="fpc-cmt-compose">' +
        '<input class="fpc-cmt-input" id="fpc-reply-inp-' + postId + '-' + c.id + '" placeholder="Trả lời ' + escHtml(c.author) + '..." ' +
        'onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();forumAddReply(\'' + postId + '\',\'' + c.id + '\');}" />' +
        '<button class="fpc-cmt-send" onclick="forumAddReply(\'' + postId + '\',\'' + c.id + '\')" title="Gửi">↑</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    }).join('');
  };

  window.forumAddComment = function (postId) {
    var inp = document.getElementById('fpc-cmt-inp-' + postId);
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    var mockIdx = MOCK_POSTS.findIndex(function (p) { return p.id === postId; });

    if (mockIdx !== -1) {
      // MOCK_POSTS (chỉ admin) — thao tác cục bộ
      var nameEl = document.getElementById('chip-name');
      var comment = {
        id: 'c' + Date.now(),
        author: (nameEl && nameEl.textContent.trim() && nameEl.textContent.trim() !== '—') ? nameEl.textContent.trim() : 'Bạn',
        avatar: '🧑', time: Date.now(), text: text,
      };
      if (!MOCK_POSTS[mockIdx].commentList) MOCK_POSTS[mockIdx].commentList = [];
      MOCK_POSTS[mockIdx].commentList.push(comment);
      MOCK_POSTS[mockIdx].comments = MOCK_POSTS[mockIdx].commentList.length;
      inp.value = '';
      forumRenderComments(postId);
      _setCommentBadge(postId, MOCK_POSTS[mockIdx].comments);
      return;
    }
    // Bài thật — optimistic: hiển thị comment ngay, API chạy nền
    inp.value = '';
    var nameEl = document.getElementById('chip-name');
    var myName = (nameEl && nameEl.textContent.trim() && nameEl.textContent.trim() !== '—') ? nameEl.textContent.trim() : 'Bạn';
    var tempComment = {
      id: 'temp-' + Date.now(), author: myName, avatar: '🧑',
      time: Date.now(), text: text,
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      myReaction: null, replies: []
    };
    // Thêm vào cache ngay
    if (!_commentsCache[postId]) _commentsCache[postId] = [];
    _commentsCache[postId].push(tempComment);
    forumRenderComments(postId);
    // Cập nhật badge số comment
    var post = _lastRenderedPosts.find(function (p) { return String(p.id) === String(postId); });
    if (post) { post.comments = _commentsCache[postId].length; }
    _setCommentBadge(postId, _commentsCache[postId].length);
    // Scroll tới comment mới
    var listEl = document.getElementById('fpc-cmt-list-' + postId);
    if (listEl && listEl.lastElementChild)
      listEl.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // API nền — refresh cache từ server (silent, không re-render nếu không cần)
    forumApi.addComment(postId, text, null).then(function (res) {
      if (res && res.error) { alert(res.error); return; }
      // Refresh cache từ server để có ID thật + dữ liệu chính xác
      _refreshComments(postId);
    });
  };

  window.forumSetCmtSort = function (postId, dir) {
    _cmtSortMap[postId] = dir;
    ['newest', 'oldest'].forEach(function (d) {
      var btn = document.getElementById('fpc-csort-' + d + '-' + postId);
      if (btn) btn.classList.toggle('active', d === dir);
    });
    forumRenderComments(postId);
  };

  // Toggle reaction cục bộ trên 1 node (dùng cho MOCK_POSTS).
  function _applyReactionLocal(node, key) {
    if (!node) return;
    if (!node.reactions) node.reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    var prev = node.myReaction || null;
    if (prev === key) {
      node.myReaction = null;
      if (node.reactions[key] > 0) node.reactions[key]--;
    } else {
      if (prev && node.reactions[prev] > 0) node.reactions[prev]--;
      node.myReaction = key;
      node.reactions[key] = (node.reactions[key] || 0) + 1;
    }
  }

  /* ── Patch DOM tại chỗ cho reaction comment — không re-render toàn bộ comment list ── */
  function _patchCmtReactionDOM(postId, targetId, reactions, myReaction) {
    // Tìm comment item chứa reaction cần patch
    var commentEl = document.getElementById('fpc-ci-' + postId + '-' + targetId);
    // Nếu không tìm thấy (có thể là reply), tìm trong toàn bộ comment section
    if (!commentEl) {
      var section = document.getElementById('fpc-cmt-' + postId);
      if (!section) return;
      // Tìm bất kỳ phần tử nào có onclick chứa targetId
      var allBtns = section.querySelectorAll('.fpc-cmt-like-btn');
      for (var i = 0; i < allBtns.length; i++) {
        var onclick = allBtns[i].getAttribute('onclick') || '';
        if (onclick.indexOf("'" + targetId + "'") !== -1) {
          commentEl = allBtns[i].closest('.fpc-cmt-item, .fpc-reply-item');
          break;
        }
      }
    }
    if (!commentEl) return;

    var totalR = Object.values(reactions).reduce(function (a, b) { return a + b; }, 0);
    var reactEmoji = myReaction ? REACT_EMOJIS[myReaction] : '👍';
    var reactLabel = myReaction ? REACT_LABELS[myReaction] : 'Thích';
    var reactCls = myReaction ? 'cmt-reacted-' + myReaction : '';

    // Update the like button
    var likeBtn = commentEl.querySelector('.fpc-cmt-like-btn');
    if (likeBtn) {
      likeBtn.className = 'fpc-cmt-act-btn fpc-cmt-like-btn ' + reactCls;
      likeBtn.innerHTML = reactEmoji + ' ' + reactLabel;
      // Pop animation
      likeBtn.style.transform = 'scale(1.2)';
      setTimeout(function () { likeBtn.style.transform = ''; }, 180);
    }

    // Update reaction summary
    var actions = commentEl.querySelector('.fpc-cmt-actions');
    if (actions) {
      var summaryEl = actions.querySelector('.fpc-cmt-react-summary');
      if (totalR > 0) {
        var topEmojis = Object.keys(reactions)
          .filter(function (k) { return reactions[k] > 0; })
          .sort(function (a, b) { return reactions[b] - reactions[a]; })
          .slice(0, 2).map(function (k) { return REACT_EMOJIS[k]; }).join('');
        if (summaryEl) {
          summaryEl.innerHTML = topEmojis + ' ' + totalR;
        } else {
          var span = document.createElement('span');
          span.className = 'fpc-cmt-react-summary';
          span.innerHTML = topEmojis + ' ' + totalR;
          // Insert after the react-wrap
          var reactWrap = actions.querySelector('.fpc-cmt-react-wrap');
          if (reactWrap && reactWrap.nextSibling) {
            actions.insertBefore(span, reactWrap.nextSibling);
          } else {
            actions.appendChild(span);
          }
        }
      } else if (summaryEl) {
        summaryEl.remove();
      }
    }
  }

  // React trên 1 comment/reply bất kỳ (targetId là comment id thật). Dùng chung
  // cho cả comment gốc lẫn reply — backend cùng bảng comment_likes, cùng endpoint.
  function _reactOnComment(postId, targetId, key, findInMock) {
    var mockIdx = MOCK_POSTS.findIndex(function (p) { return p.id === postId; });
    if (mockIdx !== -1) {
      var mockNode = findInMock(MOCK_POSTS[mockIdx]);
      _applyReactionLocal(mockNode, key);
      if (mockNode) _patchCmtReactionDOM(postId, targetId, mockNode.reactions, mockNode.myReaction);
      return;
    }
    // Optimistic: update data + DOM ngay
    var node = _findCommentNode(_commentsCache[postId] || [], targetId);
    if (node) {
      _applyReactionLocal(node, key);
      _patchCmtReactionDOM(postId, targetId, node.reactions, node.myReaction);
    }
    // API chạy nền — reconcile nếu server trả khác
    forumApi.reactComment(targetId, key).then(function (res) {
      if (!res || res.error) return;
      if (node) {
        node.reactions = res.reactions;
        node.myReaction = res.my_reaction;
        _patchCmtReactionDOM(postId, targetId, res.reactions, res.my_reaction);
      }
    });
  }

  window.forumSetCmtReaction = function (postId, cmtId, key) {
    _reactOnComment(postId, cmtId, key, function (post) {
      return (post.commentList || []).find(function (c) { return c.id === cmtId; });
    });
  };

  window.forumSetReplyReaction = function (postId, cmtId, replyId, key) {
    _reactOnComment(postId, replyId, key, function (post) {
      var cmt = (post.commentList || []).find(function (c) { return c.id === cmtId; });
      return cmt && (cmt.replies || []).find(function (r) { return r.id === replyId; });
    });
  };

  window.forumToggleReply = function (postId, cmtId, mentionName) {
    var row = document.getElementById('fpc-reply-row-' + postId + '-' + cmtId);
    if (!row) return;
    var inp = document.getElementById('fpc-reply-inp-' + postId + '-' + cmtId);
    var alreadyOpen = row.style.display !== 'none';
    var prevMention = row.dataset.mention || '';
    if (alreadyOpen && prevMention === mentionName) {
      row.style.display = 'none';
      row.dataset.mention = '';
      return;
    }
    row.style.display = 'flex';
    row.dataset.mention = mentionName;
    if (inp) {
      inp.placeholder = 'Trả lời ' + mentionName + '...';
      setTimeout(function () { inp.focus(); }, 30);
    }
  };

  window.forumAddReply = function (postId, cmtId) {
    var inp = document.getElementById('fpc-reply-inp-' + postId + '-' + cmtId);
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    var mockIdx = MOCK_POSTS.findIndex(function (p) { return p.id === postId; });

    if (mockIdx !== -1) {
      // MOCK_POSTS (chỉ admin) — thao tác cục bộ
      var nameEl = document.getElementById('chip-name');
      var myName = (nameEl && nameEl.textContent.trim() !== '—') ? nameEl.textContent.trim() : 'Bạn';
      var row = document.getElementById('fpc-reply-row-' + postId + '-' + cmtId);
      var replyTo = (row && row.dataset.mention) || '';
      var cmt = (MOCK_POSTS[mockIdx].commentList || []).find(function (c) { return c.id === cmtId; });
      if (cmt) {
        if (!cmt.replies) cmt.replies = [];
        cmt.replies.push({ id: 'r' + Date.now(), author: myName, avatar: '🧑', time: Date.now(), text: text, replyTo: replyTo || cmt.author });
      }
      inp.value = '';
      forumRenderComments(postId);
      return;
    }
    // Bài thật — optimistic: hiển thị reply ngay, API chạy nền
    inp.value = '';
    var nameEl2 = document.getElementById('chip-name');
    var myName2 = (nameEl2 && nameEl2.textContent.trim() !== '—') ? nameEl2.textContent.trim() : 'Bạn';
    var row = document.getElementById('fpc-reply-row-' + postId + '-' + cmtId);
    var replyTo = (row && row.dataset.mention) || '';
    // Thêm reply vào cache ngay
    var parentCmt = _findCommentNode(_commentsCache[postId] || [], cmtId);
    if (parentCmt) {
      if (!parentCmt.replies) parentCmt.replies = [];
      parentCmt.replies.push({
        id: 'temp-r-' + Date.now(), author: myName2, avatar: '🧑',
        time: Date.now(), text: text, replyTo: replyTo || parentCmt.author,
        reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
        myReaction: null
      });
    }
    forumRenderComments(postId);
    // Scroll tới comment cha
    setTimeout(function () {
      var item = document.getElementById('fpc-ci-' + postId + '-' + cmtId);
      if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
    // API nền
    forumApi.addComment(postId, text, cmtId).then(function (res) {
      if (res && res.error) { alert(res.error); return; }
      _refreshComments(postId);
    });
  };

  var _origNavigateForum = window.navigate;
  window.navigate = function (page) {
    _origNavigateForum(page);
    if (page === 'forum') renderPosts();
  };

  /* Trang của tôi (IIFE khác) cần gọi lại API + helper của diễn đàn để render
     "Bài đăng của tôi" — expose qua window vì khác scope. */
  window.forumApi = forumApi;
  window.forumShared = {
    apiPostToUi: _apiPostToUi,
    timeAgo: timeAgo,
    escHtml: escHtml,
    CAT_LABELS: CAT_LABELS,
    CAT_COLORS: CAT_COLORS,
    CAT_BG: CAT_BG
  };

})();

/* ═══════════════════════════════════════════════════════
   Trang của tôi — profile page hook
   ═══════════════════════════════════════════════════════ */
(function () {
  var _origNavigateProfile = window.navigate;
  window.navigate = function (page) {
    _origNavigateProfile(page);
    if (page === 'profile') _loadProfile();
  };

  /* ── Kinh nghiệm bài học (XP chart) — dữ liệu thật từ lesson_progress ── */
  function _courseIcon(courseId) {
    var c = (window.enrolledCourses || []).filter(function (x) { return x.id === courseId; })[0];
    return (c && c.icon) || '📘';
  }

  function _renderXPChart() {
    var container = document.getElementById('prof-xp-rows');
    if (!container) return;
    container.innerHTML = '<div class="prof-empty">Đang tải...</div>';
    fetch('/api/stats/xp-by-course')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var subjects = (d && d.subjects) || [];
        if (!subjects.length) {
          container.innerHTML = '<div class="prof-empty">Chưa có XP nào — hoàn thành bài học để tích lũy.</div>';
          return;
        }
        // Thang đo: max XP làm tròn lên bội 100 để bar tỉ lệ hợp lý
        var maxXp = Math.max.apply(null, subjects.map(function (s) { return s.xp; }));
        var scale = Math.max(100, Math.ceil(maxXp / 100) * 100);
        container.innerHTML = subjects.map(function (s) {
          var pct = Math.round(s.xp / scale * 100);
          return '<div class="prof-xp-row">'
            + '<span class="prof-xp-row-icon">' + _courseIcon(s.courseId) + '</span>'
            + '<span class="prof-xp-row-name">' + window.forumShared.escHtml(String(s.title)) + '</span>'
            + '<div class="prof-xp-bar-wrap">'
            + '<div class="prof-xp-bar-fill" style="width:0%"'
            + ' data-pct="' + pct + '"></div>'
            + '</div>'
            + '<span class="prof-xp-row-val">' + s.xp + ' XP</span>'
            + '</div>';
        }).join('');
        /* animate bars after paint */
        requestAnimationFrame(function () {
          container.querySelectorAll('.prof-xp-bar-fill').forEach(function (bar) {
            bar.style.width = bar.getAttribute('data-pct') + '%';
          });
        });
      })
      .catch(function () {
        container.innerHTML = '<div class="prof-empty">Không thể tải dữ liệu XP.</div>';
      });
  }

  window.navigateToSkills = function () {
    window.navigate('skills');
    var skillsPage = document.getElementById('page-skills');
    if (skillsPage && !skillsPage.classList.contains('active')) {
      document.querySelectorAll('.page').forEach(function (p) {
        p.classList.remove('active');
      });
      skillsPage.classList.add('active');
      if (typeof window._loadSkillsGlobal === 'function') window._loadSkillsGlobal();
    }
  };

  function _loadProfile() {
    // Tên & email: lấy từ data đã load sẵn trong settings
    var name = (document.getElementById('chip-name') || {}).textContent || '—';
    var email = (document.getElementById('settings-profile-email') || {}).textContent || '—';
    _set('prof-name', name === '—' ? (document.getElementById('udh-name') || {}).textContent || '—' : name);
    _set('prof-email', email);

    // Số khóa đang học
    _set('prof-enrolled', enrolledCourses ? enrolledCourses.length : '—');

    // prof-streak: lấy trực tiếp từ /api/stats thay vì scrape DOM (không tồn tại)
    fetch('/api/stats')
      .then(function (r) { return r.json(); })
      .then(function (d) { _set('prof-streak', d.streakDays); })
      .catch(function () { /* giữ nguyên '—' nếu lỗi */ });

    // prof-done: cộng completedLessons từ enrolledCourses đã có sẵn, không gọi thêm API
    var totalDone = (enrolledCourses || []).reduce(function (sum, c) {
      return sum + (c.completedLessons || 0);
    }, 0);
    _set('prof-done', totalDone);

    // Thành tích: đếm thật từ API /api/achievements
    fetch('/api/achievements')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && typeof d.unlockedCount === 'number') {
          _set('prof-achievements', d.unlockedCount + '/' + d.totalCount);
        }
      })
      .catch(function () { /* giữ nguyên '—' nếu lỗi */ });

    // Kỹ năng: đếm thật từ API /api/skills (trước đây scrape #sk-grid,
    // chỉ có sau khi user mở trang Kỹ năng nên thường trống)
    fetch('/api/skills')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var total = 0;
        ((d && d.skill_sets) || []).forEach(function (bs) {
          total += (bs.skills || []).length;
        });
        _set('prof-skills', total);
      })
      .catch(function () { /* giữ nguyên '—' nếu lỗi */ });

    // Khóa học đang học: render từ enrolledCourses
    _renderProfCourses();

    // XP chart
    _renderXPChart();

    // Forum posts của user
    _renderProfPosts();
  }

  function _set(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function _renderProfCourses() {
    var list = document.getElementById('prof-course-list');
    if (!list) return;
    if (!enrolledCourses || !enrolledCourses.length) {
      list.innerHTML = '<div class="prof-empty">Chưa đăng ký khóa học nào.</div>';
      return;
    }
    list.innerHTML = enrolledCourses.slice(0, 4).map(function (c) {
      var pct = c.progress || 0;
      return '<div class="prof-course-item">'
        + '<div class="prof-ci-icon">' + (c.icon || '📖') + '</div>'
        + '<div class="prof-ci-body">'
        + '<div class="prof-ci-name">' + (c.title || c.name || 'Khóa học') + '</div>'
        + '<div class="prof-ci-bar"><div class="prof-ci-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="prof-ci-pct">' + pct + '% hoàn thành</div>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  /* ── Forum posts của user trên profile ── */
  function _renderProfPosts() {
    var list = document.getElementById('prof-post-list');
    if (!list) return;
    list.innerHTML = '<div class="prof-empty">Đang tải...</div>';

    // Bài của chính user hiện tại, lấy từ DB (server tự lọc theo session).
    // Dùng window.forumApi/forumShared — forumApi gốc nằm ở IIFE diễn đàn,
    // gọi trực tiếp ở đây là ReferenceError khiến ô này kẹt "Đang tải...".
    var fs = window.forumShared;
    window.forumApi.getPosts({ mine: true }).then(function (res) {
      var myPosts = ((res && res.posts) || []).map(fs.apiPostToUi);
      if (!myPosts.length) {
        list.innerHTML = '<div class="prof-empty">Chưa có bài đăng nào.</div>';
        return;
      }
      list.innerHTML = myPosts.map(function (p) {
        var catColor = fs.CAT_COLORS[p.cat] || '#6B7280';
        var catBg = fs.CAT_BG[p.cat] || '#F3F4F6';
        var catLabel = fs.CAT_LABELS[p.cat] || p.cat;
        var excerpt = p.body.length > 120 ? p.body.slice(0, 117) + '...' : p.body;
        var totalR = Object.values(p.reactions || {}).reduce(function (a, b) { return a + b; }, 0);
        return (
          '<div class="prof-post-card" onclick="window.forumOpenPost && window.forumOpenPost(\'' + p.id + '\')" style="cursor:pointer;">' +
            '<div class="prof-post-top">' +
              '<span class="prof-post-cat" style="background:' + catBg + ';color:' + catColor + '">' + catLabel + '</span>' +
              '<span class="prof-post-time">' + fs.timeAgo(p.time) + '</span>' +
            '</div>' +
            '<div class="prof-post-title">' + fs.escHtml(p.title) + '</div>' +
            '<div class="prof-post-excerpt">' + fs.escHtml(excerpt) + '</div>' +
            '<div class="prof-post-stats">' +
              '<span>👍 ' + totalR + '</span>' +
              '<span>💬 ' + (p.comments || 0) + '</span>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }).catch(function () {
      list.innerHTML = '<div class="prof-empty">Không thể tải bài đăng.</div>';
    });
  }
})();

/* ═══════════════════════════════════════════════════════
   Search bars — Dashboard, Roadmap, Skills, Forum
   ═══════════════════════════════════════════════════════ */
function _sbToggleClear(clearId, val) {
  var btn = document.getElementById(clearId);
  if (btn) btn.style.display = val ? 'flex' : 'none';
}

function dashSearch(val) {
  _sbToggleClear('dash-search-clear', val);
  var q = val.trim().toLowerCase();
  var cards = document.querySelectorAll('#enrolled-list .enrolled-card');
  var hasVisible = false;
  cards.forEach(function (card) {
    var title = (card.querySelector('h3') || {}).textContent || '';
    var sub = (card.querySelector('.subtitle') || {}).textContent || '';
    var match = !q || title.toLowerCase().includes(q) || sub.toLowerCase().includes(q);
    card.style.display = match ? '' : 'none';
    if (match) hasVisible = true;
  });
  var empty = document.getElementById('dash-search-empty');
  if (empty) empty.style.display = (q && !hasVisible) ? 'block' : 'none';
}

function dashClearSearch() {
  var el = document.getElementById('dash-search-input');
  if (el) { el.value = ''; dashSearch(''); el.focus(); }
}

function roadmapSearch(val) {
  _sbToggleClear('roadmap-search-clear', val);
  var q = val.trim().toLowerCase();
  if (!q) return;
  var tabs = document.querySelectorAll('#roadmap-tabs .filter-btn');
  var matched = null;
  tabs.forEach(function (tab) {
    if (!matched && tab.textContent.toLowerCase().includes(q)) matched = tab;
  });
  if (matched) matched.click();
}

function roadmapClearSearch() {
  var el = document.getElementById('roadmap-search-input');
  if (el) { el.value = ''; _sbToggleClear('roadmap-search-clear', ''); el.focus(); }
}

function skillsSearch(val) {
  _sbToggleClear('skills-search-clear', val);
  var q = val.trim().toLowerCase();
  var sets = document.querySelectorAll('#sk-grid .sk-set');
  var hasVisible = false;
  sets.forEach(function (set) {
    var setTitle = (set.querySelector('.sk-set-title') || {}).textContent || '';
    var skills = set.querySelectorAll('.sk-skill-name');
    var skillMatch = false;
    skills.forEach(function (sk) {
      if (sk.textContent.toLowerCase().includes(q)) skillMatch = true;
    });
    var match = !q || setTitle.toLowerCase().includes(q) || skillMatch;
    set.style.display = match ? '' : 'none';
    if (match) hasVisible = true;
  });
  var empty = document.getElementById('skills-search-empty');
  if (empty) empty.style.display = (q && !hasVisible) ? 'block' : 'none';
}

function skillsClearSearch() {
  var el = document.getElementById('skills-search-input');
  if (el) { el.value = ''; skillsSearch(''); el.focus(); }
}

var _forumTextQ = '';

function forumSearch(val) {
  _sbToggleClear('forum-search-clear', val);
  _forumTextQ = val.trim().toLowerCase();
  renderPosts();
}

function forumClearSearch() {
  var el = document.getElementById('forum-search-input');
  if (el) { el.value = ''; forumSearch(''); el.focus(); }
}

/* ═══════════════════════════════════════════════════════
   Popup nhắc giữ chuỗi học
   ═══════════════════════════════════════════════════════ */
(function () {
  function streakShouldShow() {
    return new URLSearchParams(window.location.search).get('streak') === '1';
  }

  function streakCleanUrl() {
    var url = new URL(window.location.href);
    url.searchParams.delete('streak');
    history.replaceState(null, '', url.toString());
  }

  window.streakClose = function () {
    var el = document.getElementById('streakPopup');
    if (el) {
      el.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.streakGoLearn = function () {
    streakClose();
    if (typeof navigate === 'function') navigate('courses');
  };

  document.addEventListener('click', function (e) {
    var popup = document.getElementById('streakPopup');
    if (popup && e.target === popup) streakClose();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var popup = document.getElementById('streakPopup');
      if (popup && popup.classList.contains('active')) streakClose();
    }
  });

  function streakShow() {
    if (!streakShouldShow()) return;
    streakCleanUrl();
    var el = document.getElementById('streakPopup');
    if (!el) return;
    document.body.style.overflow = 'hidden';
    el.classList.add('active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(streakShow, 800);
    });
  } else {
    setTimeout(streakShow, 800);
  }
})();

/* ═══════════════════════════════════════════════════════
   Dashboard redesign — Leaderboard + Mini Roadmap Canvas
   (Thêm bởi patch ngày 2026-06-17, KHÔNG xoá các block phía trên)
   ═══════════════════════════════════════════════════════ */
(function () {
  var _currentLbType = 'weekly';
  var _lbLoaded = { weekly: false, streak: false, friends: false };
  var _lbData = { weekly: null, streak: null, friends: null };
  var _miniRmLoaded = false;

  /* ─── Leaderboard ─── */
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderLeaderboard(data) {
    var meta = document.getElementById('lb-meta');
    var list = document.getElementById('lb-list');
    var me = document.getElementById('lb-me');
    if (!list) return;

    if (!data || !data.entries) {
      meta.textContent = 'Không tải được bảng xếp hạng.';
      list.innerHTML = '<li class="lb-skel">Vui lòng thử lại sau.</li>';
      if (me) me.hidden = true;
      return;
    }

    var unit = data.unit || 'XP';
    var label = data.label || '';
    var meInfo = data.me;

    var inTop = false;
    if (meInfo) {
      for (var i = 0; i < data.entries.length; i++) {
        if (data.entries[i].id && meInfo.id && data.entries[i].id === meInfo.id) {
          inTop = true; break;
        }
        // mock friends không có id thật, fallback so sánh name + value
        if (data.type === 'friends' && data.entries[i].name === meInfo.name
          && data.entries[i].value === meInfo.value) {
          inTop = true; break;
        }
      }
    }

    meta.textContent = label + ' · Top ' + data.entries.length + ' học viên';

    list.innerHTML = data.entries.map(function (e) {
      var rankCls = '';
      if (e.rank === 1) rankCls = 'lb-top1';
      else if (e.rank === 2) rankCls = 'lb-top2';
      else if (e.rank === 3) rankCls = 'lb-top3';
      var isMe = false;
      if (meInfo) {
        if (e.id && meInfo.id && e.id === meInfo.id) isMe = true;
        else if (e.name === meInfo.name && e.value === meInfo.value) isMe = true;
      }
      var medal = e.medal || '';
      return (
        '<li class="lb-row ' + rankCls + (isMe ? ' lb-row-me' : '') + '">' +
        '<div class="lb-rank">' +
        '<span class="lb-rank-text">' + escHtml(medal) + '</span>' +
        '<span class="lb-rank-num">#' + e.rank + '</span>' +
        '</div>' +
        '<div class="lb-avatar">' + escHtml(e.avatar || '🧑') + '</div>' +
        '<div class="lb-info">' +
        '<div class="lb-name">' + escHtml(e.name) + (isMe ? ' (Bạn)' : '') + '</div>' +
        '</div>' +
        '<div class="lb-value">' + formatValue(e.value, unit) + '</div>' +
        '</li>'
      );
    }).join('');

    if (meInfo && !inTop) {
      me.hidden = false;
      me.innerHTML =
        '<div class="lb-me-label">Vị trí của bạn</div>' +
        '<li class="lb-row lb-row-me">' +
        '<div class="lb-rank"><span class="lb-rank-num">#' + meInfo.rank + '</span></div>' +
        '<div class="lb-avatar">' + escHtml(meInfo.avatar || '🧑') + '</div>' +
        '<div class="lb-info">' +
        '<div class="lb-name">' + escHtml(meInfo.name) + ' (Bạn)</div>' +
        '</div>' +
        '<div class="lb-value">' + formatValue(meInfo.value, unit) + '</div>' +
        '</li>';
    } else if (me) {
      me.hidden = true;
    }
  }

  function formatValue(v, unit) {
    if (v == null) return '—';
    if (unit === 'ngày') return v + ' ngày';
    return Number(v).toLocaleString('vi-VN') + ' XP';
  }

  function loadLeaderboard(type) {
    type = type || _currentLbType;
    _currentLbType = type;
    var list = document.getElementById('lb-list');
    var meta = document.getElementById('lb-meta');
    var me = document.getElementById('lb-me');
    if (!list) return;
    if (meta) meta.textContent = 'Đang tải…';
    list.innerHTML = '<li class="lb-skel">Đang tải bảng xếp hạng…</li>';
    if (me) me.hidden = true;

    // Cache hit
    if (_lbLoaded[type] && _lbData[type]) {
      renderLeaderboard(_lbData[type]);
      return;
    }

    fetch(API + '/leaderboard?type=' + encodeURIComponent(type))
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _lbLoaded[type] = true;
        _lbData[type] = data;
        if (_currentLbType === type) renderLeaderboard(data);
      })
      .catch(function () {
        if (meta) meta.textContent = 'Lỗi tải bảng xếp hạng.';
        list.innerHTML = '<li class="lb-skel">Không tải được dữ liệu.</li>';
      });
  }

  // Expose to window for inline onclick
  window.setLbTab = function (type, btn) {
    var tabs = document.querySelectorAll('.lb-tab');
    tabs.forEach(function (t) {
      var active = t === btn;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    loadLeaderboard(type);
  };

  // Khởi tạo listener cho các nút tab (dùng delegation để tránh phải gọi lại)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.lb-tab');
    if (!btn) return;
    var type = btn.getAttribute('data-type');
    if (!type) return;
    window.setLbTab(type, btn);
  });

  /* ─── Mini roadmap canvas ─── */
  // Vẽ zigzag 6 node trong 1 canvas cố định (height 420, width theo container)
  var POSITIONS = [
    { x: 28, y: 14 },
    { x: 72, y: 28 },
    { x: 28, y: 44 },
    { x: 72, y: 60 },
    { x: 28, y: 76 },
    { x: 72, y: 90 },
  ];

  function classifyNode(c) {
    if (!c) return 'locked';
    var p = Number(c.progress || 0);
    if (p >= 100) return 'done';
    if (p > 0) return 'current';
    return 'locked';
  }

  function renderMiniCanvas(courses) {
    var canvas = document.getElementById('mini-rm-canvas');
    if (!canvas) return;

    if (!courses || !courses.length) {
      canvas.innerHTML =
        '<div class="mini-rm-empty">' +
        '<div class="mini-rm-empty-icon">🗺</div>' +
        '<div>Bạn chưa đăng ký khóa học nào.<br>Hãy bắt đầu hành trình học lập trình nhé!</div>' +
        '<a class="mini-rm-empty-cta" href="#" onclick="navigate(\'courses\');return false;">Khám phá khóa học</a>' +
        '</div>';
      return;
    }

    // Pad thêm "khoá học tiếp theo" nếu có enrolled ít hơn 6
    var nodes = courses.slice(0, 6);
    var svgW = canvas.clientWidth || 320;
    var svgH = canvas.clientHeight || 420;

    var svgPaths = '';
    for (var i = 0; i < nodes.length - 1; i++) {
      var a = POSITIONS[i], b = POSITIONS[i + 1];
      var x1 = (a.x / 100) * svgW, y1 = (a.y / 100) * svgH;
      var x2 = (b.x / 100) * svgW, y2 = (b.y / 100) * svgH;
      // Đường cong Bezier đơn giản
      var midX = (x1 + x2) / 2;
      var path = 'M ' + x1 + ' ' + y1 + ' C ' + midX + ' ' + y1 + ', ' + midX + ' ' + y2 + ', ' + x2 + ' ' + y2;
      var isActive = classifyNode(nodes[i]) === 'done' || classifyNode(nodes[i]) === 'current';
      svgPaths += '<path id="mini-rm-path-' + i + '" class="mini-rm-arrow ' + (isActive ? 'mini-rm-arrow--solid' : '') + '" d="' + path + '"></path>';
    }

    // Truck animation: chạy từ current node đến next node. Tìm index current.
    var currentIdx = -1;
    nodes.forEach(function (c, i) {
      if (classifyNode(c) === 'current') currentIdx = i;
    });

    var html = '<svg class="mini-rm-arrows" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="none">' + svgPaths;
    if (currentIdx >= 0 && currentIdx < nodes.length - 1) {
      html += '<g class="mini-rm-truck">' +
              '<circle r="11" fill="#FCD34D" stroke="#F59E0B" stroke-width="2"/>' +
              '<text x="0" y="5" text-anchor="middle" font-size="14">🚚</text>' +
              '<animateMotion dur="6s" repeatCount="indefinite" rotate="auto">' +
              '<mpath href="#mini-rm-path-' + currentIdx + '"/>' +
              '</animateMotion>' +
              '</g>';
    }
    html += '</svg>';
    nodes.forEach(function (c, i) {
      var pos = POSITIONS[i];
      var status = classifyNode(c);
      var lessons = (c.completedLessons != null ? c.completedLessons : 0) + '/' + (c.totalLessons || 0);
      var sub = status === 'done' ? '✓ Hoàn thành'
        : status === 'current' ? (c.progress || 0) + '% · ' + lessons
          : 'Bấm để bắt đầu';
      var onClick = "window.location.href='" + (window.COURSE_URLS && window.COURSE_URLS[c.id]
        ? window.COURSE_URLS[c.id]
        : '/interface') + "'";
      html +=
        '<div class="mini-rm-node mini-rm-node--' + status + '"' +
        ' style="left:' + pos.x + '%; top:' + pos.y + '%;"' +
        ' onclick="' + onClick + '"' +
        ' title="' + escHtml(c.title || '') + '">' +
        '<div class="mini-rm-node-icon">' + escHtml(c.icon || '📘') + '</div>' +
        '<div class="mini-rm-node-body">' +
        '<div class="mini-rm-node-title">' + escHtml(c.title || 'Khóa học') + '</div>' +
        '<div class="mini-rm-node-sub">' + escHtml(sub) + '</div>' +
        '</div>' +
        '</div>';
    });

    canvas.innerHTML = html;
  }

  function loadMiniRoadmap() {
    // Nếu main.js đã load enrolledCourses → render luôn
    if (window.enrolledCourses && window.enrolledCourses.length) {
      renderMiniCanvas(window.enrolledCourses);
      _miniRmLoaded = true;
      return;
    }
    if (_miniRmLoaded) return;
    _miniRmLoaded = true;

    // 1) Ưu tiên dùng cache enrolledCourses của main.js
    if (window.enrolledCourses && window.enrolledCourses.length) {
      renderMiniCanvas(window.enrolledCourses);
      return;
    }

    // 2) Fallback fetch /api/enrolled
    fetch(API + '/enrolled')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        renderMiniCanvas(data || []);
        // Watch: main.js may load enrolledCourses sau → re-render khi có
        var tries = 0;
        var iv = setInterval(function () {
          tries++;
          if (window.enrolledCourses && window.enrolledCourses.length) {
            renderMiniCanvas(window.enrolledCourses);
            clearInterval(iv);
          } else if (tries > 20) {
            clearInterval(iv);
          }
        }, 500);
      })
      .catch(function () {
        renderMiniCanvas([]);
      });
  }

  /* ─── Hook vào navigate() để re-render khi quay lại dashboard ─── */
  // Lưu navigate gốc (nếu có) rồi bọc
  document.addEventListener('DOMContentLoaded', function () {
    // Bỏ qua nếu không có hàm navigate (không phải trang dashboard)
    if (typeof window.navigate !== 'function') return;

    var _origNav = window.navigate;
    if (_origNav.__hookedDashboard) return; // tránh hook 2 lần
    window.navigate = function (page) {
      _origNav(page);
      if (page === 'dashboard') {
        loadLeaderboard('weekly');
        // Vẽ lại canvas với kích thước mới (nếu main.js đã load enrolledCourses)
        if (window.enrolledCourses && window.enrolledCourses.length) {
          // Defer để DOM ổn định
          setTimeout(function () { loadMiniRoadmap(); }, 50);
        }
      }
    };
    window.navigate.__hookedDashboard = true;

    // Lần đầu load
    setTimeout(function () {
      loadLeaderboard('weekly');
      loadMiniRoadmap();
    }, 200);
  });
})();
