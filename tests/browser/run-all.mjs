// Runs every browser suite ONE AT A TIME (the dev PC has 12 GB RAM — never in parallel).
// Exit code is non-zero if any suite fails.   npm run test:browser
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SUITES = ['smoke.mjs', 'app-shell.mjs', 'pwa.mjs', 'pwa-lifecycle.mjs', 'acceptance.mjs', 'a11y.mjs', 'robustness.mjs'];
const results = [];
for (const s of SUITES) {
  console.log(`\n=== ${s} ===`);
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(here, s)], { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', timeout: 15 * 60 * 1000 });
  process.stdout.write(r.stdout || '');
  const summary = (r.stdout || '').trim().split('\n').reverse().find((l) => /: \d+ passed, \d+ failed/.test(l)) || '(no summary)';
  results.push({ s, ok: r.status === 0, summary, secs: Math.round((Date.now() - t0) / 1000), status: r.status, signal: r.signal });
}
console.log('\n=== browser test summary ===');
for (const x of results) console.log(`${x.ok ? 'PASS' : 'FAIL'}  ${x.s.padEnd(16)} ${x.summary}  (${x.secs}s${x.ok ? '' : `, exit ${x.status ?? x.signal}`})`);
process.exit(results.every((x) => x.ok) ? 0 : 1);
