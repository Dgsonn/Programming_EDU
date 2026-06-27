# Instructions for Minimax — Phase 4 + 5: Micro-interactions + Success Screen
**Date:** 2026-06-26
**From:** Claude Code (Sonnet 4.6) via user review
**Context:** Phase 2 complete. CSS at 160,031 bytes (4,969 headroom). Token adoption 554 refs.

---

## CSS BUDGET

You have **4,969 bytes** of headroom (160,031 / 165,000 cap).

Phase 4 micro-interactions are mostly small (2-5 lines each). Phase 5 success screen is larger (~40-60 lines). Total estimate: ~2,500-3,500 bytes. You should fit.

If you run out of space:
1. Find more dead CSS to remove (check for selectors with 0 HTML/JS references)
2. Shorten existing verbose rules (e.g., merge shorthand `padding: 12px 16px 12px 16px` → `padding: 12px 16px`)
3. DO NOT exceed 165,000 bytes under any circumstance

---

## PHASE 4: Micro-interactions (8 items, ~2h)

All micro-interactions MUST:
- Use CSS only (or minimal classList toggle in JS)
- Use existing duration tokens: `var(--dur-instant)` = 80ms, `var(--dur-fast)` = 150ms, `var(--dur-base)` = 240ms
- Use existing easing: `var(--ease-out-quart)` = `cubic-bezier(0.25,1,0.5,1)`
- Include `@media (prefers-reduced-motion: reduce)` override
- NOT use `!important`
- NOT use inline `.style.prop=`

### 4.1. Button press feedback (5 min)

`.btn` already has `:active` with `transform: scale(0.97)`. Verify it works on the Run/Submit/Next buttons that now have `.btn` class.

**Test:** Click "Submit" on B1 Step 4 → button should visually shrink slightly on press.

If not working, check CSS specificity — the old `.run-btn` or `.next-btn` might override with their own `:active`. Fix by raising specificity:

```css
.btn.btn-primary:active,
.btn.btn-ghost:active {
  transform: scale(0.97);
  transition: transform var(--dur-instant) var(--ease-out-quart);
}
```

### 4.2. MCQ option hover preview (15 min)

**File:** `static/css/lesson_db_design.css`

Currently MCQ options probably have a basic hover. Enhance to feel more interactive:

```css
.mcq-option {
  transition: background var(--dur-fast) var(--ease-out-quart),
              box-shadow var(--dur-fast) var(--ease-out-quart),
              transform var(--dur-instant) var(--ease-out-quart);
}
.mcq-option:hover {
  background: var(--surface-3);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
.mcq-option:active {
  transform: scale(0.99);
}
```

Check existing `.mcq-option:hover` rule — MERGE into it, don't create a duplicate.

### 4.3. MCQ correct/wrong enhanced feedback (20 min)

**Currently:** correct = green background, wrong = red background + shake.

**Enhance correct:**

```css
.mcq-option.correct {
  background: rgba(16, 185, 129, 0.15);
  border-color: var(--success);
  animation: mcq-correct-pulse var(--dur-base) var(--ease-out-quart);
}
@keyframes mcq-correct-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
```

**Enhance wrong — add "why wrong" tooltip (Brilliant pattern):**

This requires JS. When user clicks wrong answer, show a brief 1-line explanation.

**File:** `static/js/lesson_db_design.js` (in `handleMCQClick`)

After the wrong-answer class is added, insert:
```js
if (!opt.correct) {
  const tip = document.createElement('div');
  tip.className = 'mcq-wrong-tip';
  tip.textContent = opt.explanation || 'Xem lại lý thuyết ở trên.';
  btn.appendChild(tip);
  setTimeout(() => tip.remove(), 3000);
}
```

**CSS:**
```css
.mcq-wrong-tip {
  position: absolute; bottom: -28px; left: var(--space-4); right: var(--space-4);
  background: var(--danger); color: #fff;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm, 4px);
  font-size: var(--text-xs);
  animation: fade-in var(--dur-fast) var(--ease-out-quart);
  z-index: 5; pointer-events: none;
}
```

**NOTE:** `opt.explanation` doesn't exist in current data. The tooltip will show fallback text "Xem lại lý thuyết ở trên." for now. Future: add `explanation` field to MCQ options in lesson_content.js.

### 4.4. Pill drag-start feedback (15 min)

**File:** `static/css/lesson_db_design.css`

When user starts dragging a pill, it should feel "lifted":

```css
.logic-pill:active,
.logic-pill.dragging {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  z-index: 100;
  opacity: 0.9;
  transition: transform var(--dur-instant) var(--ease-out-quart),
              box-shadow var(--dur-instant) var(--ease-out-quart);
}
```

**File:** `static/js/lesson_db_design.js` (in dragstart handler)

Check if `dragging` class is already added on dragstart. If not, add:
```js
pill.addEventListener('dragstart', (e) => {
  pill.classList.add('dragging');
  // ... existing code
});
pill.addEventListener('dragend', () => {
  pill.classList.remove('dragging');
});
```

### 4.5. Drop zone accept flash (15 min)

When a block is correctly dropped into a zone, the zone should flash briefly:

**CSS:**
```css
.drop-line.zone-accepted {
  animation: zone-accept-flash var(--dur-base) var(--ease-out-quart);
}
@keyframes zone-accept-flash {
  0% { background: rgba(16, 185, 129, 0.2); }
  100% { background: transparent; }
}
```

**JS:** In the drop handler (after successful placement), add:
```js
zone.classList.add('zone-accepted');
setTimeout(() => zone.classList.remove('zone-accepted'), 240);
```

### 4.6. XP award sparkle (20 min)

When XP is awarded, add a brief golden sparkle around the XP counter:

**CSS:**
```css
.xp-sparkle {
  position: absolute; inset: -4px;
  border-radius: 50%;
  animation: xp-sparkle-ring var(--dur-base) var(--ease-out-quart) forwards;
  pointer-events: none;
}
@keyframes xp-sparkle-ring {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); transform: scale(0.8); }
  50% { box-shadow: 0 0 12px 4px rgba(245, 158, 11, 0.3); transform: scale(1.1); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); transform: scale(1); }
}
```

**JS:** In `addXP()`, after the countup animation starts:
```js
const sparkle = document.createElement('div');
sparkle.className = 'xp-sparkle';
el.parentElement.style.position = 'relative';
el.parentElement.appendChild(sparkle);
setTimeout(() => sparkle.remove(), 300);
```

### 4.7. Step indicator animated underline (15 min)

The active step in the progress track should have a sliding underline instead of an instant color change:

**CSS:**
```css
.progress-step {
  position: relative;
}
.progress-step::after {
  content: '';
  position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;
  background: var(--module-accent);
  transition: width var(--dur-base) var(--ease-out-quart),
              left var(--dur-base) var(--ease-out-quart);
}
.progress-step.active::after {
  width: 100%; left: 0;
}
```

Check existing `.progress-step` and `.progress-step.active` rules — MERGE, don't duplicate.

### 4.8. Scroll progress bar (15 min)

Thin colored bar at the very top of viewport showing scroll position within current step:

**CSS:**
```css
.scroll-progress {
  position: fixed; top: 0; left: 0; height: 3px; z-index: 10002;
  background: var(--module-accent);
  transition: width var(--dur-instant) linear;
  pointer-events: none;
}
```

**HTML:** Add to `lesson_db_design.html` (first child of body or after header):
```html
<div class="scroll-progress" id="scroll-progress"></div>
```

**JS:** Add scroll listener (INSIDE IIFE, in init):
```js
const scrollBar = document.getElementById('scroll-progress');
if (scrollBar) {
  const activePane = () => document.querySelector('.step-pane.active');
  const update = () => {
    const pane = activePane();
    if (!pane) return;
    const pct = pane.scrollTop / (pane.scrollHeight - pane.clientHeight) * 100;
    scrollBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  };
  document.addEventListener('scroll', update, true);
}
```

### 4.9. prefers-reduced-motion block (5 min)

Add at the END of the CSS file, AFTER all new animations:

```css
@media (prefers-reduced-motion: reduce) {
  .mcq-option, .logic-pill, .btn, .drop-line, .progress-step::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
  .scroll-progress { display: none; }
}
```

This is the ONE place where `!important` is acceptable — accessibility override.

---

## PHASE 5: Success Screen Upgrade (~1h)

### 5.1. Enhanced success modal layout

**File:** `static/js/lesson_db_design.js` (in `showSuccess` function)

Replace the current simple modal content with a structured layout:

```js
function showSuccess() {
  const l = state.currentLesson;
  const lessonNum = state.currentLessonIdx + 1;
  const nextIdx = state.currentLessonIdx + 1;
  const nextLesson = data.lessons[nextIdx];
  const isBoss = l.id === 'db_13';
  const moduleSlug = {1:'amber',2:'indigo',3:'emerald'}[l.module] || 'amber';

  const overlay = document.getElementById('success-overlay');
  const content = document.getElementById('success-content');

  // XP breakdown
  const xpBreakdown = `
    <div class="success-xp-breakdown">
      <div class="success-xp-row"><span>Trắc nghiệm</span><span>+15 XP</span></div>
      <div class="success-xp-row"><span>Mini-game</span><span>+15 XP</span></div>
      <div class="success-xp-row"><span>Kéo thả SQL</span><span>+30 XP</span></div>
      <div class="success-xp-row"><span>Viết code</span><span>+${l.step_4.xp_reward || 50} XP</span></div>
      <div class="success-xp-total"><span>Tổng</span><span class="success-xp-num" id="success-xp-total">0</span></div>
    </div>
  `;

  // Next lesson preview (if not last)
  const nextPreview = nextLesson ? `
    <div class="success-next-preview card-default">
      <span class="success-next-label">Bài tiếp theo</span>
      <span class="success-next-title">${nextLesson.title}</span>
    </div>
  ` : `<div class="success-next-preview card-highlight"><span>Chúc mừng! Bạn đã hoàn thành toàn bộ khóa học!</span></div>`;

  content.innerHTML = `
    <div class="success-icon">${isBoss ? '🏆' : '🎉'}</div>
    <div class="success-lesson-tag">
      <span class="success-lesson-num">Bài ${lessonNum}/18</span>
      <span class="success-lesson-title">${l.title}</span>
    </div>
    <div class="success-message">${l.step_4.success_message || 'Hoàn thành xuất sắc!'}</div>
    ${xpBreakdown}
    ${nextPreview}
    <div class="success-actions">
      <button class="btn btn-ghost" onclick="closeSuccess()">Đóng</button>
      ${nextLesson ? `<button class="btn btn-primary" onclick="nextLesson()">Bài tiếp →</button>` : ''}
    </div>
  `;

  overlay.classList.add('active');
  if (isBoss) celebrate(); // extra confetti for boss

  // Countup XP total
  const totalXP = 15 + 15 + 30 + (l.step_4.xp_reward || 50);
  const xpEl = document.getElementById('success-xp-total');
  if (xpEl) {
    let current = 0;
    const step = Math.ceil(totalXP / 20);
    const interval = setInterval(() => {
      current = Math.min(current + step, totalXP);
      xpEl.textContent = '+' + current + ' XP';
      if (current >= totalXP) clearInterval(interval);
    }, 30);
  }
}
```

### 5.2. Success screen CSS

```css
/* ── Success screen upgrade ──────────────────── */
.success-icon {
  font-size: 48px;
  animation: success-bounce var(--dur-base) var(--ease-out-quart);
  margin-bottom: var(--space-4);
}
.success-lesson-tag {
  display: flex; align-items: center; justify-content: center; gap: var(--space-3);
  margin: var(--space-2) auto var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(90deg, rgba(var(--module-accent-rgb, 6,182,212), 0.12), rgba(168,85,247,0.12));
  border: 1px solid rgba(var(--module-accent-rgb, 6,182,212), 0.3);
  border-radius: 999px; font-size: var(--text-sm); font-weight: 600;
}
.success-message {
  font-size: var(--text-lg); color: var(--text-200);
  margin-bottom: var(--space-6); text-align: center; line-height: 1.6;
}
.success-xp-breakdown {
  width: 100%; max-width: 280px; margin: 0 auto var(--space-6);
}
.success-xp-row {
  display: flex; justify-content: space-between;
  padding: var(--space-2) 0;
  font-size: var(--text-sm); color: var(--text-400);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.success-xp-row span:last-child { color: var(--success); font-weight: 600; }
.success-xp-total {
  display: flex; justify-content: space-between;
  padding: var(--space-3) 0; margin-top: var(--space-2);
  font-size: var(--text-lg); font-weight: 700; color: var(--text-100);
}
.success-xp-num { color: #F59E0B; }
.success-next-preview {
  display: flex; flex-direction: column; gap: var(--space-1);
  padding: var(--space-4); margin-bottom: var(--space-6);
  border-radius: var(--radius-md, 8px); cursor: pointer;
}
.success-next-label { font-size: var(--text-xs); color: var(--text-500); text-transform: uppercase; letter-spacing: 1px; }
.success-next-title { font-size: var(--text-base); color: var(--text-100); font-weight: 600; }
.success-actions {
  display: flex; gap: var(--space-3); justify-content: center;
}
```

### 5.3. Boss Battle special celebration (db_13)

For Boss Battle, add fireworks instead of just confetti:

**CSS:**
```css
@keyframes firework-burst {
  0% { transform: scale(0); opacity: 1; }
  50% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}
.firework {
  position: fixed; width: 8px; height: 8px; border-radius: 50%;
  pointer-events: none; z-index: 10003;
  animation: firework-burst 0.8s var(--ease-out-quart) forwards;
}
```

**JS:** Add to `celebrate()` when `isBoss`:
```js
if (state.currentLesson.id === 'db_13') {
  const colors = ['#F59E0B','#EF4444','#8B5CF6','#06B6D4','#10B981'];
  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    dot.className = 'firework';
    dot.style.left = (20 + Math.random() * 60) + 'vw';
    dot.style.top = (10 + Math.random() * 40) + 'vh';
    dot.style.background = colors[i % colors.length];
    dot.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1500);
  }
}
```

**NOTE:** This uses 5 inline `.style` assignments for dynamic positioning (random). This is acceptable — positions MUST be random per particle, can't be CSS-only. Don't try to refactor to classList.

---

## VERIFICATION CHECKLIST

After each sub-step:

```powershell
# 1. CSS size
$size = (Get-ChildItem "D:\PE_test\static\css\lesson_db_design.css").Length
Write-Host "CSS: $size / 165000 (headroom: $($size - 165000))"

# 2. Brace balance
$css = Get-Content "D:\PE_test\static\css\lesson_db_design.css" -Raw
$diff = ([regex]::Matches($css, '\{')).Count - ([regex]::Matches($css, '\}')).Count
Write-Host "Brace diff: $diff"

# 3. JS syntax
node -c "D:\PE_test\static\js\lesson_db_design.js"

# 4. No new !important (except prefers-reduced-motion)
# Acceptable count: previous 12 + 2 new (in reduced-motion block) = 14

# 5. New keyframe count: previous 47 + 3 new (mcq-correct-pulse, zone-accept-flash, xp-sparkle-ring, firework-burst) = 51 max
```

After ALL phases complete, test on real app:

```
B1 (M1 Amber):
- Step 2: click wrong MCQ → should see red shake + "Xem lại lý thuyết" tooltip
- Step 2: click correct MCQ → should see green pulse ring
- Step 3: drag pill → should scale 1.05 + shadow increase
- Step 3: drop in correct zone → zone flashes green briefly
- Step 4: click Submit correct → success screen shows XP breakdown + next preview
- Progress bar: thin colored bar at top tracks scroll

B13 (Boss Battle):
- Step 4: Submit correct → fireworks (30 colored dots bursting) + confetti + modal

B14 (M3 Emerald):
- Verify all micro-interactions work with emerald theme
```

---

## SCORING TARGETS after Phase 4+5

| Criterion | Current | Target | How |
|-----------|---------|--------|-----|
| Visual_Polish | 7.5 | **8.0** | Micro-interactions add polish. No structural visual changes. |
| Interaction_Quality | 3.5 | **7.5** | 8 micro-interactions + enhanced success screen = major jump |
| Platform_Cohesion | 7.0 | **7.5** | Scroll progress bar + step indicator underline adds consistency |
| Learning_Feel | 4.5 | **7.0** | XP breakdown + next-lesson preview + wrong-answer tip = Brilliant-inspired |
| Code_Quality | 8.5 | **8.5** | Maintain — all new CSS uses tokens, classList for JS |

**Expected average: 7.7/10** (up from 6.2). Still ITERATING for 9+, but substantial progress.

---

## RULES REMINDER

1. **NO git commit/push/add**
2. **NO !important** (except prefers-reduced-motion)
3. **CSS ≤ 165,000 bytes**
4. **NO new backdrop-filter**
5. **All new CSS MUST use var(--token)**
6. **All new JS interactions MUST use classList**
7. **Test on app.py port 9000** (restart after HTML changes)
8. **Test minimum 3 lessons** (B1, B13, B14)

---

*Instructions by Claude Code (Sonnet 4.6). Phase 4 is about making the UI FEEL alive. Phase 5 is about making completion FEEL rewarding.*
