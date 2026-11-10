/* Live blocks in case studies. Each mounts into its element and returns a cleanup. */

/** Vest's rolling number, rebuilt for the web from its doc card: changed digits rise out of a blur, left to right. */
function rolling(el: HTMLElement) {
  el.innerHTML = '<div class="roll-stage"><div class="roll" aria-hidden="true"></div></div><p class="roll-note">Live, rebuilt for this page from the doc card: changed digits rise out of a blur, left to right.</p>';
  const roll = el.querySelector<HTMLElement>('.roll')!;
  const values = ['81,240,110.50', '81,240,560.71', '81,241,020.10', '81,240,987.35'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  const draw = (v: string) => { roll.innerHTML = '<span>₦</span>' + [...v].map((ch) => `<span class="slot"><span>${ch}</span></span>`).join(''); };
  draw(values[0]);
  const step = () => {
    const from = values[i], to = values[(i = (i + 1) % values.length)];
    const slots = roll.querySelectorAll('.slot');
    let n = 0;
    [...to].forEach((ch, k) => {
      if (from[k] === ch) return;
      const slot = slots[k], old = slot.firstElementChild as HTMLElement;
      if (reduce) { old.textContent = ch; return; }
      old.classList.add('old');
      const neu = document.createElement('span');
      neu.textContent = ch;
      slot.appendChild(neu);
      const delay = n++ * 45;
      old.animate([{ transform: 'none', filter: 'blur(0)', opacity: 1 }, { transform: 'translateY(-38%) rotateX(55deg)', filter: 'blur(4px)', opacity: 0 }],
        { duration: 260, delay, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }).finished.then(() => old.remove(), () => {});
      neu.animate([{ transform: 'translateY(45%) rotateX(-55deg)', filter: 'blur(5px)', opacity: 0 }, { transform: 'none', filter: 'blur(0)', opacity: 1 }],
        { duration: 540, delay, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)', fill: 'backwards' });
    });
  };
  // Only roll while it's on screen.
  let timer: ReturnType<typeof setInterval> | undefined;
  const io = new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = setInterval(step, 2400);
  }, { threshold: 0.4 });
  io.observe(el);
  return () => { io.disconnect(); clearInterval(timer); };
}

/*
  A row of six screens sliding by, rebuilt from the v1 app's Jitter export (960×720, 30fps) by measuring it
  frame by frame. Cards are the 375×812 screens at half size, 252px apart, centred on #dddfe1. Every step
  the row moves one card left, each card 1.55 frames after the one on its left. EASE is the measured curve
  itself. The same motion plays the v1 app (Mobile) and the stock journey (Stocks).
*/
const screens = (dir: string, names: string[]) => names.map((s) => `/assets/halvest/${dir}/slider/${s}.webp`);
const EASE = 'linear(0, 0.0007, 0.0016, 0.0058, 0.0128, 0.0229, 0.0362, 0.0547, 0.0798, 0.1132, 0.1577, 0.2156, 0.2865, 0.3627, 0.4347, 0.4986, 0.5531, 0.6, 0.6407, 0.6762, 0.7077, 0.7351, 0.7602, 0.7828, 0.8029, 0.822, 0.8383, 0.854, 0.8677, 0.8804, 0.8923, 0.9032, 0.9133, 0.9229, 0.9318, 0.9397, 0.9466, 0.9531, 0.9594, 0.9647, 0.9697, 0.9744, 0.9793, 0.9826, 0.986, 0.9889, 0.9921, 0.994, 0.9962, 0.998, 1)';
const PITCH = 35, MOVE = 1667, STEP = 2144, STAGGER = 51.7;   // cqh (252 of 720px), ms

const slider = (slides: string[]) => (el: HTMLElement) => {
  el.innerHTML = `<div class="slider" aria-hidden="true">${slides.map((src) => `<img src="${src}" alt="" width="375" height="812" />`).join('')}</div>`;
  const cards = [...el.querySelectorAll<HTMLImageElement>('.slider img')];
  const easing = CSS.supports('transition-timing-function', EASE) ? EASE : 'cubic-bezier(0.35, 0, 0.08, 1)';
  const at = (slot: number) => `translateX(${slot * PITCH}cqh)`;
  // The first card starts at the left edge with the third in the middle, as the video opens; slot 3 waits off the right edge.
  let slots = cards.map((_, i) => i - 2);
  cards.forEach((c, i) => (c.style.transform = at(slots[i])));
  const step = () => {
    slots = slots.map((s) => (s < -2 ? 3 : s));   // the card that left on the left comes round to the right
    cards.forEach((c, i) => {
      const from = slots[i];
      c.style.transform = at(from - 1);
      c.animate([{ transform: at(from) }, { transform: at(from - 1) }], { duration: MOVE, delay: (from + 2) * STAGGER, easing, fill: 'backwards' });
    });
    slots = slots.map((s) => s - 1);
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  // Only move while it's on screen.
  let timer: ReturnType<typeof setInterval> | undefined;
  const io = new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = setInterval(step, STEP);
  }, { threshold: 0.4 });
  io.observe(el);
  return () => { io.disconnect(); clearInterval(timer); cards.forEach((c) => c.getAnimations().forEach((a) => a.cancel())); };
};

/* ---------- flows, played like screen recordings: a phone in a room, with pause and replay ---------- */

const PF = '/assets/halvest/stocks/flow/';
const SHEET = 'cubic-bezier(0.32, 0.72, 0, 1)', FLIP = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

type Stop = [number, Record<string, string | number>, string?];
// Keyframes from [time, values, easing of the move that starts there], across the whole loop.
const track = (loop: number, stops: Stop[]): Keyframe[] => stops.map(([t, v, easing]) => ({ offset: t / loop, ...v, ...(easing ? { easing } : {}) }));

const ICON = {
  pause: '<svg viewBox="0 0 16 16"><rect x="4" y="3" width="2.6" height="10" rx="1" fill="currentColor"/><rect x="9.4" y="3" width="2.6" height="10" rx="1" fill="currentColor"/></svg>',
  play: '<svg viewBox="0 0 16 16"><path d="M5 3.4v9.2a.6.6 0 0 0 .9.5l7.3-4.6a.6.6 0 0 0 0-1L5.9 2.9a.6.6 0 0 0-.9.5Z" fill="currentColor"/></svg>',
  replay: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5"/><path d="M3 2.6v2.6h2.6"/></svg>',
  expand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.8h3.7v3.7M6.5 13.2H2.8V9.5M13.2 2.8 9 7M2.8 13.2 7 9"/></svg>',
};

// The room, the phone (screen in the frame's 375-wide units), and the controls.
const stage = (label: string, screen: string, cls = '', room = `${PF}interior.webp`) => `
    <img class="fl-bg" src="${room}" alt="" />
    <div class="fl-phone">
      <div class="fl-screen ${cls}" role="img" aria-label="${label}">${screen}</div>
      <img class="fl-frame" src="/assets/halvest/stocks/cover/iphone-air.webp" alt="" />
    </div>
    <div class="fl-controls">
      <button type="button" class="fl-expand" aria-label="View up close">${ICON.expand}</button>
      <button type="button" class="fl-toggle" aria-label="Pause">${ICON.pause}</button>
      <button type="button" class="fl-replay" aria-label="Play from the start">${ICON.replay}</button>
    </div>`;

// A touch, at [x, y] in screen units: it lands a beat before the change, presses, and lifts. A drag
// lands, travels to [x, y2] over `drag` ms, then lifts where it let go.
type Touch = { x: number; y: number; t: number; y2?: number; drag?: number };
const dot = (d: Touch) => `<i class="fl-dot" style="left:calc(${d.x} * var(--u));top:calc(${d.y} * var(--u))"></i>`;
function touch(el: HTMLElement, d: Touch, loop: number) {
  const at = (scale: number, opacity: number, dy = 0) => ({ opacity, transform: `translate(-50%, -50%) translateY(${(dy / 42) * 100}%) scale(${scale})` });
  if (d.drag && d.y2 !== undefined) {
    const dy = d.y2 - d.y, end = d.t + d.drag;
    return el.animate(track(loop, [[0, at(0.6, 0)], [d.t - 160, at(0.6, 0), 'ease-out'], [d.t, at(1, 1), 'linear'], [end, at(1, 1, dy), 'ease-out'], [end + 220, at(1.05, 0, dy)], [loop, at(1.05, 0, dy)]]), { duration: loop, iterations: Infinity });
  }
  return el.animate(track(loop, [[0, at(0.6, 0)], [d.t - 160, at(0.6, 0), 'ease-out'], [d.t, at(1, 1), 'ease-in-out'], [d.t + 110, at(0.86, 1), 'ease-out'], [d.t + 360, at(1.05, 0)], [loop, at(1.05, 0)]]), { duration: loop, iterations: Infinity });
}

// Plays while on screen, unless paused by hand; reduced motion starts paused on the first frame.
function player(el: HTMLElement, anims: Animation[]) {
  const toggle = el.querySelector<HTMLButtonElement>('.fl-toggle')!;
  let held = matchMedia('(prefers-reduced-motion: reduce)').matches, seen = false;
  const sync = () => {
    anims.forEach((a) => (seen && !held ? a.play() : a.pause()));
    toggle.innerHTML = held ? ICON.play : ICON.pause;
    toggle.setAttribute('aria-label', held ? 'Play' : 'Pause');
  };
  toggle.addEventListener('click', () => { held = !held; sync(); });
  el.querySelector('.fl-replay')!.addEventListener('click', () => { anims.forEach((a) => (a.currentTime = 0)); held = false; sync(); });
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.4 });
  io.observe(el);
  sync();
  return () => { io.disconnect(); anims.forEach((a) => a.cancel()); };
}

/*
  Purification: the review with purification on, a tap turns it off and the hand-over sheet rises,
  "Keep it on" puts it back, then How purification works opens and closes. The layers are the Figma
  frames (06. Buy · review, · hand over, the two sheets); the timing is the app's: the sheets rise over
  420ms and leave over 280ms on iOS's sheet curve with the scrim following them, and the switch flips as
  the platform's does. One 10s loop, every layer on the same timeline, so pause stops all of it and
  replay rewinds all of it.
*/
const PURIFY_LOOP = 10000;
const PURIFY_TAPS: Touch[] = [{ x: 318, y: 295, t: 1200 }, { x: 187.5, y: 750, t: 3600 }, { x: 103, y: 330, t: 4900 }, { x: 187.5, y: 750, t: 8400 }];

function purify(el: HTMLElement) {
  const LOOP = PURIFY_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('The review screen: purification is switched off, a sheet explains what that hands over, Keep it on switches it back, and How purification works opens the company\'s figures.', `
        <img class="fl-on" src="${PF}review-on.webp" alt="" />
        <img class="fl-off" src="${PF}review-off.webp" alt="" />
        <i class="fl-switch"><i></i></i>
        <i class="fl-scrim"></i>
        <img class="fl-sheet fl-hand" src="${PF}sheet-handover.webp" alt="" />
        <img class="fl-sheet fl-how" src="${PF}sheet-how.webp" alt="" />
        ${PURIFY_TAPS.map(dot).join('')}`);
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const knob = $<HTMLElement>('.fl-switch > i'), sw = $<HTMLElement>('.fl-switch');
  const on = { backgroundColor: '#6935d3' }, off = { backgroundColor: '#1d1924' };
  const opts = { duration: LOOP, iterations: Infinity };
  return player(el, [
    // The note under the switch appears when it goes off, under the sheet; the switch flips over it.
    $<HTMLElement>('.fl-off').animate(tr([[0, { opacity: 0 }], [1250, { opacity: 0 }, 'linear'], [1370, { opacity: 1 }], [3750, { opacity: 1 }, 'linear'], [3870, { opacity: 0 }], [LOOP, { opacity: 0 }]]), opts),
    sw.animate(tr([[0, on], [1200, on, FLIP], [1450, off], [3700, off, FLIP], [3950, on], [LOOP, on]]), opts),
    knob.animate(tr([[0, { transform: 'none' }], [1200, { transform: 'none' }, FLIP], [1450, { transform: 'translateX(-83.333%)' }], [3700, { transform: 'translateX(-83.333%)' }, FLIP], [3950, { transform: 'none' }], [LOOP, { transform: 'none' }]]), opts),
    // The scrim darkens with each sheet's rise and lifts with its fall.
    $<HTMLElement>('.fl-scrim').animate(tr([[0, { opacity: 0 }], [1350, { opacity: 0 }, SHEET], [1770, { opacity: 1 }], [3650, { opacity: 1 }, SHEET], [3930, { opacity: 0 }], [4950, { opacity: 0 }, SHEET], [5370, { opacity: 1 }], [8450, { opacity: 1 }, SHEET], [8730, { opacity: 0 }], [LOOP, { opacity: 0 }]]), opts),
    $<HTMLElement>('.fl-hand').animate(tr([[0, { transform: 'translateY(100%)' }], [1350, { transform: 'translateY(100%)' }, SHEET], [1770, { transform: 'none' }], [3650, { transform: 'none' }, SHEET], [3930, { transform: 'translateY(100%)' }], [LOOP, { transform: 'translateY(100%)' }]]), opts),
    $<HTMLElement>('.fl-how').animate(tr([[0, { transform: 'translateY(100%)' }], [4950, { transform: 'translateY(100%)' }, SHEET], [5370, { transform: 'none' }], [8450, { transform: 'none' }, SHEET], [8730, { transform: 'translateY(100%)' }], [LOOP, { transform: 'translateY(100%)' }]]), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, PURIFY_TAPS[i], LOOP)),
  ]);
}

/*
  Compliance: the stock's page; a tap on its Shariah compliant pill presents the report as iOS presents a
  page sheet (the app's `presentation: 'pageSheet'`): the page shrinks back into a card behind it and the
  report rises over it. A flick scrolls to the related questions, with the momentum a flick leaves; a tap
  on one answers it below the list, and 120ms later the report scrolls to the end (ComplianceScreen's ask).
  The X takes the sheet back down. Layers are cut from the Figma frames (05. Stock, the report and the
  report answered); the status bar and the X float, as the system's and the sheet's bar do, with the
  report fading out under the bar as iOS's scroll edge does.
*/
const CF = `${PF}comply/`;
const COMPLY_LOOP = 11000;
const SHEET_TOP = 60, REPORT_H = 1654;                 // screen units: where the sheet's top rests; the report's length
const AT_QUESTIONS = 725, AT_END = 885;                // how far the report scrolls: to the questions, then to the answer
// A flick's momentum: iOS's deceleration, an exponential settle (time constant ≈ 540ms), as a CSS curve.
const MOMENTUM = `linear(${Array.from({ length: 17 }, (_, i) => +((1 - Math.exp((-2.03 * i) / 16)) / (1 - Math.exp(-2.03))).toFixed(4)).join(', ')})`;
const COMPLY_TOUCHES: Touch[] = [
  { x: 94, y: 297, t: 1000 },                          // the pill
  { x: 205, y: 650, t: 3200, y2: 450, drag: 180 },     // a flick up
  { x: 150, y: SHEET_TOP + (1283 - 58) - AT_QUESTIONS, t: 5000 },   // the first related question
  { x: 334.5, y: SHEET_TOP + 28.5, t: 8400 },          // the X
];

function comply(el: HTMLElement) {
  const LOOP = COMPLY_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('The stock\'s page: its Shariah compliant pill opens the compliance report as a sheet, the report scrolls to its related questions, and one, tapped, answers itself below the list.', `
        <div class="cf-back"><img src="${CF}stock.webp" alt="" /><i class="cf-dim"></i></div>
        <div class="cf-sheet">
          <div class="cf-scroll"><img src="${CF}report.webp" alt="" /><img class="cf-ans" src="${CF}answered.webp" alt="" /></div>
          <i class="cf-edge"></i>
          <img class="cf-close" src="${CF}close.webp" alt="" />
        </div>
        <img class="cf-status" src="${CF}status.webp" alt="" />
        ${COMPLY_TOUCHES.map(dot).join('')}`, 'cf');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const IN = 1100, SHOWN = 1600, OUT = 8500, GONE = 8920;
  // The page behind: 0.92 of its size, its top just under the status bar, corners rounded.
  const front = { transform: 'none', borderRadius: '0% / 0%' }, back = { transform: `translateY(${(48 / 812) * 100}%) scale(0.92)`, borderRadius: '3.47% / 1.6%' };
  const down = { transform: 'translateY(100%)' }, up = { transform: 'none' };
  const scrolled = (y: number) => ({ transform: `translateY(${(-y / REPORT_H) * 100}%)` });
  return player(el, [
    $<HTMLElement>('.cf-back').animate(tr([[0, front], [IN, front, SHEET], [SHOWN, back], [OUT, back, SHEET], [GONE, front], [LOOP, front]]), opts),
    $<HTMLElement>('.cf-dim').animate(tr([[0, { opacity: 0 }], [IN, { opacity: 0 }, SHEET], [SHOWN, { opacity: 1 }], [OUT, { opacity: 1 }, SHEET], [GONE, { opacity: 0 }], [LOOP, { opacity: 0 }]]), opts),
    $<HTMLElement>('.cf-sheet').animate(tr([[0, down], [IN, down, SHEET], [SHOWN, up], [OUT, up, SHEET], [GONE, down], [LOOP, down]]), opts),
    // The finger drags the report 200 up, lets go, and the report carries on to the questions; after the
    // answer it scrolls to the end. Back at the top, unanswered, once the sheet is gone.
    $<HTMLElement>('.cf-scroll').animate(tr([[0, scrolled(0)], [3200, scrolled(0), 'linear'], [3380, scrolled(200), MOMENTUM], [4480, scrolled(AT_QUESTIONS)], [5170, scrolled(AT_QUESTIONS), FLIP], [5500, scrolled(AT_END)], [9000, scrolled(AT_END), 'step-end'], [9020, scrolled(0)], [LOOP, scrolled(0)]]), opts),
    $<HTMLElement>('.cf-ans').animate(tr([[0, { opacity: 0 }], [5040, { opacity: 0 }, 'linear'], [5060, { opacity: 1 }], [9000, { opacity: 1 }, 'step-end'], [9020, { opacity: 0 }], [LOOP, { opacity: 0 }]]), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, COMPLY_TOUCHES[i], LOOP)),
  ]);
}

// The moves the page-and-sheet flows (orders, markets) share, on one loop's timeline.
type Span = [number, number];
function moves(loop: number) {
  const o = (v: number) => ({ opacity: v });
  const x = (v: number) => ({ transform: `translateX(${v}%)` });
  const down = { transform: 'translateY(100%)' }, up = { transform: 'none' };
  return {
    o, x,
    // A layer that shows from `on` and goes at `off`, at once (both while it's out of sight or meant to be sudden).
    between: (on: number, off: number, fade = 1): Stop[] => [[0, o(0)], [on, o(0), 'linear'], [on + fade, o(1)], [off, o(1), 'linear'], [off + 1, o(0)], [loop, o(0)]],
    // A BottomSheet up at each span's start (420ms) and down at its end (280ms), on iOS's sheet curve.
    sheet: (spans: Span[]): Stop[] => [[0, down], ...spans.flatMap(([a, b]): Stop[] => [[a, down, SHEET], [a + 420, up], [b, up, SHEET], [b + 280, down]]), [loop, down]],
    // The scrim under every sheet, following each one.
    scrim: (spans: Span[]): Stop[] => [[0, o(0)], ...[...spans].sort((p, q) => p[0] - q[0]).flatMap(([a, b]): Stop[] => [[a, o(0), SHEET], [a + 420, o(1)], [b, o(1), SHEET], [b + 280, o(0)]]), [loop, o(0)]],
  };
}

/*
  Orders: Buy on the stock's page opens the Order type sheet with nothing chosen; Market closes it and,
  320ms on, the amount screen is pushed (StockScreen's chooseType). The pill under the figure flips it
  to shares, painted at once as AmountField makes a new figure. The pill in the bar reopens the sheet,
  ticked: Recurring changes the pill and, 320ms on, asks how often; Weekly closes that. The pill again,
  then Limit, replaces the amount screen with the limit price (BuyScreen's chooseType), which opens
  empty; −2% sets ₦235.69. Back pops to the stock's page, since Limit replaced the amount. The sheets
  are BottomSheet's 420ms up and 280ms down; pushes and pops are iOS's, approximated as 500ms on the
  same curve with the page behind sliding a third over. Layers are cut from the Figma frames (06. Buy ·
  order type, · amount, · how often, · limit price); the states between them (shares, the pill's
  label, a card ticked, the empty price) are those frames with the app's text and variants set.
*/
const OF = `${PF}orders/`;
const ORDERS_LOOP = 15600;
const PUSH = 500;
const ORDERS_TOUCHES: Touch[] = [
  { x: 99, y: 750, t: 900 },      // Buy
  { x: 187, y: 450, t: 2300 },    // Market
  { x: 187, y: 330, t: 4100 },    // the flip
  { x: 318, y: 85, t: 5400 },     // the pill: Market
  { x: 187, y: 724, t: 6800 },    // Recurring
  { x: 187, y: 559, t: 8500 },    // Weekly
  { x: 318, y: 85, t: 9800 },     // the pill: Weekly
  { x: 187, y: 592, t: 11200 },   // Limit
  { x: 187, y: 400, t: 12600 },   // −2%
  { x: 31, y: 85, t: 14000 },     // back
];

function orders(el: HTMLElement) {
  const LOOP = ORDERS_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('The stock\'s page: Buy opens the order type sheet with nothing chosen. Market opens the amount, which flips between money and shares; the order type in the bar switches it to Recurring, which asks how often, then to Limit, which asks for a price.', `
        <div class="of-page of-stock"><img src="${CF}stock.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page of-amount"><img src="${OF}amount.webp" alt="" />
          <img class="of-strip of-sm" src="${OF}shares-market.webp" alt="" /><img class="of-strip of-sr" src="${OF}shares-recurring.webp" alt="" /><img class="of-strip of-sw" src="${OF}shares-weekly.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page of-limit"><img src="${OF}limit.webp" alt="" /><img class="of-strip of-set" src="${OF}limit-set.webp" alt="" /></div>
        <i class="fl-scrim"></i>
        <div class="of-sheet of-order"><img src="${OF}order-none.webp" alt="" /><img class="of-tick of-om" src="${OF}order-market.webp" alt="" /><img class="of-tick of-or" src="${OF}order-recurring.webp" alt="" /></div>
        <div class="of-sheet of-how"><img src="${OF}how-none.webp" alt="" /><img class="of-tick of-hw" src="${OF}how-weekly.webp" alt="" /></div>
        <img class="cf-status" src="${CF}status.webp" alt="" />
        ${ORDERS_TOUCHES.map(dot).join('')}`, 'of');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const { o, x, between, sheet, scrim } = moves(LOOP);
  // The Order type sheet rises three times: from Buy, and twice from the pill.
  const ORDER: Span[] = [[1000, 2400], [5500, 6850], [9900, 11250]];
  const HOW: Span = [7170, 8550];
  return player(el, [
    // Pages: the amount is pushed over the stock, the limit price replaces it, and back pops to the stock.
    $<HTMLElement>('.of-stock').animate(tr([[0, x(0)], [2720, x(0), SHEET], [2720 + PUSH, x(-30)], [14100, x(-30), SHEET], [14100 + PUSH, x(0)], [LOOP, x(0)]]), opts),
    $<HTMLElement>('.of-stock .of-dim').animate(tr([[0, o(0)], [2720, o(0), SHEET], [2720 + PUSH, o(1)], [14100, o(1), SHEET], [14100 + PUSH, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.of-amount').animate(tr([[0, x(110)], [2720, x(110), SHEET], [2720 + PUSH, x(0)], [11250, x(0), SHEET], [11250 + PUSH, x(-30)], [11800, x(-30), 'linear'], [11801, x(110)], [LOOP, x(110)]]), opts),
    $<HTMLElement>('.of-amount .of-dim').animate(tr([[0, o(0)], [11250, o(0), SHEET], [11250 + PUSH, o(1)], [11800, o(1), 'linear'], [11801, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.of-limit').animate(tr([[0, x(110)], [11250, x(110), SHEET], [11250 + PUSH, x(0)], [14100, x(0), SHEET], [14100 + PUSH, x(110)], [LOOP, x(110)]]), opts),
    // What changes in place: the flip, the pill's label, the price.
    $<HTMLElement>('.of-sm').animate(tr(between(4150, 11800)), opts),
    $<HTMLElement>('.of-sr').animate(tr(between(6850, 11800)), opts),
    $<HTMLElement>('.of-sw').animate(tr(between(8550, 11800)), opts),
    $<HTMLElement>('.of-set').animate(tr(between(12650, 14700, 200)), opts),
    // Sheets, their ticks, and the scrim under each.
    $<HTMLElement>('.fl-scrim').animate(tr(scrim([...ORDER, HOW])), opts),
    $<HTMLElement>('.of-order').animate(tr(sheet(ORDER)), opts),
    $<HTMLElement>('.of-how').animate(tr(sheet([HOW])), opts),
    $<HTMLElement>('.of-om').animate(tr(between(5000, 12000)), opts),
    $<HTMLElement>('.of-or').animate(tr(between(6850, 12000)), opts),
    $<HTMLElement>('.of-hw').animate(tr(between(8550, 9500)), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, ORDERS_TOUCHES[i], LOOP)),
  ]);
}

/*
  Across markets: Apple's page; Buy, the Order type sheet, Market, and the amount screen is pushed (as in
  orders). A US name pays from the dollar wallet unless changed (BuyScreen, walletFor): the wallet row opens
  Pay from, and Naira wallet switches it there and then. Buy pushes the review, now a naira order with the
  rate (BuyReviewScreen's cross-currency line) and, the market being closed, a card saying when it fills
  and Queue order. A flick scrolls the review between its fixed bar and pinned footer; Edit amount goes
  back, and back again to Apple's page. Layers are cut from the Figma frames (05 · Stock · US name, market
  closed; 06 · Buy · pay from; 06 · Buy · review · US name from naira, market closed); the amount screen for
  Apple is 06. Buy · amount with the app's values for AAPL, and Pay from has the lines the app writes for a
  dollar stock.
*/
const MF = `${PF}markets/`;
const MARKETS_LOOP = 13800;
const REVIEW_END = 243;     // the review body's travel between its bar and its footer
const MARKETS_TOUCHES: Touch[] = [
  { x: 99, y: 749, t: 900 },                       // Buy
  { x: 187, y: 450, t: 2300 },                     // Market
  { x: 187, y: 392, t: 4100 },                     // the wallet row
  { x: 187, y: 650, t: 5500 },                     // Naira wallet
  { x: 187, y: 752, t: 6800 },                     // Buy
  { x: 205, y: 600, t: 8300, y2: 480, drag: 180 }, // a flick up the review
  { x: 187, y: 753, t: 10700 },                    // Edit amount
  { x: 31, y: 85, t: 12000 },                      // back
];

function markets(el: HTMLElement) {
  const LOOP = MARKETS_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('Apple\'s page: Buy, then Market. The amount pays from the dollar wallet; Pay from switches it to the naira wallet, and the review shows the rate and, with New York closed, queues the order and says when it fills.', `
        <div class="of-page of-stock"><img src="${MF}stock.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page of-amount"><img src="${MF}amount.webp" alt="" /><img class="of-strip mf-ngn" src="${MF}amount-ngn.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page mf-review"><img class="mf-body" src="${MF}review-body.webp" alt="" /><img class="mf-bar" src="${MF}review-bar.webp" alt="" /><i class="mf-edge"></i><img class="mf-foot" src="${MF}review-foot.webp" alt="" /></div>
        <i class="fl-scrim"></i>
        <div class="of-sheet of-order"><img src="${OF}order-none.webp" alt="" /></div>
        <div class="of-sheet mf-pay"><img src="${MF}pay-usd.webp" alt="" /><img class="of-tick mf-paid" src="${MF}pay-ngn.webp" alt="" /></div>
        <img class="cf-status" src="${CF}status.webp" alt="" />
        ${MARKETS_TOUCHES.map(dot).join('')}`, 'of');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const { o, x, between, sheet, scrim } = moves(LOOP);
  const ORDER: Span = [1000, 2400], PAY: Span = [4200, 5550];
  const scrolled = (y: number) => ({ transform: `translateY(${(-y / 773) * 100}%)` });
  return player(el, [
    // Pages: the amount over Apple, the review over the amount, then back twice.
    $<HTMLElement>('.of-stock').animate(tr([[0, x(0)], [2720, x(0), SHEET], [2720 + PUSH, x(-30)], [12100, x(-30), SHEET], [12100 + PUSH, x(0)], [LOOP, x(0)]]), opts),
    $<HTMLElement>('.of-stock .of-dim').animate(tr([[0, o(0)], [2720, o(0), SHEET], [2720 + PUSH, o(1)], [12100, o(1), SHEET], [12100 + PUSH, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.of-amount').animate(tr([[0, x(110)], [2720, x(110), SHEET], [2720 + PUSH, x(0)], [6900, x(0), SHEET], [6900 + PUSH, x(-30)], [10800, x(-30), SHEET], [10800 + PUSH, x(0)], [12100, x(0), SHEET], [12100 + PUSH, x(110)], [LOOP, x(110)]]), opts),
    $<HTMLElement>('.of-amount .of-dim').animate(tr([[0, o(0)], [6900, o(0), SHEET], [6900 + PUSH, o(1)], [10800, o(1), SHEET], [10800 + PUSH, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.mf-review').animate(tr([[0, x(110)], [6900, x(110), SHEET], [6900 + PUSH, x(0)], [10800, x(0), SHEET], [10800 + PUSH, x(110)], [LOOP, x(110)]]), opts),
    // The wallet switches as it's chosen; everything resets once it's out of sight.
    $<HTMLElement>('.mf-ngn').animate(tr(between(5550, 12700)), opts),
    // The finger drags the review 120 up and lets go; it carries on to the footer.
    $<HTMLElement>('.mf-body').animate(tr([[0, scrolled(0)], [8300, scrolled(0), 'linear'], [8480, scrolled(120), MOMENTUM], [9300, scrolled(REVIEW_END)], [12700, scrolled(REVIEW_END), 'linear'], [12701, scrolled(0)], [LOOP, scrolled(0)]]), opts),
    // Sheets, the wallet's tick, and the scrim under each.
    $<HTMLElement>('.fl-scrim').animate(tr(scrim([ORDER, PAY])), opts),
    $<HTMLElement>('.of-order').animate(tr(sheet([ORDER])), opts),
    $<HTMLElement>('.mf-pay').animate(tr(sheet([PAY])), opts),
    $<HTMLElement>('.mf-paid').animate(tr(between(5550, 6500)), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, MARKETS_TOUCHES[i], LOOP)),
  ]);
}

/*
  Mobile · Running short: the amount to invest, then Review Investment, and the wallet can't cover it. The
  "Not enough funds" sheet rises; Fund my wallet grows it into the bank transfer details, on the same page;
  "I have made the transfer" closes it, and the review is pushed. Back returns to the amount. The layers are
  the v1.1 frames in the Not Enough Funds section, with the account holder and number blurred. There's no
  v1 code to time it from, so the sheets move as the file's own prototype links do (Smart Animate,
  ease-in-out, 450ms) and the push is iOS's, as in the Stocks flows. The file's next two sheets, confirming
  the transfer and "Funding Successful", still have placeholder copy, so they're left out.
*/
const MS = '/assets/halvest/mobile/flow/short/';
// The Mobile flows' own room: lavender on a white table, blurred (Pexels 4857869, by Vie Studio), lighter than
// Stocks' interior to sit behind the v1 app's light screens.
const LILAC = '/assets/halvest/mobile/flow/lavender.webp';
const V1 = 'cubic-bezier(0.42, 0, 0.58, 1)', V1_MS = 450;
const SHORT_LOOP = 9200;
const SHORT_TOUCHES: Touch[] = [
  { x: 187, y: 752, t: 900 },     // Review Investment
  { x: 187, y: 752, t: 2400 },    // Fund my wallet
  { x: 187, y: 759, t: 4400 },    // I have made the transfer
  { x: 28, y: 68, t: 7300 },      // back
];

function short(el: HTMLElement) {
  const LOOP = SHORT_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('Investing ₦5,000,000 with too little in the wallet: a sheet says so and offers to fund it, grows into the bank transfer details without leaving the page, and once the transfer is made the investment goes on to review.', `
        <div class="of-page ms-amount"><img src="${MS}amount.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page ms-review"><img src="${MS}review.webp" alt="" /></div>
        <i class="ms-scrim"></i>
        <div class="ms-sheet"><img class="ms-transfer" src="${MS}transfer.webp" alt="" /><img class="ms-short" src="${MS}short.webp" alt="" /></div>
        <img class="cf-status" src="${MS}status.webp" alt="" />
        ${SHORT_TOUCHES.map(dot).join('')}`, 'ms', LILAC);
  el.classList.add('fl-lilac');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const { o, x } = moves(LOOP);
  const UP = 1000, GROW = 2500, DOWN = 4500, PUSH_AT = 5100, POP_AT = 7400;
  const down = { transform: 'translateY(100%)' }, up = { transform: 'none' };
  // The transfer sheet is the short one grown upward: shown from the short one's height, then all of it.
  const clip = (top: number) => ({ clipPath: `inset(${top}% 0 0 0 round 4.27% 4.27% 0 0 / 2.36% 2.36% 0 0)` });
  const SMALL = ((677 - 374) / 677) * 100;
  return player(el, [
    $<HTMLElement>('.ms-sheet').animate(tr([[0, down], [UP, down, V1], [UP + V1_MS, up], [DOWN, up, V1], [DOWN + V1_MS, down], [LOOP, down]]), opts),
    $<HTMLElement>('.ms-scrim').animate(tr([[0, o(0)], [UP, o(0), V1], [UP + V1_MS, o(1)], [DOWN, o(1), V1], [DOWN + V1_MS, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.ms-transfer').animate(tr([[0, { ...clip(SMALL), opacity: 0 }], [GROW, { ...clip(SMALL), opacity: 0 }, 'linear'], [GROW + 1, { ...clip(SMALL), opacity: 1 }, V1], [GROW + V1_MS, { ...clip(0), opacity: 1 }], [DOWN + V1_MS + 100, { ...clip(0), opacity: 1 }, 'linear'], [DOWN + V1_MS + 101, { ...clip(SMALL), opacity: 0 }], [LOOP, { ...clip(SMALL), opacity: 0 }]]), opts),
    $<HTMLElement>('.ms-short').animate(tr([[0, o(1)], [GROW, o(1), V1], [GROW + 220, o(0)], [DOWN + V1_MS + 100, o(0), 'linear'], [DOWN + V1_MS + 101, o(1)], [LOOP, o(1)]]), opts),
    // The review is pushed over the amount, and back pops it.
    $<HTMLElement>('.ms-amount').animate(tr([[0, x(0)], [PUSH_AT, x(0), SHEET], [PUSH_AT + PUSH, x(-30)], [POP_AT, x(-30), SHEET], [POP_AT + PUSH, x(0)], [LOOP, x(0)]]), opts),
    $<HTMLElement>('.ms-amount .of-dim').animate(tr([[0, o(0)], [PUSH_AT, o(0), SHEET], [PUSH_AT + PUSH, o(1)], [POP_AT, o(1), SHEET], [POP_AT + PUSH, o(0)], [LOOP, o(0)]]), opts),
    $<HTMLElement>('.ms-review').animate(tr([[0, x(110)], [PUSH_AT, x(110), SHEET], [PUSH_AT + PUSH, x(0)], [POP_AT, x(0), SHEET], [POP_AT + PUSH, x(110)], [LOOP, x(110)]]), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, SHORT_TOUCHES[i], LOOP)),
  ]);
}

/*
  Mobile · Funding: the dollar wallet's account details, grouped by where the money is sent from. Nigeria
  opens to its instruction (email support for the details); the US opens to its fee and the bank details,
  closing Nigeria as it goes; a copy shows the toast; the US closes again. The page is the v1.1 frames in
  "Wallets - Add Money" (all closed, Nigeria open, the US open) cut at the rows they share, so each route's
  content unrolls under its header while the rows below slide, as the accordion does. The account number,
  routing number and address are blurred. Timing as Running short: the file's Smart Animate, ease-in-out,
  450ms; the toast is the Naira frame's.
*/
const MF2 = '/assets/halvest/mobile/flow/funding/';
const FUND_LOOP = 9000;
const NG_H = 176, US_H = 460;     // how far each route's content pushes the rows below it
const FUND_TOUCHES: Touch[] = [
  { x: 187, y: 270, t: 900 },             // Sending from Nigeria
  { x: 187, y: 343 + NG_H, t: 2600 },     // Sending from the US, pushed down by Nigeria
  { x: 329, y: 589, t: 4300 },            // copy the account number
  { x: 187, y: 343, t: 7100 },            // Sending from the US, to close it
];

function fund(el: HTMLElement) {
  const LOOP = FUND_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('The dollar wallet\'s account details, grouped by where the money comes from: Sending from Nigeria opens to an instruction to email support; Sending from the US opens to its fee and the bank details, which copy with a tap.', `
        <div class="of-page fa">
          <img class="fa-top" src="${MF2}top.webp" alt="" />
          <img class="fa-ng" src="${MF2}ng.webp" alt="" />
          <img class="fa-us" src="${MF2}us.webp" alt="" />
          <div class="fa-mid"><img src="${MF2}mid.webp" alt="" /><img class="fa-ushead" src="${MF2}us-head.webp" alt="" /></div>
          <img class="fa-bottom" src="${MF2}bottom.webp" alt="" />
        </div>
        <img class="fa-toast" src="${MF2}toast.webp" alt="" />
        <img class="cf-status" src="${MS}status.webp" alt="" />
        ${FUND_TOUCHES.map(dot).join('')}`, 'ms', LILAC);
  el.classList.add('fl-lilac');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const { o } = moves(LOOP);
  const NG = 1000, SWITCH = 2700, CLOSE = 7200, TOAST = 4400, TOAST_OFF = 6000;
  // A layer `h` tall moved down by `by`; a route's content shown to fraction `f` of its height, from the top.
  const shift = (h: number, by: number) => ({ transform: `translateY(${(by / h) * 100}%)` });
  const shown = (f: number) => ({ clipPath: `inset(0 0 ${(1 - f) * 100}% 0)` });
  // Nigeria opens, the US opens as Nigeria closes, then the US closes: one move each, on the file's curve.
  const at = (v: (n: 0 | 1, u: 0 | 1) => Keyframe): Stop[] => [[0, v(0, 0)], [NG, v(0, 0), V1], [NG + V1_MS, v(1, 0)], [SWITCH, v(1, 0), V1], [SWITCH + V1_MS, v(0, 1)], [CLOSE, v(0, 1), V1], [CLOSE + V1_MS, v(0, 0)], [LOOP, v(0, 0)]] as Stop[];
  return player(el, [
    $<HTMLElement>('.fa-ng').animate(tr(at((n) => shown(n))), opts),
    $<HTMLElement>('.fa-mid').animate(tr(at((n) => shift(70, n * NG_H))), opts),
    $<HTMLElement>('.fa-ushead').animate(tr(at((_, u) => o(u))), opts),
    $<HTMLElement>('.fa-us').animate(tr(at((n, u) => ({ ...shift(US_H, n * NG_H), ...shown(u) }))), opts),
    $<HTMLElement>('.fa-bottom').animate(tr(at((n, u) => shift(444, n * NG_H + u * US_H))), opts),
    // The toast drops in under the status bar, and goes.
    $<HTMLElement>('.fa-toast').animate(tr([[0, { transform: 'translateY(-160%)', opacity: 0 }], [TOAST, { transform: 'translateY(-160%)', opacity: 0 }, V1], [TOAST + 400, { transform: 'none', opacity: 1 }], [TOAST_OFF, { transform: 'none', opacity: 1 }, V1], [TOAST_OFF + 350, { transform: 'translateY(-160%)', opacity: 0 }], [LOOP, { transform: 'translateY(-160%)', opacity: 0 }]]), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, FUND_TOUCHES[i], LOOP)),
  ]);
}

/*
  Mobile · Onboarding: the last step of first-time setup, biometric login; Setup lets you in, and Home shows
  how far along you are (1 of 5). Its card opens the Account Checklist, where each step says how long it
  takes; Verify my BVN opens the BVN screen, which says why it's needed before you give it. Back, back,
  and setup comes round again. The layers are the v1.1 frames (First time Setups, the unverified Home, the
  checklist, Verification · Enter your BVN, whose number is the file's sample). The setup screen is a modal,
  so it slides away and back; pushes and pops are as in the other flows.
*/
const MO = '/assets/halvest/mobile/flow/onboard/';
const ONBOARD_LOOP = 10400;
const ONBOARD_TOUCHES: Touch[] = [
  { x: 187, y: 686, t: 900 },     // Setup
  { x: 187, y: 165, t: 2400 },    // Verify your account info
  { x: 187, y: 288, t: 3900 },    // Verify my BVN
  { x: 33, y: 68, t: 6200 },      // back, to the checklist
  { x: 33, y: 68, t: 7500 },      // back, to Home
];

function onboard(el: HTMLElement) {
  const LOOP = ONBOARD_LOOP, tr = (stops: Stop[]) => track(LOOP, stops);
  el.innerHTML = stage('First-time setup offers biometric login, then you\'re in: Home shows you\'re one step of five along, its card opens the account checklist with how long each step takes, and Verify my BVN explains why the BVN is needed before asking for it.', `
        <div class="of-page ob-home"><img src="${MO}home.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page ob-push ob-check"><img src="${MO}checklist.webp" alt="" /><i class="of-dim"></i></div>
        <div class="of-page ob-push ob-bvn"><img src="${MO}bvn.webp" alt="" /></div>
        <div class="of-page ob-bio"><img src="${MO}bio.webp" alt="" /></div>
        <img class="cf-status" src="${MS}status.webp" alt="" />
        ${ONBOARD_TOUCHES.map(dot).join('')}`, 'ms', LILAC);
  el.classList.add('fl-lilac');
  const $ = <T extends Element>(s: string) => el.querySelector<T>(s)!;
  const opts = { duration: LOOP, iterations: Infinity };
  const { o, x } = moves(LOOP);
  const DISMISS = 1000, TO_CHECK = 2500, TO_BVN = 4000, BACK_1 = 6300, BACK_2 = 7600, PRESENT = 9300;
  const y = (v: number) => ({ transform: `translateY(${v}%)` });
  // A page pushed at `a` and popped at `b`, and the page under it, a third over and dimmed meanwhile.
  const pushed = (a: number, b: number): Stop[] => [[0, x(110)], [a, x(110), SHEET], [a + PUSH, x(0)], [b, x(0), SHEET], [b + PUSH, x(110)], [LOOP, x(110)]];
  const under = (a: number, b: number, v: (k: number) => Keyframe): Stop[] => [[0, v(0)], [a, v(0), SHEET], [a + PUSH, v(1)], [b, v(1), SHEET], [b + PUSH, v(0)], [LOOP, v(0)]] as Stop[];
  return player(el, [
    // Setup slides away to Home; at the end it comes back up, as the loop starts again.
    $<HTMLElement>('.ob-bio').animate(tr([[0, y(0)], [DISMISS, y(0), SHEET], [DISMISS + PUSH, y(100)], [PRESENT, y(100), SHEET], [PRESENT + PUSH, y(0)], [LOOP, y(0)]]), opts),
    $<HTMLElement>('.ob-home').animate(tr(under(TO_CHECK, BACK_2, (k) => x(-30 * k))), opts),
    $<HTMLElement>('.ob-home .of-dim').animate(tr(under(TO_CHECK, BACK_2, (k) => o(k))), opts),
    $<HTMLElement>('.ob-check').animate(tr(pushed(TO_CHECK, BACK_2)), opts),
    $<HTMLElement>('.ob-check img').animate(tr(under(TO_BVN, BACK_1, (k) => x(-30 * k))), opts),
    $<HTMLElement>('.ob-check .of-dim').animate(tr(under(TO_BVN, BACK_1, (k) => o(k))), opts),
    $<HTMLElement>('.ob-bvn').animate(tr(pushed(TO_BVN, BACK_1)), opts),
    ...[...el.querySelectorAll<HTMLElement>('.fl-dot')].map((d, i) => touch(d, ONBOARD_TOUCHES[i], LOOP)),
  ]);
}

export const CASE_LIVE: Record<string, (el: HTMLElement) => () => void> = {
  rolling,
  slider: slider(screens('mobile', ['home', 'login', 'checklist', 'business', 'review', 'wallet'])),
  // Invest to an order: the stock list, a stock, its compliance report, buying, and the order going in.
  'stocks-slider': slider(screens('stocks', ['invest', 'stocks', 'stock', 'compliance', 'buy', 'submitted'])),
  purify,
  comply,
  orders,
  markets,
  short,
  fund,
  onboard,
};
