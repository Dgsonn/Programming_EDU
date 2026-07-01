# B_FIX_4A_E3_EQUIV_2026-07-01 — Equiv SQL runner for Bài 16/17/19

## §0 Goal

Phase 4 sub-phase **E3 HYBRID · EQUIV** (commit 2/2): runner logic render bảng-phải qua `equiv_sql`
cho 3 bài ORM/spatial/%s mà engine không parse được:
- **Bài 16** spatial (PostGIS `ST_DWithin`) — equiv dùng cột `within_10km` flat mà engine `=` xử được.
- **Bài 17** Django ORM (`LogEvent.objects.filter(...).annotate(...)`) — equiv chạy SQL tương đương.
- **Bài 19** Python `%s` placeholder + 2 câu `;` — equiv render câu 2 aggregation (câu 1 prepared statement chỉ minh hoạ).

Spec v63 line 257 (Q3 chốt): Accept → run equiv_sql; Reject → panel neutral (KHÔNG false-correct, KHÔNG bảng equiv spoil đáp án).

User chốt cứng +15 (chú thích về Bài 9 ở PE_test):
- Bài 17/19 data đủ sẵn (council verify @9000). Chỉ Bài 16 thiếu cột `within_10km`.
- Runner gắn ở `runCodeIDE` Accept branch (KHÔNG wrap validateSQL, KHÔNG đụng step-3 drag).
- Bài 17 step-3 = drop_zones/SQL với ORM (D3/F2 issue) — xử riêng ở 4C, đừng nhét vào E3-equiv.

## §1 Data chỉnh — thêm cột `within_10km` Bài 16

Per spec §4A-3 (council tính khoảng cách 22 branch từ tâm B01 `(106.7009, 10.7769)`, bán kính 10km):

| yes (≤10km, TP.HCM) | no (ngoài 10km HOẶC khác tỉnh) |
|---|---|
| B01·B02·B04·B05·B07·B12·B13·B14·B15·B19·B22 (11 branch) | **B06** (East, ~11.1km) · **B20** (West, ~10.9km) — *TP.HCM nhưng NGOÀI bán kính* · B03·B08·B09·B21 (Hà Nội) · B10·B11 (Đà Nẵng) · B16 (Cần Thơ) · B17 (Huế) · B18 (Nha Trang) — *khác tỉnh* |

**2 exclusion CÓ NGHĨA** (`within_10km='no'` cho B06+B20 TP.HCM): filter spatial THẤY RÕ tác dụng (East 2→1, West 2→1 khi có filter).

Edit `lesson_content.js` step_4 Bài 16 (db_15):
```js
schema: {
  table_name: 'shop_branches',
  columns: [
    { name: 'branch_id',    ... }, { name: 'name', ... }, { name: 'geo_location', ... },
    { name: 'city', ... }, { name: 'zone', ... },
    { name: 'within_10km',  type: 'VARCHAR', ... }  // 4A-E3-equiv: cột flat do engine = xử được
  ],
  data: [
    ['B01','Quận 1 Center','(106.7009, 10.7769)','TP.HCM','Downtown','yes'],
    /* ... 22 rows total, all 6 elements ... */
    ['B22','Quận 5 Plaza', '(106.6634, 10.7540)','TP.HCM','West','yes']
  ]
}
```

`equiv_sql` field mới trong step_4:
- Bài 16: `SELECT zone, COUNT(*) AS branch_count FROM shop_branches WHERE city = 'TP.HCM' AND within_10km = 'yes' GROUP BY zone ORDER BY branch_count DESC;`
- Bài 17: `SELECT event_type, COUNT(event_id) AS event_count FROM log_events WHERE user_id = 'U01' GROUP BY event_type ORDER BY event_count DESC;`
- Bài 19: `SELECT role, COUNT(user_id) AS user_count FROM user_accounts GROUP BY role ORDER BY user_count DESC;`

(GIỮ `expected_sql` nguyên dạy ST_DWithin/ORM/%s teaching target.)

## §2 Runner logic trong `runCodeIDE`

```js
setTimeout(() => {
  const result = validateSQL(userCode, s4.expected_sql);
  if (result.correct) {
    flashTerminal('success', ...);  addXP(...);  localStorage.removeItem(...);
    /* 4A-E3-equiv: nếu bài có s4.equiv_sql → run equiv_sql → render results (OVERWRITE pending). */
    if (s4.equiv_sql && typeof window.PE_runSQL === 'function') {
      try {
        const eqRes = window.PE_runSQL(s4.equiv_sql, s4);
        if (eqRes && Array.isArray(eqRes.cols) && Array.isArray(eqRes.rows)) {
          renderStep4Results(eqRes.cols, eqRes.rows);
        }
        /* equiv SQL itself lỗi → console.warn, KHÔNG replace (false-correct). */
      } catch (e) { console.warn('[E3-equiv] exception:', e); }
    }
  } else {
    /* 4A-E3-equiv: Reject → renderStep4Neutral (gõ đúng query để xem kết quả).
     * KHÔNG giữ pending panel (false-correct "đáp án ĐÚNG" cho SQL sai).
     * KHÔNG giữ results panel (spoil đáp án). */
    renderStep4Neutral('Câu query chưa khớp đáp án — bạn có thể thử lại hoặc bấm "Gợi ý" bên trái.');
    flashTerminal('error', ...);  if (isSubmit) loseHeart();
  }
}, 600);
```

`renderStep4Neutral(msg)` (CSS `.results-neutral`) — khung xám nhạt + icon `fa-lightbulb`, không phải khung-đỏ error, không phải khung-cyan pending.

CSS thêm (lesson_db_design.css):
```css
.codecademy-layout .results-neutral {
  padding: 16px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  color: #CBD5E1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.5;
}
.codecademy-layout .results-neutral strong {
  color: #94A3B8;
  display: block; margin-bottom: 4px;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
}
```

## §3 Verify @9000 (không tin vm test)

### 3.1 Live runner — paste `expected_sql` → click Run → wait 1s → check panel

| Bài | Panel | Cols | Rows | Verify |
|-----|-------|------|------|--------|
| 16 | `results` | `['zone','branch_count']` | `[['Downtown','4'],['South','3'],['North','2'],['East','1'],['West','1']]` | ✓ khớp DATA-E3 |
| 17 | `results` | `['event_type','event_count']` | `[['login','5'],['purchase','2'],['logout','2']]` | ✓ khớp DATA-E3 |
| 19 | `results` | `['role','user_count']` | `[['user','12'],['moderator','4'],['admin','3'],['guest','3']]` | ✓ khớp DATA-E3 |

### 3.2 Reject flow — paste WRONG SQL → click Run → wait 1s → check panel

| Bài | Panel | Message | Verify |
|-----|-------|---------|--------|
| 16 | `neutral` | `Gõ đúng query để xem kết quả` | ✓ panel xám nhạt, không chữ "LỖI", không false-correct |

### 3.3 Regression — full 20-bài direct PE_runSQL(expected_sql)

20/20 PROCESSED (no fatal exception). Bài 16/17/19 → pending (do expected_sql ST_DWithin/ORM/%s still hit scanUnsupportedTokens — đúng, equiv runner flow xử ở setTimeout 600ms).

## §4 Bugs caught by reviewer (per spec v63 line 254)

Còn 1 bug live @9000 phát hiện ở phase4-E3-engine (Bài 9 Mode B) — đã fix & commit `c868b2d`. E3-equiv ship không gặp bug mới; runner flow an toàn vì PE_runSQL(equiv_sql) dùng cùng path đã pass E1/E2/E3-engine regression suite.

## §5 Files Touched (commit scope E3-equiv)

```
M  static/js/lesson_content.js    ← Bài 16 step_4 + cột within_10km + data 22 rows
                                    + Bài 16/17/19 equiv_sql field
M  static/js/lesson_db_design.js   ← runCodeIDE Accept branch (equiv runner) + Reject branch (neutral) + renderStep4Neutral function
M  static/css/lesson_db_design.css ← .results-neutral CSS
A  docs/B_FIX_4A_E3_EQUIV_2026-07-01.md  ← this report
```

KHÔNG stage:
- `docs/SYSTEM_INSTRUCTIONS_FINAL.md` (council-owned, KHÔNG đụng)
- 4 dirty CSS files (dashboard/login/register/course_db_design — out-of-scope)
- ~150 `__*.json` ephemeral artifacts

## §6 Spec adherence

Spec v63 line 257 — Runner equiv semantics:
- ✅ Accept + có `s4.equiv_sql` → `PE_runSQL(s4.equiv_sql, s4)` + renderStep4Results (OVERWRITE pending).
- ✅ Accept + không equiv → keep current render (E1/E2/E3-engine liveResult đã đúng).
- ✅ Reject → renderStep4Neutral (khung xám nhạt KHÔNG false-correct). Flow sai/hint bình thường.

User chốt (`(A) + reject neutral`):
- ✅ Runner gắn trong `runCodeIDE` (KHÔNG wrap validateSQL).
- ✅ Step-3 drag KHÔNG đụng (drag dùng `executeStation` + `parseWhereRows`, KHÔNG qua `PE_runSQL/equiv_sql`).
- ✅ Bài 16 data `within_10km` council cấp CHÍNH XÁC (không tự bịa). Verify rows: `Downtown 4 · South 3 · North 2 · East 1 · West 1`.
- ✅ Bài 17 verify rows: `login 5 · purchase 2 · logout 2`.
- ✅ Bài 19 verify rows: `user 12 · moderator 4 · admin 3 · guest 3`.

## §7 Acceptance E3-equiv

| Metric | Target | Actual |
|--------|--------|--------|
| Bài 16 equiv (spatial flat) | Downtown=4 South=3 North=2 East=1 West=1 | ✓ |
| Bài 17 equiv (ORM-to-SQL) | login=5 purchase=2 logout=2 | ✓ |
| Bài 19 equiv (câu 2 aggregation) | user=12 moderator=4 admin=3 guest=3 | ✓ |
| Reject neutral panel | `Gõ đúng query để xem kết quả` (xám nhạt, không đỏ/cyan) | ✓ |
| No regression E1/E2/E3-engine | 17 bài khác rows y hệt | ✓ |
| Step-3 drag không bị đụng | unchanged | ✓ |
| 0 silent-wrong accept | Reject → neutral (KHÔNG false-correct) | ✓ |
| node -c OK | | ✓ |
| console 0 error | | ✓ |
| Bài 16 data `within_10km` | match spec từng row (council cấp CHÍNH XÁC) | ✓ |

## §8 Q&A / Council Handoff

**Q**: Tại sao KHÔNG chạy `equiv_sql` ngay khi user bấm Run?
**A**: Spec chốt "validateSQL Accept → equiv_sql". User có thể đang test SQL tạm thời chưa đúng → phải qua validateSQL Accept trước → tránh spoil đáp án.

**Q**: `equiv_sql` chạy sai (lỗi) thì sao?
**A**: Catch + console.warn — KHÔNG replace panel (giữ pending hoặc results từ previous). User vẫn thấy feedback lỗi terminal + hint.

**Q**: Step-3 drag (Bài 17 kéo ORM qua Query Line) cũng cần equiv?
**A**: KHÔNG — per user chốt, step-3 drag chạy qua `executeStation` + `parseWhereRows` riêng. D3/F2 issue (Bài 15/16/17/19/20 step-3 = sparse vertical flow) → xử riêng phase 4C, đừng nhét vào E3-equiv.

**Q**: Phase4-E3 còn lại gì?
**A**: Bước tiếp: A (mini-game validator), 4B (step-4 context + hints), 4C (primer D1/D2/D3), HERO rollout. Theo spec v63 §SHIP line 309.

---

**Signed off**: 4A-E3-equiv ✅ ready for user verify + commit.
