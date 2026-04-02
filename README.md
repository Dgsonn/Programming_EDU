# ProgrammingEDU — Nền tảng học lập trình

Giao diện học lập trình trực tuyến với lộ trình, theo dõi tiến độ và quản lý khóa học.

**Tech stack:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite
- **Backend:** Flask (Python) + SQLite + JWT Authentication

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | 18+ |
| Python | 3.10+ |
| npm | 9+ |
| pip | 23+ |

---

## Cài đặt lần đầu

### 1. Clone dự án

```bash
git clone <repo-url>
cd "Programming EDU Frontend Interface"
```

### 2. Cài dependencies frontend

```bash
npm install
```

### 3. Cài dependencies backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Tạo database và dữ liệu mẫu

```bash
# Vẫn trong thư mục backend/
python seed.py
```

Kết quả thành công:
```
✅ Seed thành công!
   Email   : caovannhan@email.com
   Password: 123456
```

---

## Chạy ở môi trường Development

```bash
# Quay về thư mục gốc
cd "Programming EDU Frontend Interface"

# Chạy cả frontend + backend bằng 1 lệnh
npm run dev:full
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Flask) | http://localhost:5000 |

Đăng nhập tài khoản demo: `caovannhan@email.com` / `123456`

---

## Cấu trúc dự án

```
Programming EDU Frontend Interface/
│
├── src/                        # Frontend React
│   ├── app/
│   │   ├── App.tsx             # Root component + auth
│   │   └── components/
│   │       ├── Dashboard.tsx   # Trang chủ
│   │       ├── MyCourses.tsx   # Khóa học của tôi
│   │       ├── Roadmap.tsx     # Lộ trình học
│   │       ├── Settings.tsx    # Cài đặt tài khoản
│   │       ├── Sidebar.tsx     # Thanh điều hướng
│   │       ├── CourseCard.tsx  # Component card khóa học
│   │       └── ui/             # Shadcn/ui components
│   ├── lib/
│   │   └── api.ts              # API client (fetch wrapper)
│   └── styles/
│
├── backend/                    # Backend Flask
│   ├── app.py                  # Flask app + blueprints
│   ├── config.py               # Cấu hình (DB, JWT, secret)
│   ├── models.py               # SQLAlchemy models
│   ├── data.py                 # Catalog khóa học (dữ liệu tĩnh)
│   ├── seed.py                 # Script tạo dữ liệu mẫu
│   ├── routes/
│   │   ├── auth.py             # /api/auth/*
│   │   ├── courses.py          # /api/courses/*
│   │   ├── progress.py         # /api/progress/*
│   │   ├── roadmap.py          # /api/roadmap/*
│   │   └── user.py             # /api/user/*
│   ├── requirements.txt
│   └── db.sqlite3              # Database (tự tạo sau seed)
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### User
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/user/profile` | Lấy thông tin cá nhân |
| PUT | `/api/user/profile` | Cập nhật thông tin |
| GET | `/api/user/stats` | Thống kê học tập |
| GET | `/api/user/notifications` | Lấy cài đặt thông báo |
| PUT | `/api/user/notifications` | Cập nhật thông báo |
| PUT | `/api/user/change-password` | Đổi mật khẩu |

### Courses & Progress
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/courses` | Danh sách tất cả khóa học |
| POST | `/api/courses/:id/enroll` | Đăng ký khóa học |
| GET | `/api/progress` | Tiến độ các khóa đã đăng ký |
| PUT | `/api/progress/:course_id` | Cập nhật tiến độ |

### Roadmap
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/roadmap/progress` | Lấy trạng thái lộ trình |
| PUT | `/api/roadmap/:id/items/:item_id` | Cập nhật trạng thái item |

---

## Deploy lên Server thật (VPS)

### Bước 1 — Chuẩn bị server (Ubuntu/Debian)

```bash
# Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cài Python 3 + pip
sudo apt install -y python3 python3-pip

# Cài Nginx (reverse proxy)
sudo apt install -y nginx
```

### Bước 2 — Upload code lên server

```bash
# Cách 1: dùng git
git clone <repo-url> /var/www/programmingedu

# Cách 2: dùng scp từ máy local (Windows)
scp -r "d:/Programming EDU Frontend Interface" user@yourserver:/var/www/programmingedu
```

### Bước 3 — Build frontend + setup backend

```bash
cd /var/www/programmingedu

# Build frontend → tạo thư mục dist/
npm install
npm run build

# Cài backend
cd backend
pip3 install -r requirements.txt
pip3 install gunicorn

# Tạo database
python3 seed.py
```

### Bước 4 — Đổi SECRET KEY (bắt buộc)

Tạo file `backend/.env`:

```env
SECRET_KEY=thay-bang-chuoi-ngau-nhien-dai-va-phuc-tap
JWT_SECRET_KEY=thay-bang-chuoi-khac-cung-ngau-nhien
```

> ⚠️ **Không dùng secret key mặc định trên production!**

### Bước 5 — Chạy Flask bằng Gunicorn

```bash
cd /var/www/programmingedu/backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Bước 6 — Cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/programmingedu
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/programmingedu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 7 — Tự động chạy khi server reboot

```bash
sudo nano /etc/systemd/system/programmingedu.service
```

```ini
[Unit]
Description=ProgrammingEDU Flask App
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/programmingedu/backend
ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable programmingedu
sudo systemctl start programmingedu
sudo systemctl status programmingedu
```

Truy cập `http://yourdomain.com` là xong ✅

---

## Deploy nhanh không cần VPS

### Render (miễn phí)

1. Tạo tài khoản tại [render.com](https://render.com)
2. **New → Web Service** → kết nối GitHub repo
3. Cấu hình:
   - **Build Command:** `npm install && npm run build && pip3 install -r backend/requirements.txt`
   - **Start Command:** `cd backend && python3 seed.py; gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
4. Thêm Environment Variables: `SECRET_KEY`, `JWT_SECRET_KEY`

### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Các lệnh tóm tắt

```bash
# ── Development ──────────────────────────
npm run dev:full        # Chạy cả frontend + backend (khuyên dùng)
npm run dev             # Chỉ frontend
npm run dev:backend     # Chỉ backend

# ── Production ───────────────────────────
npm run build           # Build frontend ra dist/
npm start               # Build + chạy Flask serve tất cả

# ── Database ─────────────────────────────
cd backend
python seed.py          # Tạo / reset database về dữ liệu mẫu
```

---

## Troubleshooting

**`npm run dev:full` không chạy được**
```bash
npm install   # cài lại concurrently
```

**Flask báo `ModuleNotFoundError`**
```bash
cd backend && pip install -r requirements.txt
```

**Lỗi CORS khi frontend gọi API**
- Đảm bảo Flask đang chạy trên port `5000`
- Kiểm tra `CORS(app, origins=["http://localhost:5173"])` trong `backend/app.py`

**Muốn reset database về ban đầu**
```bash
cd backend
del db.sqlite3          # Windows
python seed.py
```

---

---

# QUY TẮC CHUNG: DỰ ÁN FLASK & REACT

> Tài liệu quy định làm việc nhóm — mọi thành viên phải đọc và tuân thủ.

## 1. Cấu trúc thư mục

Mọi người phải để file đúng chỗ, **không được tự ý tạo thư mục lạ** ở thư mục gốc.

```
/my-project
├── /backend                  (Flask)
│   ├── /app
│   │   ├── /routes           # Định nghĩa API       (VD: auth_routes.py)
│   │   ├── /models           # Cấu trúc Database    (VD: user_model.py)
│   │   ├── /services         # Logic xử lý          (VD: email_service.py)
│   │   └── __init__.py       # Cấu hình app & kết nối DB
│   ├── .env                  # Mật khẩu, secret key (CẤM đẩy lên GitHub)
│   └── requirements.txt      # Danh sách thư viện
│
└── /frontend                 (React)
    ├── /src
    │   ├── /components       # Các phần nhỏ  (VD: Button.jsx, Navbar.jsx)
    │   ├── /pages            # Các trang lớn (VD: LoginPage.jsx, Dashboard.jsx)
    │   ├── /services         # File gọi API  (VD: authApi.js)
    │   └── App.js            # File điều hướng chính
    └── .env                  # Lưu URL của Backend
```

---

## 2. Quy tắc đặt tên (Naming Convention)

### Backend (Python)
| Loại | Convention | Ví dụ |
|---|---|---|
| Biến / Hàm | `snake_case` | `get_user_by_id` |
| Class | `PascalCase` | `UserModel` |

### Frontend (React / JS)
| Loại | Convention | Ví dụ |
|---|---|---|
| Component / File | `PascalCase` | `LoginPage.jsx` |
| Hàm / Biến | `camelCase` | `fetchUserData` |

---

## 3. Quy tắc giao tiếp API

**Backend luôn trả về JSON có cấu trúc 3 phần:**

```json
{
  "success": true,
  "data": { },
  "message": "Thông báo thành công / thất bại"
}
```

**HTTP Status Code:**

| Code | Ý nghĩa |
|---|---|
| `200` / `201` | Thành công |
| `400` | Lỗi do người dùng gửi thiếu / sai dữ liệu |
| `401` | Chưa đăng nhập |
| `500` | Lỗi server |

---

## 4. Quy tắc Code sạch (Clean Code)

- **Không Hardcode:** Không viết trực tiếp link API hay mật khẩu vào code. Tất cả dùng biến môi trường `.env`.
- **Hàm ngắn gọn:** Một hàm không nên dài quá **30 dòng**. Nếu quá dài, hãy chia nhỏ.
- **Comment "Tại sao":** Đừng comment hàm này làm gì (tên hàm phải nói lên điều đó), hãy comment **tại sao** bạn làm như vậy nếu logic quá phức tạp.

---

## 5. Quy trình làm việc với Git (Bắt buộc)

> ⚠️ **Tuyệt đối không code trực tiếp trên nhánh `main`.**

**Mỗi khi làm tính năng mới:**

```bash
# Bước 1: Lấy code mới nhất
git checkout main
git pull

# Bước 2: Tạo nhánh mới
git checkout -b feature/ten-tinh-nang

# Bước 3: Code và commit
git add .
git commit -m "feat: mô tả tính năng"
```

**Quy tắc viết Commit message:**

| Prefix | Khi nào dùng |
|---|---|
| `feat: ...` | Tính năng mới |
| `fix: ...` | Sửa lỗi |
| `docs: ...` | Sửa tài liệu |

> 💡 Nếu có ý tưởng, đề xuất mới hoặc phát hiện vấn đề trong code — tải lên **Discussion** trước để CEO hoặc các nhóm trưởng duyệt.

---

## 6. Công cụ bắt buộc cài đặt

Yêu cầu cả nhóm cài 2 extension sau trên VS Code:

| Extension | Dùng cho | Tác dụng |
|---|---|---|
| **Prettier** | React / JS | Tự động căn lề, thêm dấu chấm phẩy |
| **Black Formatter** | Python | Tự động căn lề chuẩn PEP8 |

> 🚫 **Hình phạt:** Ai không cài, khi gửi code bị lỗi format, người review có quyền **Reject** không xem code.
