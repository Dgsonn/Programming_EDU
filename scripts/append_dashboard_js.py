#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Append logic leaderboard + mini roadmap canvas vào dashboard.js."""
import io

JS = r"D:\newcty\Programming_EDU\static\js\dashboard.js"

APPEND = r'''
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
'''


def main():
    with io.open(JS, 'r', encoding='utf-8') as f:
        src = f.read()

    if 'Dashboard redesign — Leaderboard' in src:
        print('[SKIP] dashboard.js đã có block redesign.')
        return

    with io.open(JS, 'a', encoding='utf-8') as f:
        if not src.endswith('\n'):
            f.write('\n')
        f.write(APPEND)
    print('[OK] dashboard.js updated.')


if __name__ == '__main__':
    main()
