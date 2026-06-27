# System Instructions — PE_test UI/UX Council
**Version:** v16 (2026-06-27, ALL C1-C8 DONE, fix regressions → push to 9.0)
**Cho:** Minimax
**Tạo bởi:** Claude Code (Sonnet 4.6)

---

## CÁCH SỬ DỤNG FILE NÀY

Đây là **system instructions duy nhất** cho mọi session tiếp theo. Gửi file này + repomix output cho Minimax mỗi khi bắt đầu session mới. File này thay thế tất cả prompts/instructions trước đó.

---

## PHẦN 1: ABSOLUTE RULES (vi phạm = hard fail)

```
RULE 1 — NO GIT:
  Bạn KHÔNG ĐƯỢC chạy git commit, git push, git add, hoặc bất kỳ git write command nào.
  Chỉ được sửa files trong working tree. User sẽ review và commit thủ công.

RULE 2 — NO FRAMEWORKS:
  Tất cả frontend PHẢI là Vanilla HTML (Jinja2), Vanilla JS, và Vanilla CSS.
  KHÔNG dùng React, Vue, Tailwind, SCSS, PostCSS, esbuild, hoặc bất kỳ build tool nào.

RULE 3 — BACKWARD COMPATIBILITY:
  Mọi thay đổi PHẢI giữ nguyên chức năng hiện có. Nếu 1 lesson render trước khi bạn sửa,
  nó PHẢI vẫn render sau khi sửa. Chạy `node -c <file>` sau MỌI edit JS.

RULE 4 — CSS BUDGET:
  File lesson_db_design.css PHẢI ≤ 165,000 bytes.
  HIỆN TẠI: 147,804 bytes (headroom 17,196 bytes — THOẢI MÁI sau C1 xóa 15KB dead CSS).
  Có đủ room cho C2-C8. Vẫn cân nhắc, không phung phí.

RULE 5 — EVIDENCE-BASED SCORING:
  KHÔNG được tự chấm > 8.0 trên bất kỳ tiêu chí nào mà không có BẰNG CHỨNG LẬP TRÌNH
  (grep output, node validation, DOM query, file size measurement).

RULE 6 — REAL APP TESTING:
  Test trên app.py (port 9000), KHÔNG phải dev_server.py (port 9001).
  dev_server dùng mock data che giấu bugs thực tế.

RULE 7 — MINIMUM SAMPLING:
  Test TỐI THIỂU 6/18 bài (B1, B4, B8, B13, B14, B17) — phủ cả 3 modules.
```

---

## PHẦN 2: TASK TRACKER — KHÔNG ĐƯỢC QUÊN

Đây là bảng master của TẤT CẢ công việc. Mỗi khi bắt đầu session mới, ĐỌC BẢNG NÀY TRƯỚC.
Mỗi khi hoàn thành 1 task, CẬP NHẬT trạng thái trong report.

### NHÓM A: Đã hoàn thành ✅ (KHÔNG làm lại)

**A1-A30 (summary):** 18/18 bài fully populated (starter, hints 4L, mcq, mini_game, visual, diagram). Mini-game 5/4/6/3 diversity. 6 concept tones + 6 intro patterns. Module colors Amber/Indigo/Emerald. Design tokens (space/surface/text/dur/shadow) migrated. Card-highlight + btn classes. Dead functions removed. Phase 4 micro-interactions + Phase 5 success screen. URL 1-based. acceptedKeywords 49 zones. SVG icon library 22+35 mappings. Auto-save localStorage. XP countup + step fade transitions. Token re-migration (B1) + inline→classList (B2) + !important cleanup (B3). Playwright 6/6 verify (B4). Content audit 18 bài + 4 fixes (B12 LIMIT, B13 MCQ, B16 ORM, B17 multi-query) + validator refactor.

| ID | Task | Hoàn thành |
|----|------|-----------|
| A31-A33 | B5 content fixes + validator multi-query | B5 fix |
| A34 | B7: Mobile Option A — notice + skip, 6/6 PASS | B7 |
| A35-A37 | C1+C1x: Wrong-answer 144/144 explanations + 63 dead CSS classes removed (-15KB) | C1 |
| A38 | C2: Course roadmap — snake, hex boss, 3-tier progress, 5/5 PASS | C2 |
| A39-A40 | C5+C5v: 4 step animations, 72/72 ALL 18 bài PASS | C5 |
| A41 | C8: Course detail — hero time, 13 skills unlock, prereq, stats gradient | C8 |
| A42 | C3: Celebration variety — sparkle rain, rainbow confetti, trophy B6/B13, graduation B18 | C3 |
| A43 | C4: MCQ variants — code MCQ (B3/B9/B14) + diagram MCQ (B6/B10), 7 screenshots | C4 |
| A44 | C6: Card variants — quote (B6/B10) + interactive expand (B13/B17) | C6 |
| A45 | C7: Progressive disclosure — IntersectionObserver Step 1 scroll reveal, stagger 150ms | C7 |

### NHÓM B: Chưa hoàn thành ❌ (ĐÂY LÀ VIỆC CHÍNH)

**TẤT CẢ C1-C8 DONE. Phát hiện 2 code quality regressions cần fix.**
**TASK TIẾP THEO → Fix inline styles 26→≤20 + fix !important 13→≤12. Rồi user quyết tiếp.**
**KHÔNG commit cho đến khi user cho phép.**

| ID | Task | Ưu tiên | Chi tiết |
|----|------|---------|---------|
| ~~B1~~ | ~~RE-MIGRATE CSS tokens~~ | ~~P0~~ | ✅ **DONE** — surface=50, space=218, dur=16. |
| ~~B2~~ | ~~57 inline .style.prop= → ≤20~~ | ~~P1~~ | ✅ **DONE** — inline=20, classList=152. |
| ~~B3~~ | ~~14 !important → ≤12~~ | ~~P1~~ | ✅ **DONE** — !important=12. Xóa .next-btn.hidden + .challenge-pane[hidden]. |
| ~~B4~~ | ~~Playwright DOM verify 6+ bài~~ | ~~P1~~ | ✅ **DONE** — 6/6 PASS, tokens resolve đúng, no regression. |
| ~~B5~~ | ~~Content verify 18 bài~~ | ~~P1~~ | ✅ **DONE** (audit + 4 fixes + validator refactor). Xem A29-A33. |
| ~~B6~~ | ~~2 duplicate CSS selectors~~ | ~~P2~~ | ✅ **ĐÓNG** — false positive (xem Q4 bên dưới). |
| ~~B7~~ | ~~Mobile viewport test (375px)~~ | ~~P2~~ | ✅ **DONE** — Option A notice + skip, 6/6 PASS. Overflow 125px + small buttons = P3 defer. |
| B8 | **Lighthouse accessibility** | **P2 — DEFER** | Sau khi desktop Nhóm C xong. Lighthouse cần mobile responsive tốt hơn (overflow chưa fix). |
| B9 | **Performance measurement (FPS)** | P2 | Chưa bao giờ đo. |
| B10 | **15 diagram_legacy_N keys** | P3 | Inert clutter, có thể xóa. |
| B11 | **Streak system** | P3 | `streakActive` declared nhưng chưa implement. |
| B12 | **Backend persistence XP/progress** | P3 | In-memory only, mất khi refresh. |
| B13 | **Diff view khi Step 4 Submit sai** | P3 | Token-level SQL diff. |
| B14 | **Light mode cho lesson player** | P3 | Dark-only hiện tại. |
| B15 | **Cross-browser test (Firefox)** | P3 | Chỉ test Chromium. |
| ~~B16~~ | ~~4 style.cssText trong JS~~ | ~~P2~~ | ✅ **DONE** (B2 bonus) — cssText 4→1, chỉ còn sentinel (acceptable). |

### NHÓM C: Cải tiến mong muốn (làm nếu có thời gian)

| ID | Task | Nguồn cảm hứng |
|----|------|----------------|
| ~~C1~~ | ~~Wrong-answer exploration~~ | ✅ **DONE** (18/18 bài, 144/144 options have explanations) |
| ~~C2~~ | ~~Course roadmap visual~~ | ✅ **DONE** — snake layout, hex boss, 3-tier progress |
| ~~C3~~ | ~~Celebration variety~~ | ✅ **DONE** — sparkle rain, rainbow confetti, trophy B6/B13, graduation B18 |
| ~~C4~~ | ~~MCQ variants~~ | ✅ **DONE** — code MCQ (B3/B9/B14) + diagram MCQ (B6/B10) |
| ~~C5~~ | ~~Step-specific entry animations~~ | ✅ **DONE** (72/72 ALL 18 bài verified) |
| ~~C6~~ | ~~Card variants thêm~~ | ✅ **DONE** — quote (B6/B10) + interactive expand (B13/B17) |
| ~~C7~~ | ~~Progressive disclosure Step 1~~ | ✅ **DONE** — IntersectionObserver scroll reveal + stagger |
| ~~C8~~ | ~~Course detail page~~ | ✅ **DONE** — hero time, 13 skills unlock, prereq, stats gradient |

---

## PHẦN 3: WORKFLOW BẮT BUỘC MỖI SESSION

```
1. ĐỌC Phần 2 (Task Tracker) → xác định task nào cần làm
2. KIỂM TRA trạng thái hiện tại:
   - CSS size (PHẢI ≤ 165,000)
   - node -c (cả 2 JS files)
   - Brace balance CSS
3. NẾU CSS vượt cap → FIX TRƯỚC (B1), không được làm gì khác
4. LÀM tasks theo thứ tự ưu tiên: P0 → P1 → P2 → P3 → C
5. SAU MỖI thay đổi → chạy verification:
   - node -c file.js
   - CSS brace balance
   - CSS file size
   - Test ít nhất 1 bài trên real app
6. VIẾT report cuối session liệt kê:
   - Task nào đã làm (với evidence)
   - Task nào chưa làm (với lý do)
   - Trạng thái metrics hiện tại
   - KHÔNG tự chấm > 8.0 mà không có evidence
```

---

## PHẦN 4: DESIGN REFERENCES

Khi thiết kế UI, tham khảo 5 platforms này:

| Platform | URL | Học gì |
|----------|-----|--------|
| shadcn/ui | https://ui.shadcn.com/ | Design tokens, card variants, spacing system, clean components |
| Shaders | https://shaders.com/ | Aurora gradients, glass effects (approximate với CSS), glow states |
| ContentCore | https://contentcore.xyz/ | Minimalist typography, whitespace, progressive disclosure |
| Brilliant.org | https://brilliant.org/home/ | Interactive learning, variety (không screen nào giống nhau), celebrations |
| Codecademy | https://www.codecademy.com/learn | Course cards, dark theme, progress tracking, split-pane IDE |

**Quy tắc áp dụng:**
- VARIETY là thuốc giải cho "AI-generated feel" — không 2 elements nào cùng style
- Glassmorphism: TỐI ĐA 5 elements (header, modal, toast, nav footer, 1 cái nữa)
- Module identity: Amber (M1), Indigo (M2), Emerald (M3) — mỗi module phải NHÌN khác
- Animations PHẢI có mục đích pedagogy — đẹp nhưng không dạy gì = xóa

---

## PHẦN 5: TECHNICAL CONSTRAINTS

```
CSS:
  - File lesson_db_design.css ≤ 165,000 bytes
  - Tất cả giá trị mới PHẢI dùng var(--token)
  - KHÔNG thêm backdrop-filter (budget 6, đang ở 6)
  - KHÔNG thêm !important (trừ prefers-reduced-motion)
  - Mỗi animation mới PHẢI có prefers-reduced-motion override

JS:
  - KHÔNG thêm inline .style.prop= (dùng classList)
  - Ngoại lệ DUY NHẤT: dynamic random positions (particles, confetti)
  - Tất cả code mới PHẢI nằm trong IIFE
  - KHÔNG sửa lesson_content.js trừ khi fix lỗi factual

HTML:
  - KHÔNG thêm external CDN links mới
  - KHÔNG thêm inline styles
  - Restart app.py sau khi sửa template (Flask cache)

Testing:
  - app.py port 9000 (KHÔNG dev_server port 9001)
  - Minimum 6/18 bài: B1, B4, B8, B13, B14, B17
  - Test user: audit@example.com / AuditPass123
```

---

## PHẦN 6: VERIFICATION COMMANDS (copy-paste)

```powershell
# CSS size (MUST ≤ 165000)
$size = (Get-ChildItem "D:\PE_test\static\css\lesson_db_design.css").Length
Write-Host "CSS: $size bytes (cap: 165000, delta: $($size - 165000))"

# Brace balance (MUST = 0)
$css = Get-Content "D:\PE_test\static\css\lesson_db_design.css" -Raw
$diff = ([regex]::Matches($css, '\{')).Count - ([regex]::Matches($css, '\}')).Count
Write-Host "Brace diff: $diff"

# JS syntax (MUST exit 0)
node -c D:\PE_test\static\js\lesson_db_design.js
node -c D:\PE_test\static\js\lesson_content.js

# Inline styles (target ≤ 20)
$js = Get-Content "D:\PE_test\static\js\lesson_db_design.js" -Raw
$inlineCount = ([regex]::Matches($js, '\.style\.\w+\s*=')).Count
Write-Host "Inline .style.prop=: $inlineCount (target: 20 or less)"

# !important (target ≤ 12)
$importantCount = ([regex]::Matches($css, '!important')).Count
Write-Host "!important: $importantCount (target: 12 or less)"

# backdrop-filter (MUST ≤ 6)
$backdropCount = ([regex]::Matches($css, 'backdrop-filter')).Count
Write-Host "backdrop-filter: $backdropCount (cap: 6)"

# 18 bài validation
node -e "const fs=require('fs');const c=fs.readFileSync('D:/PE_test/static/js/lesson_content.js','utf8');const m=c.match(/window\.LESSON_CONTENT\['db_design'\]\s*=\s*(\{[\s\S]*\});/);const d=eval('('+m[1]+')');let ok=0;d.lessons.forEach((l,i)=>{if(l.step_4?.starter&&l.step_4?.hints?.length&&l.step_2?.mcq&&l.step_2?.mini_game&&l.step_1?.visual)ok++;});console.log(ok+'/18 lessons OK');"
```

---

## PHẦN 7: SCORING CRITERIA

| Tiêu chí | 7.0-7.9 | 8.0-8.9 | 9.0+ |
|----------|---------|---------|------|
| Visual_Polish | Tokens defined + partially applied | Tokens applied 80%+, card variants visible, module sub-themes | Evidence: token `:root` block + 3 card variants rendered + module gradient screenshots |
| Interaction_Quality | 3+ micro-interactions | 5+ micro-interactions + step transitions have personality | Evidence: DOM query proving 6+ micro-interactions fire on 6+ lessons |
| Platform_Cohesion | Consistent typography OR colors | Typography + colors + shadows consistent across all tested pages | Evidence: same token values resolve on landing + course + lesson pages |
| Learning_Feel | Celebration exists | XP breakdown + wrong-answer feedback + variety in 3/4 steps | Evidence: Playwright screenshots showing Brilliant-inspired variety |
| Code_Quality | CSS < 170KB, node passes | CSS ≤ 165KB, inline styles ≤ 30, 0 new !important | Evidence: file size + grep counts |

**KHÔNG BAO GIỜ tự chấm 9+ trên Vanilla_Performance mà không đo FPS thực tế.**
**KHÔNG BAO GIỜ tự chấm 9+ trên Aesthetic_Excellence mà không test trên real app (không phải dev_server).**

---

## PHẦN 8: ANTI-DRIFT PROTOCOL

```
MỖI 3 TURNS, bạn PHẢI:
1. Đọc lại Phần 2 (Task Tracker)
2. Liệt kê 3 tasks B-group ưu tiên cao nhất CHƯA làm
3. Xác nhận task hiện tại CÓ NẰM trong danh sách hay không
4. Nếu KHÔNG → dừng lại, quay về task ưu tiên cao nhất

NẾU bạn muốn làm điều gì KHÔNG có trong Task Tracker:
1. Giải thích TẠI SAO nó quan trọng hơn tasks hiện có
2. Ước lượng effort + impact
3. Nếu effort > 30 phút → thêm vào Nhóm C, KHÔNG làm ngay
4. Chỉ làm ngay nếu effort < 15 phút VÀ impact cao (vd: fix crash)

TUYỆT ĐỐI KHÔNG:
- Tạo design system mới khi chưa hoàn thành B-group tasks
- Refactor architecture khi chưa test 6+ bài
- Thêm features mới khi CSS vượt cap
- Bỏ qua P0/P1 để làm P3/C
```

---

---

## PHẦN 9: Q&A ARCHIVE (B1-B5)

Tất cả câu hỏi từ B1-B5 đã được trả lời. Archive ở đây để reference:
- B1: dur tokens (không thêm), divider trim (OK), regression (B4 safe), B6 (closed)
- B2: regression (B4 safe), budget (OK), B16 (closed)
- B3+B4: B5 trước B7, Lighthouse sau B7
- B5: 4 content issues → user đã quyết (xem Phần 10)

---

## PHẦN 10: NHÓM C — TIẾP TỤC

### 10.1. TẤT CẢ Nhóm C DONE

| Task | Status |
|------|--------|
| C1+C1x | ✅ Wrong-answer 144/144 explanations |
| C2 | ✅ Course roadmap snake + hex boss + 3-tier progress |
| C3 | ✅ Celebrations: sparkle rain, rainbow confetti, trophy B6/B13, graduation B18 |
| C4 | ✅ MCQ variants: code (B3/B9/B14) + diagram (B6/B10) |
| C5+C5v | ✅ Step animations 72/72 ALL 18 bài |
| C6 | ✅ Card variants: quote (B6/B10) + interactive expand (B13/B17) |
| C7 | ✅ Progressive disclosure: IntersectionObserver scroll reveal + stagger |
| C8 | ✅ Course detail: hero time, 13 skills unlock, prereq, stats gradient |

### 10.2. ⚠️ CODE QUALITY REGRESSIONS (từ C3-C7)

**Full audit phát hiện 2 regressions cần fix:**

**Regression 1: Inline styles 20→26 (+6)**
C3/C4/C6/C7 thêm inline `.style.prop=` cho dynamic DOM (sparkle particles, expand toggles).
Target: ≤20. Hiện: 26.

**Fix:** Grep 6 inline styles mới, chuyển sang classList nếu có thể. Sparkle particle positions (random) OK giữ inline — chỉ fix static ones.

**Regression 2: !important 6→13 (+7)**  
C5/C6/C7 thêm `!important` trong `prefers-reduced-motion` blocks.
Target: ≤12. Hiện: 13.

**Fix:** Merge multiple `@media (prefers-reduced-motion: reduce)` blocks thành 1 block cuối file — giảm duplicate `!important` declarations. Hoặc combine selectors: `.sparkle-particle, .trophy-celebration, .step1-reveal { animation: none !important; }` thành 1 rule thay vì 3 rules riêng.

### 10.3. Quy trình fix

```
1. Grep tất cả inline .style.prop= → list 26 instances
2. Xác định 6 cái mới (từ C3-C7) — chuyển sang classList nếu static
3. Grep tất cả @media (prefers-reduced-motion) blocks → merge thành 1
4. Target: inline ≤20, !important ≤12
5. Verify: node -c + CSS brace + real app test
```

**Effort:** ~30-45 phút.

### 10.4. SAU KHI FIX REGRESSIONS — user sẽ quyết tiếp

Remaining options (user chưa chọn):
- B11: Streak system (core Brilliant pattern, chưa implement)
- B14: Light mode toggle
- B9: FPS measurement (unlock 9+ scoring)
- B8: Lighthouse accessibility
- B7: Mobile overflow fix (responsive CSS)
- New: courses Intermediate/Advanced

### 10.4. Quy tắc Nhóm C

```
1. CSS budget lesson_db_design.css: ≤ 165,000 (hiện 155,075 — headroom 9,925)
2. Test 3+ bài desktop sau mỗi feature
3. classList only — KHÔNG inline styles
4. lesson_content.js: OK sửa khi thêm data (variant fields, etc.)
5. Report sau mỗi feature
6. Desktop first — KHÔNG mobile/Lighthouse cho đến khi user nói
7. KHÔNG commit — chờ user cho phép
```

---

## PHẦN 11: MOBILE/LIGHTHOUSE — DEFER (tập trung desktop)

User chỉ đạo: **desktop first, mobile/Lighthouse sau.** B7 đã có fallback notice. Còn lại:

| Task | Status | Defer until |
|------|--------|-------------|
| B7 horizontal overflow (125px) | Known, P3 | Sau Nhóm C |
| B7 small buttons (< 44px) | Known, P3 | Sau Nhóm C |
| B8 Lighthouse | DEFER | Sau khi desktop Nhóm C xong + mobile responsive cải thiện |
| B9 FPS measurement | DEFER | Sau Nhóm C |
| B15 Firefox/Safari | DEFER | Sau Nhóm C |

**KHÔNG làm B8/B9/B15 cho đến khi user nói.** Focus 100% vào Nhóm C desktop features.

---

## PHẦN 12: TRẠNG THÁI METRICS HIỆN TẠI (verified 2026-06-27 02:00)

```
=== FILES ===
lesson_db_design.css: 162,963 bytes (cap: 165,000, headroom: 2,037 — CHẬT)
lesson_db_design.js:  ~3,305 lines | SYNTAX OK
lesson_content.js:    ~3,521 lines | SYNTAX OK | 18/18 lessons PASS

=== CODE QUALITY (ALL P1 TARGETS MET ✓) ===
Brace balance: 0 ✓
Inline .style.prop=: 20 ✓
style.cssText: 1 ✓
classList usage: 152
!important: 12 ✓
backdrop-filter: 6 ✓ (cap: 6)
@keyframes: 53

=== TOKEN ADOPTION ===
var(--surface-): 50  ✓
var(--space-):   223 ✓ (+5 from B7)
var(--text-):    198
var(--dur-):     17  ✓ (+1 from B7)
var(--anim-):    125
var(--shadow-):  4

=== TASK STATUS ===
B1-B7: ✅ ALL DONE  |  B6+B16: ✅ CLOSED
C1-C8: ✅ ALL DONE (8 tasks + C1x + C5v = 10 sub-tasks)
B8-B15: DEFER
NEXT: Fix regressions (inline 26→≤20, !important 13→≤12) → user decides

=== LESSON FILES (verified 2026-06-27 08:00) ===
lesson_db_design.css: 159,451 bytes (cap 165,000, headroom 5,549)
lesson_db_design.js: 152,070 bytes
lesson_content.js: 281,812 bytes
!important: 13 ⚠️ (target ≤12, +1 over)
@keyframes: 62
inline .style.prop=: 26 ⚠️ (target ≤20, +6 over)
backdrop-filter: 6 ✓
Token adoption: space=213, surface=48, dur=19, text=196

=== COURSE FILES (separate budget) ===
course_db_design.css: 35,906 bytes
course_db_design.js: 20,382 bytes

=== SCORING (from FULL_AUDIT_2026-06-27.md) ===
Visual_Polish: 8.5 | Interaction_Quality: 8.0 | Platform_Cohesion: 8.0
Learning_Feel: 8.0 | Code_Quality: 7.5 (regressions)
AVERAGE: 8.0/10 (up from 4.5 baseline)
```

---

*File này là nguồn truth duy nhất.
Cập nhật lần cuối: 2026-06-27 08:00. ALL C1-C8 DONE. Full audit score 8.0/10.
2 regressions cần fix: inline 26→≤20, !important 13→≤12.
KHÔNG commit cho đến khi user cho phép.*
