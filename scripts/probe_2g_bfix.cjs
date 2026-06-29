// Phase 2g-Bfix probe — verify B1 (map fit-height visibility) + B2 (cyan btn) + B3 (track glow) + B4 (typed SQL success)
// Run: node scripts/probe_2g_bfix.cjs
const { chromium } = require('playwright');
const BASE = 'http://localhost:9000';
const OUT_DIR = 'D:\\PE_test\\screenshots\\2g';

const LESSON = 1;
const CORRECT_SQL = 'SELECT name, price FROM game_catalog WHERE id = 101';
const RUN_TIMEOUT_MS = 14000; // pacing ~2.7s/station × 3-4 stations + buffer

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.fill('#login-email', 'audit@example.com');
  await page.fill('#login-password', 'AuditPass123');
  await page.evaluate(() => {
    if (typeof window.handleLogin === 'function') {
      window.handleLogin({ preventDefault: () => {}, currentTarget: document.querySelector('button[onclick*="handleLogin"]'), stopPropagation: () => {} });
    } else {
      const btn = document.querySelector('button[onclick*="handleLogin"]');
      if (btn) btn.click();
    }
  });
  await page.waitForURL(/\/(dashboard|lesson|courses)/, { timeout: 15000 });
}

async function gotoStep3(page, lessonNum, viewportW) {
  await page.goto(`${BASE}/lesson/db_design?lesson=${lessonNum}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.evaluate(() => { if (typeof window.goToStep === 'function') window.goToStep(3); });
  await page.waitForTimeout(800);
}

function dump(label, obj) {
  console.log(`  ${label}: ${JSON.stringify(obj)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const vp of [{w:960,h:900},{w:1600,h:900}]) {
    const viewportW = vp.w, viewportH = vp.h;
    const tag = viewportW;
    console.log(`\n=== Viewport ${viewportW}x${viewportH} ===`);

    const ctx = await browser.newContext({ viewport: { width: viewportW, height: viewportH } });
    const page = await ctx.newPage();
    await login(page);
    await gotoStep3(page, LESSON, viewportW);

    // B1: probe geometry
    const b1 = await page.evaluate(() => {
      const map = document.querySelector('[data-town-map]') || document.querySelector('.town-map');
      const hub = document.querySelector('.pe-hub-group') || document.querySelector('.pe-hub') || document.querySelector('.town-landmark');
      const manifest = document.querySelector('.town-manifest');
      const track = document.querySelector('.town-map-track');
      const mount = document.getElementById('drag-game-mount');
      const r = (el) => el ? { x: el.getBoundingClientRect().left, y: el.getBoundingClientRect().top, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, bottom: el.getBoundingClientRect().bottom } : null;
      const m = r(map); const h = r(hub); const mn = r(manifest); const tt = r(track); const mm = r(mount);
      const checks = {
        mapWidthGte420: m ? m.w >= 420 : null,
        hubInsideMap: m && h ? h.bottom <= m.bottom + 1 : null,
        manifestInsideMap: m && mn ? mn.bottom <= m.bottom + 1 : null,
        trackHeight: tt ? tt.h : null,
        mountHeight: mm ? mm.h : null,
      };
      return { map: m, hub: h, manifest: mn, track: tt, mount: mm, checks };
    });
    dump('B1 geometry', b1);

    // B2: probe button cyan
    const b2 = await page.evaluate(() => {
      const btn = document.querySelector('.run-query-btn');
      if (!btn) return null;
      const cs = getComputedStyle(btn);
      return { bg: cs.backgroundColor, color: cs.color, boxShadow: cs.boxShadow, text: btn.textContent.trim() };
    });
    dump('B2 button', b2);

    // B3: probe track glow
    const b3 = await page.evaluate(() => {
      const r = document.querySelector('.town-route');
      const s = document.querySelector('.town-route-shadow');
      const f = document.querySelector('.town-route-flow');
      const cs = (el) => el ? { stroke: getComputedStyle(el).stroke, width: getComputedStyle(el).strokeWidth, opacity: getComputedStyle(el).opacity, filter: getComputedStyle(el).filter, animationPlayState: getComputedStyle(el).animationPlayState } : null;
      return { route: cs(r), shadow: cs(s), flow: cs(f) };
    });
    dump('B3 track', b3);

    // Screenshot: idle
    await page.screenshot({ path: `${OUT_DIR}\\step3_default_${tag}.png` });
    console.log(`  ✓ idle @${tag}`);

    // B4: type SQL, click Run, wait ~14s, check success
    const b4 = await page.evaluate(async (sql) => {
      const ide = document.getElementById('ide-code');
      if (!ide) return { ok: false, reason: 'no #ide-code' };
      // Focus + clear + type via execCommand to trigger handlers
      ide.focus();
      ide.textContent = '';
      document.execCommand('insertText', false, sql);
      // Dispatch blur to hydrate
      ide.dispatchEvent(new Event('blur'));
      // Click Run button (delegation will catch)
      const btn = document.querySelector('.run-query-btn');
      if (!btn) return { ok: false, reason: 'no .run-query-btn' };
      btn.click();
      return { ok: true, ideText: ide.textContent.trim(), btnDisabled: btn.disabled };
    }, CORRECT_SQL);
    dump('B4 start', b4);

    // Capture running state mid-execution (~3.5s in: ga 2/4 active)
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${OUT_DIR}\\step3_running_${tag}.png` });
    console.log(`  ✓ running @${tag}`);

    // Wait remaining time
    await page.waitForTimeout(RUN_TIMEOUT_MS - 3500);

    // Check final state
    const b4Done = await page.evaluate(() => {
      const pill = document.querySelector('.feedback-pill, .step3-feedback-pill, [data-feedback-pill]');
      const map = document.querySelector('.town-map');
      const truck = document.querySelector('[data-town-truck]');
      const btn = document.querySelector('.run-query-btn');
      const correct = document.querySelector('.step3-state-correct, [data-state="correct"]');
      return {
        pillText: pill ? pill.textContent.trim() : null,
        pillClasses: pill ? pill.className : null,
        mapIsRunning: map ? map.classList.contains('is-running') : null,
        truckText: truck ? truck.textContent.trim() : null,
        btnText: btn ? btn.textContent.trim() : null,
        btnDisabled: btn ? btn.disabled : null,
        correctEl: !!correct,
      };
    });
    dump('B4 done @'+RUN_TIMEOUT_MS+'ms', b4Done);

    await page.screenshot({ path: `${OUT_DIR}\\step3_done_${tag}.png` });
    console.log(`  ✓ done @${tag}`);

    await ctx.close();
  }

  await browser.close();
  console.log('\n=== DONE ===');
})().catch(e => { console.error('FATAL:', e); process.exit(1); });