"""
Script migration một lần: rehash mật khẩu plaintext trong bảng users.

Werkzeug hash luôn có prefix 'scrypt:' hoặc 'pbkdf2:'.
Bất kỳ password nào không có prefix đó được coi là plaintext và sẽ được hash lại.

Chạy: python migrate_password_hash.py
"""
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('DATABASE_URL chưa được cấu hình trong .env')

HASH_PREFIXES = ('scrypt:', 'pbkdf2:')


def needs_rehash(password: str) -> bool:
    return not any(password.startswith(p) for p in HASH_PREFIXES)


def run():
    conn = psycopg2.connect(DATABASE_URL)
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute('SELECT id, password FROM users')
    users = cur.fetchall()

    updated = 0
    for user in users:
        if user['password'] and needs_rehash(user['password']):
            hashed = generate_password_hash(user['password'])
            cur.execute('UPDATE users SET password=%s WHERE id=%s', (hashed, user['id']))
            updated += 1
            print(f'  Rehashed user id={user["id"]}')

    conn.commit()
    cur.close()
    conn.close()
    print(f'\nHoàn thành: {updated}/{len(users)} tài khoản được rehash.')


if __name__ == '__main__':
    run()
