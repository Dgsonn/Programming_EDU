#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Start Flask ở port 9090, dùng playwright screenshot dashboard.
"""
import sys, time, threading, os
sys.path.insert(0, r'D:\newcty\Programming_EDU')

# Override port
import config
config.Config.PORT = 9090
config.Config.DEBUG = False

from app import app

# 1) Start Flask in background thread
def run():
    app.run(debug=False, port=9090, use_reloader=False)

t = threading.Thread(target=run, daemon=True)
t.start()
print('Flask starting on 9090...')
time.sleep(3)  # chờ Flask sẵn sàng

# 2) Đọc session cookie
with open(r'D:\newcty\Programming_EDU\scripts\preview_session.txt', 'r', encoding='utf-8') as f:
    cookie_value = f.read().strip()
print(f'Cookie: {cookie_value[:40]}...')

# 3) Dùng playwright sync
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print('[ERR] playwright chưa cài. Cài: pip install playwright && playwright install chromium')
    sys.exit(1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    ctx.add_cookies([{
        'name': 'session',
        'value': cookie_value,
        'domain': 'localhost',
        'path': '/',
        'httpOnly': True,
    }])
    page = ctx.new_page()

    print('Navigating to http://localhost:9090/dashboard ...')
    page.goto('http://localhost:9090/dashboard', wait_until='networkidle', timeout=15000)
    time.sleep(2)  # chờ JS load leaderboard + mini canvas

    # Wait cho leaderboard load xong
    try:
        page.wait_for_selector('.lb-row', timeout=8000)
    except Exception as e:
        print(f'Leaderboard timeout: {e}')

    out = r'D:\newcty\Programming_EDU\scripts\dashboard_preview.png'
    page.screenshot(path=out, full_page=True)
    print(f'[OK] Screenshot saved: {out}')

    # Test click tab "Bạn bè"
    print('Click tab "Bạn bè"...')
    page.click('.lb-tab[data-type="friends"]')
    time.sleep(1)
    page.screenshot(path=r'D:\newcty\Programming_EDU\scripts\dashboard_preview_friends.png', full_page=True)
    print('[OK] Screenshot friends saved')

    # Test click tab "Streak"
    print('Click tab "Streak"...')
    page.click('.lb-tab[data-type="streak"]')
    time.sleep(1)
    page.screenshot(path=r'D:\newcty\Programming_EDU\scripts\dashboard_preview_streak.png', full_page=True)
    print('[OK] Screenshot streak saved')

    browser.close()

print('Done.')
