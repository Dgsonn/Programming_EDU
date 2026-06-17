#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script thay thế phần #page-dashboard cũ bằng layout 2 cột mới.
Chạy 1 lần từ thư mục gốc project.
"""
import io
import sys

DASHBOARD = r"D:\newcty\Programming_EDU\templates\dashboard.html"

OLD = '''    <!-- ── Dashboard ── -->
    <div class="page active" id="page-dashboard">
      <div class="welcome-banner">
        <div class="banner-dots"></div>
        <div class="banner-inner">
          <div>
            <div class="greeting" id="banner-greeting">Chào mừng trở lại! 👋</div>
            <h2 id="banner-name">—</h2>
            <p>Hôm nay bạn sẽ học gì? Tiếp tục hành trình lập trình nhé!</p>
          </div>
          <div class="banner-code">&lt;/&gt;</div>
        </div>
      </div>

      <div class="stats-grid" id="stats-grid">
        <!-- Skeleton: replaced by JS when stats load -->
        <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
        <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
        <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
        <div class="skel-stat"><div class="skel-stat-icon skel"></div><div class="skel-stat-lines"><div class="skel-stat-val skel"></div><div class="skel-stat-lbl skel"></div></div></div>
      </div>

      <div class="section-card">
        <div class="section-title"><span class="title-icon-blue">📈</span><span>Tiến độ học tập</span></div>
        <div class="progress-grid" id="progress-grid">
          <!-- Skeleton -->
          <div class="skel-progress-row"><div class="skel-progress-icon skel"></div><div class="skel-progress-body"><div class="skel-progress-name skel"></div><div class="skel-progress-bar skel"></div></div></div>
          <div class="skel-progress-row"><div class="skel-progress-icon skel"></div><div class="skel-progress-body"><div class="skel-progress-name skel"></div><div class="skel-progress-bar skel"></div></div></div>
        </div>
      </div>

      <!-- ── Lịch học tuần ── -->
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

      <!-- Tooltip lịch học -->
      <div class="cal-tooltip" id="cal-tooltip"></div>

      <div class="courses-header">
        <h2>Khóa học của tôi</h2>
        <button class="filter-btn active btn-small" onclick="navigate('courses')">Khám phá thêm →</button>
      </div>
      <div class="courses-search-bar-wrap" id="dash-search-wrap">
        <span class="csb-icon">🔍</span>
        <input type="text" id="dash-search-input" class="courses-search-bar-input"
          placeholder="Tìm trong khóa học của tôi..."
          autocomplete="off" oninput="dashSearch(this.value)" />
        <button class="csb-clear" id="dash-search-clear" type="button"
          style="display:none" onclick="dashClearSearch()">✕</button>
      </div>
      <div id="enrolled-list">
        <!-- Skeleton -->
        <div class="skel-enrolled"><div class="skel-enrolled-top"><div class="skel-enrolled-icon skel"></div><div class="skel-enrolled-lines"><div class="skel-enrolled-title skel"></div><div class="skel-enrolled-sub skel"></div></div></div><div class="skel-enrolled-bar skel"></div></div>
        <div class="skel-enrolled"><div class="skel-enrolled-top"><div class="skel-enrolled-icon skel"></div><div class="skel-enrolled-lines"><div class="skel-enrolled-title skel"></div><div class="skel-enrolled-sub skel"></div></div></div><div class="skel-enrolled-bar skel"></div></div>
      </div>
      <div id="dash-search-empty" style="display:none;text-align:center;padding:32px 0;color:#9CA3AF;font-size:14px;">Không tìm thấy khóa học nào khớp với từ khoá.</div>
    </div>'''

NEW = '''    <!-- ── Dashboard ── -->
    <div class="page active" id="page-dashboard">

      <!-- ══ HÀNG TRÊN: welcome + stats ══ -->
      <div class="dash-top">
        <div class="welcome-banner welcome-banner--compact">
          <div class="banner-dots"></div>
          <div class="banner-inner">
            <div>
              <div class="greeting" id="banner-greeting">Chào mừng trở lại! 👋</div>
              <h2 id="banner-name">—</h2>
              <p>Hôm nay bạn sẽ học gì? Tiếp tục hành trình lập trình nhé!</p>
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

      <!-- ══ HÀNG DƯỚI: 2 CỘT ══ -->
      <div class="dash-grid">

        <!-- ── TRÁI 2/3: lịch học + BXH ── -->
        <div class="dash-col-left">

          <!-- Lịch học tuần -->
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

          <!-- Bảng xếp hạng -->
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

        <!-- ── PHẢI 1/3: mini roadmap canvas ── -->
        <div class="dash-col-right">
          <div class="section-card mini-rm-card">
            <div class="mini-rm-header">
              <div class="section-title" style="margin-bottom:0">
                <span class="title-icon-blue">🗺</span><span>Lộ trình của bạn</span>
              </div>
              <a class="mini-rm-more" href="#" onclick="navigate(\\'roadmap\\');return false;">Xem tất cả →</a>
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
      </div>
    </div>'''


def main():
    # đọc bằng utf-8 để tránh hỏng CJK + escape
    with io.open(DASHBOARD, 'r', encoding='utf-8') as f:
        src = f.read()

    if OLD not in src:
        print('[ERR] Không tìm thấy block cũ. Có thể file đã được sửa trước đó.')
        sys.exit(1)

    if src.count(OLD) != 1:
        print(f'[ERR] Block cũ xuất hiện {src.count(OLD)} lần, cần thu hẹp oldString.')
        sys.exit(1)

    new_src = src.replace(OLD, NEW)

    # bump version CSS dashboard để tránh cache
    new_src = new_src.replace(
        'static/css/dashboard.css') + '?v=18" />' if False else new_src
    new_src = new_src.replace(
        'href="{{ url_for(\'static\', filename=\'css/dashboard.css\') }}?v=18"',
        'href="{{ url_for(\'static\', filename=\'css/dashboard.css\') }}?v=19"',
    )
    new_src = new_src.replace(
        'href="{{ url_for(\'static\', filename=\'js/dashboard.js\') }}?v=1"',
        'href="{{ url_for(\'static\', filename=\'js/dashboard.js\') }}?v=2"',
    )

    with io.open(DASHBOARD, 'w', encoding='utf-8') as f:
        f.write(new_src)
    print('[OK] dashboard.html updated.')


if __name__ == '__main__':
    main()
