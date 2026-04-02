import { useState, useEffect } from "react";
import { BookOpen, Play, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { api, type EnrolledCourse } from "../../lib/api";

export function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgress()
      .then(setEnrolledCourses)
      .catch((err) => console.error("Lỗi tải khóa học:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalHours = enrolledCourses.reduce((sum, c) => sum + c.time_spent_hours, 0);
  const avgProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
    : 0;

  const summaryStats = [
    { label: "Đang học",   value: String(enrolledCourses.length), icon: BookOpen,    color: "#4A9EE0", bg: "#EEF6FD" },
    { label: "Giờ đã học", value: `${totalHours}h`,               icon: Clock,       color: "#E84545", bg: "#FDEEEE" },
    { label: "Tiến độ TB", value: `${avgProgress}%`,              icon: TrendingUp,  color: "#10B981", bg: "#EEFBF5" },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 shadow-sm">
        <h1 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>
          Khóa học của tôi
        </h1>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>
          {loading ? "Đang tải..." : `${enrolledCourses.length} khóa học đang theo học`}
        </p>
      </div>

      {loading && (
        <div className="p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="p-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {summaryStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-100"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "20px", fontWeight: 700, color: "#1F2937" }}>{s.value}</p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>
                Bạn chưa đăng ký khóa học nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div
                  key={course.course_id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-300"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 30px ${course.color}20`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${course.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#F3F4F6";
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${course.color}20, ${course.accent_color}10)`,
                          border: `2px solid ${course.color}30`,
                        }}
                      >
                        <BookOpen size={24} style={{ color: course.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1F2937" }}>
                          {course.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{course.subtitle}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle size={12} style={{ color: "#10B981" }} />
                            <span style={{ fontSize: "12px", color: "#6B7280" }}>
                              {course.completed_lessons}/{course.total_lessons} bài
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} style={{ color: "#9CA3AF" }} />
                            <span style={{ fontSize: "12px", color: "#6B7280" }}>
                              {course.time_spent_hours}h / {course.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all duration-200 hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${course.color}, ${course.accent_color})`,
                        fontSize: "13px",
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${course.color}40`,
                      }}
                    >
                      <Play size={14} fill="white" />
                      Tiếp tục học
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Tiến độ hoàn thành</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: course.color }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${course.progress}%`,
                          background: `linear-gradient(90deg, ${course.color}, ${course.accent_color})`,
                          boxShadow: `0 0 8px ${course.color}60`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Last / Next lesson */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Bài học gần nhất</p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{course.last_lesson || "—"}</p>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: `${course.color}08`, border: `1px solid ${course.color}20` }}
                    >
                      <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Bài tiếp theo</p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: course.color }}>{course.next_lesson || "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
