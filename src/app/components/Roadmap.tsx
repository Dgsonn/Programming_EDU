import { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Map } from "lucide-react";
import { api, type RoadmapProgress } from "../../lib/api";

type ItemStatus = "completed" | "in-progress" | "not-started";

interface RoadmapItem {
  id: string;
  title: string;
  desc: string;
  status: ItemStatus;
  topics: string[];
}

interface RoadmapPhase {
  id: string;
  title: string;
  items: RoadmapItem[];
}

interface RoadmapDef {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  accentColor: string;
  emoji: string;
  phases: RoadmapPhase[];
}

const roadmapDefs: Omit<RoadmapDef, never>[] = [
  {
    id: "frontend",
    title: "Frontend",
    subtitle: "Phát triển giao diện web",
    color: "#4A9EE0",
    accentColor: "#2D7FC1",
    emoji: "🌐",
    phases: [
      {
        id: "foundation",
        title: "Giai đoạn 1 — Nền tảng",
        items: [
          { id: "html",     title: "HTML",               desc: "Ngôn ngữ đánh dấu cấu trúc trang web",  status: "not-started", topics: ["Semantic HTML", "Forms & Input", "Tables", "Meta tags", "Accessibility"] },
          { id: "css",      title: "CSS",                desc: "Tạo kiểu và bố cục cho trang web",       status: "not-started", topics: ["Box Model", "Flexbox", "Grid", "Animations", "Responsive Design"] },
          { id: "js-basics",title: "JavaScript Cơ bản", desc: "Ngôn ngữ lập trình cho web",             status: "not-started", topics: ["Variables & Types", "Functions", "DOM Manipulation", "Events", "ES6+"] },
        ],
      },
      {
        id: "tooling",
        title: "Giai đoạn 2 — Công cụ",
        items: [
          { id: "git",             title: "Git & GitHub",     desc: "Quản lý phiên bản source code",        status: "not-started", topics: ["Init & Clone", "Commit & Push", "Branching", "Pull Requests", "Merge Conflicts"] },
          { id: "package-managers",title: "Package Managers", desc: "Quản lý thư viện và dependencies",     status: "not-started", topics: ["npm", "yarn", "pnpm", "package.json", "node_modules"] },
          { id: "build-tools",     title: "Build Tools",      desc: "Đóng gói và tối ưu ứng dụng",         status: "not-started", topics: ["Vite", "Webpack", "Bundling", "Tree Shaking", "HMR"] },
        ],
      },
      {
        id: "framework",
        title: "Giai đoạn 3 — Framework",
        items: [
          { id: "react",      title: "React",        desc: "Thư viện xây dựng UI component",         status: "not-started", topics: ["Components", "Props & State", "Hooks", "Context API", "React Router"] },
          { id: "typescript", title: "TypeScript",   desc: "JavaScript với kiểu dữ liệu tĩnh",       status: "not-started", topics: ["Types & Interfaces", "Generics", "Enums", "Type Guards", "Utility Types"] },
          { id: "tailwind",   title: "Tailwind CSS", desc: "Framework CSS utility-first",             status: "not-started", topics: ["Utility Classes", "Responsive", "Dark Mode", "Custom Config", "Plugins"] },
        ],
      },
      {
        id: "advanced",
        title: "Giai đoạn 4 — Nâng cao",
        items: [
          { id: "nextjs",       title: "Next.js",     desc: "React framework cho production",         status: "not-started", topics: ["SSR & SSG", "App Router", "API Routes", "Image Optimization", "Deployment"] },
          { id: "testing",      title: "Testing",     desc: "Kiểm thử đảm bảo chất lượng",           status: "not-started", topics: ["Unit Tests", "Vitest", "React Testing Library", "E2E Playwright", "Coverage"] },
          { id: "performance",  title: "Performance", desc: "Tối ưu hiệu năng ứng dụng web",         status: "not-started", topics: ["Lighthouse", "Lazy Loading", "Code Splitting", "Caching", "Core Web Vitals"] },
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    subtitle: "Phát triển server & API",
    color: "#E84545",
    accentColor: "#C83232",
    emoji: "⚙️",
    phases: [
      {
        id: "foundation",
        title: "Giai đoạn 1 — Nền tảng",
        items: [
          { id: "python-basics", title: "Python / Java",      desc: "Ngôn ngữ lập trình backend phổ biến", status: "not-started", topics: ["Syntax cơ bản", "OOP", "Modules", "Error Handling", "File I/O"] },
          { id: "linux",         title: "Linux & Terminal",   desc: "Hệ điều hành server phổ biến nhất",   status: "not-started", topics: ["Commands cơ bản", "File permissions", "Shell scripting", "Process management", "SSH"] },
          { id: "networking",    title: "Mạng máy tính",      desc: "Nền tảng giao tiếp web",              status: "not-started", topics: ["HTTP/HTTPS", "TCP/IP", "DNS", "REST vs GraphQL", "WebSocket"] },
        ],
      },
      {
        id: "database",
        title: "Giai đoạn 2 — Cơ sở dữ liệu",
        items: [
          { id: "sql",        title: "SQL",            desc: "Ngôn ngữ truy vấn cơ sở dữ liệu",      status: "not-started", topics: ["SELECT/INSERT/UPDATE", "JOINs", "Indexes", "Transactions", "Stored Procedures"] },
          { id: "postgresql", title: "PostgreSQL",     desc: "Hệ quản trị CSDL quan hệ mạnh mẽ",     status: "not-started", topics: ["Setup", "CRUD", "Relationships", "Query Optimization", "Backup"] },
          { id: "nosql",      title: "NoSQL — MongoDB",desc: "Cơ sở dữ liệu phi quan hệ",            status: "not-started", topics: ["Documents & Collections", "CRUD", "Aggregation", "Indexing", "Atlas"] },
        ],
      },
      {
        id: "api",
        title: "Giai đoạn 3 — API & Deploy",
        items: [
          { id: "rest-api", title: "REST API",  desc: "Thiết kế và xây dựng API chuẩn",          status: "not-started", topics: ["HTTP Methods", "Status Codes", "JWT Auth", "Rate Limiting", "Versioning"] },
          { id: "docker",   title: "Docker",    desc: "Container hóa ứng dụng",                  status: "not-started", topics: ["Images & Containers", "Dockerfile", "Docker Compose", "Volumes", "Networking"] },
          { id: "cicd",     title: "CI/CD",     desc: "Tự động hóa triển khai",                  status: "not-started", topics: ["GitHub Actions", "Automated Testing", "Build Pipeline", "Deploy to Cloud", "Monitoring"] },
        ],
      },
    ],
  },
  {
    id: "cpp",
    title: "C / C++",
    subtitle: "Lập trình hệ thống & nhúng",
    color: "#4A9EE0",
    accentColor: "#E84545",
    emoji: "⚡",
    phases: [
      {
        id: "c-basics",
        title: "Giai đoạn 1 — C Cơ bản",
        items: [
          { id: "syntax",        title: "Cú pháp C",         desc: "Nền tảng ngôn ngữ C",                status: "not-started", topics: ["Biến & Kiểu dữ liệu", "Câu lệnh điều kiện", "Vòng lặp", "Hàm", "I/O cơ bản"] },
          { id: "memory",        title: "Quản lý bộ nhớ",    desc: "Stack, heap và con trỏ",             status: "not-started", topics: ["Con trỏ", "malloc/free", "Stack vs Heap", "Memory leaks", "Valgrind"] },
          { id: "arrays-strings",title: "Mảng & Chuỗi",      desc: "Cấu trúc dữ liệu cơ bản trong C",   status: "not-started", topics: ["Array 1D/2D", "Con trỏ và mảng", "strlen/strcpy", "Buffer overflow", "String parsing"] },
        ],
      },
      {
        id: "cpp-oop",
        title: "Giai đoạn 2 — C++ & OOP",
        items: [
          { id: "oop",     title: "Lập trình OOP",       desc: "Hướng đối tượng trong C++",         status: "not-started", topics: ["Class & Object", "Kế thừa", "Đa hình", "Encapsulation", "Abstraction"] },
          { id: "stl",     title: "STL",                 desc: "Standard Template Library",          status: "not-started", topics: ["vector, list, map", "Iterators", "Algorithms", "Templates", "Smart Pointers"] },
          { id: "file-io", title: "File I/O & Exception",desc: "Xử lý file và ngoại lệ",            status: "not-started", topics: ["fstream", "try/catch", "Custom exceptions", "RAII", "Serialization"] },
        ],
      },
      {
        id: "advanced-cpp",
        title: "Giai đoạn 3 — Nâng cao",
        items: [
          { id: "data-structures",title: "Cấu trúc dữ liệu",     desc: "Triển khai thủ công các CTDL",   status: "not-started", topics: ["Linked List", "Stack & Queue", "Tree & BST", "Hash Table", "Graph"] },
          { id: "algorithms",     title: "Thuật toán",            desc: "Phân tích và tối ưu thuật toán", status: "not-started", topics: ["Sorting", "Binary Search", "Dynamic Programming", "Greedy", "Big-O"] },
          { id: "systems",        title: "Lập trình hệ thống",    desc: "Tương tác với OS",               status: "not-started", topics: ["Process & Thread", "Mutex & Semaphore", "Socket Programming", "Makefile", "Embedded C"] },
        ],
      },
    ],
  },
  {
    id: "python",
    title: "Python",
    subtitle: "AI, Data Science & Automation",
    color: "#F59E0B",
    accentColor: "#D97706",
    emoji: "🐍",
    phases: [
      {
        id: "basics",
        title: "Giai đoạn 1 — Python Cơ bản",
        items: [
          { id: "python-syntax", title: "Cú pháp Python",    desc: "Nền tảng ngôn ngữ Python",           status: "not-started", topics: ["Variables & Types", "List, Dict, Set", "Functions", "Modules", "File I/O"] },
          { id: "python-oop",    title: "OOP trong Python",  desc: "Lập trình hướng đối tượng",          status: "not-started", topics: ["Class & Object", "Inheritance", "Magic Methods", "Decorators", "Context Managers"] },
          { id: "env",           title: "Môi trường & Công cụ",desc: "Setup môi trường phát triển",      status: "not-started", topics: ["pip & venv", "Jupyter Notebook", "VS Code", "Black & Flake8", "Type Hints"] },
        ],
      },
      {
        id: "data",
        title: "Giai đoạn 2 — Data Science",
        items: [
          { id: "numpy",         title: "NumPy & Pandas",    desc: "Xử lý và phân tích dữ liệu",        status: "not-started", topics: ["NumPy arrays", "DataFrame", "Data Cleaning", "GroupBy", "Merge & Join"] },
          { id: "visualization", title: "Trực quan hoá",     desc: "Vẽ biểu đồ và phân tích",           status: "not-started", topics: ["Matplotlib", "Seaborn", "Plotly", "Dashboard", "Statistical Plots"] },
          { id: "ml-basics",     title: "Machine Learning",  desc: "Thuật toán học máy nền tảng",        status: "not-started", topics: ["Scikit-learn", "Regression", "Classification", "Clustering", "Model Evaluation"] },
        ],
      },
      {
        id: "ai",
        title: "Giai đoạn 3 — AI & Automation",
        items: [
          { id: "deep-learning", title: "Deep Learning",   desc: "Mạng nơ-ron nhân tạo",               status: "not-started", topics: ["TensorFlow / PyTorch", "Neural Networks", "CNN", "RNN/LSTM", "Transfer Learning"] },
          { id: "web-scraping",  title: "Web Scraping",    desc: "Thu thập dữ liệu tự động",           status: "not-started", topics: ["Requests", "BeautifulSoup", "Selenium", "Scrapy", "Data Storage"] },
          { id: "automation",    title: "Automation",      desc: "Tự động hoá tác vụ với Python",      status: "not-started", topics: ["os & shutil", "Schedule", "Email automation", "openpyxl", "Telegram Bot"] },
        ],
      },
    ],
  },
];

const statusConfig: Record<ItemStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  "completed":    { label: "Hoàn thành", color: "#10B981", bg: "#EEFBF5", icon: CheckCircle },
  "in-progress":  { label: "Đang học",   color: "#4A9EE0", bg: "#EEF6FD", icon: Clock },
  "not-started":  { label: "Chưa học",   color: "#9CA3AF", bg: "#F9FAFB", icon: Circle },
};

function RoadmapItemCard({
  item,
  color,
  onStatusChange,
}: {
  item: RoadmapItem;
  color: string;
  onStatusChange: (status: ItemStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;

  const nextStatus: Record<ItemStatus, ItemStatus> = {
    "not-started": "in-progress",
    "in-progress":  "completed",
    "completed":    "not-started",
  };

  return (
    <div
      className="bg-white rounded-xl border transition-all duration-200"
      style={{
        borderColor: item.status === "not-started" ? "#F3F4F6" : `${cfg.color}30`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        opacity: item.status === "not-started" ? 0.75 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Click icon để đổi status */}
            <button
              onClick={() => onStatusChange(nextStatus[item.status])}
              title="Click để đổi trạng thái"
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
              style={{ background: cfg.bg }}
            >
              <Icon size={16} style={{ color: cfg.color }} />
            </button>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#1F2937" }}>{item.title}</p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{item.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: "10px", fontWeight: 600, color: cfg.color, background: cfg.bg }}
            >
              {cfg.label}
            </span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "#F3F4F6" }}
            >
              {expanded ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="flex flex-wrap gap-1.5">
              {item.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 rounded-lg"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    background: item.status === "completed" ? `${color}10` : "#F3F4F6",
                    color: item.status === "completed" ? color : "#6B7280",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Merge API progress vào roadmap definitions
function applyProgress(defs: typeof roadmapDefs, progress: RoadmapProgress): typeof roadmapDefs {
  return defs.map((roadmap) => ({
    ...roadmap,
    phases: roadmap.phases.map((phase) => ({
      ...phase,
      items: phase.items.map((item) => ({
        ...item,
        status: (progress[`${roadmap.id}:${item.id}`] ?? "not-started") as ItemStatus,
      })),
    })),
  }));
}

export function Roadmap() {
  const [selectedId, setSelectedId] = useState("frontend");
  const [progress, setProgress] = useState<RoadmapProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoadmapProgress()
      .then(setProgress)
      .catch((err) => console.error("Lỗi tải lộ trình:", err))
      .finally(() => setLoading(false));
  }, []);

  const roadmaps = applyProgress(roadmapDefs, progress);
  const roadmap = roadmaps.find((r) => r.id === selectedId)!;

  const allItems = roadmap.phases.flatMap((p) => p.items);
  const completedCount = allItems.filter((i) => i.status === "completed").length;
  const inProgressCount = allItems.filter((i) => i.status === "in-progress").length;
  const progressPct = Math.round((completedCount / allItems.length) * 100);

  async function handleStatusChange(roadmapId: string, itemId: string, status: ItemStatus) {
    const key = `${roadmapId}:${itemId}`;
    setProgress((prev) => ({ ...prev, [key]: status }));
    try {
      await api.updateRoadmapItem(roadmapId, itemId, status);
    } catch (err) {
      // Rollback nếu lỗi
      console.error("Lỗi cập nhật lộ trình:", err);
      setProgress((prev) => ({ ...prev, [key]: progress[key] ?? "not-started" }));
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Map size={16} style={{ color: "#4A9EE0" }} />
          <h1 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>Lộ trình học tập</h1>
        </div>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>
          Click vào icon để cập nhật trạng thái từng chủ đề
        </p>
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="p-6">
          {/* Roadmap selector */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {roadmaps.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className="rounded-2xl p-4 text-left transition-all duration-200 border"
                style={{
                  background: selectedId === r.id ? `linear-gradient(135deg, ${r.color}15, ${r.accentColor}08)` : "white",
                  borderColor: selectedId === r.id ? `${r.color}40` : "#F3F4F6",
                  boxShadow: selectedId === r.id ? `0 4px 16px ${r.color}20` : "0 2px 8px rgba(0,0,0,0.04)",
                  transform: selectedId === r.id ? "translateY(-2px)" : "none",
                }}
              >
                <div className="text-2xl mb-2">{r.emoji}</div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: selectedId === r.id ? r.color : "#1F2937" }}>
                  {r.title}
                </p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{r.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Progress banner */}
          <div
            className="rounded-2xl p-5 mb-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${roadmap.color} 0%, ${roadmap.accentColor} 100%)` }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white opacity-80" style={{ fontSize: "13px" }}>Lộ trình {roadmap.title}</p>
                <h2 className="text-white mt-1" style={{ fontSize: "20px", fontWeight: 700 }}>
                  {completedCount}/{allItems.length} chủ đề hoàn thành
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-white opacity-75" style={{ fontSize: "12px" }}>✅ {completedCount} hoàn thành</span>
                  <span className="text-white opacity-75" style={{ fontSize: "12px" }}>📖 {inProgressCount} đang học</span>
                  <span className="text-white opacity-75" style={{ fontSize: "12px" }}>⭕ {allItems.length - completedCount - inProgressCount} chưa bắt đầu</span>
                </div>
              </div>
              <div className="text-white opacity-20 select-none" style={{ fontSize: "64px", lineHeight: 1 }}>
                {roadmap.emoji}
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "rgba(255,255,255,0.85)" }} />
              </div>
              <p className="text-white opacity-70 mt-1.5" style={{ fontSize: "11px" }}>{progressPct}% hoàn thành</p>
            </div>
          </div>

          {/* Phases */}
          <div className="relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5"
              style={{ background: `linear-gradient(to bottom, ${roadmap.color}60, ${roadmap.color}10)` }} />

            <div className="space-y-8">
              {roadmap.phases.map((phase, phaseIdx) => {
                const phaseCompleted = phase.items.filter((i) => i.status === "completed").length;
                const allDone = phaseCompleted === phase.items.length;
                const anyStarted = phase.items.some((i) => i.status !== "not-started");

                return (
                  <div key={phase.id} className="relative pl-12">
                    <div
                      className="absolute left-0 top-3 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                      style={{
                        background: allDone ? roadmap.color : anyStarted
                          ? `linear-gradient(135deg, ${roadmap.color}, ${roadmap.accentColor})`
                          : "#E5E7EB",
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: 700, color: anyStarted ? "white" : "#9CA3AF" }}>
                        {phaseIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1F2937" }}>{phase.title}</h3>
                        <p className="text-gray-400" style={{ fontSize: "12px" }}>{phaseCompleted}/{phase.items.length} hoàn thành</p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full"
                        style={{
                          background: allDone ? "#EEFBF5" : anyStarted ? "#EEF6FD" : "#F3F4F6",
                          fontSize: "12px", fontWeight: 600,
                          color: allDone ? "#10B981" : anyStarted ? roadmap.color : "#9CA3AF",
                        }}
                      >
                        {allDone ? "✅ Hoàn thành" : anyStarted ? "📖 Đang học" : "Chưa bắt đầu"}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {phase.items.map((item) => (
                        <RoadmapItemCard
                          key={item.id}
                          item={item}
                          color={roadmap.color}
                          onStatusChange={(status) => handleStatusChange(roadmap.id, item.id, status)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
