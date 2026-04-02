import { useState, useEffect } from "react";
import { CourseCard } from "./CourseCard";
import {
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Search,
  Bell,
  ChevronDown,
  Flame,
} from "lucide-react";
import {
  api,
  type UserProfile,
  type Course as ApiCourse,
  type EnrolledCourse,
  type UserStats,
} from "../../lib/api";

function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Chuyển ApiCourse → CourseCard-compatible format
function toCourseCardFormat(c: ApiCourse) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    image: c.image,
    level: c.level,
    duration: c.duration,
    students: c.students,
    rating: c.rating,
    lessons: c.lessons,
    color: c.color,
    accentColor: c.accent_color,
    tag: c.tag,
    enrolled: c.enrolled,
    progress: c.progress,
  };
}

interface DashboardProps {
  view?: "dashboard" | "courses";
  user: UserProfile;
}

export function Dashboard({ view = "dashboard", user }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("Tất cả");

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isCourses = view === "courses";

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, statsData, progressData] = await Promise.all([
          api.getCourses(),
          api.getStats(),
          api.getProgress(),
        ]);
        setCourses(coursesData);
        setStats(statsData);
        setEnrolledCourses(progressData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const searchFiltered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayCourses = searchFiltered.filter((c) => {
    if (filterLevel === "Đã đăng ký") return c.enrolled;
    if (filterLevel === "Chưa đăng ký") return !c.enrolled;
    return true;
  });

  const statCards = [
    {
      label: "Khóa học đang học",
      value: String(stats?.courses_enrolled ?? "—"),
      icon: BookOpen,
      color: "#4A9EE0",
      bg: "#EEF6FD",
    },
    {
      label: "Giờ học hôm nay",
      value: stats ? `${stats.hours_today}h` : "—",
      icon: Clock,
      color: "#E84545",
      bg: "#FDEEEE",
    },
    {
      label: "Chuỗi ngày học",
      value: stats ? `${stats.streak_days} ngày` : "—",
      icon: Flame,
      color: "#F59E0B",
      bg: "#FEF9EE",
    },
    {
      label: "Chứng chỉ",
      value: String(stats?.certificates_count ?? "—"),
      icon: Award,
      color: "#10B981",
      bg: "#EEFBF5",
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>
            {isCourses ? "Khóa học" : "Dashboard"}
          </h1>
          <p className="text-gray-400" style={{ fontSize: "12px" }}>
            {isCourses
              ? `${courses.length} khóa học hiện có`
              : formatDate(new Date())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 outline-none transition-all duration-200 focus:border-blue-300 focus:bg-white focus:shadow-sm"
              style={{ fontSize: "13px", width: "220px" }}
            />
          </div>

          <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">
            <Bell size={16} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#E84545" }} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all duration-200">
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.avatar_seed}&backgroundColor=b6e3f4`}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
            <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>
              {user.name}
            </span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="p-6">
          {/* Welcome banner */}
          {!isCourses && (
            <div
              className="rounded-2xl p-5 mb-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4A9EE0 0%, #2D7FC1 60%, #1A56A0 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-white opacity-80" style={{ fontSize: "13px" }}>
                    Chào mừng trở lại! 👋
                  </p>
                  <h2 className="text-white mt-1" style={{ fontSize: "22px", fontWeight: 700 }}>
                    {user.name}
                  </h2>
                  <p className="text-white opacity-75 mt-1" style={{ fontSize: "13px" }}>
                    Hôm nay bạn sẽ học gì? Tiếp tục hành trình lập trình nhé!
                  </p>
                </div>
                <div className="text-white opacity-20 select-none" style={{ fontSize: "80px", lineHeight: 1 }}>
                  &lt;/&gt;
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {!isCourses && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-100 transition-all duration-300 cursor-pointer"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${stat.color}25`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${stat.color}40`;
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = "#F3F4F6";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: stat.bg }}
                    >
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>
                        {stat.value}
                      </p>
                      <p className="text-gray-400" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress */}
          {!isCourses && enrolledCourses.length > 0 && (
            <div
              className="bg-white rounded-2xl p-5 mb-6 border border-gray-100"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} style={{ color: "#4A9EE0" }} />
                <h2 className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600 }}>
                  Tiến độ học tập
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {enrolledCourses.map((course) => (
                  <div key={course.course_id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${course.color}15` }}
                    >
                      <BookOpen size={16} style={{ color: course.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {course.title}
                        </span>
                        <span style={{ fontSize: "12px", color: course.color, fontWeight: 600 }}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${course.progress}%`,
                            background: `linear-gradient(90deg, ${course.color}, ${course.accent_color})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800" style={{ fontSize: "17px", fontWeight: 700 }}>
                Tất cả khóa học
              </h2>
              <div className="flex gap-2">
                {["Tất cả", "Đã đăng ký", "Chưa đăng ký"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterLevel(f)}
                    className="px-3 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      background: filterLevel === f ? "linear-gradient(135deg, #4A9EE0, #E84545)" : "#F3F4F6",
                      color: filterLevel === f ? "white" : "#6B7280",
                      boxShadow: filterLevel === f ? "0 4px 12px rgba(74,158,224,0.3)" : "none",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {displayCourses.length > 0 ? (
              <div className="grid grid-cols-2 gap-5">
                {displayCourses.map((course) => (
                  <CourseCard key={course.id} course={toCourseCardFormat(course)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400" style={{ fontSize: "14px" }}>
                  Không tìm thấy khóa học nào
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
