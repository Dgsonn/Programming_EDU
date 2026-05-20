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
var activeFilter = "all";
var searchQuery = "";

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
   ★ JAVASCRIPT: LỘ TRÌNH HỌC TẬP (ĐÃ FIX XUNG ĐỘT CODE)
   ════════════════════════════════════════════════════════════ */

const centerX = 500; 

// 1. DỮ LIỆU CÁC LỘ TRÌNH
var ROADMAPS = [
  {
    id: 'frontend', title: 'Frontend Web', icon: '💻', color: '#4A9EE0',
    nodesData: [
        { id: '1', label: '1. Internet', x: centerX, y: 100, color: '#fde047', desc: '<strong>Kiến thức nền tảng về Internet:</strong><ul class="sidebar-list"><li>Mạng Internet hoạt động như thế nào?</li><li>HTTP và HTTPS khác nhau ra sao?</li><li>Cơ chế hoạt động của Trình duyệt</li><li>DNS (Hệ thống phân giải tên miền)</li><li>Hosting (Nơi lưu trữ) và Domain</li></ul>' },
        { id: '2', label: '2. HTML', x: centerX, y: 200, color: '#fca5a5', desc: '<strong>Ngôn ngữ cấu trúc trang web:</strong><ul class="sidebar-list"><li>Semantic HTML (Viết mã có ngữ nghĩa)</li><li>Làm việc với Forms và Validations</li><li>Accessibility (a11y)</li><li>SEO Basics</li></ul>' },
        { id: '3', label: '3. CSS', x: centerX, y: 300, color: '#93c5fd', desc: '<strong>Ngôn ngữ thiết kế giao diện:</strong><ul class="sidebar-list"><li>Box Model (Margin, Padding, Border)</li><li>Selectors, Specificity</li><li>Flexbox & CSS Grid</li><li>Responsive Design</li></ul>' },
        { id: '4', label: '4. JavaScript', x: centerX, y: 400, color: '#fcd34d', desc: '<strong>Ngôn ngữ lập trình cốt lõi:</strong><ul class="sidebar-list"><li>Cú pháp cơ bản (Biến, Hàm, Vòng lặp)</li><li>ES6+ (Arrow functions, Destructuring)</li><li>Bất đồng bộ: Callbacks, Promises, Async/Await</li></ul>' },
        { id: '5', label: '5. DOM & Events', x: centerX - 180, y: 500, color: '#fcd34d', desc: '<strong>Tương tác với giao diện (DOM):</strong><ul class="sidebar-list"><li>Truy vấn phần tử</li><li>Thêm, sửa, xóa DOM</li><li>Event Listeners (Lắng nghe sự kiện)</li></ul>' },
        { id: '6', label: '6. Fetch API', x: centerX + 180, y: 500, color: '#fcd34d', desc: '<strong>Giao tiếp với Server/Backend:</strong><ul class="sidebar-list"><li>Gửi HTTP Requests (GET, POST...)</li><li>Xử lý dữ liệu JSON</li><li>Hiểu về CORS</li></ul>' },
        { id: '7', label: '7. Frameworks', x: centerX, y: 700, color: '#6ee7b7', desc: '<strong>Công cụ xây dựng UI hiện đại:</strong><ul class="sidebar-list"><li><b>React (Lựa chọn phổ biến nhất)</b></li><li>Vue.js</li><li>Angular</li></ul>' },
        { id: '8', label: '8. React cơ bản', x: centerX - 180, y: 800, color: '#6ee7b7', desc: '<strong>Trọng tâm thư viện React:</strong><ul class="sidebar-list"><li>Cú pháp JSX & Components</li><li>Hooks: <code>useState</code>, <code>useEffect</code></li><li>Truyền dữ liệu bằng Props</li></ul>' },
        { id: '9', label: '9. State Management', x: centerX + 180, y: 800, color: '#6ee7b7', desc: '<strong>Quản lý trạng thái toàn cục:</strong><ul class="sidebar-list"><li>Redux Toolkit</li><li>Zustand (Trending)</li><li>React Context API</li></ul>' },
        { id: '10', label: '10. Git & GitHub', x: centerX - 180, y: 1000, color: '#d8b4fe', desc: '<strong>Quản lý mã nguồn:</strong><ul class="sidebar-list"><li>Các lệnh cơ bản: <code>git add, commit, push, pull</code></li><li>Quản lý nhánh (Branching)</li><li>Xử lý xung đột code</li></ul>' },
        { id: '11', label: '11. Build Tools', x: centerX + 180, y: 1000, color: '#d8b4fe', desc: '<strong>Công cụ đóng gói:</strong><ul class="sidebar-list"><li>Vite (Cực nhanh, khuyên dùng)</li><li>Webpack</li><li>NPM Scripts</li></ul>' },
        { id: '12', label: '12. Deployment', x: centerX, y: 1100, color: '#fdba74', desc: '<strong>Triển khai ứng dụng thực tế:</strong><ul class="sidebar-list"><li>Vercel</li><li>Netlify</li><li>GitHub Pages</li></ul>' }
    ],
    edgesData: [
        { source: '1', target: '2', animated: true }, { source: '2', target: '3', animated: true }, { source: '3', target: '4', animated: true },
        { source: '4', target: '5' }, { source: '4', target: '6' }, { source: '5', target: '7', animated: true }, { source: '6', target: '7', animated: true },
        { source: '7', target: '8' }, { source: '7', target: '9' }, { source: '8', target: '10', animated: true }, { source: '9', target: '11', animated: true },
        { source: '10', target: '12' }, { source: '11', target: '12' }
    ]
  },
  {
    id: 'backend', title: 'Backend', icon: '⚙️', color: '#E84545',
    nodesData: [
        { id: 'b1', label: '1. Kiến thức cơ bản', x: centerX, y: 100, color: '#fde047', desc: '<strong>Nền tảng backend:</strong><ul class="sidebar-list"><li>Hệ điều hành Linux/Unix</li><li>Terminal / shell basics</li><li>TCP/IP, HTTP/HTTPS, client-server</li></ul>' },
        { id: 'b2', label: '2. Ngôn ngữ Backend', x: centerX, y: 220, color: '#fca5a5', desc: '<strong>So sánh runtime:</strong><ul class="sidebar-list"><li>Node.js, Python, Java, C#</li><li>Frameworks phổ biến: Express, Django, Spring, ASP.NET</li><li>Package manager và môi trường phát triển</li></ul>' },
        { id: 'b3', label: '3. DB SQL', x: centerX - 180, y: 360, color: '#93c5fd', desc: '<strong>Database quan hệ:</strong><ul class="sidebar-list"><li>Thiết kế schema</li><li>Joins, indexing, transactions</li><li>PostgreSQL / MySQL, migration</li></ul>' },
        { id: 'b4', label: '4. DB NoSQL', x: centerX + 180, y: 360, color: '#93c5fd', desc: '<strong>NoSQL & caching:</strong><ul class="sidebar-list"><li>MongoDB document model</li><li>Redis caching/session</li><li>Quando chọn NoSQL vs SQL</li></ul>' },
        { id: 'b5', label: '5. Thiết kế API', x: centerX, y: 500, color: '#fcd34d', desc: '<strong>API chuyên nghiệp:</strong><ul class="sidebar-list"><li>RESTful conventions</li><li>GraphQL basics</li><li>Validation, error handling, versioning</li></ul>' },
        { id: 'b6', label: '6. Bảo mật & Auth', x: centerX, y: 640, color: '#6ee7b7', desc: '<strong>An toàn backend:</strong><ul class="sidebar-list"><li>JWT, OAuth2, session</li><li>Hash mật khẩu, encryption</li><li>Chống XSS, CSRF, SQL injection</li></ul>' },
        { id: 'b7', label: '7. Container & Docker', x: centerX - 180, y: 780, color: '#d8b4fe', desc: '<strong>Đóng gói ứng dụng:</strong><ul class="sidebar-list"><li>Dockerfile</li><li>Docker Compose</li><li>Một quy trình dev/prod</li></ul>' },
        { id: 'b8', label: '8. CI/CD', x: centerX + 180, y: 780, color: '#d8b4fe', desc: '<strong>Tự động hóa triển khai:</strong><ul class="sidebar-list"><li>Unit test / integration test</li><li>Linting và build</li><li>GitHub Actions / pipeline</li></ul>' },
        { id: 'b9', label: '9. Triển khai', x: centerX, y: 920, color: '#fdba74', desc: '<strong>Đưa lên production:</strong><ul class="sidebar-list"><li>AWS, DigitalOcean, Heroku</li><li>Nginx reverse proxy</li><li>SSL/TLS, monitoring, logging</li></ul>' }
    ],
    edgesData: [
        { source: 'b1', target: 'b2', animated: true }, { source: 'b2', target: 'b3' }, { source: 'b2', target: 'b4' },
        { source: 'b3', target: 'b5', animated: true }, { source: 'b4', target: 'b5', animated: true },
        { source: 'b5', target: 'b6', animated: true }, { source: 'b6', target: 'b7' }, { source: 'b6', target: 'b8' },
        { source: 'b7', target: 'b9', animated: true }, { source: 'b8', target: 'b9', animated: true }
    ]
  },
  {
    id: 'python', title: 'Python & AI', icon: '🐍', color: '#10B981',
    nodesData: [
        { id: 'p1', label: '1. Python Cơ Bản', x: centerX, y: 100, color: '#fde047', desc: '<strong>Nguyên tắc Python:</strong><ul class="sidebar-list"><li>Biến, kiểu dữ liệu, hàm</li><li>Vòng lặp, điều kiện</li><li>List, tuple, dict, set</li></ul>' },
        { id: 'p2', label: '2. Python Nâng Cao', x: centerX, y: 220, color: '#fca5a5', desc: '<strong>Lập trình Python chuyên sâu:</strong><ul class="sidebar-list"><li>Class, OOP, kế thừa</li><li>Decorators, generator</li><li>Module & package</li></ul>' },
        { id: 'p3', label: '3. Phân Tích Dữ Liệu', x: centerX, y: 340, color: '#93c5fd', desc: '<strong>Data science:</strong><ul class="sidebar-list"><li>NumPy arrays</li><li>Pandas DataFrame</li><li>Visualization với Matplotlib/Seaborn</li></ul>' },
        { id: 'p4', label: '4. Toán Học Cho AI', x: centerX, y: 460, color: '#fcd34d', desc: '<strong>Toán nền tảng:</strong><ul class="sidebar-list"><li>Đại số tuyến tính</li><li>Giải tích cơ bản</li><li>Xác suất & thống kê</li></ul>' },
        { id: 'p5', label: '5. Machine Learning', x: centerX, y: 600, color: '#6ee7b7', desc: '<strong>Học máy truyền thống:</strong><ul class="sidebar-list"><li>Regression, classification</li><li>Feature engineering</li><li>Scikit-Learn</li></ul>' },
        { id: 'p6', label: '6. Deep Learning', x: centerX, y: 740, color: '#6ee7b7', desc: '<strong>Deep learning:</strong><ul class="sidebar-list"><li>PyTorch / TensorFlow</li><li>CNN, RNN</li><li>Overfitting và regularization</li></ul>' },
        { id: 'p7', label: '7. Thị Giác Máy Tính', x: centerX - 180, y: 880, color: '#d8b4fe', desc: '<strong>Computer vision:</strong><ul class="sidebar-list"><li>OpenCV image processing</li><li>Object detection</li><li>CNN / YOLO</li></ul>' },
        { id: 'p8', label: '8. Xử Lý Ngôn Ngữ', x: centerX + 180, y: 880, color: '#d8b4fe', desc: '<strong>NLP cơ bản:</strong><ul class="sidebar-list"><li>Tokenization</li><li>Embedding, word vectors</li><li>Transformer, spaCy</li></ul>' },
        { id: 'p9', label: '9. Generative AI', x: centerX, y: 1020, color: '#fdba74', desc: '<strong>Generative AI:</strong><ul class="sidebar-list"><li>LLMs, Transformers</li><li>ChatGPT API</li><li>Prompt engineering, LangChain</li></ul>' }
    ],
    edgesData: [
        { source: 'p1', target: 'p2', animated: true }, { source: 'p2', target: 'p3', animated: true },
        { source: 'p3', target: 'p4', animated: true }, { source: 'p4', target: 'p5', animated: true },
        { source: 'p5', target: 'p6', animated: true }, { source: 'p6', target: 'p7' }, { source: 'p6', target: 'p8' },
        { source: 'p7', target: 'p9', animated: true }, { source: 'p8', target: 'p9', animated: true }
    ]
  },
  {
    id: 'cpp', title: 'C/C++ Systems', icon: '🖥️', color: '#8B5CF6',
    nodesData: [
        { id: 'c1', label: '1. Cốt Lõi Ngôn Ngữ C', x: centerX, y: 100, color: '#fde047', desc: '<strong>Cơ bản C:</strong><ul class="sidebar-list"><li>Kiểu dữ liệu, hàm, mảng</li><li>Con trỏ và truyền tham trị</li><li>Quy tắc biên dịch</li></ul>' },
        { id: 'c2', label: '2. Con Trỏ & Bộ Nhớ', x: centerX, y: 220, color: '#fca5a5', desc: '<strong>Quản lý bộ nhớ:</strong><ul class="sidebar-list"><li>malloc/free</li><li>Stack vs heap</li><li>Memory leak, buffer overflow</li></ul>' },
        { id: 'c3', label: '3. Cấu Trúc Dữ Liệu', x: centerX, y: 340, color: '#93c5fd', desc: '<strong>DSA C/C++:</strong><ul class="sidebar-list"><li>Struct, linked list</li><li>Stack, queue, tree</li><li>Độ phức tạp thuật toán</li></ul>' },
        { id: 'c4', label: '4. C++ OOP', x: centerX, y: 460, color: '#fcd34d', desc: '<strong>C++ OOP:</strong><ul class="sidebar-list"><li>Class / object</li><li>Kế thừa, đa hình</li><li>Encapsulation, template</li></ul>' },
        { id: 'c5', label: '5. Thư viện STL C++', x: centerX, y: 580, color: '#6ee7b7', desc: '<strong>STL essentials:</strong><ul class="sidebar-list"><li>Vector, map, set</li><li>Iterator</li><li>Algorithms</li></ul>' },
        { id: 'c6', label: '6. Modern C++', x: centerX, y: 700, color: '#6ee7b7', desc: '<strong>C++ hiện đại:</strong><ul class="sidebar-list"><li>Smart pointers</li><li>Lambda, auto</li><li>Move semantics</li></ul>' },
        { id: 'c7', label: '7. Lập Trình Hệ Thống', x: centerX, y: 820, color: '#d8b4fe', desc: '<strong>Systems programming:</strong><ul class="sidebar-list"><li>Đa luồng, mutex</li><li>Tiến trình và đồng bộ</li><li>Concurrency</li></ul>' },
        { id: 'c8', label: '8. Biên Dịch & Công Cụ', x: centerX, y: 940, color: '#d8b4fe', desc: '<strong>Build tools:</strong><ul class="sidebar-list"><li>Makefile, CMake</li><li>GDB debugging</li><li>Profiling</li></ul>' },
        { id: 'c9', label: '9. Nhúng / Socket', x: centerX, y: 1060, color: '#fdba74', desc: '<strong>Nhúng & mạng:</strong><ul class="sidebar-list"><li>Socket TCP/UDP</li><li>Vi điều khiển</li><li>Ứng dụng nhúng cơ bản</li></ul>' }
    ],
    edgesData: [
        { source: 'c1', target: 'c2', animated: true }, { source: 'c2', target: 'c3', animated: true },
        { source: 'c3', target: 'c4', animated: true }, { source: 'c4', target: 'c5', animated: true },
        { source: 'c5', target: 'c6', animated: true }, { source: 'c6', target: 'c7', animated: true },
        { source: 'c7', target: 'c8', animated: true }, { source: 'c8', target: 'c9', animated: true }
    ]
  }
];

var activeRoadmap = ROADMAPS[0].id;
var doneItems = {};

// 2. LOGIC ĐIỀU KHIỂN (Gắn chặt vào window để đè bẹp các hàm cũ bị xung đột)
window.currentEduRoadmap = 'frontend';

function renderEduRoadmapTabs() {
    var tabsContainer = document.getElementById("roadmap-tabs");
    if (!tabsContainer) return;
    tabsContainer.innerHTML = ROADMAPS.map(function(r) {
        var isActive = r.id === window.currentEduRoadmap ? 'active' : '';
        // Gắn sự kiện click trực tiếp vào hàm window.switchEduRoadmap
        return '<button class="filter-btn ' + isActive + '" onclick="window.switchEduRoadmap(\'' + r.id + '\')">' + r.icon + ' ' + r.title + '</button>';
    }).join("");
}

window.switchEduRoadmap = function(roadmapId) {
    window.currentEduRoadmap = roadmapId;
    renderEduRoadmapTabs();
    renderEduInteractiveRoadmap();
};

function renderEduInteractiveRoadmap() {
    var roadmap = ROADMAPS.find(r => r.id === window.currentEduRoadmap) || ROADMAPS[0];
    var container = document.getElementById('roadmap-container');
    var svgLayer = document.getElementById('edges-layer');
    if (!container || !svgLayer) return;

    // Xóa nội dung cũ
    svgLayer.innerHTML = '';
    container.querySelectorAll('.node').forEach(n => n.remove());

    // Cố định toạ độ khung nền
    svgLayer.setAttribute('width', '1000');
    svgLayer.setAttribute('height', '1200');
    svgLayer.setAttribute('viewBox', '0 0 1000 1200');

    // Vẽ tia
    roadmap.edgesData.forEach(edge => {
        var sourceNode = roadmap.nodesData.find(n => n.id === edge.source);
        var targetNode = roadmap.nodesData.find(n => n.id === edge.target);
        if(!sourceNode || !targetNode) return;

        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        
        var strokeColor = document.body.classList.contains('dark') ? '#4B5563' : '#9CA3AF';
        line.setAttribute('stroke', strokeColor); 
        line.setAttribute('stroke-width', '4');

        if (edge.animated) {
            line.classList.add('animated-line');
        }
        svgLayer.appendChild(line);
    });

    // Vẽ khối hộp
    roadmap.nodesData.forEach(node => {
        var div = document.createElement('div');
        div.className = 'node';
        div.innerHTML = node.label;
        div.style.left = node.x + 'px';
        div.style.top = node.y + 'px';
        if (node.color) div.style.backgroundColor = node.color;
        
        // Gắn hàm mở Sidebar
        div.addEventListener('click', function(e) {
            e.stopPropagation();
            window.openSidebarDetail(node);
        });
        container.appendChild(div);
    });
}

// Bắt buộc khai báo window để file HTML có thể gọi được
window.openSidebarDetail = function(node) {
    document.getElementById('sidebar-title').innerText = node.label.replace(/^[0-9a-z]+\.\s/i, ''); 
    document.getElementById('sidebar-content').innerHTML = node.desc;
    document.getElementById('sidebar-detail').classList.add('open');
};

window.closeSidebar = function() {
    document.getElementById('sidebar-detail').classList.remove('open');
};

// Gọi chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("roadmap-tabs")) {
        renderEduRoadmapTabs();
        renderEduInteractiveRoadmap();
    }

    document.addEventListener('click', function(e) {
        var sidebar = document.getElementById('sidebar-detail');
        if (!sidebar || !sidebar.classList.contains('open')) return;
        if (!sidebar.contains(e.target)) {
            closeSidebar();
        }
    });
});

/* ── Handle 401 (chưa đăng nhập) ── */
function handleFetch(r) {
  if (r.status === 401) {
    window.location = "/login";
    return null;
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

  // Chỉ hiện search bar ở trang Khóa học
  var sw = document.getElementById("search-wrap");
  if (sw) sw.style.visibility = page === "courses" ? "visible" : "hidden";
}

/* ── Course rendering ── */
function renderCourses() {
  var grid = document.getElementById("courses-grid");
  var empty = document.getElementById("empty-state");
  var q = searchQuery.toLowerCase();

  var filtered = courses.filter(function (c) {
    var matchSearch =
      c.title.toLowerCase().indexOf(q) >= 0 ||
      c.description.toLowerCase().indexOf(q) >= 0;
    var matchFilter =
      activeFilter === "all" ||
      (activeFilter === "enrolled" && c.enrolled) ||
      (activeFilter === "not-enrolled" && !c.enrolled);
    return matchSearch && matchFilter;
  });

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = filtered
    .map(function (c) {
      return [
        '<div class="course-card" onmouseenter="hoverCard(this,\'' +
          c.color +
          '\')" onmouseleave="unhoverCard(this)">',
        '<div class="card-img-wrap">',
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
          if (c.enrolled) {
            var goUrl = COURSE_URLS[c.id] || "#";
            return (
              '<div style="display:flex;align-items:center;gap:6px">' +
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
            '<button class="cta-btn"' +
            " onclick=\"toggleEnroll('" +
            c.id +
            "',false)\"" +
            " onmouseenter=\"ctaHover(this,'" +
            c.color +
            "','" +
            c.accentColor +
            "')\"" +
            ' onmouseleave="ctaLeave(this)">Đăng ký →</button>'
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
  renderCourses();
}

function setFilter(btn, filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");
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
  return fetch(API + "/courses")
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
  if (document.getElementById('roadmap-content')) {
    loadRoadmap();
  }
}

/* ── Roadmap ── */
function loadRoadmap() {
  fetch(API + "/roadmap")
    .then(handleFetch)
    .then(function (data) {
      if (!data) return;
      doneItems = {};
      data.doneItems.forEach(function (id) {
        doneItems[id] = true;
      });
      renderRoadmapTabs();
      renderRoadmap();
    });
}

function renderRoadmapTabs() {
  var tabs = document.getElementById("roadmap-tabs");
  if (!tabs) return;
  tabs.innerHTML = ROADMAPS.map(function (r) {
    var active = r.id === activeRoadmap ? " active" : "";
    return (
      '<button class="filter-btn' +
      active +
      '" onclick="switchRoadmap(\'' +
      r.id +
      "')\">" +
      r.icon +
      " " +
      r.title +
      "</button>"
    );
  }).join("");
}

function switchRoadmap(id) {
  activeRoadmap = id;
  renderRoadmapTabs();
  renderRoadmap();
}

function renderRoadmap() {
  var container = document.getElementById("roadmap-content");
  if (!container) return;
  var rm = ROADMAPS.find(function (r) {
    return r.id === activeRoadmap;
  });
  if (!rm) return;

  var totalItems = rm.phases.reduce(function (s, p) {
    return s + p.items.length;
  }, 0);
  var doneCount = rm.phases.reduce(function (s, p) {
    return (
      s +
      p.items.filter(function (item) {
        return doneItems[rm.id + ":" + item];
      }).length
    );
  }, 0);
  var pct = totalItems ? Math.round((doneCount / totalItems) * 100) : 0;

  var html =
    '<div style="margin-bottom:20px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<span style="font-size:14px;color:#6B7280">Tiến độ tổng thể</span>' +
    '<span style="font-weight:700;color:' +
    rm.color +
    '">' +
    pct +
    "%</span>" +
    "</div>" +
    '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:' +
    pct +
    "%;background:linear-gradient(90deg," +
    rm.color +
    ',#888);transition:width 0.4s"></div></div>' +
    "</div>";

  html += '<div class="roadmap-grid">';
  rm.phases.forEach(function (phase, pi) {
    var phDone = phase.items.filter(function (item) {
      return doneItems[rm.id + ":" + item];
    }).length;
    html +=
      '<div class="roadmap-phase">' +
      '<div class="roadmap-phase-header" style="border-left:3px solid ' +
      rm.color +
      '">' +
      "<div>" +
      '<div class="roadmap-phase-title">Giai đoạn ' +
      (pi + 1) +
      ": " +
      phase.name +
      "</div>" +
      '<div class="roadmap-phase-sub">' +
      phDone +
      "/" +
      phase.items.length +
      " hoàn thành</div>" +
      "</div>" +
      '<div class="roadmap-phase-pct" style="color:' +
      rm.color +
      '">' +
      Math.round((phDone / phase.items.length) * 100) +
      "%</div>" +
      "</div>";

    phase.items.forEach(function (item) {
      var itemId = rm.id + ":" + item;
      var done = !!doneItems[itemId];
      html +=
        '<div class="roadmap-item' +
        (done ? " done" : "") +
        '" onclick="toggleRoadmapItem(\'' +
        itemId +
        "')\">" +
        '<div class="roadmap-check" style="' +
        (done ? "background:" + rm.color + ";border-color:" + rm.color : "") +
        '">' +
        (done ? "✓" : "") +
        "</div>" +
        "<span>" +
        item +
        "</span>" +
        "</div>";
    });

    html += "</div>";
  });
  html += "</div>";

  container.innerHTML = html;
}

function toggleRoadmapItem(itemId) {
  doneItems[itemId] = !doneItems[itemId];
  renderRoadmap();
  fetch(API + "/roadmap/" + encodeURIComponent(itemId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: doneItems[itemId] }),
  })
    .then(handleFetch)
    .catch(function (e) {
      console.error(e);
    });
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
  loadAll();
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
