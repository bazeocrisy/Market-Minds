// Market Stories (#/stories, #/stories/<id>): short stories with Read to Me and comprehension questions.
// Questions are checked with the engine's checkResponse only — stories never write mastery.
import { h, pageHead, notice, linkBtn, paragraphs, worldTitle, sameWorld, closeAllModals } from '../ui/dom.js';
import { renderRichText, plainText } from '../ui/vocab.js';
import { readToMe, stopAll } from '../ui/speech.js';
import { renderArt } from '../ui/art.js';
import { renderQuestion } from '../ui/question.js';
import { pick } from '../content/band.js';
import { STORIES } from '../content/stories.js';
import { WORLDS } from '../content/worlds.js';
import { lessonById } from '../content/lessons.js';
import { checkResponse } from '../engine/index.js';

export function render(el, params, ctx) {
  const cleanups = [];
  const page = h('section', { class: 'page page-narrow' });
  el.append(page);
  if (params[0]) renderStory(page, params[0], ctx, cleanups);
  else renderList(page, ctx);
  return () => { cleanups.forEach((f) => f()); stopAll(); closeAllModals(); };
}

function renderList(page, ctx) {
  page.append(pageHead({ eyebrow: 'Market Stories', title: 'Market stories', lead: 'Short stories about people buying, selling and planning — with questions to think about.' }));
  if (!STORIES.length) { page.append(notice('Stories are being written. Please check back soon.', 'warn')); return; }
  page.append(h('ul', { class: 'entry-list' }, STORIES.map((s) => {
    const w = WORLDS.find((x) => sameWorld(x, s.world));
    const l = s.lesson ? lessonById(s.lesson) : null;
    return h('li', {}, h('a', { class: 'card card-link', href: `#/stories/${encodeURIComponent(s.id)}` },
      h('h2', { class: 'card-title' }, pick(s.title, ctx.band)),
      h('p', { class: 'card-text' }, [w ? worldTitle(w) : null, l ? `goes with “${pick(l.title, ctx.band)}”` : null].filter(Boolean).join(' · ')),
      h('p', { class: 'card-status' }, `${(s.questions || []).length} questions`)));
  })));
}

function renderStory(page, id, ctx, cleanups) {
  const band = ctx.band;
  const s = STORIES.find((x) => x.id === id);
  if (!s) {
    page.append(pageHead({ eyebrow: 'Market Stories', title: 'We couldn’t find that story' }), h('div', { class: 'btn-row' }, linkBtn('#/stories', 'All stories')));
    return;
  }
  const title = pick(s.title, band);
  const w = WORLDS.find((x) => sameWorld(x, s.world));
  page.append(pageHead({ eyebrow: w ? worldTitle(w) : 'Market Stories', title }));
  const article = h('article', { class: 'lesson-step lesson-body' });
  const slot = h('div');
  article.append(slot);
  if (s.image) article.append(renderArt(s.image, { band }));
  const paras = paragraphs(s.text, band);
  for (const p of paras) article.append(h('p', {}, renderRichText(p, band)));
  page.append(article);
  const rtm = readToMe(slot, () => [title, ...paras.map(plainText)].join('. '));
  cleanups.push(rtm.destroy);

  const qs = (s.questions || []).map((q) => pick(q, band)).filter(Boolean);
  if (qs.length) {
    const sec = h('section', { class: 'section' }, h('h2', {}, 'Think about the story'),
      h('p', { class: 'small muted' }, 'Use hints if you need them. These questions are for practice and don’t change your mastery.'));
    qs.forEach((q, i) => {
      let hintIndex = 0, misses = 0;
      const view = renderQuestion(q, {
        band, mode: 'practice', label: `Question ${i + 1} of ${qs.length}`,
        onHint: () => (q.hints && hintIndex < q.hints.length ? q.hints[hintIndex++] : null),
        onSubmit: (resp) => {
          let res;
          try { res = checkResponse(q, resp); } catch (e) { console.error(e); return; }
          if (res.correct) { view.showFeedback({ correct: true, feedback: res.feedback, explanation: q.explanation }); view.lock(); }
          else { misses++; view.showFeedback({ correct: false, feedback: res.feedback, misconception: res.misconception, teach: misses >= 2 ? q.teach : null }); }
        }
      });
      sec.append(h('div', { class: 'card', style: 'margin-top:16px' }, view.el));
    });
    page.append(sec);
  }
  page.append(h('div', { class: 'btn-row section' }, linkBtn('#/stories', '← All stories', 'btn'),
    s.lesson && lessonById(s.lesson)?.status === 'ready' ? linkBtn(`#/learn/${s.lesson}/1`, 'Go to the lesson', 'btn btn-primary') : null));
}
