// Accessibility + layout audit: 375 / 768 / 1440 widths, both grade bands, every route.
// Accessible names come from Chrome's own accessibility tree (CDP Accessibility.getFullAXTree).
import fs from 'node:fs';
import path from 'node:path';
import { startServer, startBrowser, BASE, ROOT } from '../lib/harness.mjs';
import * as L from './qa-lib.mjs';

const C = L.counter('a11y');
const check = C.check;
const info = [];
const server = await startServer();
const b = await startBrowser();
const URL = server.origin + BASE;
const q = (e) => b.js(`return ${e};`);

const ROUTES = ['#/', '#/learn', '#/learn/w1l1/1', '#/learn/w1l1/2', '#/learn/w1l1/3', '#/learn/w1l1/4', '#/learn/w1l1/5', '#/learn/w1l1/6',
  '#/learn/w1l2/1', '#/learn/w1l2/3', '#/learn/w1l3/3', '#/learn/w2l1/1', '#/learn/w2l1/3', '#/learn/w2l1/5', '#/practice', '#/practice/session', '#/practice/summary',
  '#/thinking', '#/market-lab', '#/market-lab?activity=paper', '#/market-lab?activity=watch', '#/test', '#/test/w1l1', '#/test/world-1',
  '#/progress', '#/dictionary', '#/stories', '#/journal', '#/parent', '#/learn/nope', '#/bogus'];
const ERROR_H1 = ['This page could not load', 'We couldn’t find that lesson', 'That step doesn’t exist', 'That test isn’t available'];
const INTERACTIVE = new Set(['button', 'link', 'textbox', 'combobox', 'listbox', 'radio', 'checkbox', 'tab', 'menuitem', 'spinbutton', 'searchbox', 'switch', 'slider', 'img', 'dialog', 'option', 'progressbar', 'radiogroup']);

// ---------------------------------------------------------------- in-page audit helpers
const AUDIT_SRC = `(() => {
  const vis = (el) => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    if (s.clip && s.clip !== 'auto' && /rect\\(0/.test(s.clip)) return false; return el.getClientRects().length > 0; };
  const parse = (c) => { const m = /rgba?\\(([^)]+)\\)/.exec(c || ''); if (!m) return null; const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  function bgOf(el) {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage !== 'none') return { image: true, at: e.tagName + '.' + e.className };
      const c = parse(s.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) out = blend(layers[i], out);
    return { color: out };
  }
  function measure(el) {
    const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) return null;
    const bg = bgOf(el);
    const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (bg.image) return { image: true, need };
    const f = blend(fg, bg.color);
    const l1 = lum(f), l2 = lum(bg.color);
    return { ratio: Math.round((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) * 100) / 100, need, fg: s.color, bg: 'rgb(' + [bg.color.r, bg.color.g, bg.color.b].map(Math.round).join(',') + ')' };
  }
  const desc = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
  window.__a11y = {
    spot(sel) { const el = document.querySelector(sel); if (!el) return null; const m = measure(el); return m && { el: desc(el), text: el.textContent.trim().slice(0, 30), ...m }; },
    contrast() {
      const seen = new Set(), fails = [], unknown = [], samples = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement; if (!el || seen.has(el) || !n.textContent.trim()) continue; seen.add(el);
        if (el.closest('svg, script, style, noscript, [aria-hidden="true"], .sr-only, dialog:not([open])') || !vis(el)) continue;
        if (el.closest('button:disabled, input:disabled, select:disabled')) continue;
        const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) continue;
        const bg = bgOf(el);
        const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        if (bg.image) { unknown.push(desc(el) + ' (background image on ' + bg.at + ')'); continue; }
        const f = blend(fg, bg.color);
        const l1 = lum(f), l2 = lum(bg.color); const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        const need = large ? 3 : 4.5;
        const rec = { el: desc(el), text: n.textContent.trim().slice(0, 40), ratio: Math.round(ratio * 100) / 100, need, fg: s.color, bg: 'rgb(' + [bg.color.r, bg.color.g, bg.color.b].map(Math.round).join(',') + ')' };
        samples.push(rec);
        if (ratio < need) fails.push(rec);
      }
      return { fails, unknown: [...new Set(unknown)].slice(0, 20), count: samples.length, samples };
    },
    images() {
      const bad = [];
      for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) bad.push('img without alt: ' + img.src);
      for (const svg of document.querySelectorAll('svg')) {
        if (svg.closest('[aria-hidden="true"]') || svg.parentElement?.closest('svg')) continue;
        const named = svg.getAttribute('role') === 'img' && (svg.getAttribute('aria-label') || svg.getAttribute('aria-labelledby') || svg.querySelector('title'));
        if (!named) bad.push('svg neither labelled nor hidden: ' + svg.outerHTML.slice(0, 100));
      }
      for (const f of document.querySelectorAll('.placeholder-art')) if (!(f.querySelector('.ph-alt')?.textContent.trim())) bad.push('placeholder art without description');
      return bad;
    },
    bazeHits() {
      const hits = [];
      if (/baze/i.test(document.body.innerText)) hits.push('text: ' + document.body.innerText.match(/.{0,40}baze.{0,40}/i)[0]);
      if (/baze/i.test(document.title)) hits.push('title');
      for (const el of document.querySelectorAll('*')) for (const a of el.attributes) if (/baze/i.test(a.value)) hits.push(el.tagName + '[' + a.name + ']=' + a.value.slice(0, 60));
      return hits;
    },
    targets() {
      const sel = '.btn, .choice, .band-btn, .menu-toggle, .grade-choice button, .lab-tab, .radio-cards label, select, input[type=text], input[type=number], textarea, .card-link, .modal-close, #siteNav.open a';
      const small = [], smallSm = [];
      for (const el of document.querySelectorAll(sel)) {
        if (!vis(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.height < 44 - 0.5 || r.width < 44 - 0.5) (el.matches('.btn-sm') ? smallSm : small).push(desc(el) + ' "' + el.textContent.trim().slice(0, 24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
      return { small, smallSm };
    },
    motion() {
      const toS = (v) => Math.max(0, ...v.split(',').map((x) => x.trim().endsWith('ms') ? parseFloat(x) / 1000 : parseFloat(x) || 0));
      const long = [];
      for (const el of [document.documentElement, ...document.querySelectorAll('*')]) {
        for (const pseudo of [null, '::before', '::after']) {
          const s = getComputedStyle(el, pseudo);
          const t = toS(s.transitionDuration), a = s.animationName !== 'none' ? toS(s.animationDuration) * (s.animationIterationCount === 'infinite' ? 100 : 1) : 0;
          if (t > 0.01 || a > 0.01) long.push(desc(el) + (pseudo || '') + ' transition ' + s.transitionDuration + ' animation ' + s.animationName + ' ' + s.animationDuration);
        }
      }
      return { long: [...new Set(long)], scroll: getComputedStyle(document.documentElement).scrollBehavior, running: document.getAnimations().filter((x) => x.playState === 'running').length };
    }
  };
})();`;
const audit = () => b.js(AUDIT_SRC);

async function axEmptyNames() {
  const r = await b.send('Accessibility.getFullAXTree', {});
  const nodes = r.result?.nodes || [];
  const bad = [];
  for (const n of nodes) {
    const role = n.role?.value;
    if (n.ignored || !INTERACTIVE.has(role)) continue;
    if ((n.name?.value || '').trim()) continue;
    if (role === 'radiogroup' || role === 'listbox' || role === 'option' || role === 'progressbar') { /* named below if needed */ }
    let html = '';
    if (n.backendDOMNodeId) { try { html = (await b.send('DOM.getOuterHTML', { backendNodeId: n.backendDOMNodeId })).result?.outerHTML?.slice(0, 120) || ''; } catch { /* gone */ } }
    bad.push(`${role}: ${html}`);
  }
  return bad;
}

async function fresh(band) {
  await b.load(URL);
  await b.js(`localStorage.clear(); localStorage.setItem('mm.progress.v1', JSON.stringify({ version: 1, band: ${JSON.stringify(band)} }));`);
  await b.load(URL);
  await audit();
}

const contrastFails = new Map();   // key el+colors → record
const contrastUnknown = new Set();
const allLinks = new Set();
const externalLinks = new Set();
let contrastSamples = 0;

try {
  await b.send('DOM.enable');
  await b.send('Accessibility.enable');

  // ================================================================ per width × band × route
  for (const [w, h] of [[375, 812], [768, 1024], [1440, 900]]) {
    await b.viewport(w, h);
    for (const band of ['explorer', 'analyst']) {
      await fresh(band);
      for (const r of ROUTES) {
        const before = b.errors.length;
        await L.route(b, r);
        const tag = `${w} ${band} ${r}`;
        check(`${tag} no horizontal overflow`, await q('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), String(await q('document.documentElement.scrollWidth')));
        const wide = await q(`[...document.querySelectorAll('#view *')].filter((e) => { const rc = e.getBoundingClientRect(); return rc.right > document.documentElement.clientWidth + 1 && !e.closest('.table-wrap, .sr-only, details:not([open])'); }).slice(0, 3).map((e) => e.tagName + '.' + e.className)`);
        check(`${tag} no element sticks out past the viewport`, wide.length === 0, JSON.stringify(wide));
        check(`${tag} no console errors`, b.errors.length === before, b.errors.slice(before).join(' | '));
        if (w === 768) continue;   // names/headings/images don't depend on this width; overflow is the 768 concern
        check(`${tag} exactly one h1`, (await q(`document.querySelectorAll('#view h1').length`)) === 1);
        check(`${tag} focus moved to the h1`, await q(`document.activeElement === document.querySelector('#view h1')`), await q('document.activeElement.outerHTML.slice(0, 80)'));
        const h1 = await L.text(b, '#view h1');
        if (!['#/learn/nope', '#/bogus'].includes(r)) check(`${tag} not an error page`, !ERROR_H1.includes(h1), h1);
        const empty = await axEmptyNames();
        check(`${tag} every interactive element has an accessible name`, empty.length === 0, empty.slice(0, 4).join(' || '));
        const imgs = await q('window.__a11y.images()');
        check(`${tag} images/visuals have text alternatives`, imgs.length === 0, imgs.slice(0, 3).join(' || '));
        const baze = await q('window.__a11y.bazeHits()');
        check(`${tag} no "Baze" in rendered UI`, baze.length === 0, baze.join(' | '));
        const unlabeled = await q(`[...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter((e) => !(e.labels && e.labels.length) && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map((e) => e.outerHTML.slice(0, 80))`);
        check(`${tag} form controls have a <label>`, unlabeled.length === 0, unlabeled.join(' | '));
        for (const href of await q(`[...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))`)) {
          if (href.startsWith('#/')) allLinks.add(href);
          else if (href !== '#view') externalLinks.add(href);
        }
        if (band === 'explorer' || r === '#/') {
          const c = await q('window.__a11y.contrast()');
          contrastSamples += c.count;
          for (const f of c.fails) contrastFails.set(`${f.el}|${f.fg}|${f.bg}`, { ...f, where: `${w} ${r}` });
          c.unknown.forEach((u) => contrastUnknown.add(u));
        }
        if (w === 375) {
          const t = await q('window.__a11y.targets()');
          check(`${tag} primary tap targets ≥ 44px`, t.small.length === 0, t.small.slice(0, 5).join(' | '));
          if (t.smallSm.length) info.push(`${tag} small (btn-sm) controls: ${t.smallSm.join(' | ')}`);
        }
      }
    }
  }
  check('contrast: every visible text element meets WCAG AA (computed colours)', contrastFails.size === 0,
    [...contrastFails.values()].slice(0, 12).map((f) => `${f.where} ${f.el} "${f.text}" ${f.ratio}:1 (need ${f.need}) ${f.fg} on ${f.bg}`).join(' || '));
  console.log(`info: contrast samples checked: ${contrastSamples}; not computable (background image): ${[...contrastUnknown].slice(0, 6).join(' | ')}`);

  // ================================================================ contrast spot checks (named components)
  await b.viewport(1440, 900);
  await fresh('explorer');
  const spot = async (route, sel, label) => {
    await L.route(b, route);
    const r = await q(`window.__a11y.spot(${JSON.stringify(sel)})`);
    check(`contrast spot: ${label}`, r && r.ratio >= r.need, JSON.stringify(r));
    return r;
  };
  const spots = [];
  spots.push(await spot('#/learn/w1l1/1', '#view .lesson-body > p', 'lesson body text'));
  spots.push(await spot('#/', '#view .hero .btn-primary', 'primary button (hero)'));
  spots.push(await spot('#/learn/w1l1/1', '#view nav.lesson-nav .btn-primary', 'primary button (lesson Next)'));
  spots.push(await spot('#/learn/w1l1/1', '#view nav.lesson-nav .btn:not(.btn-primary)', 'secondary button'));
  spots.push(await spot('#/learn', '#view .chip', 'chip'));
  spots.push(await spot('#/', '#view .card-status', 'card status text'));
  spots.push(await spot('#/', '.site-footer .footer-privacy', 'footer small text'));
  spots.push(await spot('#/', '.site-nav a', 'nav link'));
  console.log('info: contrast spots', spots.map((s) => s && `${s.el} ${s.ratio}:1`).join(' | '));

  // ================================================================ every internal link resolves
  await fresh('explorer');
  const linkList = [...allLinks].sort();
  for (const href of linkList) {
    await L.route(b, href, 300);
    const h1 = await L.text(b, '#view h1');
    check(`link ${href} resolves to a real view`, !!h1 && !ERROR_H1.includes(h1) && (href === '#/' || (await q('location.hash')) !== '#/'), `${h1} @ ${await q('location.hash')}`);
  }
  console.log(`info: ${linkList.length} internal links checked; other hrefs: ${[...externalLinks].join(', ') || 'none'}`);
  check('no root-absolute or external hrefs in the UI', [...externalLinks].every((h) => !h.startsWith('/') && !/^https?:/.test(h)), [...externalLinks].join(', '));

  // ================================================================ keyboard: desktop header
  await b.viewport(1440, 900);
  await fresh('explorer');
  await b.js(`document.querySelector('.skip').focus();`);
  const seq = [];
  for (let i = 0; i < 16; i++) {
    await L.press(b, 'Tab');
    seq.push(await b.js(`const a = document.activeElement; const s = getComputedStyle(a);
      return { tag: a.tagName, cls: a.className, text: a.textContent.trim().slice(0, 30), band: a.dataset.band || null, nav: a.dataset.nav ?? null,
        fv: a.matches(':focus-visible'), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow: s.boxShadow !== 'none' };`));
  }
  check('Tab reaches brand link', seq.some((x) => /brand/.test(x.cls)));
  check('Tab reaches both grade buttons', seq.some((x) => x.band === 'explorer') && seq.some((x) => x.band === 'analyst'));
  check('Tab reaches all 11 nav links', seq.filter((x) => x.nav !== null).length === 11, JSON.stringify(seq.map((x) => x.text)));
  check('menu button not in tab order on desktop', !seq.some((x) => /menu-toggle/.test(x.cls)));
  for (const x of seq) check(`visible focus indicator on ${x.tag}.${x.cls} "${x.text}"`, x.fv && (x.outline || x.shadow), JSON.stringify(x));
  // grade buttons via keyboard
  await b.js(`document.querySelector('.band-switch [data-band=analyst]').focus();`);
  await L.press(b, 'Enter'); await b.wait(300);
  check('Enter on Grades 6–8 sets aria-pressed', (await q(`document.querySelector('.band-switch [data-band=analyst]').getAttribute('aria-pressed')`)) === 'true' && (await q(`document.querySelector('.band-switch [data-band=explorer]').getAttribute('aria-pressed')`)) === 'false');
  check('grade switch saved', (await q('window.__mm.store.get().band')) === 'analyst');
  check('focus stays on the grade button after switching (keyboard users keep their place)', await q(`document.activeElement?.dataset?.band === 'analyst'`), await q('document.activeElement.outerHTML.slice(0, 80)'));
  await b.js(`document.querySelector('.band-switch [data-band=explorer]').focus();`);
  await L.press(b, ' '); await b.wait(300);
  check('Space on Grades 3–5 toggles back', (await q(`document.querySelector('.band-switch [data-band=explorer]').getAttribute('aria-pressed')`)) === 'true' && (await q('window.__mm.store.get().band')) === 'explorer');

  // ================================================================ keyboard: mobile menu
  await b.viewport(375, 812);
  await fresh('explorer');
  await b.js(`document.querySelector('.skip').focus();`);
  let reached = false;
  for (let i = 0; i < 6 && !reached; i++) { await L.press(b, 'Tab'); reached = await q(`document.activeElement.id === 'menuToggle'`); }
  check('Tab reaches the mobile menu button', reached);
  check('menu button has accessible name', ((await L.axOf(b, '#menuToggle'))?.name || '') === 'Menu');
  check('menu starts collapsed', (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false' && !(await q(`document.querySelector('#siteNav a').offsetParent !== null`)));
  await L.press(b, 'Enter'); await b.wait(150);
  check('Enter opens menu (aria-expanded=true)', (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'true');
  check('open menu shows nav links', await q(`document.querySelector('#siteNav a').offsetParent !== null`));
  const mt = await q('window.__a11y.targets()');
  check('open mobile menu links ≥ 44px tall', mt.small.length === 0, mt.small.join(' | '));
  await L.press(b, 'Tab');
  check('Tab from menu button moves into the nav', await q(`document.getElementById('siteNav').contains(document.activeElement)`), await q('document.activeElement.outerHTML.slice(0, 80)'));
  await L.press(b, 'Escape'); await b.wait(100);
  check('Esc closes menu', (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'false');
  check('Esc returns focus to menu button', await q(`document.activeElement.id === 'menuToggle'`));
  await L.press(b, ' '); await b.wait(100);
  check('Space also opens menu', (await q(`document.getElementById('menuToggle').getAttribute('aria-expanded')`)) === 'true');
  await L.press(b, 'Escape');

  // ================================================================ keyboard: choices
  await L.route(b, '#/learn/w1l1/4');
  await b.js(`document.querySelector('#view .together-q .choice').focus();`);
  await L.press(b, 'Enter'); await b.wait(100);
  check('Try-together choice works with Enter', await q(`/is-(correct|wrong)/.test(document.querySelector('#view .together-q .coach').className)`));
  await L.route(b, '#/learn/w1l1/1'); await L.route(b, '#/learn/w1l1/4');   // fresh render (the first choice may have been correct and locked the item)
  await b.js(`document.querySelectorAll('#view .together-q .choice')[1].focus();`);
  await L.press(b, ' '); await b.wait(100);
  check('Try-together choice works with Space', await q(`document.querySelectorAll('#view .together-q .choice')[1].getAttribute('aria-pressed') === 'true'`));
  await L.route(b, '#/learn/w1l1/5');
  await b.js(`document.querySelector('#view .q-prompt')?.setAttribute('tabindex', '-1'); document.querySelector('#view .q-prompt').focus();`);
  let inGroup = false;
  for (let i = 0; i < 4 && !inGroup; i++) { await L.press(b, 'Tab'); inGroup = await q(`!!document.activeElement.closest('#view .choices')`); }
  check('Tab reaches the answer choices', inGroup);
  check('radio group has an accessible name', ((await L.axOf(b, '#view .choices[role=radiogroup]'))?.name || '').length > 10);
  await L.press(b, ' '); await b.wait(80);
  check('Space selects a choice (aria-checked)', await q(`document.activeElement.getAttribute('aria-checked') === 'true'`));
  await L.press(b, 'ArrowDown'); await b.wait(80);
  check('Arrow key moves + selects next choice', await q(`document.activeElement.getAttribute('aria-checked') === 'true' && document.activeElement !== document.querySelector('#view .choices .choice')`));
  await L.press(b, 'Tab');
  check('Tab leaves the radio group to Check (roving tabindex)', await q(`document.activeElement.textContent === 'Check'`), await q('document.activeElement.textContent'));
  await L.press(b, 'Enter'); await b.wait(100);
  check('Enter on Check gives feedback', await q(`/is-(correct|wrong)/.test(document.querySelector('#view .lesson-body .feedback').className)`));
  // word dialog via keyboard: focus trap
  await L.route(b, '#/learn/w1l1/1');
  await b.js(`document.querySelector('#view .lesson-body button.term').focus();`);
  await L.press(b, 'Enter'); await b.wait(150);
  check('Enter opens word dialog', await q(`!!document.querySelector('dialog.modal[open]')`));
  let trapped = true;
  for (let i = 0; i < 8; i++) { await L.press(b, 'Tab'); if (!(await q(`document.querySelector('dialog.modal').contains(document.activeElement)`))) trapped = false; }
  check('Tab stays inside the dialog (focus trap)', trapped);
  await L.press(b, 'Escape'); await b.wait(100);
  check('Esc closes dialog and returns focus to the word', await q(`!document.querySelector('dialog.modal') && document.activeElement.classList.contains('term')`));

  // ================================================================ reduced motion
  await b.viewport(1440, 900);
  await fresh('explorer');
  const normalMotion = await q('window.__a11y.motion()');
  info.push(`motion without preference: ${normalMotion.long.length} elements animate/transition`);
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await b.load(URL); await audit();
  for (const r of ['#/', '#/learn/w1l1/1', '#/learn/w1l1/4', '#/practice', '#/market-lab', '#/progress', '#/dictionary']) {
    await L.route(b, r);
    const m = await q('window.__a11y.motion()');
    check(`reduced motion ${r}: no transitions/animations > 0.01s`, m.long.length === 0, m.long.slice(0, 4).join(' | '));
    check(`reduced motion ${r}: no running animations`, m.running === 0, String(m.running));
    check(`reduced motion ${r}: no smooth scrolling`, m.scroll !== 'smooth', m.scroll);
  }
  await b.send('Emulation.setEmulatedMedia', { features: [] });

  // ================================================================ speech unsupported fallback
  await b.viewport(375, 812);
  const noSpeech = await L.addInit(b, L.NO_SPEECH_SRC);
  await fresh('explorer');
  check('speech removed for this check', !(await q(`'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'`)));
  const before = b.errors.length;
  for (let s = 1; s <= 6; s++) {
    await L.route(b, `#/learn/w1l1/${s}`);
    check(`no-speech step ${s}: polite fallback note`, ((await L.text(b, '#view .rtm-unsupported')) || '').includes('isn’t available in this browser'), await L.text(b, '#view .lesson-body'));
    check(`no-speech step ${s}: no Read to Me controls`, !(await q(`!!document.querySelector('#view .read-to-me')`)));
  }
  await b.js(`document.querySelector('#view nav.lesson-nav a.btn').click();`); await b.wait(300);
  check('no-speech: lesson navigation still works', (await q('location.hash')) === '#/learn/w1l1/5');
  await L.route(b, '#/learn/w1l1/1');
  await b.js(`document.querySelector('#view .lesson-body button.term').click();`); await b.wait(150);
  check('no-speech: word dialog opens', await q(`!!document.querySelector('dialog.modal[open]')`));
  check('no-speech: no "Hear it" button in dialog', !(await q(`[...document.querySelectorAll('dialog.modal button')].some((x) => /Hear it/.test(x.textContent))`)));
  await L.press(b, 'Escape');
  await L.route(b, '#/dictionary');
  check('no-speech: dictionary has no dead "Hear it" buttons', !(await q(`[...document.querySelectorAll('#view button')].some((x) => /Hear it/.test(x.textContent))`)));
  check('no-speech: no console errors', b.errors.length === before, b.errors.slice(before).join(' | '));
  await L.removeInit(b, noSpeech);

  // ================================================================ static: no Baze anywhere in shipped UI sources
  const files = ['index.html', 'styles.css', ...fs.readdirSync(path.join(ROOT, 'js'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => path.join('js', f))];
  const bazeFiles = files.filter((f) => /baze/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  check('no "Baze" in index.html, styles.css or js/**', bazeFiles.length === 0, bazeFiles.join(', '));

  check('no 404s during the audit', server.missing.length === 0, server.missing.join());
} catch (e) {
  check('a11y script ran to completion', false, e.stack);
} finally { b.close(); server.close(); }
for (const i of info.slice(0, 40)) console.log('info:', i);
process.exit(C.done());
