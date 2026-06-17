#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
1. Start Flask app ở port 9090
2. Dùng test_client tạo session cho user đầu tiên
3. Dump session cookie ra file
4. Mở playwright với cookie đó -> screenshot dashboard
"""
import sys, os, time, json, threading, pickle
sys.path.insert(0, r'D:\newcty\Programming_EDU')

# Patch port
import config
config.Config.PORT = 9090

from app import app
from models import get_db

# Get a user
conn = get_db()
row = conn.execute('SELECT id, name FROM users ORDER BY id LIMIT 1').fetchone()
conn.close()
uid = row['id']
uname = row['name']
print(f'User: id={uid} name={uname}')

# Tạo session cookie sẵn
with app.test_request_context():
    from flask import session
    session['user_id'] = uid

# Dump session cookie using Flask's serializer
from flask.sessions import SecureCookieSessionInterface
from werkzeug.datastructures import Headers
import requests

# Manually craft session cookie
with app.test_request_context():
    from flask import session
    session['user_id'] = uid
    si = SecureCookieSessionInterface()
    s = si.get_signing_serializer(app)
    val = s.dumps(dict(session))
    print(f'Cookie value: {val[:60]}...')
    with open(r'D:\newcty\Programming_EDU\scripts\preview_session.txt', 'w', encoding='utf-8') as f:
        f.write(val)

print('[OK] Session cookie written to scripts/preview_session.txt')
