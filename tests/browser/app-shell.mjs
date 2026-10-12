// App-first shell (docs/ARCHITECTURE.md "App-first requirement"): first-launch onboarding, deep links on first
// launch, return visits, bottom tab bar (phones) / top nav (≥768px), the More sheet, screen transitions,
// back/forward between tabs, and "no website content". Real CDP taps after a hit-test; Chrome AX-tree names.
import path from 'node:path';
import { startServer, startBrowser, BASE } from '../lib/harness.mjs';
import * as L from './qa-lib.mjs';

const C = L.counter('app-shell');
const check = C.check;
const server = await startServer();
const b = await startBrowser();
const URL = server.origin + BASE;
const q = (e) => b.js(`return ${e};`);
const text = (sel) => L.text(b, sel);
const state = () => b.js('return JSON.parse(JSON.stringify(window.__mm.store.get()));');
const vis = (sel) => q(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; })()`);
const SHOT = (name, w) => path.join(L.SHOT_DIR, `${w}-${name}.jpg`);

// Records every value <html data-route> takes (so "welcome was never shown" is observable) and every time
// #view gets .view-enter, with the animation computed at that moment.
const RECORDER = `(() => {
  const log = window.__shell = { routes: [], enters: [] };
  // Observe the whole document (documentElement does not exist yet when this runs).
  new MutationObserver((muts) => {
    for (const m of muts) {
      const t = m.target;
      if (m.attributeName === 'data-route' && t === document.documentElement) log.routes.push(t.dataset.route);
      if (m.attributeName === 'class' && t.id === 'view' && t.classList.contains('view-enter') && !(m.oldValue || '').includes('view-enter')) {
        const s = getComputedStyle(t); log.enters.push({ view: t.dataset.view, name: s.animationName, dur: s.animationDuration, running: t.getAnimations().length });
      }
    }
  }).observe(document, { attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['data-route', 'class'] });
})();`;
// A real new document (not a same-document hash change), so the app re-reads storage.
const hardLoad = async (url) => { await b.load('about:blank'); await b.load(url); };

const EXPECTED_PHONE_TABS = ['Home', 'Learn', 'Practice', 'Test', 'Progress'];
const EXPECTED_ALL_TABS = ['Home', 'Learn', 'Practice', 'Thinking Lab', 'Market Lab', 'Test', 'Progress'];

try {
  await b.send('DOM.enable');
  await b.send('Accessibility.enable');
  await L.addInit(b, RECORDER);

  // ================================================================ 1. first launch (cleared storage)
  for (const [w, h] of [[375, 812], [1280, 800]]) {
    await b.viewport(w, h);
    await L.seed(b, URL, null);
    const tag = `first launch ${w}`;
    check(`${tag}: lands on #/welcome`, (await q('location.hash')) === '#/welcome', await q('location.hash'));
    check(`${tag}: store has no grade`, (await state()).band === null);
    check(`${tag}: exactly one h1`, (await q(`document.querySelectorAll('h1').length`)) === 1, String(await q(`document.querySelectorAll('h1').length`)));
    check(`${tag}: h1 "Welcome to Market Minds"`, (await text('#view h1')) === 'Welcome to Market Minds', await text('#view h1'));
    check(`${tag}: focus on the h1`, await q(`document.activeElement === document.querySelector('#view h1')`), await q('document.activeElement.outerHTML.slice(0,80)'));
    check(`${tag}: document title`, (await q('document.title')) === 'Welcome | Market Minds', await q('document.title'));
    check(`${tag}: no app bar`, !(await vis('.app-bar')));
    check(`${tag}: no tabs/top nav`, !(await vis('.app-tabs')) && (await q(`[...document.querySelectorAll('.app-tabs a')].every((a) => a.getBoundingClientRect().width === 0)`)));
    check(`${tag}: no More button`, !(await vis('#menuToggle')));
    const gb = await q(`[...document.querySelectorAll('#view button[data-band]')].map((x) => { const r = x.getBoundingClientRect(); return { band: x.dataset.band, w: r.width, h: r.height, t: x.innerText.replace(/\\s+/g, ' ').trim() }; })`);
    check(`${tag}: two grade buttons`, gb.length === 2 && gb[0].band === 'explorer' && gb[1].band === 'analyst', JSON.stringify(gb));
    check(`${tag}: grade buttons ≥44px`, gb.every((x) => x.w >= 44 && x.h >= 44), JSON.stringify(gb));
    check(`${tag}: grade buttons say Grades 3–5 / 6–8`, /Grades 3–5/.test(gb[0]?.t) && /Grades 6–8/.test(gb[1]?.t), JSON.stringify(gb));
    const ax = await L.axOf(b, '#view button[data-band="explorer"]');
    check(`${tag}: grade button has an accessible name`, !!ax?.name && /Grades 3–5/.test(ax.name), JSON.stringify(ax));
    const grp = await L.axOf(b, '#view .welcome-grades');
    // (Chrome applies the CSS text-transform: uppercase to the computed name, so compare case-insensitively.)
    check(`${tag}: grade group named`, (grp?.name || '').toLowerCase() === 'choose your grade level', JSON.stringify(grp));
    check(`${tag}: no personal info asked (no text inputs)`, (await q(`document.querySelectorAll('#view input, #view textarea, #view select').length`)) === 0);
    check(`${tag}: no horizontal overflow`, await q('document.documentElement.scrollWidth <= document.documentElement.clientWidth'));
    check(`${tag}: welcome fills the screen`, (await q(`document.querySelector('#view .welcome').getBoundingClientRect().height`)) >= h - 1);
    if (w === 375) await b.shot(SHOT('welcome', 375), false);
  }
  // 1440 screenshot for the gallery
  await b.viewport(1440, 900); await b.wait(200); await b.shot(SHOT('welcome', 1440), false);

  // choose a grade by real tap → dashboard
  await b.viewport(375, 812);
  await L.seed(b, URL, null);
  // Fresh launch: history holds only the onboarding entry, so Back must not return to it (exit uses replace, not push).
  await b.send('Page.resetNavigationHistory');
  const t1 = await L.tap(b, `document.querySelector('#view button[data-band="explorer"]')`);
  check('welcome: grade button tappable (not covered)', t1.ok, JSON.stringify(t1));
  await b.wait(400);
  check('after choosing: lands on the dashboard #/', (await q('location.hash')) === '#/', await q('location.hash'));
  check('after choosing: grade saved', (await state()).band === 'explorer');
  check('after choosing: dashboard h1', (await text('#view h1')) === 'Welcome, Market Explorer!', await text('#view h1'));
  check('after choosing: app bar visible', await vis('.app-bar'));
  check('after choosing: tab bar visible', await vis('.app-tabs'));
  check('after choosing: app-bar grade switch shows 3–5 pressed', (await q(`document.querySelector('.band-switch [data-band=explorer]').getAttribute('aria-pressed')`)) === 'true');
  check('after choosing: focus on dashboard h1', await q(`document.activeElement === document.querySelector('#view h1')`));
  await b.js('history.back();'); await b.wait(400);
  check('Back from dashboard after onboarding does not show the welcome screen again', (await q('document.documentElement.dataset.route')) !== 'welcome', `${await q('location.href')} route=${await q('document.documentElement.dataset.route')}`);

  // keyboard choice
  await L.seed(b, URL, null);
  await b.js(`document.querySelector('#view button[data-band="analyst"]').focus();`);
  await L.press(b, 'Enter'); await b.wait(400);
  check('welcome: Enter on Grades 6–8 chooses it', (await state()).band === 'analyst' && (await q('location.hash')) === '#/', `${(await state()).band} ${await q('location.hash')}`);
  check('welcome (keyboard): dashboard h1 focused', await q(`document.activeElement === document.querySelector('#view h1')`));

  // ================================================================ 2. deep links on first launch
  for (const [w, h] of [[375, 812], [1280, 800]]) {
    await b.viewport(w, h);
    for (const deep of ['#/practice', '#/learn/w1l2/3', '#/market-lab?activity=paper']) {
      await b.load(URL); await b.js('localStorage.clear(); sessionStorage.clear();');
      await hardLoad(URL + deep);
      const tag = `deep link ${deep} @${w}`;
      check(`${tag}: first launch shows welcome`, (await q('location.hash')) === '#/welcome', await q('location.hash'));
      const r = await L.tap(b, `document.querySelector('#view button[data-band="analyst"]')`);
      await b.wait(600);
      const got = await q('location.hash');
      check(`${tag}: after choosing a grade, continues to the intended route`, got === deep, `landed on ${got}; routes ${JSON.stringify(await q('window.__shell.routes'))}`);
      check(`${tag}: grade saved`, (await state()).band === 'analyst');
      check(`${tag}: tap ok`, r.ok);
      if (deep === '#/practice' && got === deep) check(`${tag}: practice h1`, (await text('#view h1')) === 'Practice makes progress', await text('#view h1'));
    }
  }

  // ================================================================ 3. return visits
  await b.viewport(375, 812);
  await L.seed(b, URL, { version: 1, band: 'explorer' });
  check('return visit: dashboard directly', (await q('location.hash')) === '' || (await q('location.hash')) === '#/', await q('location.hash'));
  check('return visit: welcome never shown', !(await q('window.__shell.routes')).includes('welcome'), JSON.stringify(await q('window.__shell.routes')));
  check('return visit: dashboard h1', (await text('#view h1')) === 'Welcome, Market Explorer!', await text('#view h1'));
  await hardLoad(URL + '#/progress');
  check('return visit deep link: opens the route directly', (await q('location.hash')) === '#/progress' && !(await q('window.__shell.routes')).includes('welcome'), `${await q('location.hash')} ${JSON.stringify(await q('window.__shell.routes'))}`);
  await b.reload();
  check('refresh keeps the route for a returning student', (await q('location.hash')) === '#/progress' && (await text('#view h1')) !== 'Welcome to Market Minds');

  // ================================================================ 4. bottom tab bar on phones
  for (const [w, h] of [[375, 812], [390, 844]]) {
    await b.viewport(w, h);
    await L.seed(b, URL, { version: 1, band: 'explorer' });
    const tag = `tab bar ${w}`;
    const tb = await q(`(() => { const n = document.querySelector('.app-tabs'); const r = n.getBoundingClientRect(); return { pos: getComputedStyle(n).position, top: r.top, bottom: r.bottom, h: r.height, vh: innerHeight }; })()`);
    check(`${tag}: position fixed`, tb.pos === 'fixed', JSON.stringify(tb));
    check(`${tag}: pinned to the bottom of the screen`, Math.abs(tb.bottom - tb.vh) <= 1, JSON.stringify(tb));
    const tabs = await q(`[...document.querySelectorAll('.app-tabs a[data-nav]')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => { const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), href: a.getAttribute('href'), w: r.width, h: r.height }; })`);
    check(`${tag}: 5 tabs (${EXPECTED_PHONE_TABS.join(', ')})`, JSON.stringify(tabs.map((x) => x.t)) === JSON.stringify(EXPECTED_PHONE_TABS), JSON.stringify(tabs.map((x) => x.t)));
    check(`${tag}: every tab ≥44×44`, tabs.every((x) => x.w >= 44 && x.h >= 44), JSON.stringify(tabs.map((x) => `${x.t} ${Math.round(x.w)}x${Math.round(x.h)}`)));
    check(`${tag}: nav landmark named "Main"`, ((await L.axOf(b, '.app-tabs'))?.name || '') === 'Main', JSON.stringify(await L.axOf(b, '.app-tabs')));
    check(`${tag}: page does not scroll sideways`, await q('document.documentElement.scrollWidth <= document.documentElement.clientWidth'));
    // aria-current follows the route (real taps)
    for (const t of tabs) {
      const r = await L.tap(b, `document.querySelector('.app-tabs a[href="${t.href}"]')`);
      await b.wait(300);
      check(`${tag}: tap ${t.t} (not covered)`, r.ok, JSON.stringify(r));
      check(`${tag}: ${t.t} → ${t.href}`, (await q('location.hash')) === t.href, await q('location.hash'));
      const cur = await q(`[...document.querySelectorAll('.app-tabs a[aria-current="page"]')].map((a) => a.getAttribute('href'))`);
      check(`${tag}: aria-current only on ${t.t}`, JSON.stringify(cur) === JSON.stringify([t.href]), JSON.stringify(cur));
      check(`${tag}: ${t.t} focus moves to h1`, await q(`document.activeElement === document.querySelector('#view h1')`));
      const tabAx = await L.axOf(b, `.app-tabs a[href="${t.href}"]`);
      check(`${tag}: ${t.t} tab accessible name`, (tabAx?.name || '') === t.t, JSON.stringify(tabAx));
    }
    // routes outside the tab bar: no tab marked current (More sheet link is current instead)
    await L.route(b, '#/dictionary');
    check(`${tag}: no tab current on a More page`, (await q(`document.querySelectorAll('.app-tabs a[aria-current="page"]').length`)) === 0);
    check(`${tag}: More sheet link marked current`, (await q(`document.querySelector('#siteNav a[aria-current="page"]')?.getAttribute('href')`)) === '#/dictionary');
    // stays clear of content: scroll to the very bottom; the last content must sit above the tab bar
    for (const r of ['#/', '#/learn', '#/learn/w1l1/1', '#/learn/w4l2/3', '#/practice', '#/test', '#/progress', '#/dictionary', '#/certificates', '#/market-lab', '#/parent']) {
      await L.route(b, r);
      await b.js('window.scrollTo(0, document.documentElement.scrollHeight);'); await b.wait(120);
      const m = await q(`(() => {
        const bar = document.querySelector('.app-tabs').getBoundingClientRect();
        let last = null, lb = -1;
        for (const e of document.querySelectorAll('#view *')) {
          const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.closest('.sr-only, details:not([open]), dialog:not([open])')) continue;
          const rc = e.getBoundingClientRect(); if (rc.width < 2 || rc.height < 2) continue;
          if (rc.bottom > lb) { lb = rc.bottom; last = e; }
        }
        let covered = null;
        const ctrls = [...document.querySelectorAll('#view a, #view button, #view input, #view select, #view textarea')].filter((e) => { const rc = e.getBoundingClientRect(); return rc.width > 0 && rc.height > 0 && rc.top < innerHeight && rc.bottom > 0; });
        for (const e of ctrls) { const rc = e.getBoundingClientRect(); const y = Math.min(rc.bottom - 2, innerHeight - 1); const hit = document.elementFromPoint(rc.left + rc.width / 2, y); if (hit && hit.closest('.app-tabs')) { covered = e.tagName + ' ' + e.textContent.trim().slice(0, 30); break; } }
        return { barTop: bar.top, lastBottom: lb, last: last ? last.tagName + '.' + last.className + ' ' + (last.textContent || '').trim().slice(0, 30) : null, covered };
      })()`);
      check(`${tag} ${r}: last content ends above the tab bar`, m.lastBottom <= m.barTop + 0.5, JSON.stringify(m));
      check(`${tag} ${r}: no control hidden behind the tab bar at the bottom`, !m.covered, JSON.stringify(m));
    }
    if (w === 375) {
      await L.route(b, '#/'); await b.js('window.scrollTo(0,0)');
      await b.shot(SHOT('dashboard-tabbar', 375), false);
    }
  }

  // ================================================================ 5. top nav at tablet/desktop
  for (const [w, h] of [[768, 1024], [1280, 800]]) {
    await b.viewport(w, h);
    await L.seed(b, URL, { version: 1, band: 'explorer' });
    const tag = `top nav ${w}`;
    const tb = await q(`(() => { const n = document.querySelector('.app-tabs'); const r = n.getBoundingClientRect(); return { pos: getComputedStyle(n).position, top: r.top, bottom: r.bottom }; })()`);
    check(`${tag}: not fixed to the bottom`, tb.pos !== 'fixed' && tb.top < 200, JSON.stringify(tb));
    const tabs = await q(`[...document.querySelectorAll('.app-tabs a[data-nav]')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => { const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), h: r.height, w: r.width }; })`);
    check(`${tag}: all 7 primary destinations visible`, JSON.stringify(tabs.map((x) => x.t)) === JSON.stringify(EXPECTED_ALL_TABS), JSON.stringify(tabs.map((x) => x.t)));
    check(`${tag}: tabs ≥44px tall`, tabs.every((x) => x.h >= 44 && x.w >= 44), JSON.stringify(tabs));
    const edge = await q(`(() => { const vw = document.documentElement.clientWidth; const r = Math.max(...[...document.querySelectorAll('.app-tabs a[data-nav]')].map((a) => a.getBoundingClientRect().right)); return { vw, right: Math.round(r), sw: document.documentElement.scrollWidth }; })()`);
    check(`${tag}: every tab fully on screen`, edge.right <= edge.vw, JSON.stringify(edge));
    check(`${tag}: no horizontal page scroll`, edge.sw <= edge.vw, JSON.stringify(edge));
    check(`${tag}: one row (no wrapping)`, (await q(`new Set([...document.querySelectorAll('.app-tabs a[data-nav]')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => Math.round(a.getBoundingClientRect().top))).size`)) === 1);
    check(`${tag}: body has no tab-bar padding`, (await q(`parseFloat(getComputedStyle(document.body).paddingBottom)`)) < 1, String(await q(`getComputedStyle(document.body).paddingBottom`)));
    if (w === 1280) { await b.viewport(1440, 900); await b.wait(200); await b.shot(SHOT('dashboard-tabbar', 1440), false); await b.viewport(w, h); await b.wait(200); }
    await L.navTo(b, '#/market-lab');
    check(`${tag}: Market Lab reachable from top nav and marked current`, (await q('location.hash')) === '#/market-lab' && (await q(`document.querySelector('.app-tabs a[aria-current="page"]')?.getAttribute('href')`)) === '#/market-lab');
    check(`${tag}: Labs group hidden in More (no duplicate links)`, !(await vis('#siteNav .more-labs')));
  }

  // ================================================================ 6. More sheet
  for (const [w, h] of [[375, 812], [1280, 800]]) {
    await b.viewport(w, h);
    await L.seed(b, URL, { version: 1, band: 'explorer' });
    const tag = `More ${w}`;
    const ax = await L.axOf(b, '#menuToggle');
    check(`${tag}: button named "More"`, (ax?.name || '') === 'More', JSON.stringify(ax));
    check(`${tag}: button ≥44px`, await q(`(() => { const r = document.getElementById('menuToggle').getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })()`));
    check(`${tag}: starts closed`, (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false' && !(await vis('#siteNav')));
    check(`${tag}: aria-controls the sheet`, (await q(`document.getElementById('menuToggle').getAttribute('aria-controls')`)) === 'siteNav');
    const r = await L.tap(b, `document.getElementById('menuToggle')`);
    check(`${tag}: tap opens`, r.ok && (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'true' && (await vis('#siteNav')));
    check(`${tag}: focus moves inside the sheet`, await q(`document.getElementById('siteNav').contains(document.activeElement)`), await q('document.activeElement.outerHTML.slice(0,80)'));
    const links = await q(`[...document.querySelectorAll('#siteNav a')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.textContent.trim())`);
    const want = ['Dictionary', 'Stories', 'Decision Journal', 'Certificates', 'Parent & Teacher'];
    check(`${tag}: More links (${want.join(', ')})`, want.every((x) => links.includes(x)), JSON.stringify(links));
    if (w < 768) check(`${tag}: Labs (Thinking Lab, Market Lab) in More on phones`, links.includes('Thinking Lab') && links.includes('Market Lab'), JSON.stringify(links));
    check(`${tag}: sheet links ≥44px tall`, await q(`[...document.querySelectorAll('#siteNav a')].filter((a) => a.getBoundingClientRect().width > 0).every((a) => a.getBoundingClientRect().height >= 44)`));
    const about = (await text('#siteNav .about-safety')) || '';
    check(`${tag}: About & safety heading`, (await text('#siteNav .about-safety h2')) === 'About & safety');
    check(`${tag}: futures-risk wording present`, /Futures involve substantial risk, including losses larger than the margin deposit/.test(about) && /not suitable for children to trade/.test(about), about);
    check(`${tag}: educational-only wording present`, /for learning only/i.test(about) && /pretend/i.test(about), about);
    const sh = await q(`(() => { const r = document.getElementById('siteNav').getBoundingClientRect(); const t = document.querySelector('.app-tabs').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, vw: document.documentElement.clientWidth, vh: innerHeight, tabTop: t.top, tabFixed: getComputedStyle(document.querySelector('.app-tabs')).position === 'fixed' }; })()`);
    check(`${tag}: sheet fits on screen`, sh.left >= 0 && sh.right <= sh.vw && sh.top >= 0 && sh.bottom <= sh.vh, JSON.stringify(sh));
    if (sh.tabFixed) check(`${tag}: sheet sits above the tab bar`, sh.bottom <= sh.tabTop, JSON.stringify(sh));
    await b.shot(SHOT('more-sheet', w === 375 ? 375 : 1440), false);
    await L.press(b, 'Escape'); await b.wait(150);
    check(`${tag}: Esc closes`, (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false' && !(await vis('#siteNav')));
    check(`${tag}: Esc returns focus to More`, await q(`document.activeElement.id === 'menuToggle'`), await q('document.activeElement.outerHTML.slice(0,80)'));
    // keyboard open
    await L.press(b, 'Enter'); await b.wait(150);
    check(`${tag}: Enter opens and focus goes inside`, (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'true' && (await q(`document.getElementById('siteNav').contains(document.activeElement)`)));
    await L.press(b, 'Tab');
    check(`${tag}: Tab moves to the next sheet link`, await q(`document.getElementById('siteNav').contains(document.activeElement)`));
    // outside click closes
    await L.tap(b, `document.querySelector('#view h1')`);
    check(`${tag}: tap outside closes`, (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false');
    // link navigates and closes
    const nv = await L.navTo(b, '#/certificates');
    check(`${tag}: More → Certificates navigates`, nv.via === 'more' && nv.ok && (await q('location.hash')) === '#/certificates', JSON.stringify(nv));
    check(`${tag}: sheet closes after choosing a link`, (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false' && !(await vis('#siteNav')));
    check(`${tag}: focus on the new page h1`, await q(`document.activeElement === document.querySelector('#view h1')`));
    check(`${tag}: Certificates h1`, (await text('#view h1')) === 'Achievement Certificates', await text('#view h1'));
    if (w === 375) await b.shot(SHOT('certificates', 375), true);
    else { await b.viewport(1440, 900); await b.wait(200); await b.shot(SHOT('certificates', 1440), true); }
  }

  // ================================================================ 7. screen transitions
  await b.viewport(1280, 800);
  await L.seed(b, URL, { version: 1, band: 'explorer' });
  let n0 = (await q('window.__shell.enters')).length;
  await L.navTo(b, '#/learn');
  let enters = (await q('window.__shell.enters')).slice(n0);
  check('transition: .view-enter applied on navigation', enters.length >= 1 && enters.at(-1).view === 'learn', JSON.stringify(enters));
  check('transition: animation mm-view-enter runs', enters.at(-1)?.name === 'mm-view-enter' && enters.at(-1).running >= 1, JSON.stringify(enters.at(-1)));
  const dur = parseFloat(enters.at(-1)?.dur || '0') * (/ms$/.test(enters.at(-1)?.dur || '') ? 0.001 : 1);
  check('transition: short (≤ 200 ms)', dur > 0 && dur <= 0.2, enters.at(-1)?.dur);
  await b.wait(400);
  check('transition: class removed after the animation ends', !(await q(`document.getElementById('view').classList.contains('view-enter')`)));
  // reduced motion
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await b.load(URL);
  n0 = (await q('window.__shell.enters')).length;
  for (const r of ['#/learn', '#/practice', '#/progress']) await L.route(b, r);
  enters = (await q('window.__shell.enters')).slice(n0);
  check('reduced motion: navigations happened', enters.length >= 3, JSON.stringify(enters));
  check('reduced motion: no screen animation', enters.every((e) => e.name === 'none' || parseFloat(e.dur) <= 0.01) && enters.every((e) => e.running === 0), JSON.stringify(enters));
  check('reduced motion: nothing animating on the page', (await q('document.getAnimations().filter((a) => a.playState === "running").length')) === 0);
  await b.send('Emulation.setEmulatedMedia', { features: [] });

  // ================================================================ 8. back / forward between tabs (phone)
  await b.viewport(375, 812);
  await L.seed(b, URL, { version: 1, band: 'explorer' });
  for (const h of ['#/learn', '#/practice', '#/test']) await L.navTo(b, h);
  await b.js('history.back();'); await b.wait(400);
  check('Back: Test → Practice', (await q('location.hash')) === '#/practice' && (await text('#view h1')) === 'Practice makes progress', await q('location.hash'));
  check('Back: Practice tab is current', (await q(`document.querySelector('.app-tabs a[aria-current="page"]')?.getAttribute('href')`)) === '#/practice');
  check('Back: focus on h1', await q(`document.activeElement === document.querySelector('#view h1')`));
  await b.js('history.back();'); await b.wait(400);
  check('Back: Practice → Learn', (await q('location.hash')) === '#/learn' && (await q(`document.querySelector('.app-tabs a[aria-current="page"]')?.getAttribute('href')`)) === '#/learn');
  await b.js('history.forward();'); await b.wait(400);
  check('Forward: Learn → Practice', (await q('location.hash')) === '#/practice' && (await q(`document.querySelector('.app-tabs a[aria-current="page"]')?.getAttribute('href')`)) === '#/practice');
  // grade switch in the app bar on phones
  const gs = await q(`[...document.querySelectorAll('.band-switch [data-band]')].map((x) => { const r = x.getBoundingClientRect(); return { w: r.width, h: r.height }; })`);
  check('app bar grade switch visible and ≥44px at 375', gs.length === 2 && gs.every((x) => x.w >= 44 && x.h >= 44), JSON.stringify(gs));
  await L.tap(b, `document.querySelector('.band-switch [data-band="analyst"]')`); await b.wait(300);
  check('app bar grade switch changes grade in place', (await state()).band === 'analyst' && (await q('location.hash')) === '#/practice');

  // ================================================================ 9. no website / promotional content
  await L.seed(b, URL, { version: 1, band: 'explorer' });
  const promo = [];
  for (const r of ['#/welcome', '#/', '#/learn', '#/practice', '#/thinking', '#/market-lab', '#/test', '#/progress', '#/dictionary', '#/stories', '#/journal', '#/certificates', '#/parent']) {
    await L.route(b, r);
    const hit = await q(`(() => { const t = document.body.innerText; const m = t.match(/Our purpose|pricing|subscribe|sign up|newsletter|copyright|©|all rights reserved|follow us/i); return m ? m[0] : null; })()`);
    if (hit) promo.push(`${r}: "${hit}"`);
    if (await q(`!!document.querySelector('footer, .site-footer, [role=contentinfo]')`)) promo.push(`${r}: footer element present`);
    const ext = await q(`[...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /^(https?:)?\\/\\//.test(h))`);
    if (ext.length) promo.push(`${r}: external links ${ext.join(',')}`);
  }
  check('no footer, promotional text or external links on any app screen', promo.length === 0, promo.join(' | '));
  check('index.html has no <footer>', !(await q(`!!document.querySelector('footer')`)));
  await L.route(b, '#/market-lab');
  check('Market Lab keeps its educational-only banner', /Pretend prices only/.test((await text('#view .lab-disclaimer')) || ''), await text('#view .lab-disclaimer'));

  check('no console errors', b.errors.length === 0, b.errors.join(' | '));
  check('no 404s', server.missing.length === 0, server.missing.join());
} catch (e) {
  check('app-shell script ran to completion', false, e.stack);
} finally { b.close(); server.close(); }
process.exit(C.done());
