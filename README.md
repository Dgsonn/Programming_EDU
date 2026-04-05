# Programming EDU — Frontend Interface

Giao diện học lập trình trực tuyến. Vanilla HTML/CSS/JS + Flask backend.

## Cấu trúc dự án

```
.
├── index.html          # Giao diện chính (mở trực tiếp trên trình duyệt)
├── css/
│   ├── style.css       # Style chung, sidebar, topbar
│   ├── dashboard.css   # Dashboard, stat cards, course cards
│   └── pages.css       # My Courses, Settings
├── js/
│   ├── data.js         # Biến toàn cục (courses, enrolledCourses)
│   └── app.js          # Logic: navigation, render, API calls
├── images/             # SVG icons cho từng khóa học + avatar
└── backend/
    ├── app.py          # Flask server + toàn bộ API
    └── requirements.txt
```

## Yêu cầu

- Python 3.8+

## Cách chạy

### 1. Cài thư viện Python

```bash
cd backend
pip install -r requirements.txt
```

### 2. Chạy backend

```bash
python app.py
```

Backend chạy tại `http://localhost:5000`

### 3. Mở frontend

Mở file `index.html` trực tiếp trên trình duyệt (double-click hoặc drag vào Chrome/Edge).

> **Lưu ý:** Phải chạy backend trước, sau đó mới mở `index.html`. Nếu backend chưa chạy thì dữ liệu sẽ không hiển thị.

## API endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/user` | Lấy thông tin người dùng |
| PUT | `/api/user` | Cập nhật thông tin người dùng |
| PUT | `/api/user/password` | Đổi mật khẩu |
| GET | `/api/courses` | Danh sách tất cả khóa học |
| GET | `/api/enrolled` | Khóa học đang học |
| POST | `/api/courses/:id/enroll` | Đăng ký khóa học |
| DELETE | `/api/courses/:id/enroll` | Hủy đăng ký |
| GET | `/api/stats` | Thống kê (số khóa, giờ học, streak, chứng chỉ) |
| GET | `/api/notifications` | Cài đặt thông báo |
| PUT | `/api/notifications` | Lưu cài đặt thông báo |

## Tài khoản demo

Dữ liệu mẫu được seed tự động khi chạy lần đầu:

- **Tên:** Cao Văn Nhân
- **Email:** caovannhan@email.com
- **Mật khẩu:** 123456

## Ghi chú

- Database SQLite tự tạo tại `backend/edu.db` khi chạy lần đầu, không cần cấu hình thêm.
- Không cần Node.js hay npm — đây là vanilla HTML/CSS/JS thuần.
