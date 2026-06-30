"""
Script test API diễn đàn (posts/comments) — chạy tự động, không cần curl/Postman.

Cách dùng:
    python scripts/test_forum_api.py

Yêu cầu: app đang chạy ở http://localhost:9000 (python app.py).
Script tự đăng ký 2 tài khoản test (A và B) bằng email ngẫu nhiên mỗi lần chạy,
nên có thể chạy lại nhiều lần không bị lỗi "email đã tồn tại".
"""
import io
import random
import sys

import requests

# Console Windows mặc định dùng cp1252, không in được tiếng Việt Unicode
# (lỗi của API/JSON trả về đều có dấu) -> ép stdout/stderr sang UTF-8.
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

BASE = "http://localhost:9000"
_passed = 0
_failed = 0


def check(label, condition, detail=""):
    global _passed, _failed
    if condition:
        _passed += 1
        print(f"  [OK]   {label}")
    else:
        _failed += 1
        print(f"  [FAIL] {label}  {detail}")


def register(session, email):
    r = session.post(f"{BASE}/auth/register", json={
        "name": "Forum Tester",
        "email": email,
        "password": "Test12345",
    })
    return r


def main():
    rand = random.randint(10000, 99999)
    email_a = f"forumtest_a_{rand}@example.com"
    email_b = f"forumtest_b_{rand}@example.com"

    session_a = requests.Session()
    session_b = requests.Session()

    print(f"\n== Chuẩn bị: đăng ký 2 user test ==")
    ra = register(session_a, email_a)
    rb = register(session_b, email_b)
    check("Đăng ký user A thành công", ra.status_code == 200, ra.text)
    check("Đăng ký user B thành công", rb.status_code == 200, rb.text)
    if ra.status_code != 200 or rb.status_code != 200:
        print("\nKhông thể tiếp tục vì đăng ký lỗi. Kiểm tra app có đang chạy ở "
              f"{BASE} không (python app.py).")
        sys.exit(1)

    print(f"\n== 1. Tạo bài viết (POST /api/posts) ==")
    r = session_a.post(f"{BASE}/api/posts", json={
        "category": "question", "title": "Làm sao học Python?",
        "content": "Mình mới bắt đầu, nên học gì trước?"
    })
    check("Tạo bài viết -> 200", r.status_code == 200, r.text)
    post_id = r.json().get("id") if r.status_code == 200 else None

    r_empty = session_a.post(f"{BASE}/api/posts", json={"content": ""})
    check("Content rỗng -> 400", r_empty.status_code == 400, r_empty.text)

    session_a.post(f"{BASE}/api/posts", json={"category": "share", "content": "Bài chia sẻ"})
    session_a.post(f"{BASE}/api/posts", json={"category": "discuss", "content": "Bài thảo luận"})

    print(f"\n== 2. Danh sách + phân trang (GET /api/posts) ==")
    r = session_a.get(f"{BASE}/api/posts", params={"page": 1, "per_page": 5})
    check("List posts -> 200", r.status_code == 200, r.text)
    data = r.json() if r.status_code == 200 else {}
    check("Có field phân trang đầy đủ",
          all(k in data for k in ("posts", "page", "per_page", "total", "total_pages")),
          data)
    check("total >= 3 (đã tạo 3 bài)", data.get("total", 0) >= 3, data)

    r_filter = session_a.get(f"{BASE}/api/posts", params={"category": "question"})
    fdata = r_filter.json() if r_filter.status_code == 200 else {}
    check("Filter category=question chỉ trả bài đúng category",
          all(p["category"] == "question" for p in fdata.get("posts", [])), fdata)

    r_sort = session_a.get(f"{BASE}/api/posts", params={"sort": "oldest"})
    check("Sort oldest -> 200", r_sort.status_code == 200, r_sort.text)

    print(f"\n== 3. Chi tiết bài viết (GET /api/posts/<id>) ==")
    r = session_a.get(f"{BASE}/api/posts/{post_id}")
    check("Get post detail -> 200", r.status_code == 200, r.text)
    check("Có author_name", "author_name" in r.json(), r.json())

    r404 = session_a.get(f"{BASE}/api/posts/999999")
    check("Post không tồn tại -> 404", r404.status_code == 404, r404.text)

    print(f"\n== 4. Sửa bài viết (PUT /api/posts/<id>) ==")
    r = session_a.put(f"{BASE}/api/posts/{post_id}", json={"content": "Nội dung đã sửa"})
    check("Chủ sở hữu sửa bài -> 200", r.status_code == 200, r.text)

    r_other = session_b.put(f"{BASE}/api/posts/{post_id}", json={"content": "Hack!"})
    check("Người khác (B) sửa bài của A -> 403", r_other.status_code == 403, r_other.text)

    print(f"\n== 5. Bình luận (POST/GET /api/posts/<id>/comments) ==")
    r = session_a.post(f"{BASE}/api/posts/{post_id}/comments", json={"content": "Bình luận của A"})
    check("Tạo bình luận -> 200", r.status_code == 200, r.text)
    comment_id = r.json().get("id") if r.status_code == 200 else None

    r = session_b.post(f"{BASE}/api/posts/{post_id}/comments", json={"content": "Bình luận của B"})
    check("User B cũng bình luận được -> 200", r.status_code == 200, r.text)

    r = session_a.get(f"{BASE}/api/posts/{post_id}/comments")
    cdata = r.json() if r.status_code == 200 else {}
    check("List bình luận -> 200", r.status_code == 200, r.text)
    check("Có ít nhất 2 bình luận", cdata.get("total", 0) >= 2, cdata)

    r_404c = session_a.post(f"{BASE}/api/posts/999999/comments", json={"content": "x"})
    check("Bình luận trên post không tồn tại -> 404", r_404c.status_code == 404, r_404c.text)

    print(f"\n== 6. Phân quyền sửa/xóa bình luận ==")
    r_other_c = session_b.put(f"{BASE}/api/comments/{comment_id}", json={"content": "Hack!"})
    check("User B sửa bình luận của A -> 403", r_other_c.status_code == 403, r_other_c.text)

    print(f"\n== 7. Xóa bài viết -> cascade xóa bình luận ==")
    r_del = session_a.delete(f"{BASE}/api/posts/{post_id}")
    check("Chủ sở hữu xóa bài -> 200", r_del.status_code == 200, r_del.text)

    r_check = session_a.get(f"{BASE}/api/posts/{post_id}/comments")
    check("Sau khi xóa bài, GET comments -> 404 (bài không còn tồn tại)",
          r_check.status_code == 404, r_check.text)

    print(f"\n{'='*50}")
    print(f"KẾT QUẢ: {_passed} passed, {_failed} failed")
    print(f"{'='*50}\n")
    sys.exit(1 if _failed else 0)


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print(f"\nKhông kết nối được tới {BASE}.")
        print("Hãy chạy app trước: python app.py")
        sys.exit(1)
