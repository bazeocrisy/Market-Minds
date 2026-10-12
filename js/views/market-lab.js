// Market Lab — #/market-lab (optional ?activity=watch|paper&scenario=<id>).
// Paper-only practice with INVENTED prices. No accounts, no real prices, no real orders.
// Two activities (both reachable from either band via tabs):
//   Price Watch    (Grades 3–5 default): predict each day + give a reason, then see the change.
//   Paper Practice (Grades 6–8 default): Buy (long) / Sell (short) / No trade on a pretend contract,
//                  optional stop, P/L math line by line, margin vs loss, stop gaps, reflection.
// Rewards reasoning and risk awareness, never pretend profit. No P/L is stored as a score.
import { SCENARIOS, scenarioById, newsExpectation, EFFECT_LABELS } from '../content/market-scenarios.js';
import { pick } from '../content/band.js';
import { renderVisual, formatMoney } from '../ui/visuals.js';
import { renderRichText } from '../ui/vocab.js';
import {
  roundCents, priceChange, percentChange, classifyMove, plSteps, positionPL, marginVsLoss,
  isValidStop, simulateStop
} from '../lab/sim.js';

const ACTIVITIES = [
  { id: 'watch', label: 'Price Watch', grades: 'Grades 3–5' },
  { id: 'paper', label: 'Paper Practice', grades: 'Grades 6–8' }
];
const DIR_WORDS = { up: 'up', down: 'down', same: 'about the same' };
const SIDE_LABEL = { long: 'Buy (long)', short: 'Sell (short)', none: 'No trade / wait' };

// ---------- tiny local DOM helpers ----------
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (k === 'value' || k === 'checked' || k === 'disabled') e[k] = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}
let n = 0;
const uid = (p) => `${p}-${++n}`;
const money = (v) => formatMoney(v);
const signed = (v) => formatMoney(v, { sign: true });
const newId = () => `lab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function radioGroup({ legend, name, options, value, onChange, hint }) {
  const fs = h('fieldset', { class: 'fieldset' }, h('legend', {}, legend));
  if (hint) fs.append(h('p', { class: 'field-hint' }, hint));
  const wrap = h('div', { class: 'radio-cards lab-radio' });
  for (const o of options) {
    wrap.append(h('label', {},
      h('input', { type: 'radio', name, value: o.id, checked: value === o.id, on: { change: () => onChange(o.id) } }),
      h('span', {}, o.label)));
  }
  fs.append(wrap);
  return fs;
}

function chart(title, points, highlight) {
  return h('div', { class: 'visual lab-chart' }, renderVisual({ kind: 'line', title, unit: '$', points, highlight }));
}

function newsCard(day, band, { heading = 'News card' } = {}) {
  return h('aside', { class: 'card lab-news', 'aria-label': `${heading}, ${day.label}` },
    h('p', { class: 'lab-news-label' }, `${heading} · ${day.label}`),
    h('p', { class: 'lab-news-headline' }, pick(day.news.headline, band)));
}

// ---------------------------------------------------------------- view
export function render(el, params, ctx) {
  const band = ctx.band;
  const rich = (t) => renderRichText(t, band);
  let activity = ACTIVITIES.some((a) => a.id === ctx.query?.activity) ? ctx.query.activity : (band === 'analyst' ? 'paper' : 'watch');
  let scenario = scenarioById(ctx.query?.scenario) || SCENARIOS[0];
  let dead = false;

  const tabs = ACTIVITIES.map((a) => h('button', {
    type: 'button', role: 'tab', id: `lab-tab-${a.id}`, class: 'btn lab-tab', 'aria-controls': 'lab-panel',
    on: { click: () => setActivity(a.id), keydown: onTabKey }
  }, a.label, h('span', { class: 'lab-tab-grades' }, ` (${a.grades})`)));
  const panel = h('div', { class: 'lab-panel', id: 'lab-panel', role: 'tabpanel', tabindex: '-1' });

  const selId = uid('lab-scn');
  const select = h('select', { id: selId, on: { change: (e) => { scenario = scenarioById(e.target.value) || SCENARIOS[0]; draw(); } } },
    SCENARIOS.map((s) => h('option', { value: s.id, selected: s.id === scenario.id ? true : null }, s.title)));
  select.value = scenario.id;

  el.append(h('section', { class: 'page market-lab' },
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, 'Paper practice with pretend prices'),
      h('h1', { tabindex: '-1' }, 'Market Lab'),
      h('p', { class: 'lead' }, 'Practice thinking like a careful market learner. Explain your reasons, plan for being wrong, and remember: waiting is a real choice.')),
    h('div', { class: 'notice notice-risk lab-disclaimer', role: 'note' },
      h('p', {}, h('strong', {}, 'Pretend prices only. Not real trading. '), rich('Futures can lose more than the [[margin|margin deposit]]. A [[stop-order|stop order]] does not guarantee your exit price — prices can jump right past it.'))),
    h('div', { class: 'field lab-scenario-pick' },
      h('label', { for: selId }, 'Choose a pretend market'),
      h('span', { class: 'field-hint' }, 'Changing the market starts the activity over.'), select),
    h('div', { class: 'lab-tabs', role: 'tablist', 'aria-label': 'Market Lab activities' }, tabs),
    panel));

  function onTabKey(e) {
    const i = ACTIVITIES.findIndex((a) => a.id === activity);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % ACTIVITIES.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + ACTIVITIES.length) % ACTIVITIES.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = ACTIVITIES.length - 1;
    if (j == null) return;
    e.preventDefault();
    setActivity(ACTIVITIES[j].id);
    tabs[j].focus();
  }
  function setActivity(id) { activity = id; draw(); }

  function draw() {
    if (dead) return;
    tabs.forEach((t, i) => {
      const on = ACTIVITIES[i].id === activity;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `lab-tab-${activity}`);
    panel.textContent = '';
    if (activity === 'watch') priceWatch(panel, scenario, ctx);
    else paperPractice(panel, scenario, ctx);
  }
  draw();

  return () => { dead = true; };
}

function recordRun(ctx, entry) {
  ctx.store.update((s) => {
    s.lab.runs++;
    s.lab.decisions.push({ ...entry, date: Date.now() });
  });
}

function journalBlock(ctx, build) {
  const status = h('p', { role: 'status', class: 'lab-journal-status' });
  const b = h('button', { type: 'button', class: 'btn btn-gold', on: { click: () => {
    const entry = { id: newId(), date: Date.now(), ...build(), lesson: 'market-lab' };
    ctx.store.update((s) => { s.journal.push(entry); });
    b.disabled = true;
    b.textContent = 'Saved to your Decision Journal';
    status.textContent = 'Saved on this device. You can read it any time in the Decision Journal.';
  } } }, 'Save to Decision Journal');
  return h('div', { class: 'lab-journal' }, h('div', { class: 'btn-row' }, b, h('a', { class: 'btn btn-ghost', href: '#/journal' }, 'Open Decision Journal')), status);
}

// ---------------------------------------------------------------- Price Watch
const PREDICTIONS = [
  { id: 'up', label: 'Up' }, { id: 'down', label: 'Down' }, { id: 'same', label: 'About the same' }, { id: 'unsure', label: 'Can’t be sure' }
];
const REASONS = [
  { id: 'news', label: 'The news card' }, { id: 'pattern', label: 'The pattern so far' },
  { id: 'unsure', label: 'Not enough information' }, { id: 'guess', label: 'Just a guess' }
];

function priceWatch(root, sc, ctx) {
  const band = ctx.band;
  const st = { day: 0, pred: null, reason: null, revealed: false, log: [], recorded: false };
  root.append(h('h2', { class: 'lab-activity-title' }, `Price Watch: ${sc.item}`),
    h('p', {}, pick(sc.intro, band)),
    h('p', { class: 'small muted' }, `Prices are pretend, for one ${sc.unit}. A move of 1% or less counts as “about the same.”`));
  const body = h('div', { class: 'lab-body' });
  root.append(body);
  draw();

  function points() {
    const pts = [{ label: 'Start', value: sc.start }];
    for (let i = 0; i < st.day; i++) pts.push({ label: sc.days[i].label.replace('Day ', 'D'), value: sc.days[i].price });
    return pts;
  }
  function priceAt(i) { return i === 0 ? sc.start : sc.days[i - 1].price; }

  // draw({ focus }) — focus moves to the new step's heading after a button press (not on first render).
  function draw({ focus = false } = {}) {
    body.textContent = '';
    body.append(chart(`${sc.item} — pretend price`, points(), st.day));
    if (!st.revealed && st.day >= sc.days.length) { summary(focus); return; }

    if (!st.revealed) {
      const nextDay = sc.days[st.day];
      const head = h('h3', { tabindex: '-1' }, `Predict ${nextDay.label}`);
      const msg = h('p', { class: 'lab-msg', role: 'status' });
      body.append(head,
        h('p', { class: 'lab-today' }, 'Price now: ', h('strong', {}, money(priceAt(st.day))), ` (${st.day === 0 ? 'Start' : sc.days[st.day - 1].label})`),
        newsCard(nextDay, band, { heading: 'News before' }),
        radioGroup({ legend: `What do you predict for ${nextDay.label}?`, name: 'pw-pred', options: PREDICTIONS, value: st.pred, onChange: (v) => { st.pred = v; } }),
        radioGroup({ legend: 'What is your main reason?', name: 'pw-reason', options: REASONS, value: st.reason, onChange: (v) => { st.reason = v; } }),
        h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn btn-primary', on: { click: () => {
          if (!st.pred || !st.reason) { msg.textContent = 'Choose a prediction and a reason first.'; return; }
          reveal();
        } } }, `Reveal ${nextDay.label}`)), msg);
      if (focus) head.focus();
      return;
    }

    // just revealed
    const d = sc.days[st.day - 1];
    const r = st.log[st.log.length - 1];
    const pctText = r.pct == null ? '' : `${r.pct > 0 ? '+' : r.pct < 0 ? '−' : ''}${Math.abs(r.pct)}%`;
    const head = h('h3', { tabindex: '-1', class: 'lab-reveal-head' }, `${d.label}: ${money(d.price)}`);
    const math = h('div', { class: 'lab-math' },
      h('p', {}, `Change = new − old = ${money(d.price)} − ${money(r.old)} = `, h('strong', {}, signed(r.change)), ` (${DIR_WORDS[r.actual]})`),
      band === 'analyst' && pctText ? h('p', { class: 'small' }, `Percent change = change ÷ old × 100 ≈ ${pctText}`) : null);
    const fb = h('div', { class: 'feedback is-neutral lab-feedback' },
      h('p', { class: 'fb-title' }, 'Your reasoning'), h('p', {}, r.reasoningMsg),
      h('p', { class: 'fb-title' }, 'What happened'), h('p', {}, r.outcomeMsg),
      r.why ? h('p', {}, r.why) : null,
      r.exp ? h('p', { class: 'small muted' }, `News type: ${EFFECT_LABELS[d.news.effect]} — usually pushes the price ${r.exp}. Usually, not always.`) : null);
    const last = st.day >= sc.days.length;
    body.append(head, newsCard(d, band, { heading: 'The news was' }), math, fb, h('div', { class: 'btn-row' },
      h('button', { type: 'button', class: 'btn btn-primary', on: { click: () => { st.revealed = false; st.pred = null; st.reason = null; draw({ focus: true }); } } },
        last ? 'See my thinking summary' : 'Next day')));
    if (focus) head.focus();
  }

  function reveal() {
    const day = sc.days[st.day];
    const old = priceAt(st.day);
    const change = priceChange(old, day.price);
    const actual = classifyMove(old, day.price);
    const exp = newsExpectation(day.news.effect);
    const pct = percentChange(old, day.price);
    const surprise = !!exp && actual !== exp;
    st.log.push({
      day: day.label, old, change, actual, exp, pct, pred: st.pred, reason: st.reason, surprise,
      reasoningMsg: reasoningFeedback(st.pred, st.reason, exp, day.news.effect),
      outcomeMsg: outcomeFeedback(st.pred, actual, exp),
      why: day.why ? pick(day.why, band) : null
    });
    st.day++;
    st.revealed = true;
    draw({ focus: true });
  }

  function summary(focus) {
    const usedNews = st.log.filter((l) => l.reason === 'news').length;
    const unsure = st.log.filter((l) => l.pred === 'unsure' || l.reason === 'unsure').length;
    const guesses = st.log.filter((l) => l.reason === 'guess').length;
    const surprises = st.log.filter((l) => l.surprise);
    const total = priceChange(sc.start, sc.days[sc.days.length - 1].price);
    if (!st.recorded) {
      st.recorded = true;
      recordRun(ctx, { scenarioId: sc.id, activity: 'price-watch', choice: st.log.map((l) => l.pred).join(','), reasonGiven: guesses < st.log.length });
    }
    const head = h('h3', { tabindex: '-1' }, 'Your thinking summary');
    const items = [
      `You used the news card ${usedNews} ${usedNews === 1 ? 'time' : 'times'}.`,
      unsure ? `You said you couldn’t be sure ${unsure} ${unsure === 1 ? 'time' : 'times'} — that’s honest thinking.` : 'You never said “can’t be sure.” Remember: it’s always a fair answer about the future.',
      guesses ? `You guessed ${guesses} ${guesses === 1 ? 'time' : 'times'}. Next time, try to use the news as evidence.` : 'You gave a reason every day. That’s what good market thinkers do.',
      surprises.length
        ? `Prices surprised us on ${surprises.map((s) => s.day).join(' and ')} — the price moved against the news. That’s uncertainty.`
        : 'The price followed the news this time. That can change — next time it might not.'
    ];
    const reflId = uid('pw-refl');
    const refl = h('textarea', { id: reflId, rows: '3', maxlength: '1000' });
    body.append(head,
      h('ul', { class: 'lab-summary' }, items.map((t) => h('li', {}, t))),
      h('p', {}, `Over the whole time, the pretend price went from ${money(sc.start)} to ${money(sc.days[sc.days.length - 1].price)} (${signed(total)}).`),
      h('div', { class: 'key-idea' }, h('span', { class: 'label' }, 'Big idea'), h('p', {}, pick(sc.takeaway, band))),
      h('div', { class: 'field' }, h('label', { for: reflId }, 'What did you learn? (optional)'),
        h('span', { class: 'field-hint' }, 'Please don’t write your name.'), refl),
      journalBlock(ctx, () => ({
        prediction: `Price Watch — ${sc.item}: my predictions were ${st.log.map((l) => (l.pred === 'unsure' ? 'can’t be sure' : DIR_WORDS[l.pred])).join(', ')}.`,
        reasoning: [`Used the news card ${usedNews} of ${st.log.length} days.`, refl.value.trim()].filter(Boolean).join(' '),
        outcome: `Pretend price went from ${money(sc.start)} to ${money(sc.days[sc.days.length - 1].price)}.${surprises.length ? ` Surprises on ${surprises.map((s) => s.day).join(', ')}.` : ''}`
      })),
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn', on: { click: () => { Object.assign(st, { day: 0, pred: null, reason: null, revealed: false, log: [], recorded: false }); draw({ focus: true }); } } }, 'Watch this market again')));
    if (focus) head.focus();
  }
}

export function reasoningFeedback(pred, reason, exp, effect) {
  if (pred === 'unsure') {
    return exp
      ? `You said you can’t be sure — that’s honest. The news did give a clue: ${EFFECT_LABELS[effect].toLowerCase()} usually pushes a price ${exp}. You can use a clue and still say you’re not certain.`
      : 'You said you can’t be sure — that’s honest, especially when the news gives no real supply or demand clue.';
  }
  if (reason === 'news') {
    if (!exp) return effect === 'opinion'
      ? 'Careful: this news card was just someone’s opinion. Sounding sure isn’t evidence about supply or demand.'
      : 'This news card didn’t really give a supply or demand clue, so it can’t point the way by itself.';
    if (pred === exp) return 'Sound reasoning: you connected the news to supply and demand.';
    return `You used the news — good. Check the direction: ${EFFECT_LABELS[effect].toLowerCase()} usually pushes a price ${exp}.`;
  }
  if (reason === 'pattern') return 'Looking at the pattern is one clue, but past moves don’t decide the next one. Check the news card too.';
  if (reason === 'unsure') return 'You noticed there wasn’t enough information. That’s an honest, careful thought.';
  return 'Guesses happen! Next time, try using the news card as evidence for your prediction.';
}

export function outcomeFeedback(pred, actual, exp) {
  const moved = `The price went ${DIR_WORDS[actual]}.`;
  if (exp && actual !== exp) return `${moved} Prices surprised us: the news pointed ${exp}, but the price didn’t follow. That’s uncertainty — sound reasoning can still meet a surprise.`;
  if (pred === actual) return `${moved} It matched your prediction this time, but one match doesn’t prove anything — news never guarantees a move.`;
  if (pred === 'unsure') return `${moved} Nobody could know that for sure ahead of time.`;
  return `${moved} Different from your prediction — that happens to everyone. What matters is how you reasoned.`;
}

// ---------------------------------------------------------------- Paper Practice
function paperPractice(root, sc, ctx) {
  const band = ctx.band;
  const st = { phase: 'setup', side: null, reason: '', stopText: '', stop: null, day: 0, exit: null, exitDay: -1, stopped: null, exitedEarly: false, recorded: false, reflReason: null, reflLuck: null, reflText: '' };
  const contract = `${sc.quantity} ${sc.unit}s of ${sc.item}`;
  root.append(h('h2', { class: 'lab-activity-title' }, `Paper Practice: ${sc.item}`),
    h('p', {}, pick(sc.intro, band)),
    h('dl', { class: 'lab-contract' },
      h('div', {}, h('dt', {}, 'Practice contract (pretend)'), h('dd', {}, `${contract}. Made up for learning — not a real contract.`)),
      h('div', {}, h('dt', {}, 'Price today (Start)'), h('dd', {}, `${money(sc.start)} per ${sc.unit}`)),
      h('div', {}, h('dt', {}, 'Pretend margin deposit'), h('dd', {}, renderRichText(`${money(sc.margin)} — a good-faith [[margin|deposit]], NOT the most you can lose.`, band)))));
  const body = h('div', { class: 'lab-body' });
  root.append(body);
  draw();

  function priceAt(i) { return i === 0 ? sc.start : sc.days[i - 1].price; }
  function points() {
    const pts = [{ label: 'Start', value: sc.start }];
    for (let i = 0; i < st.day; i++) pts.push({ label: sc.days[i].label.replace('Day ', 'D'), value: sc.days[i].price });
    return pts;
  }

  function draw() {
    body.textContent = '';
    if (st.phase === 'setup') return setup();
    body.append(chart(`${sc.item} — pretend price`, points(), st.day));
    if (st.phase === 'running') return running();
    return done();
  }

  function setup() {
    body.append(newsCard(sc.days[0], band, { heading: 'Morning news for' }));
    const msg = h('p', { class: 'lab-msg', role: 'alert' });
    const reasonId = uid('pp-reason'), stopId = uid('pp-stop'), stopHint = uid('pp-stop-hint');
    body.append(
      radioGroup({
        legend: 'Your decision', name: 'pp-side', value: st.side, onChange: (v) => { st.side = v; },
        options: [
          { id: 'long', label: 'Buy (long) — gains if the price rises, loses if it falls' },
          { id: 'short', label: 'Sell (short) — gains if the price falls, loses if it rises' },
          { id: 'none', label: 'No trade / wait — a careful, respected choice' }
        ]
      }),
      h('p', { class: 'small lab-words' }, renderRichText('Word help: [[long]] · [[short]] · [[margin]] · [[stop-order|stop order]]', band)),
      h('div', { class: 'field' },
        h('label', { for: reasonId }, 'Why? Write your reason'),
        h('span', { class: 'field-hint' }, 'Use the news and what you know about supply and demand. Please don’t write your name.'),
        h('textarea', { id: reasonId, rows: '3', maxlength: '1000', value: st.reason, on: { input: (e) => { st.reason = e.target.value; } } })),
      h('div', { class: 'field' },
        h('label', { for: stopId }, 'Stop price (optional)'),
        h('span', { class: 'field-hint', id: stopHint }, `A stop is a plan to get out if the price moves against you. For Buy, put it below ${money(sc.start)}; for Sell, above. It is NOT a guarantee: if the price jumps past your stop, you get out at the next available price.`),
        h('input', { type: 'number', id: stopId, inputmode: 'decimal', step: '0.01', min: '0.01', 'aria-describedby': stopHint, value: st.stopText, on: { input: (e) => { st.stopText = e.target.value; } } })),
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn btn-primary', on: { click: start } }, 'Start the pretend days')),
      msg);

    function start() {
      if (!st.side) { msg.textContent = 'Choose Buy, Sell, or No trade first.'; return; }
      st.stop = null;
      if (st.side !== 'none' && st.stopText.trim() !== '') {
        const v = roundCents(Number(st.stopText));
        if (!isValidStop(st.side, sc.start, v)) {
          msg.textContent = st.side === 'long'
            ? `For Buy (long), a stop must be below today’s price of ${money(sc.start)}. Change it or leave it blank.`
            : `For Sell (short), a stop must be above today’s price of ${money(sc.start)}. Change it or leave it blank.`;
          return;
        }
        st.stop = v;
      }
      st.phase = 'running';
      draw();
    }
  }

  /** News, gap note and "why" for day number k (1-based). */
  function dayDetails(k) {
    const d = sc.days[k - 1];
    const prev = priceAt(k - 1);
    return h("div", { class: "lab-day" },
      h("p", { class: "lab-news-headline" }, h("span", { class: "lab-news-label" }, `${d.label} news: `), pick(d.news.headline, band)),
      d.open != null && roundCents(d.open) !== roundCents(prev)
        ? h("p", { class: "lab-gap" }, `Gap! The price was ${money(prev)} and then opened at ${money(d.open)}, skipping every price in between.`) : null,
      d.why ? h("p", { class: "small" }, pick(d.why, band)) : null);
  }

  function running() {
    const has = st.side !== 'none';
    const head = h('h3', { tabindex: '-1' }, st.day === 0 ? 'Day by day' : `${sc.days[st.day - 1].label}: ${money(priceAt(st.day))}`);
    body.append(head,
      h('p', {}, `Your choice: `, h('strong', {}, SIDE_LABEL[st.side]), has ? ` at ${money(sc.start)}` : '', st.stop != null ? `, stop at ${money(st.stop)}` : '', '.'));
    if (st.day > 0) {
      body.append(dayDetails(st.day));
      if (has) body.append(plBlock(sc.start, priceAt(st.day), 'Pretend profit or loss so far (if you got out now)'));
    }
    if (st.day < sc.days.length) {
      body.append(newsCard(sc.days[st.day], band, { heading: 'Next news' }));
      body.append(h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn btn-primary', on: { click: step } }, `Go to ${sc.days[st.day].label}`),
        has && st.day > 0 ? h('button', { type: 'button', class: 'btn', on: { click: () => finish(st.day, priceAt(st.day), null, true) } }, 'Get out now at this price') : null));
    }
    head.focus();
  }

  function step() {
    const i = st.day;   // index into days of the day being revealed
    if (st.side !== 'none' && st.stop != null) {
      const prevClose = priceAt(i);
      const s = simulateStop({ side: st.side, stop: st.stop, entry: prevClose, days: [sc.days[i]] });
      if (s.triggered) { st.day = i + 1; return finish(i + 1, s.fill, s); }
    }
    st.day = i + 1;
    if (st.day >= sc.days.length) return finish(st.day, priceAt(st.day), null);
    draw();
  }

  function finish(dayNum, exit, stopped, early = false) {
    st.exit = exit; st.exitDay = dayNum; st.stopped = stopped; st.exitedEarly = early;
    st.phase = 'done';
    if (!st.recorded) {
      st.recorded = true;
      recordRun(ctx, { scenarioId: sc.id, activity: 'paper-practice', choice: st.side, reasonGiven: st.reason.trim().length > 0 });
    }
    draw();
  }

  function plBlock(entry, exit, title, side = st.side) {
    const r = plSteps({ entry, exit, quantity: sc.quantity, side }, money);
    return h('div', { class: `lab-math ${r.total < 0 ? 'is-loss' : r.total > 0 ? 'is-gain' : 'is-even'}` },
      h('p', { class: 'lab-math-title' }, title),
      h('ol', { class: 'lab-math-lines' }, r.lines.map((l) => h('li', {}, l))),
      h('p', { class: 'lab-math-total' }, r.total < 0 ? 'Pretend loss: ' : r.total > 0 ? 'Pretend gain: ' : 'Even: ', h('strong', {}, signed(r.total))));
  }

  function done() {
    const head = h('h3', { tabindex: '-1' }, 'How it turned out (pretend)');
    body.append(head);
    if (st.exitDay > 0 && !st.exitedEarly) body.append(dayDetails(st.exitDay));
    const last = sc.days[sc.days.length - 1].price;
    if (st.side === 'none') {
      const l = positionPL({ entry: sc.start, exit: last, quantity: sc.quantity, side: 'long' });
      body.append(h('p', {}, `You chose not to trade. Waiting is a valid, respected choice — you never had to guess right.`),
        h('p', {}, `For comparison, from ${money(sc.start)} to ${money(last)}: Buy (long) would have been ${signed(l)}; Sell (short) would have been ${signed(-l || 0)}. One side gains exactly what the other side loses.`));
    } else {
      if (st.stopped) {
        const s = st.stopped;
        body.append(h('div', { class: `notice ${s.gapped ? 'notice-warn' : 'notice-info'} lab-stop` },
          h('p', {}, h('strong', {}, `Your stop at ${money(st.stop)} was triggered on ${sc.days[st.exitDay - 1].label}. `),
            s.gapped
              ? `The price jumped past it and opened at ${money(s.fill)}, so you got out at ${money(s.fill)} — ${money(s.gap)} per ${sc.unit} worse than your stop. Stop orders do not guarantee the exit price.`
              : `The price moved through your stop smoothly, so you got out at your stop price, ${money(s.fill)}. That won’t always happen — prices can gap past a stop.`)));
      } else if (st.exitedEarly) {
        body.append(h('p', {}, `You chose to get out on ${sc.days[st.exitDay - 1].label} at ${money(st.exit)}.`));
      } else {
        body.append(h('p', {}, `The practice ended on ${sc.days[sc.days.length - 1].label} at ${money(st.exit)}.`));
      }
      const pl = positionPL({ entry: sc.start, exit: st.exit, quantity: sc.quantity, side: st.side });
      body.append(plBlock(sc.start, st.exit, `Your ${SIDE_LABEL[st.side]} result`));
      const m = marginVsLoss(sc.margin, pl);
      if (pl < 0) {
        body.append(h('div', { class: `notice ${m.exceeds ? 'notice-risk' : 'notice-info'} lab-margin` },
          h('p', {}, `Pretend margin deposit: ${money(m.margin)}. Pretend loss: ${money(m.loss)}.`),
          h('p', {}, m.exceeds
            ? `The loss is bigger than the margin deposit. With real futures you would owe the extra ${money(m.extraOwed)}. Margin is not the most you can lose.`
            : `This loss was smaller than the deposit — but it could have been bigger. Margin is not the most you can lose.`)));
      } else {
        body.append(h('div', { class: 'notice notice-info lab-margin' },
          h('p', {}, pl > 0
            ? 'This one ended as a pretend gain. It wasn’t guaranteed — the price could just as easily have moved the other way.'
            : 'This one ended about even. Prices could have moved either way.'),
          h('p', {}, `Remember: the ${money(sc.margin)} pretend deposit is not a limit. A loss can be bigger than the margin.`)));
      }
      const other = st.side === 'long' ? 'short' : 'long';
      const op = positionPL({ entry: sc.start, exit: st.exit, quantity: sc.quantity, side: other });
      body.append(h('p', { class: 'small' }, `The other side, ${SIDE_LABEL[other]}, would have been ${signed(op)} at the same exit. Gains and losses are both always possible.`));
    }
    reflection();
    head.focus();
  }

  function reflection() {
    const fb = h('div', { class: 'feedback is-neutral', 'aria-live': 'polite' });
    const update = () => {
      fb.textContent = '';
      if (!st.reflReason || !st.reflLuck) return;
      const good = st.reflReason === 'evidence';
      const luck = st.reflLuck === 'luck' || st.reflLuck === 'unclear';
      fb.append(h('p', { class: 'fb-title' }, 'Thinking about your thinking'), h('p', {},
        good && luck ? 'A sound reason can still meet a surprise. Judge the decision by the reasoning, not only by the result.'
          : good ? 'Your reasoning used evidence. Even so, the future was uncertain — the same choice could turn out differently next time.'
            : luck ? 'Honest answer! When a result comes from luck, it doesn’t teach much. Next time, try writing a clear reason first.'
              : 'Be careful: a good result after a guess is often luck. A clear reason makes your next decision stronger.'));
    };
    const reflId = uid('pp-refl');
    body.append(h('section', { class: 'section lab-reflection', 'aria-label': 'Reflection' },
      h('h3', {}, 'Reflect'),
      radioGroup({ legend: 'Was your reasoning sound?', name: 'pp-r1', value: st.reflReason, onChange: (v) => { st.reflReason = v; update(); },
        options: [{ id: 'evidence', label: 'Yes — I used evidence' }, { id: 'partly', label: 'Partly' }, { id: 'guess', label: 'Not really — mostly a guess' }] }),
      radioGroup({ legend: 'Did the outcome come from your reasoning or from luck?', name: 'pp-r2', value: st.reflLuck, onChange: (v) => { st.reflLuck = v; update(); },
        options: [{ id: 'reasoning', label: 'Mostly my reasoning' }, { id: 'luck', label: 'Mostly luck or surprise' }, { id: 'unclear', label: 'Hard to tell' }] }),
      fb,
      h('div', { class: 'field' }, h('label', { for: reflId }, 'What would you do the same or differently next time? (optional)'),
        h('textarea', { id: reflId, rows: '3', maxlength: '1000', value: st.reflText, on: { input: (e) => { st.reflText = e.target.value; } } })),
      journalBlock(ctx, () => {
        const pl = st.side === 'none' ? 0 : positionPL({ entry: sc.start, exit: st.exit, quantity: sc.quantity, side: st.side });
        const m = marginVsLoss(sc.margin, pl);
        return {
          prediction: `Paper Practice — ${sc.item}: I chose ${SIDE_LABEL[st.side]}${st.stop != null ? ` with a stop at ${money(st.stop)}` : ''}.`,
          reasoning: [st.reason.trim() || '(No reason written.)', st.reflText.trim()].filter(Boolean).join(' Reflection: '),
          outcome: st.side === 'none'
            ? 'I waited and did not trade. Pretend prices only.'
            : `Pretend result: ${signed(pl)}${m.exceeds ? ` (a loss bigger than the ${money(sc.margin)} margin deposit)` : ''}${st.stopped?.gapped ? '; my stop filled past the stop price because of a gap' : ''}. Pretend prices only.`
        };
      }),
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn', on: { click: () => {
        Object.assign(st, { phase: 'setup', side: null, reason: '', stopText: '', stop: null, day: 0, exit: null, exitDay: -1, stopped: null, exitedEarly: false, recorded: false, reflReason: null, reflLuck: null, reflText: '' });
        draw();
        body.querySelector('input')?.focus();
      } } }, 'Practice this market again'))));
    update();
  }
}
