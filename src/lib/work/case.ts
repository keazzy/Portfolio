import 'server-only';

/*
  Case studies, rendered from a list of blocks (ported from concepts/shared/case.js).
  Each study decides which blocks it uses and in what order; anything one-off (a diagram,
  a live demo) is an `html` or `live` block the study writes itself. Content is authored
  in src/content/cases, so its strings are trusted markup.
*/

export const A = (p: string) => '/assets/' + p.split('/').map(encodeURIComponent).join('/');

type Media = { src?: string; video?: string; w?: number; h?: number; alt?: string };
type Fig = { label?: string; cap?: string; frame?: string; id?: string; tint?: string };
export type Screen = { src: string; w?: number; h?: number; alt?: string; tag?: string; cap?: string; scroll?: boolean };

export type Block =
  | { t: 'chapter'; id: string; eyebrow: string; title: string; toc?: string; text?: string[] }
  | { t: 'text'; text: string }
  | ({ t: 'figure' } & Fig & Media)
  | ({ t: 'pair'; items: Media[] } & Fig)
  | ({ t: 'html'; html: () => string } & Fig)
  | ({ t: 'live'; name: string } & Fig)
  | ({ t: 'screens'; items: Screen[] } & Fig)
  | { t: 'quote'; text: string; who?: string }
  | { t: 'todo'; what: string }
  | { t: 'decision'; title: string; text: string; eyebrow?: string }
  | { t: 'stats'; items: [string, string][] }
  | { t: 'reflect'; items: [string, string?][] };

export type CaseStudy = {
  palette: { tint: string; accent: string; deep: string };
  /** Behind the case-study password (see src/lib/work/lock.ts). */
  locked?: boolean;
  back: { href: string };
  crumbs: string[];
  logo?: string;
  eyebrow: string;
  title: string;
  /** For search results and link previews; on the page, the Overview chapter does this job. */
  description: string;
  meta: [string, string][];
  results?: [string, string][];
  next?: { href: string; label?: string; title: string };
  blocks: Block[];
};

// [text] marks a number or detail still to fill in.
const fill = (s = '') => s.replace(/\[([^\]]+)\]/g, '<mark class="fill-in">$1</mark>');
const size = (b: { w?: number; h?: number }) => (b.w ? ` width="${b.w}" height="${b.h}"` : '');
const media = (b: Media) => (b.video
  ? `<video src="${b.video}#t=0.1" muted loop playsinline autoplay preload="metadata"${size(b)}></video>`
  : `<img src="${b.src}" alt="${b.alt || ''}" loading="lazy"${size(b)} />`);
const frame = (b: Fig, inner: string) => `
  <figure class="fig ${b.frame || ''}"${b.id ? ` id="${b.id}"` : ''}>
    <div class="fig-card"${b.tint ? ` style="--tint:${b.tint}"` : ''}>${b.label ? `<span class="fig-label">${b.label}</span>` : ''}${inner}</div>
    ${b.cap ? `<figcaption>${fill(b.cap)}</figcaption>` : ''}
  </figure>`;

// Phone screens; `scroll: true` on a tall one plays it like a screen recording.
const screens = (items: Screen[]) => `<div class="screens" style="--n:${items.length};--m:${Math.min(items.length, 2)}">${items.map((it) => `
  <div class="screen">${it.tag ? `<span class="tag">${it.tag}</span>` : ''}
    <div class="phone"><img src="${it.src}" alt="${it.alt || ''}" loading="lazy" width="${it.w || 375}" height="${it.h || 812}"${it.scroll ? ' data-scroll' : ''} /></div>
    ${it.cap ? `<p>${fill(it.cap)}</p>` : ''}</div>`).join('')}</div>`;

const stats = (items: [string, string][]) => `<div class="stats">${items.map(([v, l]) => `<div><b>${fill(v)}</b><span>${l}</span></div>`).join('')}</div>`;

function block(b: Exclude<Block, { t: 'chapter' }>): string {
  switch (b.t) {
    case 'text': return `<p class="cs-p">${fill(b.text)}</p>`;
    case 'figure': return frame(b, media(b));
    case 'pair': return frame(b, `<div class="pair">${b.items.map(media).join('')}</div>`);
    case 'html': return frame(b, b.html());
    case 'live': return frame(b, `<div data-live="${b.name}"></div>`);
    case 'screens': return frame(b, screens(b.items));
    case 'quote': return `<blockquote class="quote"><p>“${b.text}”</p>${b.who ? `<cite>${b.who}</cite>` : ''}</blockquote>`;
    case 'todo': return `<figure class="fig"><div class="fig-card todo-card"><span>Visual needed</span><b>${b.what}</b></div></figure>`;
    case 'decision': return `<aside class="decision"><p class="ch-eyebrow">${b.eyebrow || 'Decision'}</p><h3>${b.title}</h3><p>${fill(b.text)}</p></aside>`;
    case 'stats': return stats(b.items);
    case 'reflect': return `<div class="reflect">${b.items.map(([t, d]) => `<div><b>${t}</b>${d ? `<span>${d}</span>` : ''}</div>`).join('')}</div>`;
  }
}

export function renderCase(C: CaseStudy) {
  // Chapters open a section; the blocks after them belong to it until the next chapter.
  let body = '', open = false;
  const chapters: Extract<Block, { t: 'chapter' }>[] = [];
  for (const b of C.blocks) {
    if (b.t === 'chapter') {
      if (open) body += '</section>';
      chapters.push(b);
      body += `<section class="ch" id="${b.id}"><p class="ch-eyebrow">${b.eyebrow}</p><h2>${b.title}</h2>${(b.text || []).map((p) => `<p>${fill(p)}</p>`).join('')}`;
      open = true;
    } else {
      body += block(b);
    }
  }
  if (open) body += '</section>';

  return `
    <div class="cs">
      <aside class="toc" aria-label="Contents">${chapters.map((c) => `<a href="#${c.id}">${c.toc || c.eyebrow}</a>`).join('')}</aside>
      <main class="cs-main">
        <header class="cs-head">
          <p class="cs-eyebrow">${C.logo ? `<img src="${C.logo}" alt="" />` : ''}${C.eyebrow}</p>
          <h1 class="develop">${C.title}</h1>
          <dl class="cs-meta">${C.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
          ${C.results ? stats(C.results) : ''}
        </header>
        ${body}
        ${C.next ? `<a class="next" href="${C.next.href}"><small>${C.next.label || 'Next'}</small><b>${C.next.title} →</b></a>` : ''}
      </main>
    </div>`;
}
