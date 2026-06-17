/* ═══════════════════════════════════════════════════════
   dashboard.js — tất cả JS riêng cho dashboard.html
   ═══════════════════════════════════════════════════════ */

/* ── User avatar dropdown ── */
function toggleUserMenu() {
  var wrap = document.getElementById('user-chip-wrap');
  var btn  = document.getElementById('user-chip-btn');
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
  var btn  = document.getElementById('user-chip-btn');
  var menu = document.getElementById('user-dropdown');
  menu.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', function(e) {
  var wrap = document.getElementById('user-chip-wrap');
  if (wrap && !wrap.contains(e.target)) closeUserMenu();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeUserMenu();
});

/* Sync tên hiển thị trong dropdown header khi mở */
var _origToggleUserMenu = toggleUserMenu;
toggleUserMenu = function() {
  var n = document.getElementById('chip-name');
  var d = document.getElementById('udh-name');
  if (n && d) d.textContent = n.textContent;
  closeBellPanel();
  _origToggleUserMenu();
};

/* ── Bell notification panel ── */
var _bellNotifs = [
  { icon: '✅', text: 'Bạn đã hoàn thành bài học đầu tiên trong khóa C++!', time: '5 phút trước', unread: true },
  { icon: '🔥', text: 'Streak 7 ngày liên tiếp! Tiếp tục phát huy nhé!', time: '2 giờ trước', unread: true },
  { icon: '📖', text: 'Khóa học Python vừa được cập nhật thêm nội dung mới.', time: 'Hôm qua', unread: true },
  { icon: '🏅', text: 'Bạn đã đạt huy hiệu "Người mới bắt đầu". Chúc mừng!', time: '3 ngày trước', unread: false },
];

function _renderBellItems() {
  var body = document.getElementById('bell-panel-body');
  if (!body) return;
  if (!_bellNotifs.length) {
    body.innerHTML = '<div class="bell-empty"><div class="bell-empty-icon">🔕</div><div>Chưa có thông báo nào</div></div>';
    return;
  }
  body.innerHTML = _bellNotifs.map(function(n, i) {
    return '<div class="bell-item' + (n.unread ? ' unread' : '') + '" onclick="readBellItem(' + i + ')" role="menuitem" tabindex="0">'
      + '<div class="bell-item-icon">' + n.icon + '</div>'
      + '<div class="bell-item-body">'
      + '<div class="bell-item-text">' + n.text + '</div>'
      + '<div class="bell-item-time">' + n.time + '</div>'
      + '</div>'
      + (n.unread ? '<div class="bell-unread-dot"></div>' : '')
      + '</div>';
  }).join('');
}

function _updateBellDot() {
  var dot = document.getElementById('bell-dot');
  if (!dot) return;
  var hasUnread = _bellNotifs.some(function(n) { return n.unread; });
  dot.style.display = hasUnread ? '' : 'none';
}

function toggleBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn   = document.getElementById('bell-btn');
  var open  = panel.classList.contains('open');
  if (open) {
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    closeUserMenu();
    _renderBellItems();
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeBellPanel() {
  var panel = document.getElementById('bell-panel');
  var btn   = document.getElementById('bell-btn');
  if (panel) panel.classList.remove('open');
  if (btn)   btn.setAttribute('aria-expanded', 'false');
}

function readBellItem(idx) {
  if (_bellNotifs[idx]) {
    _bellNotifs[idx].unread = false;
    _renderBellItems();
    _updateBellDot();
  }
}

function markAllBellRead() {
  _bellNotifs.forEach(function(n) { n.unread = false; });
  _renderBellItems();
  _updateBellDot();
}

document.addEventListener('click', function(e) {
  var wrap = document.getElementById('bell-wrap');
  if (wrap && !wrap.contains(e.target)) closeBellPanel();
});
document.addEventListener('keydown', function(e) {
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

document.getElementById('changePasswordModal').addEventListener('click', (e) => {
  if (e.target.id === 'changePasswordModal') closeChangePasswordModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('changePasswordModal').classList.contains('active'))
      closeChangePasswordModal();
    if (document.getElementById('unenrollModal').classList.contains('active'))
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

document.getElementById('cpSubmitBtn').addEventListener('click', function (e) {
  const rect = this.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'cp-ripple';
  ripple.style.width = ripple.style.height = '20px';
  ripple.style.left = (e.clientX - rect.left - 10) + 'px';
  ripple.style.top = (e.clientY - rect.top - 10) + 'px';
  this.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

document.getElementById('cpForm').addEventListener('submit', async (e) => {
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
    sum.innerHTML =
      '<div class="sk-stat"><div class="v">' + total + '</div><div class="l">Tổng kỹ năng</div></div>' +
      '<div class="sk-stat" style="border-color:#D1FAE5"><div class="v" style="color:#10B981">' + achieved + '</div><div class="l">Đã đạt ✓</div></div>' +
      '<div class="sk-stat" style="border-color:#FDE68A"><div class="v" style="color:#F59E0B">' + review + '</div><div class="l">Cần ôn</div></div>' +
      '<div class="sk-stat"><div class="v" style="color:#9CA3AF">' + unstarted + '</div><div class="l">Chưa bắt đầu</div></div>';

    var grid = document.getElementById('sk-grid');
    if (!sets.length) { grid.innerHTML = '<div style="color:#9CA3AF;font-size:14px;padding:24px;">Chưa có dữ liệu kỹ năng.</div>'; return; }

    grid.innerHTML = sets.map(function (bs) {
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

      var setAchieved = bs.skills.filter(function(sk){ return sk.progress >= 70; }).length;
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
          '<span class="sk-arrow">▶</span>' +
        '</div>' +
        '<div class="sk-body" style="display:none">' + skillRows + '</div>' +
      '</div>';
    }).join('');
  }

  function loadSkills() {
    if (_skillsLoaded) return;
    _skillsLoaded = true;
    fetch('/api/skills')
      .then(function (r) { return r.json(); })
      .then(renderSkills)
      .catch(function () {
        document.getElementById('sk-grid').innerHTML =
          '<div style="color:#EF4444;font-size:14px;padding:24px;">Không tải được dữ liệu kỹ năng.</div>';
      });
  }

  var _origNavigate = window.navigate;
  window.navigate = function (page) {
    _origNavigate(page);
    if (page === 'skills') loadSkills();
    if (page === 'roadmap') {
      if (typeof _eduRoadmaps !== 'undefined' && _eduRoadmaps.length) {
        renderEduRoadmapTabs();
        if (window.currentEduRoadmap !== 'personal') {
          _roadmapRenderedId = null;
          renderEduInteractiveRoadmap();
        }
      } else if (typeof loadEduRoadmaps === 'function') {
        loadEduRoadmaps().then(function() { renderEduInteractiveRoadmap(); });
      }
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   Diễn đàn cộng đồng
   ═══════════════════════════════════════════════════════ */
(function () {

  var STORAGE_KEY = 'edu_forum_posts';

  var CAT_LABELS = { question: '❓ Câu hỏi', share: '💡 Chia sẻ', discuss: '🗣️ Thảo luận' };
  var CAT_COLORS = { question: '#3B82F6', share: '#10B981', discuss: '#8B5CF6' };
  var CAT_BG     = { question: '#EFF6FF', share: '#ECFDF5', discuss: '#F5F3FF' };

  var REACT_EMOJIS  = { like:'👍', love:'❤️', haha:'😂', wow:'😮', sad:'😢', angry:'😡' };
  var REACT_LABELS  = { like:'Thích', love:'Yêu thích', haha:'Haha', wow:'Wow', sad:'Buồn', angry:'Phẫn nộ' };

  var _forumMediaFiles = [];

  var _currentCat  = 'all';
  var _currentSort = 'newest';
  var _selectedCat = 'question';
  var _cmtSortMap  = {};

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
        { id: 'c1a', author: 'Nguyễn Văn An', avatar: '👨‍💻', time: Date.now() - 100*60*1000, text: 'Con trỏ đôi về bản chất là một con trỏ trỏ tới một con trỏ khác. Bạn thử hình dung bộ nhớ như một dãy ô, mỗi ô có địa chỉ riêng — con trỏ chỉ là biến lưu địa chỉ đó thôi!', reactions:{like:4,love:1,haha:0,wow:0,sad:0,angry:0}, myReaction:null, replies:[{id:'r1a',author:'Trần Minh Tuấn',avatar:'🧑‍💻',time:Date.now()-85*60*1000,text:'Cảm ơn bạn! Cách so sánh với dãy ô bộ nhớ dễ hình dung lắm, mình hiểu ngay rồi!',replyTo:'Nguyễn Văn An'}] },
        { id: 'c1b', author: 'Lê Thị Hoa', avatar: '👩‍🏫', time: Date.now() - 60*60*1000, text: 'Mình học từ sách "C Programming Language" của Kernighan & Ritchie, phần con trỏ giải thích rất trực quan. Bạn nên thử debug từng bước để thấy giá trị thay đổi.', reactions:{like:2,love:0,haha:0,wow:1,sad:0,angry:0}, myReaction:null, replies:[] },
        { id: 'c1c', author: 'Phạm Đức Huy', avatar: '🧑‍🎓', time: Date.now() - 20*60*1000, text: 'Series C++ của The Cherno trên YouTube giải thích con trỏ bằng hình ảnh rất dễ hiểu. Mình đã học từ đó và hiểu ngay sau 2 video!', reactions:{like:6,love:2,haha:0,wow:0,sad:0,angry:0}, myReaction:null, replies:[] },
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
        { id: 'c2a', author: 'Trần Bình', avatar: '🧑‍💻', time: Date.now() - 3*3600*1000, text: 'Mình thêm GitLens vào danh sách nhé, siêu hữu ích khi làm việc nhóm, xem ai commit gì ngay trong editor.' },
        { id: 'c2b', author: 'Mai Anh', avatar: '👩‍🎓', time: Date.now() - 1*3600*1000, text: 'Docker extension cũng rất tiện nếu bạn hay dùng container. Quản lý image và container ngay trong VSCode luôn.' },
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
        { id: 'c3a', author: 'Hoàng Nam', avatar: '👨‍💻', time: Date.now() - 20*3600*1000, text: 'Python chắc chắn rồi! Hầu hết thư viện ML như TensorFlow, PyTorch, scikit-learn đều Python-first. Java không có hệ sinh thái ML mạnh như vậy.' },
        { id: 'c3b', author: 'Thu Hương', avatar: '👩‍💻', time: Date.now() - 15*3600*1000, text: 'Mình cũng từng phân vân như bạn, cuối cùng chọn Python và không hối hận. NumPy + Pandas là bộ đôi không thể thiếu, học Python để dùng được 2 thư viện này.' },
        { id: 'c3c', author: 'Việt Anh', avatar: '🧑', time: Date.now() - 5*3600*1000, text: 'Java mạnh về enterprise và Android, nhưng cho ML thì Python win tuyệt đối. Bắt đầu Python đi bạn, 2-3 tháng là dùng được thư viện cơ bản rồi.' },
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
        { id: 'c4a', author: 'Minh Khoa', avatar: '🧑‍💻', time: Date.now() - 40*3600*1000, text: 'Chúc mừng bạn! 3 tuần là rất nhanh đó. Bước tiếp theo bạn định học JavaScript hay framework nào không?' },
        { id: 'c4b', author: 'Ngọc Linh', avatar: '👩‍🎓', time: Date.now() - 30*3600*1000, text: 'Làm project nhỏ sau mỗi bài là cách hay nhất để nhớ kiến thức lâu dài. Mình cũng áp dụng phương pháp này và tiến bộ rất nhanh!' },
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
        { id: 'c5a', author: 'Đức Thịnh', avatar: '👨‍💻', time: Date.now() - 60*3600*1000, text: 'Merge giữ lại lịch sử đầy đủ, thích hợp cho feature branch lớn. Rebase tạo lịch sử linear sạch hơn, hay dùng trước khi merge vào main để commit gọn gàng.' },
        { id: 'c5b', author: 'Khánh An', avatar: '👩‍💻', time: Date.now() - 48*3600*1000, text: 'Rule of thumb: không rebase nhánh public đã push lên remote vì sẽ thay đổi lịch sử ảnh hưởng người khác. Chỉ rebase nhánh local của mình thôi nhé!' },
      ],
    },
  ];

  function loadPosts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function savePosts(posts) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch (e) {}
  }

  function allPosts() {
    var user = loadPosts();
    return MOCK_POSTS.concat(user);
  }

  function filteredSorted() {
    var posts = allPosts();
    if (_currentCat !== 'all') posts = posts.filter(function(p){ return p.cat === _currentCat; });
    var q = (typeof _forumTextQ !== 'undefined' && _forumTextQ) ? _forumTextQ : '';
    if (q) posts = posts.filter(function(p){
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    });
    if (_currentSort === 'likes')   posts.sort(function(a,b){ return b.likes - a.likes; });
    else if (_currentSort === 'oldest') posts.sort(function(a,b){ return a.time - b.time; });
    else posts.sort(function(a,b){ return b.time - a.time; });
    return posts;
  }

  function timeAgo(ts) {
    var diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60)   return 'vừa xong';
    if (diff < 3600) return Math.floor(diff/60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff/3600) + ' giờ trước';
    return Math.floor(diff/86400) + ' ngày trước';
  }

  function renderPosts() {
    var posts = filteredSorted();
    var list  = document.getElementById('forum-list');
    var empty = document.getElementById('forum-empty');
    if (!list) return;

    if (!posts.length) {
      list.innerHTML = '';
      empty && empty.classList.remove('hidden');
      return;
    }
    empty && empty.classList.add('hidden');

    list.innerHTML = posts.map(function(p) {
      var catColor = CAT_COLORS[p.cat] || '#6B7280';
      var catBg    = CAT_BG[p.cat]    || '#F3F4F6';
      var catLabel = CAT_LABELS[p.cat] || p.cat;
      var excerpt  = p.body.length > 160 ? p.body.slice(0, 157) + '...' : p.body;

      var reactions   = p.reactions || { like: p.likes || 0 };
      var myReaction  = p.myReaction || null;
      var totalR      = Object.values(reactions).reduce(function(a,b){return a+b;},0);
      var reactEmoji  = myReaction ? REACT_EMOJIS[myReaction] : '👍';
      var reactLabel  = myReaction ? REACT_LABELS[myReaction] : 'Thích';
      var reactClass  = myReaction ? ('reacted-' + myReaction) : '';

      var reactSummary = Object.keys(reactions)
        .filter(function(k){ return reactions[k] > 0; })
        .sort(function(a,b){ return reactions[b]-reactions[a]; })
        .slice(0,3)
        .map(function(k){ return REACT_EMOJIS[k]; })
        .join('');

      var pickerItems = Object.keys(REACT_EMOJIS).map(function(k) {
        return '<span class="reaction-item" onclick="forumSetReaction(\'' + p.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
      }).join('');

      var mediaPart = '';
      if (p.media && p.media.length) {
        mediaPart = '<div class="fpc-media-row">' + p.media.map(function(m) {
          if (m.type === 'video') {
            return '<video src="' + m.url + '" class="fpc-media-item" controls muted></video>';
          }
          return '<img src="' + m.url + '" class="fpc-media-item" alt="ảnh" />';
        }).join('') + '</div>';
      }

      return (
        '<div class="forum-post-card" id="fpc-' + p.id + '">' +
          '<div class="fpc-top">' +
            '<div class="fpc-avatar">' + (p.avatar || '🧑') + '</div>' +
            '<div class="fpc-meta">' +
              '<span class="fpc-author">' + p.author + '</span>' +
              '<span class="fpc-time">' + timeAgo(p.time) + '</span>' +
            '</div>' +
            '<span class="fpc-cat-tag" style="background:' + catBg + ';color:' + catColor + '">' + catLabel + '</span>' +
          '</div>' +
          '<div class="fpc-title">' + escHtml(p.title) + '</div>' +
          '<div class="fpc-excerpt">' + escHtml(excerpt) + '</div>' +
          mediaPart +
          '<div class="fpc-actions">' +
            '<div class="fpc-react-wrap">' +
              '<button class="fpc-react-btn ' + reactClass + '" onclick="forumSetReaction(\'' + p.id + '\',\'' + (myReaction || 'like') + '\')">' +
                reactEmoji + ' <span>' + reactLabel + '</span>' +
                (totalR > 0 ? ' <span style="opacity:.55;font-weight:400">· ' + totalR + '</span>' : '') +
              '</button>' +
              '<div class="reaction-picker">' + pickerItems + '</div>' +
            '</div>' +
            (reactSummary && totalR > 0 ? '<span class="fpc-react-summary">' + reactSummary + ' ' + totalR + '</span>' : '') +
            '<button class="fpc-comment-btn" id="fpc-cmtbtn-' + p.id + '" onclick="forumToggleComments(\'' + p.id + '\')">' +
              '💬 ' + p.comments + ' bình luận' +
            '</button>' +
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
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.forumSetCat = function(btn, cat) {
    document.querySelectorAll('#forum-tabs .filter-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    _currentCat = cat;
    renderPosts();
  };

  window.forumSetSort = function(val) {
    _currentSort = val;
    renderPosts();
  };

  window.forumToggleLike = function(postId) {
    forumSetReaction(postId, 'like');
  };

  window.forumSetReaction = function(postId, key) {
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
    var mockIdx = MOCK_POSTS.findIndex(function(p){ return p.id === postId; });
    if (mockIdx !== -1) {
      applyReaction(MOCK_POSTS[mockIdx]);
    } else {
      var userPosts = loadPosts();
      var uIdx = userPosts.findIndex(function(p){ return p.id === postId; });
      if (uIdx !== -1) { applyReaction(userPosts[uIdx]); savePosts(userPosts); }
    }
    renderPosts();
  };

  window.forumOpenCreate = function() {
    document.getElementById('forumCreateModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.forumOpenCreateWithMedia = function() {
    forumOpenCreate();
    setTimeout(function() {
      document.getElementById('forum-img-input').click();
    }, 300);
  };

  window.forumOpenCreateCat = function(cat) {
    forumOpenCreate();
    setTimeout(function() {
      document.querySelectorAll('.forum-cat-pick').forEach(function(b){
        b.classList.toggle('active', b.dataset.val === cat);
      });
      _selectedCat = cat;
    }, 50);
  };

  window.forumHandleMedia = function(e, type) {
    var files = Array.from(e.target.files);
    files.forEach(function(file) {
      var url = URL.createObjectURL(file);
      _forumMediaFiles.push({ type: type, url: url, name: file.name });
    });
    renderMediaPreview();
    e.target.value = '';
  };

  function renderMediaPreview() {
    var container = document.getElementById('forum-media-preview');
    if (!container) return;
    container.innerHTML = _forumMediaFiles.map(function(m, i) {
      var thumb = m.type === 'video'
        ? '<video src="' + m.url + '" muted></video>'
        : '<img src="' + m.url + '" alt="' + m.name + '" />';
      return '<div class="forum-media-thumb">' +
        thumb +
        '<button class="forum-thumb-remove" onclick="forumRemoveMedia(' + i + ')" title="Xóa">✕</button>' +
      '</div>';
    }).join('');
  }

  window.forumRemoveMedia = function(idx) {
    URL.revokeObjectURL(_forumMediaFiles[idx].url);
    _forumMediaFiles.splice(idx, 1);
    renderMediaPreview();
  };

  window.forumCloseCreate = function() {
    document.getElementById('forumCreateModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('forum-input-title').value = '';
    document.getElementById('forum-input-body').value = '';
    document.getElementById('forum-title-count').textContent = '0 / 120';
    document.getElementById('forum-body-count').textContent  = '0 / 2000';
    _selectedCat = 'question';
    document.querySelectorAll('.forum-cat-pick').forEach(function(b){
      b.classList.toggle('active', b.dataset.val === 'question');
    });
    _forumMediaFiles.forEach(function(m){ URL.revokeObjectURL(m.url); });
    _forumMediaFiles = [];
    renderMediaPreview();
  };

  window.forumOverlayClick = function(e) {
    if (e.target.id === 'forumCreateModal') forumCloseCreate();
  };

  window.forumPickCat = function(btn) {
    document.querySelectorAll('.forum-cat-pick').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    _selectedCat = btn.dataset.val;
  };

  window.forumSubmitPost = function() {
    var title = document.getElementById('forum-input-title').value.trim();
    var body  = document.getElementById('forum-input-body').value.trim();
    if (!title) { alert('Vui lòng nhập tiêu đề bài viết.'); return; }
    if (!body)  { alert('Vui lòng nhập nội dung bài viết.'); return; }

    var userPosts = loadPosts();
    var userName  = document.getElementById('sidebar-name').textContent || 'Bạn';
    var newPost = {
      id: 'u' + Date.now(),
      cat: _selectedCat,
      title: title,
      body: body,
      author: userName,
      avatar: '🙋',
      time: Date.now(),
      reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      myReaction: null,
      comments: 0,
      media: _forumMediaFiles.slice(),
    };
    userPosts.unshift(newPost);
    savePosts(userPosts);
    forumCloseCreate();
    _currentCat  = 'all';
    _currentSort = 'newest';
    document.querySelectorAll('#forum-tabs .filter-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.cat === 'all');
    });
    renderPosts();
  };

  document.getElementById('forum-input-title').addEventListener('input', function() {
    document.getElementById('forum-title-count').textContent = this.value.length + ' / 120';
  });
  document.getElementById('forum-input-body').addEventListener('input', function() {
    document.getElementById('forum-body-count').textContent = this.value.length + ' / 2000';
  });

  window.forumToggleComments = function(postId) {
    var section = document.getElementById('fpc-cmt-' + postId);
    var btn = document.getElementById('fpc-cmtbtn-' + postId);
    if (!section) return;
    var isOpen = section.classList.toggle('open');
    if (btn) btn.classList.toggle('active', isOpen);
    if (isOpen) {
      forumRenderComments(postId);
      setTimeout(function() {
        var inp = document.getElementById('fpc-cmt-inp-' + postId);
        if (inp) inp.focus();
      }, 80);
    }
  };

  window.forumRenderComments = function(postId) {
    var list = document.getElementById('fpc-cmt-list-' + postId);
    if (!list) return;
    var post = MOCK_POSTS.find(function(p){ return p.id === postId; });
    if (!post) post = loadPosts().find(function(p){ return p.id === postId; });
    var cmts = (post && post.commentList) ? post.commentList.slice() : [];
    var sortDir = _cmtSortMap[postId] || 'newest';
    cmts.sort(function(a, b){ return sortDir === 'oldest' ? a.time - b.time : b.time - a.time; });
    if (!cmts.length) {
      list.innerHTML = '<p class="fpc-cmt-empty">Chưa có bình luận nào. Hãy là người đầu tiên! 👋</p>';
      return;
    }
    list.innerHTML = cmts.map(function(c, i) {
      var isLast = (i === cmts.length - 1);
      var reactions  = c.reactions  || {};
      var myReaction = c.myReaction || null;
      var totalR = Object.values(reactions).reduce(function(a,b){ return a+b; }, 0);
      var reactEmoji = myReaction ? REACT_EMOJIS[myReaction] : '👍';
      var reactLabel = myReaction ? REACT_LABELS[myReaction] : 'Thích';
      var reactCls   = myReaction ? 'cmt-reacted-' + myReaction : '';
      var replies    = c.replies || [];

      var pickerHtml = Object.keys(REACT_EMOJIS).map(function(k) {
        return '<span class="fpc-cmt-react-item" onclick="forumSetCmtReaction(\'' + postId + '\',\'' + c.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
      }).join('');

      var reactSummaryHtml = '';
      if (totalR > 0) {
        var topEmojis = Object.keys(reactions)
          .filter(function(k){ return reactions[k] > 0; })
          .sort(function(a,b){ return reactions[b]-reactions[a]; })
          .slice(0,2).map(function(k){ return REACT_EMOJIS[k]; }).join('');
        reactSummaryHtml = '<span class="fpc-cmt-react-summary">' + topEmojis + ' ' + totalR + '</span>';
      }

      var repliesHtml = replies.map(function(r) {
        var rReactions  = r.reactions  || {};
        var rMyReaction = r.myReaction || null;
        var rTotalR = Object.values(rReactions).reduce(function(a,b){ return a+b; }, 0);
        var rReactEmoji = rMyReaction ? REACT_EMOJIS[rMyReaction] : '👍';
        var rReactLabel = rMyReaction ? REACT_LABELS[rMyReaction] : 'Thích';
        var rReactCls   = rMyReaction ? 'cmt-reacted-' + rMyReaction : '';
        var rPickerHtml = Object.keys(REACT_EMOJIS).map(function(k) {
          return '<span class="fpc-cmt-react-item" onclick="forumSetReplyReaction(\'' + postId + '\',\'' + c.id + '\',\'' + r.id + '\',\'' + k + '\')" title="' + REACT_LABELS[k] + '">' + REACT_EMOJIS[k] + '</span>';
        }).join('');
        var rSummaryHtml = '';
        if (rTotalR > 0) {
          var rTopEmojis = Object.keys(rReactions)
            .filter(function(k){ return rReactions[k] > 0; })
            .sort(function(a,b){ return rReactions[b]-rReactions[a]; })
            .slice(0,2).map(function(k){ return REACT_EMOJIS[k]; }).join('');
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

  window.forumAddComment = function(postId) {
    var inp = document.getElementById('fpc-cmt-inp-' + postId);
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    var nameEl = document.getElementById('chip-name');
    var comment = {
      id: 'c' + Date.now(),
      author: (nameEl && nameEl.textContent.trim() && nameEl.textContent.trim() !== '—') ? nameEl.textContent.trim() : 'Bạn',
      avatar: '🧑',
      time: Date.now(),
      text: text,
    };
    var mockIdx = MOCK_POSTS.findIndex(function(p){ return p.id === postId; });
    if (mockIdx !== -1) {
      if (!MOCK_POSTS[mockIdx].commentList) MOCK_POSTS[mockIdx].commentList = [];
      MOCK_POSTS[mockIdx].commentList.push(comment);
      MOCK_POSTS[mockIdx].comments = MOCK_POSTS[mockIdx].commentList.length;
    } else {
      var posts = loadPosts();
      var uIdx = posts.findIndex(function(p){ return p.id === postId; });
      if (uIdx !== -1) {
        if (!posts[uIdx].commentList) posts[uIdx].commentList = [];
        posts[uIdx].commentList.push(comment);
        posts[uIdx].comments = posts[uIdx].commentList.length;
        savePosts(posts);
      }
    }
    inp.value = '';
    forumRenderComments(postId);
    var btn = document.getElementById('fpc-cmtbtn-' + postId);
    if (btn) {
      var count = mockIdx !== -1 ? MOCK_POSTS[mockIdx].comments :
        (loadPosts().find(function(p){ return p.id === postId; }) || {}).comments || 0;
      btn.textContent = '💬 ' + count + ' bình luận';
    }
    var listEl = document.getElementById('fpc-cmt-list-' + postId);
    if (listEl && listEl.lastElementChild)
      listEl.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.forumSetCmtSort = function(postId, dir) {
    _cmtSortMap[postId] = dir;
    ['newest','oldest'].forEach(function(d) {
      var btn = document.getElementById('fpc-csort-' + d + '-' + postId);
      if (btn) btn.classList.toggle('active', d === dir);
    });
    forumRenderComments(postId);
  };

  window.forumSetCmtReaction = function(postId, cmtId, key) {
    function apply(post) {
      var cmt = (post.commentList || []).find(function(c){ return c.id === cmtId; });
      if (!cmt) return;
      if (!cmt.reactions) cmt.reactions = { like:0, love:0, haha:0, wow:0, sad:0, angry:0 };
      var prev = cmt.myReaction || null;
      if (prev === key) {
        cmt.myReaction = null;
        if (cmt.reactions[key] > 0) cmt.reactions[key]--;
      } else {
        if (prev && cmt.reactions[prev] > 0) cmt.reactions[prev]--;
        cmt.myReaction = key;
        cmt.reactions[key] = (cmt.reactions[key] || 0) + 1;
      }
    }
    var mockIdx = MOCK_POSTS.findIndex(function(p){ return p.id === postId; });
    if (mockIdx !== -1) { apply(MOCK_POSTS[mockIdx]); }
    else {
      var posts = loadPosts();
      var uIdx = posts.findIndex(function(p){ return p.id === postId; });
      if (uIdx !== -1) { apply(posts[uIdx]); savePosts(posts); }
    }
    forumRenderComments(postId);
  };

  window.forumSetReplyReaction = function(postId, cmtId, replyId, key) {
    function apply(post) {
      var cmt = (post.commentList || []).find(function(c){ return c.id === cmtId; });
      if (!cmt) return;
      var reply = (cmt.replies || []).find(function(r){ return r.id === replyId; });
      if (!reply) return;
      if (!reply.reactions) reply.reactions = { like:0, love:0, haha:0, wow:0, sad:0, angry:0 };
      var prev = reply.myReaction || null;
      if (prev === key) {
        reply.myReaction = null;
        if (reply.reactions[key] > 0) reply.reactions[key]--;
      } else {
        if (prev && reply.reactions[prev] > 0) reply.reactions[prev]--;
        reply.myReaction = key;
        reply.reactions[key] = (reply.reactions[key] || 0) + 1;
      }
    }
    var mockIdx = MOCK_POSTS.findIndex(function(p){ return p.id === postId; });
    if (mockIdx !== -1) { apply(MOCK_POSTS[mockIdx]); }
    else {
      var posts = loadPosts();
      var uIdx = posts.findIndex(function(p){ return p.id === postId; });
      if (uIdx !== -1) { apply(posts[uIdx]); savePosts(posts); }
    }
    forumRenderComments(postId);
  };

  window.forumToggleReply = function(postId, cmtId, mentionName) {
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
      setTimeout(function(){ inp.focus(); }, 30);
    }
  };

  window.forumAddReply = function(postId, cmtId) {
    var inp = document.getElementById('fpc-reply-inp-' + postId + '-' + cmtId);
    if (!inp) return;
    var text = inp.value.trim();
    if (!text) return;
    var nameEl = document.getElementById('chip-name');
    var myName = (nameEl && nameEl.textContent.trim() !== '—') ? nameEl.textContent.trim() : 'Bạn';
    var row = document.getElementById('fpc-reply-row-' + postId + '-' + cmtId);
    var replyTo = (row && row.dataset.mention) || '';
    function apply(post) {
      var cmt = (post.commentList || []).find(function(c){ return c.id === cmtId; });
      if (!cmt) return;
      if (!cmt.replies) cmt.replies = [];
      cmt.replies.push({ id:'r'+Date.now(), author:myName, avatar:'🧑', time:Date.now(), text:text, replyTo: replyTo || cmt.author });
    }
    var mockIdx = MOCK_POSTS.findIndex(function(p){ return p.id === postId; });
    if (mockIdx !== -1) { apply(MOCK_POSTS[mockIdx]); }
    else {
      var posts = loadPosts();
      var uIdx = posts.findIndex(function(p){ return p.id === postId; });
      if (uIdx !== -1) { apply(posts[uIdx]); savePosts(posts); }
    }
    inp.value = '';
    forumRenderComments(postId);
    setTimeout(function(){
      var item = document.getElementById('fpc-ci-' + postId + '-' + cmtId);
      if (item) item.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 50);
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('forumCreateModal').classList.contains('active'))
      forumCloseCreate();
  });

  var _origNavigateForum = window.navigate;
  window.navigate = function(page) {
    _origNavigateForum(page);
    if (page === 'forum') renderPosts();
  };

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
  cards.forEach(function(card) {
    var title = (card.querySelector('h3') || {}).textContent || '';
    var sub   = (card.querySelector('.subtitle') || {}).textContent || '';
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
  tabs.forEach(function(tab) {
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
  sets.forEach(function(set) {
    var setTitle = (set.querySelector('.sk-set-title') || {}).textContent || '';
    var skills   = set.querySelectorAll('.sk-skill-name');
    var skillMatch = false;
    skills.forEach(function(sk) {
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
  var _lbData   = { weekly: null, streak: null, friends: null };
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
    var me   = document.getElementById('lb-me');
    if (!list) return;

    if (!data || !data.entries) {
      meta.textContent = 'Không tải được bảng xếp hạng.';
      list.innerHTML = '<li class="lb-skel">Vui lòng thử lại sau.</li>';
      if (me) me.hidden = true;
      return;
    }

    var unit  = data.unit  || 'XP';
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
    var me   = document.getElementById('lb-me');
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
    if (p > 0)    return 'current';
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
      svgPaths += '<path class="mini-rm-arrow ' + (isActive ? 'mini-rm-arrow--solid' : '') + '" d="' + path + '"></path>';
    }

    var html = '<svg class="mini-rm-arrows" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="none">' + svgPaths + '</svg>';
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
    if (_miniRmLoaded) {
      // nếu data enrolledCourses đã có sẵn (main.js load) thì render luôn
      if (window.enrolledCourses && window.enrolledCourses.length) {
        renderMiniCanvas(window.enrolledCourses);
      }
      return;
    }
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
