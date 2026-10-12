// Lesson / story illustrations.
// Approved artwork does not exist yet (see docs/ASSET-MANIFEST.md). Until an asset path is added to
// ART_READY, renderArt() shows an honest, named placeholder: the planned file name plus the scene
// description (alt text), so nobody mistakes it for finished art.
import { h } from './dom.js';
import { pick } from '../content/band.js';
import { renderVisual } from './visuals.js';

/**
 * Render a visual spec (js/ui/visuals.js) safely. Band values are resolved first; `image` specs use
 * renderArt so missing art always shows the named placeholder. A broken spec never breaks the page.
 */
export function visualEl(spec, band = 'explorer') {
  const s = pick(spec, band);
  if (!s) return null;
  if (s.kind === 'image') return renderArt(s, { band });
  try {
    const el = renderVisual(s, { band });
    if (!el) return null;
    if (el.classList?.contains('visual')) return el;
    return h('div', { class: 'visual' }, el);
  } catch (e) {
    console.error('visual failed', e);
    return h('div', { class: 'visual' }, h('p', { class: 'muted' }, 'This picture could not be drawn.'));
  }
}

/** Asset paths (relative to the site root, e.g. 'assets/illustrations/w1l1-discover.webp') that really exist. */
export const ART_READY = new Set([]);

const iconSvg = () => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'ph-icon');
  svg.innerHTML = '<rect x="5" y="9" width="38" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="3"/>' +
    '<circle cx="17" cy="19" r="4" fill="currentColor"/><path d="M8 35l11-11 8 8 5-5 9 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>';
  return svg;
};

const cleanPath = (p) => String(p || '').replace(/^\.?\/+/, '');

/**
 * image: { asset, alt, caption } (each may be a band value). Returns a <figure>.
 */
export function renderArt(image, { band = 'explorer' } = {}) {
  const asset = cleanPath(pick(image?.asset, band));
  const alt = pick(image?.alt, band) || '';
  const caption = pick(image?.caption, band) || '';
  if (asset && ART_READY.has(asset)) {
    return h('figure', { class: 'art-figure' },
      h('img', { src: './' + asset, alt, loading: 'lazy', decoding: 'async' }),
      caption ? h('figcaption', {}, caption) : null);
  }
  const file = asset ? asset.split('/').pop() : 'illustration not named yet';
  return h('figure', { class: 'art-figure placeholder-art' },
    h('div', { class: 'ph-frame' },
      iconSvg(),
      h('p', { class: 'ph-label' }, 'Illustration coming soon'),
      alt ? h('p', { class: 'ph-alt' }, h('span', { class: 'sr-only' }, 'Planned picture: '), alt) : null,
      h('code', {}, file)),
    caption ? h('figcaption', {}, caption) : null);
}
