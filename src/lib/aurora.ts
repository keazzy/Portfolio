/*
  Aurora curtain — WebGL port of Nathan Schroeder's React Native Skia shader
  (github.com/SchroederNathan/react-native-motion → aurora-curtain.tsx).
  Ported from concepts/shared/aurora.js; see that file's header for what changed vs the original.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

export type AuroraTheme = { tintA: number[]; tintB: number[]; gain: number; grain?: number };
type MountOptions = { theme?: Partial<AuroraTheme>; heightFrac?: number; refEl?: HTMLElement | null; scroller?: Window | HTMLElement };
export type AuroraHandle = { el: HTMLCanvasElement; setTheme(t: Partial<AuroraTheme>): void; destroy(): void };

const LOOP_MS = 14000;
const MAX_PULL = 0.34;

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2  u_res;     // reference size in device px (x: ray width basis, y: one "screen-height")
uniform vec2  u_canvas;  // canvas size in device px
uniform float u_t;
uniform float u_pull;
uniform float u_gain;
uniform float u_grain;
uniform float u_cell;
uniform float u_tiles;
uniform vec3  u_tintA;
uniform vec3  u_tintB;

const float TAU = 6.2831853;
const float LAG = 0.2857;
const float FADE_A = -0.20;
const float FADE_B = 0.22;
const float FADE_P = 0.55;
const float TOP = 0.5;
const float EDGE_P = 1.6;
const float BOB_AMP = 0.01;
const float BREATHE_DEPTH = 0.88;
const float PULSE_DEPTH = 0.40;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

float breathe(float t, float speed, float phase, float depth) {
float w = 0.5 + 0.5 * sin((t * speed + phase) * TAU);
w = clamp(w + 0.25 * sin((t * (speed * 2.0 + 1.0) + phase * 3.1) * TAU), 0.0, 1.0);
return (1.0 - depth) + depth * w;
}

float ray(float x, float ys, float td, float tw, float base, float halfWidth,
        float a1, float s1, float p1, float a2, float s2, float p2,
        float bobSpeed, float bobPhase, float brSpeed, float brPhase, float weight) {
float swing = a1 * sin((td * s1 + p1) * TAU) + a2 * sin((td * s2 + p2) * TAU);
float f = 1.0 - smoothstep(0.0, halfWidth, abs(x - (base + swing)));
f = pow(f, EDGE_P);
float yy = ys + BOB_AMP * sin((tw * bobSpeed + bobPhase) * TAU);
float fade = pow(1.0 - smoothstep(FADE_A, FADE_B, yy), FADE_P);
return f * fade * breathe(tw, brSpeed, brPhase, BREATHE_DEPTH) * weight;
}

// The original nine rays. k shifts every phase so a tiled copy never moves in step.
float field(float x, float ys, float td, float tw, float k) {
float v = 0.0;
v += ray(x, ys, td, tw, 0.000, 0.300, 0.0665, 3.0, 0.00+k, 0.0266, 2.0, 0.20+k, 1.0, 0.00+k, 1.0, 0.00+k, 0.85);
v += ray(x, ys, td, tw, 0.336, 0.210, 0.0546, 3.0, 0.37+k, 0.0315, 2.0, 0.62+k, 2.0, 0.35+k, 2.0, 0.17+k, 0.90);
v += ray(x, ys, td, tw, 0.165, 0.435, 0.0735, 3.0, 0.68+k, 0.0224, 4.0, 0.15+k, 1.0, 0.70+k, 1.0, 0.33+k, 0.86);
v += ray(x, ys, td, tw, 0.543, 0.255, 0.0595, 3.0, 0.15+k, 0.0287, 2.0, 0.85+k, 2.0, 0.10+k, 3.0, 0.50+k, 0.88);
v += ray(x, ys, td, tw, 0.366, 0.375, 0.0630, 3.0, 0.52+k, 0.0252, 2.0, 0.40+k, 1.0, 0.45+k, 2.0, 0.67+k, 0.84);
v += ray(x, ys, td, tw, 0.804, 0.165, 0.0504, 3.0, 0.83+k, 0.0336, 4.0, 0.70+k, 2.0, 0.80+k, 1.0, 0.83+k, 0.89);
v += ray(x, ys, td, tw, 0.816, 0.345, 0.0700, 3.0, 0.26+k, 0.0238, 2.0, 0.05+k, 1.0, 0.20+k, 2.0, 0.42+k, 0.87);
v += ray(x, ys, td, tw, 1.263, 0.225, 0.0574, 3.0, 0.60+k, 0.0301, 2.0, 0.95+k, 2.0, 0.55+k, 3.0, 0.92+k, 0.85);
v += ray(x, ys, td, tw, 1.035, 0.405, 0.0616, 3.0, 0.44+k, 0.0259, 4.0, 0.28+k, 1.0, 0.90+k, 2.0, 0.08+k, 0.86);
return v;
}

void main() {
vec2 fc = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y); // top-left origin, like Skia
float x = fc.x / u_res.x;
float ys = fc.y / u_res.y - u_pull;
float t = u_t;

float tw = t + 0.012 * sin((t * 3.0 + 0.37) * TAU) + 0.006 * sin((t * 7.0 + 0.71) * TAU);
float td = tw - ys * LAG;

float v = field(x, ys, td, tw, 0.0);
if (u_tiles > 1.5) v += field(x - 1.18, ys, td, tw, 0.41);
if (u_tiles > 2.5) v += field(x - 2.36, ys, td, tw, 0.77);

v *= smoothstep(-TOP, -TOP + 0.12, ys);
v *= 1.0 + PULSE_DEPTH * sin(t * TAU);

float v2 = v / (1.0 + v);
float a = clamp(v2 * u_gain, 0.0, 1.0);

float g = (1.0 - smoothstep(0.11, 0.28, ys)) * smoothstep(-TOP, -TOP + 0.12, ys);
a += (hash(floor(fc / u_cell)) - 0.5) * 0.055 * u_grain * (0.55 * g + 0.45 * v2);
a = clamp(a, 0.0, 1.0);

float m = 0.5 + 0.5 * sin((x * 1.5 + t) * TAU);
vec3 tint = mix(u_tintA, u_tintB, m);
gl_FragColor = vec4(tint * a, a); // premultiplied
}`;

// The original, measured violet — for dark grounds.
export const VIOLET: AuroraTheme = { tintA: [0.84, 0.81, 1.0], tintB: [0.93, 0.905, 1.0], gain: 0.2664, grain: 1 };

export function mount(host: HTMLElement, opts: MountOptions = {}): AuroraHandle {
  let theme: AuroraTheme = { ...VIOLET, ...(opts.theme || {}) };
  const heightFrac = opts.heightFrac ?? 0.62;
  const refEl = opts.refEl || null; // element whose height is one "screen-height" (default: viewport)
  const scroller: Window | HTMLElement = opts.scroller || window;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const canvas = document.createElement('canvas');
  canvas.className = 'aurora';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Animated curtain of light across the top of the page.');
  Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', width: '100%', pointerEvents: 'none', display: 'block' });
  host.prepend(canvas);

  const glMaybe = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!glMaybe) return fallback();
  const gl: WebGLRenderingContext = glMaybe;

  const prog = link(gl, VERT, FRAG);
  if (!prog) return fallback();
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {};
  ['u_res', 'u_canvas', 'u_t', 'u_pull', 'u_gain', 'u_grain', 'u_cell', 'u_tiles', 'u_tintA', 'u_tintB'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  let dpr = 1, refW = 1, refH = 1, tiles = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    refH = refEl ? refEl.clientHeight : window.innerHeight;
    const cssW = host.clientWidth;
    const cssH = Math.round(refH * heightFrac);
    canvas.style.height = cssH + 'px';
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    // Keep rays about phone-width apart; tile the field across wider screens.
    refW = Math.min(cssW, Math.max(refH * 0.9, 420));
    const span = cssW / refW;
    tiles = span > 2.3 ? 3 : span > 1.08 ? 2 : 1;
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw(currentT());
  }

  /* ---------- pull (overscroll) ---------- */
  let pull = 0, vel = 0, dragging = false, lastInput = 0;
  const atTop = () => (scroller === window ? window.scrollY <= 0 : (scroller as HTMLElement).scrollTop <= 0);
  const setPull = (p: number) => { pull = Math.max(0, Math.min(MAX_PULL, p)); };
  const onWheel = (e: any) => {
    if (e.deltaY < 0 && atTop()) {
      setPull(pull + (-e.deltaY / refH) * 0.45 * (1 - pull / MAX_PULL));
      lastInput = performance.now();
      kick();
    }
  };
  let touchY: number | null = null;
  const onTouchStart = (e: any) => { touchY = atTop() ? e.touches[0].clientY : null; dragging = touchY !== null; };
  const onTouchMove = (e: any) => {
    if (touchY === null) return;
    const dy = e.touches[0].clientY - touchY;
    if (dy <= 0) return;
    setPull((MAX_PULL * dy) / (dy + refH * 0.6)); // rubber-band
    lastInput = performance.now();
    kick();
  };
  const onTouchEnd = () => { touchY = null; dragging = false; kick(); };
  const target = scroller === window ? window : scroller;
  target.addEventListener('wheel', onWheel, { passive: true });
  target.addEventListener('touchstart', onTouchStart, { passive: true });
  target.addEventListener('touchmove', onTouchMove, { passive: true });
  target.addEventListener('touchend', onTouchEnd, { passive: true });

  function stepPull(dt: number) {
    // Safari reports negative scrollY while rubber-banding; follow it 1:1 like the original.
    const rubber = scroller === window ? Math.max(0, -window.scrollY) / refH : 0;
    if (rubber > 0) { pull = Math.min(MAX_PULL, rubber); vel = 0; return; }
    if (dragging || performance.now() - lastInput < 90) return;
    // Critically-damped-ish spring back to 0.
    const k = 90, d = 2 * Math.sqrt(k) * 0.9;
    const s = Math.min(dt, 1 / 30);
    vel += (-k * pull - d * vel) * s;
    pull = Math.max(0, pull + vel * s);
    if (pull < 0.0005 && Math.abs(vel) < 0.001) { pull = 0; vel = 0; }
  }

  /* ---------- render loop ---------- */
  const currentT = () => (reduce.matches ? 0.18 : (performance.now() % LOOP_MS) / LOOP_MS);
  function draw(t: number) {
    gl.uniform2f(U.u_res, refW * dpr, refH * dpr);
    gl.uniform2f(U.u_canvas, canvas.width, canvas.height);
    gl.uniform1f(U.u_t, t);
    gl.uniform1f(U.u_pull, pull);
    gl.uniform1f(U.u_gain, theme.gain);
    gl.uniform1f(U.u_grain, theme.grain ?? 1);
    gl.uniform1f(U.u_cell, Math.max(1, dpr));
    gl.uniform1f(U.u_tiles, tiles);
    gl.uniform3fv(U.u_tintA, theme.tintA);
    gl.uniform3fv(U.u_tintB, theme.tintB);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let raf = 0, visible = true, last = performance.now();
  function frame(now: number) {
    raf = 0;
    const dt = (now - last) / 1000; last = now;
    stepPull(dt);
    draw(currentT());
    const settling = pull > 0 || vel !== 0;
    if (visible && (!reduce.matches || settling)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  if (refEl) ro.observe(refEl);
  window.addEventListener('resize', resize);
  reduce.addEventListener?.('change', kick);
  resize();
  kick();

  return {
    el: canvas,
    setTheme(t: Partial<AuroraTheme>) { theme = { ...VIOLET, ...t }; draw(currentT()); kick(); },
    destroy() {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      window.removeEventListener('resize', resize);
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      target.removeEventListener('touchend', onTouchEnd);
      canvas.remove();
    },
  };

  // No WebGL: a still, soft gradient in the same tint so the page keeps its mood.
  function fallback(): AuroraHandle {
    const [r, g, b] = theme.tintA.map((c) => Math.round(c * 255));
    Object.assign(canvas.style, { height: Math.round(window.innerHeight * 0.3) + 'px', background: `linear-gradient(rgba(${r},${g},${b},${theme.gain}) , rgba(${r},${g},${b},0))` });
    return { el: canvas, setTheme() { /* static fallback */ }, destroy() { canvas.remove(); } };
  }
}

function link(gl: WebGLRenderingContext, vs: string, fs: string) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('aurora shader:', gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('aurora link:', gl.getProgramInfoLog(p)); return null; }
  return p;
}
