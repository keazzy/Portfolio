import 'server-only';
import type { Screen } from './case';

/*
  A before-and-after marked up by hand: two screens side by side, with handwritten notes on the outside
  and pen strokes (arrows, loops, braces, underlines) pointing at what changed. The strokes are drawn
  here, wobbly on purpose, from a seed per note, so they look hand-drawn but come out the same every time.
  They draw themselves in the first time the figure is seen (CaseEngine).

  Each side is its own box, laid out in 330 units: a 108-unit column of notes and a 210-wide phone, with the
  notes on the outside (the "before" side is mirrored). Desktop puts the boxes side by side, phones in the
  middle; a phone stacks them. Notes are placed in the screen's own units (375 wide), so they read off the
  screenshot directly.
*/

export type Note = {
  text: string;
  /** Where the note sits, on the screen's height: its first line lines up with this. */
  y: number;
  /** The arrow's tip, on the screen. No `to`, no arrow (for a mark that reaches the note by itself). */
  to?: [number, number];
  /** How far the arrow bows, in box units: positive bows down, negative up. */
  bend?: number;
  /** Circle this box: x, y, w, h. */
  loop?: [number, number, number, number];
  /** Underline: x1, x2, y. */
  under?: [number, number, number];
  /** A brace along a stretch of the screen: x, y1, y2. It points out at the note. */
  brace?: [number, number, number];
};
export type Side = Screen & { notes: Note[] };

const W = 330, PHONE = 210, COL = 108, GAP = 12, TOP = 30, S = PHONE / 375, LINE = 22;

// A small seeded random, so a note's strokes wobble the same way on every render.
function seeded(text: string) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  };
}
type P = [number, number];
const n = (v: number) => +v.toFixed(1);
// A smooth line through the points (Catmull-Rom as cubic Béziers).
function through(pts: P[]) {
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i], b = pts[i], c = pts[i + 1], e = pts[i + 2] ?? c;
    d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`;
  }
  return d;
}

// An arrow from a to b, bowed like a quick stroke, with a two-stroke head.
function arrow(a: P, b: P, bend: number, r: () => number) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
  const c: P = [(a[0] + b[0]) / 2 + nx * bend, (a[1] + b[1]) / 2 + ny * bend];
  const at = (t: number): P => [(1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
  const pts = Array.from({ length: 7 }, (_, i) => {
    const p = at(i / 6);
    return (i === 0 || i === 6 ? p : [p[0] + r() * 1.2, p[1] + r() * 1.2]) as P;
  });
  const back = at(0.86), ang = Math.atan2(b[1] - back[1], b[0] - back[0]);
  const wing = (side: number, l: number): P => [b[0] - l * Math.cos(ang + side * (0.5 + r() * 0.12)), b[1] - l * Math.sin(ang + side * (0.5 + r() * 0.12))];
  const w1 = wing(1, 8.5 + r() * 2), w2 = wing(-1, 7.5 + r() * 2);
  return { shaft: through(pts), head: `M${n(w1[0])} ${n(w1[1])}L${n(b[0])} ${n(b[1])}L${n(w2[0])} ${n(w2[1])}` };
}

// A loop around a box: a squarish oval that overshoots where it started, the way a pen circles something.
function loop([x, y, w, h]: [number, number, number, number], r: () => number, pad = 7) {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2 + pad, ry = h / 2 + pad, k = 2 / 4.5, start = -2.5 + r() * 0.3;
  const pts: P[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = start + (i / 60) * (Math.PI * 2 + 0.55), grow = 1 + (i / 60) * 0.05, wob = 1 + Math.sin(t * 3 + start) * 0.012;
    const ct = Math.cos(t), st = Math.sin(t);
    pts.push([cx + Math.sign(ct) * Math.abs(ct) ** k * rx * grow * wob, cy + Math.sign(st) * Math.abs(st) ** k * ry * grow * wob]);
  }
  return through(pts);
}

// An underline that leans a little, like one drawn fast.
function under([x1, x2, y]: [number, number, number], r: () => number) {
  return through(Array.from({ length: 6 }, (_, i) => [x1 + ((x2 - x1) * i) / 5, y + 1.5 - i * 0.5 + Math.sin(i * 1.7) * 0.8 + r() * 0.6] as P));
}

// A curly brace along x from y1 to y2, its point facing `dir` (-1 left, 1 right).
function brace([x, y1, y2]: [number, number, number], dir: number, r: () => number) {
  const m = (y1 + y2) / 2, d = 5 * dir;
  return through([[x, y1], [x + d, y1 + 6], [x + d + r(), m - 10], [x + d * 2.2, m], [x + d + r(), m + 10], [x + d, y2 - 6], [x, y2]]);
}

const TIMES = { arrow: 340, head: 120, loop: 640, under: 380, brace: 460 };

export function compare(before: Side, after: Side) {
  const side = (s: Side, left: boolean) => {
    // Tall enough for the phone and the lowest note (about 13 handwritten characters to a line).
    const H = Math.ceil(Math.max(TOP + (s.h ?? 812) * S, ...s.notes.map((x) => TOP + x.y * S - LINE / 2 + Math.ceil(x.text.length / 13) * LINE)) + 12);
    // The notes go on the outside: left of the "before" phone, right of the "after" one.
    const px = left ? COL + GAP : 0, nx = left ? 0 : PHONE + GAP, edge = left ? COL + 4 : PHONE + GAP - 4;
    const at = ([x, y]: [number, number]): P => [px + x * S, TOP + y * S];
    let ink = '', notes = '', t = 0;
    const stroke = (d: string, kind: keyof typeof TIMES) => {
      ink += `<path class="cmp-ink" d="${d}" pathLength="1" style="--d:${t}ms;--len:${TIMES[kind]}ms"/>`;
      t += TIMES[kind] - 100;
    };
    for (const note of s.notes) {
      const r = seeded(note.text), y = TOP + note.y * S;
      notes += `<p class="cmp-note" style="left:calc(${nx} * var(--u));top:calc(${n(y - LINE / 2)} * var(--u));--d:${t}ms">${note.text}</p>`;
      t += 140;
      if (note.to) {
        const a = arrow([edge, y], at(note.to), note.bend ?? -8, r);
        stroke(a.shaft, 'arrow');
        stroke(a.head, 'head');
      }
      if (note.loop) {
        const [x, ly, w, h] = note.loop;
        stroke(loop([px + x * S, TOP + ly * S, w * S, h * S], r), 'loop');
      }
      if (note.under) stroke(under([px + note.under[0] * S, px + note.under[1] * S, TOP + note.under[2] * S], r), 'under');
      if (note.brace) stroke(brace([px + note.brace[0] * S, TOP + note.brace[1] * S, TOP + note.brace[2] * S], left ? -1 : 1, r), 'brace');
      t += 60;
    }
    return `<div class="cmp-g${left ? ' cmp-l' : ''}" data-dur="${t}">
      <div class="cmp-in" style="height:calc(${H} * var(--u))">
        ${s.tag ? `<span class="cmp-tag" style="left:calc(${px} * var(--u))">${s.tag}</span>` : ''}
        <div class="cmp-phone" style="left:calc(${px} * var(--u));top:calc(${TOP} * var(--u))"><img src="${s.src}" alt="${s.alt || ''}" loading="lazy" width="${s.w || 375}" height="${s.h || 812}" /></div>
        <svg class="cmp-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${ink}</svg>
        ${notes}
      </div>
    </div>`;
  };
  return `<div class="cmp">${side(before, true)}${side(after, false)}</div>`;
}

/*
  A row of screens with handwritten captions under them, each screen's point circled or underlined in
  the same pen. Each screen is its own box, drawn in the screen's units (375 wide), so desktop's row of
  four and a phone's two-by-two show them at the same size. The notes and strokes write themselves in
  as the before-and-after's do.
*/
export type Marked = Screen & {
  cap: string;
  /** Circle this box on the screen: x, y, w, h. */
  loop?: [number, number, number, number];
  /** Underline on the screen: x1, x2, y. */
  under?: [number, number, number];
};

export function marked(items: Marked[]) {
  return `<div class="mk" style="--n:${items.length}">${items.map((it) => {
    const r = seeded(it.cap);
    let ink = '', t = 140;
    const stroke = (d: string, kind: keyof typeof TIMES) => {
      ink += `<path class="cmp-ink" d="${d}" pathLength="1" style="--d:${t}ms;--len:${TIMES[kind]}ms"/>`;
      t += TIMES[kind] - 100;
    };
    if (it.loop) stroke(loop(it.loop, r, 14), 'loop');
    if (it.under) stroke(under(it.under, r), 'under');
    return `<div class="cmp-g mk-g" data-dur="${t + 60}">
      <div class="mk-phone"><img src="${it.src}" alt="${it.alt || ''}" loading="lazy" width="${it.w || 375}" height="${it.h || 812}" />
        <svg class="cmp-svg" viewBox="0 0 375 812" aria-hidden="true">${ink}</svg></div>
      <p class="cmp-note mk-note" style="--d:0ms">${it.cap}</p>
    </div>`;
  }).join('')}</div>`;
}
