import 'server-only';
import type { Company, Media as FrameMedia, Portfolio, Shot } from '@/lib/types';
import { seed } from '@/content/seed';
import { esc, mediaHTML } from '@/lib/viewer';
import { LIVE, liveCover, type LiveName } from './live';
import { stockCover } from './stock-cover';

/*
  How each piece of work is presented: its card cover and its viewer frames.
  Ported from concepts/work-cards.html. Covers and frames are built here, on the server,
  so a locked project's screens are never sent to a visitor who hasn't unlocked it.
*/

const A = (p: string) => '/assets/' + p.split('/').map(encodeURIComponent).join('/');

type Bg = 'tint' | 'dark' | 'mesh';
/* ---------- backgrounds per company ---------- */
export const BG: Record<string, Record<Bg, string>> = {
  halvest: {
    tint: 'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%), #ece6fa',
    dark: 'radial-gradient(90% 70% at 50% 100%, #3b2c6b 0%, rgba(59,44,107,0) 70%), #1d1a26',
    mesh: 'radial-gradient(60% 60% at 15% 20%, #b9a6f4 0%, transparent 70%), radial-gradient(55% 55% at 85% 25%, #f1b8d8 0%, transparent 70%), radial-gradient(70% 60% at 55% 100%, #8b76ee 0%, transparent 70%), #d8cff6',
  },
  impulse: {
    tint: 'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%), #e9ebfb',
    dark: '#2e2f35',
    mesh: 'radial-gradient(60% 60% at 15% 25%, #aab5f6 0%, transparent 70%), radial-gradient(55% 55% at 85% 20%, #d7c6f7 0%, transparent 70%), radial-gradient(70% 60% at 60% 100%, #8fa2f0 0%, transparent 70%), #cfd6f8',
  },
  kinfolk: {
    tint: 'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%), #ebe8e1',
    dark: '#2b2a27',
    mesh: 'radial-gradient(60% 60% at 15% 20%, #e7cba9 0%, transparent 70%), radial-gradient(55% 55% at 85% 30%, #d9bccc 0%, transparent 70%), radial-gradient(70% 60% at 50% 100%, #c8b296 0%, transparent 70%), #e6ddd0',
  },
};


/* ---------- building blocks ---------- */
type Src = { src: string; w: number; h: number; video?: boolean };
type Crop = { x: number; y: number; w: number; h: number };
// Each builder takes the box ratio it will sit in, so it can choose height- or width-driven sizing.
type Build = (box: number) => string;

function crop(src: string, iw: number, ih: number, c: Crop, { video = false, cls = '' } = {}) {
  const w = (iw / c.w) * 100, l = (-c.x / c.w) * 100, t = (-c.y / c.h) * 100;
  const media = video
    ? `<video src="${src}#t=0.1" muted loop playsinline autoplay preload="metadata" style="width:${w}%;left:${l}%;top:${t}%"></video>`
    : `<img src="${src}" alt="" loading="lazy" width="${iw}" height="${ih}" style="width:${w}%;left:${l}%;top:${t}%" />`;
  return `<div class="crop ${cls}" style="aspect-ratio:${c.w}/${c.h}">${media}</div>`;
}
const full = (iw: number, ih: number): Crop => ({ x: 0, y: 0, w: iw, h: ih });
const fitFor = (ratio: number, box: number, fh: number, fw: number) => (ratio > box * (fw / fh) ? 'fit-w' : 'fit-h');
const phone = (s: Src, c: Crop, o: { inPair?: boolean } = {}): Build => () => crop(s.src, s.w, s.h, c, { video: s.video, cls: `phone lift ${o.inPair ? '' : 'fit-h'}` });
const pair = (a: Build, b: Build): Build => (box) => `<div class="pair lift">${a(box)}${b(box)}</div>`.replace(/phone lift fit-h/g, 'phone');
const panel = (s: Src, c: Crop): Build => (box) => crop(s.src, s.w, s.h, c, { video: s.video, cls: `panel lift ${fitFor(c.w / c.h, box, 0.74, 0.82)}` });
const browser = (s: Src, c = full(s.w, s.h)): Build => (box) =>
  `<div class="browser lift ${fitFor((c.w / c.h) * 0.96, box, 0.8, 0.84)}"><div class="browser__bar"><i></i><i></i><i></i><span></span></div>${crop(s.src, s.w, s.h, c, { video: s.video })}</div>`;
const bleed = (s: Src): Build => () => `<div class="bleed lift" style="aspect-ratio:${s.w}/${s.h}">${s.video ? `<video src="${s.src}#t=0.1" muted loop playsinline autoplay preload="metadata" width="${s.w}" height="${s.h}"></video>` : `<img src="${s.src}" alt="" loading="lazy" width="${s.w}" height="${s.h}" />`}</div>`;
// `pos` and `zoom` frame a photo for the card, e.g. to bring a laptop in a wide scene forward.
const photo = (s: Src, o: { pos?: string; zoom?: number } = {}): Build => () => {
  const st = `object-position:${o.pos || 'center'};${o.zoom ? `transform:scale(${o.zoom});transform-origin:${o.pos || 'center'};` : ''}`;
  return s.video ? `<video class="fill" src="${s.src}#t=0.1" muted loop playsinline autoplay preload="metadata"></video>` : `<img class="fill" src="${s.src}" alt="" loading="lazy" style="${st}" />`;
};

/* Stacks: several states of one thing, one visible at a time (the reels switch between them). */
const layerMedia = (s: Src, c: Crop) =>
  `<img src="${s.src}" alt="" loading="lazy" width="${s.w}" height="${s.h}" style="width:${(s.w / c.w) * 100}%;left:${(-c.x / c.w) * 100}%;top:${(-c.y / c.h) * 100}%" />`;
const stackOf = (items: { s: Src; c: Crop }[], cls: string) =>
  `<div class="crop stack ${cls}" style="aspect-ratio:${items[0].c.w}/${items[0].c.h}">${items.map((it, i) => `<div class="layer${i ? '' : ' on'}">${layerMedia(it.s, it.c)}</div>`).join('')}</div>`;
const phoneStack = (items: { s: Src; c: Crop }[], o: { inPair?: boolean } = {}): Build => () => stackOf(items, o.inPair ? 'phone' : 'phone lift fit-h');
// `pos` keeps the important part in a short card, e.g. 'top' for a site whose headline sits at the top.
const photoStack = (sources: Src[], pos = 'center'): Build => () =>
  sources.map((s, i) => `<div class="layer${i ? '' : ' on'}"><img class="fill" src="${s.src}" alt="" loading="lazy" style="object-position:${pos}" /></div>`).join('');
// The v2 brand, from the brand guide: six gradients (top → bottom), the logo in midnight purple on the light ones, white on the rest.
const BRAND_GRADS = [['#fff6c4', '#ff91f7', '#28134e'], ['#9bf7a2', '#cc8aff', '#28134e'], ['#32d0c6', '#005b50', '#fff'],
  ['#ff8540', '#f2001e', '#fff'], ['#6935d3', '#4cb5ff', '#fff'], ['#2db272', '#4cb5ff', '#fff']];
const brandLayer = ([a, b, c]: string[], mark: 'icon' | 'wordmark', on: boolean) => `<div class="layer${on ? ' on' : ''}" style="--a:${a};--b:${b};--c:${c}">${mark === 'icon'
  ? `<img class="ic" src="${A('halvest/v2/app-icon.png')}" alt="" />` : `<i class="wm" style="--wm:url('${A('halvest/v2/wordmark.svg')}')" role="img" aria-label="halvest"></i>`}</div>`;
// All six (the cover cycles through them), or one of them for a still frame.
const brand = ({ only, mark = 'wordmark' }: { only?: number; mark?: 'icon' | 'wordmark' } = {}): Build => () =>
  `<div class="brand">${(only === undefined ? BRAND_GRADS : [BRAND_GRADS[only]]).map((g, i) => brandLayer(g, mark, !i)).join('')}</div>`;
const brandGrid = (): Build => () => `<div class="brand-grid">${BRAND_GRADS.map((g) => `<div class="brand">${brandLayer(g, 'wordmark', true)}</div>`).join('')}</div>`;
// A cover still waiting for visuals says what it needs instead of pretending.
const todo = (what: string, dark = false): Build => () => `<div class="todo${dark ? ' on-dark' : ''}"><span>Visuals needed</span><b>${esc(what)}</b></div>`;
const live = (name: LiveName): Build => () => liveCover(name);

/* ---------- source files ---------- */
const F = (path: string, w: number, h: number, video = false): Src => ({ src: A(path), w, h, video });
const hv = F('halvest/Halvest Video.mp4', 956, 720, true);
const h19 = F('halvest/image 19.png', 1392, 895), h20 = F('halvest/image 20.png', 1392, 1048), h5 = F('halvest/image 5.png', 1392, 894);
const h2 = F('halvest/image 2.png', 1392, 1044), hStats = F('halvest/Frame 2085654841.png', 1392, 697);
const vestTeaser = F('halvest/vest-teaser.mp4', 1280, 720, true);
// Device mockups (Mockuuups renders of already-public screens) for covers that don't need motion.
const mockPortfolio = F('halvest/mockups/portfolio-pink.webp', 1000, 666);
// v1 Home, set into a hand-held photo with its perspective, corners and Dynamic Island matched.
const mockHome = F('halvest/mockups/home-in-hand.webp', 1920, 1080);
const mockMeetings = F('impulse/mockups/meetings-desk.webp', 1000, 666);
const mockApplications = F('kinfolk/mockups/applications-round-table.webp', 1000, 666), mockRecording = F('kinfolk/mockups/meeting-desk-blinds.webp', 1000, 666);
const st = (n: string, h = 812) => F(`halvest/stocks/${n}.webp`, 375, h), TOP = { x: 0, y: 0, w: 375, h: 812 };
const steps = [55, 322, 589, 856, 1123].map((x) => ({ x, y: 208, w: 213, h: 479 }));
const prosp = F('impulse/prospecting_djdauy.webm', 2000, 1254, true);
const search = (n: number) => F(`impulse/Search - ${n}.png`, 2880, 1800);
const mac = (n: number) => F(`impulse/MacBook Pro 14_ - ${n}.png`, 2880, 1800);
const slide = F('impulse/Slide 4_3 - 2.png', 2048, 1536), home = F('impulse/Entities - Overview - Companies.png', 2880, 1800);
const ds = F('impulse/image 3.png', 1400, 918), site1 = F('impulse/Impulse first image.png', 1400, 1260), site2 = F('impulse/image 4.png', 1400, 870);
const kv = F('kinfolk/cuuro video 2 v2.mp4', 1136, 720, true), k = (n: number, h = 875) => F(`kinfolk/Cuuro ${n}.png`, 1400, h), k6 = F('kinfolk/cuuro 6.png', 1400, 706);
const PULSE_PANEL = { x: 884, y: 292, w: 1114, h: 1200 };
const MODAL = { x: 497, y: 43, w: 474, h: 786 };

/* ---------- presentation per shot: cover + viewer frames ---------- */
// A frame is a composed stage ({ bg, build }), a photo or video at its own shape ({ photo }), or a live component ({ live }).
type Frame = { cap?: string; bg?: Bg; build?: Build; photo?: Src; live?: LiveName };
// `ratio` overrides the card's shape, for a cover drawn to its own (Halal stocks' 4:3).
type Cfg = { cover: Build; frames: Frame[]; bg: Bg | null; reel?: string; tall?: boolean; ratio?: string };
const stage = (bg: Bg, build: Build, cap: string): Frame => ({ bg, build, cap });
const asPhoto = (s: Src, cap: string): Frame => ({ photo: s, cap });
const CFG: Record<string, Cfg> = {
  'halvest/mobile': { bg: null, cover: photo(mockHome),
    frames: [asPhoto(mockHome, 'Home, in the hand'), asPhoto(mockPortfolio, 'The portfolio, in the hand'), stage('tint', phone(hv, { x: 337, y: 54, w: 281, h: 607 }), 'Funding the wallet: bank transfer → confirming → success'),
      stage('dark', phone(h20, { x: 497, y: 84, w: 400, h: 878 }), 'Not enough funds: the amount stays, a sheet offers to top up'),
      stage('tint', phone(h5, { x: 222, y: 136, w: 287, h: 623 }), 'Portfolio value and composition'), stage('tint', phone(h5, { x: 894, y: 121, w: 287, h: 623 }), 'Business financing breakdown'),
      asPhoto(h2, 'In the hand'), asPhoto(hStats, 'Launch results')] },
  'halvest/stocks': { tall: true, ratio: '4/3', bg: 'dark', reel: 'stocksLive', cover: () => stockCover(),
    frames: [stage('dark', pair(phone(st('stock', 1773), TOP, { inPair: true }), phone(st('compliance', 1712), TOP, { inPair: true })), 'The pill under the price opens the compliance report'),
      stage('dark', pair(phone(st('buy-review', 900), TOP, { inPair: true }), phone(st('buy-handover'), TOP, { inPair: true })), 'Purification: on by default, and off only on purpose'),
      stage('dark', pair(phone(st('buy-naira-closed', 1058), TOP, { inPair: true }), phone(st('stock-us-closed', 961), TOP, { inPair: true })), 'A US share from a naira wallet: the rate, and when it fills'),
      stage('dark', pair(phone(st('buy-type'), TOP, { inPair: true }), phone(st('buy-amount', 861), TOP, { inPair: true })), 'Market, limit or recurring'),
      stage('tint', pair(phone(st('holdings'), TOP, { inPair: true }), phone(st('sell-purify-yourself'), TOP, { inPair: true })), 'Holding and selling')] },
  'halvest/vest': { bg: null, cover: photo(vestTeaser), frames: [asPhoto(vestTeaser, 'Meet Vest')] },
  'halvest/onboarding': { bg: 'mesh', reel: 'onboarding', cover: pair(phone(h19, steps[0], { inPair: true }), phoneStack(steps.slice(1).map((c) => ({ s: h19, c })), { inPair: true })),
    frames: steps.map((c, i) => stage('tint', phone(h19, c), ['Welcome: the promise in one line', 'Country: search with flags', 'Email: checked as you type', 'Code: resend timer visible', 'Password: strength shown as you type'][i])) },
  'halvest/v2': { bg: null, reel: 'brandCycle', cover: brand(), frames: [stage('tint', brand({ only: 0 }), 'The new wordmark on the signature gradient'), stage('tint', brandGrid(), 'The logo across the brand gradients'), stage('tint', brand({ only: 4, mark: 'icon' }), 'The new app icon')] },
  'halvest/halvest-os': { bg: 'dark', cover: todo('A clean recording of the workspace', true), frames: [stage('dark', todo('A clean recording of the workspace', true), 'Recording to come')] },
  'halvest/admin': { bg: 'tint', cover: todo('Before and after: the dashboard structure'), frames: [stage('tint', todo('Before and after: the dashboard structure'), 'Screens to come')] },

  'impulse/prospecting': { bg: 'mesh', cover: bleed(prosp), frames: [stage('mesh', browser(prosp), 'From filters to a recurring automation')] },
  'impulse/pulse-search': { tall: true, bg: 'dark', reel: 'pulseLive', cover: live('pulse'),
    frames: [{ live: 'pulse', bg: 'dark', cap: 'Live: ask Pulse and watch the answer stream in' }, ...['Ask in plain language', 'Pulse gathers what you asked for', 'An answer with sources and quick actions', 'Compose: suggested prompts', 'Compose an email', 'Describe what you need', 'A ready-to-send draft, with attachment', 'Create: notes, reports, emails', 'Create a meeting note', 'Describe the note']
      .map((cap, i) => stage('tint', panel(search(i + 1), PULSE_PANEL), cap)), stage('tint', browser(search(7)), 'In context: the full workspace')] },
  'impulse/meetings': { bg: null, cover: photo(mockMeetings, { pos: '45% 42%', zoom: 1.18 }),
    frames: [asPhoto(mockMeetings, 'On the desk'), stage('tint', browser(mac(83)), 'Summary, action items and talk time'), stage('tint', browser(mac(84)), 'What’s new today'), stage('tint', browser(mac(88)), 'A chat that knows who was in the room'), asPhoto(slide, 'Up close')] },
  'impulse/home': { bg: 'dark', reel: 'dayLive', cover: live('day'),
    frames: [{ live: 'day', bg: 'dark', cap: 'Live: morning, afternoon and evening with Pulse' }, stage('dark', panel(home, { x: 1040, y: 400, w: 1280, h: 820 }), 'One prompt to start from'), stage('tint', browser(home), 'The full home')] },
  'impulse/design-system': { bg: null, reel: 'ken', cover: photo(ds), frames: [asPhoto(ds, 'Core components')] },
  'impulse/marketing': { bg: null, reel: 'cyclePhotos', cover: photoStack([site1, site2], 'top'), frames: [asPhoto(site1, 'Launch site'), asPhoto(site2, 'Customer stories')] },

  'kinfolk/deal-flow': { bg: null, cover: photo(kv), frames: [asPhoto(kv, 'Board, then a startup’s activity, team and risk'), stage('tint', browser(k(2, 882)), 'The deal-flow board')] },
  'kinfolk/meeting-recording': { tall: true, bg: null, cover: photo(mockRecording, { pos: '80% 45%', zoom: 1.12 }), frames: [asPhoto(mockRecording, 'At the desk'), stage('mesh', browser(k(3)), 'Transcript, action items and follow-ups')] },
  'kinfolk/applications': { bg: null, cover: photo(mockApplications, { pos: '50% 42%', zoom: 1.2 }), frames: [asPhoto(mockApplications, 'On the table'), stage('tint', browser(k(4)), 'Every application and its status')] },
  'kinfolk/transaction-rules': { bg: 'dark', reel: 'rules', cover: panel(k(5), { x: 497, y: 43, w: 474, h: 430 }),
    frames: [stage('dark', panel(k(5), MODAL), 'The whole rule: type, conditions, actions, timing'), stage('tint', browser(k(5)), 'In context: the transactions page')] },
  'kinfolk/site': { bg: null, reel: 'cyclePhotos', cover: photoStack([k(1, 904), k6], 'top'), frames: [asPhoto(k(1, 904), 'Landing page'), asPhoto(k6, 'AI features')] },
};


/* ---------- viewer frames: each config frame becomes a media item the viewer can show ---------- */
const STAGE_W = 1600, STAGE_H = 1000;
const PLAY = '<span class="vw-frame-play" aria-hidden="true"></span>';
const blank = { kind: 'image' as const, src: '', card: '', thumb: '' };

function toMedia(co: string, f: Frame): FrameMedia {
  const bg = BG[co]?.[f.bg ?? 'tint'];
  if (f.live) {
    // On phones the stage takes the component's own shape (nw × nh) so it isn't shrunk to fit a 16:10 box.
    const [nw, nh] = LIVE[f.live].narrow;
    return { ...blank, html: `<div class="vstage" style="background:${bg}">${liveCover(f.live, { fitHeight: true })}</div>`, width: STAGE_W, height: STAGE_H, nw, nh, caption: f.cap, live: f.live, thumbHTML: PLAY };
  }
  if (f.photo) {
    const s = f.photo;
    return { ...blank, html: s.video ? `<video class="vw-el" src="${s.src}#t=0.1" autoplay muted loop playsinline></video>` : `<img class="vw-el" src="${s.src}" alt="" />`,
      width: s.w, height: s.h, caption: f.cap, thumbHTML: s.video ? PLAY : `<img src="${s.src}" alt="" loading="lazy" />` };
  }
  const inner = f.build!(STAGE_W / STAGE_H);
  return { ...blank, html: `<div class="vstage" style="background:${bg}">${inner}</div>`, width: STAGE_W, height: STAGE_H, caption: f.cap,
    thumbHTML: inner.includes('<video') ? PLAY : `<div class="vstage mini" style="background:${bg}">${inner}</div>` };
}

const LOCKED_COVER = F('halvest/stocks/cover/locked.webp', 1200, 900);
const LOCK_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';

// The file each designed cover was made from: the first image or video of that shot in the seed.
const DESIGNED_FROM = new Map<string, string | undefined>(seed.companies.flatMap((c) => c.shots.map((s) => [`${c.id}/${s.id}`, s.media[0]?.path.split('/').pop()] as const)));

/**
 * A shot's card cover and viewer frames. Shots with a hand-made presentation above use it while their
 * first image is still the one it was designed from; change that image in the Studio (or add a new shot)
 * and the shot shows its own media instead. Locked shots get a pre-blurred cover and a single
 * "protected" frame, so none of their screens are in the page until they're unlocked.
 */
function presentShot(company: Company, shot: Shot, locked: boolean): Shot {
  const key = `${company.id}/${shot.id}`, first = shot.media[0];
  const cfg = !first?.file || first.file === DESIGNED_FROM.get(key) ? CFG[key] : undefined;
  const tall = !!CFG[key]?.tall, ratio = CFG[key]?.ratio, bg = CFG[key]?.bg;
  const background = bg ? BG[company.id][bg] : '#ddd';
  if (locked) {
    return { ...shot, locked: true,
      cover: { html: `<img class="fill" src="${LOCKED_COVER.src}" alt="" /><span class="lockpill">${LOCK_ICON}Protected</span>`, background, tall, ratio },
      media: [toMedia(company.id, stage('dark', todo('Password protected: unlock it from the card', true), 'Protected'))] };
  }
  if (!cfg) {
    return { ...shot, locked: false, cover: { html: first ? mediaHTML(first, { cls: 'fill', size: 'card' }) : '', background, tall, ratio } };
  }
  return { ...shot, locked: false,
    cover: { html: cfg.cover(tall ? 5 / 4 : 16 / 9), background, tall, ratio, reel: cfg.reel },
    media: cfg.frames.map((f) => toMedia(company.id, f)) };
}

/** The portfolio as the page shows it: covers and frames on every shot, protected ones locked unless `unlocked`. */
export function present(portfolio: Portfolio, { unlocked }: { unlocked: boolean }): Portfolio {
  const byKey = new Map<string, Shot>();
  const sections = portfolio.sections.map((sec) => sec.type !== 'work' ? sec : {
    ...sec,
    companies: sec.companies.map((c) => ({
      ...c,
      shots: c.shots.map((s) => {
        const shown = presentShot(c, s, !!s.locked && !unlocked);
        byKey.set(s.key, shown);
        return shown;
      }),
    })),
  });
  return { ...portfolio, sections, shots: portfolio.shots.map((s) => ({ ...s, ...byKey.get(s.key)! })) };
}
