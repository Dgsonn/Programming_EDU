import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { MyCourses } from "./components/MyCourses";
import { Settings } from "./components/Settings";
import { Roadmap } from "./components/Roadmap";
import { api, setToken, removeToken, getToken, type UserProfile } from "../lib/api";

// ─── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({ onSuccess }: { onSuccess: (user: UserProfile) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = isRegister
        ? await api.register(name, email, password)
        : await api.login(email, password);
      setToken(res.token);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="bg-white rounded-2xl p-8 w-full shadow-xl border border-gray-100"
        style={{ maxWidth: "400px", boxShadow: "0 20px 60px rgba(74,158,224,0.12)" }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ color: "#1A6BB5", fontWeight: 800, fontSize: "18px" }}>Program</span>
            <span style={{ color: "#D93030", fontWeight: 800, fontSize: "18px" }}>ming</span>
          </div>
          <div>
            <span style={{ color: "#1A6BB5", fontWeight: 900, fontSize: "22px", letterSpacing: "0.08em" }}>ED</span>
            <span style={{ color: "#D93030", fontWeight: 900, fontSize: "22px", letterSpacing: "0.08em" }}>U</span>
          </div>
          <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập để tiếp tục"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block mb-1 text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-blue-300 focus:bg-white transition-all"
                style={{ fontSize: "13px" }}
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-blue-300 focus:bg-white transition-all"
              style={{ fontSize: "13px" }}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-blue-300 focus:bg-white transition-all"
              style={{ fontSize: "13px" }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-center" style={{ fontSize: "12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #4A9EE0, #E84545)",
              fontSize: "14px",
              boxShadow: "0 4px 15px rgba(74,158,224,0.35)",
            }}
          >
            {loading ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4" style={{ fontSize: "12px" }}>
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button
            onClick={() => { setIsRegister((v) => !v); setError(""); }}
            className="font-semibold"
            style={{ color: "#4A9EE0" }}
          >
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </button>
        </p>

        {!isRegister && (
          <p className="text-center text-gray-300 mt-2" style={{ fontSize: "11px" }}>
            Demo: caovannhan@email.com / 123456
          </p>
        )}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Kiểm tra token khi load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api.me()
      .then((profile) => setUser(profile))
      .catch(() => removeToken())
      .finally(() => setAuthLoading(false));
  }, []);

  function handleLogout() {
    removeToken();
    setUser(null);
    setActivePage("dashboard");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400" style={{ fontSize: "14px" }}>Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginModal onSuccess={setUser} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard view="dashboard" user={user} />;
      case "courses":
        return <Dashboard view="courses" user={user} />;
      case "my-courses":
        return <MyCourses />;
      case "roadmap":
        return <Roadmap />;
      case "settings":
        return <Settings user={user} onProfileUpdate={setUser} />;
      default:
        return <Dashboard view="dashboard" user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} user={user} />
      {renderPage()}
    </div>
  );
}
