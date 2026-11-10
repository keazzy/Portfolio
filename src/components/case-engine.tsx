'use client';

/* The moving parts of a case study: live covers and blocks, self-scrolling phone screens and the contents highlight. */
import { useActionState, useEffect } from 'react';
import { unlock, type UnlockState } from '@/app/(site)/actions';
import { CASE_LIVE } from '@/lib/work/case-live';
import { fitLive, LIVE, type LiveName } from '@/lib/work/live';
import { makeReel, SCRIPTS } from '@/lib/work/reels';

export function CaseEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.case');
    if (!root) return;
    const cleanup: (() => void)[] = [];

    // A live cover (Pulse's command bar) is scaled to the cover and plays while it's on screen, as it does on its card.
    root.querySelectorAll<HTMLElement>('.cs-cover .live-wrap').forEach((w) => {
      const cover = w.parentElement!, live = LIVE[w.dataset.live as LiveName];
      fitLive(w);
      const ro = new ResizeObserver(() => fitLive(w));
      ro.observe(cover);
      cleanup.push(() => ro.disconnect());
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return live.still(w.firstElementChild as HTMLElement);
      const reel = makeReel(cover, SCRIPTS[live.script]);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? reel.start() : reel.stop()), { threshold: 0.5 });
      io.observe(cover);
      cleanup.push(() => { io.disconnect(); reel.stop(); });
    });

    root.querySelectorAll<HTMLElement>('[data-live]').forEach((el) => {
      const mount = CASE_LIVE[el.dataset.live!];
      if (mount) cleanup.push(mount(el));
    });

    // A prototype, up close: the same flow mounted again at the size of the window, carrying on from the
    // moment it was opened, grown out of the panel it came from. Esc, the × or a click outside closes it.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GROW = 'cubic-bezier(0.32, 0.72, 0, 1)';
    let closeUpClose: (() => void) | null = null;
    const openUpClose = (panel: HTMLElement, from: HTMLElement) => {
      const name = panel.dataset.live!, mount = CASE_LIVE[name];
      if (!mount || closeUpClose) return;
      const now = panel.getAnimations({ subtree: true })[0]?.currentTime;
      const modal = document.createElement('div');
      modal.className = 'flow-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Prototype, up close');
      modal.innerHTML = `<i class="flow-backdrop"></i><div class="flow-panel" data-live="${name}"></div>
        <button type="button" class="flow-close" aria-label="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg></button>`;
      root.appendChild(modal);
      const big = modal.querySelector<HTMLElement>('.flow-panel')!, backdrop = modal.querySelector<HTMLElement>('.flow-backdrop')!;
      const unmount = mount(big);
      if (typeof now === 'number') big.getAnimations({ subtree: true }).forEach((a) => { a.currentTime = now; });
      const scroll = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      // From the small panel's place and size to the big one's, and back.
      const flip = () => {
        const a = panel.getBoundingClientRect(), b = big.getBoundingClientRect();
        return [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})`, transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }];
      };
      if (!reduced) {
        big.animate(flip(), { duration: 460, easing: GROW });
        backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
      }
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
      const onModalClick = (e: MouseEvent) => {
        const t = e.target as Element;
        if (t.closest('.flow-close') || t === backdrop) close();
      };
      document.addEventListener('keydown', onKey);
      modal.addEventListener('click', onModalClick);
      modal.querySelector<HTMLElement>('.flow-close')!.focus();
      const close = () => {
        if (!closeUpClose) return;
        closeUpClose = null;
        document.removeEventListener('keydown', onKey);
        const done = () => { unmount(); modal.remove(); document.documentElement.style.overflow = scroll; from.focus({ preventScroll: true }); };
        if (reduced) return done();
        backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
        big.animate(flip().reverse(), { duration: 320, easing: GROW, fill: 'forwards' }).finished.then(done, done);
      };
      closeUpClose = close;
    };
    const onPanelClick = (e: MouseEvent) => {
      const t = e.target as Element, panel = t.closest<HTMLElement>('.flow-panel[data-live]');
      if (!panel || panel.closest('.flow-modal')) return;
      const expand = t.closest<HTMLElement>('.fl-expand');
      if (t.closest('.fl-controls') && !expand) return;   // pause and replay keep their jobs
      openUpClose(panel, expand ?? panel);
    };
    root.addEventListener('click', onPanelClick);
    cleanup.push(() => { root.removeEventListener('click', onPanelClick); closeUpClose?.(); });

    // A tall screen plays like a screen recording: it scrolls down, rests, and comes back up.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll<HTMLImageElement>('img[data-scroll]').forEach((img) => {
        const travel = (1 - 812 / Number(img.getAttribute('height'))) * 100;
        const at = (y: number, offset: number) => ({ transform: `translateY(${-y}%)`, offset, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' });
        const anim = img.animate([at(0, 0), at(0, 0.12), at(travel, 0.6), at(travel, 0.78), at(0, 1)], { duration: 11000, iterations: Infinity });
        anim.pause();
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? anim.play() : anim.pause()), { threshold: 0.4 });
        io.observe(img.parentElement!);
        cleanup.push(() => { io.disconnect(); anim.cancel(); });
      });
    }

    // Marked-up figures write themselves in, once, the first time each side is seen. When both sides show
    // up together, the second waits for the first to finish.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let busy = 0;
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target as HTMLElement, now = performance.now(), wait = Math.max(0, busy - now);
        el.style.setProperty('--wait', `${wait}ms`);
        busy = now + wait + Number(el.dataset.dur);
        el.classList.add('on');
      }), { threshold: 0.4 });
      root.querySelectorAll<HTMLElement>('.cmp-g').forEach((g) => { g.classList.add('armed'); io.observe(g); });
      cleanup.push(() => io.disconnect());
    }

    // Contents: highlight the chapter being read.
    const links = new Map([...root.querySelectorAll<HTMLAnchorElement>('.toc a')].map((a) => [a.hash.slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('on'));
      links.get(e.target.id)?.classList.add('on');
    }), { rootMargin: '-35% 0px -60% 0px' });
    root.querySelectorAll('.ch').forEach((s) => io.observe(s));
    cleanup.push(() => io.disconnect());

    return () => cleanup.forEach((f) => f());
  }, []);
  return null;
}

/** Password form for a protected case study. The check runs on the server; on success the page reloads, now unlocked. */
export function CaseGate() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, { ok: false });
  useEffect(() => { if (state.ok) location.reload(); }, [state.ok]);
  return (
    <>
      <form action={action}>
        <input name="password" type="password" placeholder="Password" aria-label="Password" autoComplete="off" required autoFocus />
        <button disabled={pending}>{pending ? 'Checking…' : 'Unlock'}</button>
      </form>
      <p className="err" aria-live="polite">{state.error}</p>
    </>
  );
}
