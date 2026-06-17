#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test render dashboard HTML — check class mới + section đã có."""
import sys
sys.path.insert(0, r'D:\newcty\Programming_EDU')

from app import app
from models import get_db

conn = get_db()
row = conn.execute('SELECT id FROM users ORDER BY id LIMIT 1').fetchone()
conn.close()
uid = row['id']
print(f'Login as user_id={uid}')

client = app.test_client()
with client.session_transaction() as sess:
    sess['user_id'] = uid

r = client.get('/dashboard')
print(f'GET /dashboard -> status={r.status_code}, len={len(r.data)} bytes')

# Check các class mới xuất hiện
body = r.data.decode('utf-8', errors='replace')
markers = [
    'dash-top',
    'dash-grid',
    'dash-col-left',
    'dash-col-right',
    'lb-card',
    'lb-tabs',
    'lb-tab',
    'lb-list',
    'lb-me',
    'mini-rm-card',
    'mini-rm-canvas',
    'mini-rm-header',
    'lb-legend-dot',
    'welcome-banner--compact',
]
print()
print('Marker check:')
for m in markers:
    n = body.count(m)
    flag = 'OK' if n > 0 else 'MISSING'
    print(f'  [{flag}] {m}: {n} occurrence(s)')

# Check class cũ đã xoá
old_markers = [
    'progress-grid',
    'dash-search-wrap',
    'dash-search-empty',
    'enrolled-list',
    'id="dash-search-input"',
    'id="dash-search-clear"',
]
print()
print('Old markers (should be 0):')
for m in old_markers:
    n = body.count(m)
    flag = 'OK' if n == 0 else 'LEFTOVER'
    print(f'  [{flag}] {m}: {n} occurrence(s)')
