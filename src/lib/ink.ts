/*
  Ink: the serif's own exposure dial, drawn over Fraunces (SIL OFL).

  +60 is overexposed (thin parts burn away), 0 is a crisp print, −100 is ink soaked into the paper. Each stop is a
  setting of Fraunces' axes plus an ink spread: the letters are blurred and the blur is cut at a threshold. Cut low,
  every stroke thickens by the same amount, corners round and tight counters fill, the way ink gains on paper.
  Cut high, hairlines thin and break. The stops were fitted glyph by glyph, by eye and by measured overlap.
*/

export type Stop = { opsz: number; wght: number; SOFT: number; blur: number; cut: number };

// blur is in em of the drawn letters, cut is the alpha (0–1) where the spread ends.
const STOPS: [number, Stop][] = [
  [60, { opsz: 9, wght: 318.2, SOFT: 9.0, blur: 0.0132, cut: 0.689 }],
  [30, { opsz: 10.1, wght: 323.3, SOFT: 35.8, blur: 0.0142, cut: 0.554 }],
  [0, { opsz: 24.8, wght: 356.8, SOFT: 53.5, blur: 0, cut: 0.5 }],
  [-20, { opsz: 30.1, wght: 348.8, SOFT: 97.3, blur: 0.0208, cut: 0.243 }],
  [-40, { opsz: 30.1, wght: 348.8, SOFT: 97.3, blur: 0.0233, cut: 0.113 }],
  [-60, { opsz: 30.1, wght: 348.8, SOFT: 97.3, blur: 0.0251, cut: 0.043 }],
  [-80, { opsz: 30.1, wght: 348.8, SOFT: 97.3, blur: 0.0317, cut: 0.035 }],
  [-100, { opsz: 30.1, wght: 348.8, SOFT: 97.3, blur: 0.0416, cut: 0.036 }],
];

/**
 * The weight under the ink. The fit to Exposure put it at 348.8; the site sets it lighter, so the ink reads soft rather
 * than heavy. Between 0 and −20 the weight moves from the crisp stop's to this one.
 */
export const INK_WEIGHT = 290;

/** The serif's @font-face draws it 5% larger than its font-size (size-adjust), so it sets like the face it replaces. */
export const SIZE_ADJUST = 1.05;

/** Where each kind of headline sits on the dial. Everything else in the serif stays at 0, with no spread. */
export const INKED: [selector: string, level: number][] = [
  ['.hero h1, .hello__mail, .cs-head h1, .gate-page h1, .case .stats b', -20],
  ['.section h2, .co__name, .pa-title, .ch h2, .case .next b, .case .hmw .rule b', -10],
];

export function at(level: number): Stop {
  const l = Math.max(-100, Math.min(60, level));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, p] = STOPS[i], [b, q] = STOPS[i + 1];
    if (l <= a && l >= b) {
      const t = a === b ? 0 : (a - l) / (a - b);
      const mix = (k: keyof Stop) => p[k] + (q[k] - p[k]) * t;
      const crisp = STOPS[2][1].wght;
      const wght = l < 0 ? crisp + (INK_WEIGHT - crisp) * Math.min(1, -l / 20) : mix('wght');
      return { opsz: mix('opsz'), wght, SOFT: mix('SOFT'), blur: mix('blur'), cut: mix('cut') };
    }
  }
  return { ...STOPS[STOPS.length - 1][1], wght: INK_WEIGHT };
}

export const axes = (s: Stop) =>
  `'opsz' ${s.opsz.toFixed(1)}, 'wght' ${s.wght.toFixed(1)}, 'SOFT' ${s.SOFT.toFixed(1)}, 'WONK' 0`;

// The inverse of the normal CDF, close enough to place the cut (Winitzki's approximation).
const probit = (p: number) => {
  const x = 2 * p - 1, a = 0.147, l = Math.log(1 - x * x), b = 2 / (Math.PI * a) + l / 2;
  return Math.SQRT2 * Math.sign(x) * Math.sqrt(Math.sqrt(b * b - l / a) - b);
};

/**
 * The spread for letters set at `fontPx`, or null when there's nothing to spread. The cut's slope is chosen so the
 * edge stays one device pixel wide: sharp like print, but still antialiased.
 */
export function spread(s: Stop, fontPx: number, dpr = 1) {
  const sigma = s.blur * fontPx * SIZE_ADJUST;
  if (sigma < 0.2) return null;
  const cut = Math.min(0.995, Math.max(0.005, s.cut));
  const z = probit(cut), density = Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
  const slope = Math.max(2, (sigma * dpr) / density);
  return { sigma, slope, intercept: 0.5 - slope * cut };
}
