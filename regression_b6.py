"""Step-3 drag regression — Bài 6 composite PK + Bài 10 E2 paths.

Path A: PE_runSQL trên step_4.expected_sql (E2-aware — covers single-table & GROUP BY)
Path B: PE_parseWhereRows (drag_game.js — backward-safe A7a) trên primary-table dataRows

Note: Bài 10 Path A dùng step_4.expected_sql có LIMIT 3 → 3 rows (top 3).
"""
import sys
import asyncio
from playwright.async_api import async_playwright

URL = "http://localhost:9000"

# (lesson_idx, where_input, expected_matched_count_pathB, expected_first_row_substring)
REGRESSION_TESTS = [
    (6,  "dlc_no = 2 AND ref_game_id = 300", 1, "Blood and Wine"),
    (10, "member_id = 'M01'", 1, "Minh"),
]

# Path A expected: step_4.expected_sql — Bài 6 = 1 row, Bài 10 = 3 rows (LIMIT 3 in GROUP BY query)
PATH_A_EXPECTED_ROWS = {
    6: 1,
    10: 3,
}


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1600, "height": 1000})
        page = await ctx.new_page()

        await page.goto(f"{URL}/login", wait_until="domcontentloaded")
        await page.fill("#login-email", "audit@example.com")
        await page.fill("#login-password", "AuditPass123")
        await page.click("#loginBtn")
        try: await page.wait_for_url("**/dashboard**", timeout=30000)
        except Exception: pass

        await page.goto(f"{URL}/lesson/db_design", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_function("() => window.LESSON_CONTENT", timeout=15000)
        await page.wait_for_function("() => typeof window.PE_parseWhereRows === 'function'", timeout=15000)

        results = []

        for lesson_idx, where_input, expected_count_b, expected_substr in REGRESSION_TESTS:
            await page.goto(f"{URL}/lesson/db_design?lesson={lesson_idx}", wait_until="domcontentloaded", timeout=30000)
            await page.wait_for_function("() => window.LESSON_CONTENT", timeout=15000)
            await page.wait_for_timeout(1500)

            expected_count_a = PATH_A_EXPECTED_ROWS[lesson_idx]

            # Path A: PE_runSQL on step_4.expected_sql (E2-aware)
            res_a = await page.evaluate(
                "(args) => {\n"
                "  const lc = window.LESSON_CONTENT['db_design'];\n"
                "  const lesson = lc.lessons[args.idx - 1];\n"
                "  if (!lesson) return { ok: false, error: 'lesson not found' };\n"
                "  const s4 = lesson.step_4;\n"
                "  if (!s4 || !s4.expected_sql) return { ok: false, error: 'no step_4' };\n"
                "  const schema = Object.assign({}, s4.schema);\n"
                "  if (s4.related_schemas) schema.related_schemas = s4.related_schemas;\n"
                "  const result = window.PE_runSQL(s4.expected_sql, schema, null);\n"
                "  if (result.error) return { ok: false, error: result.error };\n"
                "  return { ok: true, rowCount: result.rows.length, firstRow: (result.rows[0] || []).join(' | ') };\n"
                "}",
                {"idx": lesson_idx}
            )

            # Path B: PE_parseWhereRows (drag_game.js step-3 equivalent)
            res_b = await page.evaluate(
                "(args) => {\n"
                "  const lc = window.LESSON_CONTENT['db_design'];\n"
                "  const lesson = lc.lessons[args.idx - 1];\n"
                "  const s4 = lesson.step_4;\n"
                "  const primaryCols = s4.schema.columns.map(c => typeof c === 'string' ? c : c.name);\n"
                "  const primaryData = s4.schema.data || [];\n"
                "  const tableForParse = { columns: primaryCols, dataRows: primaryData };\n"
                "  const matched = window.PE_parseWhereRows(args.whereInput, tableForParse);\n"
                "  if (matched === null) return { ok: false, error: 'parseWhereRows returned null' };\n"
                "  const matchedRow = matched.length ? primaryData[matched[0]] : null;\n"
                "  return {\n"
                "    ok: true,\n"
                "    matchedCount: matched.length,\n"
                "    firstRow: matchedRow ? matchedRow.join(' | ') : null\n"
                "  };\n"
                "}",
                {"idx": lesson_idx, "whereInput": where_input}
            )

            # Verify Path A
            if not res_a.get('ok'):
                results.append((lesson_idx, "A", False, f"FAIL: {res_a.get('error', '')[:80]}"))
            elif res_a['rowCount'] != expected_count_a:
                results.append((lesson_idx, "A", False, f"FAIL: {res_a['rowCount']} != expected {expected_count_a}"))
            elif expected_substr and expected_substr.lower() not in (res_a.get('firstRow') or '').lower():
                results.append((lesson_idx, "A", False, f"FAIL: row='{res_a.get('firstRow')}' missing '{expected_substr}'"))
            else:
                results.append((lesson_idx, "A", True, f"PASS: {res_a['rowCount']} rows, '{res_a['firstRow']}'"))

            # Verify Path B
            if not res_b.get('ok'):
                results.append((lesson_idx, "B", False, f"FAIL: {res_b.get('error', '')[:80]}"))
            elif res_b['matchedCount'] != expected_count_b:
                results.append((lesson_idx, "B", False, f"FAIL: {res_b['matchedCount']} != expected {expected_count_b}"))
            else:
                results.append((lesson_idx, "B", True, f"PASS: {res_b['matchedCount']} matched"))

        # Summary
        print()
        print("=" * 80)
        print(f"{'Bài':<5} {'Path':<6} {'Status':<8} {'Detail'}")
        print("=" * 80)
        for lesson_idx, path, ok, detail in results:
            status = "PASS" if ok else "FAIL"
            print(f"{lesson_idx:<5} {path:<6} {status:<8} {detail}")
        print("=" * 80)
        passed = sum(1 for _, _, ok, _ in results if ok)
        total = len(results)
        print(f"\n{'PASS' if passed == total else 'FAIL'} — {passed}/{total}")

        await browser.close()
        return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
