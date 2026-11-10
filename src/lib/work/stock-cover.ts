/*
  Halal stocks' cover: Dangote Cement's page on an iPhone Air, over a green slope from Pexels (Nicole Weiser),
  stepping through its seven ranges the way the app does. The still parts of the screen are Figma's own
  outlined vectors (screen.svg); the line and the range row are drawn here from the app's code
  (halvest-tokens, packages/app and packages/ui):
  - each range's line is seriesFor('dangcem', range) from stockDetail.ts, drawn as wealth.ts draws it,
    and takes the colour of its own move (stock-cover-data.ts, generated);
  - a new range retracts the line over 240ms, swaps it, and traces it back over 640ms with the fill
    wiped in behind its leading edge (LineChart);
  - the pill is two edges on two springs, the edge in front on Mint's snap and the one behind on its
    default, with its own white copy of the words clipped by it (RangePicker).
  The screen is laid out in the frame's 375-wide units (--u) and the phone in the cover's height, so
  the same markup fits the 4:3 card and the case study's 16:9 header.
*/
import { SK_CELLS, SK_LEAD, SK_SERIES, SK_TRAIL, type Range } from './stock-cover-data';

const SRC = '/assets/halvest/stocks/cover/';
const GAIN = '#3dd68c', LOSS = '#ff949d';   // data/gain and data/loss, dark
export const SK_ORDER: Range[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'All'];

const words = (fill: string) => SK_CELLS.map((c) =>
  `<svg style="left:calc(${+(c.x + (c.w - c.gw) / 2).toFixed(2)} * var(--u));top:calc(${+(16 - c.gh / 2).toFixed(2)} * var(--u));width:calc(${c.gw} * var(--u))" viewBox="0 0 ${c.gw} ${c.gh}"><path d="${c.d}" fill="${fill}"/></svg>`).join('');

// The chart's fill and wipe are referenced by id, so each copy of the cover gets its own.
let copies = 0;

export function stockCover() {
  const s = SK_SERIES['1D'], c = SK_CELLS[0], id = `sk${++copies}`;
  return `<div class="sk">
    <img class="sk-bg" src="${SRC}slope.webp" alt="" />
    <div class="sk-phone">
      <div class="sk-screen">
        <img class="sk-still" src="${SRC}screen.svg" alt="" />
        <svg class="sk-chart" viewBox="0 0 375 220" style="color:${s.up ? GAIN : LOSS}">
          <defs>
            <linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0.28"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient>
            <clipPath id="${id}-wipe"><rect class="sk-wipe" width="375" height="220"/></clipPath>
          </defs>
          <path class="sk-area" d="${s.area}" fill="url(#${id}-fill)" clip-path="url(#${id}-wipe)"/>
          <path class="sk-line" d="${s.line}" pathLength="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 1" stroke-dashoffset="0"/>
        </svg>
        <div class="sk-range" style="--sk-l:${c.x};--sk-r:${c.x + c.w}">
          <div class="sk-words">${words('#EBEAED')}</div>
          <i class="sk-pill"></i>
          <div class="sk-words on">${words('#fff')}</div>
        </div>
      </div>
      <img class="sk-frame" src="${SRC}iphone-air.webp" alt="" />
    </div>
  </div>`;
}

/* ---------- the moves (run by the stocksLive reel) ---------- */

// A cubic-bezier as a function of time, for the moves that have to drive two things from one value.
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (at(m, x1, x2) < x) lo = m; else hi = m; }
    return at((lo + hi) / 2, y1, y2);
  };
}
const ENTER = bezier(0.05, 0.2, 0.5, 1);    // CURVES.in, Mint's enter: the line drawing
const IN_QUAD = (t: number) => t * t;       // Easing.in(Easing.quad): the line retracting
const DRAW = 640, ERASE = 240;              // LENGTHS.draw, LENGTHS.erase

const frame = () => new Promise<number>((res) => requestAnimationFrame(res));
async function tween(ms: number, alive: () => boolean, onFrame: (t: number) => void) {
  const t0 = performance.now();
  for (;;) {
    if (!alive()) return;
    const t = Math.min(1, (performance.now() - t0) / ms);
    onFrame(t);
    if (t === 1) return;
    await frame();
  }
}

type Chart = { svg: SVGSVGElement; line: SVGPathElement; area: SVGPathElement; wipe: SVGRectElement; xs: number[] };
const chartOf = (root: HTMLElement): Chart => {
  const svg = root.querySelector<SVGSVGElement>('.sk-chart')!;
  return { svg, line: svg.querySelector('.sk-line')!, area: svg.querySelector('.sk-area')!, wipe: svg.querySelector('.sk-wipe')!, xs: [] };
};
// Where the leading edge is along x at each fraction of the line's length, so the fill stays welded to it.
function measure(c: Chart) {
  const total = c.line.getTotalLength();
  c.xs = Array.from({ length: 121 }, (_, i) => c.line.getPointAtLength((i / 120) * total).x);
}
function show(c: Chart, drawn: number) {
  const f = Math.max(0, Math.min(1, drawn)) * 120, i = Math.floor(f), x = c.xs[i] + ((c.xs[Math.min(120, i + 1)] ?? c.xs[i]) - c.xs[i]) * (f - i);
  c.line.setAttribute('stroke-dashoffset', String(1 - drawn));
  c.wipe.setAttribute('width', String(drawn >= 1 ? 375 : x));
}
function put(c: Chart, range: Range) {
  const s = SK_SERIES[range];
  c.line.setAttribute('d', s.line);
  c.area.setAttribute('d', s.area);
  c.svg.style.color = s.up ? GAIN : LOSS;
  measure(c);
}

/** Straight to a range, nothing moving: where every loop starts. */
export function skSet(root: HTMLElement, range: Range) {
  const c = chartOf(root), cell = SK_CELLS.find((x) => x.label === range)!, row = root.querySelector<HTMLElement>('.sk-range')!;
  row.getAnimations().forEach((a) => a.cancel());
  row.style.setProperty('--sk-l', String(cell.x));
  row.style.setProperty('--sk-r', String(cell.x + cell.w));
  put(c, range);
  show(c, 1);
}

/** A tap on a range: the pill travels on its two springs while the line retracts, swaps and draws in. */
export async function skStep(root: HTMLElement, from: Range, to: Range, alive: () => boolean) {
  const row = root.querySelector<HTMLElement>('.sk-range')!, c = chartOf(root);
  const a = SK_CELLS.find((x) => x.label === from)!, b = SK_CELLS.find((x) => x.label === to)!;
  const right = b.x > a.x;
  const edge = (prop: '--sk-l' | '--sk-r', v0: number, v1: number, lead: boolean) => {
    row.style.setProperty(prop, String(v1));
    const s = lead ? SK_LEAD : SK_TRAIL;
    row.animate([{ [prop]: String(v0) }, { [prop]: String(v1) }], { duration: s.ms, easing: s.easing, fill: 'backwards' });
  };
  edge('--sk-r', a.x + a.w, b.x + b.w, right);
  edge('--sk-l', a.x, b.x, !right);
  await tween(ERASE, alive, (t) => show(c, 1 - IN_QUAD(t)));
  if (!alive()) return;
  put(c, to);
  await tween(DRAW, alive, (t) => show(c, ENTER(t)));
}
