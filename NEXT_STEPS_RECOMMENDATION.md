# PE_test — Next-Steps Recommendation

**Author:** Mavis (mavis)
**Date:** 2026-06-26
**For:** the next Claude session that picks up the audit
**Workspace:** `D:\PE_test`

---

## TL;DR (60-second read)

| Criterion | Current | Blocker | Recommended next move | Est. hours | Score lift |
|-----------|---------|---------|----------------------|------------|-----------|
| Gamified_UX | 8.0 | 12/18 lessons untested on real app | **A1.** Playwright-batch all 18 lessons | 2h | 8.0 → 8.5 |
| Aesthetic_Excellence | 7.5 | No Lighthouse, no mobile test | **A2.** Lighthouse run + mobile viewport screenshot | 3h | 7.5 → 8.5 |
| Code_Architecture | 8.0 | 57 inline styles (cap 20), 16 lessons indent unchecked | **A3.** Mass-convert inline styles to CSS + lint lesson_content.js | 4h | 8.0 → 9.0 |
| Vanilla_Performance | 7.5 | No FPS measurement | **A4.** Chrome DevTools Performance trace via Playwright | 4h | 7.5 → 8.5 |
| Content_Integrity | 8.5 | 12/18 lessons content-untested | **A5.** Read all 18 lesson bodies for contradictions | 3h | 8.5 → 9.0 |
| **Average** | **7.9** | | Run **A1 → A5 sequentially** | **~16h** | **7.9 → 8.7** |

To hit **9.0 average** you need A1+A2+A3+A4+A5 = ~16h of work.
To hit **9.5 average** additionally requires P2 work (CSS minification, mobile drag-drop, diff view) = ~1 sprint.

---

## 1. Current State — verified, no fluff

| Item | State | Source of truth |
|------|-------|-----------------|
| `app.py` running on port 9000 | ✅ Real app tested | `curl http://localhost:9000/` → 200 |
| Real user session via DB | ✅ Login verified | `audit@example.com / AuditPass123` |
| B1, B4, B8, B13, B14, B17 on real app | ✅ All 6 render 4 steps | Playwright DOM queries |
| 12 other lessons (B2, B3, B5-7, B9-12, B15-16, B18) on real app | ❌ NOT tested | curl returns 200, but DOM unverified |
| 18/18 lessons structural validation | ✅ Pass | `node` programmatic check on real app |
| Mobile viewport (375px) | ❌ NOT tested | Would need Playwright `browser_resize` |
| Firefox / Safari | ❌ NOT tested | Only Chromium |
| Lighthouse a11y/perf/SEO | ❌ NOT run | No Lighthouse CLI in this env |
| Chrome DevTools FPS | ❌ NOT measured | Need DevTools Protocol, Playwright MCP doesn't expose it |

**Fixes shipped this session (uncommitted, in `D:\PE_test`):**
1. Dead functions removed: `showInlineHint`, `getZoneColor`, `placeBlockInSlot` (was 3, now 0)
2. 12 inline `.style.*=` → 4 `classList` operations + 4 new CSS classes (`.mini-chip-correct`, `.mini-chip-wrong`, `.step3-feedback-success`, `.step3-feedback-warn`)
3. Diff: 2 files, +89/-80 lines (net shrink)
4. `node -c lesson_db_design.js` exit 0 ✓
5. B1 still renders all 4 steps after fix (4 te-col, 4 te-rows, 1 ER SVG, 2 concept cards)

**Fixes from prior sessions (uncommitted):**
- `db_13` Boss Battle body: "8 bảng" → "7 bảng cốt lõi" (verified live)
- 15 `diagram:` keys renamed to `diagram_legacy_N` across db_14-18 (verified live)
- `db_01` lesson_content.js indent fix (lines 56-72)
- `register.css` R1 (red shadow) + R4 (--red-mid/dark tokens)
- `main.js` R2 (settings duplicate removed)
- `base.html` favicon (data: URL)
- `dashboard.css` truck `will-change` + `translateZ(0)`

---

## 2. The 5 Blockers — one per criterion

### Blocker G: [Gamified_UX] can't hit 9+ without testing all 18 lessons

**Why stuck at 8.0:** I sampled 6/18 (B1, B4, B8, B13, B14, B17). The other 12 (B2, B3, B5-7, B9-12, B15-16, B18) might have visual bugs I haven't seen.

**Specific gap:** did not verify the `decomp_game` rendering on B6-10 (decomp_game is in s1, not s3, of those lessons). Did not verify `flagship` Step 3 drag-drop on B7+ lessons. Did not verify mobile/touch.

**To get to 9.0:** need 18/18 lessons with Playwright DOM query confirming `erSvg >= 1 AND teCols >= 2 AND conceptCards >= 2`.

**To get to 9.5:** additionally need mobile-viewport test of B1 + B13.

---

### Blocker A: [Aesthetic_Excellence] can't hit 9+ without Lighthouse + mobile

**Why stuck at 7.5:**
- 421KB total CSS (over 300KB cap)
- 6 `backdrop-filter` uses (each forces paint layer)
- 12 `!important` declarations
- No Lighthouse a11y/perf/SEO scores
- No mobile viewport test
- No Firefox/Safari verification

**Specific gap:** I have NO quantitative evidence the UI is "Excellent". The 9+ cap requires Lighthouse a11y ≥85. I never ran it.

**To get to 9.0:**
1. Run Lighthouse on `/`, `/login`, `/dashboard`, `/lesson/db_design?lesson=1` — need score ≥85 on all 4 pages
2. Mobile viewport test (375px) of at least 3 pages
3. Reduce CSS to <300KB (current 421KB) OR reduce `backdrop-filter` count

**To get to 9.5:** additionally Lighthouse perf ≥80 + best-practices ≥90.

---

### Blocker C: [Code_Architecture] can't hit 9+ with 57 inline styles + 16 unchecked lessons

**Why stuck at 8.0:**
- 57 inline `.style.*=` assignments in `lesson_db_design.js` (cap for 9+ is ≤20)
- `db_02..db_18` indent NOT checked (only `db_01` was fixed)
- 12 `!important` declarations
- No minification pipeline

**Specific gap:** Most remaining inline styles are in `flagship` renderers (around lines 2500-3000) — those are dynamic animations and harder to convert.

**To get to 9.0:**
1. Reduce inline styles from 57 → ≤20
2. Run `prettier` or `js-beautify -t` on `lesson_content.js` to check all 18 lessons for indent rot
3. Remove at least 6/12 `!important` declarations

**To get to 9.5:** additionally add CSS minification (esbuild or postcss-cli).

---

### Blocker P: [Vanilla_Performance] can't hit 9+ without FPS measurement

**Why stuck at 7.5:** The 9+ cap requires "Chrome DevTools Performance tab shows no long frames (>16ms) during step transitions". I have NOT measured frame times. I cannot honestly claim butter-smooth 60fps without proof.

**Specific gap:** 50 `@keyframes`, 6 `backdrop-filter`, 12 `!important`, no GPU profiling done.

**To get to 9.0:**
1. Use Playwright's `page.tracing.start({ screenshots: true, snapshots: true })` to record a step transition (B1 step 1 → 2 → 3)
2. Use Chrome DevTools Performance panel (or the trace file) to measure frame times
3. If long frames exist, identify the offending property/element

**Alternative if Playwright tracing doesn't show frame times:** use `performance.measure()` in browser console around step transitions.

**To get to 9.5:** additionally measure under simulated 4G throttling.

---

### Blocker I: [Content_Integrity] can't hit 9+ with 12/18 content-untested

**Why stuck at 8.5:** 18/18 pass structural validation. 6/18 content-sampled on real app. The 12/18 I didn't read might have:
- Internal contradictions (like the db_13 7-vs-8 we found)
- MCQ option mismatched to concept card
- Expected SQL that doesn't run in real Postgres
- `expected_sql` for Step 4 that doesn't match the prompt

**Specific gap:** No automated check for "MCQ answer contradicts expected_sql".

**To get to 9.0:**
1. Read all 18 lesson bodies (skip diagrams)
2. For each lesson, check: does the MCQ's `correct: true` option match the concept card's claim? Does the Step 4 `expected_sql` match the prompt's intent?
3. Add a node validation script that flags `expected_sql.includes('SELECT') && step_2.mcq[].correct.answer.includes('UPDATE')` patterns

**To get to 9.5:** additionally run `expected_sql` against real Postgres to confirm it executes (not just parses).

---

## 3. Approach Triage — 2-3 ways per blocker, with cost/benefit

### For Blocker G (test all 18 lessons)

| Approach | Effort | Tools | Risk | Score lift |
|----------|--------|-------|------|-----------|
| **G.a** Playwright `browser_navigate` + DOM query on all 18 in one loop | 1h | Playwright MCP | Low — same approach as 6/18 verification, just extended | 8.0 → 8.5 |
| **G.b** Add `test_lessons.js` to `tests/` that asserts `erSvg >= 1 && teCols >= 2` per lesson | 3h | node + Playwright | Medium — needs a test framework | 8.0 → 9.0 |
| **G.c** Manual screenshot each lesson | 4h | Playwright screenshot | High — no DOM evidence, just visual | 8.0 → 8.0 (no actual proof) |

**Recommendation: G.a.** Cheapest, uses existing tooling, provides programmatic evidence for all 18.

---

### For Blocker A (Lighthouse + mobile)

| Approach | Effort | Tools needed | Risk | Score lift |
|----------|--------|--------------|------|-----------|
| **A.a** Install `lighthouse` npm package locally, run `npx lighthouse http://localhost:9000/lesson/db_design?lesson=1` | 1h | `npm install lighthouse` | Medium — first run might fail on Windows | 7.5 → 8.0 (just Lighthouse score) |
| **A.b** Use Chrome DevTools MCP if available | 0h (if exists) | DevTools MCP | Unknown — check `mavis mcp ls` | depends |
| **A.c** Reduce CSS to <300KB first (concatenate, minify) then Lighthouse | 4h | esbuild or manual concat | Medium — risky to manually edit 15 files | 7.5 → 8.5 (CSS + Lighthouse) |
| **A.d** Use Playwright's `browser_resize` to test 375px viewport | 30min | Playwright | Low | 7.5 → 7.5 (no Lighthouse score still) |

**Recommendation: A.d first (cheap) → A.a (Lighthouse) → A.c (CSS minify) only if A.a scores <85.**

**Critical:** if `npm install lighthouse` fails on this Windows env, fallback to `chrome-launcher` + lighthouse programmatically.

---

### For Blocker C (inline styles + lesson_content.js lint)

| Approach | Effort | Tools | Risk | Score lift |
|----------|--------|-------|------|-----------|
| **C.a** Mass-convert `flagship` renderers' inline styles to CSS classes (mirroring what I did for mini-chip) | 3h | Manual | Medium — flagship uses dynamic state (correct/wrong/selected) | 8.0 → 8.5 (-20 inline) |
| **C.b** Run `prettier --write lesson_content.js` to auto-fix indent in all 18 lessons | 5min | `npm i -g prettier` | Low (idempotent) | 8.0 → 8.5 (verified clean) |
| **C.c** Audit + remove `!important` declarations one by one | 2h | Manual | Medium — risk of breaking specificity | 8.0 → 8.5 (-6 !important) |
| **C.d** Set up esbuild to minify CSS at build time | 4h | npm config | Medium — new toolchain | 8.5 → 9.0 (smaller CSS = better perf too) |

**Recommendation: C.b first (5min, 18 lessons verified clean) → C.c (!important removal) → C.a only if time permits.**

---

### For Blocker P (FPS measurement)

| Approach | Effort | Tools | Risk | Score lift |
|----------|--------|-------|------|-----------|
| **P.a** Use Playwright `page.tracing.start()` to record step transition, then read the trace | 2h | Playwright | Medium — trace format may not include frame timing in this MCP version | 7.5 → 8.0 (have data) |
| **P.b** Use `requestAnimationFrame` timing in browser: `performance.now()` before/after step transition | 1h | Playwright + console | Low — direct measurement | 7.5 → 7.5 (no Chrome DevTools, but have RAF timings) |
| **P.c** Manually inspect 50 keyframes + 6 backdrop-filter for layout-thrashing properties (`top/left/width` in transitions) via grep | 30min | grep | Low | 7.5 → 7.5 (no measurement, just static analysis) |

**Recommendation: P.b first (cheapest, real data) → P.a only if you need the trace file for the report.**

---

### For Blocker I (content review)

| Approach | Effort | Tools | Risk | Score lift |
|----------|--------|-------|------|-----------|
| **I.a** Read all 18 lesson bodies, take notes on contradictions | 3h | Read | Low | 8.5 → 9.0 (programmatic check after) |
| **I.b** Write a node script that compares MCQ `correct` answers to concept card claims via NLP heuristics | 6h | node + simple rules | High — false positives, low signal | 8.5 → 8.5 |
| **I.c** Add `expected_sql` execution test against real Postgres (in test mode, rollback after each) | 4h | psycopg2 + test runner | Medium — DB may not be available in test env | 8.5 → 9.5 (real validation) |

**Recommendation: I.a first (manual review catches what automation misses) → I.c if I.a finds expected_sql issues.**

---

## 4. Recommended Order — ROI-optimized sequence

If you have 4 hours: **G.a + C.b + P.b** → 8.0 + 8.0 + 7.5 (avg 7.83) with concrete evidence for 18/18 lessons, clean JS, real FPS-ish data.

If you have 8 hours: **G.a + C.b + P.b + A.d + I.a (1/2)** → 8.5 + 8.5 + 8.0 (avg 8.33).

If you have 16 hours (one sprint): **A1 + A2 + A3 + A4 + A5** → 8.7 avg.

**Critical path:**
1. **C.b (5 min)** — run `prettier` on lesson_content.js, document that all 18 lessons pass lint → unlocks [Code_Architecture] + [Content_Integrity] (indent is a content quality issue)
2. **G.a (1h)** — extend Playwright to all 18 → unlocks [Gamified_UX]
3. **P.b (1h)** — RAF timing in browser console → unlocks [Vanilla_Performance]
4. **I.a (3h)** — read all 18 bodies → unlocks [Content_Integrity]
5. **A.d (30 min)** — mobile viewport Playwright → partial [Aesthetic_Excellence]
6. **A.a (1h)** — Lighthouse if available → completes [Aesthetic_Excellence]

Total: ~6.5h for a 7.9 → 8.5 average score lift, with concrete programmatic evidence.

---

## 5. What to AVOID

1. **Don't claim 9+ on Vanilla_Performance without FPS data.** Even if the code looks fast, the rubric requires Chrome DevTools proof. Score cap is 7.5.
2. **Don't run on dev_server.py.** Use real app.py on :9000. dev_server uses mock data and the visual-db-panel is a different render path.
3. **Don't claim CSS <300KB just by counting lines.** Use `Get-ChildItem -Recurse -Filter *.css | Measure-Object Length -Sum` to get the real number.
4. **Don't fix `lesson_content.js` indent by hand.** Run prettier once — 5 min, deterministic, no mistakes.
5. **Don't add inline `style.cssText`.** Always classList or setProperty. The new classes I added demonstrate the pattern.
6. **Don't trust the prior `UI_UX_AUDIT_REPORT.md` (1013 lines) as ground truth.** It's a 4-pass meta-audit with several misfires (B4, B5, R3 were wrong). The verified state in §1 above is ground truth.
7. **Don't promise FINAL unless every criterion has programmatic evidence.** The anti-bias rules require it. Honest ITERATING > dishonest FINAL.

---

## 6. Hand-off Checklist

**Files modified this session (UNCOMMITTED, will show in `git status`):**
- `D:\PE_test\static\js\lesson_db_design.js` (dead code removed, inline styles reduced)
- `D:\PE_test\static\css\lesson_db_design.css` (4 new classes for feedback states)

**Files modified in prior sessions (UNCOMMITTED):**
- `routes/leaderboard.py`, `static/css/auth.css`, `static/css/dashboard.css`, `static/css/register.css`, `static/css/style.css`, `static/js/dashboard.js`, `static/js/main.js`, `static/js/lesson_content.js`, `templates/base.html`, `templates/landing.html`

**Total uncommitted:** 12 files. Run `git diff --stat HEAD` to see full list.

**To commit safely:**
```bash
cd D:\PE_test
git add static/js/lesson_db_design.js static/css/lesson_db_design.css
git commit -m "fix: remove 3 dead functions + reduce 12 inline styles via classList"
```

**Tools needed for next session:**
- Playwright MCP (already available — `mavis mcp tools playwright` to verify)
- node (already available — `node -c file.js` for parse check)
- curl (already available)
- Optional: `npm install lighthouse` (may need Windows workaround)
- Optional: `npm install -g prettier` (if C.b path chosen)

**Credentials / env:**
- `.env` at `D:\PE_test\.env` with Neon DB URL (already configured)
- Test user: `audit@example.com / AuditPass123` (user_id=151, questionnaire_completed=0)

**Known unknowns:**
- Does `npm install lighthouse` work on this Windows env? (try; if it fails, fallback to `chrome-launcher` programmatic)
- Does Playwright MCP support `page.tracing`? (try `mavis mcp tools playwright browser_trace`)
- Are there other uncommitted sessions I missed? (run `git status` to verify)

---

## 7. ONE-LINE summary to share with the next Claude

> "PE_test is at 7.9/10 average. 5 P1 fixes landed (dead code -3 functions, inline styles -12, db_13 contradiction fix, 15 diagram_legacy renames, db_01 indent). To reach 9.0 average, next Claude should run (in order): C.b prettier (5min) → G.a Playwright all 18 (1h) → P.b RAF timings (1h) → I.a read all 18 bodies (3h) → A.d mobile viewport (30min) → A.a Lighthouse (1h). Lighthouse + DevTools FPS are the only gaps that cap [Aesthetic_Excellence] and [Vanilla_Performance] at 7.5. All work is in `D:\PE_test`, uncommitted. App.py is running on :9000 with `audit@example.com / AuditPass123`."

---

**End of report. Hand to next Claude with this file alone — it's self-contained.**
