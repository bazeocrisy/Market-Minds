// Local, anonymous progress. No names, no accounts, nothing leaves the browser.
// Versioned + validated so stale or hand-edited data can't break the app, and cross-tab safe:
// a change saved in another tab reloads here instead of being silently overwritten later.

export const KEY = 'mm.progress.v1';
export const CORRUPT_KEY = 'mm.progress.corrupt';
export const VERSION = 1;
const BANDS = ['explorer', 'analyst'];

export function emptyState() {
  return {
    version: VERSION, updatedAt: 0, band: null, current: null,
    lessons: {}, skills: {}, misses: {}, tests: [], thinking: {}, journal: [], lab: { runs: 0, decisions: [] }
  };
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);

/** Repair anything malformed field by field (keeps whatever is still valid). */
export function normalize(raw) {
  const s = emptyState();
  if (!isObj(raw) || raw.version !== VERSION) return s;
  s.updatedAt = num(raw.updatedAt);
  s.band = BANDS.includes(raw.band) ? raw.band : null;
  if (isObj(raw.current) && typeof raw.current.lessonId === 'string') {
    s.current = { lessonId: raw.current.lessonId, step: Math.max(1, Math.floor(num(raw.current.step)) || 1) };
  }
  if (isObj(raw.lessons)) for (const [id, l] of Object.entries(raw.lessons)) {
    if (!isObj(l)) continue;
    const step = Math.max(1, Math.floor(num(l.step)) || 1);
    s.lessons[id] = { step, maxStep: Math.max(step, Math.floor(num(l.maxStep))), completed: l.completed === true, completedAt: num(l.completedAt) };
  }
  if (isObj(raw.skills)) for (const [id, k] of Object.entries(raw.skills)) {
    if (!isObj(k)) continue;
    const pair = (p) => ({ correct: num(p?.correct), attempts: num(p?.attempts) });
    const ind = pair(k.independent), ast = pair(k.assisted);
    ind.correct = Math.min(ind.correct, ind.attempts); ast.correct = Math.min(ast.correct, ast.attempts);
    s.skills[id] = {
      introduced: k.introduced === true, independent: ind, assisted: ast, revealed: num(k.revealed),
      recent: Array.isArray(k.recent) ? k.recent.filter((x) => x === 0 || x === 1).slice(-8) : [], lastSeen: num(k.lastSeen)
    };
  }
  if (isObj(raw.misses)) for (const [id, m] of Object.entries(raw.misses)) {
    if (!isObj(m) || num(m.count) === 0) continue;
    const mis = {};
    if (isObj(m.misconceptions)) for (const [k, v] of Object.entries(m.misconceptions)) if (num(v)) mis[k] = num(v);
    s.misses[id] = { count: num(m.count), misconceptions: mis, lastMissed: num(m.lastMissed), clearedStreak: num(m.clearedStreak) };
  }
  if (Array.isArray(raw.tests)) s.tests = raw.tests.filter((t) => isObj(t) && num(t.total) > 0 && num(t.score) <= t.total).slice(-50);
  if (isObj(raw.thinking)) for (const [id, t] of Object.entries(raw.thinking)) if (isObj(t)) s.thinking[id] = t;
  if (Array.isArray(raw.journal)) s.journal = raw.journal.filter((j) => isObj(j) && typeof j.id === 'string').slice(-200);
  if (isObj(raw.lab)) s.lab = { runs: num(raw.lab.runs), decisions: Array.isArray(raw.lab.decisions) ? raw.lab.decisions.slice(-100) : [] };
  return s;
}

function safeStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function createStore(storage = safeStorage()) {
  let state = read();
  const subs = new Set();

  function read() {
    if (!storage) return emptyState();
    let text = null;
    try { text = storage.getItem(KEY); } catch { return emptyState(); }
    if (text == null) return emptyState();
    try { return normalize(JSON.parse(text)); } catch {
      try { storage.setItem(CORRUPT_KEY, text); } catch { /* ignore */ }
      return emptyState();
    }
  }
  function write() {
    state.updatedAt = Date.now();
    if (!storage) return;
    try { storage.setItem(KEY, JSON.stringify(state)); } catch { /* full or blocked: keep working in memory */ }
  }
  const notify = () => subs.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });

  const store = {
    get: () => state,
    update(fn) {
      // Re-read first so a write from another tab is never clobbered by our older copy.
      const fresh = read();
      if (fresh.updatedAt > state.updatedAt) state = fresh;
      fn(state);
      state = normalize(state);
      write();
      notify();
      return state;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { state = emptyState(); write(); notify(); },
    /** Called on a `storage` event from another tab. */
    reload() { state = read(); notify(); },

    setBand(band) { if (BANDS.includes(band)) store.update((s) => { s.band = band; }); },
    markLessonStep(lessonId, step) {
      store.update((s) => {
        const l = s.lessons[lessonId] || (s.lessons[lessonId] = { step: 1, maxStep: 1, completed: false, completedAt: 0 });
        l.step = step; l.maxStep = Math.max(l.maxStep, step);
        s.current = { lessonId, step };
      });
    },
    completeLesson(lessonId) {
      store.update((s) => {
        const l = s.lessons[lessonId] || (s.lessons[lessonId] = { step: 1, maxStep: 1, completed: false, completedAt: 0 });
        if (!l.completed) { l.completed = true; l.completedAt = Date.now(); }
      });
    },
    introduceSkills(ids) {
      store.update((s) => {
        for (const id of ids) {
          const k = s.skills[id] || (s.skills[id] = { introduced: false, independent: { correct: 0, attempts: 0 }, assisted: { correct: 0, attempts: 0 }, revealed: 0, recent: [], lastSeen: 0 });
          k.introduced = true;
        }
      });
    }
  };
  return store;
}

export const store = createStore();
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) store.reload(); });
}
