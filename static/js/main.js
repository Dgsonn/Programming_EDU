var API = "/api";

(function () {
  var _fetch = window.fetch;
  var csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  window.fetch = function (url, opts) {
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    if (csrfToken && method !== 'GET' && method !== 'HEAD') {
      opts.headers = Object.assign({ 'X-CSRFToken': csrfToken }, opts.headers);
    }
    return _fetch(url, opts);
  };
})();

var courses = [];
var enrolledCourses = [];
var activeEnrollmentFilter = "all";
var searchQuery = "";
var levelFilter = "all";
var languageFilters = [];
var searchDebounceTimer = null;
var searchSuggestions = ["C", "Python", "Java", "HTML", "AI", "Web Development", "Phù hợp người mới", "Cơ bản", "Trung cấp", "Nâng cao"];
var levelSuggestions = ["Phù hợp người mới", "Trung cấp", "Nâng cao"];


// Bảng liên kết khóa học → trang bài học
var COURSE_URLS = {
  cpp: "/interface",
  python: "/lesson/python",
  java: "/lesson/java",
  htmlcss: "/lesson/htmlcss",
};

var pageLabels = {
  dashboard: "Dashboard",
  courses: "Khóa học",
  roadmap: "Lộ trình",
  settings: "Cài đặt",
};

/* ════════════════════════════════════════════════════════════
   ★ TRANG LỘ TRÌNH — Mermaid flowchart TD từ DB
   ════════════════════════════════════════════════════════════ */

var _eduRoadmaps = [];          // dữ liệu tải từ API
var _mermaidRenderCount = 0;
var _roadmapRenderedId = null;
window.currentEduRoadmap = 'frontend';

function renderEduRoadmapTabs() {
    var tabsContainer = document.getElementById('roadmap-tabs');
    if (!tabsContainer) return;
    var tabs = _eduRoadmaps.map(function(r) {
        var isActive = r.id === window.currentEduRoadmap ? 'active' : '';
        return '<button class="filter-btn ' + isActive + '" onclick="window.switchEduRoadmap(\'' + r.id + '\')">' + r.icon + ' ' + r.title + '</button>';
    });
    var personalActive = window.currentEduRoadmap === 'personal' ? 'active' : '';
    tabs.push('<button class="filter-btn rm-tab-personal ' + personalActive + '" onclick="window.switchEduRoadmap(\'personal\')">✏️ Cá nhân</button>');
    tabsContainer.innerHTML = tabs.join('');
}

window.switchEduRoadmap = function(roadmapId) {
    window.currentEduRoadmap = roadmapId;
    renderEduRoadmapTabs();
    var mermaidWrap   = document.getElementById('roadmap-mermaid-wrap');
    var personalView  = document.getElementById('roadmap-personal-view');
    if (roadmapId === 'personal') {
        if (mermaidWrap)  mermaidWrap.style.display  = 'none';
        if (personalView) personalView.style.display = 'flex';
        if (_rmPersonalLoaded) {
            var ta = document.getElementById('rm-personal-editor');
            if (ta && ta.value.trim()) setTimeout(function() { _rmRenderPreview(ta.value); }, 150);
        } else {
            loadPersonalRoadmap();
        }
    } else {
        if (mermaidWrap)  mermaidWrap.style.display  = '';
        if (personalView) personalView.style.display = 'none';
        _roadmapRenderedId = null;
        renderEduInteractiveRoadmap();
    }
};

function renderEduInteractiveRoadmap() {
    var roadmap = _eduRoadmaps.find(function(r) { return r.id === window.currentEduRoadmap; });
    if (!roadmap) return;
    if (_roadmapRenderedId === roadmap.id) return;
    var wrap = document.getElementById('roadmap-mermaid-wrap');
    if (!wrap) return;
    _roadmapRenderedId = roadmap.id;

    wrap.innerHTML = '<div style="color:#9CA3AF;padding:40px;text-align:center;font-size:14px;">Đang tải sơ đồ...</div>';

    if (typeof mermaid === 'undefined') {
        setTimeout(renderEduInteractiveRoadmap, 300);
        return;
    }

    var svgId = 'rm-svg-' + (++_mermaidRenderCount);
    mermaid.render(svgId, roadmap.mermaid_def).then(function(result) {
        wrap.innerHTML = result.svg;
        var svgEl = wrap.querySelector('svg');
        if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';

            // Gắn click handler vào từng node trong SVG
            svgEl.querySelectorAll('g.node, g[class*="node"]').forEach(function(gEl) {
                gEl.style.cursor = 'pointer';
                gEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Mermaid v11: id = "{anything}-rm_1-0" hoặc "{uid}rm_1-{n}"
                    // Dùng pattern cố định của chúng ta: rm_[bpc]?\d+
                    var m = gEl.id.match(/rm_[bpc]?\d+/);
                    if (!m) return;
                    var nodeId = m[0];
                    var node = roadmap.nodes && roadmap.nodes[nodeId];
                    if (!node) return;
                    var sidebarTitle   = document.getElementById('sidebar-title');
                    var sidebarContent = document.getElementById('sidebar-content');
                    var sidebarDetail  = document.getElementById('sidebar-detail');
                    if (!sidebarDetail) return;
                    if (sidebarTitle)   sidebarTitle.textContent = node.title;
                    if (sidebarContent) sidebarContent.innerHTML  = node.desc;
                    sidebarDetail.classList.add('open');
                });
            });

            if (typeof svgPanZoom !== 'undefined') {
                svgPanZoom(svgEl, {
                    zoomEnabled: true,
                    controlIconsEnabled: true,
                    fit: true,
                    center: true,
                    minZoom: 0.2,
                    maxZoom: 4,
                    panEnabled: true,
                });
            }
        }
    }).catch(function(err) {
        wrap.innerHTML = '<div style="color:#EF4444;padding:40px;text-align:center;font-size:14px;">Không tải được sơ đồ.</div>';
        console.error('Mermaid render error:', err);
    });
}

function loadEduRoadmaps() {
    return fetch(API + '/roadmaps')
        .then(handleFetch)
        .then(function(data) {
            if (!Array.isArray(data) || !data.length) {
                console.warn('loadEduRoadmaps: empty or non-array response', data);
                return;
            }
            _eduRoadmaps = data;
            window.currentEduRoadmap = data[0].id;
            renderEduRoadmapTabs();
        })
        .catch(function(err) {
            console.error('loadEduRoadmaps:', err);
            var wrap = document.getElementById('roadmap-mermaid-wrap');
            if (wrap) wrap.innerHTML = '<div style="color:#EF4444;padding:40px;text-align:center;font-size:14px;">Không tải được lộ trình. Vui lòng thử lại.</div>';
        });
}

window.closeSidebar = function() {
    var sd = document.getElementById('sidebar-detail');
    if (sd) sd.classList.remove('open');
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            suppressErrors: true,
        });
    }
    document.addEventListener('click', function(e) {
        var sidebar = document.getElementById('sidebar-detail');
        if (!sidebar || !sidebar.classList.contains('open')) return;
        if (!sidebar.contains(e.target)) closeSidebar();
    });
});

/* ════════════════════════════════════════════════════════════
   ★ CÁ NHÂN HÓA LỘ TRÌNH — Mermaid editor + live preview
   ════════════════════════════════════════════════════════════ */
var _rmPreviewCount = 0;
var _rmDebounce = null;
var _rmPersonalLoaded = false;

var _RM_DEFAULT = 'flowchart TD\n    A["🎯 Mục tiêu"] --> B["📚 Học lý thuyết"]\n    B --> C["🛠️ Thực hành"]\n    C --> D["✅ Hoàn thành"]\n    classDef default fill:#4A9EE0,stroke:#2D7FC1,color:#fff';

function _rmSetStatus(msg, isError) {
    var el = document.getElementById('rm-parse-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'rm-parse-status ' + (isError ? 'rm-status-error' : (msg ? 'rm-status-ok' : ''));
}

function _rmRenderPreview(code) {
    var wrap = document.getElementById('rm-personal-preview');
    if (!wrap || !code.trim()) {
        if (wrap) wrap.innerHTML = '<div class="rm-preview-placeholder">Nhập Mermaid code để xem preview...</div>';
        return;
    }
    if (typeof mermaid === 'undefined') return;
    // Parse trước để tránh mermaid tự hiện popup lỗi khi render
    mermaid.parse(code, { suppressErrors: true }).then(function(ok) {
        if (ok === false) {
            wrap.innerHTML = '<div class="rm-preview-placeholder" style="color:#EF4444;">Cú pháp lỗi — kiểm tra lại code</div>';
            return null;
        }
        var svgId = 'rm-personal-svg-' + (++_rmPreviewCount);
        return mermaid.render(svgId, code);
    }).then(function(result) {
        if (!result) return;
        wrap.innerHTML = result.svg;
        var svgEl = wrap.querySelector('svg');
        if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
        }
    }).catch(function() {
        wrap.innerHTML = '<div class="rm-preview-placeholder" style="color:#EF4444;">Cú pháp lỗi — kiểm tra lại code</div>';
    });
}

function _rmValidateOnBlur(code) {
    if (!code.trim() || typeof mermaid === 'undefined') { _rmSetStatus('', false); return; }
    mermaid.parse(code, { suppressErrors: true })
        .then(function(ok) {
            if (ok !== false) {
                _rmSetStatus('✓ Cú pháp hợp lệ', false);
            } else {
                _rmSetStatus('✗ Cú pháp không hợp lệ — kiểm tra lại', true);
            }
        })
        .catch(function() { _rmSetStatus('✗ Cú pháp không hợp lệ', true); });
}

function _rmInitEditor() {
    var ta = document.getElementById('rm-personal-editor');
    if (!ta || ta._rmInited) return;
    ta._rmInited = true;

    ta.addEventListener('input', function() {
        _rmSetStatus('', false);
        clearTimeout(_rmDebounce);
        _rmDebounce = setTimeout(function() { _rmRenderPreview(ta.value); }, 500);
    });

    ta.addEventListener('blur', function() { _rmValidateOnBlur(ta.value); });
}

function rmNormalizeLabel(label) {
    return label.trim().replace(/\s+/g, ' ').replace(/[^\w\s-]/g, '');
}

function rmNodeId(label) {
    var slug = rmNormalizeLabel(label).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return slug ? 'n_' + slug : 'n_step';
}

function rmInsertTemplate() {
    var ta = document.getElementById('rm-personal-editor');
    if (!ta) return;
    ta.value = _RM_DEFAULT;
    _rmSetStatus('Đã chèn mẫu lộ trình cơ bản.', false);
    _rmRenderPreview(ta.value);
}

function rmClearEditor() {
    var ta = document.getElementById('rm-personal-editor');
    if (!ta) return;
    ta.value = 'flowchart TD\n    A["🎯 Bắt đầu"]';
    _rmSetStatus('Đã xóa sơ đồ. Bắt đầu lại với một bước mới.', false);
    _rmRenderPreview(ta.value);
}

function rmAddStep() {
    var from = document.getElementById('rm-step-from');
    var to = document.getElementById('rm-step-to');
    if (!from || !to) return;
    var fromText = from.value.trim();
    var toText = to.value.trim();
    if (!fromText || !toText) {
        _rmSetStatus('Nhập cả bước bắt đầu và bước kế tiếp để thêm.', true);
        return;
    }

    var ta = document.getElementById('rm-personal-editor');
    if (!ta) return;

    var code = ta.value.trim();
    if (!code) {
        code = _RM_DEFAULT;
    }
    if (!/^flowchart\s+[A-Z]/i.test(code)) {
        code = _RM_DEFAULT + '\n' + code;
    }

    var fromId = rmNodeId(fromText);
    var toId = rmNodeId(toText);
    var nodeFrom = fromId + '["' + fromText + '"]';
    var nodeTo = toId + '["' + toText + '"]';
    var edge = fromId + ' --> ' + toId;

    var lines = code.split('\n');
    if (!lines.some(function(line) { return line.indexOf(fromId + '["') !== -1; })) {
        lines.push('    ' + nodeFrom);
    }
    if (!lines.some(function(line) { return line.indexOf(toId + '["') !== -1; })) {
        lines.push('    ' + nodeTo);
    }
    lines.push('    ' + edge);

    ta.value = lines.join('\n');
    _rmSetStatus('Đã thêm bước mới vào sơ đồ.', false);
    _rmRenderPreview(ta.value);
    from.value = '';
    to.value = '';
}

function loadPersonalRoadmap() {
    if (_rmPersonalLoaded) return;
    _rmPersonalLoaded = true;
    _rmInitEditor();
    fetch(API + '/me/roadmap')
        .then(handleFetch)
        .then(function(data) {
            if (!data) return;
            var ta = document.getElementById('rm-personal-editor');
            if (!ta) return;
            var code = (data.mermaid_def || '').trim() || _RM_DEFAULT;
            ta.value = code;
            // Delay to avoid racing with the main roadmap mermaid render
            setTimeout(function() { _rmRenderPreview(code); }, 400);
        })
        .catch(function() {});
}

function savePersonalRoadmap() {
    var ta = document.getElementById('rm-personal-editor');
    if (!ta) return;
    var btn = document.querySelector('.rm-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang lưu...'; }
    fetch(API + '/me/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mermaid_def: ta.value })
    })
    .then(handleFetch)
    .then(function(d) {
        if (btn) { btn.disabled = false; btn.textContent = '✅ Đã lưu'; setTimeout(function(){ btn.textContent = '💾 Lưu'; }, 2000); }
    })
    .catch(function() {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Lưu'; }
    });
}

function handlePersonalRoadmapAI() {
    fetch(API + '/me/roadmap/ai', { method: 'POST' })
        .then(function(r) {
            if (r.status === 402) {
                _rmShowToast('🔒 Tính năng Tạo bằng AI chỉ dành cho tài khoản Premium');
            }
        })
        .catch(function() {});
}

function _rmShowToast(msg) {
    var t = document.createElement('div');
    t.className = 'rm-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() { t.classList.add('rm-toast-show'); });
    setTimeout(function() {
        t.classList.remove('rm-toast-show');
        setTimeout(function() { t.remove(); }, 400);
    }, 3000);
}

/* ── Handle HTTP errors ── */
function handleFetch(r) {
  if (r.status === 401) {
    const p = window.location.pathname;
    if (p !== "/login" && p !== "/register") {
      window.location = "/login";
    }
    return null;
  }
  if (!r.ok) {
    return r.json().then(function(body) {
      throw new Error((body && body.message) || ('HTTP ' + r.status));
    }).catch(function() {
      throw new Error('HTTP ' + r.status);
    });
  }
  return r.json();
}

/* ── Navigation ── */
function navigate(page) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  var target =
    document.getElementById("page-" + page) ||
    document.getElementById("page-dashboard");
  target.classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(function (b) {
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

  document.getElementById("topbar-title").textContent =
    pageLabels[page] || "Dashboard";

  // Hiện search bar topbar ở Dashboard và Khóa học
  var sw = document.getElementById("search-wrap");
  if (sw) sw.style.visibility =
    page === "courses" || page === "dashboard" ? "visible" : "hidden";

  // Đồng bộ ô tìm kiếm trong trang Khóa học với searchQuery hiện tại
  if (page === 'courses') {
    var csi = document.getElementById('course-search-input');
    if (csi) csi.value = searchQuery || '';
    var clearBtn = document.getElementById('course-search-clear');
    if (clearBtn) clearBtn.classList.toggle('hidden', !searchQuery);
  }
}

/* ── Course rendering ── */
function renderCourses() {
  var grid = document.getElementById("courses-grid");
  var empty = document.getElementById("empty-state");
  var q = searchQuery.toLowerCase();

  var filtered = courses.filter(function (c) {
    var matchSearch;
    if (q === 'c' || q === 'c++') {
      matchSearch =
        c.title.toLowerCase().indexOf('c / c++') >= 0 ||
        c.subtitle.toLowerCase().indexOf('c / c++') >= 0 ||
        c.description.toLowerCase().indexOf('c / c++') >= 0 ||
        (c.tag || "").toLowerCase().indexOf('c / c++') >= 0 ||
        c.title.toLowerCase().indexOf('c++') >= 0 ||
        c.subtitle.toLowerCase().indexOf('c++') >= 0 ||
        (c.tag || "").toLowerCase().indexOf('c++') >= 0;
    } else {
      matchSearch =
        c.title.toLowerCase().indexOf(q) >= 0 ||
        c.subtitle.toLowerCase().indexOf(q) >= 0 ||
        c.description.toLowerCase().indexOf(q) >= 0 ||
        (c.tag || "").toLowerCase().indexOf(q) >= 0;
    }
    var matchEnroll =
      activeEnrollmentFilter === "all" ||
      (activeEnrollmentFilter === "enrolled" && c.enrolled) ||
      (activeEnrollmentFilter === "not-enrolled" && !c.enrolled);
    var matchLevel =
      levelFilter === "all" ||
      // Map: Cơ bản == Phù hợp người mới (DB hiện normalize theo 'Phù hợp người mới')
      (levelFilter === "Cơ bản" && /phù hợp người mới/i.test(c.level)) ||
      (levelFilter === "Trung cấp" && /trung cấp/i.test(c.level)) ||
      (levelFilter === "Nâng cao" && /nâng cao/i.test(c.level)) ||
      (levelFilter === "Phù hợp người mới" && /phù hợp người mới/i.test(c.level));

    var matchLang =
      languageFilters.length === 0 ||
      languageFilters.some(function (lang) {
        var title = c.title.toLowerCase();
        var subtitle = (c.subtitle || "").toLowerCase();
        var tag = (c.tag || "").toLowerCase();
        if (lang === "Python") return title.includes("python") || subtitle.includes("python") || tag.includes("python");
        if (lang === "JS") return (
          title.includes("js") ||
          subtitle.includes("js") ||
          tag.includes("js") ||
          title.includes("javascript") ||
          subtitle.includes("javascript") ||
          tag.includes("javascript")
        );
        if (lang === "Java") return title.includes("java") || subtitle.includes("java") || tag.includes("java");
        if (lang === "SQL") return title.includes("sql") || subtitle.includes("sql") || tag.includes("sql");
        return false;
      });
    return matchSearch && matchEnroll && matchLevel && matchLang;
  });

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = filtered
    .map(function (c) {
      return [
        '<div class="course-card" onmouseenter="hoverCard(this,\'' +
          c.color +
          '\')" onmouseleave="unhoverCard(this)">',
        '<div class="card-img-wrap" style="cursor:pointer" onclick="window.location=\'/courses/' + c.id + '\'">',
        '<img src="/' + c.image + '" alt="' + c.title + '" />',
        '<div class="card-overlay"></div>',
        '<div class="badge-level" style="background:linear-gradient(135deg,' +
          c.color +
          "," +
          c.accentColor +
          ')">' +
          c.level +
          "</div>",
        c.enrolled ? '<div class="badge-enrolled">Đã đăng ký</div>' : "",
        '<div class="card-title-overlay">',
        '<div class="card-tag">' + c.tag + "</div>",
        "<h3>" + c.title + "</h3>",
        "</div>",
        "</div>",
        '<div class="card-body">',
        '<div class="card-desc">' + c.description + "</div>",
        '<div class="card-stats">',
        '<span class="card-stat">⏱ ' + c.duration + "</span>",
        '<span class="card-stat">👥 ' + c.students + "</span>",
        '<span class="card-stat"><span class="star">★</span> <span class="rating">' +
          c.rating +
          "</span></span>",
        "</div>",
        '<div class="card-footer">',
        '<span class="card-lessons">📖 ' + c.lessons + " bài học</span>",
        (function () {
          var detailBtn =
            '<button onclick="window.location=\'/courses/' + c.id + '\'"' +
            ' style="height:34px;padding:0 12px;border-radius:10px;border:1px solid #E5E7EB;background:none;cursor:pointer;font-size:12px;font-weight:600;color:#6B7280;transition:all 0.2s;white-space:nowrap;flex-shrink:0"' +
            " onmouseenter=\"this.style.background='#F3F4F6';this.style.color='#1F2937'\"" +
            " onmouseleave=\"this.style.background='none';this.style.color='#6B7280'\">Chi tiết</button>";
          if (c.enrolled) {
            var goUrl = COURSE_URLS[c.id] || "#";
            return (
              '<div style="display:flex;align-items:center;gap:6px">' +
              detailBtn +
              '<button class="cta-btn"' +
              " onclick=\"window.location='" +
              goUrl +
              "'\"" +
              " onmouseenter=\"ctaHover(this,'" +
              c.color +
              "','" +
              c.accentColor +
              "')\"" +
              ' onmouseleave="ctaLeave(this)">Tiếp tục học →</button>' +
              '<button title="Hủy đăng ký"' +
              " onclick=\"unenroll('" +
              c.id +
              "','" +
              c.title.replace(/'/g, "\\'") +
              "')\"" +
              ' style="width:34px;height:34px;border-radius:10px;border:1px solid #E5E7EB;background:none;cursor:pointer;font-size:14px;color:#9CA3AF;transition:all 0.2s;flex-shrink:0"' +
              " onmouseenter=\"this.style.background='#FEF2F2';this.style.borderColor='#FCA5A5';this.style.color='#EF4444'\"" +
              " onmouseleave=\"this.style.background='none';this.style.borderColor='#E5E7EB';this.style.color='#9CA3AF'\">✕</button>" +
              "</div>"
            );
          }
          return (
            '<div style="display:flex;align-items:center;gap:6px">' +
            detailBtn +
            '<button class="cta-btn"' +
            " onclick=\"toggleEnroll('" +
            c.id +
            "',false)\"" +
            " onmouseenter=\"ctaHover(this,'" +
            c.color +
            "','" +
            c.accentColor +
            "')\"" +
            ' onmouseleave="ctaLeave(this)">Đăng ký →</button>' +
            "</div>"
          );
        })(),
        "</div>",
        "</div>",
        "</div>",
      ].join("");
    })
    .join("");
}

/* ── My Courses rendering ── */
function renderMyCourses() {
  var container = document.getElementById("enrolled-list");
  if (!enrolledCourses.length) {
    container.innerHTML =
      '<p style="color:#9CA3AF;font-size:14px;padding:24px 0">Bạn chưa đăng ký khóa học nào. <a href="#" onclick="navigate(\'courses\')" style="color:#4A9EE0">Khám phá khóa học →</a></p>';
    return;
  }
  container.innerHTML = enrolledCourses
    .map(function (c) {
      return [
        '<div class="enrolled-card"',
        " onmouseenter=\"this.style.boxShadow='0 12px 30px " +
          c.color +
          "30';this.style.borderColor='" +
          c.color +
          "30'\"",
        " onmouseleave=\"this.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)';this.style.borderColor='#F3F4F6'\">",
        '<div class="enrolled-top">',
        '<div class="enrolled-left">',
        '<div class="enrolled-icon" style="background:linear-gradient(135deg,' +
          c.color +
          "20," +
          c.accentColor +
          "10);border:2px solid " +
          c.color +
          '30">' +
          c.icon +
          "</div>",
        '<div class="enrolled-info">',
        "<h3>" + c.title + "</h3>",
        '<div class="subtitle">' + c.subtitle + "</div>",
        '<div class="enrolled-meta">',
        "<span>✅ " + c.completedLessons + "/" + c.totalLessons + " bài</span>",
        "<span>⏰ " + c.timeSpent + " / " + c.duration + "</span>",
        "</div>",
        "</div>",
        "</div>",
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px">',
        '<button class="continue-btn"' +
          ' style="background:linear-gradient(135deg,' +
          c.color +
          "," +
          c.accentColor +
          ");box-shadow:0 4px 12px " +
          c.color +
          '40"' +
          (COURSE_URLS[c.id]
            ? " onclick=\"window.location='" + COURSE_URLS[c.id] + "'\""
            : "") +
          ">▶ Tiếp tục học</button>",
        "<button onclick=\"unenroll('" +
          c.id +
          "','" +
          c.title.replace(/'/g, "\\'") +
          "')\"" +
          ' style="background:none;border:1px solid #E5E7EB;color:#9CA3AF;font-size:12px;font-weight:600;cursor:pointer;padding:6px 14px;border-radius:10px;transition:all 0.2s;white-space:nowrap"' +
          " onmouseenter=\"this.style.borderColor='#FCA5A5';this.style.color='#EF4444';this.style.background='#FEF2F2'\"" +
          " onmouseleave=\"this.style.borderColor='#E5E7EB';this.style.color='#9CA3AF';this.style.background='none'\">",
        "✕ Hủy đăng ký",
        "</button>",
        "</div>",
        "</div>",
        '<div class="prog-section">',
        '<div class="prog-label"><span>Tiến độ hoàn thành</span><span style="color:' +
          c.color +
          ';font-weight:700">' +
          c.progress +
          "%</span></div>",
        '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' +
          c.progress +
          "%;background:linear-gradient(90deg," +
          c.color +
          "," +
          c.accentColor +
          ");box-shadow:0 0 8px " +
          c.color +
          '60"></div></div>',
        "</div>",
        '<div class="lesson-grid">',
        '<div class="lesson-box" style="background:#F9FAFB;border:1px solid #F3F4F6"><div class="lbl">Bài học gần nhất</div><div class="val">' +
          c.lastLesson +
          "</div></div>",
        '<div class="lesson-box" style="background:' +
          c.color +
          "08;border:1px solid " +
          c.color +
          '20"><div class="lbl">Bài tiếp theo</div><div class="val" style="color:' +
          c.color +
          '">' +
          c.nextLesson +
          "</div></div>",
        "</div>",
        "</div>",
      ].join("");
    })
    .join("");
}

/* ── Progress section on Dashboard ── */
function renderProgress() {
  var grid = document.getElementById("progress-grid");
  if (!grid) return;
  if (!enrolledCourses.length) {
    grid.innerHTML =
      '<p style="color:#9CA3AF;font-size:14px">Chưa đăng ký khóa học nào.</p>';
    return;
  }
  grid.innerHTML = enrolledCourses
    .map(function (c) {
      return [
        '<div class="progress-row">',
        '<div class="prog-icon" style="background:' +
          c.color +
          '15">' +
          c.icon +
          "</div>",
        '<div class="prog-bar-wrap">',
        '<div class="prog-header">',
        '<span class="prog-name">' + c.title + "</span>",
        '<span class="prog-pct" style="color:' +
          c.color +
          '">' +
          c.progress +
          "%</span>",
        "</div>",
        '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' +
          c.progress +
          "%;background:linear-gradient(90deg," +
          c.color +
          "," +
          c.accentColor +
          ')"></div></div>',
        "</div>",
        "</div>",
      ].join("");
    })
    .join("");
}

/* ── Enroll / Unenroll ── */
function toggleEnroll(courseId, isEnrolled) {
  var method = isEnrolled ? "DELETE" : "POST";
  fetch(API + "/courses/" + courseId + "/enroll", { method: method })
    .then(handleFetch)
    .then(function (d) {
      if (d) loadAll();
    })
    .catch(function (err) {
      console.error("Lỗi đăng ký:", err);
    });
}

var pendingUnenrollId = null;

function unenroll(courseId, courseTitle) {
  pendingUnenrollId = courseId;
  document.getElementById("unenroll-course-name").textContent =
    '"' + courseTitle + '"';
  document.getElementById("unenrollModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeUnenrollModal() {
  document.getElementById("unenrollModal").classList.remove("active");
  document.body.style.overflow = "";
  pendingUnenrollId = null;
}

function handleUnenrollOverlayClick(e) {
  if (e.target === document.getElementById("unenrollModal"))
    closeUnenrollModal();
}

function confirmUnenroll() {
  if (!pendingUnenrollId) return;
  var courseId = pendingUnenrollId;
  closeUnenrollModal();
  fetch(API + "/courses/" + courseId + "/enroll", { method: "DELETE" })
    .then(handleFetch)
    .then(function (d) {
      if (d) loadAll();
    })
    .catch(function (err) {
      console.error("Lỗi hủy đăng ký:", err);
    });
}

/* ── Filters & search ── */
function filterCourses() {
  searchQuery = document.getElementById("search-input").value;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(function () {
    var coursesPage = document.getElementById('page-courses');
    if (coursesPage && !coursesPage.classList.contains('active')) {
      navigate('courses');
    }
    loadCourses();
  }, 300);
}

function showSearchSuggestions() {
  var panel = document.getElementById('search-suggestions');
  if (!panel) return;
  panel.style.display = 'block';
  panel.classList.remove('hidden');
  renderSearchSuggestions();
}

function closeSearchSuggestions() {
  setTimeout(function () {
    var panel = document.getElementById('search-suggestions');
    var searchWrap = document.getElementById('search-wrap');
    var active = document.activeElement;
    if (searchWrap && searchWrap.contains(active)) return;
    if (panel) panel.classList.add('hidden');
  }, 200);
}

function renderSearchSuggestions() {
  var row = document.getElementById('suggestions-row');
  var levels = document.getElementById('suggestion-levels');
  if (!row || !levels) return;
  row.innerHTML = searchSuggestions
    .map(function (item) {
      return '<button type="button" class="suggestion-pill" onclick="chooseSearchSuggestion(\'' + item + '\')">' + item + '</button>';
    })
    .join('');
  levels.innerHTML = levelSuggestions
    .map(function (item) {
      var activeClass = levelFilter === item ? ' active' : '';
      return '<button type="button" class="suggestion-pill' + activeClass + '" onclick="toggleSearchLevel(\'' + item + '\')">' + item + '</button>';
    })
    .join('');
}

function chooseSearchSuggestion(value) {
  document.getElementById('search-input').value = value;
  searchQuery = value;
  var coursesPage = document.getElementById('page-courses');
  if (coursesPage && !coursesPage.classList.contains('active')) {
    navigate('courses');
  }
  loadCourses();
  closeSearchSuggestions();
}

function toggleSearchLevel(level) {
  if (levelFilter === level) {
    levelFilter = 'all';
  } else {
    levelFilter = level;
  }
  renderSearchSuggestions();
  renderActiveFilters();
  loadCourses();
}

/* ════════════════════════════════════
   COURSE SEARCH — 5 hàm đơn giản
   ════════════════════════════════════ */

function cshOpen() {
  var h = document.getElementById('course-search-hints');
  if (h) h.style.display = 'block';
}

function cshInput(val) {
  searchQuery = val;
  var clearBtn = document.getElementById('course-search-clear');
  var staticEl = document.getElementById('csh-static');
  var dynEl    = document.getElementById('csh-dynamic');
  if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
  cshOpen();
  if (!val.trim()) {
    if (staticEl) staticEl.style.display = 'block';
    if (dynEl)    dynEl.style.display    = 'none';
  } else {
    if (staticEl) staticEl.style.display = 'none';
    if (dynEl) {
      dynEl.style.display = 'block';
      var ql = val.toLowerCase();
      var hits = courses.filter(function (c) {
        return c.title.toLowerCase().indexOf(ql) >= 0 ||
               (c.subtitle||'').toLowerCase().indexOf(ql) >= 0 ||
               (c.tag||'').toLowerCase().indexOf(ql) >= 0;
      }).slice(0, 6);
      dynEl.innerHTML = hits.length
        ? hits.map(function (c) {
            var s = c.title.replace(/'/g,"\\'");
            return '<li class="csh-result-item" onclick="cshPick(\''+s+'\')">' + c.title + '</li>';
          }).join('')
        : '<li class="csh-no-result">Không tìm thấy kết quả</li>';
    }
  }
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadCourses, 300);
}

function cshPick(val) {
  var input = document.getElementById('course-search-input');
  var h     = document.getElementById('course-search-hints');
  var cb    = document.getElementById('course-search-clear');
  if (input) input.value = val;
  if (h)     h.style.display = 'none';
  if (cb)    cb.style.display = 'flex';

  // Khi người dùng chọn level từ hints, map nhãn sang levelFilter tương ứng
  // để đồng bộ với bộ lọc cấp độ trên grid.
  if (val === 'Phù hợp người mới') {
    levelFilter = 'Phù hợp người mới';
    renderSearchSuggestions();
    renderActiveFilters();
    loadCourses();
    return;
  }
  if (val === 'Cơ bản') {
    // Backend hiện normalize cấp độ theo 'Phù hợp người mới'
    levelFilter = 'Phù hợp người mới';
    renderSearchSuggestions();
    renderActiveFilters();
    loadCourses();
    return;
  }
  if (val === 'Trung cấp') {
    levelFilter = 'Trung cấp';
    renderSearchSuggestions();
    renderActiveFilters();
    loadCourses();
    return;
  }
  if (val === 'Cao cấp') {
    // Backend level tương ứng đang là 'Nâng cao'
    levelFilter = 'Nâng cao';
    renderSearchSuggestions();
    renderActiveFilters();
    loadCourses();
    return;
  }

  // Chỉ set searchQuery khi chọn gợi ý tìm kiếm thông thường
  searchQuery = val;
  loadCourses();
}


function cshClear() {
  var input = document.getElementById('course-search-input');
  var h     = document.getElementById('course-search-hints');
  var cb    = document.getElementById('course-search-clear');
  var staticEl = document.getElementById('csh-static');
  var dynEl    = document.getElementById('csh-dynamic');
  if (input) { input.value = ''; input.focus(); }
  if (cb)    cb.style.display = 'none';
  if (h)     h.style.display  = 'block';
  if (staticEl) staticEl.style.display = 'block';
  if (dynEl)    dynEl.style.display    = 'none';
  searchQuery = '';
  loadCourses();
}

/* Đóng dropdown khi click ra ngoài */
document.addEventListener('click', function (e) {
  var wrap = document.getElementById('courses-search-bar-wrap');
  var h    = document.getElementById('course-search-hints');
  if (h && wrap && !wrap.contains(e.target)) {
    h.style.display = 'none';
  }
});

function setEnrollmentFilter(btn, filter) {
  activeEnrollmentFilter = filter;
  var group = btn.parentNode;
  if (group) {
    group.querySelectorAll(".filter-btn").forEach(function (b) {
      b.classList.remove("active");
    });
  }
  btn.classList.add("active");
  renderCourses();
}

function setLevelFilter(btn, level) {
  if (levelFilter === level) {
    levelFilter = 'all';
    btn.classList.remove('active');
  } else {
    levelFilter = level;
    var group = document.getElementById('level-filter-row');
    if (group) {
      group.querySelectorAll('.pill-btn').forEach(function (b) {
        b.classList.remove('active');
      });
    }
    btn.classList.add('active');
  }
  renderActiveFilters();
  loadCourses();
}

function toggleLanguageFilter(btn, language) {
  var index = languageFilters.indexOf(language);
  if (index === -1) {
    languageFilters.push(language);
    btn.classList.add('active');
  } else {
    languageFilters.splice(index, 1);
    btn.classList.remove('active');
  }
  renderActiveFilters();
  loadCourses();
}

function renderActiveFilters() {
  var container = document.getElementById('active-filters');
  if (!container) return;
  var chips = [];
  if (levelFilter !== 'all') {
    chips.push({ type: 'level', label: levelFilter });
  }
  languageFilters.forEach(function (lang) {
    chips.push({ type: 'language', label: lang });
  });

  if (!chips.length) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML =
    '<span class="active-filters-label">Đang lọc:</span>' +
    chips.map(function (chip) {
      return (
        '<span class="filter-chip">' +
        chip.label +
        '<button type="button" onclick="removeCourseFilter(\'' +
        chip.type + '\', \'' + chip.label +
        '\')">✕</button></span>'
      );
    }).join('');
}

function removeCourseFilter(type, value) {
  if (type === 'level') {
    levelFilter = 'all';
    var group = document.getElementById('level-filter-row');
    if (group) {
      group.querySelectorAll('.pill-btn').forEach(function (b) {
        b.classList.remove('active');
      });
    }
  } else if (type === 'language') {
    languageFilters = languageFilters.filter(function (lang) {
      return lang !== value;
    });
    var group = document.getElementById('language-filter-row');
    if (group) {
      group.querySelectorAll('.pill-btn').forEach(function (b) {
        if (b.textContent === value) b.classList.remove('active');
      });
    }
  }
  renderActiveFilters();
  loadCourses();
}

/* ── Toggle switches ── */
function toggleSwitch(btn) {
  btn.classList.toggle("on");
}

/* ── Hover helpers ── */
function hoverStat(el, color) {
  el.style.boxShadow = "0 8px 24px " + color + "25";
  el.style.borderColor = color + "40";
}
function unhoverStat(el) {
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
  el.style.borderColor = "#F3F4F6";
}
function hoverCard(el, color) {
  el.style.borderColor = color + "40";
}
function unhoverCard(el) {
  el.style.borderColor = "#F3F4F6";
}
function ctaHover(btn, c, ac) {
  btn.style.background = "linear-gradient(135deg," + c + "," + ac + ")";
  btn.style.color = "#fff";
  btn.style.boxShadow = "0 4px 12px " + c + "50";
}
function ctaLeave(btn) {
  btn.style.background = "#F3F4F6";
  btn.style.color = "#6B7280";
  btn.style.boxShadow = "none";
}

/* ── DOM helpers ── */
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = val;
}
function setToggle(id, on) {
  var el = document.getElementById(id);
  if (!el) return;
  if (on) el.classList.add("on");
  else el.classList.remove("on");
}

/* ── Save settings ── */
function saveSettings() {
  var userData = {
    name: document.getElementById("field-name").value,
    email: document.getElementById("field-email").value,
    phone: document.getElementById("field-phone").value,
    birthday: document.getElementById("field-birthday").value,
  };
  var notifData = {
    emailNotif: document
      .getElementById("toggle-email")
      .classList.contains("on"),
    pushNotif: document.getElementById("toggle-push").classList.contains("on"),
    studyRemind: document
      .getElementById("toggle-remind")
      .classList.contains("on"),
    contentUpdate: document
      .getElementById("toggle-content")
      .classList.contains("on"),
  };
  Promise.all([
    fetch(API + "/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }),
    fetch(API + "/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifData),
    }),
  ])
    .then(function () {
      loadUser();
      alert("Đã lưu thay đổi!");
    })
    .catch(function (err) {
      console.error("Lỗi lưu:", err);
    });
}

/* ── Change password ── */
function changePassword() {
  var current = prompt("Nhập mật khẩu hiện tại:");
  if (!current) return;
  var newPw = prompt("Nhập mật khẩu mới:");
  if (!newPw) return;
  if (prompt("Nhập lại mật khẩu mới:") !== newPw) {
    alert("Mật khẩu mới không khớp!");
    return;
  }
  fetch(API + "/user/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current: current, new: newPw }),
  })
    .then(handleFetch)
    .then(function (res) {
      if (res) {
        if (res.ok) alert("Đổi mật khẩu thành công!");
        else alert("Lỗi: " + res.error);
      }
    })
    .catch(function (err) {
      console.error("Lỗi:", err);
    });
}

/* ── API loaders ── */
function loadUser() {
  fetch(API + "/user")
    .then(handleFetch)
    .then(function (u) {
      if (!u) return;
      setText("sidebar-name", u.name.split(" ").slice(-1)[0]);
      setText("sidebar-role", u.role);
      setText("banner-name", u.name.split(" ").slice(-1)[0]);
      setText("chip-name", u.name.split(" ").slice(-1)[0]);
      setText("settings-profile-name", u.name);
      setText("settings-profile-email", u.email);
      setVal("field-name", u.name);
      setVal("field-email", u.email);
      setVal("field-phone", u.phone || "");
      setVal("field-birthday", u.birthday || "");
    });
}

function loadCourses() {
  var params = new URLSearchParams();
  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  if (levelFilter !== 'all') params.set('level', levelFilter);
  languageFilters.forEach(function (lang) {
    params.append('language', lang);
  });
  var url = API + '/courses';
  if (params.toString()) url += '?' + params.toString();

  return fetch(url)
    .then(handleFetch)
    .then(function (data) {
      if (data) {
        courses = data;
        renderCourses();
      }
    });
}

function loadEnrolled() {
  return fetch(API + "/enrolled")
    .then(handleFetch)
    .then(function (data) {
      if (data) {
        enrolledCourses = data;
        renderMyCourses();
        renderProgress();
      }
    });
}

function loadStats() {
  return fetch(API + "/stats")
    .then(handleFetch)
    .then(function (s) {
      if (!s) return;
      setText("stat-enrolled", s.enrolledCount);
      setText("stat-total-hours", s.totalHours);
      setText("stat-streak", s.streakDays + " ngày");
      setText("stat-certificates", s.certificates);
      setText("my-stat-count", s.enrolledCount);
      setText("my-stat-hours", s.totalHours);
      setText("my-stat-avg", s.avgProgress + "%");
    });
}

function loadNotifications() {
  return fetch(API + "/notifications")
    .then(handleFetch)
    .then(function (n) {
      if (!n) return;
      setToggle("toggle-email", n.emailNotif);
      setToggle("toggle-push", n.pushNotif);
      setToggle("toggle-remind", n.studyRemind);
      setToggle("toggle-content", n.contentUpdate);
    });
}

function loadAll() {
  loadUser();
  loadStats();
  loadCourses();
  loadEnrolled();
  loadNotifications();
  loadEduRoadmaps();
}


/* ── Dynamic date ── */
function updateDate() {
  var days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  var months = [
    "tháng 1",
    "tháng 2",
    "tháng 3",
    "tháng 4",
    "tháng 5",
    "tháng 6",
    "tháng 7",
    "tháng 8",
    "tháng 9",
    "tháng 10",
    "tháng 11",
    "tháng 12",
  ];
  var now = new Date();
  var el = document.querySelector(".topbar .sub");
  if (el)
    el.textContent =
      days[now.getDay()] +
      ", " +
      now.getDate() +
      " " +
      months[now.getMonth()] +
      ", " +
      now.getFullYear();
}

/* ── Dark / Light mode ── */
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  var btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

function toggleTheme() {
  var isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function initDragDrop() {
  var currentDrag = null;
  var draggables = document.querySelectorAll('.logic-card');
  var zones = document.querySelectorAll('.drop-target');

  draggables.forEach(function(card) {
    card.addEventListener('dragstart', function() {
      currentDrag = card;
      card.style.opacity = '0.4';
      card.style.transform = 'scale(0.9)';
    });
    card.addEventListener('dragend', function() {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });
  });

  zones.forEach(function(zone) {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      zone.classList.add('hovering');
    });
    zone.addEventListener('dragleave', function() {
      zone.classList.remove('hovering');
    });
    zone.addEventListener('drop', function() {
      zone.classList.remove('hovering');
      zone.classList.add('filled');

      if (!currentDrag) return;
      var val = currentDrag.innerText;
      var codeVal = currentDrag.getAttribute('data-val');

      zone.innerHTML = '<div class="logic-card ' +
        (currentDrag.classList.contains('block-blue') ? 'block-blue' : 'block-orange') +
        ' !m-0 !shadow-none !border-none !py-1 !px-4 text-sm">' + val + '</div>';

      if (zone.id === 'zone-cond') {
        var target = document.getElementById('code-cond');
        if (target) {
          target.innerText = codeVal;
          target.classList.remove('text-white/20');
          target.classList.add('text-orange-400', 'bg-orange-500/10');
        }
      }
      if (zone.id === 'zone-act') {
        var target = document.getElementById('code-act');
        if (target) {
          target.innerText = codeVal;
          target.classList.remove('text-white/20');
          target.classList.add('text-brand-secondary', 'bg-blue-500/10');
        }
      }
    });
  });
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", function () {
  applyTheme(localStorage.getItem("theme") === "dark");
  updateDate();
  const p = window.location.pathname;
  if (p !== "/login" && p !== "/register") {
    loadAll();
  }
  initDragDrop();
});

/* -- giaodien -- */

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
