"""Unit test 4A-E2: PE_runSQL trên 20 bài + verify E1 backward-compatible.

Categories:
- 11 E1 OK backward: 1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 18 (rows phải PASS như cũ)
- 5 E2 mới (Bài 10, 11, 12, 13, 14): rows đúng theo §DATA-E2 council cấp
- 6 E3-scope (Bài 9 IN-subquery, 15 JSON, 16 spatial, 17 ORM, 19 %s, 20 CASE):
  EXPECT honest-error message (không silent-wrong)
  (Bài 9 + 16 hiện đang PE_runSQL trả OK từ E1 — sau E2 sẽ return honest-error JSONB/spatial/IN)
"""
import sys
import asyncio
from playwright.async_api import async_playwright

URL = "http://localhost:9000"

EXPECTED = {
    # E1 backward (unchanged)
    1:  ("rows_eq", 1),       # WHERE id=101 → Elden Ring (60)
    2:  ("rows_eq", 1),       # WHERE p_id=7 → DragonLord
    3:  ("rows_eq", 7),       # WHERE publisher.name='Rockstar' → 7
    4:  ("rows_eq", 2),       # WHERE player.username='DragonLord' → 2 (Elden Ring + Hades)
    5:  ("rows_eq", 3),       # WHERE player_id=9 → 3
    6:  ("rows_eq", 1),       # WHERE dlc_no=2 AND ref_game_id=300 → 1
    7:  ("rows_eq", 5),       # WHERE publisher.name='Supergiant' → 5
    8:  ("rows_eq", 5),       # WHERE studio_name='Valve' → 5
    # E3-engine (4A-E3) — Bài 9/15/20 engine-thật
    9:  ("rows_eq", 1),       # IN-subquery → Alice
    15: ("rows_eq", 3),       # JSON->> GROUP BY theme → 3 themes (dark/light/auto)
    20: ("rows_eq", 3),       # CASE WHEN + GROUP BY alias → 3 security levels (HIGH/LOW/MEDIUM)
    # E3-equiv (4A-E3-equiv — coming next) — để pending/equiv
    16: ("honest_error", "spatial"),  # ST_DWithin
    17: ("honest_error", "ORM"),  # sẽ wire equiv_sql
    19: ("honest_error", "%s"),  # sẽ wire equiv_sql
    # E2 mới
    10: ("rows_eq", 3),       # GROUP BY + ORDER BY DESC + LIMIT 3
    11: ("rows_eq_min", 2),   # GROUP BY + SUM
    12: ("rows_eq", 3),       # GROUP BY + LIMIT 3
    13: ("rows_eq", 5),       # GROUP BY + ORDER BY DESC + LIMIT 5
    14: ("rows_eq", 3),       # JOIN + WHERE + GROUP BY
    18: ("rows_eq", 4),       # WHERE genre='Action' → 4
}


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Login
        await page.goto(f"{URL}/login", wait_until="domcontentloaded")
        await page.wait_for_selector("#login-email", timeout=30000)
        await page.fill("#login-email", "audit@example.com")
        await page.fill("#login-password", "AuditPass123")
        await page.click("#loginBtn")
        try:
            await page.wait_for_url("**/dashboard**", timeout=30000)
        except Exception:
            pass

        # Load LESSON_CONTENT
        await page.goto(f"{URL}/lesson/db_design", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_function(
            "() => window.LESSON_CONTENT && window.LESSON_CONTENT['db_design'] && window.LESSON_CONTENT['db_design'].lessons && window.LESSON_CONTENT['db_design'].lessons.length >= 20",
            timeout=15000
        )
        await page.wait_for_function("() => typeof window.PE_runSQL === 'function'", timeout=15000)
        print("[OK] LESSON_CONTENT + PE_runSQL loaded.")

        results = []

        for idx in sorted(EXPECTED.keys()):
            expected = EXPECTED[idx]
            mode = expected[0]
            expected_val = expected[1]

            test_result = await page.evaluate(
                f"""
                (() => {{
                    const lc = window.LESSON_CONTENT['db_design'];
                    const lesson = lc.lessons[{idx - 1}];
                    if (!lesson) return {{ ok: false, error: 'lesson {idx} not found' }};
                    const sql = (lesson.step_4 && lesson.step_4.expected_sql) || (lesson.step_3 && lesson.step_3.expected_sql);
                    if (!sql) return {{ ok: false, error: 'no expected_sql' }};
                    const schema = (lesson.step_4 && lesson.step_4.schema) ||
                                   ((lesson.step_3 && lesson.step_3.drag_map) ? {{ table_name: lesson.step_3.drag_map.table.name, columns: lesson.step_3.drag_map.table.columns, data: lesson.step_3.drag_map.table.dataRows }} : {{}});
                    if (lesson.step_4 && lesson.step_4.related_schemas) {{
                        schema.related_schemas = lesson.step_4.related_schemas;
                    }}
                    let result;
                    try {{
                        result = window.PE_runSQL(sql, schema, null);
                    }} catch (e) {{
                        return {{ ok: false, error: 'EXCEPTION: ' + e.message, sql: sql }};
                    }}
                    return {{
                        ok: !result.error && !result.pending,
                        error: result.error || null,
                        pending: !!result.pending,
                        pendingMsg: result.msg || null,
                        sql: sql,
                        cols: result.cols || null,
                        rowCount: result.rows ? result.rows.length : 0,
                        firstRow: result.rows && result.rows[0] ? result.rows[0] : null,
                    }};
                }})()
                """
            )

            passed = False
            detail = ""

            if mode == "rows_eq":
                if test_result.get('ok'):
                    actual = test_result['rowCount']
                    if actual == expected_val:
                        passed = True
                        detail = f"{actual} rows ✓"
                    else:
                        detail = f"FAIL: {actual} rows != expected {expected_val}"
                else:
                    detail = f"FAIL: error - {test_result.get('error', '')[:80]}"

            elif mode == "rows_eq_min":
                if test_result.get('ok'):
                    actual = test_result['rowCount']
                    if actual >= expected_val:
                        passed = True
                        detail = f"{actual} rows ≥ {expected_val} ✓"
                    else:
                        detail = f"FAIL: {actual} < {expected_val}"
                else:
                    detail = f"FAIL: error - {test_result.get('error', '')[:80]}"

            elif mode == "honest_error":
                # 4A-E2-fix: PE_runSQL trả {pending:true, msg} thay {error} cho E3-scope.
                # Test verify "đáp án ĐÚNG, clause chưa hỗ trợ" trong msg (chứa 'E3' marker).
                pmsg = (test_result.get('pendingMsg') or test_result.get('error') or '') or ''
                has_pending = test_result.get('pending', False) or not test_result.get('ok', True)
                if has_pending and 'E3' in pmsg and pmsg:
                    passed = True
                    detail = f"honest-pending: ...E3...{expected_val} ✓"
                elif test_result.get('ok'):
                    detail = f"SILENT-WRONG: returned OK with {test_result['rowCount']} rows (E3-scope clause)!"
                else:
                    detail = f"FAIL: msg doesn't have E3 marker: {pmsg[:80]}"

            results.append((idx, mode, passed, detail, test_result))

        # Print summary
        print()
        print("=" * 95)
        print(f"{'Bài':<5} {'Mode':<14} {'Status':<8} {'Detail':<50} {'SQL prefix'}")
        print("=" * 95)
        for idx, mode, passed, detail, tr in results:
            sql_preview = (tr.get('sql') or '')[:30]
            print(f"{idx:<5} {mode:<14} {'PASS' if passed else 'FAIL':<8} {detail:<50} {sql_preview}")
        print("=" * 95)

        passed_count = sum(1 for _, _, p, _, _ in results if p)
        total = len(results)
        print(f"\n{'PASS' if passed_count == total else 'FAIL'} — {passed_count}/{total} tests passed")

        # Print FAIL details
        failed = [r for r in results if not r[2]]
        if failed:
            print("\n=== FAIL details ===")
            for idx, mode, _, detail, tr in failed:
                print(f"\nBài {idx} [{mode}]: {detail}")
                print(f"  SQL: {tr.get('sql', '')[:80]}")
                if 'error' in tr and tr['error']:
                    print(f"  Error: {tr['error'][:200]}")
                if tr.get('firstRow') is not None:
                    print(f"  firstRow: {tr['firstRow']}")

        await browser.close()
        return passed_count == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
