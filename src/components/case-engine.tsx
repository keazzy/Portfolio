'use client';

/* The moving parts of a case study: live blocks, self-scrolling phone screens and the contents highlight. */
import { useActionState, useEffect } from 'react';
import { unlock, type UnlockState } from '@/app/(site)/actions';
import { CASE_LIVE } from '@/lib/work/case-live';

export function CaseEngine() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.case');
    if (!root) return;
    const cleanup: (() => void)[] = [];

    root.querySelectorAll<HTMLElement>('[data-live]').forEach((el) => {
      const mount = CASE_LIVE[el.dataset.live!];
      if (mount) cleanup.push(mount(el));
    });

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
