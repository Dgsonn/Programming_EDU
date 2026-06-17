#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Append các style mới cho layout dashboard 2 cột vào dashboard.css."""
import io

CSS = r"D:\newcty\Programming_EDU\static\css\dashboard.css"

APPEND = r'''
/* ════════════════════════════════════════════════════════════
   ★ DASHBOARD REDESIGN — 2-COLUMN LAYOUT
   ════════════════════════════════════════════════════════════ */

/* ── Top: welcome banner + stats ── */
.dash-top {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 22px;
}
.welcome-banner--compact { margin-bottom: 0; padding: 18px 22px; }
.welcome-banner--compact .banner-inner h2 { font-size: 20px; }
.welcome-banner--compact .banner-code { font-size: 56px; }

/* ── Two-column grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}
.dash-col-left,
.dash-col-right { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.dash-col-left > .study-cal-card { margin-bottom: 0; }
.dash-col-left > .cal-tooltip { display: none; }   /* tooltip render ra ngoài, không cần khác */

/* ── Responsive: < 1024px thì 1 cột ── */
@media (max-width: 1024px) {
  .dash-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .welcome-banner--compact { padding: 14px 16px; }
  .welcome-banner--compact .banner-inner h2 { font-size: 18px; }
  .welcome-banner--compact .banner-code { display: none; }
}

/* ════════════════════════════════════════════════════════════
   ★ BẢNG XẾP HẠNG (Leaderboard)
   ════════════════════════════════════════════════════════════ */
.lb-card { padding: 18px 22px 16px; }

.lb-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
}

.lb-tabs {
  display: inline-flex; gap: 4px;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
}
body.dark .lb-tabs { background: #0F172A; border-color: #334155; }

.lb-tab {
  border: none; background: transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px; font-weight: 600;
  color: #6B7280; cursor: pointer;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
}
.lb-tab:hover { color: #1F2937; }
.lb-tab.active {
  background: #fff;
  color: #2D7FC1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}
body.dark .lb-tab { color: #94A3B8; }
body.dark .lb-tab:hover { color: #E2E8F0; }
body.dark .lb-tab.active {
  background: #1E293B;
  color: #38BDF8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.lb-meta {
  font-size: 12px; color: #94A3B8;
  margin: 4px 0 10px; font-weight: 500;
}
body.dark .lb-meta { color: #64748B; }

.lb-list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 4px;
}
.lb-skel {
  padding: 12px; text-align: center; color: #9CA3AF; font-size: 13px;
}

.lb-row {
  display: grid;
  grid-template-columns: 36px 36px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s;
}
.lb-row:hover { background: #F8FAFC; }
body.dark .lb-row:hover { background: #1E293B; }

.lb-row.lb-row-me {
  background: linear-gradient(90deg, #EFF6FF, #F0F9FF);
  border: 1px solid #BFDBFE;
  margin-top: 4px;
}
body.dark .lb-row.lb-row-me {
  background: linear-gradient(90deg, rgba(56,189,248,0.08), rgba(56,189,248,0.04));
  border-color: rgba(56,189,248,0.3);
}

.lb-rank {
  text-align: center;
  font-size: 13px; font-weight: 700;
  color: #9CA3AF;
  font-variant-numeric: tabular-nums;
}
.lb-row.lb-top1 .lb-rank { color: #F59E0B; font-size: 18px; }
.lb-row.lb-top2 .lb-rank { color: #94A3B8; font-size: 18px; }
.lb-row.lb-top3 .lb-rank { color: #B45309; font-size: 18px; }
.lb-rank-text { display: none; }
.lb-row.lb-top1 .lb-rank-num,
.lb-row.lb-top2 .lb-rank-num,
.lb-row.lb-top3 .lb-rank-num { display: none; }
.lb-row.lb-top1 .lb-rank-text,
.lb-row.lb-top2 .lb-rank-text,
.lb-row.lb-top3 .lb-rank-text { display: inline; }

.lb-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
body.dark .lb-avatar { background: #1E293B; }

.lb-info { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lb-name {
  font-size: 13px; font-weight: 600; color: #1F2937;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lb-row.lb-row-me .lb-name { color: #2D7FC1; }
body.dark .lb-name { color: #E2E8F0; }
.lb-sub { font-size: 10px; color: #9CA3AF; }
body.dark .lb-sub { color: #64748B; }

.lb-value {
  font-size: 13px; font-weight: 700; color: #374151;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.lb-row.lb-top1 .lb-value { color: #D97706; }
.lb-row.lb-top2 .lb-value { color: #475569; }
.lb-row.lb-top3 .lb-value { color: #92400E; }
.lb-row.lb-row-me .lb-value { color: #2D7FC1; }
body.dark .lb-value { color: #CBD5E1; }

.lb-me {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #E5E7EB;
}
body.dark .lb-me { border-top-color: #334155; }
.lb-me-label {
  font-size: 10px; font-weight: 700; color: #94A3B8;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin: 6px 0 4px;
}
body.dark .lb-me-label { color: #64748B; }

/* ════════════════════════════════════════════════════════════
   ★ MINI ROADMAP CANVAS (cột phải dashboard)
   ════════════════════════════════════════════════════════════ */
.mini-rm-card { padding: 18px 20px 16px; }
.mini-rm-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 12px; flex-wrap: wrap;
}
.mini-rm-more {
  font-size: 12px; color: #2D7FC1; text-decoration: none; font-weight: 600;
  transition: color 0.15s;
}
.mini-rm-more:hover { color: #1D4ED8; text-decoration: underline; }
body.dark .mini-rm-more { color: #38BDF8; }
body.dark .mini-rm-more:hover { color: #7DD3FC; }

.mini-rm-canvas {
  position: relative;
  width: 100%;
  height: 420px;
  overflow: hidden;
  background: #F8FAFC;
  background-image: radial-gradient(circle, #CBD5E1 1.2px, transparent 1.2px);
  background-size: 20px 20px;
  border-radius: 14px;
  border: 1.5px solid #E5E7EB;
}
body.dark .mini-rm-canvas {
  background-color: #0F172A;
  background-image: radial-gradient(circle, rgba(51,65,85,0.7) 1.2px, transparent 1.2px);
  border-color: #1E293B;
}
.mini-rm-loading {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: #94A3B8; font-weight: 500;
}

.mini-rm-arrows {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: visible;
}
.mini-rm-arrow {
  fill: none;
  stroke: #94A3B8;
  stroke-width: 2;
  stroke-dasharray: 5 4;
  stroke-linecap: round;
}
body.dark .mini-rm-arrow { stroke: #475569; }
.mini-rm-arrow--solid { stroke-dasharray: none; }

.mini-rm-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px 8px 8px;
  border-radius: 999px;
  background: #fff;
  border: 1.5px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  user-select: none;
  white-space: nowrap;
  max-width: 92%;
}
.mini-rm-node:hover {
  transform: translate(-50%, -50%) translateY(-2px) scale(1.04);
  box-shadow: 0 6px 18px rgba(74, 158, 224, 0.22);
  border-color: #4A9EE0;
  z-index: 2;
}
body.dark .mini-rm-node {
  background: #1E293B;
  border-color: #334155;
  color: #E2E8F0;
}

.mini-rm-node--done {
  background: linear-gradient(135deg, #ECFDF5, #F0FDF4);
  border-color: #6EE7B7;
}
.mini-rm-node--done .mini-rm-node-icon { background: #10B981; color: #fff; }
body.dark .mini-rm-node--done {
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
  border-color: rgba(16,185,129,0.4);
}

.mini-rm-node--current {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border-color: #4A9EE0;
  box-shadow: 0 4px 14px rgba(74, 158, 224, 0.25);
}
.mini-rm-node--current .mini-rm-node-icon { background: #4A9EE0; color: #fff; }
body.dark .mini-rm-node--current {
  background: linear-gradient(135deg, rgba(74,158,224,0.15), rgba(74,158,224,0.05));
  border-color: #38BDF8;
}

.mini-rm-node--locked { opacity: 0.55; }
.mini-rm-node--locked .mini-rm-node-icon { background: #E5E7EB; color: #9CA3AF; }

.mini-rm-node-icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.mini-rm-node-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.mini-rm-node-title {
  font-size: 12px; font-weight: 700; color: #1F2937;
  max-width: 130px; overflow: hidden; text-overflow: ellipsis;
}
body.dark .mini-rm-node-title { color: #E2E8F0; }
.mini-rm-node-sub {
  font-size: 10px; color: #94A3B8; font-weight: 500;
}
body.dark .mini-rm-node-sub { color: #64748B; }

.mini-rm-legend {
  display: flex; align-items: center; gap: 14px;
  margin-top: 12px; flex-wrap: wrap;
}
.lb-legend-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; color: #6B7280;
}
body.dark .lb-legend-item { color: #94A3B8; }
.lb-legend-dot {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  font-size: 10px; font-weight: 700;
  flex-shrink: 0;
}
.lb-legend-dot.lb-done {
  background: #10B981; color: #fff;
}
.lb-legend-dot.lb-progress {
  background: #4A9EE0; color: #fff;
}
.lb-legend-dot.lb-locked {
  background: #F3F4F6; color: #9CA3AF; border: 1.5px solid #E5E7EB;
}
body.dark .lb-legend-dot.lb-locked { background: #1E293B; border-color: #334155; }

.mini-rm-empty {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 24px;
  color: #94A3B8;
  font-size: 12px; gap: 8px;
}
.mini-rm-empty-icon { font-size: 36px; opacity: 0.6; }
.mini-rm-empty-cta {
  margin-top: 4px;
  padding: 6px 14px; border-radius: 8px;
  background: #4A9EE0; color: #fff;
  border: none; font-weight: 600; cursor: pointer;
  font-size: 12px; text-decoration: none;
}

/* ── Mini canvas mobile: thấp hơn ── */
@media (max-width: 600px) {
  .mini-rm-canvas { height: 320px; }
  .mini-rm-node { padding: 6px 10px 6px 6px; }
  .mini-rm-node-icon { width: 24px; height: 24px; font-size: 12px; }
  .mini-rm-node-title { font-size: 11px; max-width: 110px; }
}
'''


def main():
    with io.open(CSS, 'r', encoding='utf-8') as f:
        src = f.read()

    if 'DASHBOARD REDESIGN' in src:
        print('[SKIP] CSS đã có block redesign.')
        return

    with io.open(CSS, 'w', encoding='utf-8') as f:
        f.write(src)
        if not src.endswith('\n'):
            f.write('\n')
        f.write(APPEND)
    print('[OK] dashboard.css updated.')


if __name__ == '__main__':
    main()
