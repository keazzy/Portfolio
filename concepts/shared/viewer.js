/*
  Shot viewer: the clicked media grows from its card into a stage, and a detail
  sidebar slides in beside it. Shared by all three concepts; each concept styles
  it through CSS variables and supplies its own sidebar markup.

  Viewer.create({ theme, renderPanel(shot, frame), getOrigin(shot), onChange(shot|null) })
    .open(shotIndex, originEl?, frame?)  .close()  .isOpen
*/
(function () {
  const P = window.PORTFOLIO;
  const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;

  const icon = {
    prev: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  };

  function create(opts) {
    const state = { open: false, shot: null, frame: 0, originEl: null, lastFocus: null, prevHash: '' };

    const root = document.createElement('div');
    root.className = `vw vw--${opts.theme || 'default'}`;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.hidden = true;
    root.innerHTML = `
      <div class="vw-backdrop" data-close></div>
      <div class="vw-stage" data-close>
        <div class="vw-media-wrap"><div class="vw-media"></div></div>
        <div class="vw-frames" hidden></div>
      </div>
      <aside class="vw-panel">
        <div class="vw-panel-top">
          <div class="vw-nav">
            <button class="vw-btn" data-prev aria-label="Previous shot">${icon.prev}</button>
            <button class="vw-btn" data-next aria-label="Next shot">${icon.next}</button>
          </div>
          <span class="vw-count" aria-live="polite"></span>
          <button class="vw-btn" data-dismiss aria-label="Close">${icon.close}</button>
        </div>
        <div class="vw-panel-body"></div>
      </aside>`;
    document.body.appendChild(root);

    const $ = (s) => root.querySelector(s);
    const stage = $('.vw-stage');
    const wrap = $('.vw-media-wrap');
    const mediaBox = $('.vw-media');
    const frames = $('.vw-frames');
    const panel = $('.vw-panel');
    const body = $('.vw-panel-body');
    const backdrop = $('.vw-backdrop');
    const count = $('.vw-count');

    /* ---------- rendering ---------- */
    function renderMedia() {
      const m = state.shot.media[state.frame];
      mediaBox.innerHTML = m.html || P.mediaHTML(m, { cls: 'vw-el' });
      const el = mediaBox.firstElementChild;
      if (el.tagName === 'IMG') el.loading = 'eager';
      sizeMedia();
    }

    function renderFrames() {
      const media = state.shot.media;
      frames.hidden = media.length < 2;
      if (media.length < 2) { frames.innerHTML = ''; return; }
      frames.innerHTML = media.map((m, i) => `
        <button class="vw-frame${i === state.frame ? ' is-active' : ''}" data-frame="${i}" aria-label="Frame ${i + 1} of ${media.length}">
          ${m.thumbHTML || (m.type === 'video' ? '<span class="vw-frame-play" aria-hidden="true"></span>' : `<img src="${P.asset(m.src)}" alt="" loading="lazy" />`)}
        </button>`).join('');
    }

    function renderPanel() {
      body.innerHTML = opts.renderPanel(state.shot, state.frame);
      body.scrollTop = 0;
      const total = P.allShots.length;
      count.textContent = `${state.shot.index + 1} / ${total}`;
      root.setAttribute('aria-label', `${state.shot.title}, ${state.shot.company.name}`);
    }

    function setFrame(i) {
      state.frame = i;
      renderMedia(); renderFrames();
      body.querySelectorAll('[data-frame-num]').forEach((el) => { el.textContent = i + 1; });
      body.querySelectorAll('[data-frame-cap]').forEach((el) => { el.textContent = state.shot.media[i].caption || ''; });
      opts.onChange && opts.onChange(state.shot, state.frame);
    }

    function render() {
      renderMedia();
      renderFrames();
      renderPanel();
      opts.onChange && opts.onChange(state.shot, state.frame);
    }

    // Fit the media inside the stage (contain) so its final rect is known before it loads.
    function sizeMedia() {
      const m = state.shot.media[state.frame];
      const cs = getComputedStyle(stage);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const framesH = frames.hidden ? 0 : 64;
      const availW = stage.clientWidth - padX;
      const availH = isNarrow() ? Math.min(window.innerHeight * 0.6, 640) : stage.clientHeight - padY - framesH;
      const ratio = m.w / m.h;
      let w = availW, h = w / ratio;
      if (h > availH) { h = availH; w = h * ratio; }
      wrap.style.width = Math.round(w) + 'px';
      wrap.style.height = Math.round(h) + 'px';
    }

    /* ---------- motion ---------- */
    // Transform + clip that makes the stage media look exactly like the origin card.
    function originTransform(from) {
      const to = wrap.getBoundingClientRect();
      const s = Math.max(from.width / to.width, from.height / to.height);
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const clipX = Math.max(0, (to.width - from.width / s) / 2);
      const clipY = Math.max(0, (to.height - from.height / s) / 2);
      const r = parseFloat(opts.originRadius || 12) / s;
      return {
        transform: `translate(${dx}px, ${dy}px) scale(${s})`,
        clipPath: `inset(${clipY}px ${clipX}px round ${r}px)`,
      };
    }

    const finalFrame = () => ({ transform: 'translate(0,0) scale(1)', clipPath: `inset(0px 0px round ${opts.mediaRadius ?? 12}px)` });

    function visible(el) {
      if (!el || !el.isConnected) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    }

    function panelFrom() {
      return isNarrow() ? 'translateY(40px)' : 'translateX(32px)';
    }

    /* ---------- open / close ---------- */
    function open(shotIndex, originEl, frame = 0) {
      const shot = P.allShots[shotIndex];
      if (!shot) return;
      state.shot = shot;
      state.frame = frame;
      if (state.open) { render(); syncHash(); return; }

      state.open = true;
      state.lastFocus = document.activeElement;
      state.originEl = originEl || (opts.getOrigin && opts.getOrigin(shot));
      state.prevHash = location.hash;

      lockScroll(true);
      root.hidden = false;
      render();
      syncHash();

      const origin = visible(state.originEl) ? state.originEl : null;
      const dur = reduce() ? 0 : 420;

      if (origin && dur) {
        origin.style.visibility = 'hidden';
        wrap.animate([originTransform(origin.getBoundingClientRect()), finalFrame()], { duration: dur, easing: EASE, fill: 'both' });
      } else {
        wrap.animate([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'scale(1)' }], { duration: reduce() ? 120 : 260, easing: EASE, fill: 'both' });
      }
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce() ? 120 : 300, easing: 'ease-out', fill: 'both' });
      panel.animate(
        [{ opacity: 0, transform: reduce() ? 'none' : panelFrom() }, { opacity: 1, transform: 'none' }],
        { duration: reduce() ? 120 : 360, delay: reduce() ? 0 : 60, easing: EASE, fill: 'both' }
      );
      frames.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: dur * 0.6, fill: 'both' });

      requestAnimationFrame(() => $('[data-dismiss]').focus({ preventScroll: true }));
    }

    function close() {
      if (!state.open) return;
      state.open = false;
      const target = opts.getOrigin ? opts.getOrigin(state.shot) : null;
      const origin = visible(target) ? target : null;
      const dur = reduce() ? 0 : 300;
      // Always hide the card we are flying back to, then reveal it when we land.
      if (state.originEl && state.originEl !== origin) state.originEl.style.visibility = '';
      if (origin) origin.style.visibility = 'hidden';

      const anims = [];
      if (origin && dur) {
        wrap.getAnimations().forEach((a) => a.cancel());
        anims.push(wrap.animate([finalFrame(), originTransform(origin.getBoundingClientRect())], { duration: dur, easing: EASE, fill: 'both' }));
      } else {
        anims.push(wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out', fill: 'both' }));
      }
      anims.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur || 120, easing: 'ease-out', fill: 'both' }));
      anims.push(panel.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: reduce() ? 'none' : panelFrom() }], { duration: 200, easing: 'ease-out', fill: 'both' }));
      anims.push(frames.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'both' }));

      let done = false;
      const finish = () => {
        if (done || state.open) return; // already finished, or re-opened mid-close
        done = true;
        root.hidden = true;
        [wrap, backdrop, panel, frames].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
        if (origin) origin.style.visibility = '';
        mediaBox.innerHTML = '';
        lockScroll(false);
        history.replaceState(null, '', state.prevHash && !state.prevHash.startsWith('#/work/') ? state.prevHash : location.pathname + location.search);
        opts.onChange && opts.onChange(null);
        const focusTo = origin?.closest('a,button,[tabindex]') || state.lastFocus;
        focusTo && focusTo.focus && focusTo.focus({ preventScroll: true });
      };
      Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(finish);
      setTimeout(finish, (dur || 200) + 150); // hidden tabs pause animations; never leave the viewer stuck
    }

    /* ---------- navigation ---------- */
    function step(dir) {
      const media = state.shot.media;
      const nextFrame = state.frame + dir;
      if (nextFrame >= 0 && nextFrame < media.length) return setFrame(nextFrame);
      jump(dir, dir < 0 ? 'last' : 0);
    }

    function jump(dir, frame = 0) {
      const n = P.allShots.length;
      const next = P.allShots[(state.shot.index + dir + n) % n];
      state.shot = next;
      state.frame = frame === 'last' ? next.media.length - 1 : frame;
      render();
      syncHash();
    }

    function syncHash() {
      history.replaceState(null, '', `#/work/${state.shot.company.id}/${state.shot.id}`);
    }

    /* ---------- events ---------- */
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-prev]')) return jump(-1);
      if (e.target.closest('[data-next]')) return jump(1);
      if (e.target.closest('[data-dismiss]')) return close();
      const f = e.target.closest('[data-frame]');
      if (f) return setFrame(+f.dataset.frame);
      if (e.target.closest('[data-goto]')) { const i = +e.target.closest('[data-goto]').dataset.goto; state.shot = P.allShots[i]; state.frame = 0; render(); syncHash(); return; }
      if (e.target.hasAttribute('data-close')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!state.open) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowDown' || e.key === 'j') { if (e.target.closest?.('.vw-panel-body')) return; e.preventDefault(); jump(1); }
      else if (e.key === 'ArrowUp' || e.key === 'k') { if (e.target.closest?.('.vw-panel-body')) return; e.preventDefault(); jump(-1); }
      else if (e.key === 'Tab') trapFocus(e);
    });

    window.addEventListener('resize', () => state.open && sizeMedia());

    // Swipe between frames/shots on touch.
    let touchX = null;
    stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });

    function trapFocus(e) {
      const f = [...root.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function lockScroll(on) {
      const html = document.documentElement;
      if (on) {
        const sw = window.innerWidth - html.clientWidth;
        html.style.overflow = 'hidden';
        if (sw) html.style.paddingRight = sw + 'px';
      } else {
        html.style.overflow = '';
        html.style.paddingRight = '';
      }
    }

    // Deep link: #/work/<company>/<shot>
    function openFromHash() {
      const m = location.hash.match(/^#\/work\/([^/]+)\/([^/]+)/);
      if (!m) return false;
      const shot = P.allShots.find((s) => s.company.id === m[1] && s.id === m[2]);
      if (shot) { state.prevHash = ''; open(shot.index, null); }
      return !!shot;
    }

    return {
      open, close, openFromHash,
      get isOpen() { return state.open; },
      get current() { return state.shot; },
      el: root,
    };
  }

  window.Viewer = { create };
})();
