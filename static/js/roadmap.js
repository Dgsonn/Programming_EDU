/* ══════════════════════════════════════════════════
   ROADMAP — Engine mới theo Figma (Roadmap.tsx)
   26 lộ trình tĩnh (ROADMAP_LIST/ROADMAP_DATA/ROADMAP_DETAILS
   trong roadmapData.js), trạng thái done/active/locked lưu
   localStorage. Roadmap cá nhân (canvas kéo-thả) giữ nguyên.
   ══════════════════════════════════════════════════ */
(function () {
  var LS_PINNED = 'roadmap_pinned_v1';
  var LS_ACTIVE = 'roadmap_active_v1';
  var LS_PROGRESS = 'roadmap_progress_v2';
  var DEFAULT_PINNED = ['Frontend', 'Backend'];

  function getPinned() {
    try {
      var v = JSON.parse(localStorage.getItem(LS_PINNED));
      return Array.isArray(v) && v.length ? v : DEFAULT_PINNED.slice();
    } catch (e) { return DEFAULT_PINNED.slice(); }
  }
  function setPinned(arr) { localStorage.setItem(LS_PINNED, JSON.stringify(arr)); }
  function getActive() { return localStorage.getItem(LS_ACTIVE) || 'Frontend'; }
  function setActive(name) { localStorage.setItem(LS_ACTIVE, name); }
  function getOverrides() {
    try { return JSON.parse(localStorage.getItem(LS_PROGRESS)) || {}; }
    catch (e) { return {}; }
  }
  function setOverride(key, status) {
    var o = getOverrides();
    o[key] = status;
    localStorage.setItem(LS_PROGRESS, JSON.stringify(o));
  }
  function getStatus(name, nodeId, fallback) {
    var ov = getOverrides();
    return ov[name + ':' + nodeId] || fallback;
  }

  var SC = {
    done:   { mainBg: '#0E2A20', childBg: 'rgba(16,185,129,0.16)', stroke: '#10B981', mainText: '#6EE7B7', childText: '#34D399' },
    active: { mainBg: '#0E2138', childBg: 'rgba(59,130,246,0.18)', stroke: '#3B82F6', mainText: '#93C5FD', childText: '#60A5FA' },
    locked: { mainBg: '#101725', childBg: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.16)', mainText: '#CBD5E1', childText: '#64748B' }
  };
  var RES_CFG = {
    article: { icon: 'file-text', label: 'Bài viết', color: '#60A5FA' },
    video:   { icon: 'youtube', label: 'Video', color: '#F87171' },
    course:  { icon: 'graduation-cap', label: 'Khóa học', color: '#A78BFA' },
    docs:    { icon: 'book-open', label: 'Tài liệu', color: '#34D399' }
  };

  function escHtmlR(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  function normalize(name) {
    var sections = (typeof ROADMAP_DATA !== 'undefined' && ROADMAP_DATA[name]) || [];
    function norm(raw) {
      if (Array.isArray(raw)) return { label: raw[0], status: raw[1] };
      return { label: raw, status: 'locked' };
    }
    return sections.map(function (sec, i) {
      var main = norm(sec.main);
      var left = (sec.left || []).map(norm);
      var right = (sec.right || []).map(norm);
      return {
        main: Object.assign({ id: i + '-m' }, main),
        left: left.map(function (n, j) { return Object.assign({ id: i + '-l' + j }, n); }),
        right: right.map(function (n, j) { return Object.assign({ id: i + '-r' + j }, n); })
      };
    });
  }

  /* ── Tab bar ── */
  function renderTabs() {
    var bar = document.getElementById('rm-tabbar');
    if (!bar) return;
    var pinned = getPinned();
    var active = getActive();
    var html = pinned.map(function (name) {
      var meta = (typeof ROADMAP_LIST !== 'undefined') ? ROADMAP_LIST.find(function (r) { return r.name === name; }) : null;
      var isActive = active === name;
      return '<button type="button" class="rm-tab' + (isActive ? ' active' : '') + '" onclick="window.roadmapSelectTab(\'' + esc(name) + '\')">' +
        (meta ? meta.emoji + ' ' : '') + escHtmlR(name) + '</button>';
    }).join('');
    html += '<button type="button" class="rm-tab' + (active === 'personal' ? ' active' : '') + '" onclick="window.roadmapSelectTab(\'personal\')">✏️ Cá nhân</button>';
    html += '<span class="rm-tab-divider"></span>';
    html += '<button type="button" class="rm-tab-plus" onclick="window.roadmapOpenBrowse()" aria-label="Thêm lộ trình"><span data-icon="plus" data-size="14"></span></button>';
    bar.innerHTML = html;
    if (window.mountIcons) mountIcons(bar);
  }

  /* ── Node box ── */
  function nodeBoxHtml(name, node, kind) {
    var status = getStatus(name, node.id, node.status);
    var c = SC[status] || SC.locked;
    var cls = 'rm-node rm-node--' + kind + ' rm-node--' + status;
    var onclick = "window.roadmapOpenDrawer('" + esc(name) + "','" + node.id + "','" + esc(node.label) + "')";
    if (kind === 'main') {
      return '<button type="button" class="' + cls + '" style="background:' + c.mainBg + ';border-color:' + c.stroke + ';color:' + c.mainText + '" onclick="' + onclick + '">' + escHtmlR(node.label) + '</button>';
    }
    var dotHtml = status === 'done'
      ? '<span class="rm-node-dot rm-node-dot--done">' + (window.Icon ? Icon('check', 9, '#fff') : '') + '</span>'
      : '<span class="rm-node-dot rm-node-dot--' + status + '"></span>';
    return '<button type="button" class="' + cls + '" style="background:' + c.childBg + ';border-color:' + c.stroke + ';color:' + c.childText + '" onclick="' + onclick + '">' + escHtmlR(node.label) + dotHtml + '</button>';
  }

  /* ── Flow chính ── */
  function renderFlow(name) {
    var wrap = document.getElementById('rm-flow-wrap');
    if (!wrap) return;
    var sections = normalize(name);
    if (!sections.length) {
      wrap.innerHTML = '<div class="rm-flow-empty">Chưa có dữ liệu cho lộ trình này.</div>';
      renderStatsPill(name, []);
      return;
    }
    var html = '<div class="rm-spine"></div>';
    html += sections.map(function (sec) {
      var leftHtml = sec.left.length
        ? '<div class="rm-branch rm-branch--left">' + sec.left.map(function (n) { return nodeBoxHtml(name, n, 'child'); }).join('') + '</div><div class="rm-dash rm-dash--right"></div>'
        : '';
      var rightHtml = sec.right.length
        ? '<div class="rm-dash rm-dash--left"></div><div class="rm-branch rm-branch--right">' + sec.right.map(function (n) { return nodeBoxHtml(name, n, 'child'); }).join('') + '</div>'
        : '';
      return '<div class="rm-section">' +
        '<div class="rm-section-left">' + leftHtml + '</div>' +
        '<div class="rm-section-main">' + nodeBoxHtml(name, sec.main, 'main') + '</div>' +
        '<div class="rm-section-right">' + rightHtml + '</div>' +
        '</div>';
    }).join('');
    wrap.innerHTML = html;
    renderStatsPill(name, sections);
  }

  function renderStatsPill(name, sections) {
    var pill = document.getElementById('rm-stats-pill');
    if (!pill) return;
    var done = 0, active = 0, locked = 0;
    sections.forEach(function (sec) {
      [sec.main].concat(sec.left, sec.right).forEach(function (n) {
        var st = getStatus(name, n.id, n.status);
        if (st === 'done') done++; else if (st === 'active') active++; else locked++;
      });
    });
    pill.innerHTML =
      '<span class="rm-stat-item"><span class="rm-stat-dot" style="background:#10B981"></span><b style="color:#10B981">' + done + '</b> Đã học</span>' +
      '<span class="rm-stat-item"><span class="rm-stat-dot" style="background:#3B82F6"></span><b style="color:#3B82F6">' + active + '</b> Đang học</span>' +
      '<span class="rm-stat-item"><span class="rm-stat-dot" style="background:#64748B"></span><b style="color:#64748B">' + locked + '</b> Chưa học</span>';
  }

  /* ── Chuyển tab ── */
  window.roadmapSelectTab = function (name) {
    setActive(name);
    renderTabs();
    var flowScroll = document.querySelector('.rm-flow-scroll');
    var statsPill = document.getElementById('rm-stats-pill');
    var personalView = document.getElementById('roadmap-personal-view');
    if (name === 'personal') {
      if (flowScroll) flowScroll.style.display = 'none';
      if (statsPill) statsPill.style.display = 'none';
      if (personalView) personalView.style.display = 'flex';
      if (window._rmPersonalLoaded && typeof _rmVInitCanvas === 'function') {
        _rmVInitCanvas();
        _rmVRender();
      } else if (typeof loadPersonalRoadmap === 'function') {
        loadPersonalRoadmap();
      }
    } else {
      if (flowScroll) flowScroll.style.display = '';
      if (statsPill) statsPill.style.display = '';
      if (personalView) personalView.style.display = 'none';
      renderFlow(name);
    }
  };

  /* ── Detail Drawer ── */
  window.roadmapOpenDrawer = function (name, nodeId, label) {
    var drawer = document.getElementById('rm-drawer');
    var backdrop = document.getElementById('rm-drawer-backdrop');
    if (!drawer) return;
    drawer.dataset.roadmap = name;
    drawer.dataset.nodeId = nodeId;
    drawer.dataset.label = label;
    document.getElementById('rm-drawer-title').textContent = label;
    var status = getStatus(name, nodeId, 'locked');
    renderDrawerStatusToggle(status);

    var key = String(label).toLowerCase().trim();
    var detail = (typeof ROADMAP_DETAILS !== 'undefined') ? ROADMAP_DETAILS[key] : null;
    var descEl = document.getElementById('rm-drawer-desc');
    var resWrap = document.getElementById('rm-drawer-resources');
    if (detail) {
      descEl.textContent = detail.desc;
      resWrap.innerHTML = detail.resources.map(function (r, i) {
        var rc = RES_CFG[r.type] || RES_CFG.article;
        return '<a class="rm-res-item" href="#" onclick="event.preventDefault()" style="animation-delay:' + (i * 0.05) + 's">' +
          '<span class="rm-res-icon" style="background:' + rc.color + '1A"><span data-icon="' + rc.icon + '" data-size="15" data-color="' + rc.color + '"></span></span>' +
          '<span class="rm-res-body"><span class="rm-res-title">' + escHtmlR(r.title) + '</span>' +
          '<span class="rm-res-meta"><span style="color:' + rc.color + ';font-weight:600">' + rc.label + '</span> · ' + escHtmlR(r.source) + '</span></span>' +
          '<span data-icon="external-link" data-size="14" data-color="#64748B"></span>' +
          '</a>';
      }).join('');
    } else {
      descEl.textContent = 'Chưa có mô tả chi tiết cho mục này. Hãy tự tìm hiểu thêm về "' + label + '" qua tài liệu chính thức hoặc khóa học liên quan.';
      resWrap.innerHTML = '';
    }
    if (window.mountIcons) mountIcons(resWrap);
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  };

  function renderDrawerStatusToggle(status) {
    var wrap = document.getElementById('rm-drawer-status');
    if (!wrap) return;
    var items = [
      { key: 'locked', label: 'Chưa học', color: '#64748B' },
      { key: 'active', label: 'Đang học', color: '#3B82F6' },
      { key: 'done', label: 'Đã học', color: '#10B981' }
    ];
    wrap.innerHTML = items.map(function (it) {
      var isActive = status === it.key;
      return '<button type="button" class="rm-status-btn' + (isActive ? ' active' : '') + '" style="' +
        (isActive ? 'background:' + it.color + '22;border-color:' + it.color + ';color:' + it.color + ';' : '') +
        '" onclick="window.roadmapSetStatus(\'' + it.key + '\')">' + it.label + '</button>';
    }).join('');
  }

  window.roadmapSetStatus = function (status) {
    var drawer = document.getElementById('rm-drawer');
    if (!drawer) return;
    var name = drawer.dataset.roadmap, nodeId = drawer.dataset.nodeId;
    setOverride(name + ':' + nodeId, status);
    renderDrawerStatusToggle(status);
    renderFlow(name);
  };

  window.roadmapCloseDrawer = function () {
    var drawer = document.getElementById('rm-drawer');
    var backdrop = document.getElementById('rm-drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };

  /* ── Browse grid ── */
  window.roadmapOpenBrowse = function () {
    var grid = document.getElementById('rm-browse');
    var backdrop = document.getElementById('rm-browse-backdrop');
    renderBrowseList('');
    if (grid) grid.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  };
  window.roadmapCloseBrowse = function () {
    var grid = document.getElementById('rm-browse');
    var backdrop = document.getElementById('rm-browse-backdrop');
    if (grid) grid.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };
  window.roadmapBrowseSearch = function (q) { renderBrowseList(q); };

  function renderBrowseList(query) {
    var list = document.getElementById('rm-browse-list');
    if (!list || typeof ROADMAP_LIST === 'undefined') return;
    var q = (query || '').toLowerCase().trim();
    var pinned = getPinned();
    var groups = {}, order = [];
    ROADMAP_LIST.forEach(function (r) {
      if (q && r.name.toLowerCase().indexOf(q) < 0 && r.desc.toLowerCase().indexOf(q) < 0) return;
      if (!groups[r.group]) { groups[r.group] = []; order.push(r.group); }
      groups[r.group].push(r);
    });
    var html = order.map(function (g) {
      var cards = groups[g].map(function (r) {
        var isPinned = pinned.indexOf(r.name) !== -1;
        return '<div class="rm-browse-card">' +
          '<div class="rm-browse-card-hd"><span class="rm-browse-emoji">' + r.emoji + '</span>' +
          '<span class="rm-browse-name">' + escHtmlR(r.name) + (r.isNew ? ' <span class="rm-browse-new">MỚI</span>' : '') + '</span>' +
          '<button type="button" class="rm-browse-pin' + (isPinned ? ' active' : '') + '" onclick="window.roadmapTogglePin(\'' + esc(r.name) + '\')">' + (isPinned ? '✓' : '+') + '</button>' +
          '</div>' +
          '<p class="rm-browse-desc">' + escHtmlR(r.desc) + '</p>' +
          '</div>';
      }).join('');
      return '<div class="rm-browse-group-label">' + escHtmlR(g) + '</div><div class="rm-browse-grid">' + cards + '</div>';
    }).join('');
    list.innerHTML = html || '<div class="rm-flow-empty">Không tìm thấy lộ trình phù hợp.</div>';
  }

  window.roadmapTogglePin = function (name) {
    var pinned = getPinned();
    var idx = pinned.indexOf(name);
    var wasUnpinned = idx === -1;
    if (wasUnpinned) pinned.push(name); else pinned.splice(idx, 1);
    setPinned(pinned);
    renderTabs();
    var searchInput = document.getElementById('rm-browse-search');
    renderBrowseList(searchInput ? searchInput.value : '');
    if (wasUnpinned) {
      window.roadmapSelectTab(name);
      window.roadmapCloseBrowse();
    }
  };

  /* ── Entry point — gọi từ navigate('roadmap') ── */
  window.initRoadmapPage = function () {
    renderTabs();
    window.roadmapSelectTab(getActive());
  };
})();
