// Smoke: every route in both bands at 375 and 1280 — loads, one h1, no JS errors, no 404s, no horizontal overflow.
import path from 'node:path';
import { startServer, startBrowser, BASE, ROOT } from '../lib/harness.mjs';
const SHOT = process.env.SHOT_DIR;
const server = await startServer();
const b = await startBrowser();
const URL = server.origin + BASE;
let pass = 0, fail = 0;
const check = (n, ok, d = '') => { if (ok) pass++; else { fail++; console.log('FAIL', n, d); } };
const q = (e) => b.js(`return ${e};`);
const ROUTES = ['#/', '#/learn', '#/learn/w1l1/1', '#/learn/w1l1/2', '#/learn/w1l1/3', '#/learn/w1l1/4', '#/learn/w1l1/5', '#/learn/w1l1/6',
  '#/learn/w1l2/3', '#/learn/w1l3/3', '#/learn/w2l1/1', '#/learn/w2l1/3', '#/learn/w2l1/5', '#/practice', '#/thinking', '#/thinking/' , '#/market-lab', '#/market-lab?activity=paper',
  '#/test', '#/test/w1l1', '#/test/world-1', '#/progress', '#/dictionary', '#/stories', '#/journal', '#/parent', '#/learn/nope', '#/bogus',
  '#/welcome', '#/certificates', '#/learn/w2l2/1', '#/learn/w2l3/3', '#/learn/w2l4/5', '#/learn/w4l1/3', '#/learn/w4l2/3', '#/learn/w4l2/5', '#/learn/w4l3/4', '#/learn/w4l4/5', '#/test/world-2', '#/test/world-4', '#/test/w4l2', '#/market-lab?activity=paper&scenario=pretend-rice-pattern-trap'];
try {
  for (const [w, h] of [[375, 812], [412, 915], [820, 1180], [1024, 768], [1280, 800]]) {
    await b.viewport(w, h);
    for (const band of ['explorer', 'analyst']) {
      await b.load(URL); await b.js(`localStorage.clear(); localStorage.setItem('mm.progress.v1', JSON.stringify({version:1,band:'${band}'}));`); await b.load(URL);
      for (const r of ROUTES) {
        const before = b.errors.length;
        await b.js(`location.hash = ${JSON.stringify(r)};`); await b.wait(350);
        const tag = `${w} ${band} ${r}`;
        check(`${tag} errors`, b.errors.length === before, b.errors.slice(before).join(' | ').slice(0, 300));
        check(`${tag} one h1`, (await q(`document.querySelectorAll('#view h1').length`)) === 1, String(await q(`document.querySelectorAll('#view h1').length`)));
        check(`${tag} no overflow`, await q('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), String(await q('document.documentElement.scrollWidth')));
        const bad = await q(`(document.getElementById('view').innerText.match(/\\bundefined\\b|\\bNaN\\b|\\[object Object\\]/g)||[]).join()`);
        check(`${tag} no junk text`, !bad, bad);
        if (SHOT && (w === 375 || band === 'explorer')) await b.shot(path.join(SHOT, `${w}-${band}-${r.replace(/[^a-z0-9]+/gi, '_')}.jpg`), false);
      }
    }
  }
  check('no 404s', server.missing.length === 0, server.missing.join());
} finally { b.close(); server.close(); }
console.log(`smoke: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
