# Dữ liệu tĩnh — catalog khóa học và định nghĩa roadmap

COURSES = [
    {
        "id": "cpp",
        "title": "C / C++",
        "subtitle": "Lập trình hệ thống",
        "description": "Học lập trình từ nền tảng với C/C++, hiểu bộ nhớ, con trỏ và cấu trúc dữ liệu.",
        "image": "https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZyUyMGxhcHRvcCUyMGRldmVsb3BlcnxlbnwxfHx8fDE3NzQ5NzUxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "level": "Cơ bản → Nâng cao",
        "duration": "40 giờ",
        "students": "12.4K",
        "rating": 4.8,
        "lessons": 85,
        "color": "#4A9EE0",
        "accent_color": "#2D7FC1",
        "tag": "HỆ THỐNG & NHÚNG",
    },
    {
        "id": "python",
        "title": "Python",
        "subtitle": "Đa năng & AI",
        "description": "Làm chủ Python để xây dựng web, phân tích dữ liệu, AI/ML và tự động hóa.",
        "image": "https://images.unsplash.com/photo-1660616246653-e2c57d1077b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXRob24lMjBwcm9ncmFtbWluZyUyMGNvZGUlMjBzY3JlZW58ZW58MXx8fHwxNzc0ODk0OTE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "level": "Mọi cấp độ",
        "duration": "55 giờ",
        "students": "28.7K",
        "rating": 4.9,
        "lessons": 120,
        "color": "#E84545",
        "accent_color": "#C83232",
        "tag": "AI & DATA SCIENCE",
    },
    {
        "id": "java",
        "title": "Java",
        "subtitle": "Backend & Enterprise",
        "description": "Xây dựng ứng dụng doanh nghiệp với Java OOP, Spring Boot và microservices.",
        "image": "https://images.unsplash.com/photo-1579403124614-197f69d8187b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXZhJTIwcHJvZ3JhbW1pbmclMjBzb2Z0d2FyZSUyMGRldmVsb3BtZW50fGVufDF8fHx8MTc3NDk4MzM2OHww&ixlib=rb-4.1.0&q=80&w=1080",
        "level": "Trung cấp",
        "duration": "60 giờ",
        "students": "18.2K",
        "rating": 4.7,
        "lessons": 110,
        "color": "#4A9EE0",
        "accent_color": "#E84545",
        "tag": "BACKEND & ENTERPRISE",
    },
    {
        "id": "htmlcss",
        "title": "HTML / CSS",
        "subtitle": "Nền tảng Web",
        "description": "Tạo giao diện web đẹp, responsive với HTML5 hiện đại và CSS3 nâng cao.",
        "image": "https://images.unsplash.com/photo-1760548425425-e42e77fa38f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXNpZ24lMjBIVE1MJTIwQ1NTJTIwZnJvbnRlbmR8ZW58MXx8fHwxNzc0OTgzMzY5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "level": "Người mới bắt đầu",
        "duration": "30 giờ",
        "students": "35.1K",
        "rating": 4.9,
        "lessons": 70,
        "color": "#E84545",
        "accent_color": "#4A9EE0",
        "tag": "WEB DEVELOPMENT",
    },
]

COURSES_BY_ID = {c["id"]: c for c in COURSES}

# Seed data cho enrollment của user mẫu
SEED_ENROLLMENTS = [
    {
        "course_id": "cpp",
        "progress": 42,
        "time_spent_hours": 16.8,
        "completed_lessons": 36,
        "last_lesson": "Bài 36: Con trỏ và cấu trúc",
        "next_lesson": "Bài 37: Hàm đệ quy",
    },
    {
        "course_id": "htmlcss",
        "progress": 15,
        "time_spent_hours": 4.5,
        "completed_lessons": 10,
        "last_lesson": "Bài 10: CSS Flexbox",
        "next_lesson": "Bài 11: CSS Grid",
    },
]

SEED_NOTIFICATIONS = [
    {"key": "email",     "enabled": True},
    {"key": "push",      "enabled": False},
    {"key": "reminders", "enabled": True},
    {"key": "updates",   "enabled": False},
]

# Seed roadmap progress cho user mẫu
SEED_ROADMAP_PROGRESS = [
    {"roadmap_id": "frontend", "item_id": "html",        "status": "completed"},
    {"roadmap_id": "frontend", "item_id": "css",         "status": "completed"},
    {"roadmap_id": "frontend", "item_id": "js-basics",   "status": "in-progress"},
    {"roadmap_id": "cpp",      "item_id": "syntax",      "status": "completed"},
    {"roadmap_id": "cpp",      "item_id": "memory",      "status": "in-progress"},
    {"roadmap_id": "cpp",      "item_id": "arrays-strings","status": "in-progress"},
    {"roadmap_id": "python",   "item_id": "python-syntax","status": "completed"},
    {"roadmap_id": "python",   "item_id": "python-oop",  "status": "completed"},
    {"roadmap_id": "python",   "item_id": "env",         "status": "in-progress"},
]