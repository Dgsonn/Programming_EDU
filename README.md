# Programming EDU — Nền tảng học lập trình

Nền tảng học lập trình trực tuyến với lộ trình, theo dõi tiến độ và quản lý khóa học.

**Tech stack:**
- **Frontend:** HTML / CSS / Vanilla JavaScript (Jinja2 templates)
- **Backend:** Flask (Python)
- **Database:** NeonDB (PostgreSQL serverless)
- **Auth:** Flask session + Werkzeug password hashing

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Python | 3.10+ |
| pip | 23+ |

---

## Cài đặt lần đầu

### 1. Clone dự án

```bash
git clone <repo-url>
cd Programming_EDU
```

### 2. Cài dependencies

```bash
pip install -r requirements.txt
```

### 3. Tạo file `.env`

Sao chép file mẫu và điền thông tin thực:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=chuoi-bi-mat-du-dai-va-phuc-tap
FLASK_DEBUG=0
```

> ⚠️ **Không commit file `.env` lên GitHub.** File này đã được thêm vào `.gitignore`.
> Lấy `DATABASE_URL` từ dashboard NeonDB: **Project → Connection Details → Connection string**.

### 4. Chạy ứng dụng

```bash
python app.py
```

Khi khởi động lần đầu, app tự động tạo tất cả bảng trong NeonDB và seed dữ liệu khóa học.

Truy cập: **http://localhost:9000**

---

## Cấu trúc dự án

```
Programming_EDU/
│
├── app.py                  # Entry point — khởi tạo Flask, CORS, CSRF, blueprints
├── config.py               # Cấu hình app (port, session, secret key)
├── models.py               # Kết nối NeonDB, tạo bảng (init_db), wrapper psycopg2
├── utils.py                # Decorators: login_required, api_login_required
│
├── routes/
│   ├── __init__.py         # Đăng ký tất cả blueprints
│   ├── main.py             # Render trang HTML (/, /login, /dashboard, ...)
│   ├── auth.py             # /auth/login, /auth/register, /auth/logout
│   ├── user.py             # /api/user — lấy/cập nhật thông tin, đổi mật khẩu, khảo sát
│   ├── courses.py          # /api/courses — danh sách, đăng ký khóa học
│   ├── stats.py            # /api/stats — thống kê học tập
│   ├── notifications.py    # /api/notifications — cài đặt thông báo
│   └── roadmap.py          # /api/roadmap — lộ trình học tập
│
├── templates/
│   ├── base.html           # Layout chung (navbar, sidebar)
│   ├── landing.html        # Trang chủ giới thiệu
│   ├── login.html          # Đăng nhập
│   ├── register.html       # Đăng ký
│   ├── dashboard.html      # Trang chính sau đăng nhập
│   ├── questionaire.html   # Khảo sát sau đăng ký
│   ├── interface.html      # Giao diện học C/C++
│   ├── lesson_python.html  # Bài học Python
│   ├── lesson_java.html    # Bài học Java
│   ├── lesson_htmlcss.html # Bài học HTML/CSS
│   └── chatbot.html        # Chatbot hỗ trợ
│
├── static/
│   ├── css/                # Stylesheet cho từng trang
│   ├── js/
│   │   ├── main.js         # Logic chính: fetch API, render khóa học, roadmap
│   │   ├── chatbot.js      # Logic chatbot
│   │   └── questionaire.js # Logic khảo sát
│   └── images/             # SVG icon khóa học, avatar
│
├── .env                    # ⛔ Không commit — chứa DATABASE_URL, SECRET_KEY
├── .env.example            # ✅ Template cho đồng nghiệp
├── requirements.txt        # Danh sách thư viện Python
└── check_user.py           # Công cụ kiểm tra / reset mật khẩu tài khoản
```

---

## API Endpoints

### Authentication (không cần đăng nhập)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký tài khoản mới |
| GET | `/auth/logout` | Đăng xuất |

### User (yêu cầu đăng nhập)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/user` | Lấy thông tin cá nhân |
| PUT | `/api/user` | Cập nhật thông tin |
| PUT | `/api/user/password` | Đổi mật khẩu |
| POST | `/api/survey` | Lưu kết quả khảo sát |

### Courses & Stats

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/courses` | Danh sách tất cả khóa học |
| GET | `/api/courses/enrolled` | Khóa học đã đăng ký |
| POST | `/api/courses/:id/enroll` | Đăng ký khóa học |
| DELETE | `/api/courses/:id/enroll` | Hủy đăng ký |
| GET | `/api/stats` | Thống kê học tập |

### Roadmap & Notifications

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/roadmap` | Lấy trạng thái lộ trình |
| POST | `/api/roadmap` | Cập nhật tiến độ lộ trình |
| GET | `/api/notifications` | Lấy cài đặt thông báo |
| PUT | `/api/notifications` | Cập nhật thông báo |

---

## Database (NeonDB)

Dự án dùng **NeonDB** — PostgreSQL serverless, không cần cài đặt gì thêm.

Các bảng được tạo tự động khi chạy `python app.py` lần đầu:

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản người dùng |
| `courses` | Danh mục khóa học (seed sẵn 4 khóa) |
| `enrollments` | Đăng ký và tiến độ học |
| `roadmap_progress` | Tiến độ lộ trình từng user |
| `notifications` | Cài đặt thông báo |
| `surveys` | Kết quả khảo sát |

**Xem / reset tài khoản:**

```bash
python check_user.py                        # xem tất cả tài khoản
python check_user.py test@gmail.com         # xem hash của một tài khoản
python check_user.py test@gmail.com reset   # đặt lại mật khẩu thành "test123"
```

---

## Quy tắc làm việc nhóm

### Git workflow

> ⚠️ **Không code trực tiếp trên nhánh `main`.**

```bash
# Lấy code mới nhất
git checkout main && git pull

# Tạo nhánh mới
git checkout -b feature/ten-tinh-nang

# Commit
git add .
git commit -m "feat: mô tả tính năng"
```

| Prefix | Khi nào dùng |
|---|---|
| `feat:` | Tính năng mới |
| `fix:` | Sửa lỗi |
| `docs:` | Sửa tài liệu |

### Quy tắc code

- **Không hardcode** URL, mật khẩu hay secret key vào code — dùng `.env`
- **Backend** luôn trả về JSON: `{'ok': True, 'data': ...}` hoặc `{'error': '...'}`
- **Đặt tên** Python: `snake_case`. HTML/CSS/JS: `kebab-case` cho class, `camelCase` cho hàm

---

## Troubleshooting

**`RuntimeError: DATABASE_URL chưa được cấu hình`**
→ Chưa tạo file `.env` hoặc thiếu biến `DATABASE_URL`. Xem lại bước cài đặt.

**`ModuleNotFoundError`**
```bash
pip install -r requirements.txt
```

**Login trả về 401 dù đúng mật khẩu**
→ Có thể mật khẩu trong DB là plain text cũ. Chạy:
```bash
python check_user.py your@email.com reset
```
rồi đăng nhập với mật khẩu `test123`.

**Lỗi CORS khi gọi API**
→ Đảm bảo `ALLOWED_ORIGINS` trong `.env` khớp với URL đang chạy (mặc định `http://localhost:9000`).
