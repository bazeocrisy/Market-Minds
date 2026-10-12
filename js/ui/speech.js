// Read to Me — voluntary browser speech (speechSynthesis). Never autoplays.
//   isSupported()                 → boolean
//   readToMe(container, getText)  → { el, destroy() } mounts Play / Pause-Resume / Replay / Stop / speed
//   speak(text, { rate })         → one-off speech (e.g. "Hear it" in the dictionary)
//   stopAll()                     → stop any speech (views call this in cleanup)
// Long text is spoken sentence by sentence because Chrome cuts off long single utterances.
import { h, uid } from './dom.js';

export function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

// Pause/resume is unreliable on mobile browsers (Android Chrome ignores pause; iOS can drop the queue).
// Desktop browsers get Pause/Resume; others get Stop + Replay only.
function canPause() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  return !/Android|iPhone|iPad|iPod|Mobile|Silk|CrOS/i.test(ua);
}

/** Split text into sentence-sized chunks (≤ max chars). Exported for tests. */
export function chunkText(text, max = 200) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*|$)\s*/g) || [clean];
  const out = [];
  let buf = '';
  const pushLong = (s) => {
    // Break an over-long sentence at commas/semicolons, then at spaces.
    let rest = s.trim();
    while (rest.length > max) {
      let cut = Math.max(rest.lastIndexOf(', ', max), rest.lastIndexOf('; ', max));
      if (cut < max / 3) cut = rest.lastIndexOf(' ', max);
      if (cut <= 0) cut = max;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) out.push(rest);
  };
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    if ((buf + ' ' + t).trim().length <= max) { buf = (buf + ' ' + t).trim(); continue; }
    if (buf) out.push(buf);
    buf = '';
    if (t.length > max) pushLong(t); else buf = t;
  }
  if (buf) out.push(buf);
  return out;
}

let voiceCache = null;
function pickVoice() {
  if (!isSupported()) return null;
  if (voiceCache) return voiceCache;
  const voices = speechSynthesis.getVoices() || [];
  const en = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  voiceCache = en.find((v) => /en[-_]US/i.test(v.lang) && v.localService) || en.find((v) => /en[-_]US/i.test(v.lang)) ||
    en.find((v) => v.default) || en[0] || null;
  return voiceCache;
}
if (isSupported()) {
  try { speechSynthesis.addEventListener('voiceschanged', () => { voiceCache = null; }); } catch { /* old browsers */ }
}

let active = null; // the run that is currently speaking: { cancelled, rate, hooks, timer }

function startRun(chunks, rate, hooks = {}) {
  stopAll();
  const run = { cancelled: false, rate, hooks, timer: 0 };
  active = run;
  let i = 0;
  const next = () => {
    if (run.cancelled) return;
    if (i >= chunks.length) { if (active === run) active = null; hooks.onEnd?.(); return; }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    u.rate = run.rate;
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.onend = next;
    u.onerror = (e) => {
      if (run.cancelled || e.error === 'interrupted' || e.error === 'canceled') return;
      if (e.error === 'not-allowed' || e.error === 'synthesis-unavailable' || e.error === 'audio-busy') {
        if (active === run) active = null;
        hooks.onError?.(e.error);
        return;
      }
      next();
    };
    try { speechSynthesis.speak(u); } catch { hooks.onError?.('failed'); }
  };
  // A short delay after cancel() avoids Chrome silently dropping the first utterance.
  run.timer = setTimeout(next, 60);
  return run;
}

export function stopAll() {
  if (active) {
    const run = active;
    active = null;
    run.cancelled = true;
    clearTimeout(run.timer);
    run.hooks.onStop?.();
  }
  if (isSupported()) { try { speechSynthesis.cancel(); } catch { /* ignore */ } }
}

/** One-off speech for short text. Returns false when unsupported. */
export function speak(text, { rate = 1, onEnd } = {}) {
  if (!isSupported()) return false;
  startRun(chunkText(text), rate, { onEnd });
  return true;
}

/**
 * Mount Read to Me controls at the top of `container`.
 * getText() is called each time Play/Replay is pressed (so it always reads the current step).
 */
export function readToMe(container, getText, { title = 'Read to me' } = {}) {
  if (!isSupported()) {
    const note = h('p', { class: 'rtm-unsupported' }, 'Read to Me isn’t available in this browser — you can read the text yourself.');
    container.prepend(note);
    return { el: note, destroy() {} };
  }
  const pausable = canPause();
  const speedId = uid('rtm-speed');
  let state = 'idle'; // idle | playing | paused | done
  let run = null;

  const status = h('p', { class: 'rtm-status', 'aria-live': 'polite' });
  const play = h('button', { type: 'button', class: 'btn btn-primary btn-sm' }, '▶ Play');
  const pauseBtn = h('button', { type: 'button', class: 'btn btn-sm' }, 'Pause');
  const replay = h('button', { type: 'button', class: 'btn btn-sm' }, '↺ Replay');
  const stop = h('button', { type: 'button', class: 'btn btn-sm' }, '■ Stop');
  const speed = h('select', { id: speedId },
    h('option', { value: '0.75' }, '0.75×'), h('option', { value: '1', selected: true }, '1×'), h('option', { value: '1.25' }, '1.25×'));
  const el = h('div', { class: 'read-to-me', role: 'group', 'aria-label': 'Read to me controls' },
    h('span', { class: 'rtm-title', 'aria-hidden': 'true' }, '🔊 ' + title),
    play, pauseBtn, replay, stop,
    h('label', { for: speedId }, 'Speed', speed),
    status);

  const set = (s, msg) => {
    state = s;
    play.hidden = !(s === 'idle' || s === 'done');
    play.textContent = s === 'done' ? '▶ Play again' : '▶ Play';
    pauseBtn.hidden = !pausable || !(s === 'playing' || s === 'paused');
    pauseBtn.textContent = s === 'paused' ? 'Resume' : 'Pause';
    replay.hidden = !(s === 'playing' || s === 'paused');
    stop.hidden = !(s === 'playing' || s === 'paused');
    if (msg !== undefined) status.textContent = msg;
  };

  const start = () => {
    const chunks = chunkText(getText());
    if (!chunks.length) { status.textContent = 'There is no text to read on this step.'; return; }
    try { speechSynthesis.resume(); } catch { /* ignore */ }
    run = startRun(chunks, Number(speed.value) || 1, {
      onEnd: () => { run = null; set('done', 'Finished reading.'); },
      onStop: () => { run = null; if (state === 'playing' || state === 'paused') set('idle', 'Stopped.'); },
      onError: () => { run = null; set('idle', 'Read to Me could not start. You can read the text yourself.'); }
    });
    set('playing', 'Reading aloud…');
  };

  play.addEventListener('click', start);
  replay.addEventListener('click', start);
  stop.addEventListener('click', () => { stopAll(); set('idle', 'Stopped.'); });
  pauseBtn.addEventListener('click', () => {
    if (state === 'playing') { try { speechSynthesis.pause(); } catch { /* ignore */ } set('paused', 'Paused.'); }
    else if (state === 'paused') { try { speechSynthesis.resume(); } catch { /* ignore */ } set('playing', 'Reading aloud…'); }
  });
  speed.addEventListener('change', () => { if (run) run.rate = Number(speed.value) || 1; });

  set('idle', '');
  container.prepend(el);
  return {
    el,
    destroy() { if (run && active === run) stopAll(); run = null; }
  };
}
