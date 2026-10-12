// Achievement Certificates (#/certificates, #/certificates/<certId>).
// Certificates celebrate SKILLS shown on the learner's own — never trading or investment results.
//   World certificate  (certId 'world-N'):  every ready lesson in the world completed AND every skill
//                                           in those lessons 'mastered' per masteryFor (independent evidence).
//   Skill Badge        (certId 'skill-<skillId>'): that ready skill is 'mastered' per masteryFor.
// Status is recomputed from saved progress every time; nothing about certificates is stored, and no
// name is ever collected — the printed certificate has a blank line to write a name by hand.
import { h, pageHead, notice, chip, linkBtn, btn, plural, skillName, worldTitle, lessonsInWorld, readySkillIds, statBox, closeAllModals } from '../ui/dom.js';
import { pick } from '../content/band.js';
import { WORLDS } from '../content/worlds.js';
import { lessonById } from '../content/lessons.js';
import { SKILLS } from '../content/skills.js';
import { masteryFor } from '../engine/index.js';

const LEVEL_LABEL = {
  'not-started': 'Not started', introduced: 'Introduced', practicing: 'Practicing', 'needs-review': 'Needs review', mastered: 'Mastered'
};

function mastery(state, id) {
  try { return masteryFor(state, id) || { level: 'not-started' }; } catch { return { level: 'not-started' }; }
}

/** World certificates for every world that has at least one ready lesson (in world order). */
export function worldCertificates(state) {
  const out = [];
  for (const w of WORLDS) {
    const all = lessonsInWorld(w);
    const lessons = all.filter((l) => l.id && l.status === 'ready' && lessonById(l.id));
    if (!lessons.length) continue;
    const skills = [...new Set(lessons.flatMap((l) => l.skills || []))].filter((s) => SKILLS[s]);
    const done = lessons.filter((l) => state.lessons?.[l.id]?.completed);
    const levels = Object.fromEntries(skills.map((s) => [s, mastery(state, s).level]));
    const mastered = skills.filter((s) => levels[s] === 'mastered');
    const earned = skills.length > 0 && done.length === lessons.length && mastered.length === skills.length;
    out.push({ id: w.id, kind: 'world', world: w, lessons, skills, done, levels, mastered, planned: all.length - lessons.length, earned });
  }
  return out;
}

/** One Skill Badge per ready skill (lesson order). */
export function skillCertificates(state) {
  return readySkillIds().filter((id) => SKILLS[id]).map((id) => {
    const m = mastery(state, id);
    return { id: `skill-${id}`, kind: 'skill', skillId: id, skill: SKILLS[id], m, earned: m.level === 'mastered' };
  });
}

/** { earned, total } across world certificates and skill badges. */
export function certificateCounts(state) {
  const all = [...worldCertificates(state), ...skillCertificates(state)];
  return { earned: all.filter((c) => c.earned).length, total: all.length };
}

const practiceLink = (id) => h('a', { href: `#/practice?skill=${encodeURIComponent(id)}` }, skillName(id));
const joinNodes = (nodes) => nodes.flatMap((n, i) => (i ? [', ', n] : [n]));
const longDate = () => {
  try { return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return new Date().toDateString(); }
};

export function render(el, params, ctx) {
  const page = h('section', { class: 'page' });
  el.append(page);
  let cleanup = null;
  if (params[0]) cleanup = renderCertificate(page, params[0], ctx);
  else renderList(page, ctx);
  return () => { cleanup?.(); closeAllModals(); };
}

// ---------------------------------------------------------------- list
function renderList(page, ctx) {
  const state = ctx.store.get();
  const band = ctx.band;
  const worlds = worldCertificates(state);
  const skills = skillCertificates(state);
  const earnedCount = [...worlds, ...skills].filter((c) => c.earned).length;
  const plannedWorlds = WORLDS.length - worlds.length;

  page.append(pageHead({
    eyebrow: 'Certificates',
    title: 'Achievement Certificates',
    lead: 'Certificates celebrate skills you have shown on your own — never pretend profits.'
  }));
  page.append(h('div', { class: 'stats' },
    statBox(`${earnedCount} of ${worlds.length + skills.length}`, 'certificates earned'),
    statBox(`${worlds.filter((c) => c.earned).length} of ${worlds.length}`, 'world certificates'),
    statBox(`${skills.filter((c) => c.earned).length} of ${skills.length}`, 'skill badges')));
  page.append(notice(h('div', {},
    h('p', {}, h('strong', {}, 'How certificates are earned. '),
      'A Skill Badge is earned when that skill is Mastered — answered correctly on your own (first try, no hints), again and again, in Practice or on a Test.'),
    h('p', {}, 'A World certificate is earned when you have completed every ready lesson in that world AND mastered every one of its skills. ',
      'Reading lessons or time spent alone never earns a certificate. Market Lab results never count.'))));
  if (!earnedCount) {
    page.append(h('p', { class: 'empty' }, 'No certificates earned yet. Each one below shows exactly what is still needed.'));
  }

  // ----- world certificates -----
  const ws = h('section', { class: 'section', 'aria-labelledby': 'cert-worlds' }, h('h2', { id: 'cert-worlds' }, 'World certificates'));
  if (!worlds.length) ws.append(h('p', { class: 'empty' }, 'No lessons are ready yet.'));
  else ws.append(h('ul', { class: 'cert-list' }, worlds.map((c) => h('li', {}, worldCard(c, band)))));
  if (plannedWorlds > 0) ws.append(h('p', { class: 'small muted', style: 'margin-top:12px' }, `${plural(plannedWorlds, 'more world')} ${plannedWorlds === 1 ? 'is' : 'are'} in development.`));
  page.append(ws);

  // ----- skill badges -----
  const ss = h('section', { class: 'section', 'aria-labelledby': 'cert-skills' }, h('h2', { id: 'cert-skills' }, 'Skill Badges'));
  if (!skills.length) ss.append(h('p', { class: 'empty' }, 'No skills are ready yet.'));
  else ss.append(h('ul', { class: 'cert-list' }, skills.map((c) => h('li', {}, skillCard(c, band)))));
  page.append(ss);

  page.append(h('div', { class: 'btn-row section' }, linkBtn('#/progress', 'See My Progress', 'btn'), linkBtn('#/practice', 'Go to Practice', 'btn btn-primary')));
}

function certCard(c, title, sub, body) {
  const titleId = `cert-${c.id}`;
  return h('article', { class: `card cert-card ${c.earned ? 'is-earned' : 'is-locked'}`, 'aria-labelledby': titleId },
    h('div', { class: 'cert-card-head' },
      h('span', { class: 'cert-medal', 'aria-hidden': 'true' }, c.earned ? '★' : '☆'),
      h('div', {},
        h('h3', { class: 'card-title', id: titleId }, title),
        sub ? h('p', { class: 'small muted', style: 'margin:0' }, sub) : null),
      c.earned ? chip('Earned', 'done') : chip('Not earned yet', 'planned')),
    body);
}

function worldCard(c, band) {
  const sub = `${plural(c.lessons.length, 'ready lesson')} · ${plural(c.skills.length, 'skill')}`;
  if (c.earned) {
    return certCard(c, worldTitle(c.world), sub, h('div', {},
      h('p', {}, `Every ready lesson completed and all ${plural(c.skills.length, 'skill')} mastered on your own.`),
      linkBtn(`#/certificates/${c.id}`, 'View and print', 'btn btn-gold', { 'aria-label': `View and print the ${worldTitle(c.world)} certificate` })));
  }
  const todoLessons = c.lessons.filter((l) => !c.done.includes(l));
  const todoSkills = c.skills.filter((s) => !c.mastered.includes(s));
  return certCard(c, worldTitle(c.world), sub, h('div', {},
    h('p', { class: 'small', style: 'margin-bottom:4px' }, h('strong', {}, 'Still needed:')),
    h('ul', { class: 'cert-needs' },
      h('li', {}, `${c.done.length} of ${c.lessons.length} lessons complete`,
        todoLessons.length ? [' — Finish: ', joinNodes(todoLessons.map((l) => h('a', { href: `#/learn/${l.id}` }, pick(l.title, band))))] : ' ✓'),
      h('li', {}, `${c.mastered.length} of ${c.skills.length} skills mastered`,
        todoSkills.length ? [' — Practice: ', joinNodes(todoSkills.map(practiceLink))] : ' ✓'))));
}

function skillCard(c, band) {
  const lesson = lessonById(c.skill.lesson);
  const sub = lesson ? `From: ${pick(lesson.title, band)}` : '';
  if (c.earned) {
    return certCard(c, `Skill Badge: ${c.skill.name}`, sub, h('div', {},
      h('p', {}, c.skill.description),
      linkBtn(`#/certificates/${c.id}`, 'View and print', 'btn btn-gold', { 'aria-label': `View and print the ${c.skill.name} Skill Badge` })));
  }
  return certCard(c, `Skill Badge: ${c.skill.name}`, sub, h('div', {},
    h('p', { class: 'small', style: 'margin-bottom:4px' }, h('strong', {}, 'Still needed: '), skillNeed(c, band)),
    h('p', { class: 'small', style: 'margin:0' }, linkBtn(`#/practice?skill=${encodeURIComponent(c.skillId)}`, `Practice: ${c.skill.name}`, 'btn btn-sm'))));
}

/** Honest, specific "what's still needed" text for a skill that is not mastered yet. */
function skillNeed(c, band) {
  const m = c.m;
  const own = `${m.independentCorrect ?? 0} of ${m.independentAttempts ?? 0} correct on your own so far`;
  const rule = 'Mastered means at least 5 answers on your own with 4 of your last 5 correct.';
  if (m.level === 'not-started') {
    const lesson = lessonById(c.skill.lesson);
    return [`Not started yet. `, lesson ? ['Start with the lesson ', h('a', { href: `#/learn/${lesson.id}` }, pick(lesson.title, band)), ', then practice. '] : 'Practice this skill. ', rule];
  }
  if (m.level === 'needs-review') return `Needs review (${own}). Review it in Practice My Misses, then keep answering on your own. ${rule}`;
  return `${LEVEL_LABEL[m.level] || 'Practicing'} — ${own}. ${rule}`;
}

// ---------------------------------------------------------------- printable certificate
function renderCertificate(page, certId, ctx) {
  const state = ctx.store.get();
  const band = ctx.band;
  const cert = certId.startsWith('skill-')
    ? skillCertificates(state).find((c) => c.id === certId)
    : worldCertificates(state).find((c) => c.id === certId);

  if (!cert) {
    page.append(pageHead({ eyebrow: 'Certificates', title: 'That certificate doesn’t exist' }),
      h('p', {}, 'It may be for a world that is still in development, or the link is mistyped.'),
      h('div', { class: 'btn-row' }, linkBtn('#/certificates', 'See all certificates')));
    return null;
  }
  const name = cert.kind === 'world' ? worldTitle(cert.world) : cert.skill.name;
  if (!cert.earned) {
    page.append(pageHead({ eyebrow: 'Certificates', title: 'Not earned yet' }),
      notice(`The ${cert.kind === 'world' ? `${name} certificate` : `${name} Skill Badge`} isn’t earned yet, so it can’t be printed.`, 'warn'),
      h('ul', { class: 'cert-list', style: 'max-width:640px' }, h('li', {}, cert.kind === 'world' ? worldCard(cert, band) : skillCard(cert, band))),
      h('div', { class: 'btn-row' }, linkBtn('#/certificates', 'All certificates', 'btn')));
    return null;
  }

  page.append(h('div', { class: 'no-print' },
    pageHead({ eyebrow: 'Certificates', title: cert.kind === 'world' ? 'World certificate' : 'Skill Badge certificate', lead: 'Print it, then write your name on the line by hand. Market Minds never asks for or saves names.' }),
    h('div', { class: 'btn-row', style: 'margin:0 0 24px' },
      btn('Print certificate', () => window.print(), 'btn btn-primary btn-lg'),
      linkBtn('#/certificates', '← All certificates', 'btn'))));

  const dateEl = h('span', { class: 'cert-date-value' }, longDate());
  const demonstrated = cert.kind === 'world'
    ? h('div', { class: 'cert-what' },
      h('p', {}, `completed ${cert.planned ? `all ${cert.lessons.length} ready lessons` : `all ${plural(cert.lessons.length, 'lesson')}`} of`),
      h('p', { class: 'cert-subject' }, name),
      h('p', {}, `and showed mastery, on their own, of ${cert.skills.length === 1 ? 'this skill' : `these ${cert.skills.length} skills`}:`),
      h('p', { class: 'cert-skills' }, cert.skills.map(skillName).join(' · ')))
    : h('div', { class: 'cert-what' },
      h('p', {}, 'earned the Skill Badge for'),
      h('p', { class: 'cert-subject' }, name),
      h('p', {}, `by showing they can ${lowerFirst(cert.skill.description)}`));

  page.append(h('div', { class: 'certificate-stage' },
    h('article', { class: 'certificate', 'aria-label': `${cert.kind === 'world' ? 'Achievement Certificate' : 'Skill Badge Certificate'}: ${name}` },
      h('div', { class: 'certificate-inner' },
        h('div', { class: 'cert-brand' },
          h('img', { src: './assets/logo.svg', alt: '', width: '56', height: '56' }),
          h('span', { class: 'cert-wordmark' }, 'MARKET ', h('strong', {}, 'MINDS'))),
        h('h2', { class: 'cert-title' }, cert.kind === 'world' ? 'Achievement Certificate' : 'Skill Badge Certificate'),
        h('p', { class: 'cert-lead' }, 'This certifies that'),
        h('p', { class: 'cert-name' }, h('span', {}, 'Name:'), h('span', { class: 'cert-line', role: 'img', 'aria-label': 'blank line to write your name by hand' })),
        demonstrated,
        h('p', { class: 'cert-how' }, 'Shown by answering questions correctly on their own — first try, no hints — again and again in Market Minds Practice and Tests.'),
        h('div', { class: 'cert-foot' },
          h('p', { class: 'cert-date' }, h('span', { class: 'cert-foot-label' }, 'Date'), dateEl),
          seal(),
          h('p', { class: 'cert-date' }, h('span', { class: 'cert-foot-label' }, 'Market Minds'), h('span', {}, 'Learn Money. Understand Markets. Think Bigger.'))),
        h('p', { class: 'cert-fine' }, 'Educational only. This certificate recognizes learning about money and markets — not trading or investment results.')))));

  // The printed date is today's date at print time (the page could be left open overnight).
  const onPrint = () => { dateEl.textContent = longDate(); };
  window.addEventListener('beforeprint', onPrint);
  return () => window.removeEventListener('beforeprint', onPrint);
}

const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '');

function seal() {
  const span = h('span', { class: 'cert-seal', 'aria-hidden': 'true' });
  span.innerHTML = '<svg viewBox="0 0 100 100" width="88" height="88" focusable="false">' +
    '<circle cx="50" cy="50" r="46" fill="#f0bf55"/><circle cx="50" cy="50" r="38" fill="none" stroke="#102541" stroke-width="2"/>' +
    '<circle cx="50" cy="50" r="33" fill="none" stroke="#102541" stroke-width="1" stroke-dasharray="2 3"/>' +
    '<path d="M50 28l6.2 12.6 13.9 2-10 9.8 2.4 13.8L50 59.7l-12.5 6.5 2.4-13.8-10-9.8 13.9-2z" fill="#102541"/>' +
    '<text x="50" y="76" text-anchor="middle" font-size="6.5" font-weight="800" fill="#102541" font-family="system-ui, sans-serif" letter-spacing=".5" textLength="40" lengthAdjust="spacingAndGlyphs">SKILL SHOWN</text></svg>';
  return span;
}
