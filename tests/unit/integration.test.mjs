// Cross-layer checks (Lead): engine output, Thinking Lab and Market Lab text only use glossary terms that exist.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestion, makeRng } from '../../js/engine/index.js';
import { SKILL_IDS } from '../../js/content/skills.js';
import { GLOSSARY } from '../../js/content/glossary.js';
import { LESSONS } from '../../js/content/lessons.js';
import { THINKING_PROMPTS } from '../../js/content/thinking.js';
import { SCENARIOS } from '../../js/content/market-scenarios.js';

const IDS = new Set(GLOSSARY.map((t) => t.id));
const MARKUP = /\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g;
function unresolved(value, out = new Set()) {
  if (typeof value === 'string') { for (const m of value.matchAll(MARKUP)) if (!IDS.has(m[1])) out.add(m[1]); }
  else if (Array.isArray(value)) value.forEach((v) => unresolved(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => unresolved(v, out));
  return out;
}

test('every generated question uses only real glossary terms', () => {
  const rng = makeRng(20261011);
  for (const skill of SKILL_IDS) for (const band of ['explorer', 'analyst']) for (const difficulty of ['easy', 'medium', 'challenge']) {
    for (let i = 0; i < 40; i++) {
      const q = generateQuestion(skill, { band, difficulty, rng });
      assert.deepEqual([...unresolved(q)], [], `${skill}/${band}/${difficulty} ${q.template}`);
    }
  }
});

test('Thinking Lab and Market Lab text use only real glossary terms', () => {
  assert.deepEqual([...unresolved(THINKING_PROMPTS)], []);
  assert.deepEqual([...unresolved(SCENARIOS)], []);
});

test('ready lessons only practise skills the engine can generate', () => {
  for (const l of LESSONS.filter((x) => x.status === 'ready')) {
    for (const s of l.skills) assert.ok(SKILL_IDS.includes(s), `${l.id}: ${s}`);
  }
});
