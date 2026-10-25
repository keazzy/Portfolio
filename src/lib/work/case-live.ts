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

export const CASE_LIVE: Record<string, (el: HTMLElement) => () => void> = { rolling };
