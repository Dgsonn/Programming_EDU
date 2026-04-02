import { useState } from "react";
import { Clock, Users, Star, ArrowRight, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  students: string;
  rating: number;
  lessons: number;
  color: string;
  accentColor: string;
  tag: string;
  enrolled?: boolean;
  progress?: number;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 20px 50px rgba(74,158,224,0.18), 0 8px 20px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        border: hovered
          ? `1.5px solid ${course.color}40`
          : "1.5px solid #F3F4F6",
      }}
    >
      {/* Image Section */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: hovered
              ? `linear-gradient(to bottom, ${course.color}60 0%, ${course.color}20 50%, rgba(0,0,0,0.4) 100%)`
              : "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)",
            transition: "background 0.4s ease",
          }}
        />

        {/* Level badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white"
          style={{
            background: `linear-gradient(135deg, ${course.color}, ${course.accentColor})`,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {course.level}
        </div>

        {/* Enrolled badge */}
        {course.enrolled && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white"
            style={{
              background: "rgba(16,185,129,0.9)",
              fontSize: "11px",
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            Đã đăng ký
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div
            className="text-white"
            style={{ fontSize: "10px", fontWeight: 600, opacity: 0.85 }}
          >
            {course.tag}
          </div>
          <h3
            className="text-white mt-0.5"
            style={{ fontSize: "16px", fontWeight: 700 }}
          >
            {course.title}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <p
          className="text-gray-500"
          style={{ fontSize: "13px", lineHeight: "1.5" }}
        >
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={13} />
            <span style={{ fontSize: "12px" }}>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users size={13} />
            <span style={{ fontSize: "12px" }}>{course.students}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={13} fill="#FBBF24" style={{ color: "#FBBF24" }} />
            <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 600 }}>
              {course.rating}
            </span>
          </div>
        </div>

        {/* Lessons + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <BookOpen size={13} />
            <span style={{ fontSize: "12px" }}>{course.lessons} bài học</span>
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300"
            style={{
              background: hovered
                ? `linear-gradient(135deg, ${course.color}, ${course.accentColor})`
                : "#F3F4F6",
              color: hovered ? "white" : "#6B7280",
              fontSize: "12px",
              fontWeight: 600,
              transform: hovered ? "scale(1.05)" : "scale(1)",
              boxShadow: hovered ? `0 4px 12px ${course.color}50` : "none",
            }}
          >
            {course.enrolled ? "Tiếp tục học" : "Xem khóa học"}
            <ArrowRight
              size={12}
              style={{
                transform: hovered ? "translateX(2px)" : "translateX(0)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Course };