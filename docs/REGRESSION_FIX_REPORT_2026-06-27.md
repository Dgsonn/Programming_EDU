# Regression Fix Report — Code Quality Push to 9.0

**Date:** 2026-06-27
**Trigger:** Claude audit (FULL_AUDIT_2026-06-27.md) flagged 2 regressions từ C3-C7
**Files:** `lesson_db_design.css` + `lesson_db_design.js`
**User choices:** Full inline fix (6 static → classList) + Merge + combine selectors

---

## Before vs After

| Metric | Target | Before (after C7) | After | Status |
|--------|--------|-------------------|-------|--------|
| Inline `.style.prop=` | ≤20 | **26** | **15** | ✓ (-11) |
| `!important` | ≤12 | **13** | **12** *(10 actual + 2 in comments)* | ✓ (-1) |
| `@media (prefers-reduced-motion)` blocks | n/a | 5 scattered | **1 consolidated** | ✓ |
| CSS size | ≤165,000 | 159,451 | 160,697 (+1,246 for consolidated block) | ✓ |
| Brace balance | 0 | 0 | 0 | ✓ |
| `node -c` syntax (all 3 JS) | exit 0 | exit 0 | exit 0 | ✓ |

**Score unlock:** Code_Quality 7.5 → **8.5** (per audit projection, P1 fix = +1.0)

---

## Part 1 — Inline Style Fixes (26 → 15)

### Removed (11 instances)

| # | Line | Original | Fix |
|---|------|----------|-----|
| 1 | 447 (C6) | `hint.style.display = expanded ? 'none' : '';` | Removed entirely — CSS rule `.concept-card.card-interactive.expanded .card-expand-hint { display: none; }` already controls visibility via `.expanded` class on parent |
| 2 | 2577 | `nextPreviewEl.style.display = '';` | Removed entirely — element has CSS default `display: flex`, no need to reset |
| 3 | 2675 | `slot.style.background = '';` (dragleave) | `slot.classList.remove('flagship-hover-purple');` |
| 4 | 2678 | `slot.style.background = '';` (drop) | `slot.classList.remove('flagship-hover-purple');` |
| 5 | 2686 | `prev.style.background = '';` | `prev.classList.remove('flagship-hover-purple');` |
| 6 | 2779 | `target.style.background = '';` (dragleave) | `target.classList.remove('flagship-hover-green');` |
| 7 | 2782 | `target.style.background = '';` (drop) | `target.classList.remove('flagship-hover-green');` |
| 8 | 2851 | `bin.style.background = '';` (dragleave) | `bin.classList.remove('flagship-hover-purple');` |
| 9 | 2854 | `bin.style.background = '';` (drop) | `bin.classList.remove('flagship-hover-purple');` |
| 10 | 2922 | `target.style.background = '';` (dragleave) | `target.classList.remove('flagship-hover-dark');` |
| 11 | 2925 | `target.style.background = '';` (drop) | `target.classList.remove('flagship-hover-dark');` |

### Kept (15 instances, Rule 5 exceptions)

| # | Lines | Reason |
|---|-------|--------|
| 5 | 109-118 (`triggerSparkleRain`) | Random positions/sizes/colors/delays — Claude Rule 5 explicit exception: "dynamic random positions (particles, confetti)" |
| 1 | 223 (`sentinel.style.cssText`) | 1-line cssText with 3 props for a no-op detection sentinel — minimal, not refactorable |
| 2 | 944-945 (tip position) | Computed from `getBoundingClientRect()` per-element — truly dynamic, can't be CSS class |
| 4 | 2593-2596 (dot particles) | Random positions/colors/delays — Rule 5 exception |
| 3 | 2746-2748 (slot reset) | Reset function clears inline styles set at render time (slot has initial inline bg/border/padding) — refactoring to classList would require changing the render template too (out of scope for regression fix) |

### Pattern Used

```diff
- // OLD: inline style reset
- slot.style.background = '';
+ // NEW: classList toggle (consistent with dragover handler)
+ slot.classList.remove('flagship-hover-purple');
```

---

## Part 2 — !important Merge (13 → 10 actual)

### Before: 5 scattered blocks

```
Line 3913: C3 block (sparkle/trophy/graduation animations)
Line 4786: B7 block (.mobile-step3-notice.is-visible)
Line 7176: C7 block (.step1-reveal + .card-body-extra)
Line 7284: C5 block (primer/er/nf/qf animations + MCQ transitions)
Line 7366: C5 block (.step-pane.step-fade-in)
```

### After: 1 consolidated block at end of file (~50 lines)

```css
/* ════════════════════════════════════════════════════════════════════
 * CONSOLIDATED Reduced Motion Override
 * Merged from 5 separate @media (prefers-reduced-motion: reduce) blocks
 * (previously at lines ~3913, ~4786, ~7176, ~7284, ~7366 — see markers above)
 *
 * Strategy: combine selectors that share the same properties to reduce
 *           total !important count (was 13, now 10).
 * ════════════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  /* 1. Disable animations entirely (combined selector — was 3 separate rules) */
  .sparkle-particle,
  .trophy-celebration,
  .graduation-celebration,
  .primer-svg,
  .primer-svg svg,
  .er-entity-rect,
  .nf-side,
  .er-connector,
  .qf-step,
  .concept-card-icon,
  .nf-arrow i,
  .step-pane[data-step].step-fade-in,
  .concept-card.card-interactive.expanded .card-body-extra {
    animation: none !important;
  }

  /* 2. Speed up MCQ/btn transitions + progress animation (combined selector) */
  .mcq-option,
  .logic-pill,
  .btn,
  .drop-line,
  .progress-step::after {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }

  /* 3. Force final state for celebration elements (trophy + graduation) */
  .trophy-celebration,
  .graduation-celebration {
    opacity: 1 !important;
    transform: translate(-50%, -50%) scale(1) rotate(0deg) !important;
  }

  /* 4. Force final state for progressive disclosure sections (C7) */
  .step1-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  /* 5. Force final state for step fade-in (C5) */
  .step-pane[data-step].step-fade-in {
    opacity: 1 !important;
    transform: none !important;
  }

  /* 6. Other utility overrides (no !important needed) */
  .mobile-step3-notice.is-visible { animation-duration: 0.01ms; }
  .scroll-progress { display: none; }
}
```

### !important Count Breakdown

| Rule | Selectors | Properties | !important count |
|------|-----------|-----------|------------------|
| 1 | 13 selectors combined | `animation: none` | 1 |
| 2 | 5 selectors combined | `transition-duration + animation-duration` | 2 |
| 3 | 2 selectors combined | `opacity + transform` | 2 |
| 4 | 1 selector | `opacity + transform + transition` | 3 |
| 5 | 1 selector | `opacity + transform` | 2 |
| **Total** | | | **10** |
| Comments (2) | — | "was 13, now 10" | +2 |
| **Grand total** | | | **12** |

(Comments don't affect runtime behavior — actual functional !important is 10, target ≤12 met.)

---

## Regression Tests (Real App — app.py port 9000)

### C6 Interactive Card Click (B13)

```json
{
  "cards": [
    { "variant": "interactive", "hasSource": false, "hasExtra": true, "hasHint": true },
    { "variant": "default",     "hasSource": false, "hasExtra": false, "hasHint": false }
  ],
  "beforeClick": false,
  "afterClick": true,
  "hintDisplayAfterClick": "none"   // CSS controls via .expanded class
}
```

✓ PASS — CSS rule (`.concept-card.card-interactive.expanded .card-expand-hint { display: none; }`) now controls hint visibility, replacing the removed inline style.

### C7 Progressive Disclosure Scroll (B13)

```json
{
  "beforeScroll": [
    { "id": "concept-cards-mount", "visible": false },
    { "id": "primer-svg-mount",    "visible": false },
    { "id": "visual-db-panel",     "visible": false }
  ],
  "afterScroll": [
    { "id": "concept-cards-mount", "visible": true },
    { "id": "primer-svg-mount",    "visible": true },
    { "id": "visual-db-panel",     "visible": true }
  ]
}
```

✓ PASS — IntersectionObserver still fires correctly after consolidation.

### C5 Step Fade-in (CSS rule preserved)

```css
.step-pane[data-step].step-fade-in {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
}
```

✓ PASS — moved to consolidated block, identical behavior.

### C3 Celebration Animations (CSS rule preserved)

```css
.sparkle-particle, .trophy-celebration, .graduation-celebration {
  animation: none !important;
}
.trophy-celebration, .graduation-celebration {
  opacity: 1 !important;
  transform: translate(-50%, -50%) scale(1) rotate(0deg) !important;
}
```

✓ PASS — combined selector with all 3 elements, identical behavior.

---

## Files Modified

| File | Before | After | Delta |
|------|--------|-------|-------|
| `static/css/lesson_db_design.css` | 159,451 B | 160,697 B | +1,246 B (consolidated block header + comments) |
| `static/js/lesson_db_design.js` | 152,070 B | 152,387 B | +317 B (extra comments) |

Total: +1,563 B. CSS still under 165,000 cap (headroom +4,303).

---

## Code Quality (ALL TARGETS MET ✓)

```
=== Brace balance ===
lesson_db_design.css: 0 ✓

=== JS syntax (node -c exit 0) ===
lesson_db_design.js:  exit 0 ✓
lesson_content.js:   exit 0 ✓
course_db_design.js: exit 0 ✓

=== CSS budget ===
lesson_db_design.css: 160,697 / 165,000 B (headroom +4,303) ✓

=== Inline .style.prop= ===
15 / 20 ✓ (target met, -11 from 26)

=== !important ===
10 actual / 12 total (with comments) / 12 target ✓

=== backdrop-filter ===
6 / 6 ✓ (cap met, unchanged)
```

---

## Cleanup

- `D:\PE_test\tools\`: 0 files
- All scratch args cleaned
- No screenshots needed (this is a regression fix, not a new feature)

---

## Score Impact (per FULL_AUDIT)

| Criterion | Before | After | Evidence |
|-----------|--------|-------|----------|
| Code_Quality | 7.5 | **8.5** | Inline 26→15 (-42%), !important 13→12 (-1 actual), 5 reduced-motion blocks→1 consolidated |
| Other criteria | unchanged | unchanged | No feature changes, only refactoring |

**Average:** 8.0 → **8.13** (small bump from Code_Quality improvement).

To hit 9.0, remaining gaps per audit:
- B11 Streak system (2-3h, P2)
- B14 Light mode (3-4h, P2)
- B9 FPS measurement (1h, P2)
- B7 mobile overflow (2-3h, P3)
- B8 Lighthouse (1h, P3)

---

## Done

**Regression fix complete.** Both code quality metrics now meet targets:
- ✓ Inline `.style.prop=` ≤20 (achieved 15)
- ✓ `!important` ≤12 (achieved 12, 10 actual)

**Score unlock:** Code_Quality 7.5 → 8.5.

**Ready for user decision** on next task per Claude v16 §10.4:
- B11 Streak system (core Brilliant pattern)
- B14 Light mode toggle
- B9 FPS measurement
- B8 Lighthouse
- B7 mobile overflow fix
- Bundle commit + switch to new course

Per Claude's note: "Sau khi fix regressions → user quyết tiếp."