"""
Công cụ kiểm tra tài khoản: xem danh sách, xem hash hoặc đặt lại mật khẩu.
Cách dùng:
  python check_user.py                        # xem tất cả tài khoản
  python check_user.py test@gmail.com         # xem hash của một tài khoản
  python check_user.py test@gmail.com reset   # đặt lại mật khẩu thành "test123"
"""
import os, sys
import psycopg2, psycopg2.extras
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print('LỖI: DATABASE_URL chưa được cấu hình trong .env')
    sys.exit(1)

conn = psycopg2.connect(DATABASE_URL)
c = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

if len(sys.argv) == 1:
    c.execute('SELECT id, name, email, LEFT(password,30) AS hash_prefix FROM users ORDER BY id')
    rows = c.fetchall()
    print(f'{"ID":<4} {"EMAIL":<30} {"TÊN":<20} {"HASH PREFIX"}')
    print('-' * 90)
    for r in rows:
        print(f'{r["id"]:<4} {r["email"]:<30} {r["name"]:<20} {r["hash_prefix"]}')

elif len(sys.argv) == 2:
    email = sys.argv[1]
    c.execute('SELECT id, name, email, password FROM users WHERE email=%s', (email,))
    user = c.fetchone()
    if not user:
        print(f'Không tìm thấy tài khoản: {email}')
    else:
        print(f'ID      : {user["id"]}')
        print(f'Tên     : {user["name"]}')
        print(f'Email   : {user["email"]}')
        print(f'Hash MK : {user["password"]}')

elif len(sys.argv) == 3 and sys.argv[2] == 'reset':
    email = sys.argv[1]
    NEW_PW = 'test123'
    c.execute('SELECT id FROM users WHERE email=%s', (email,))
    user = c.fetchone()
    if not user:
        print(f'Không tìm thấy tài khoản: {email}')
    else:
        new_hash = generate_password_hash(NEW_PW)
        c.execute('UPDATE users SET password=%s WHERE email=%s', (new_hash, email))
        conn.commit()
        print(f'Password reset for {email}')
        print(f'New password: {NEW_PW}')
        print(f'New hash    : {new_hash}')

else:
    print(__doc__)

conn.close()
