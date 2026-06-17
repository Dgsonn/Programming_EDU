#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Refactor dashboard.html v2 — đọc block cũ từ file rồi replace."""
import io
import re

HTML = r"D:\newcty\Programming_EDU\templates\dashboard.html"


def main():
    with io.open(HTML, 'r', encoding='utf-8') as f:
        src = f.read()

    # Tìm đoạn từ `<!-- ── Dashboard ── -->` đến trước `<!-- ── Courses ── -->`
    pat = re.compile(
        r'(    <!-- ── Dashboard ── -->.*?</div>\n)(\n    <!-- ── Courses ── -->)',
        re.DOTALL,
    )
    m = pat.search(src)
    if not m:
        print('[ERR] Không tìm thấy block dashboard.')
        import sys; sys.exit(1)
    old_block = m.group(1)
    print(f'[INFO] Old block length: {len(old_block)}')

    # Thay thế bằng cấu trúc mới
    new_block = '''    <!-- ── Dashboard ── -->
    <div class="page active" id="page-dashboard">

      <!-- ══ HÀNG 1: ROADMAP full-width, ngay dưới topbar ══ -->
      <div class="dash-row-roadmap">
        <div class="section-card mini-rm-card mini-rm-card--full">
          <div class="mini-rm-header">
            <div class="section-title" style="margin-bottom:0">
              <span class="title-icon-blue">🗺</span><span>Lộ trình của bạn</span>
            </div>
            <a class="mini-rm-more" href="#" onclick="navigate('roadmap');return false;">Xem tất cả →</a>
          </div>
          <div class="mini-rm-canvas" id="mini-rm-canvas" tabindex="0">
            <div class="mini-rm-loading">Đang tải lộ trình…</div>
          </div>
          <div class="mini-rm-legend">
            <span class="lb-legend-item"><span class="lb-legend-dot lb-done">✓</span> Hoàn thành</span>
            <span class="lb-legend-item"><span class="lb-legend-dot lb-progress">◐</span> Đang học</span>
            <span class="lb-legend-item"><span class="lb-legend-dot lb-locked">○</span> Mở khoá</span>
          </div>
        </div>
      </div>

      <!-- ══ HÀNG 2: WELCOME (1/2) + STATS (1/2) ══ -->
      <div class="dash-row-welcome">
        <div class="welcome-banner welcome-banner--slim">
          <div class="banner-dots"></div>
          <div class="banner-inner">
            <div class="banner-text">
              <span class="greeting" id="banner-greeting">Chào mừng trở lại! 👋</span>
              <h2 id="banner-name">—</h2>
            </div>
            <div class="banner-code">&lt;/&gt;</div>
          </div>
        </div>

        <div class="stats-grid" id="stats-grid">
          <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
          <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
          <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
          <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
        </div>
      </div>

      <!-- ══ HÀNG 3: CALENDAR + BXH ══ -->
      <div class="dash-grid">

        <!-- ── TRÁI: lịch học ── -->
        <div class="dash-col-left">
          <div class="section-card study-cal-card">
            <div class="study-cal-header">
              <div class="section-title" style="margin-bottom:0"><span class="title-icon-blue">📅</span><span>Lịch học tuần này</span></div>
              <div class="study-cal-streak" id="cal-streak-badge">
                <span class="cal-fire">🔥</span>
                <span class="cal-streak-num" id="cal-streak-num">0</span>
                <span class="cal-streak-lbl">ngày streak</span>
              </div>
            </div>
            <div class="study-cal-grid" id="study-cal-grid">
              <div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div><div class="skel-cal-day skel"></div>
            </div>
            <div class="study-cal-legend">
              <span class="cal-legend-item"><span class="cal-legend-dot cal-done">✓</span> Đã học</span>
              <span class="cal-legend-item"><span class="cal-legend-dot cal-todo">○</span> Chưa học</span>
              <span class="cal-legend-item"><span class="cal-legend-dot cal-today-dot"></span> Hôm nay</span>
            </div>
          </div>
          <div class="cal-tooltip" id="cal-tooltip"></div>
        </div>

        <!-- ── PHẢI: BXH ── -->
        <div class="dash-col-right">
          <div class="section-card lb-card">
            <div class="lb-header">
              <div class="section-title" style="margin-bottom:0">
                <span class="title-icon-blue">🏆</span><span>Bảng xếp hạng</span>
              </div>
              <div class="lb-tabs" role="tablist" aria-label="Bảng xếp hạng">
                <button type="button" class="lb-tab active" data-type="weekly"  role="tab" aria-selected="true">⏱ Tuần</button>
                <button type="button" class="lb-tab"        data-type="streak"  role="tab" aria-selected="false">🔥 Streak</button>
                <button type="button" class="lb-tab"        data-type="friends" role="tab" aria-selected="false">👥 Bạn bè</button>
              </div>
            </div>
            <div class="lb-meta" id="lb-meta">Đang tải…</div>
            <ol class="lb-list" id="lb-list" aria-live="polite">
              <li class="lb-skel">Đang tải bảng xếp hạng…</li>
            </ol>
            <div class="lb-me" id="lb-me" hidden></div>
          </div>
        </div>
      </div>
    </div>'''

    new_src = src.replace(old_block, new_block)

    if new_src == src:
        print('[ERR] Replace không có tác dụng — block không match.')
        import sys; sys.exit(1)

    # bump version CSS
    new_src = new_src.replace(
        'href="{{ url_for(\'static\', filename=\'css/dashboard.css\') }}?v=22"',
        'href="{{ url_for(\'static\', filename=\'css/dashboard.css\') }}?v=23"',
    )

    with io.open(HTML, 'w', encoding='utf-8') as f:
        f.write(new_src)
    print('[OK] dashboard.html updated — roadmap on top, welcome+stats 50/50, calendar+BXH below.')


if __name__ == '__main__':
    main()
