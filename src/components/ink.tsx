'use client';

/*
  Puts the ink on the headlines (see lib/ink.ts). Headlines at rest share one SVG filter per size and level. A headline
  that moves along the dial gets its own while it moves: a case study's title develops from overexposed into ink,
  and a headline already on screen when the ink arrives soaks in from a crisp print instead of jumping.
*/
import { useEffect } from 'react';
import { at, axes, INKED, spread } from '@/lib/ink';

const NS = 'http://www.w3.org/2000/svg';
const SELECTOR = INKED.map(([s]) => s).join(', ');
const levelOf = (el: Element) => INKED.find(([s]) => el.matches(s))?.[1];
const DEVELOP = { from: 60, duration: 1600, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' };
const SOAK = { from: 0, duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

export function Ink() {
  useEffect(() => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    const defs = svg.appendChild(document.createElementNS(NS, 'defs'));
    document.body.appendChild(svg);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = () => window.devicePixelRatio || 1;
    const fontPx = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize);
    let n = 0;

    const filter = () => {
      const f = document.createElementNS(NS, 'filter');
      f.id = `ink-${n++}`;
      // The region reaches past the letters so the spread is never clipped at the edges of the box.
      f.setAttribute('x', '-20%'); f.setAttribute('y', '-50%'); f.setAttribute('width', '140%'); f.setAttribute('height', '200%');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      f.innerHTML = '<feGaussianBlur in="SourceGraphic"/><feComponentTransfer><feFuncA type="linear"/></feComponentTransfer>';
      return defs.appendChild(f);
    };
    const tune = (f: SVGFilterElement, sp: NonNullable<ReturnType<typeof spread>>) => {
      f.firstElementChild!.setAttribute('stdDeviation', sp.sigma.toFixed(3));
      const a = f.querySelector('feFuncA')!;
      a.setAttribute('slope', sp.slope.toFixed(3));
      a.setAttribute('intercept', sp.intercept.toFixed(4));
    };

    // At rest: one filter for every headline of the same size and level.
    const shared = new Map<string, SVGFilterElement>();
    const rest = (el: HTMLElement, level: number) => {
      const s = at(level), px = fontPx(el), sp = spread(s, px, dpr());
      el.style.fontVariationSettings = axes(s);
      if (!sp) { el.style.filter = ''; return; }
      const key = `${level}@${px.toFixed(1)}@${dpr()}`;
      let f = shared.get(key);
      if (!f) { f = filter(); tune(f, sp); shared.set(key, f); }
      el.style.filter = `url(#${f.id})`;
    };

    // Moving along the dial, eased by a bare Web Animations clock so the curve matches the CSS fade beside it.
    const moving = new Map<HTMLElement, () => void>();
    const travel = (el: HTMLElement, level: number, how: typeof DEVELOP) => {
      if (reduced) return rest(el, level);
      const f = filter(), px = fontPx(el);
      const clock = new Animation(new KeyframeEffect(null, null, { duration: how.duration, easing: how.easing, fill: 'both' }), document.timeline);
      let raf = 0;
      const stop = () => { cancelAnimationFrame(raf); clock.cancel(); f.remove(); moving.delete(el); };
      const frame = () => {
        const p = clock.effect!.getComputedTiming().progress ?? 1;
        const s = at(how.from + (level - how.from) * p), sp = spread(s, px, dpr());
        el.style.fontVariationSettings = axes(s);
        if (sp) { tune(f, sp); el.style.filter = `url(#${f.id})`; } else el.style.filter = '';
        if (clock.playState === 'finished') { stop(); rest(el, level); } else raf = requestAnimationFrame(frame);
      };
      moving.set(el, stop);
      clock.play();
      frame();
    };

    const seen = new WeakSet<HTMLElement>();
    const ink = (el: HTMLElement) => {
      const level = levelOf(el);
      if (level === undefined || seen.has(el)) return;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (el.classList.contains('develop')) travel(el, level, DEVELOP);
      else if (r.bottom > 0 && r.top < innerHeight) travel(el, level, SOAK);
      else rest(el, level);
    };
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(ink);

    // Headlines that arrive later: a new page, the viewer's story panel, a live content update.
    let found: HTMLElement[] = [], queued = 0;
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(SELECTOR)) found.push(node);
        found.push(...node.querySelectorAll<HTMLElement>(SELECTOR));
      });
      if (found.length && !queued) queued = requestAnimationFrame(() => {
        queued = 0;
        const els = found; found = [];
        els.forEach((el) => el.isConnected && ink(el));
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Sizes change with the window (the hero and the email are fluid), so the spread is fitted again.
    let resized = 0;
    const onResize = () => {
      if (resized) return;
      resized = requestAnimationFrame(() => {
        resized = 0;
        shared.forEach((f) => f.remove());
        shared.clear();
        document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
          const level = levelOf(el);
          if (level !== undefined && !moving.has(el)) rest(el, level);
        });
      });
    };
    addEventListener('resize', onResize);

    return () => {
      mo.disconnect();
      removeEventListener('resize', onResize);
      cancelAnimationFrame(queued); cancelAnimationFrame(resized);
      moving.forEach((stop) => stop());
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => { el.style.filter = ''; el.style.fontVariationSettings = ''; });
      svg.remove();
    };
  }, []);
  return null;
}
