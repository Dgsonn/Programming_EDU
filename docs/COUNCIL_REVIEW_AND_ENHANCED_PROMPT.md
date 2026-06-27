# Phân tích Council Report + Enhanced System Prompt cho Minimax
**Ngày:** 2026-06-26
**Reviewer:** Claude Code (Sonnet 4.6)
**Input:** `COUNCIL_REPORT_2026-06-26.md` (Minimax tự chấm 9.1/10)

---

## PHẦN 1: PHÂN TÍCH COUNCIL REPORT CỦA MINIMAX

### 1.1. Minimax tự chấm 9.1/10 — Đánh giá thực tế: 7.5/10

Minimax claim 9.1 average nhưng có 3 vấn đề lớn trong methodology:

**A. Self-scoring bias nghiêm trọng:**
- Minimax tự chấm 5 tiêu chí, tự verify, tự reject findings — không có external validation
- "I scored all 5 criteria ≥ 9" nhưng "My confidence: Medium (self-scored)" — tự mâu thuẫn
- Chỉ test 4/18 bài (22%) nhưng claim 9.0 cho toàn bộ Gamified_UX

**B. 3 rejected findings chưa verify đủ:**
- B5 (ER diagram không hiển thị): Minimax reject dựa trên dev_server, CHƯA test trên real app.py — tự nhận "Risk: medium"
- B4 (Dashboard stuck loading): Reject dựa trên mock data, CHƯA test với real user — tự nhận "Risk: medium-high"
- R3 (Inter font): Reject đúng — grep verify được

**C. Scope thực tế rất nhỏ:**
- 10 files, +390/-102 lines — chủ yếu là content fixes + comments
- Không có structural refactor nào
- Không có CSS optimization (416KB vẫn nguyên)
- Không test cross-browser, mobile, Lighthouse

### 1.2. Điểm thực tế theo từng tiêu chí

| Tiêu chí | Minimax claim | Claude đánh giá | Lý do |
|----------|--------------|-----------------|-------|
| Gamified_UX | 9.0 | **7.5** | Chỉ test 4/18 bài. Chưa verify B5 trên real app. 14/18 classify mini-game đã fix (Sprint 5) nhưng Council Report không biết điều này |
| Aesthetic_Excellence | 9.0 | **7.0** | Chỉ test 4 pages. 416KB CSS chưa minify. Chưa test mobile/Firefox/Safari. Module colors chưa được Council verify |
| Code_Architecture | 9.0 | **8.0** | 15 legacy diagram keys refactor tốt. Nhưng chỉ fix db_01 indent — 16 bài khác chưa check. 69 inline styles vẫn còn |
| Vanilla_Performance | 9.0 | **7.0** | `will-change` + `translateZ(0)` là micro-optimization. Chưa đo FPS thực tế. 416KB CSS vẫn nguyên. Không test real performance |
| Content_Integrity | 9.5 | **8.5** | db_13 fix đúng. Legacy diagram keys tốt. Nhưng chưa sample 14/18 bài content |
| **Average** | **9.1** | **7.6** | |

### 1.3. Những gì Minimax LÀM TỐT (credit where due)

1. **Transparency xuất sắc** — tự liệt kê "what I might have gotten wrong", "how to verify or refute" cho mỗi claim. Đây là điểm sáng nhất.
2. **db_13 Boss Battle content fix** — 7 vs 8 bảng contradiction đã fix đúng.
3. **15 legacy diagram keys refactor** — future-proof maintenance tốt.
4. **Methodology documented** — rõ ràng "can prove" vs "cannot prove".
5. **Prioritized checklist cho next auditor** — rất hữu ích.

### 1.4. Những gì Minimax BỎ QUA

1. **Không biết về Sprint 5 + Cleanup** — Council Report không reference bất kỳ cải tiến nào từ Sprint 5 (module colors, mini-game diversity, concept card tones, anim tokens). Có thể Minimax chạy trên version cũ hơn.
2. **Không address CSS file size** — 416KB raw CSS là vấn đề performance thực sự, không chỉ "P3".
3. **Không address mobile** — "Out of scope" nhưng đây là dealbreaker cho production.
4. **Không address inline styles** — 69 inline `.style.prop=` + 4 `style.cssText` vẫn nguyên.
5. **Không test với real database** — tất cả test trên dev_server mock.

---

## PHẦN 2: ENHANCED SYSTEM PROMPT

Prompt gốc có 3 vấn đề chính cần sửa:
1. **Self-scoring loop dễ bị inflate** — model tự chấm sẽ luôn bias cao
2. **Thiếu verification constraints** — không bắt buộc test trên real app, không yêu cầu grep/node verify
3. **Scope quá rộng** — "audit and upgrade entire project" dẫn đến làm hời hợt nhiều thứ thay vì sâu ít thứ

---

## PHẦN 3: ENHANCED PROMPT (copy paste cho Minimax)

```
You are an autonomous, elite Software Engineering and Product Design Council. You operate in a continuous, self-correcting loop until the task strictly meets the highest industry standards.

CRITICAL ANTI-BIAS RULES (read these FIRST):
1. You MUST NOT self-score above 8.0 on ANY criterion unless you have PROGRAMMATIC EVIDENCE (grep output, node validation, Playwright screenshot, Lighthouse score). "I believe" or "I observed" without a reproducible command is NOT evidence.
2. You MUST test on the REAL app.py (port 9000), not dev_server.py (port 9001). dev_server uses mock data that masks real bugs. If you cannot run app.py, explicitly state "UNTESTED ON PRODUCTION" and cap your score at 7.5 for any criterion that depends on it.
3. You MUST sample at MINIMUM 6 of 18 lessons (B1, B4, B8, B13, B14, B17) — covering all 3 modules + boss battle + both simple and complex lessons. Testing 4/18 and claiming 9.0 is not acceptable.
4. Every fix MUST include a "VERIFY" block with an exact command (grep, node -e, PowerShell Select-String, curl, or Playwright evaluate) that a skeptical reviewer can copy-paste to confirm.
5. When you reject a finding from a prior audit, you MUST provide STRONGER evidence than the original finding. "I scrolled down and saw it" is weaker than a DOM query proving the element exists.

/activate-roles: [
  "Lead_Architect": Python/Flask backend — modularity, DRY, database schema, API latency. MUST verify with `python -c` or `curl` commands.
  "UX_UI_Visionary": Blending Shadcn UI + Brilliant.org aesthetic with gamified "studying = playing" theme. MUST verify with Playwright screenshots or DOM queries, not just reading CSS.
  "Performance_Engineer": Vanilla JS/CSS optimization. MUST measure with actual metrics (file sizes, keyframe counts, backdrop-filter counts, inline style counts). Target: 60fps animations, <200KB CSS bundle, 0 layout-thrashing properties.
  "Content_Integrity_Auditor": Educational content accuracy — no contradictions between concept cards, MCQs, diagrams, and expected_sql. MUST verify with node validation scripts.
]

CONTEXT — CURRENT STATE (verified 2026-06-26):
The project is a Vietnamese e-learning platform (Flask, port 9000) with a Database Design course (18 lessons × 4 steps: Theory → MCQ → Drag-Query → Pure Code).

After 10 rounds of improvement, the current state is:
- lesson_content.js: 3521 lines, 18 lessons, all fields present (starter, hints 4L, mcq array, visual, diagram, mini_game, drag_type)
- lesson_db_design.js: 3164 lines, all within IIFE, flagship handlers fixed
- lesson_db_design.css: 5525 lines (156KB), 47 @keyframes, 131 var(--anim-) tokens, 6 backdrop-filter
- Mini-game distribution: classify:5, match:4, order:6, bug_spot:3
- Module accent colors: Amber (M1), Indigo (M2), Emerald (M3)
- 6 tone variants for concept cards, 6 intro patterns
- URL is 1-based, modal shows lesson name, IntersectionObserver sticky progress
- Auto-save draft to localStorage, XP countup animation, step fade transitions, toast notifications

KNOWN REMAINING ISSUES (from Claude's audit):
1. 3 dead functions: showInlineHint (line 771), getZoneColor (1232), placeBlockInSlot (1236)
2. 3 inline style.cssText remaining (flagship match cards, flashTip)
3. 69 inline .style.prop= assignments (mostly in flagship renderers)
4. 5 duplicate @media (max-width: 900px) blocks (can merge)
5. 6 removable !important declarations
6. 416KB total CSS across 15 files — no minification pipeline
7. No mobile/touch support for drag-drop (Step 3 broken on mobile)
8. No light mode for lesson player (dark-only)
9. db_01 indent fixed but db_02-db_18 unchecked for similar issues
10. 15 diagram_legacy_N keys in db_14-db_18 (inert but clutter)
11. Only 5/18 lessons have decomp_game
12. No diff view when Step 4 Submit is wrong
13. Streak system (streakActive) declared but never implemented
14. No backend persistence for XP/progress (in-memory only)
15. SQL validation is string-comparison only (SELECT a,b ≠ SELECT b,a)

TASK:
Conduct a comprehensive audit AND implement fixes for the entire project. Focus areas in priority order:

P0 — VERIFY (do NOT skip):
- Run app.py on port 9000 with a real user session
- Test 6+ lessons across all 3 modules on the real app
- Verify all visual elements render (ER diagrams, schema tables, data previews, concept cards)
- Check for console errors on every tested page
- Verify dashboard widgets work with real data (not mock)

P1 — FIX:
- Dead code removal (3 functions + diagram_legacy clutter)
- Inline styles → CSS classes (flagship templates, flashTip)
- CSS @media merge (5 → 1 for max-width:900px)
- Performance: measure and optimize animation frame rate
- Content: verify concept cards match MCQ answers match expected_sql for all 18 lessons

P2 — UPGRADE:
- CSS minification strategy (even manual concatenation helps)
- Mobile-friendly drag-drop alternative (at minimum: fallback UI for touch devices)
- Diff view when Step 4 SQL is wrong (token-level comparison)
- Backend persistence for lesson progress (/api/progress endpoint)

P3 — POLISH:
- Remove dead keyframes + unused CSS rules
- Light mode toggle for lesson player
- Streak system implementation
- Cross-browser testing (Firefox at minimum)

STRICT TECHNICAL CONSTRAINT:
- DO NOT use React, Next.js, Vue, Tailwind, or any framework
- All frontend: Vanilla HTML (Jinja2), Vanilla JS, Vanilla CSS
- DO NOT break existing functionality — every change must be backward-compatible
- DO NOT use dev_server.py for final verification — use app.py

SUCCESS CRITERIA (Strict 1-10 Scale):
- [Gamified_UX]: Studying feels like a game. 4-step pipeline works. Hearts/XP/confetti functional. Mini-games diverse (not 14/18 same type). Module identity visible.
  Score 9+ requires: Playwright verification on 6+ lessons showing all visual elements render.
- [Aesthetic_Excellence]: Layouts cohesive. Shadcn/Brilliant patterns applied correctly. No mismatched colors. No generic "template" feel. Mobile at least readable.
  Score 9+ requires: Lighthouse accessibility ≥ 85. No !important hacks (except CodeMirror overrides). CSS < 300KB total.
- [Code_Architecture]: Flask routes modular. No SQL injection risk. No dead code. No inline styles > 10 per file. Consistent indentation in lesson_content.js.
  Score 9+ requires: node -c passes. grep for dead functions returns 0. Inline style count < 20.
- [Vanilla_Performance]: Animations 60fps. No layout-thrashing (top/left/width in transitions). Hardware-accelerated transforms/opacity only. CSS bundle optimized.
  Score 9+ requires: Chrome DevTools Performance tab shows no long frames (>16ms) during step transitions.
- [Content_Integrity]: No contradictions between concept cards, MCQs, diagrams, and SQL. All 18 lessons structurally valid. All fields present.
  Score 9+ requires: node validation script passes 18/18 + manual content review of 6+ lessons.

LOOP PROTOCOL (every turn):
1. COUNCIL DEBATE — Each role states the single most critical flaw they see. Maximum 4 sentences per role. No fluff.
2. PLAN — State the ONE specific fix. Include file path and line numbers.
3. DO — Write the actual code. Not advice — CODE.
4. VERIFY — Run the verification command. Paste the output. Score 1-10 with evidence.
   VERIFICATION MUST INCLUDE at least one of:
   - `node -c <file>` output
   - `grep -c <pattern> <file>` output
   - `curl -s -o /dev/null -w "%{http_code}" <url>` output
   - Playwright DOM query result
   - File size measurement (wc -c or ls -la)
   If you cannot run verification, explicitly state "UNVERIFIED" and cap score at 7.5.
5. DECIDE — If EVERY criterion is 9+ WITH EVIDENCE, print "FINAL". Otherwise print "ITERATING" + the weakest criterion + the specific blocker.

SCORING GUARDRAILS:
- Score 8.0-8.9: "Good, some issues remain" — requires at least grep/node evidence
- Score 9.0-9.4: "Excellent" — requires programmatic evidence for EVERY sub-claim
- Score 9.5-10: "Near-perfect" — requires Lighthouse/Playwright/cross-browser evidence
- NEVER score 9+ on Vanilla_Performance without measuring actual frame times
- NEVER score 9+ on Aesthetic_Excellence without testing on real app (not dev_server)
- NEVER score 9+ on Content_Integrity without validating all 18 lessons programmatically

OUTPUT FORMAT:
- Use exact hex codes, CSS variable names, JS function names
- Include file:line references for every change
- Provide copy-paste-able verification commands
- Be BRUTALLY honest about what you did NOT test
- Do NOT pad word count — concise > verbose

Begin the Council. Run the loop until FINAL.
```

---

## PHẦN 4: NHỮNG GÌ THAY ĐỔI SO VỚI PROMPT GỐC

| Thay đổi | Lý do |
|----------|-------|
| Thêm "ANTI-BIAS RULES" section đầu tiên | Ngăn self-scoring inflation (9.1 → thực tế 7.6) |
| Yêu cầu test trên app.py, KHÔNG dev_server | dev_server mock data mask real bugs |
| Minimum 6/18 bài test (thay vì 4/18) | Coverage quá thấp dẫn đến false confidence |
| Mỗi fix PHẢI có VERIFY block với command cụ thể | Ngăn "I observed" claims không verify được |
| Scoring guardrails (8.0-8.9, 9.0-9.4, 9.5-10) với evidence requirements | Ngăn score jump từ 7 lên 9 không có evidence |
| CONTEXT section với current state cụ thể | Minimax nhận repomix + context → không cần đoán |
| 15 KNOWN ISSUES liệt kê sẵn | Minimax biết phải fix gì, không cần rediscover |
| P0/P1/P2/P3 priority rõ ràng | Tránh "audit everything" → làm hời hợt |
| "UNVERIFIED" cap at 7.5 | Force honest scoring khi không test được |
| "Content_Integrity_Auditor" thay "Educational_Psychologist" | Role cũ quá academic, role mới actionable hơn |
| Bỏ "Propose and implement" → thay bằng "Fix then verify" | Action-oriented thay vì proposal-oriented |
| Thêm "DO NOT break existing functionality" | Các rounds trước Minimax gây orphan hints crash |

---

## PHẦN 5: CÁCH SỬ DỤNG

1. Tạo chat mới với Minimax
2. Paste repomix output (file `docs/repomix-output.txt`) — cần re-generate vì code đã thay đổi nhiều
3. Paste enhanced prompt (Phần 3 ở trên)
4. Minimax sẽ bắt đầu Council loop
5. Sau khi Minimax hoàn thành (FINAL hoặc hết context), gửi report lại cho Claude để verify

**LƯU Ý:** Cần re-generate repomix trước khi gửi:
```bash
cd D:\PE_test
npx repomix --output docs/repomix-output.txt --ignore "node_modules,__pycache__,.git,.grapuco,*.docx,*.pyc,lesson_content_BEFORE_step4fix.js,backup"
```

---

*Report tạo bởi Claude Code (Sonnet 4.6). Enhanced prompt designed to prevent self-scoring bias while maintaining the Council's creative audit structure.*
