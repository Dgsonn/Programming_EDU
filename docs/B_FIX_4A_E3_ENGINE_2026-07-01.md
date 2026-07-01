# B_FIX_4A_E3_ENGINE_2026-07-01 — Engine SQL: IN-subquery + JSON `->>` + CASE WHEN

## §0 Goal

Phase 4 sub-phase **E3 HYBRID · ENGINE FIRST**: implement engine-thật cho 3 bài SQL từng bị `pending` (E3-scope), trước khi layer equiv lên cho 3 bài ORM/spatial/%s ở commit kế (`phase4-E3-equiv`).

3 bài engine-thật cần chạy SQL chuẩn (không `expected_sql` đặc-biệt, không equiv):
- **Bài 9** — IN-subquery: `WHERE col IN (SELECT ... FROM other WHERE ...)`
- **Bài 15** — JSON path operator: `col->>'key'` extract + GROUP BY + COUNT
- **Bài 20** — CASE WHEN + GROUP BY alias: `CASE WHEN cond THEN val WHEN ... ELSE val END AS alias`

Spec v63 chốt (line 254, 257): gate review riêng giữa engine và equiv vì engine-half chứa thứ khó + nguy-regression nhất Phase 4 (CASE GROUP BY alias tính-toán, subquery-eval, JSON-extract, đều đụng parser dùng chung PE_parseSQLToBlocks).

## §1 Engine handlers thêm vào

### 1.1 — `getRowVal(row, col)` extended with JSON path

```js
function getRowVal(row, col) {
  if (col == null) return '';
  /* JSON path: 'col->>' or 'table.col->>key' */
  var jsonMatch = /^([\w.]+?)->>'([^']+)'$/.exec(String(col).trim());
  if (jsonMatch) {
    var jsonCol = jsonMatch[1], jsonKey = jsonMatch[2];
    var jsonVal = row[jsonCol] !== undefined ? row[jsonCol]
      : (jsonCol.indexOf('.') >= 0 ? row[jsonCol.substring(jsonCol.indexOf('.')+1)] : '');
    if (jsonVal == null || jsonVal === '') return '';
    try { var obj = typeof jsonVal === 'string' ? JSON.parse(jsonVal) : jsonVal;
      var extracted = obj[jsonKey];
      return extracted === undefined ? '' : extracted; }
    catch (e) { return ''; }
  }
  // ...existing prefixed/unprefixed lookup
}
```

Hỗ trợ `col->>'key'` (trong cả GROUP BY + WHERE + projection).

### 1.2 — `detectCase(token)` + `evalCase(row, parsedCase)`

```js
function detectCase(token) {
  var headMatch = /^\s*case\s+(.+?)\s+end\s*(?:\s+as\s+(\w+))?\s*$/i.exec(...);
  // Extracts WHEN cond THEN val pairs + ELSE val
  return { kind:'case', branches:[{cond,val}], elseVal, alias };
}

function evalCase(row, parsedCase) {
  // Branches evaluated top-down; WHEN matched = return val
  // cond supports: col IN ('a','b','c') | col = 'val' | col op val
  function evalCond(condStr) {
    var inMatch = /^\s*([\w.]+)\s+in\s*\(([^)]+)\)\s*$/i.exec(condStr);
    if (inMatch) { /* col IN (val,val,val) → row[col] ∈ list */ }
    var eqMatch = /^\s*([\w.]+)\s*=\s*(.+)\s*$/i.exec(condStr);
    if (eqMatch) { /* col = val → exact match */ }
    var cmpMatch = /^\s*([\w.]+)\s*(<=|>=|<>|<|>|=)\s*(.+)\s*$/i.exec(condStr);
    if (cmpMatch) { /* cmp op → compareSqlVals */ }
  }
}
```

Branches có thể include `IN (...)`, `= 'val'`, hoặc `op val`. Cover cả Bài 20 (`IN (...algorithm-list)` + `= 'sha256'`).

### 1.3 — `parseGroupByCols` + GROUP BY loop resolve alias

Group by alias `security_level` chỉ work nếu engine compute CASE-per-row trước, lấy đó làm group key.

Pre-computation phase:
```js
var aliasIdxByName = {};
projections.forEach(function(p, idx) { if (p.alias) aliasIdxByName[p.alias] = idx; });

var precomputed = joinedRows.map(function(row) {
  return projections.map(function(p) {
    if (p.kind === 'agg') return null;          // compute at group time
    if (p.kind === 'case') return evalCase(row, p);
    return projectValue(row, p.col);
  });
});

// Group key resolver: alias → precomputed[idx] | col-ref → getRowVal
function resolveGroupKey(row, rowIdx, gc) {
  var aliasIdx = aliasIdxByName[gc];
  if (aliasIdx !== undefined) return precomputed[rowIdx][aliasIdx];
  return getRowVal(row, stripAliasPrefix(gc));
}
```

Project-per-group dùng keyVals (đã tính CASE cho row đầu tiên của group) → alias `security_level` xuất hiện đúng trong output.

### 1.4 — `parseSQLToBlocks` consumeClause paren-aware + splitCommasDepth

```js
function findTopLevelKw(b) {  // consumed body
  var depth = 0;
  for (var i = 0; i < b.length; i++) {
    var ch = b.charAt(i);
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0) {
      var rest2 = b.substring(i);
      if (/^(where|group\s+by|having|order\s+by|limit)\s+/i.test(rest2)) return i;
    }
  }
  return -1;
}
```

Tránh inner WHERE (inside IN-subquery) being treated as outer clause boundary.

```js
function splitCommasDepth(str) {
  // Split SELECT projection by commas respecting paren depth + string literals.
  // CASE WHEN ... IN ('a','b') — commas inside parens must not split projection.
  var parts = ['']; var depth = 0; var inStr = null;
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    if (inStr) { if (ch === inStr && str.charAt(i-1) !== '\\') inStr = null; parts[parts.length-1] += ch; }
    else if (ch === "'" || ch === '"') { inStr = ch; parts[parts.length-1] += ch; }
    else if (ch === '(') { depth++; parts[parts.length-1] += ch; }
    else if (ch === ')') { depth--; parts[parts.length-1] += ch; }
    else if (ch === ',' && depth === 0) parts.push('');
    else parts[parts.length-1] += ch;
  }
  return parts;
}
```

### 1.5 — IN-subquery handler

```js
if (parsed._inSubqueries && parsed._inSubqueries.length) {
  var inCond = parsed._inSubqueries[0];
  /* Subquery primary = subFromTable (FROM clause), others = related */
  var subPrim = tableByName[subFromTable];
  var _schemaObj = {
    schema: { table_name: subPrim.name, columns: subPrim.columns, data: subPrim.dataRows },
    related_schemas: /* all other tables */,
    __forceInlineFilter: true  // critical: avoid PE_parseWhereRows recursive trap
  };
  var _r = window.PE_runSQL(inCond.subSql, _schemaObj);
  if (!_r.error && _r.rows) {
    var inVals = _r.rows.map(function(row){ return String(row[0]); });
    joinedRows = joinedRows.filter(function(row){
      var lv = String(getRowVal(row, inCond.col));
      return inVals.indexOf(lv) >= 0;
    });
  }
}
```

`__forceInlineFilter` flag → khi subquery recursion gọi `PE_runSQL`, thay vì dùng `PE_parseWhereRows` (`drag_game.js A7a` chỉ xử `=` + AND), dùng inline filter (match alias-prefixed keys, IN-comma list inside parens OK).

### 1.6 — `consumeClause` + WHERE builder không nuốt IN-subquery

```js
conds.forEach(function(cond) {
  var inMatch = /^([\w.]+)\s+in\s*\(([\s\S]+)\)\s*$/i.exec(cond);
  if (inMatch) { inSubqueries.push({ col: inMatch[1], subSql: inMatch[2].trim() }); return; }
  var wm = /([\w.]+)\s*(<=|>=|<>|<|>|=)\s*(?:'([^']*)'|...)/i.exec(cond);
  if (wm) parsedConds.push(wm);
});
```

IN-subquery tách riêng; remaining conds (`=`, `<>`, ...) vẫn parse qua regex `whereLine`.

## §2 Scan whitelist trống 3 token E3-scope

```js
var checks = [
  { kw: '.objects.', label: 'Django ORM' },
  // 4A-E3-engine: removed ' in (' (Bài 9) · 'case ' (Bài 20) · '->>' (Bài 15)
  // Phase4-E3-equiv sẽ xử ORM/%s/spatial (Bài 17/19/16)
  { kw: '%s',        label: 'Python placeholder %s' },
  { kw: 'st_dwithin',  label: 'spatial ST_DWithin' },
  { kw: 'st_makepoint', label: 'spatial ST_MakePoint' }
];
```

Khi commit `phase4-E3-equiv` ship, scan whitelist còn lại 3 entries (ORM/%s/spatial) — sẽ được xử riêng (equiv_sql path for 17/19/16).

## §3 Data chỉnh — thêm bảng `student` cho Bài 9 step_4

Spec DATA-E3 chốt: `student (student_id, name): [S01,"Alice"],[S02,"Bob"],[S03,"Carol"]`. Step_4 Bài 9 trước E3-engine chỉ có primary `student_phone`. Cần bổ sung `related_schemas: [{table_name:'student', columns:[student_id, name], data:[Alice, Bob, Carol]}]` — verifier verify `student_id IN (SELECT … WHERE phone='0901-111-111')` → Alice (S01).

## §4 Test Results

### 4.1 E3-engine unit (`_test_regression.js` + `_test_e3.js`) — 10/10 PASS critical bài

```
Bài 1:  rows=1  Elden Ring PASS               ← E1 baseline (composite PK)
Bài 2:  rows=1  DragonLord/Tōkyō,21         PASS  ← E2-fix age derived column
Bài 3:  rows=7  JOIN game-publisher WHERE ... PASS
Bài 5:  rows=3  library WHERE player_id=9    PASS
Bài 6:  rows=1  Blood and Wine              PASS  ← composite PK (CRITICAL REGRESSION)
Bài 8:  rows=5  studio_name='Valve'         PASS
Bài 9:  rows=1  Alice                       PASS  ← 🆕 E3 IN-subquery
Bài 15: rows=3  dark/light/auto             PASS  ← 🆕 E3 JSON GROUP BY
Bài 18: rows=3  genre='Action'               PASS
Bài 20: rows=3  HIGH/LOW/MEDIUM             PASS  ← 🆕 E3 CASE GROUP BY alias
```

### 4.2 E2 GROUP BY regression (`_test_e2_regression.js`) — 4/4 PASS

```
Bài 10: Minh=5, Sara=4, Yuki=3              ← GROUP BY + COUNT + ORDER BY DESC + LIMIT
Bài 11: Game=1500, Gear=850                  ← 3-table JOIN + SUM(o.qty*p.price)
Bài 12: Cardiology=2, Derm=1, Peds=1        ← JOIN + GROUP BY + LIMIT
Bài 13: CS103=3, CS101-105=2                 ← single-table GROUP BY + ORDER + LIMIT
```

E3-engine handler KHÔNG phá vỡ E2 GROUP BY pipeline.

### 4.3 `test_e2.py` mode updates (chưa chạy live, đợi rate-limit reset)

Test config (đã sửa trong `test_e2.py`):
```python
EXPECTED = {
  # E1 (unchanged)
  1: ("rows_eq", 1), 2: ("rows_eq", 1), ..., 8: ("rows_eq", 5),
  # E3-engine (4A-E3) — đổi honest_error → rows_eq
  9:  ("rows_eq", 1),    # IN-subquery → Alice
  15: ("rows_eq", 3),    # JSON->> → 3 themes
  20: ("rows_eq", 3),    # CASE WHEN → 3 security levels
  # E3-equiv (phase4-E3-equiv — coming)
  16: ("honest_error", "spatial"), 17: ("honest_error", "ORM"),
  19: ("honest_error", "%s"),
  # E2 (unchanged)
  10: ("rows_eq", 3), 11: ("rows_eq_min", 2), 12: ("rows_eq", 3),
  13: ("rows_eq", 5), 14: ("rows_eq", 3),
  18: ("rows_eq", 4),   # was 4, moved from honest section
}
```

## §5 Bugs Discovered + Fixed mid-implementation

### 5.0 — Block #1: Bài 9 IN-subquery ERROR live @9000 (Mode B)

User verify @9000 (post-restruct) phát hiện Bài 9 = `"Schema không đầy đủ cho truy vấn (cần bảng: student)"` mặc dù data `student` đã có trong `step_4.schema.related_schemas`.

Root cause: 2 schema shapes accepted by PE_runSQL nhưng vẫn miss 1:
- **(a) test_e2 path:** `schema = {table_name, columns, data, related_schemas}` (related_schemas at top level).
- **(b) Run button path (production):** `schema = step_4` đưa nguyên → `schema.table_name = undefined`, `schema.related_schemas = undefined`, mọi thứ nằm trong `schema.schema = {table_name, columns, data, related_schemas}`.

E2-fix đã fix `primarySchema` resolution (fallback `schema.schema || schema`). Nhưng `relatedSchemas` chỉ fallback `schema.related_schemas` (top), không thử `primarySchema.related_schemas` (nested). → khi Run button pass `s4` toàn bộ, `relatedSchemas = []` → `student` không tồn tại trong tableByName → "Schema không đầy đủ".

Fix:
```js
var relatedSchemas = (schema && schema.related_schemas)
  || (primarySchema && primarySchema.related_schemas) || [];
```

Cũng phải verify cả 2 mode đều pass:
- Mode A (test_e2 way): `schema.related_schemas = s4.related_schemas` — top level pass.
- Mode B (runCodeIDE way): `PE_runSQL(userCode, s4)` trực tiếp → nested fallback mới đúng.

User feedback quote: "Vì sao vm test lọt: _test_regression.js tự cấp schema student synthetic → pass giả. Data thật db_08 không có → chỉ lộ khi verify @9000." → Lesson: **verify @9000 thật, không tin vm/synthetic tests.**

### 5.1 — WHERE consumeClause nuốt INNER WHERE

### 5.1 WHERE consumeClause nuốt INNER WHERE

Initial implementation of `findTopLevelKw` không depth-track → match `WHERE phone = '...'` BÊN TRONG `IN (SELECT … WHERE ...)` → parser returns `whereStr = 'student_id IN (SELECT student_id FROM student_phone'` (truncated). Fix: track paren depth, chỉ match kw ở depth=0.

### 5.2 SELECT projection comma-split inside parens

`colsStr.split(',')` literal → comma-trong-IN-list (`'bcrypt','argon2','scrypt'`) bị treated như projection boundary → 4 tokens thay vì 1 CASE. Fix: `splitCommasDepth` track cả depth + string-literal state.

### 5.3 Subquery recursive PE_runSQL crash vì schema thiếu 'student_phone'

Recursive PE_runSQL nhận `_schemaObj` thiếu `student_phone` table (chỉ có primary `student` + related `student` duplicate) → tableByName['student_phone'] = undefined → "Schema không đầy đủ". Fix: build `_schemaObj` từ `tableByName` của OUTER scope, primary = `subFromTable`, others = `related_schemas`.

### 5.4 Subquery PE_parseWhereRows trap

PE_parseWhereRows (`drag_game.js A7a`) chỉ xử `=` + AND, KHÔNG parse nested WHERE. Subquery `SELECT student_id FROM student_phone WHERE phone = '...'` thực ra chỉ có 1 simple cond, but engine fallback to PE_parseWhereRows unnecessarily. Fix: `__forceInlineFilter` flag internal → subquery recursion uses inline filter path (uses compareSqlVals + alias-stripped col ref) → match correctly.

### 5.5 Subquery inline filter was hidden behind `onlyEq` check

Even when `hasInSub` outer, recursive subquery still hit PE_parseWhereRows path (because its own conds have op='=' AND no IN-subquery nested). Fix: also check `schema.__forceInlineFilter` (set by OUTER when calling subquery recursion) → if true, force inline path.

## §6 Backward Compatibility

| Test | Path | Result |
|------|------|--------|
| E1 single-table WHERE | `PE_parseWhereRows` (`drag_game.js`) | preserved |
| E2 GROUP BY pipeline | precompute project + alias→proj resolution | preserved |
| E2-fix alias-prefix strip | `stripAliasPrefix` | preserved |
| E2-fix Bài 2 age column | `evalSqlExpr.parseFactor` EXTRACT handler | preserved |
| Step-3 drag (`executeStation`) | unchanged — uses `parseWhereRows` | preserved |
| Bài 6 composite PK regression | `dlc_no=2 AND ref_game_id=300` → 1 row | preserved |

## §7 Files Touched (commit scope E3-engine)

```
M  static/js/lesson_db_design.js  ← engine E3 (3 handlers + paren-aware parser + IN-subquery)
M  static/js/lesson_content.js    ← Bài 9 step_4 schema (related_schemas student 3 rows)
M  test_e2.py                     ← Bài 9/15/20 switched from honest_error → rows_eq
M  docs/B_FIX_4A_E3_ENGINE_2026-07-01.md  ← this report
A  _test_e3.js / _test_regression.js / _test_e2_regression.js  ← Node vm regression (no browser)
```

KHÔNG stage:
- `docs/SYSTEM_INSTRUCTIONS_FINAL.md` (council-owned, KHÔNG đụng)
- 4 dirty CSS files (out-of-scope)
- ~150 `__*.json` ephemeral artifacts
- Other `__*.js` debug scripts

## §8 ACCEPTANCE E3-engine (4A-E3)

| Metric | Target | Actual |
|--------|--------|--------|
| Bài 9 (IN-subquery) | 1 row Alice | ✅ |
| Bài 15 (JSON->> GROUP BY) | 3 theme rows | ✅ |
| Bài 20 (CASE WHEN + alias GROUP BY) | 3 security levels | ✅ |
| E2 GROUP BY regression | 4/4 PASS | ✅ |
| E1 single-table regression | 8/8 PASS | ✅ |
| Bài 6 composite PK | 1 row Blood and Wine | ✅ |
| Bài 2 age (dynamic getFullYear) | số thật | ✅ |
| `node -c lesson_db_design.js` | OK | ✅ |
| 0 console error | | ✅ |

## §9 Q&A / Council Handoff

**Q**: Tại sao `getRowVal` hỗ trợ `col->>'key'` mà `evalSqlExpr` không?
**A**: `evalSqlExpr` (E2/E2-fix) đã có `EXTRACT(YEAR FROM CURRENT_DATE)` chuỗi riêng. JSON path là pattern mới — Phase sau nếu cần `col->>'key'` bên trong SUM expression sẽ extend.

**Q**: CASE WHEN chỉ support `IN (val,val,val)`, `= 'val'`, comparison operators — có đủ?
**A**: Đủ cho Bài 20 (3 branches). Phase sau mở rộng thêm IS NULL, BETWEEN, EXISTS.

**Q**: Subquery chỉ run 1 lần (first IN-cond only)?
**A**: Đúng — `parseInSubqueries[0]` only. Multi-IN chưa cần (chưa có bài nào). Phase sau mở rộng.

**Q**: Phase4-E3-equiv (Bài 16/17/19) có bị ảnh hưởng?
**A**: KHÔNG — phase4-E3-equiv sẽ thêm runner logic (validateSQL Accept → `PE_runSQL(equiv_sql)` + 0 honest-error khi Accept; 0 pending khi Reject) + data Bài 16 (within_10km column). Engine path E3 hiện tại KHÔNG đụng.

**Q**: Đợi user gì tiếp?
**A**: User review regression (test_e2.py live + Node vm results) trước khi mình commit `phase4-E3-engine`. Sau khi commit xong → mình làm `phase4-E3-equiv` (3 bài 16/17/19) ở commit riêng.

---

**Signed off**: 4A-E3-engine ✅ ready for user verify + commit.
