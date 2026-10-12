// First-launch onboarding (#/welcome). Full screen, no app chrome (styles.css hides the app bar while
// <html data-route="welcome">). The grade buttons carry data-band, so app.js stores the choice; this view
// then opens the dashboard. Nothing personal is asked for or stored.
import { h } from '../ui/dom.js';

const GRADES = [
  { band: 'explorer', grades: 'Grades 3–5', name: 'Market Explorer', text: 'Short stories, pictures and whole-dollar prices.' },
  { band: 'analyst', grades: 'Grades 6–8', name: 'Market Analyst', text: 'Deeper readings, decimals, percents and multi-step problems.' }
];

export function render(el, params, ctx) {
  let timer = null;
  // app.js's [data-band] click handler saves the grade and continues to the learner's intended screen.
  const choose = () => {};
  const current = ctx.store.get().band;
  el.append(h('section', { class: 'welcome' },
    h('div', { class: 'welcome-inner' },
      h('img', { class: 'welcome-logo', src: './assets/logo.svg', alt: '', width: '88', height: '88' }),
      h('h1', { tabindex: '-1' }, 'Welcome to Market Minds'),
      h('p', { class: 'welcome-purpose' }, 'Learn how money, prices and markets work — and how to make careful choices when nobody knows the future.'),
      h('p', { class: 'welcome-ask', id: 'welcome-ask' }, 'Choose your grade level'),
      h('div', { class: 'welcome-grades', role: 'group', 'aria-labelledby': 'welcome-ask' },
        GRADES.map((g) => h('button', {
          type: 'button', class: 'welcome-grade', 'data-band': g.band, 'aria-pressed': String(current === g.band),
          on: { click: choose }
        },
        h('span', { class: 'wg-grades' }, g.grades),
        h('span', { class: 'wg-name' }, g.name),
        h('span', { class: 'wg-text' }, g.text)))),
      h('p', { class: 'welcome-note' }, 'No names, no accounts — progress stays on this device. You can change your grade level any time.'))));
  return () => clearTimeout(timer);
}
