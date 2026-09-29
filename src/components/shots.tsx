'use client';

/*
  Shot cards (rows or grid) and the viewer they open.
  Cards carry `data-shot={index}`; the viewer listens for clicks on them, so
  server-rendered sections and the viewer stay decoupled.
*/
import { useEffect, useRef } from 'react';
import type { Media } from '@/lib/types';
import { createViewer, esc, mediaHTML, type ViewerShot } from '@/lib/viewer';
import { hostOf } from '@/lib/text';

export type CardShot = { index: number; title: string; status?: string; year?: string; media: Media; frames: number };

const Arrow = ({ dir }: { dir: -1 | 1 }) => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
    <path d={dir < 0 ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Card({ shot }: { shot: CardShot }) {
  const m = shot.media;
  return (
    <button className="card" data-shot={shot.index} aria-label={`${shot.title}. Open details`}>
      <div className="card__media" style={{ ['--ar' as string]: `${m.width}/${m.height}` }}>
        {shot.frames > 1 && <span className="chip">{shot.frames} frames</span>}
        {m.kind === 'video' ? (
          <video src={`${m.src}#t=0.1`} muted loop playsInline preload="metadata" width={m.width} height={m.height} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.card} alt={m.alt || ''} loading="lazy" decoding="async" width={m.width} height={m.height} />
        )}
      </div>
      <div className="card__cap">
        <span>{shot.title}</span>
        <span>{[shot.status, shot.year].filter(Boolean).join(' · ')}</span>
      </div>
    </button>
  );
}

/** Only play card videos while they're on screen. */
function usePlayInView(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        const v = en.target as HTMLVideoElement;
        if (en.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }),
      { threshold: 0.35 },
    );
    el.querySelectorAll('video').forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [root]);
}

export function ShotRail({ companyId, companyName, shots }: { companyId: string; companyName: string; shots: CardShot[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const prev = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  usePlayInView(rail);

  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    const update = () => {
      if (prev.current) prev.current.disabled = r.scrollLeft < 4;
      if (next.current) next.current.disabled = r.scrollLeft + r.clientWidth > r.scrollWidth - 4;
    };
    update();
    r.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      r.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollBy = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.7, behavior: 'smooth' });

  return (
    <>
      <div className="wrap">
        <div className="rail-bar">
          <button ref={prev} className="rbtn" onClick={() => scrollBy(-1)} aria-label={`Scroll ${companyName} work left`}><Arrow dir={-1} /></button>
          <button ref={next} className="rbtn" onClick={() => scrollBy(1)} aria-label={`Scroll ${companyName} work right`}><Arrow dir={1} /></button>
        </div>
      </div>
      <div className="rail" id={`rail-${companyId}`} ref={rail}>
        {shots.map((s) => <Card key={s.index} shot={s} />)}
      </div>
    </>
  );
}

export function ShotGrid({ shots }: { shots: CardShot[] }) {
  const grid = useRef<HTMLDivElement>(null);
  usePlayInView(grid);
  return (
    <div className="wrap">
      <div className="shot-grid" ref={grid}>
        {shots.map((s) => <Card key={s.index} shot={s} />)}
      </div>
    </div>
  );
}

/* ---------- Viewer ---------- */

const specRow = (k: string, v?: string) => (v ? `<div><dt>${esc(k)}</dt><span class="dots"></span><dd>${esc(v)}</dd></div>` : '');

function renderPanel(shots: ViewerShot[]) {
  return (s: ViewerShot, index: number, frame: number) => {
    const c = s.company;
    const next = shots[(index + 1) % shots.length];
    const nextIndex = (index + 1) % shots.length;
    return `
      <div class="pa-eyebrow">${c.logo ? `<img src="${esc(c.logo)}" alt="" />` : ''}${esc(c.name)}${c.product ? ' · ' + esc(c.product) : ''}<span style="color:var(--ink-3)">· ${esc(c.years)}</span></div>
      <h2 class="pa-title">${esc(s.title)}</h2>
      ${s.description ? `<p class="pa-desc">${esc(s.description)}</p>` : ''}
      ${s.media.length > 1 ? `<p class="pa-frame mono">Frame <span data-frame-num>${frame + 1}</span> of ${s.media.length}</p>` : ''}
      <dl class="spec">
        ${specRow('Contribution', s.contributions.join(', '))}
        ${specRow('Platform', s.platform)}
        ${specRow('Status', s.status)}
        ${specRow('Year', s.year)}
      </dl>
      ${c.impact.length ? `
      <div class="pa-impact">
        <div class="eyebrow">${esc(c.name)} impact</div>
        ${c.impact.map((i) => `<div><span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}
      </div>` : ''}
      ${shots.length > 1 ? `
      <button class="pa-next" data-goto="${nextIndex}">
        <span class="thumb">${mediaHTML(next.media[0], { autoplay: false, size: 'thumb' })}</span>
        <span><small>Up next${next.company.id !== c.id ? ' · ' + esc(next.company.name) : ''}</small><b>${esc(next.title)}</b></span>
      </button>` : ''}
      ${c.url ? `<a class="link pa-visit" href="${esc(c.url)}" target="_blank" rel="noopener">Visit ${esc(hostOf(c.url))} ↗</a>` : ''}
      <div class="kbd"><span><kbd>←</kbd><kbd>→</kbd>frames</span><span><kbd>↑</kbd><kbd>↓</kbd>shots</span><span><kbd>esc</kbd>close</span></div>`;
  };
}

export function ShotViewer({ shots }: { shots: ViewerShot[] }) {
  useEffect(() => {
    if (!shots.length) return;
    const originFor = (i: number) => document.querySelector<HTMLElement>(`.card[data-shot="${i}"] .card__media`);
    const viewer = createViewer({
      shots,
      theme: 'a',
      originRadius: 12,
      mediaRadius: 12,
      renderPanel: renderPanel(shots),
      getOrigin: originFor,
      onChange: (i) => {
        if (i === null) return;
        // Keep the current shot's card in view behind the viewer, so closing lands on it.
        const card = document.querySelector<HTMLElement>(`.card[data-shot="${i}"]`);
        const rail = card?.closest<HTMLElement>('.rail');
        if (card && rail) {
          const r = card.getBoundingClientRect(), rr = rail.getBoundingClientRect();
          if (r.left < rr.left || r.right > rr.right) rail.scrollLeft += r.left - rr.left - 32;
        }
        if (card) {
          const cr = card.getBoundingClientRect();
          if (cr.bottom < 80 || cr.top > window.innerHeight - 80) card.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      },
    });

    const onClick = (e: MouseEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.card[data-shot]');
      if (!card) return;
      viewer.open(Number(card.dataset.shot), card.querySelector<HTMLElement>('.card__media'));
    };
    document.addEventListener('click', onClick);
    viewer.openFromHash();
    return () => {
      document.removeEventListener('click', onClick);
      viewer.destroy();
    };
  }, [shots]);
  return null;
}
