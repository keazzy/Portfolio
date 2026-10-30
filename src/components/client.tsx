'use client';

/*
  Small client-only pieces: the aurora, the live clock, the sticky company tabs and the cursor.
*/
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { mount, type AuroraTheme } from '@/lib/aurora';
import type { Accent } from '@/lib/types';

/* ---------- Aurora curtain, tinted to the accent ---------- */

const AURORA_THEMES: Record<Accent, AuroraTheme> = {
  ember: { tintA: [0.95, 0.52, 0.22], tintB: [1.0, 0.7, 0.36], gain: 0.42, grain: 0.6 },
  iris: { tintA: [0.49, 0.38, 0.93], tintB: [0.64, 0.56, 1.0], gain: 0.36, grain: 0.6 },
  claret: { tintA: [0.62, 0.18, 0.28], tintB: [0.8, 0.36, 0.44], gain: 0.32, grain: 0.6 },
};

export function Aurora({ accent }: { accent: Accent }) {
  useEffect(() => {
    const handle = mount(document.body, { theme: AURORA_THEMES[accent] });
    return () => handle.destroy();
  }, [accent]);
  return null;
}

/* ---------- Live local time ---------- */

export function LocalTime({ timezone, suffix = '' }: { timezone: string; suffix?: string }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () =>
      setTime(
        new Date()
          .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
          .toLowerCase()
          .replace(' ', ''),
      );
    fmt();
    const id = setInterval(fmt, 15000);
    return () => clearInterval(id);
  }, [timezone]);
  // Rendered only on the client so server and client never disagree about the minute.
  return <span>{time ? `${time}${suffix}` : ' '}</span>;
}

/* ---------- Sticky company tabs with per-section progress ---------- */

type Tab = { id: string; name: string; years: string };

export function CompanyTabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = bar.current;
    const work = document.getElementById('work');
    if (!nav || !work) return;
    const sections = tabs.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    let ticking = false;
    const update = () => {
      ticking = false;
      nav.classList.toggle('is-on', window.scrollY > work.offsetTop - 80);
      const mid = window.innerHeight * 0.35;
      for (const sec of sections) {
        const r = sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        const tab = nav.querySelector<HTMLElement>(`[data-tab="${sec.id}"]`);
        if (!tab) continue;
        tab.querySelector('b')?.style.setProperty('--p', p.toFixed(3));
        tab.classList.toggle('is-active', r.top <= mid && r.bottom > mid);
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [tabs]);

  if (!tabs.length) return null;
  return (
    <nav className="tabs" aria-label="Companies" ref={bar}>
      <div className="wrap">
        <a className="tab tab--name" href="#">{label}</a>
        {tabs.map((t) => (
          <a key={t.id} className="tab" href={`#${t.id}`} data-tab={t.id}>
            <span>{t.name}</span>
            <small>{t.years}</small>
            <i><b /></i>
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ---------- The cursor: an arrow that carries a label over the work ---------- */

const ARROW = 'M3 2.5 L20 10 L11.5 13.5 L6 21.5 Z';

// Mouse and trackpad only. The native pointer stays until the first mouse move, so it's never missing.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current!, pill = el.querySelector<HTMLElement>('.cursor-pill')!, root = document.documentElement;
    let x = -100, y = -100, raf = 0, over: Element | null = null, pillW = 0;

    // Over a cover, the arrow carries the card's cue (the cue in the card itself is for keyboard focus).
    const label = (target: Element | null) => {
      const box = target?.closest('.wcover') ?? null;
      if (box === over) return;
      over = box;
      const cue = box?.querySelector('.wcue');
      if (cue) { pill.innerHTML = cue.innerHTML; pillW = pill.offsetWidth; }
      el.classList.toggle('labelled', !!cue);
    };
    const place = () => {
      raf = 0;
      el.style.transform = `translate3d(${x - 3}px, ${y - 2.5}px, 0)`;
      // Near the right edge the label hangs to the left instead.
      el.classList.toggle('flip', x + 24 + pillW > innerWidth);
    };
    const move = (e: PointerEvent) => {
      // A pen or a touch screen on a hybrid laptop gets the native pointer back.
      if (e.pointerType !== 'mouse') { root.classList.remove('has-cursor'); return; }
      root.classList.add('has-cursor');
      el.classList.remove('away');
      x = e.clientX; y = e.clientY;
      label(e.target as Element);
      if (!raf) raf = requestAnimationFrame(place);
    };
    // Scrolling moves the page under a still cursor, so look again at what it's over.
    const scroll = () => { if (root.classList.contains('has-cursor')) label(document.elementFromPoint(x, y)); };
    const out = (e: PointerEvent) => { if (!e.relatedTarget) el.classList.add('away'); };
    const down = () => el.classList.add('down');
    const up = () => el.classList.remove('down');

    addEventListener('pointermove', move, { passive: true });
    addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('pointerout', out);
    addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      removeEventListener('scroll', scroll);
      document.removeEventListener('pointerout', out);
      removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      root.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <svg width="26" height="28" viewBox="0 0 26 28" strokeLinejoin="round">
        <path d={ARROW} transform="translate(0 3)" className="cursor-shadow" strokeWidth="3" />
        <path d={ARROW} fill="#fff" stroke="#fff" strokeWidth="6" />
        <path d={ARROW} className="cursor-body" strokeWidth="2.4" />
      </svg>
      <span className="cursor-pill" />
    </div>
  );
}

/* ---------- "Previewing drafts" pill (only outside the Studio's preview frame) ---------- */

const noopSubscribe = () => () => {};

export function DraftModeBadge() {
  // Inside Presentation the site is framed and the Studio already shows the draft state.
  const framed = useSyncExternalStore(noopSubscribe, () => window.self !== window.top, () => true);
  if (framed) return null;
  return (
    <a className="draft-badge" href="/api/draft-mode/disable">
      Previewing drafts · <span>Exit</span>
    </a>
  );
}
