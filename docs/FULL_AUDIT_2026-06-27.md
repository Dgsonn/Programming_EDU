# Full Audit — Toàn bộ hành trình Minimax (2026-06-21 → 2026-06-27)
**Reviewer:** Claude Code (Sonnet 4.6)
**Method:** Grapuco re-sync + code metrics + reference site comparison
**Verified:** 2026-06-27 08:00

---

## 1. HÀNH TRÌNH TỔNG KẾT

| Giai đoạn | Tasks | Thời gian | Impact chính |
|-----------|-------|-----------|-------------|
| Sprint 1-5 (Round 1-4) | Content 18 bài, mini-game diversity, concept cards, module colors | 6/21 | Foundation: 18 lessons playable |
| Cleanup (3 rounds) | Token migration, inline styles, CSS dead code, !important | 6/21 | Code quality: CSS -15KB, inline 57→20 |
| Phase 1-2 (Council) | Design tokens, token application, card-highlight, btn classes | 6/26 | Consistency: 550+ token refs |
| B1-B7 | Re-migration, inline cleanup, !important, Playwright verify, content fixes, mobile | 6/27 | Quality gate: all P1 targets met |
| C1-C8 | Wrong-answer, roadmap, step animations, course detail, celebrations, MCQ variants, card variants, progressive disclosure | 6/27 | UX features: Brilliant-level variety |

**Tổng:** ~40+ tasks hoàn thành trong 1 mega-session liên tục.

---

## 2. METRICS HIỆN TẠI (verified)

```
=== LESSON PLAYER ===
lesson_db_design.css: 159,451 bytes (cap 165,000, headroom 5,549)
lesson_db_design.js:  152,070 bytes
lesson_content.js:    281,812 bytes

Brace balance: 0 ✓
Inline .style.prop=: 26 (target ≤20 — VƯỢT 6, regression từ C3/C4/C6/C7)
style.cssText: 1 ✓ (sentinel)
classList: 162
!important: 13 (target ≤12 — VƯỢT 1, từ C6/C7 reduced-motion)
backdrop-filter: 6 ✓ (cap 6)
@keyframes: 62

Token adoption:
  var(--space-): 213
  var(--surface-): 48
  var(--dur-): 19
  var(--text-): 196

Content:
  18/18 lessons PASS (all fields present)
  144/144 MCQ explanations
  Mini-game: classify:5, match:4, order:6, bug_spot:3
  Card variants: auto:32, quote:2, interactive:2
  MCQ formats: code:12, diagram:5

=== COURSE PAGE ===
course_db_design.css: 35,906 bytes
course_db_design.js: 20,382 bytes
```

---

## 3. SO SÁNH VỚI REFERENCE PLATFORMS

### vs Brilliant.org

| Pattern | Brilliant | PE_test | Gap |
|---------|-----------|---------|-----|
| Wrong-answer exploration | Interactive "explore why wrong" | ✅ Tooltip wrong-why + correct-hint (144/144) | Brilliant: richer (interactive elements). PE_test: text-only tooltip |
| Celebration variety | Rive animations, character reactions, streak | ✅ Confetti + rainbow + sparkle rain + trophy + graduation | Close. Brilliant: character-based. PE_test: particle-based |
| Color-coded learning path | Node-based, color per topic | ✅ Snake roadmap, hex boss, 3-tier progress, module colors | Close match |
| Progressive disclosure | Scroll-triggered within lessons | ✅ C7 IntersectionObserver + stagger | Match |
| Card variety | Multiple card types per lesson | ✅ 4 variants (highlight/default/quote/interactive) | Match |
| MCQ variety | Code snippets, diagrams, interactive | ✅ Code MCQ + Diagram MCQ (5 bài) | Partial — Brilliant has more variety per lesson |
| Step transitions | Unique per screen type | ✅ 4 distinct animations (slide/pop/expand/slide) | Match |
| Streak system | Core gamification | ❌ Declared but NOT implemented | Gap |
| Lesson screen variety | No 2 screens identical | ⚠️ 4-step pipeline is FIXED — same structure every lesson | Fundamental gap |

### vs shadcn/ui

| Pattern | shadcn | PE_test | Status |
|---------|--------|---------|--------|
| Design tokens | Complete system | ✅ space/surface/text/dur/shadow/ease tokens | Match |
| Card variants | 6+ variants | ✅ 4 variants (highlight/default/quote/interactive) | Close |
| Badge system | Multiple types | ✅ Module badges, difficulty badges, skill badges | Match |
| Spacing consistency | 4px grid | ✅ --space-1 through --space-8 (213 usages) | Match |
| Typography scale | Clear hierarchy | ✅ --text-xs through --text-3xl | Match |

### vs Codecademy

| Pattern | Codecademy | PE_test | Status |
|---------|-----------|---------|--------|
| Course cards with metadata | Type + title + time + difficulty | ✅ Hero time, skill badges, prereq indicator | Match |
| Dark theme | Primary dark | ✅ Dark-only (no light toggle) | Partial — no toggle |
| Progress tracking | Hours invested | ✅ Dynamic time estimate (~5h07m) | Match |
| Split-pane IDE | Instructions left, code right | ✅ LeetCode-style Step 4 | Match |

### vs ContentCore

| Pattern | ContentCore | PE_test | Status |
|---------|-----------|---------|--------|
| Clean typography | Generous whitespace, clear hierarchy | ✅ Token-based spacing, text scale | Match |
| Progressive disclosure | Scroll-triggered | ✅ C7 implemented | Match |
| Minimalist design | Nothing cluttered | ⚠️ Step 3 complex (truck + drag + IDE) | Tradeoff — complexity serves pedagogy |

### vs Shaders

| Pattern | Shaders | PE_test | Status |
|---------|---------|---------|--------|
| Aurora gradients | WebGPU-powered | ✅ CSS linear-gradient approximation per module | Approximation OK |
| Glass effects | GPU-composited | ✅ 6 backdrop-filter instances | Budget-limited |
| Glow states | Dynamic glow | ✅ Module accent glow on current roadmap node | Match |

---

## 4. GAPS VÀ VẤN ĐỀ CÒN TỒN TẠI

### 4.1. Code quality regressions

| Metric | Target | After B2 | Hiện tại | Issue |
|--------|--------|----------|----------|-------|
| Inline .style.prop= | ≤20 | 20 ✓ | **26** | +6 regression từ C3/C4/C6/C7 (sparkle particles, DOM manipulation) |
| !important | ≤12 | 6 | **13** | +7 từ C5/C6/C7 reduced-motion overrides |
| var(--surface-) | ≥50 | 50 | **48** | -2 minor regression |

**Nhận xét:** C3-C7 features thêm inline styles cho dynamic DOM (particles, expand toggles). !important tăng nhưng TẤT CẢ đều trong `prefers-reduced-motion` blocks — acceptable theo RULE 5.

### 4.2. Fundamental UX gaps (vs Brilliant)

1. **Streak system chưa implement** — `streakActive` declared in state nhưng 0 logic. Brilliant coi streak là core engagement.
2. **Lesson screen variety** — 4-step pipeline cố định. Brilliant mỗi screen khác nhau. Đây là architectural limitation, không fix được bằng CSS.
3. **Backend persistence** — XP/progress chỉ in-memory + localStorage. Mất khi clear browser data.
4. **Light mode** — Dark-only. Một số learners prefer light.

### 4.3. Technical debt

1. **CSS headroom chỉ còn 5,549 bytes** — thêm feature lớn nào cũng gần hết
2. **62 @keyframes** — nhiều nhưng tất cả đều được dùng (verified qua C1 dead CSS audit)
3. **Horizontal overflow mobile 125px** — B7 Option A là workaround, chưa fix root cause
4. **Chưa bao giờ đo FPS** — claim "60fps" nhưng 0 evidence

---

## 5. SCORING TỔNG KẾT

| Tiêu chí | Trước Minimax (6/21) | Sau tất cả (6/27) | Evidence |
|----------|---------------------|-------------------|---------|
| **Visual_Polish** | 6.0 | **8.5** | 4 card variants, module sub-themes, token adoption 550+, step animations 72/72, roadmap snake |
| **Interaction_Quality** | 3.0 | **8.0** | 8+ micro-interactions, wrong-answer tooltips, celebration variety (sparkle/rainbow/trophy/graduation), progressive disclosure |
| **Platform_Cohesion** | 4.0 | **8.0** | Tokens consistent across lesson + course pages, module colors Amber/Indigo/Emerald, design token system |
| **Learning_Feel** | 3.0 | **8.0** | XP breakdown, wrong-answer exploration 144/144, MCQ code+diagram variants, interactive cards, celebration milestones |
| **Code_Quality** | 6.5 | **7.5** | CSS under cap, brace 0, syntax OK, BUT inline 26>20, !important 13>12 |
| **Average** | **4.5** | **8.0** | |

**KHÔNG claim 9+** vì:
- inline styles regressed (26 > target 20)
- !important regressed (13 > target 12)
- Chưa đo FPS thực tế
- Chưa Lighthouse
- Chưa cross-browser
- Streak chưa implement
- No light mode

---

## 6. ĐỀ XUẤT TIẾP THEO

### Nếu muốn đạt 9.0 average:

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| **P1** | Fix inline regression 26→≤20 | Code_Quality 7.5→8.5 | 30 min |
| **P1** | Fix !important 13→≤12 (merge reduced-motion blocks) | Code_Quality | 15 min |
| **P2** | B11 Streak system implement | Learning_Feel 8→8.5 | 2-3h |
| **P2** | B14 Light mode toggle | Platform_Cohesion 8→8.5 | 3-4h |
| **P2** | B9 FPS measurement | Unlock 9+ on Performance | 1h |
| **P3** | B8 Lighthouse | Unlock 9+ on Accessibility | 1h |
| **P3** | B7 mobile overflow fix (responsive CSS) | Mobile UX | 2-3h |

### Nếu muốn maintain 8.0 và chuyển sang việc khác:
Commit tất cả, merge to main, bắt đầu course mới hoặc feature khác.

---

## 7. NHẬN XÉT CHUNG VỀ MINIMAX

**Productivity:** Exceptional — hoàn thành B1→C7 (16 tasks) trong 1 session liên tục (~6h). Mỗi task có report chi tiết + evidence.

**Tuân thủ rules:** Tốt — không commit, test trên real app, evidence-based scoring, anti-drift protocol followed (chỉ hỏi khi cần user decision).

**Self-scoring:** Trung thực — không claim 9+ khi chưa có evidence. Improvement lớn so với Council Report ban đầu (tự chấm 9.1).

**Weakness:** Code quality regression khi thêm features nhanh — inline styles tăng lại từ 20→26. Cần discipline hơn khi thêm DOM manipulation.

**Overall:** Minimax đã transform project từ "functional but generic" (4.5/10) thành "well-designed with personality" (8.0/10) trong ~2 ngày làm việc. Đây là kết quả tốt.

---

Sources:
- [Brilliant.org x ustwo](https://ustwo.com/work/brilliant/)
- [How Brilliant.org motivates with Rive](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)
- [Brilliant UI Breakdown](https://screensdesign.com/showcase/brilliant-learn-by-doing)
- [shadcn/ui](https://ui.shadcn.com/)
- [Codecademy](https://www.codecademy.com/learn)
