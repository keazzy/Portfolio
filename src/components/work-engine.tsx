'use client';

/*
  Everything that moves on the work grid: live covers, reels, card videos, the viewer
  and the password dialog for protected work. The grid itself is server-rendered.
*/
import { useActionState, useEffect, useRef, useState } from 'react';
import { unlock, type UnlockState } from '@/app/(site)/actions';
import { lazyVideos } from '@/lib/lazy-video';
import { hostOf } from '@/lib/text';
import { createViewer, esc, type ViewerShot } from '@/lib/viewer';
import { fitLive, LIVE, type LiveName } from '@/lib/work/live';
import { makeReel, SCRIPTS, type Reel } from '@/lib/work/reels';

const fill = (s: string) => esc(s).replace(/\[([^\]]+)\]/g, '<mark class="fill-in">$1</mark>');
const specRow = (k: string, v?: string) => (v ? `<div><dt>${esc(k)}</dt><span class="dots"></span><dd>${esc(v)}</dd></div>` : '');

function renderPanel(s: ViewerShot, _index: number, frame: number) {
  const c = s.company, n = s.media.length;
  const story = s.story && ([['Problem', s.story.problem], ['What I did', s.story.did], ['Key decision', s.story.decision], ['Result', s.story.result]] as const)
    .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${fill(v!)}</dd></div>`).join('');
  return `
    <div class="pa-eyebrow">${c.logo ? `<img src="${esc(c.logo)}" alt="" />` : ''}${esc(c.name)}${c.product ? ' · ' + esc(c.product) : ''}<span style="color:var(--ink-3)">· ${esc(c.years)}</span></div>
    <h2 class="pa-title">${esc(s.title)}</h2>
    ${s.description ? `<p class="pa-desc">${esc(s.description)}</p>` : ''}
    ${story ? `<dl class="pa-story">${story}</dl>` : ''}
    ${s.caseStudy ? `<a class="pa-case" href="${esc(s.caseStudy)}">Read the case study →</a>` : ''}
    <p class="pa-frame"><span class="fine">${n > 1 ? `<span data-frame-num>${frame + 1}</span> / ${n}` : 'Frame'}</span><span data-frame-cap>${esc(s.media[frame]?.caption)}</span></p>
    <dl class="spec">
      ${specRow(s.story ? 'Role' : 'Contribution', s.contributions.join(', '))}
      ${specRow('Methods', s.methods?.join(', '))}
      ${specRow('Platform', s.platform)}
      ${specRow('Status', s.status)}
      ${specRow('Year', s.year)}
    </dl>
    ${c.impact.length ? `<div class="pa-impact">${c.impact.map((i) => `<div><span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}</div>` : ''}
    ${c.url ? `<a class="link pa-visit" href="${esc(c.url)}" target="_blank" rel="noopener">Visit ${esc(hostOf(c.url))} ↗</a>` : ''}
    <div class="kbd"><span><kbd>←</kbd><kbd>→</kbd>frames</span><span><kbd>↑</kbd><kbd>↓</kbd>shots</span><span><kbd>esc</kbd>close</span></div>`;
}

export function WorkEngine({ shots }: { shots: ViewerShot[] }) {
  const [gate, setGate] = useState<ViewerShot | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanup: (() => void)[] = [];

    // Live covers are drawn at a fixed size, then scaled to their box.
    document.querySelectorAll<HTMLElement>('.cover .live-wrap').forEach((w) => {
      fitLive(w);
      const ro = new ResizeObserver(() => fitLive(w));
      ro.observe(w);
      cleanup.push(() => ro.disconnect());
      // Reduced motion: a finished state instead of an empty box.
      if (reduce) LIVE[w.dataset.live as LiveName].still(w.firstElementChild as HTMLElement);
    });

    // Card videos load as they come near the screen and only play while they're on it.
    cleanup.push(lazyVideos(document.querySelectorAll<HTMLVideoElement>('.cover video')));

    // Reels run while their card is at least half on screen.
    if (!reduce) {
      const reels = new Map<Element, Reel>();
      document.querySelectorAll<HTMLElement>('.wcard[data-reel]').forEach((card) => {
        const script = SCRIPTS[card.dataset.reel!];
        if (script) reels.set(card, makeReel(card.querySelector<HTMLElement>('.cover')!, script));
      });
      const rio = new IntersectionObserver((es) => es.forEach((en) => {
        const reel = reels.get(en.target);
        if (en.isIntersecting) reel?.start();
        else reel?.stop();
      }), { threshold: 0.5 });
      reels.forEach((_, card) => rio.observe(card));
      cleanup.push(() => { rio.disconnect(); reels.forEach((r) => r.stop()); });
    }

    // The viewer. A live frame gets its own reel while it's showing.
    let liveReel: Reel | null = null, liveFit: ResizeObserver | null = null;
    const cardFor = (i: number) => document.querySelector<HTMLElement>(`.wcard[data-shot="${i}"]`);
    const viewer = createViewer({
      shots,
      theme: 'a',
      originRadius: 4,
      mediaRadius: 8,
      renderPanel,
      getOrigin: (i) => cardFor(i)?.querySelector<HTMLElement>('.cover') ?? null,
      onChange: (i, frame) => {
        liveReel?.stop(); liveReel = null;
        liveFit?.disconnect(); liveFit = null;
        if (i === null) return;
        // Keep the current shot's card in view behind the viewer, so closing lands on it.
        const card = cardFor(i);
        if (card) {
          const r = card.getBoundingClientRect();
          if (r.bottom < 80 || r.top > window.innerHeight - 80) card.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        const name = shots[i].media[frame]?.live as LiveName | undefined;
        const stage = document.querySelector<HTMLElement>('.vw-media .vstage'), wrap = stage?.querySelector<HTMLElement>('.live-wrap');
        if (!name || !stage || !wrap) return;
        liveFit = new ResizeObserver(() => fitLive(wrap));
        liveFit.observe(stage);
        fitLive(wrap);
        if (reduce) LIVE[name].still(wrap.firstElementChild as HTMLElement);
        else (liveReel = makeReel(stage, SCRIPTS[LIVE[name].script])).start();
      },
    });
    cleanup.push(() => { liveReel?.stop(); liveFit?.disconnect(); viewer.destroy(); });

    const onClick = (e: MouseEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('.wcard[data-shot]');
      if (!card || card.tagName === 'A') return; // case-study cards are links: let them navigate
      const i = Number(card.dataset.shot);
      if (shots[i]?.locked) setGate(shots[i]);
      else viewer.open(i, card.querySelector<HTMLElement>('.cover'));
    };
    document.addEventListener('click', onClick);
    cleanup.push(() => document.removeEventListener('click', onClick));

    // A link straight to protected work asks for the password, once the page has painted.
    const linked = shots.find((s) => location.hash === `#/work/${s.key}`);
    if (linked?.locked) {
      const raf = requestAnimationFrame(() => setGate(linked));
      cleanup.push(() => cancelAnimationFrame(raf));
    } else viewer.openFromHash();

    return () => cleanup.forEach((f) => f());
  }, [shots]);

  return gate ? <Gate key={gate.key} shot={gate} onClose={() => setGate(null)} /> : null;
}

/** Password dialog for protected work. The check runs on the server; on success the page reloads with the shot open. */
function Gate({ shot, onClose }: { shot: ViewerShot; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, { ok: false });

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  useEffect(() => {
    if (!state.ok) return;
    location.hash = `/work/${shot.key}`;
    location.reload();
  }, [state.ok, shot.key]);

  return (
    <dialog ref={ref} className="gate" onClose={onClose}>
      <h3>{shot.title}</h3>
      <p>Halvest’s v2 hasn’t launched yet, so this one is behind a password. You’ll find it in my application.</p>
      <form action={action}>
        <input name="password" type="password" placeholder="Password" aria-label="Password" autoComplete="off" required autoFocus />
        <button disabled={pending}>{pending ? 'Checking…' : 'Unlock'}</button>
      </form>
      <p className="err" aria-live="polite">{state.error}</p>
    </dialog>
  );
}
