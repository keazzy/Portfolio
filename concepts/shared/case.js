/* Renders a case study from a list of blocks. Each page decides which blocks it uses and in what order;
   anything one-off (a diagram, a live demo) is an `html` or `live` block the page writes itself. */
(function () {
  const fill = (s = '') => s.replace(/\[([^\]]+)\]/g, '<mark class="fill-in">$1</mark>');
  const media = (b) => (b.video
    ? `<video src="${b.video}#t=0.1" muted loop playsinline autoplay preload="metadata"${b.w ? ` width="${b.w}" height="${b.h}"` : ''}></video>`
    : `<img src="${b.src}" alt="${b.alt || ''}" loading="lazy"${b.w ? ` width="${b.w}" height="${b.h}"` : ''} />`);
  const frame = (b, inner) => `
    <figure class="fig ${b.frame || ''}"${b.id ? ` id="${b.id}"` : ''}>
      <div class="fig-card"${b.tint ? ` style="--tint:${b.tint}"` : ''}>${b.label ? `<span class="fig-label">${b.label}</span>` : ''}${inner}</div>
      ${b.cap ? `<figcaption>${fill(b.cap)}</figcaption>` : ''}
    </figure>`;

  const BLOCKS = {
    text: (b) => `<p class="cs-p">${fill(b.text)}</p>`,
    figure: (b) => frame(b, media(b)),
    pair: (b) => frame(b, `<div class="pair">${b.items.map(media).join('')}</div>`),
    html: (b) => frame(b, b.html()),
    live: (b) => frame(b, `<div data-live="${b.name}"></div>`),
    todo: (b) => `<figure class="fig"><div class="fig-card todo-card"><span>Visual needed</span><b>${b.what}</b></div></figure>`,
    decision: (b) => `<aside class="decision"><p class="ch-eyebrow">${b.eyebrow || 'Decision'}</p><h3>${b.title}</h3><p>${fill(b.text)}</p></aside>`,
    stats: (b) => `<div class="stats">${b.items.map(([v, l]) => `<div><b>${fill(v)}</b><span>${l}</span></div>`).join('')}</div>`,
    reflect: (b) => `<div class="reflect">${b.items.map(([t, d]) => `<div><b>${t}</b>${d ? `<span>${d}</span>` : ''}</div>`).join('')}</div>`,
  };

  window.renderCase = function (C) {
    document.title = `${C.title} · Adeleke Abdulazeez`;
    if (C.palette) Object.entries(C.palette).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v));

    // Chapters open a section; the blocks after them belong to it until the next chapter.
    let body = '', open = false;
    const chapters = [];
    for (const b of C.blocks) {
      if (b.t === 'chapter') {
        if (open) body += '</section>';
        chapters.push(b);
        body += `<section class="ch" id="${b.id}"><p class="ch-eyebrow">${b.eyebrow}</p><h2>${b.title}</h2>${(b.text || []).map((p) => `<p>${fill(p)}</p>`).join('')}`;
        open = true;
      } else {
        body += BLOCKS[b.t](b);
      }
    }
    if (open) body += '</section>';

    document.body.innerHTML = `
      <nav class="cs-nav"><a href="${C.back.href}">← Work</a><span class="sep">/</span><span>${C.crumbs.join(' <span class="sep">/</span> ')}</span></nav>
      <div class="cs">
        <aside class="toc" aria-label="Contents">${chapters.map((c) => `<a href="#${c.id}">${c.toc || c.eyebrow}</a>`).join('')}</aside>
        <main class="cs-main">
          <header class="cs-head">
            <p class="cs-eyebrow">${C.logo ? `<img src="${C.logo}" alt="" />` : ''}${C.eyebrow}</p>
            <h1>${C.title}</h1>
            <p class="cs-lede">${fill(C.lede)}</p>
            <dl class="cs-meta">${C.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            ${C.results ? BLOCKS.stats({ items: C.results }) : ''}
            ${C.hero ? `<div class="cs-hero">${media(C.hero)}</div>` : ''}
          </header>
          ${body}
          ${C.next ? `<a class="next" href="${C.next.href}"><small>${C.next.label || 'Next'}</small><b>${C.next.title} →</b></a>` : ''}
        </main>
      </div>`;

    // Live blocks mount themselves once they're in the page.
    document.querySelectorAll('[data-live]').forEach((el) => C.live?.[el.dataset.live]?.(el));

    // Contents: highlight the chapter being read.
    const links = new Map([...document.querySelectorAll('.toc a')].map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('on'));
      links.get(e.target.id)?.classList.add('on');
    }), { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('.ch').forEach((s) => io.observe(s));
  };
})();
