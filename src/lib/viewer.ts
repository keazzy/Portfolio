/*
  Shot viewer engine (ported from concepts/shared/viewer.js).
  The clicked card's media grows into a stage, a details sidebar slides in beside it.
  Framework-free on purpose: FLIP + WAAPI run outside React so the motion stays smooth.
*/
import type { Media, Portfolio } from './types';

export type ViewerShot = Portfolio['shots'][number];

type Options = {
  shots: ViewerShot[];
  theme: string;
  renderPanel: (shot: ViewerShot, index: number, frame: number) => string;
  getOrigin: (index: number) => HTMLElement | null;
  /** Called after every shot or frame change (null when the viewer closes). */
  onChange?: (index: number | null, frame: number) => void;
  originRadius?: number;
  mediaRadius?: number;
};

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;

export const esc = (s: string | undefined | null) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function mediaHTML(m: Media, { autoplay = true, cls = '', size = 'src' as 'src' | 'card' | 'thumb' } = {}) {
  if (m.kind === 'video') {
    return `<video class="${cls}" src="${esc(m.src)}#t=0.1" ${autoplay ? 'autoplay' : ''} muted loop playsinline preload="metadata" width="${m.width}" height="${m.height}"></video>`;
  }
  return `<img class="${cls}" src="${esc(m[size])}" alt="${esc(m.alt)}" loading="lazy" decoding="async" width="${m.width}" height="${m.height}" />`;
}

const icon = {
  prev: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

export function createViewer(opts: Options) {
  const shots = opts.shots;
  const state = {
    open: false,
    index: 0,
    frame: 0,
    originEl: null as HTMLElement | null,
    lastFocus: null as Element | null,
    prevHash: '',
  };

  const root = document.createElement('div');
  root.className = `vw vw--${opts.theme}`;
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

  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector(s) as T;
  const stage = $('.vw-stage');
  const wrap = $('.vw-media-wrap');
  const mediaBox = $('.vw-media');
  const frames = $('.vw-frames');
  const panel = $('.vw-panel');
  const body = $('.vw-panel-body');
  const backdrop = $('.vw-backdrop');
  const count = $('.vw-count');
  const shot = () => shots[state.index];

  /* ---------- rendering ---------- */
  function renderMedia() {
    const m = shot().media[state.frame];
    mediaBox.innerHTML = m.html || mediaHTML(m, { cls: 'vw-el' });
    const el = mediaBox.firstElementChild as HTMLImageElement | null;
    if (el && el.tagName === 'IMG') el.loading = 'eager';
    sizeMedia();
  }

  function renderFrames() {
    const media = shot().media;
    frames.hidden = media.length < 2;
    if (media.length < 2) { frames.innerHTML = ''; return; }
    frames.innerHTML = media.map((m, i) => `
      <button class="vw-frame${i === state.frame ? ' is-active' : ''}" data-frame="${i}" aria-label="Frame ${i + 1} of ${media.length}">
        ${m.thumbHTML || (m.kind === 'video' ? '<span class="vw-frame-play" aria-hidden="true"></span>' : `<img src="${esc(m.thumb)}" alt="" loading="lazy" />`)}
      </button>`).join('');
  }

  function renderPanel() {
    body.innerHTML = opts.renderPanel(shot(), state.index, state.frame);
    body.scrollTop = 0;
    count.textContent = `${state.index + 1} / ${shots.length}`;
    root.setAttribute('aria-label', `${shot().title}, ${shot().company.name}`);
  }

  function render() {
    renderMedia();
    renderFrames();
    renderPanel();
    opts.onChange?.(state.index, state.frame);
  }

  function setFrame(i: number) {
    state.frame = i;
    renderMedia();
    renderFrames();
    body.querySelectorAll('[data-frame-num]').forEach((el) => { el.textContent = String(i + 1); });
    body.querySelectorAll('[data-frame-cap]').forEach((el) => { el.textContent = shot().media[i].caption || ''; });
    opts.onChange?.(state.index, i);
  }

  function sizeMedia() {
    const m = shot().media[state.frame];
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const framesH = frames.hidden ? 0 : 64;
    const availW = stage.clientWidth - padX;
    const availH = isNarrow() ? Math.min(window.innerHeight * 0.6, 640) : stage.clientHeight - padY - framesH;
    const ratio = isNarrow() && m.nw && m.nh ? m.nw / m.nh : m.width / m.height;
    let w = availW, h = w / ratio;
    if (h > availH) { h = availH; w = h * ratio; }
    wrap.style.width = Math.round(w) + 'px';
    wrap.style.height = Math.round(h) + 'px';
  }

  /* ---------- motion ---------- */
  function originTransform(from: DOMRect) {
    const to = wrap.getBoundingClientRect();
    const s = Math.max(from.width / to.width, from.height / to.height);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const clipX = Math.max(0, (to.width - from.width / s) / 2);
    const clipY = Math.max(0, (to.height - from.height / s) / 2);
    const r = (opts.originRadius ?? 12) / s;
    return { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${clipY}px ${clipX}px round ${r}px)` };
  }
  const finalFrame = () => ({ transform: 'translate(0,0) scale(1)', clipPath: `inset(0px 0px round ${opts.mediaRadius ?? 12}px)` });

  function visible(el: HTMLElement | null): el is HTMLElement {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }
  const panelFrom = () => (isNarrow() ? 'translateY(40px)' : 'translateX(32px)');

  /* ---------- open / close ---------- */
  function open(index: number, originEl?: HTMLElement | null, frame = 0) {
    if (!shots[index]) return;
    state.index = index;
    state.frame = frame;
    if (state.open) { render(); syncHash(); return; }

    state.open = true;
    state.lastFocus = document.activeElement;
    state.originEl = originEl ?? opts.getOrigin(index);
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
    panel.animate([{ opacity: 0, transform: reduce() ? 'none' : panelFrom() }, { opacity: 1, transform: 'none' }], { duration: reduce() ? 120 : 360, delay: reduce() ? 0 : 60, easing: EASE, fill: 'both' });
    frames.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: dur * 0.6, fill: 'both' });
    requestAnimationFrame(() => $('[data-dismiss]').focus({ preventScroll: true }));
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    const target = opts.getOrigin(state.index);
    const origin = visible(target) ? target : null;
    const dur = reduce() ? 0 : 300;
    if (state.originEl && state.originEl !== origin) state.originEl.style.visibility = '';
    if (origin) origin.style.visibility = 'hidden';

    const anims: Animation[] = [];
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
      if (done || state.open) return;
      done = true;
      root.hidden = true;
      [wrap, backdrop, panel, frames].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      if (origin) origin.style.visibility = '';
      mediaBox.innerHTML = '';
      lockScroll(false);
      history.replaceState(null, '', state.prevHash && !state.prevHash.startsWith('#/work/') ? state.prevHash : location.pathname + location.search);
      opts.onChange?.(null, 0);
      const focusTo = (origin?.closest('a,button,[tabindex]') as HTMLElement | null) || (state.lastFocus as HTMLElement | null);
      focusTo?.focus?.({ preventScroll: true });
    };
    Promise.all(anims.map((a) => a.finished.catch(() => {}))).then(finish);
    setTimeout(finish, (dur || 200) + 150); // hidden tabs pause animations; never leave the viewer stuck
  }

  /* ---------- navigation ---------- */
  function step(dir: 1 | -1) {
    const next = state.frame + dir;
    if (next >= 0 && next < shot().media.length) return setFrame(next);
    jump(dir, dir < 0 ? 'last' : 0);
  }
  function jump(dir: 1 | -1, frame: number | 'last' = 0) {
    const n = shots.length;
    state.index = (state.index + dir + n) % n;
    state.frame = frame === 'last' ? shot().media.length - 1 : frame;
    render();
    syncHash();
  }
  const syncHash = () => history.replaceState(null, '', `#/work/${shot().key}`);

  /* ---------- events ---------- */
  function onRootClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (t.closest('[data-prev]')) return jump(-1);
    if (t.closest('[data-next]')) return jump(1);
    if (t.closest('[data-dismiss]')) return close();
    const f = t.closest<HTMLElement>('[data-frame]');
    if (f) return setFrame(+f.dataset.frame!);
    const g = t.closest<HTMLElement>('[data-goto]');
    if (g) { state.index = +g.dataset.goto!; state.frame = 0; render(); syncHash(); return; }
    if (t.hasAttribute('data-close')) close();
  }
  function onKey(e: KeyboardEvent) {
    if (!state.open) return;
    const inPanel = (e.target as Element | null)?.closest?.('.vw-panel-body');
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if ((e.key === 'ArrowDown' || e.key === 'j') && !inPanel) { e.preventDefault(); jump(1); }
    else if ((e.key === 'ArrowUp' || e.key === 'k') && !inPanel) { e.preventDefault(); jump(-1); }
    else if (e.key === 'Tab') trapFocus(e);
  }
  const onResize = () => state.open && sizeMedia();
  let touchX: number | null = null;
  const onTouchStart = (e: TouchEvent) => { touchX = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };

  root.addEventListener('click', onRootClick);
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  stage.addEventListener('touchstart', onTouchStart, { passive: true });
  stage.addEventListener('touchend', onTouchEnd);

  function trapFocus(e: KeyboardEvent) {
    const f = [...root.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function lockScroll(on: boolean) {
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

  function openFromHash() {
    const m = location.hash.match(/^#\/work\/([^/]+)\/([^/]+)/);
    if (!m) return false;
    const i = shots.findIndex((s) => s.key === `${m[1]}/${m[2]}`);
    if (i >= 0) { state.prevHash = ''; open(i, null); }
    return i >= 0;
  }

  function destroy() {
    if (state.open) lockScroll(false);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    root.remove();
  }

  return { open, close, openFromHash, destroy, get isOpen() { return state.open; } };
}
