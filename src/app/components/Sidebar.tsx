import { useState } from "react";
import {
  BookOpen,
  BookMarked,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Map,
} from "lucide-react";
import type { UserProfile } from "../../lib/api";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  user: UserProfile;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Khóa học", icon: BookOpen },
  { id: "my-courses", label: "Khóa học của tôi", icon: BookMarked },
  { id: "roadmap", label: "Lộ trình", icon: Map },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar({ activePage, onNavigate, onLogout, user }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  function handleLogout() {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
      onLogout();
    }
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm overflow-y-auto flex-shrink-0">
      {/* Logo & Avatar Section */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-blue-100">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.avatar_seed}&backgroundColor=b6e3f4`}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>

          {/* Logo */}
          <div>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{
                color: "#1A6BB5",
                fontWeight: 800,
                fontSize: "13px",
                textShadow: "0 1px 4px rgba(26,107,181,0.35)",
              }}>Program</span>
              <span style={{
                color: "#D93030",
                fontWeight: 800,
                fontSize: "13px",
                textShadow: "0 1px 4px rgba(217,48,48,0.35)",
              }}>ming</span>
            </div>
            <div>
              <span style={{
                color: "#1A6BB5",
                fontWeight: 900,
                fontSize: "15px",
                letterSpacing: "0.08em",
                textShadow: "0 1px 6px rgba(26,107,181,0.4)",
              }}>ED</span>
              <span style={{
                color: "#D93030",
                fontWeight: 900,
                fontSize: "15px",
                letterSpacing: "0.08em",
                textShadow: "0 1px 6px rgba(217,48,48,0.4)",
              }}>U</span>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="mt-4 px-1">
          <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
            {user.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Học viên</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #4A9EE015, #E8454510)"
                  : isHovered
                  ? "#F5F8FF"
                  : "transparent",
                color: isActive || isHovered ? "#4A9EE0" : "#6B7280",
                transform: isHovered && !isActive ? "translateX(4px)" : "translateX(0)",
                boxShadow: isActive ? "0 2px 8px rgba(74,158,224,0.15)" : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #4A9EE030, #E8454520)"
                      : isHovered
                      ? "#EEF4FF"
                      : "#F9FAFB",
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      color: isActive || isHovered ? "#4A9EE0" : "#9CA3AF",
                      transition: "color 0.2s",
                    }}
                  />
                </div>
                <span
                  className="text-sm transition-all duration-200"
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  {item.label}
                </span>
              </div>
              {isActive && (
                <ChevronRight size={14} style={{ color: "#4A9EE0" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-gray-100 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-400 hover:text-[#E84545] hover:bg-[#FFF1F1]"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-red-50 transition-colors duration-200">
            <LogOut size={16} />
          </div>
          <span className="text-sm" style={{ fontWeight: 500 }}>
            Đăng xuất
          </span>
        </button>
      </div>
    </aside>
  );
}