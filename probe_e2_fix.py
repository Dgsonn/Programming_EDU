"""Probe E2-fix: pending neutral (Bài 15) + alias header strip (Bài 10) + age column (Bài 2)."""
import asyncio, os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1600, "height": 1000})
        page = await ctx.new_page()
        await page.goto("http://localhost:9000/login")
        await page.fill("#login-email", "audit@example.com")
        await page.fill("#login-password", "AuditPass123")
        await page.click("#loginBtn")
        try: await page.wait_for_url("**/dashboard**", timeout=30000)
        except: pass

        async def probe(idx):
            await page.goto(f"http://localhost:9000/lesson/db_design?lesson={idx}", timeout=30000)
            await page.wait_for_function("() => window.LESSON_CONTENT", timeout=15000)
            await page.wait_for_timeout(2000)
            await page.evaluate("() => window.goToStep(4)")
            await page.wait_for_timeout(1500)
            sql = await page.evaluate(f"() => window.LESSON_CONTENT['db_design'].lessons[{idx - 1}].step_4.expected_sql")
            await page.evaluate(f"""
                () => {{
                    const cm = document.querySelector('.CodeMirror');
                    if (cm && cm.CodeMirror) cm.CodeMirror.setValue({sql!r});
                }}
            """)
            await page.wait_for_timeout(500)
            await page.evaluate("() => { const b = document.getElementById('btn-run'); if (b) b.click(); }")
            await page.wait_for_timeout(2500)
            return await page.evaluate("""
                () => {
                    const el = document.getElementById('step4-results');
                    if (!el) return null;
                    const pending = el.querySelector('.results-pending');
                    const error = el.querySelector('.results-error');
                    const table = el.querySelector('table');
                    if (pending) {
                        return { panel: 'pending', html: el.innerHTML.substring(0, 700) };
                    }
                    if (error) {
                        return { panel: 'error', html: el.innerHTML.substring(0, 700) };
                    }
                    if (table) {
                        const ths = Array.from(table.querySelectorAll('thead th')).map(t => t.textContent.trim());
                        const trs = Array.from(table.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()));
                        return { panel: 'results', cols: ths, rows: trs };
                    }
                    return { panel: 'idle' };
                }
            """)

        OUT = r"D:\PE_test\screenshots\phase4_E2_fix"
        os.makedirs(OUT, exist_ok=True)

        for idx in [2, 10, 15]:
            info = await probe(idx)
            print(f'\n=== Bài {idx} ===')
            print(info)
            ss = os.path.join(OUT, f"step4_b{idx}_1600_e2fix.png")
            await page.screenshot(path=ss, full_page=False)
            print(f'  screenshot: {ss}')

        await browser.close()

asyncio.run(main())
