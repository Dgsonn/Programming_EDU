#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test endpoint /api/leaderboard qua Flask test client."""
import sys
sys.path.insert(0, r'D:\newcty\Programming_EDU')

from app import app
from models import get_db

# 1) Lấy 1 user bất kỳ trong DB
conn = get_db()
row = conn.execute('SELECT id, name, xp, streak FROM users ORDER BY id LIMIT 1').fetchone()
conn.close()

if not row:
    print('[SKIP] DB không có user nào, bỏ qua test endpoint.')
    sys.exit(0)

print(f'Test user: id={row["id"]}, name={row["name"]}, xp={row["xp"]}, streak={row["streak"]}')

# 2) Test qua test client
client = app.test_client()
with client.session_transaction() as sess:
    sess['user_id'] = row['id']

for t in ('weekly', 'streak', 'friends'):
    r = client.get(f'/api/leaderboard?type={t}')
    print(f'\n[GET /api/leaderboard?type={t}] status={r.status_code}')
    if r.status_code == 200:
        data = r.get_json()
        print(f'  type={data.get("type")} unit={data.get("unit")} label={data.get("label")}')
        print(f'  entries={len(data.get("entries", []))}')
        for e in data.get('entries', [])[:3]:
            print(f'    #{e["rank"]} {e["name"]} = {e["value"]} {data.get("unit", "")} {e.get("medal", "")}')
        me = data.get('me')
        if me:
            print(f'  me: rank={me["rank"]} value={me["value"]} name={me["name"]}')
    else:
        print(f'  body={r.data[:200].decode("utf-8", errors="replace")}')

# 3) Test type invalid
r = client.get('/api/leaderboard?type=garbage')
print(f'\n[GET ?type=garbage] status={r.status_code}')
print(f'  body={r.get_json()}')
