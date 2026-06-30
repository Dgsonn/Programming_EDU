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
var currentSort = "newest";
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
  db_design: "/lesson/db_design",
};

var pageLabels = {
  dashboard: "Dashboard",
  courses: "Khóa học",
  roadmap: "Lộ trình",
  settings: "Cài đặt",
  forum: "Diễn đàn",
};

window.closeSidebar = function() {
    var sd = document.getElementById('sidebar-detail');
    var bd = document.getElementById('sidebar-backdrop');
    if (!sd) return;

    /* Ẩn backdrop + body class ngay lập tức */
    if (bd) bd.classList.remove('open');
    document.body.classList.remove('rm-sidebar-open');

    /* Nếu đang trong quá trình đóng rồi → bỏ qua, không add thêm listener/setTimeout */
    if (sd.classList.contains('closing')) return;
    /* Nếu chưa mở thì thôi */
    if (!sd.classList.contains('open')) return;

    /* Gỡ 'open' trước để CSS transition chạy ngược (right 0 → -400).
       Thêm 'closing' làm flag nội bộ để chặn click đúp. */
    sd.classList.remove('open');
    sd.classList.add('closing');

    var cleanup = function() {
        sd.classList.remove('closing');
        sd.removeEventListener('transitionend', onEnd);
    };
    var onEnd = function(ev) {
        /* chỉ cleanup khi transition của `right` (slide) kết thúc */
        if (ev && ev.propertyName && ev.propertyName !== 'right') return;
        cleanup();
    };
    sd.addEventListener('transitionend', onEnd);
    /* Fallback 400ms nếu transitionend không fire (vd: bị che bởi element khác) */
    setTimeout(cleanup, 400);
};

window.toggleSidebar = function() {
  var sidebar = document.getElementById('sidebar');
  var btn = document.getElementById('sidebar-toggle-btn');
  if (!sidebar) return;
  var hidden = sidebar.classList.toggle('hidden');
  if (btn) {
    btn.setAttribute('aria-expanded', String(!hidden));
    btn.textContent = hidden ? '☰' : '✕';
    btn.title = hidden ? 'Mở menu' : 'Đóng menu';
  }
};

function _getMermaidTheme() {
    var dark = document.body.classList.contains('dark');
    if (dark) {
        return {
            theme: 'base',
            themeVariables: {
                background:            '#0A101F',
                primaryColor:          '#050E1F',
                primaryBorderColor:    '#38BDF8',
                primaryTextColor:      '#BAE6FD',
                secondaryColor:        '#011C0E',
                secondaryBorderColor:  '#4ADE80',
                secondaryTextColor:    '#BBF7D0',
                tertiaryColor:         '#0F0520',
                tertiaryBorderColor:   '#A78BFA',
                tertiaryTextColor:     '#DDD6FE',
                lineColor:             '#475569',
                edgeLabelBackground:   '#1E293B',
                clusterBkg:            '#1E293B',
                clusterBorder:         '#334155',
                titleColor:            '#F1F5F9',
                nodeTextColor:         '#F1F5F9',
                fontFamily:            'inherit',
            }
        };
    }
    return {
        theme: 'base',
        themeVariables: {
            background:            '#FFFFFF',
            primaryColor:          '#EFF6FF',
            primaryBorderColor:    '#60A5FA',
            primaryTextColor:      '#1D4ED8',
            secondaryColor:        '#F0FDF4',
            secondaryBorderColor:  '#34D399',
            secondaryTextColor:    '#065F46',
            tertiaryColor:         '#F5F3FF',
            tertiaryBorderColor:   '#A78BFA',
            tertiaryTextColor:     '#5B21B6',
            lineColor:             '#94A3B8',
            edgeLabelBackground:   '#F8FAFC',
            clusterBkg:            '#FAFAFA',
            clusterBorder:         '#E5E7EB',
            titleColor:            '#1F2937',
            nodeTextColor:         '#1F2937',
            fontFamily:            'inherit',
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize(Object.assign({
            startOnLoad: false,
            securityLevel: 'strict',
            suppressErrors: true,
        }, _getMermaidTheme()));
    }
    document.addEventListener('click', function(e) {
        var sidebar = document.getElementById('sidebar-detail');
        if (!sidebar || !sidebar.classList.contains('open')) return;
        /* Click trên backdrop thì backdrop tự xử lý onclick → bỏ qua để tránh double-call */
        var bd = document.getElementById('sidebar-backdrop');
        if (bd && bd.contains(e.target)) return;
        if (!sidebar.contains(e.target)) closeSidebar();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeSearchSuggestions();
            closeSidebar();
            var editor = document.getElementById('rm-personal-editor');
            if (editor) editor.blur();
        }
    });
});

/* ════════════════════════════════════════════════════════════
   ★ CÁ NHÂN HÓA LỘ TRÌNH — Visual drag-and-drop builder
   ════════════════════════════════════════════════════════════ */
var _rmPersonalLoaded = false;

/* ── State ── */
var _rmV = {
    nodes:      [],       // [{id, x, y, label, color}]
    edges:      [],       // [{from, to}]
    nextId:     1,
    mode:       'normal', // 'normal' | 'connect'
    connectSrc: null,
    selected:   null,
    drag:       null,
    didDrag:    false,
    zoom:       1.0,
};
var _RMV_COLORS = 6;

/* ── Helpers ── */
function _rmVEsc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Default starter diagram ── */
function _rmVInitDefault() {
    _rmV.nodes = [
        { id:'vn_1', x:220, y:80,  label:'🎯 Bắt đầu',      color:0 },
        { id:'vn_2', x:220, y:200, label:'📚 Học lý thuyết', color:1 },
        { id:'vn_3', x:220, y:320, label:'🛠️ Thực hành',     color:2 },
        { id:'vn_4', x:220, y:440, label:'✅ Hoàn thành',    color:3 },
    ];
    _rmV.edges  = [{from:'vn_1',to:'vn_2'},{from:'vn_2',to:'vn_3'},{from:'vn_3',to:'vn_4'}];
    _rmV.nextId = 5;
}

/* ── Serialize / Deserialize ── */
function _rmVToMermaid() {
    if (!_rmV.nodes.length) return 'flowchart TD\n    A["🎯 Bắt đầu"] --> B["✅ Hoàn thành"]';
    var lines = ['flowchart TD'];
    _rmV.nodes.forEach(function(n) {
        lines.push('    ' + n.id + '["' + n.label.replace(/"/g,"'") + '"]');
    });
    _rmV.edges.forEach(function(e) {
        lines.push('    ' + e.from + ' --> ' + e.to);
    });
    lines.push('%% VDATA:' + JSON.stringify({nodes:_rmV.nodes, edges:_rmV.edges, nextId:_rmV.nextId}));
    return lines.join('\n');
}

function _rmVFromMermaid(mdef) {
    var m = mdef && mdef.match(/%% VDATA:(.+)$/m);
    if (m) {
        try {
            var d = JSON.parse(m[1]);
            _rmV.nodes  = d.nodes  || [];
            _rmV.edges  = d.edges  || [];
            _rmV.nextId = d.nextId || (_rmV.nodes.length + 1);
            return true;
        } catch(e) { /* rơi xuống parser mermaid thường */ }
    }
    // Không có VDATA (vd: lộ trình sinh từ template) -> parse mermaid flowchart thường
    return _rmVFromPlainMermaid(mdef);
}

/* Parse mermaid flowchart cơ bản (node defs + cạnh) và tự sắp xếp toạ độ.
   Dùng cho lộ trình 'generated' được sao chép từ template (không kèm VDATA). */
function _rmVFromPlainMermaid(mdef) {
    if (!mdef) return false;
    var lines = String(mdef).split('\n');
    var nodes = {};         // id -> { id, label }
    var order = [];         // giữ thứ tự khai báo
    var edges = [];
    var nodeDefRe = /^\s*([A-Za-z0-9_]+)\s*\[\s*"?([^"\]]*)"?\s*\]\s*$/;
    var edgeRe    = /^\s*([A-Za-z0-9_]+)\s*-->\s*([A-Za-z0-9_]+)\s*$/;

    function ensure(id, label) {
        if (!nodes[id]) { nodes[id] = { id: id, label: label || id }; order.push(id); }
        else if (label) { nodes[id].label = label; }
    }

    lines.forEach(function(raw) {
        var line = raw.trim();
        if (!line || /^flowchart/i.test(line) || line.indexOf('%%') === 0) return;
        var em = line.match(edgeRe);
        if (em) { ensure(em[1]); ensure(em[2]); edges.push({ from: em[1], to: em[2] }); return; }
        var nm = line.match(nodeDefRe);
        if (nm) { ensure(nm[1], nm[2].trim()); }
    });

    if (!order.length) return false;

    // Tính độ sâu (longest-path) để xếp tầng theo chiều dọc
    var depth = {}, adj = {};
    order.forEach(function(id){ depth[id] = 0; adj[id] = []; });
    edges.forEach(function(e){ if (adj[e.from]) adj[e.from].push(e.to); });
    // lặp đến hội tụ (đồ thị nhỏ, DAG)
    for (var pass = 0; pass < order.length; pass++) {
        var changed = false;
        edges.forEach(function(e){
            if (depth[e.to] < depth[e.from] + 1) { depth[e.to] = depth[e.from] + 1; changed = true; }
        });
        if (!changed) break;
    }

    var byDepth = {};
    order.forEach(function(id){ (byDepth[depth[id]] = byDepth[depth[id]] || []).push(id); });

    var COL_GAP = 210, ROW_GAP = 130, X0 = 240, Y0 = 80;
    var ci = 0;
    _rmV.nodes = [];
    Object.keys(byDepth).map(Number).sort(function(a,b){return a-b;}).forEach(function(d){
        var ids = byDepth[d];
        ids.forEach(function(id, i){
            _rmV.nodes.push({
                id: id,
                x: X0 + (i - (ids.length - 1) / 2) * COL_GAP,
                y: Y0 + d * ROW_GAP,
                label: nodes[id].label,
                color: (ci++) % _RMV_COLORS
            });
        });
    });
    _rmV.edges  = edges;
    _rmV.nextId = order.length + 1;
    return true;
}

/* ── Render ── */
function _rmVRenderArrows() {
    var content = document.getElementById('rm-vcontent');
    var svg     = document.getElementById('rm-arrows-svg');
    if (!svg || !content) return;
    var canvas  = content; // alias for querySelector calls below

    /* Batch read: đọc tất cả sizes trước, tránh reflow trong vòng lặp */
    var sizeCache = {};
    _rmV.nodes.forEach(function(n) {
        var el = canvas.querySelector('.rm-vnode[data-id="'+n.id+'"]');
        sizeCache[n.id] = el
            ? { w: el.offsetWidth, h: el.offsetHeight }
            : { w: 130, h: 44 };
    });

    svg.innerHTML = '<defs>'
        + '<marker id="rmva" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">'
        + '<polygon points="0 0,9 3.5,0 7" fill="#38BDF8"/></marker>'
        + '<marker id="rmva-del" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">'
        + '<polygon points="0 0,9 3.5,0 7" fill="#F472B6"/></marker>'
        + '</defs>';

    _rmV.edges.forEach(function(e, ei) {
        var fn = _rmV.nodes.find(function(n){ return n.id === e.from; });
        var tn = _rmV.nodes.find(function(n){ return n.id === e.to;   });
        if (!fn || !tn) return;

        var fS = sizeCache[e.from] || { w: 130, h: 44 };
        var tS = sizeCache[e.to]   || { w: 130, h: 44 };

        var x1 = fn.x,    y1 = fn.y + fS.h / 2;
        var x2 = tn.x,    y2 = tn.y - tS.h / 2;

        /* If target above source, use side exits */
        if (tn.y < fn.y + fS.h) {
            var dir = tn.x >= fn.x ? 1 : -1;
            x1 = fn.x + dir * fS.w / 2;  y1 = fn.y;
            x2 = tn.x - dir * tS.w / 2;  y2 = tn.y;
        }

        var dy = Math.abs(y2 - y1), dx = Math.abs(x2 - x1);
        var cy = Math.max(40, (dy + dx) * 0.35);
        var d  = 'M'+x1+','+y1+' C'+x1+','+(y1+cy)+' '+x2+','+(y2-cy)+' '+x2+','+y2;

        /* Invisible wide hit path */
        var hit = document.createElementNS('http://www.w3.org/2000/svg','path');
        hit.setAttribute('d', d);
        hit.setAttribute('stroke','transparent');
        hit.setAttribute('stroke-width','14');
        hit.setAttribute('fill','none');
        hit.style.cursor = 'pointer';
        hit.title = 'Click để xóa mũi tên';
        (function(idx){ hit.addEventListener('click', function(ev){ ev.stopPropagation(); rmVDeleteEdge(idx); }); })(ei);

        /* Visible path */
        var path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('d', d);
        path.setAttribute('stroke','#38BDF8');
        path.setAttribute('stroke-width','2');
        path.setAttribute('fill','none');
        path.setAttribute('marker-end','url(#rmva)');
        path.style.pointerEvents = 'none';

        svg.appendChild(hit);
        svg.appendChild(path);
    });
}

function _rmVRender() {
    var canvas = document.getElementById('rm-vcontent');
    if (!canvas) return;
    canvas.querySelectorAll('.rm-vnode').forEach(function(el){ el.remove(); });

    _rmV.nodes.forEach(function(n) {
        var div = document.createElement('div');
        div.className = 'rm-vnode';
        div.setAttribute('data-id', n.id);
        div.setAttribute('data-color', n.color || 0);
        div.style.left = n.x + 'px';
        div.style.top  = n.y + 'px';
        if (_rmV.selected === n.id)  div.classList.add('rmv-selected');
        if (_rmV.mode === 'connect' && _rmV.connectSrc === n.id) div.classList.add('rmv-src');
        if (_rmV.mode === 'connect' && _rmV.connectSrc && _rmV.connectSrc !== n.id) div.classList.add('rmv-tgt');

        div.innerHTML = '<div class="rmv-label">' + _rmVEsc(n.label) + '</div>'
                      + '<button class="rmv-del" title="Xóa node">×</button>';

        div.querySelector('.rmv-del').addEventListener('click', function(e){
            e.stopPropagation(); rmVDeleteNode(n.id);
        });
        div.addEventListener('mousedown', function(e){
            if (e.target.classList.contains('rmv-del')) return;
            _rmVStartDrag(e, n);
        });
        div.addEventListener('click', function(e){
            if (e.target.classList.contains('rmv-del')) return;
            if (_rmV.didDrag) { _rmV.didDrag = false; return; }
            e.stopPropagation(); _rmVNodeClick(n.id);
        });
        div.addEventListener('dblclick', function(e){
            if (e.target.classList.contains('rmv-del')) return;
            e.stopPropagation(); _rmVRenameInline(n, div);
        });

        canvas.appendChild(div);
    });

    _rmVRenderArrows();
    _rmVSyncToolbar();
    _rmVSetHint('');
}

/* ── Toolbar sync ── */
function _rmVSyncToolbar() {
    var btn = document.getElementById('rm-vbtn-connect');
    if (btn) btn.classList.toggle('rmv-active', _rmV.mode === 'connect');
}

function _rmVSetHint(msg) {
    var el = document.getElementById('rm-vhint');
    if (!el) return;
    if (msg) { el.textContent = msg; return; }
    if (_rmV.nodes.length === 0) { el.textContent = 'Click "Thêm node" để bắt đầu'; return; }
    if (_rmV.mode === 'connect') {
        el.textContent = _rmV.connectSrc ? 'Chọn node đích →' : 'Chọn node nguồn →';
    } else {
        el.textContent = 'Kéo để di chuyển · Nhấn đúp để đổi tên · Click mũi tên để xóa';
    }
}

/* ── Actions ── */
function rmVAddNode() {
    var canvas  = document.getElementById('rm-visual-canvas');
    var content = document.getElementById('rm-vcontent');
    var z  = _rmV.zoom;
    var cx = canvas ? canvas.clientWidth  / 2 / z : 220;
    var cy = canvas ? (canvas.scrollTop + canvas.clientHeight / 2) / z : 220;
    var offset = (_rmV.nodes.length % 5) * 28;
    var n = { id:'vn_'+(_rmV.nextId++), x:cx+offset-60, y:cy+offset-60,
              label:'Node '+_rmV.nodes.length, color:_rmV.nodes.length % _RMV_COLORS };
    _rmV.nodes.push(n);
    _rmV.selected = n.id;
    _rmVRender();
    /* Auto-open rename after a tick */
    setTimeout(function(){
        var el = content ? content.querySelector('.rm-vnode[data-id="'+n.id+'"]') : null;
        if (el) _rmVRenameInline(n, el);
    }, 40);
}

function rmVToggleConnect() {
    _rmV.mode = (_rmV.mode === 'connect') ? 'normal' : 'connect';
    _rmV.connectSrc = null;
    _rmVRender();
}

function rmVClearAll() {
    if (!_rmV.nodes.length || !confirm('Xóa toàn bộ sơ đồ?')) return;
    _rmV.nodes = []; _rmV.edges = []; _rmV.selected = null; _rmV.connectSrc = null;
    _rmVRender();
}

function rmVDeleteNode(id) {
    _rmV.nodes = _rmV.nodes.filter(function(n){ return n.id !== id; });
    _rmV.edges = _rmV.edges.filter(function(e){ return e.from !== id && e.to !== id; });
    if (_rmV.selected   === id) _rmV.selected   = null;
    if (_rmV.connectSrc === id) _rmV.connectSrc = null;
    _rmVRender();
}

function rmVDeleteEdge(idx) {
    _rmV.edges.splice(idx, 1);
    _rmVRenderArrows();
}

function _rmVNodeClick(id) {
    if (_rmV.mode === 'connect') {
        if (!_rmV.connectSrc) {
            _rmV.connectSrc = id;
            _rmVRender();
        } else if (_rmV.connectSrc !== id) {
            var dup = _rmV.edges.some(function(e){ return e.from===_rmV.connectSrc && e.to===id; });
            if (!dup) _rmV.edges.push({from:_rmV.connectSrc, to:id});
            _rmV.connectSrc = null;
            _rmVRender();
        }
    } else {
        _rmV.selected = (_rmV.selected === id) ? null : id;
        _rmVRender();
    }
}

/* ── Drag ── */
function _rmVStartDrag(e, node) {
    e.preventDefault();
    var canvas  = document.getElementById('rm-visual-canvas');
    var content = document.getElementById('rm-vcontent');
    var r  = canvas.getBoundingClientRect();
    var z  = _rmV.zoom;
    var ox = (e.clientX - r.left) / z - node.x;
    var oy = (e.clientY - r.top)  / z - node.y;
    var sx = e.clientX, sy = e.clientY;
    _rmV.drag = true;
    _rmV.didDrag = false;

    function onMove(me) {
        if (!_rmV.didDrag) {
            if (Math.abs(me.clientX - sx) > 5 || Math.abs(me.clientY - sy) > 5) {
                _rmV.didDrag = true;
            } else return;
        }
        node.x = Math.max(0, (me.clientX - r.left) / z - ox);
        node.y = Math.max(0, (me.clientY - r.top)  / z - oy);
        var el = content ? content.querySelector('.rm-vnode[data-id="'+node.id+'"]') : null;
        if (el) { el.style.left = node.x+'px'; el.style.top = node.y+'px'; }
        _rmVRenderArrows();
    }
    function onUp() {
        _rmV.drag = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
}

/* ── Inline rename ── */
function _rmVRenameInline(node, divEl) {
    var lbl = divEl.querySelector('.rmv-label');
    if (!lbl) return;
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = node.label;
    inp.className = 'rmv-input';
    inp.setAttribute('lang', 'vi');
    lbl.replaceWith(inp);
    inp.focus(); inp.select();

    var done = false;
    var isComposing = false;

    inp.addEventListener('compositionstart', function() { isComposing = true; });
    inp.addEventListener('compositionend',   function() { isComposing = false; });

    function commit() {
        if (done) return;
        done = true;
        node.label = inp.value.trim() || node.label;
        _rmVRender();
    }
    /* Trì hoãn blur để compositionend kịp chạy trước (tiếng Việt, CJK...) */
    inp.addEventListener('blur', function() {
        setTimeout(function() {
            if (!isComposing) commit();
        }, 80);
    });
    inp.addEventListener('keydown', function(e) {
        /* Chặn sự kiện lan lên canvas — tránh Backspace xóa node khi đang gõ */
        e.stopPropagation();
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter')  { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { done = true; _rmVRender(); }
    });
}

/* ── Zoom ── */
function _rmVApplyZoom() {
    var content = document.getElementById('rm-vcontent');
    if (content) content.style.transform = 'scale(' + _rmV.zoom + ')';
    var lbl = document.getElementById('rm-vzoom-label');
    if (lbl) lbl.textContent = Math.round(_rmV.zoom * 100) + '%';
}
function rmVZoomIn()    { _rmV.zoom = Math.min(2.5, +(_rmV.zoom + 0.15).toFixed(2)); _rmVApplyZoom(); }
function rmVZoomOut()   { _rmV.zoom = Math.max(0.3, +(_rmV.zoom - 0.15).toFixed(2)); _rmVApplyZoom(); }
function rmVZoomReset() { _rmV.zoom = 1.0; _rmVApplyZoom(); }

/* ── Canvas init (once) ── */
function _rmVInitCanvas() {
    var canvas = document.getElementById('rm-visual-canvas');
    if (!canvas || canvas._rmVInited) return;
    canvas._rmVInited = true;
    canvas.addEventListener('click', function(e){
        var content = document.getElementById('rm-vcontent');
        if (e.target === canvas || e.target === content || e.target.id === 'rm-arrows-svg') {
            _rmV.selected = null;
            _rmV.connectSrc = null;
        }
        if ((e.key==='Delete'||e.key==='Backspace') && _rmV.selected) {
            rmVDeleteNode(_rmV.selected);
        }
    });
    canvas.addEventListener('wheel', function(e){
        if (!e.ctrlKey) return;
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        _rmV.zoom = Math.min(2.5, Math.max(0.3, +(_rmV.zoom + delta).toFixed(2)));
        _rmVApplyZoom();
    }, { passive: false });
}

/* ── Load / Save ── */
function loadPersonalRoadmap() {
    if (_rmPersonalLoaded) return;
    _rmPersonalLoaded = true;
    _rmVInitCanvas();
    fetch(API + '/me/roadmap')
        .then(handleFetch)
        .then(function(data) {
            var mdef = (data && data.mermaid_def || '').trim();
            if (!_rmVFromMermaid(mdef)) _rmVInitDefault();
            _rmVRender();
        })
        .catch(function() { _rmVInitDefault(); _rmVRender(); });
}

function savePersonalRoadmap() {
    var btn = document.querySelector('.rm-save-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang lưu...'; }
    fetch(API + '/me/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mermaid_def: _rmVToMermaid() })
    })
    .then(handleFetch)
    .then(function() {
        if (btn) { btn.disabled=false; btn.textContent='✅ Đã lưu'; setTimeout(function(){ btn.textContent='💾 Lưu lộ trình'; },2000); }
    })
    .catch(function() { if (btn) { btn.disabled=false; btn.textContent='💾 Lưu lộ trình'; } });
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
function _updateNavUnderline(activeBtn) {
  var line = document.getElementById("nav-underline");
  var nav = document.getElementById("topbar-nav");
  if (!line || !nav || !activeBtn) return;
  var navRect = nav.getBoundingClientRect();
  var btnRect = activeBtn.getBoundingClientRect();
  line.style.left = (btnRect.left - navRect.left) + "px";
  line.style.width = btnRect.width + "px";
}
window.addEventListener("resize", function () {
  var active = document.querySelector(".nav-btn.active");
  if (active) _updateNavUnderline(active);
});

function navigate(page) {
  /* Đóng panel chi tiết roadmap (nếu đang mở) để tránh kẹt body scroll + UI lỗi */
  try { closeSidebar(); } catch (_) {}

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

  var titleEl = document.getElementById("topbar-title");
  if (titleEl) titleEl.textContent = pageLabels[page] || "Dashboard";

  _updateNavUnderline(active);

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

/* ── Sort & Filter Courses ── */
function sortCourses(courseList) {
  if (!courseList || !courseList.length) return [];
  var sorted = courseList.slice();
  if (currentSort === 'newest') {
    sorted.sort(function(a, b) { return (b.id || 0) - (a.id || 0); });
  } else if (currentSort === 'popular') {
    sorted.sort(function(a, b) { 
      var enrollA = parseInt(a.enrollments || '0'.replace(/[^\d]/g, '')) || 0;
      var enrollB = parseInt(b.enrollments || '0'.replace(/[^\d]/g, '')) || 0;
      return enrollB - enrollA; 
    });
  } else if (currentSort === 'duration') {
    sorted.sort(function(a, b) {
      var durA = parseInt(a.duration || '0'.replace(/[^\d]/g, '')) || 999;
      var durB = parseInt(b.duration || '0'.replace(/[^\d]/g, '')) || 999;
      return durA - durB;
    });
  }
  return sorted;
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

  filtered = sortCourses(filtered);

  var sub = document.getElementById("courses-count-sub");
  if (sub) sub.textContent = courses.length + " khóa học có sẵn";

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  grid.innerHTML = filtered
    .map(function (c, i) {
      return [
        '<div class="course-card fx-fade-up" style="animation-delay:' + Math.min(i * 0.05, 0.4) + 's">',
        '<div class="card-img-wrap" style="cursor:pointer" onclick="window.location=\'/courses/' + c.id + '\'">',
        '<img src="/' + c.image + '" alt="' + c.title + '" loading="lazy" />',
        '<div class="card-overlay"></div>',
        '<div class="badge-level" style="background:linear-gradient(135deg,' +
          c.color +
          "," +
          c.accentColor +
          ')">' +
          c.level +
          "</div>",
        c.enrolled ? '<div class="badge-enrolled"><span data-icon="check" data-size="11"></span> Đã đăng ký</div>' : "",
        '<div class="card-title-overlay">',
        '<div class="card-tag">' + c.tag + "</div>",
        "<h3>" + c.title + "</h3>",
        "</div>",
        "</div>",
        '<div class="card-body">',
        '<div class="card-desc">' + c.description + "</div>",
        '<div class="card-stats">',
        '<span class="card-stat"><span data-icon="star" data-size="11" data-color="#F59E0B" style="display:inline-flex"></span> <span class="rating">' + c.rating + "</span></span>",
        '<span class="card-stat"><span data-icon="users" data-size="11" style="display:inline-flex"></span> ' + c.students + "</span>",
        '<span class="card-stat"><span data-icon="clock" data-size="11" style="display:inline-flex"></span> ' + c.duration + "</span>",
        '<span class="card-stat"><span data-icon="book-open" data-size="11" style="display:inline-flex"></span> ' + c.lessons + "</span>",
        "</div>",
        '<div class="card-footer">',
        '<span class="card-level-pill">' + c.level + "</span>",
        '<div class="card-footer-spacer"></div>',
        '<button class="card-btn-ghost" onclick="window.location=\'/courses/' + c.id + '\'">Học thử</button>',
        (function () {
          if (c.enrolled) {
            var goUrl = COURSE_URLS[c.id] || "#";
            return '<button class="card-btn-enrolled" onclick="window.location=\'' + goUrl + '\'"><span data-icon="check" data-size="12"></span> Đã đăng ký</button>';
          }
          return '<button class="card-btn-enroll" onclick="toggleEnroll(\'' + c.id + '\',false)">Đăng ký</button>';
        })(),
        "</div>",
        "</div>",
        "</div>",
      ].join("");
    })
    .join("");
  if (window.mountIcons) mountIcons(grid);
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
function _applyEnrollState(courseId, enrolled) {
  try { sessionStorage.removeItem(_COURSES_CACHE_KEY); } catch (e) {}
  courses.forEach(function(c) {
    if (c.id === courseId) c.enrolled = enrolled;
  });
  if (enrolled) {
    var c = courses.find(function(c) { return c.id === courseId; });
    if (c && !enrolledCourses.some(function(e) { return e.id === courseId; })) {
      enrolledCourses.push(c);
    }
  } else {
    enrolledCourses = enrolledCourses.filter(function(c) { return c.id !== courseId; });
  }
  renderCourses();
  renderMyCourses();
  renderProgress();
  var countEl = document.getElementById('stat-enrolled');
  if (countEl) countEl.textContent = enrolledCourses.length;
}

function toggleEnroll(courseId, isEnrolled) {
  var method = isEnrolled ? "DELETE" : "POST";
  fetch(API + "/courses/" + courseId + "/enroll", { method: method })
    .then(handleFetch)
    .then(function (d) {
      if (d) _applyEnrollState(courseId, !isEnrolled);
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
      if (d) _applyEnrollState(courseId, false);
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
    renderCourses();
  }, 150);
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
  renderCourses();
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
  renderCourses();
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
  searchDebounceTimer = setTimeout(renderCourses, 150);
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
    renderCourses();
    return;
  }
  if (val === 'Cơ bản') {
    levelFilter = 'Phù hợp người mới';
    renderSearchSuggestions();
    renderActiveFilters();
    renderCourses();
    return;
  }
  if (val === 'Trung cấp') {
    levelFilter = 'Trung cấp';
    renderSearchSuggestions();
    renderActiveFilters();
    renderCourses();
    return;
  }
  if (val === 'Cao cấp') {
    levelFilter = 'Nâng cao';
    renderSearchSuggestions();
    renderActiveFilters();
    renderCourses();
    return;
  }

  // Chỉ set searchQuery khi chọn gợi ý tìm kiếm thông thường
  searchQuery = val;
  renderCourses();
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
  renderCourses();
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
      b.setAttribute('aria-checked', 'false');
    });
  }
  btn.classList.add("active");
  btn.setAttribute('aria-checked', 'true');
  renderCourses();
}

function setSortOrder(value) {
  currentSort = value;
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
  renderCourses();
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
  renderCourses();
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
  renderCourses();
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
      var isNewUser = Boolean(u.is_new_user || u.first_login || u.questionnaire_completed === 0);
      setText("banner-greeting", isNewUser ? "Chào mừng bạn đến với Programming EDU! 🎉" : "Chào mừng trở lại! 👋");
      setText("sidebar-name", u.name.split(" ").slice(-1)[0]);
      setText("sidebar-role", u.role);
      var adminBtn = document.getElementById("nav-admin");
      if (adminBtn) adminBtn.style.display = (u.role === "admin") ? "" : "none";
      setText("banner-name", u.name.split(" ").slice(-1)[0]);
      setText("chip-name", u.name.split(" ").slice(-1)[0]);
      var _initial = (u.name || "?").trim().charAt(0).toUpperCase();
      ["chip-avatar", "udh-avatar", "fcb-avatar", "prof-avatar-letter"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = _initial;
      });
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
      var grid = document.getElementById('stats-grid');
      if (grid && grid.querySelector('.skel-stat')) {
        grid.innerHTML =
          '<div class="stat-card" onmouseenter="hoverStat(this,\'#4A9EE0\')" onmouseleave="unhoverStat(this)"><div class="stat-icon icon-blue">📖</div><div class="stat-body"><div class="stat-val" id="stat-enrolled">—</div><div class="stat-lbl">Khóa học đang học</div></div></div>' +
          '<div class="stat-card" onmouseenter="hoverStat(this,\'#E84545\')" onmouseleave="unhoverStat(this)"><div class="stat-icon icon-red">⏰</div><div class="stat-body"><div class="stat-val" id="stat-total-hours">—</div><div class="stat-lbl">Tổng giờ học</div></div></div>' +
          '<div class="stat-card" onmouseenter="hoverStat(this,\'#F59E0B\')" onmouseleave="unhoverStat(this)"><div class="stat-icon icon-orange">🔥</div><div class="stat-body"><div class="stat-val" id="stat-streak">—</div><div class="stat-lbl">Chuỗi ngày học</div></div></div>' +
          '<div class="stat-card" onmouseenter="hoverStat(this,\'#10B981\')" onmouseleave="unhoverStat(this)"><div class="stat-icon icon-green">🏆</div><div class="stat-body"><div class="stat-val" id="stat-certificates">—</div><div class="stat-lbl">Chứng chỉ</div></div></div>';
      }
      setText("stat-enrolled", s.enrolledCount);
      setText("stat-total-hours", s.totalHours);
      setText("stat-streak", s.streakDays + " ngày");
      setText("stat-certificates", s.certificates);
      setText("my-stat-count", s.enrolledCount);
      setText("my-stat-hours", s.totalHours);
      setText("my-stat-avg", s.avgProgress + "%");
      renderStudyCalendar(s.streakDays || 0, s.streakActive || false);
    });
}

/* ── Lịch học tuần ── */
(function () {
  var DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  var DAY_NAMES  = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  function getMonday(d) {
    var day = d.getDay();
    var diff = (day === 0) ? -6 : 1 - day;
    var mon = new Date(d);
    mon.setDate(d.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  }

  function fmtDate(d) {
    return d.getDate() + '/' + (d.getMonth() + 1);
  }

  function fmtFull(d) {
    return d.getDate() + ' tháng ' + (d.getMonth() + 1) + ', ' + d.getFullYear();
  }

  window.renderStudyCalendar = function (streakDays, streakActive) {
    var grid  = document.getElementById('study-cal-grid');
    var numEl = document.getElementById('cal-streak-num');
    if (!grid) return;

    if (numEl) numEl.textContent = streakDays;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var monday = getMonday(today);

    /* tính các ngày đã học: tính ngược từ hôm nay theo streak */
    var studiedDates = {};
    if (streakDays > 0) {
      var cursor = new Date(today);
      if (!streakActive) cursor.setDate(cursor.getDate() - 1);
      for (var i = 0; i < streakDays; i++) {
        var k = cursor.getFullYear() + '-' + cursor.getMonth() + '-' + cursor.getDate();
        studiedDates[k] = true;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    var html = '';
    for (var d = 0; d < 7; d++) {
      var day = new Date(monday);
      day.setDate(monday.getDate() + d);
      day.setHours(0, 0, 0, 0);

      var isToday  = day.getTime() === today.getTime();
      var isFuture = day.getTime() > today.getTime();
      var key      = day.getFullYear() + '-' + day.getMonth() + '-' + day.getDate();
      var isDone   = !isFuture && !!studiedDates[key];

      var stateClass = isFuture ? 'future' : (isDone ? 'done' : 'todo');
      if (isToday) stateClass += ' today';

      var icon = isFuture ? '○' : (isDone ? '✓' : '○');
      var todayRing = isToday ? '<span class="cal-today-ring"></span>' : '';

      var statusText, statusClass;
      if (isFuture) {
        statusText = 'Chưa đến ngày';
        statusClass = 'cal-tooltip-status-future';
      } else if (isDone) {
        statusText = '✓ Đã hoàn thành';
        statusClass = 'cal-tooltip-status-done';
      } else {
        statusText = '○ Chưa học';
        statusClass = 'cal-tooltip-status-todo';
      }

      var tipData = encodeURIComponent(JSON.stringify({
        name: DAY_NAMES[d],
        date: fmtFull(day),
        statusText: statusText,
        statusClass: statusClass,
        isToday: isToday
      }));

      html += '<div class="cal-day ' + stateClass + '"'
            + ' data-tip="' + tipData + '"'
            + ' onmouseenter="calShowTip(this,event)"'
            + ' onmousemove="calMoveTip(event)"'
            + ' onmouseleave="calHideTip()">'
            + todayRing
            + '<span class="cal-day-label">' + DAY_LABELS[d] + '</span>'
            + '<span class="cal-day-num">' + fmtDate(day) + '</span>'
            + '<span class="cal-day-icon">' + icon + '</span>'
            + '</div>';
    }
    grid.innerHTML = html;
  };

  window.calShowTip = function (el, e) {
    var tip = document.getElementById('cal-tooltip');
    if (!tip) return;
    try {
      var data = JSON.parse(decodeURIComponent(el.getAttribute('data-tip')));
      tip.innerHTML = '<div class="cal-tooltip-title">'
                    + data.name
                    + (data.isToday ? ' · <span style="color:#60A5FA">Hôm nay</span>' : '')
                    + '</div>'
                    + '<div class="cal-tooltip-sub">' + data.date + '</div>'
                    + '<div class="' + data.statusClass + '" style="margin-top:4px;">' + data.statusText + '</div>';
    } catch (_) { return; }
    tip.classList.add('show');
    calMoveTip(e);
  };

  window.calMoveTip = function (e) {
    var tip = document.getElementById('cal-tooltip');
    if (!tip) return;
    var x = e.clientX + 14;
    var y = e.clientY - 10;
    if (x + 220 > window.innerWidth) x = e.clientX - 224;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  };

  window.calHideTip = function () {
    var tip = document.getElementById('cal-tooltip');
    if (tip) tip.classList.remove('show');
  };
})();

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

var _COURSES_CACHE_KEY = 'edu_courses_cache_v1';

var _DB_DESIGN_CARD = {
  id: 'db_design',
  title: 'Database Design',
  subtitle: 'Thiết kế & Quản lý CSDL',
  description: 'Thiết kế và quản lý cơ sở dữ liệu quan hệ từ ER Diagram, SQL đến tối ưu hóa query thực tế.',
  image: 'static/images/db_design.svg',
  level: 'Trung cấp',
  duration: '40 giờ',
  students: '12.5K',
  rating: 4.8,
  lessons: 60,
  color: '#1a2744',
  accentColor: '#0f172a',
  tag: 'DATABASE',
  enrolled: false
};

function _applyCoursesData(data) {
  courses = data.courses;
  // Thêm card Database Design nếu backend chưa trả về
  if (!courses.some(function(c) { return c.id === 'db_design'; })) {
    courses.push(_DB_DESIGN_CARD);
  }
  enrolledCourses = data.enrolled;
  renderCourses();
  renderMyCourses();
  renderProgress();
}

function loadCoursesAndEnrolled() {
  /* Render từ cache ngay lập tức nếu có → UI hiện lên trước khi fetch xong */
  try {
    var cached = sessionStorage.getItem(_COURSES_CACHE_KEY);
    if (cached) _applyCoursesData(JSON.parse(cached));
  } catch (e) {}

  return fetch(API + '/courses-enrolled')
    .then(handleFetch)
    .then(function(data) {
      if (!data) return;
      try { sessionStorage.setItem(_COURSES_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
      _applyCoursesData(data);
    });
}

function loadAll() {
  loadUser();
  loadStats();
  loadCoursesAndEnrolled();
  loadNotifications();
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
  applyTheme(localStorage.getItem("theme") !== "light");
  updateDate();
  const p = window.location.pathname;
  if (p !== "/login" && p !== "/register") {
    loadAll();
  }
  initDragDrop();

  // Xử lý hash navigation từ các trang khác (vd: /dashboard#roadmap)
  var hash = window.location.hash.replace('#', '');
  var validPages = ['dashboard', 'courses', 'roadmap', 'skills', 'forum', 'settings'];
  if (hash && validPages.includes(hash)) {
    navigate(hash);
  } else {
    var initActive = document.querySelector(".nav-btn.active");
    if (initActive) _updateNavUnderline(initActive);
  }
});

/* -- giaodien -- */


  function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
        }
