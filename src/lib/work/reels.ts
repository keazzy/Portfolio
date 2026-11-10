/*
  Reels: scripted micro-interactions on the covers (ported from concepts/work-cards.html).
  Each runs while its card is on screen, loops, and resets when it scrolls away.
  Only transform/opacity/filter are animated. The caller skips them for reduced motion.
*/
import { DY_BEATS, PL_ANSWER, PL_INNER, DY_INNER, dyChip, dyOut, dySet } from './live';
import { SK_ORDER, skSet, skStep } from './stock-cover';

const STOP = Symbol('stop');
const EASE_UI = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_PUSH = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const CURSOR_SVG = '<svg viewBox="0 0 20 20"><path d="M3 2 16.5 9.6 10.2 11 7.6 17.2z" fill="#141414" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

const $ = (root: ParentNode, sel: string) => root.querySelector(sel) as HTMLElement;
const $$ = (root: ParentNode, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];

type Api = ReturnType<typeof makeApi>;
export type Reel = { start: () => Promise<void>; stop: () => void };

function makeApi(cover: HTMLElement, alive: () => boolean, cursorRef: { el: HTMLElement | null }, pos: { x: number; y: number }) {
  const guard = () => { if (!alive()) throw STOP; };
  const point = (el: Element, rx: number, ry: number) => {
    const c = cover.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - c.left + rx * r.width, y: r.top - c.top + ry * r.height };
  };
  const settle = (anims: Animation[]) => Promise.all(anims.map((a) => a.finished)).catch(() => { throw STOP; });
  const wait = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (alive() ? res() : rej(STOP)), ms));

  return {
    $: (sel: string) => $(cover, sel),
    cover,
    wait,
    alive,

    // Switch the visible layer: 'fade' (blur crossfade), 'push' (iOS navigation), 'back'.
    async show(el: HTMLElement, i: number, mode: 'fade' | 'push' | 'back' = 'fade') {
      guard();
      const ls = layersOf(el), from = ls.find((l) => l.classList.contains('on')), to = ls[i];
      if (!to || !from || from === to) return;
      to.classList.add('on');
      let anims: Animation[];
      if (mode === 'push' || mode === 'back') {
        const fwd = mode === 'push';
        (fwd ? to : from).style.zIndex = '2';
        anims = [
          to.animate(fwd ? [{ transform: 'translateX(100%)' }, { transform: 'none' }] : [{ transform: 'translateX(-28%)', filter: 'brightness(0.82)' }, { transform: 'none', filter: 'none' }], { duration: 460, easing: EASE_PUSH, fill: 'both' }),
          from.animate(fwd ? [{ transform: 'none', filter: 'none' }, { transform: 'translateX(-28%)', filter: 'brightness(0.82)' }] : [{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: 460, easing: EASE_PUSH, fill: 'both' }),
        ];
      } else {
        anims = [
          from.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 420, easing: 'ease', fill: 'both' }),
          to.animate([{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 420, easing: 'ease', fill: 'both' }),
        ];
      }
      await settle(anims);
      from.classList.remove('on');
      ls.forEach((l) => { l.style.zIndex = ''; });
      anims.forEach((a) => a.cancel());
    },

    // A desktop cursor that glides to a spot on an element.
    async cursorTo(el: Element, rx: number, ry: number, dur = 800) {
      guard();
      if (!cursorRef.el) {
        cursorRef.el = document.createElement('div');
        cursorRef.el.className = 'r-cursor';
        cursorRef.el.innerHTML = CURSOR_SVG;
        cover.appendChild(cursorRef.el);
      }
      const cursor = cursorRef.el;
      const to = point(el, rx, ry);
      const from = cursor.style.opacity === '1' ? { ...pos } : { x: cover.clientWidth * 0.9, y: cover.clientHeight * 1.04 };
      cursor.style.opacity = '1';
      Object.assign(pos, to);
      await settle([cursor.animate([{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${to.x}px, ${to.y}px)` }], { duration: dur, easing: EASE_MOVE, fill: 'forwards' })]);
    },
    async click() {
      guard();
      const ring = document.createElement('span');
      ring.className = 'r-ring';
      ring.style.left = pos.x + 'px';
      ring.style.top = pos.y + 'px';
      cover.appendChild(ring);
      const press = cursorRef.el!.firstElementChild!.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.82)' }, { transform: 'scale(1)' }], { duration: 220, easing: EASE_UI });
      const r = ring.animate([{ transform: 'scale(0.4)', opacity: 0.9 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
      await settle([press]);
      r.finished.then(() => ring.remove()).catch(() => {});
    },
    async cursorOut() {
      guard();
      const cursor = cursorRef.el;
      if (!cursor) return;
      await settle([cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' })]);
      cursor.style.opacity = '0';
    },

    // A finger tap for phone screens.
    async tap(el: Element, rx: number, ry: number) {
      guard();
      const p = point(el, rx, ry), t = document.createElement('span');
      t.className = 'r-tap';
      t.style.left = p.x + 'px';
      t.style.top = p.y + 'px';
      cover.appendChild(t);
      await settle([t.animate([{ transform: 'scale(0.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 160, easing: EASE_UI, fill: 'forwards' })]);
      await settle([t.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' })]);
      t.remove();
    },

    async ken(el: HTMLElement, dur: number) {
      guard();
      await settle([el.animate([{ scale: '1', translate: '0 0' }, { scale: '1.06', translate: '-1% -1%' }], { duration: dur, easing: 'ease-in-out', direction: 'alternate', iterations: 2 })]);
    },
  };
}

const layersOf = (el: Element) => [...el.querySelectorAll<HTMLElement>(':scope > .layer')];

export function makeReel(cover: HTMLElement, script: (r: Api) => Promise<void>): Reel {
  let run = 0;
  const cursorRef = { el: null as HTMLElement | null };
  const pos = { x: 0, y: 0 };

  function reset() {
    // The script's own moves; a cover's CSS loops (a caret, Halal stocks' drifting slope) keep running.
    cover.getAnimations({ subtree: true }).forEach((a) => { if (!(a instanceof CSSAnimation)) a.cancel(); });
    [cover, ...cover.querySelectorAll('.stack, .bleed, .brand')].forEach((el) => layersOf(el).forEach((l, i) => { l.classList.toggle('on', i === 0); l.style.zIndex = ''; }));
    cover.querySelectorAll('.r-tap, .r-ring').forEach((n) => n.remove());
    if (cursorRef.el) cursorRef.el.style.opacity = '0';
  }

  return {
    async start() {
      const id = ++run;
      const r = makeApi(cover, () => id === run, cursorRef, pos);
      // Loop until stopped. If something else cancels an animation mid-way, just start the loop again.
      while (id === run) {
        reset();
        const t0 = performance.now();
        try { await script(r); }
        catch (e) { if (e !== STOP) { console.error(e); break; } }
        if (id === run && performance.now() - t0 < 60) await new Promise((res) => setTimeout(res, 500));
      }
    },
    stop() { run++; reset(); },
  };
}

export const SCRIPTS: Record<string, (r: Api) => Promise<void>> = {
  // Dangote's page tapping through its ranges, 1D to All and back to 1D, as the app moves (stock-cover.ts).
  async stocksLive(r) {
    const root = r.$('.sk');
    skSet(root, '1D');
    for (let i = 1; i <= SK_ORDER.length; i++) {
      await r.wait(1500);
      await skStep(root, SK_ORDER[i - 1], SK_ORDER[i % SK_ORDER.length], r.alive);
    }
  },

  // Type a query → results → Ask Pulse AI → thinking → streamed answer → actions and sources.
  async pulseLive(r) {
    const root = r.$('.pl');
    root.innerHTML = PL_INNER;
    const q = $(root, '.pl-q'), ph = $(root, '.pl-ph'), askQ = $(root, '.pl-ask-q');
    const ask = $(root, '.pl-ask'), heads = $$(root, '.pl-hv'), A = $(root, '.pl-a'), B = $(root, '.pl-b');
    const appear = (el: HTMLElement, delay = 0, dy = 6) => {
      el.style.visibility = 'visible';
      return el.animate([{ opacity: 0, transform: `translateY(${dy}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, delay, easing: EASE_UI, fill: 'both' });
    };
    const swapHead = (i: number) => {
      const from = heads.find((h) => h.classList.contains('on'))!, to = heads[i];
      from.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
      to.classList.add('on');
      to.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE_UI, fill: 'both' });
      from.classList.remove('on');
    };

    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'both' });
    await r.wait(700);

    // 1. Type the question; Ask Pulse AI and results appear as you type.
    ph.remove();
    q.classList.add('typing');
    const text = 'What are my tasks for today';
    for (let i = 0; i < text.length; i++) {
      q.textContent += text[i];
      askQ.textContent = q.textContent;
      if (i === 2) [ask, $(root, '.pl-label'), ...$$(root, '.pl-row')].forEach((el, k) => appear(el, k * 55));
      await r.wait(42 + Math.random() * 48);
    }
    await r.wait(450);

    // 2. Click "Ask Pulse AI".
    await r.cursorTo(ask, 0.38, 0.5, 750);
    await r.click();
    ask.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.985)' }, { transform: 'scale(1)' }], { duration: 200, easing: EASE_UI });
    q.classList.remove('typing');
    await r.wait(160);

    // 3. Thinking.
    swapHead(1);
    $(root, '.pl-spin').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 900, iterations: Infinity, easing: 'steps(8)' });
    A.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180, fill: 'forwards' });
    await r.wait(180);
    A.style.display = 'none';
    B.style.display = 'block';
    B.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: EASE_UI, fill: 'both' });
    $$(root, '.pl-skel i').forEach((bar) => bar.animate([{ backgroundPosition: '110% 0' }, { backgroundPosition: '-110% 0' }], { duration: 1100, iterations: Infinity, easing: 'linear' }));
    await r.cursorOut();
    await r.wait(1250);

    // 4. Stream the answer, word by word.
    const skel = $(root, '.pl-skel'), answer = $(root, '.pl-answer');
    skel.style.display = 'none';
    answer.style.display = 'block';
    answer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'both' });
    const dot = document.createElement('span');
    dot.className = 'pl-dot';
    dot.animate([{ opacity: 0.35, transform: 'scale(0.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 520, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    const paras = $$(root, '.pl-answer > p');
    for (let pi = 0; pi < PL_ANSWER.length; pi++) {
      const words = PL_ANSWER[pi].split(' ');
      for (let wi = 0; wi < words.length; wi++) {
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = (wi ? ' ' : '') + words[wi];
        paras[pi].appendChild(w);
        paras[pi].appendChild(dot);
        w.animate([{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
        await r.wait(18 + Math.random() * 30 + (/[.,—;]$/.test(words[wi]) ? 90 : 0));
      }
      await r.wait(180);
    }
    dot.remove();
    swapHead(2);

    // 5. Reactions, quick actions and sources settle in.
    appear($(root, '.pl-react'), 0, 4);
    $$(root, '.pl-chip').forEach((c, i) => {
      c.parentElement!.style.visibility = 'visible';
      c.animate([{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 120 + i * 80, easing: EASE_UI, fill: 'both' });
    });
    appear($(root, '.pl-src'), 420, 8);
    $$(root, '.pl-card').forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateX(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 480 + i * 90, easing: EASE_UI, fill: 'both' }));
    await r.wait(3200);
    await new Promise((res) => root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(res, res));
  },

  // Morning → afternoon → evening: each time of day, a request whose names become entities, then what Pulse brings back.
  async dayLive(r) {
    const root = r.$('.dy');
    root.innerHTML = DY_INNER;
    const q = (sel: string) => $(root, sel);
    const skies = $$(root, '.dy-sky'), words = $$(root, '.dy-words > span');
    const box = q('.dy-box'), inp = q('.dy-in'), out = q('.dy-out'), text = q('.dy-text'), ph = q('.dy-ph'), chips = q('.dy-chips');
    const go = (el: HTMLElement, kf: Keyframe[], o: KeyframeAnimationOptions) => el.animate(kf, { easing: EASE_UI, fill: 'both', ...o });
    const fade = (el: HTMLElement, to: number, o: KeyframeAnimationOptions) => go(el, [{ opacity: 1 - to }, { opacity: to }], { duration: 180, ...o });
    const key = (ms: number) => r.wait(30 + Math.random() * 38 + ms);
    dySet(root, 0);
    go(root, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    go(q('.dy-sun-y'), [{ transform: `translateY(${DY_BEATS[0].sun[1] + 70}px)` }, { transform: `translateY(${DY_BEATS[0].sun[1]}px)` }], { duration: 2200, easing: 'cubic-bezier(0.2, 0.75, 0.35, 1)' });
    await r.wait(650);

    for (let i = 0; i < DY_BEATS.length; i++) {
      const b = DY_BEATS[i], prev = DY_BEATS[i - 1];
      if (prev) {
        // Time moves on: the sky, the light, the clock and the greeting.
        go(skies[i], [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing: 'ease' });
        // The sun travels an arc: x and y move on different curves (rising eases out, setting eases in).
        const rising = b.sun[1] < prev.sun[1], suns = $$(root, '.dy-sun i');
        go(q('.dy-sun'), [{ transform: `translateX(${prev.sun[0]}px)` }, { transform: `translateX(${b.sun[0]}px)` }], { duration: 1500, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' });
        go(q('.dy-sun-y'), [{ transform: `translateY(${prev.sun[1]}px)` }, { transform: `translateY(${b.sun[1]}px)` }], { duration: 1500, easing: rising ? 'cubic-bezier(0.2, 0.75, 0.35, 1)' : 'cubic-bezier(0.6, 0, 0.8, 0.3)' });
        fade(suns[i - 1], 0, { duration: 1500, easing: 'ease' });
        fade(suns[i], 1, { duration: 1500, easing: 'ease' });
        if (b.dark) fade(q('.dy-moon'), 1, { duration: 700, delay: 1100, easing: 'ease' });
        ([['h', 0.5], ['m', 6]] as const).forEach(([hand, f]) => go(q(`.dy-clock .${hand}`), [{ transform: `rotate(${prev.mins * f}deg)` }, { transform: `rotate(${b.mins * f}deg)` }], { duration: 1100, easing: EASE_MOVE }));
        root.classList.toggle('dark', !!b.dark);
        go(q('.dy-words'), [{ transform: `translateY(${-38 * (i - 1)}px)` }, { transform: `translateY(${-38 * i}px)` }], { duration: 650, delay: 150, easing: EASE_PUSH });
        go(q('.dy-roll'), [{ width: words[i - 1].offsetWidth + 'px' }, { width: words[i].offsetWidth + 'px' }], { duration: 650, delay: 150, easing: EASE_PUSH });
        const t = q('.dy-time b');
        fade(t, 0, { duration: 140 });
        await r.wait(300);
        t.textContent = b.time;
        fade(t, 1, { duration: 200 });
        await r.wait(750);
      }

      // Type the request; names turn into entity chips once Pulse recognises them.
      ph.remove();
      text.classList.add('typing');
      for (const part of b.ask) {
        if (typeof part === 'string') {
          const node = document.createTextNode('');
          text.appendChild(node);
          for (const ch of part) { node.data += ch; await key(0); }
        } else {
          const raw = document.createElement('span');
          raw.className = 'dy-raw';
          text.appendChild(raw);
          for (const ch of part[0]) { raw.textContent += ch; await key(0); }
          await r.wait(180);
          raw.insertAdjacentHTML('afterend', dyChip(part[1], part[2]));
          const chip = raw.nextElementSibling as HTMLElement;
          raw.remove();
          go(chip, [{ opacity: 0, transform: 'scale(0.82)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 340 });
          await r.wait(120);
        }
      }
      await r.wait(420);

      // Send: the prompt grows into the answer.
      go(q('.dy-send'), [{ transform: 'scale(1)' }, { transform: 'scale(0.86)' }, { transform: 'scale(1)' }], { duration: 240, fill: 'none' });
      await r.wait(200);
      text.classList.remove('typing');
      out.innerHTML = dyOut(b.out);
      const lis = $$(out, '.dy-li');
      lis.forEach((li) => { li.style.opacity = '0'; });
      const tall = out.offsetHeight + 3;
      fade(inp, 0, { duration: 160 });
      fade(chips, 0, { duration: 160 });
      go(box, [{ height: '112px' }, { height: tall + 'px' }], { duration: 480, easing: EASE_PUSH });
      fade(out, 1, { duration: 240, delay: 160 });
      lis.forEach((li, j) => go(li, [{ opacity: 0, transform: b.out.kind === 'mail' ? 'translateX(12px)' : 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: 280 + j * 120 }));
      await r.wait(280 + lis.length * 120 + 300);
      if (b.out.kind === 'check') {
        for (const tick of $$(out, '.box')) {
          await r.wait(280);
          tick.classList.add('on');
          go(tick, [{ transform: 'scale(0.7)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' });
        }
      }
      await r.wait(1300);
      if (i === DY_BEATS.length - 1) break;

      // Back to an empty prompt for the next part of the day.
      fade(out, 0, { duration: 160 });
      go(box, [{ height: tall + 'px' }, { height: '112px' }], { duration: 400, delay: 80, easing: EASE_PUSH });
      await r.wait(420);
      text.replaceChildren(ph);
      fade(inp, 1, { duration: 220 });
      fade(chips, 1, { duration: 220 });
    }
    await r.wait(400);
    await new Promise((res) => go(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }).finished.then(res, res));
  },

  // Walk the sign-up: tap, slide to the next screen, repeat.
  async onboarding(r) {
    const st = r.$('.pair .stack');
    await r.wait(900);
    await r.tap(st, 0.32, 0.378); await r.show(st, 1, 'push');
    await r.wait(850);
    await r.tap(st, 0.5, 0.612); await r.show(st, 2, 'push');
    await r.wait(850);
    await r.tap(st, 0.5, 0.612); await r.show(st, 3, 'push');
    await r.wait(2000);
  },

  // Set up a rule: pick the match, the source, the category.
  async rules(r) {
    const m = r.$('.panel');
    await r.wait(700);
    await r.cursorTo(m, 0.47, 0.467, 850); await r.click();
    await r.wait(350);
    await r.cursorTo(m, 0.498, 0.553, 550); await r.click();
    await r.wait(350);
    await r.cursorTo(m, 0.536, 0.786, 650); await r.click();
    await r.wait(900);
    await r.cursorOut();
    await r.wait(1200);
  },

  // Step through the brand gradients, like the guide's "logo on gradients" page.
  async brandCycle(r) {
    const el = r.$('.brand'), n = layersOf(el).length;
    for (let i = 1; i <= n; i++) { await r.wait(1600); await r.show(el, i % n); }
  },
  async cyclePhotos(r) {
    await r.wait(2400); await r.show(r.cover, 1);
    await r.wait(2800); await r.show(r.cover, 0);
  },
  async ken(r) {
    await r.ken(r.$('.fill'), 7000);
  },
};
