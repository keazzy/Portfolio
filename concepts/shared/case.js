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

  // Phone screens; `scroll: true` on a tall one plays it like a screen recording.
  const screens = (b) => `<div class="screens" style="--n:${b.items.length};--m:${Math.min(b.items.length, 2)}">${b.items.map((it) => `
    <div class="screen">${it.tag ? `<span class="tag">${it.tag}</span>` : ''}
      <div class="phone"><img src="${it.src}" alt="${it.alt || ''}" loading="lazy" width="${it.w || 375}" height="${it.h || 812}"${it.scroll ? ' data-scroll' : ''} /></div>
      ${it.cap ? `<p>${fill(it.cap)}</p>` : ''}</div>`).join('')}</div>`;
  function playScrolls() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('img[data-scroll]').forEach((img) => {
      const travel = (1 - 812 / +img.getAttribute('height')) * 100;
      const at = (y, offset) => ({ transform: `translateY(${-y}%)`, offset, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' });
      const anim = img.animate([at(0, 0), at(0, 0.12), at(travel, 0.6), at(travel, 0.78), at(0, 1)], { duration: 11000, iterations: Infinity });
      anim.pause();
      new IntersectionObserver(([e]) => (e.isIntersecting ? anim.play() : anim.pause()), { threshold: 0.4 }).observe(img.parentElement);
    });
  }

  const BLOCKS = {
    text: (b) => `<p class="cs-p">${fill(b.text)}</p>`,
    figure: (b) => frame(b, media(b)),
    pair: (b) => frame(b, `<div class="pair">${b.items.map(media).join('')}</div>`),
    html: (b) => frame(b, b.html()),
    live: (b) => frame(b, `<div data-live="${b.name}"></div>`),
    screens: (b) => frame(b, screens(b)),
    quote: (b) => `<blockquote class="quote"><p>“${b.text}”</p>${b.who ? `<cite>${b.who}</cite>` : ''}</blockquote>`,
    todo: (b) => `<figure class="fig"><div class="fig-card todo-card"><span>Visual needed</span><b>${b.what}</b></div></figure>`,
    decision: (b) => `<aside class="decision"><p class="ch-eyebrow">${b.eyebrow || 'Decision'}</p><h3>${b.title}</h3><p>${fill(b.text)}</p></aside>`,
    stats: (b) => `<div class="stats">${b.items.map(([v, l]) => `<div><b>${fill(v)}</b><span>${l}</span></div>`).join('')}</div>`,
    reflect: (b) => `<div class="reflect">${b.items.map(([t, d]) => `<div><b>${t}</b>${d ? `<span>${d}</span>` : ''}</div>`).join('')}</div>`,
  };

  // Concept only: the real site checks the password on the server before sending any of the page.
  const PASSWORD = 'halvest';
  const unlocked = () => { try { return sessionStorage.getItem('unlocked') === '1'; } catch { return false; } };
  function gate(C) {
    document.body.innerHTML = `
      <nav class="cs-nav"><a href="${C.back.href}">← Work</a><span class="sep">/</span><span>${C.crumbs.join(' <span class="sep">/</span> ')}</span></nav>
      <main class="gate-page">
        <p class="cs-eyebrow">${C.logo ? `<img src="${C.logo}" alt="" />` : ''}${C.eyebrow}</p>
        <h1 class="develop">${C.title}</h1>
        <p class="cs-lede">This one is behind a password while Halvest’s v2 is unreleased. You’ll find it in my application.</p>
        <form><input type="password" placeholder="Password" aria-label="Password" autocomplete="off" required /><button>Unlock</button></form>
        <p class="err" aria-live="polite"></p>
      </main>`;
    document.querySelector('.gate-page form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.target.querySelector('input').value.trim().toLowerCase() !== PASSWORD) {
        document.querySelector('.gate-page .err').textContent = 'That’s not it. Check the password in my application.';
        return;
      }
      try { sessionStorage.setItem('unlocked', '1'); } catch {}
      window.renderCase({ ...C, locked: false });
    });
  }

  window.renderCase = function (C) {
    document.title = `${C.title} · Adeleke Abdulazeez`;
    if (C.locked && !unlocked()) return gate(C);
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
            <h1 class="develop">${C.title}</h1>
            <p class="cs-lede">${fill(C.lede)}</p>
            <dl class="cs-meta">${C.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            ${C.results ? BLOCKS.stats({ items: C.results }) : ''}
            ${C.hero ? `<div class="cs-hero">${media(C.hero)}</div>` : ''}
            ${C.heroScreens ? `<div class="cs-hero screens-hero">${screens(C.heroScreens)}</div>` : ''}
          </header>
          ${body}
          ${C.next ? `<a class="next" href="${C.next.href}"><small>${C.next.label || 'Next'}</small><b>${C.next.title} →</b></a>` : ''}
        </main>
      </div>`;

    playScrolls();
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
