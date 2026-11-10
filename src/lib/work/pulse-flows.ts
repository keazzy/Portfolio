/*
  Pulse, played like screen recordings (the flow blocks in the Pulse case study).

  The web app is drawn in code at 1440 × 900, with the bar at its shipped size and place (557 × 600, as on the
  cover), and filmed: a camera frames a 720 × 540 view of the window, pushes in and pans to what matters, keys
  pressed show in a strip at the foot, and a cursor does the clicking. Every move sits on one loop's timeline, as
  the phone flows' do (case-live.ts), so pause, replay and up close work the same way.

  Typed letters grow from nothing, one at a time, so the caret and the "Ask Pulse AI" tag follow them. Streamed
  words appear in a layout that's already set, so nothing jumps. Each flow shows a different way in: the shortcut
  and the three jobs (anywhere), the keyboard (search), the answer's sources (answer), and voice and Refine (compose).
*/
import { CONTROLS, player } from './case-live';
import { I as PI, PL_ANSWER } from './live';

const W = 720, H = 540;                                   // the view, in app pixels when the camera is at 1×
const UI = 'cubic-bezier(0.23, 1, 0.32, 1)';              // things arriving
const MOVE = 'cubic-bezier(0.65, 0, 0.35, 1)';            // the camera and the cursor travelling
const CURSOR = '<svg viewBox="0 0 20 20"><path d="M3 2 16.5 9.6 10.2 11 7.6 17.2z" fill="#141414" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

/* ---------- one loop's timeline ---------- */

type V = Record<string, string | number>;
type Track = { to: (t: number, ms: number, v: V, easing?: string) => Track; set: (t: number, v: V) => Track };

function timeline(loop: number) {
  const tracks: [Element, [number, V, string?][]][] = [];
  // A layer starts at `init`; each move holds it until t, then takes it to v over ms. Moves on a layer run in order.
  const of = (node: Element, init: V): Track => {
    let cur = init, last = 0;
    const stops: [number, V, string?][] = [[0, cur]];
    tracks.push([node, stops]);
    const api: Track = {
      to(t, ms, v, easing = UI) {
        t = Math.max(t, last);
        stops.push([t, cur, easing]);
        cur = { ...cur, ...v };
        stops.push([t + ms, cur]);
        last = t + ms;
        return api;
      },
      set: (t, v) => api.to(t, 1, v, 'linear'),
    };
    return api;
  };
  // At the end of the loop every layer goes back to where it started, so a layer still on screen then has to be there already.
  const play = () => tracks.map(([node, stops]) => node.animate(
    [...stops, [loop, stops[stops.length - 1][1]] as [number, V]].map(([t, v, easing]) => ({ ...v, offset: Math.min(1, t / loop), ...(easing ? { easing } : {}) })),
    { duration: loop, iterations: Infinity }));
  return { of, play };
}
type TL = ReturnType<typeof timeline>;

// The same wobble every take (so up close plays what the page plays): a fraction in [0, 1) for each step.
const wobble = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

// When each letter of `text` lands, typing from t at about `gap` ms a letter.
const keystrokes = (text: string, t: number, gap: number) => {
  let at = t;
  return [...text].map((ch, i) => { const now = at; at += gap * (0.65 + 0.7 * wobble(i)) + (ch === ' ' ? gap * 0.4 : 0); return now; });
};
const letters = (text: string, k: string) => `<span class="pw-type" data-k="${k}">${[...text].map((c) => `<i class="c">${c}</i>`).join('')}</span>`;
const words = (text: string) => text.split(' ').map((w) => `<i class="w">${w} </i>`).join('');

// Letters grow in at their times, and go at `clear`.
function grow(tl: TL, box: Element, times: number[], clear?: number) {
  box.querySelectorAll('.c').forEach((c, i) => {
    const tr = tl.of(c, { fontSize: '0em' }).set(times[i], { fontSize: '1em' });
    if (clear !== undefined) tr.set(clear, { fontSize: '0em' });
  });
}
// Words appear one by one from t, a beat longer after a stop or a comma; they go at `clear`. Returns when the last lands.
function stream(tl: TL, box: Element, t: number, gap: number, clear?: number) {
  let at = t;
  box.querySelectorAll('.w').forEach((w, i) => {
    const tr = tl.of(w, { visibility: 'hidden' }).set(at, { visibility: 'visible' });
    if (clear !== undefined) tr.set(clear, { visibility: 'hidden' });
    at += gap * (0.5 + wobble(i + 7)) + (/[.,:?—]\s*$/.test(w.textContent!) ? gap * 3 : 0);
  });
  return at;
}

/* ---------- the camera, the cursor and the keys ---------- */

// A shot is the point the view centres on, in window pixels, and how close the camera is.
type Shot = [x: number, y: number, s: number];
type Pt = [number, number];
const shot = ([x, y, s]: Shot) => ({ transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-x}px, ${-y}px)` });
const WIDE: Shot = [720, 450, 0.45];        // the whole window on the wallpaper
const PAGE: Shot = [590, 450, 0.62];        // the page, sidebar and all, filling the view
const WHOLE: Shot = [721, 447, 0.86];       // the whole bar
const TOP: Shot = [721, 335, 1.05];         // the input and the first results

// Where a spot on an element sits in the window, by layout alone (moves and zooms don't count).
function spot(win: HTMLElement, el: HTMLElement, rx = 0.5, ry = 0.5): Pt {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== win) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return [x + rx * el.offsetWidth, y + ry * el.offsetHeight];
}

function cursor(tl: TL, cam: HTMLElement, from: Pt) {
  const el = document.createElement('div');
  el.className = 'pw-cursor';
  el.innerHTML = CURSOR;
  cam.appendChild(el);
  const at = ([x, y]: Pt) => `translate(${x}px, ${y}px)`;
  const tr = tl.of(el, { transform: at(from), opacity: 0 }), arrow = tl.of(el.firstElementChild!, { transform: 'none' });
  return {
    // Fades in on its way to `to`.
    enter: (t: number, ms: number, to: Pt) => tr.to(t, ms, { transform: at(to), opacity: 1 }, MOVE),
    move: (t: number, ms: number, to: Pt) => tr.to(t, ms, { transform: at(to) }, MOVE),
    leave: (t: number) => tr.to(t, 220, { opacity: 0 }, 'linear'),
    place: (t: number, to: Pt) => tr.set(t, { transform: at(to) }),
    click(t: number, [x, y]: Pt) {
      arrow.to(t, 90, { transform: 'scale(0.82)' }, 'ease-out').to(t + 90, 160, { transform: 'none' });
      const ring = document.createElement('i');
      ring.className = 'pw-ring';
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      cam.appendChild(ring);
      tl.of(ring, { opacity: 0, transform: 'scale(0.4)' }).set(t, { opacity: 0.9 }).to(t + 1, 520, { opacity: 0, transform: 'scale(1.6)' }, 'ease-out').set(t + 600, { transform: 'scale(0.4)' });
    },
  };
}

// Keys pressed, in a strip at the foot of the view: each press rises, goes down, and leaves before the next one.
function keys(tl: TL, hud: HTMLElement, presses: [number, string[]][]) {
  const pos = (y: number, s = 1) => ({ transform: `translate(-50%, ${y}px) scale(${s})` });
  presses.forEach(([t, caps], i) => {
    const g = document.createElement('div');
    g.className = 'pw-press';
    g.innerHTML = caps.map((c) => `<kbd${c.length > 1 ? ' class="wide"' : ''}>${c}</kbd>`).join('');
    hud.appendChild(g);
    const off = Math.min(t + 720, (presses[i + 1]?.[0] ?? Infinity) - 300);
    tl.of(g, { opacity: 0, ...pos(10) })
      .to(t - 200, 160, { opacity: 1, ...pos(0) })
      .to(t, 70, pos(2, 0.94), 'ease-out')
      .to(t + 70, 180, pos(0))
      .to(off, 180, { opacity: 0, ...pos(6) }, 'ease-in');
  });
}

/* ---------- the app ---------- */

const ICONS: Record<string, string> = {
  home: '<path d="M2.5 7.2 8 2.8l5.5 4.4V13a.8.8 0 0 1-.8.8H3.3a.8.8 0 0 1-.8-.8z"/><path d="M6.5 13.8V10h3v3.8"/>',
  prospect: '<circle cx="6.5" cy="5.5" r="2.5"/><path d="M2.5 13.5c.5-2.3 2-3.6 4-3.6"/><circle cx="10.8" cy="10.8" r="2"/><path d="m12.3 12.3 1.4 1.4"/>',
  mail: '<rect x="2" y="3.5" width="12" height="9" rx="2"/><path d="m2.8 5 5.2 4 5.2-4"/>',
  note: '<path d="M4 2h5.5L12 4.5V14H4z"/><path d="M6 8h4M6 10.5h4"/>',
  task: '<rect x="2.5" y="2.5" width="11" height="11" rx="3"/><path d="m5.5 8.2 1.8 1.8 3.3-3.6"/>',
  cal: '<rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>',
  list: '<rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2"/><rect x="9" y="9" width="4.5" height="4.5" rx="1.2"/>',
  seq: '<circle cx="4" cy="4" r="1.6"/><circle cx="12" cy="12" r="1.6"/><path d="M4 5.6V9a3 3 0 0 0 3 3h3.4"/>',
  chart: '<rect x="2.5" y="2.5" width="11" height="11" rx="2.5"/><path d="M5.5 10.5V8M8 10.5V5.5M10.5 10.5V7"/>',
  building: '<rect x="3" y="2.5" width="10" height="11" rx="1.5"/><path d="M6 5.5h1M9 5.5h1M6 8h1M9 8h1M7 13.5V11h2v2.5"/>',
  deal: '<circle cx="8" cy="8" r="5.5"/><path d="M9.8 6.2c-.3-.6-1-.9-1.8-.9-1 0-1.8.5-1.8 1.3 0 1.8 3.7.9 3.7 2.8 0 .8-.8 1.3-1.9 1.3-.8 0-1.6-.4-1.9-1M8 4.2v1.1M8 10.7v1.1"/>',
  person: '<circle cx="8" cy="5.5" r="2.6"/><path d="M3 13.5c.7-2.5 2.6-3.8 5-3.8s4.3 1.3 5 3.8"/>',
  back: '<path d="M13 8H3.5M7.5 4 3.5 8l4 4"/>',
  bell: '<path d="M4 11.5V7.5a4 4 0 0 1 8 0v4l1 1.2H3z"/><path d="M6.8 14.2a1.4 1.4 0 0 0 2.4 0"/>',
  search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  chev: '<path d="m4.5 6.5 3.5 3.5 3.5-3.5"/>',
  panel: '<rect x="2.5" y="3" width="11" height="10" rx="2"/><path d="M6.5 3v10"/>',
  spark: '<path d="M8 2.5 9.2 6.8 13.5 8 9.2 9.2 8 13.5 6.8 9.2 2.5 8 6.8 6.8z"/>',
  lines: '<path d="M3 4.5h10M3 8h10M3 11.5h6"/>',
  comment: '<path d="M3 3.5h10v7H7l-3 2.5v-2.5H3z"/>',
  tag: '<path d="M2.5 2.5h5l6 6-5 5-6-6z"/><circle cx="5.5" cy="5.5" r=".9"/>',
  globe: '<circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.6 1.6 2.4 3.5 2.4 5.5S9.6 11.9 8 13.5C6.4 11.9 5.6 10 5.6 8S6.4 4.1 8 2.5z"/>',
  video: '<rect x="2" y="4.5" width="8.5" height="7" rx="1.6"/><path d="m10.5 7 3.5-2v6l-3.5-2"/>',
  mic: '<rect x="5.5" y="2" width="5" height="8" rx="2.5"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2"/>',
  check: '<path d="m3.5 8.5 3 3 6-6.5"/>',
  redo: '<path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5V5h-2.5"/>',
  refine: '<path d="M3 4.5h10M5 8h6M6.5 11.5h3"/>',
  x: '<path d="m4.5 4.5 7 7M11.5 4.5l-7 7"/>',
};
const ic = (k: string) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

const NAV = [['home', 'Home'], ['prospect', 'Prospecting'], ['mail', 'Outreach'], ['note', 'Notes'], ['task', 'Tasks'], ['cal', 'Calendar'], ['list', 'Lists'], ['seq', 'Sequences'], ['chart', 'Reports']];
const ENTITIES = [['#a78bfa', 'Meetings'], ['#fbbf24', 'People'], ['#4ade80', 'Deals'], ['#60a5fa', 'Companies']];
const side = (on: string) => `
  <aside class="pw-side">
    <div class="pw-ws"><span class="pw-logo"></span>Impulse${ic('chev')}<span class="pw-tg">${ic('panel')}</span></div>
    <div class="pw-find">${ic('search')}Search<kbd>⌘ K</kbd></div>
    <nav class="pw-nav">${NAV.map(([k, t]) => `<a${t === on ? ' class="on" data-k="nav-' + t.toLowerCase() + '"' : ` data-k="nav-${t.toLowerCase()}"`}>${ic(k)}${t}</a>`).join('')}</nav>
    <div class="pw-sec">Entities${ic('plus')}</div>
    <nav class="pw-nav pw-ent">${ENTITIES.map(([c, t]) => `<a${t === on ? ' class="on"' : ''}><i style="background:${c}"></i>${t}</a>`).join('')}</nav>
  </aside>`;
const top = (crumb: string) => `<header class="pw-top">${ic('back')}<span class="pw-crumb">${crumb}</span><span class="pw-foryou">${ic('bell')}For you</span><span class="pw-me">E</span></header>`;

const FIELDS = [['tag', 'Name', 'Acme Corp'], ['globe', 'Domain', 'acme.com'], ['building', 'Industry', 'Manufacturing'], ['person', 'Employees', '1,200'], ['deal', 'Deal stage', 'Proposal'], ['person', 'Primary contact', 'Jane Cooper'], ['person', 'Owner', 'Emmanuel']];
const company = () => `
  <div class="pw-page" data-k="p-company">${side('Companies')}
    ${top(`<i class="pw-tile2">${ic('building')}</i>Companies<em>/</em><i class="pw-av">A</i>Acme Corp`)}
    <section class="pw-rec">
      <div class="pw-tabs"><span class="on">${ic('lines')}Details</span><span>${ic('comment')}Comments</span></div>
      <div class="pw-rh">Record details${ic('chev')}<span>${ic('spark')}Enrich record</span></div>
      ${FIELDS.map(([k, l, v]) => `<div class="pw-f">${ic(k)}<span>${l}</span><b>${v}</b></div>`).join('')}
      <div class="pw-more">Show less</div>
      <div class="pw-rh">Lists${ic('chev')}</div>
    </section>
    <section class="pw-ov">
      <div class="pw-tabs">${['Overview', 'Activity', 'Email', 'Calendar', 'Tasks', 'Notes', 'Files'].map((t, i) => `<span${i ? '' : ' class="on"'}>${t}</span>`).join('')}</div>
      <div class="pw-banner"></div>
      <div class="pw-id"><i class="pw-big">A</i><div><b>Acme Corp</b><span>acme.com · Manufacturing · 1,200 people</span></div></div>
      <p class="pw-about">Acme Corp makes industrial equipment for factories across West Africa and Europe. They’re reviewing our proposal for 120 seats, and pricing is the open question.</p>
      <div class="pw-cols">
        <div><h4>Pulse suggests</h4>
          <div class="pw-sug">You have a meeting with Acme Corp on Monday at 10 AM. Set a reminder and add notes ahead of it?<span>Set the reminder</span></div>
          <div class="pw-sug">Jane hasn’t replied to the proposal yet. Follow up while it’s fresh?<span>Draft a follow-up</span></div></div>
        <div><h4>Upcoming meetings</h4>${[['Proposal review', 'Mon · 10:00 – 11:00 AM'], ['Pricing walkthrough', 'Wed · 2:00 – 2:30 PM']].map(([t, w]) => `
          <div class="pw-meet"><b>${t}</b><small>${w}</small><span>${ic('video')}Join meet</span><span class="ok">${ic('check')}Attending</span></div>`).join('')}</div>
      </div>
    </section>
  </div>`;

const TASKS = [
  ['Follow up with Acme Corp', 'Acme Corp', '#16151c', 'Today, 10:00 AM', 'prog', 'In progress'],
  ['Q4 planning sync with Marketing', 'Marketing', '#a78bfa', 'Today, 2:00 PM', 'todo', 'To do'],
  ['Review feedback on Ticket #456', 'Globex', '#e5484d', 'Today', 'todo', 'To do'],
  ['Update the CRM contact list', 'Internal', '#9a9aa3', 'This week', 'todo', 'To do'],
  ['Prepare the Northwind demo', 'Northwind', '#2f6fe4', 'Tomorrow', 'todo', 'To do'],
  ['Send Globex the contract redlines', 'Globex', '#e5484d', 'Fri', 'done', 'Done'],
];
const tasks = () => `
  <div class="pw-page" data-k="p-tasks">${side('Tasks')}
    ${top(`<i class="pw-tile2">${ic('task')}</i>Tasks`)}
    <section class="pw-list">
      <div class="pw-lh"><h3>Tasks</h3><span class="pw-count">6</span><span class="pw-seg"><span class="on">List</span><span>Board</span></span><span class="pw-new">${ic('plus')}New task</span></div>
      <div class="pw-filters"><span class="on">All tasks</span><span>Assigned to me</span><span>Due today</span></div>
      <div class="pw-tr pw-th"><span>Task</span><span>Related to</span><span>Due</span><span>Assignee</span><span>Status</span></div>
      ${TASKS.map(([t, rel, c, due, st, sl]) => `<div class="pw-tr"><span><i class="pw-ck${st === 'done' ? ' on' : ''}"></i>${t}</span><span><i class="pw-av" style="background:${c}">${rel[0]}</i>${rel}</span><span${due.startsWith('Today') ? ' class="today"' : ''}>${due}</span><span><i class="pw-me sm">E</i></span><span><em class="pw-st st-${st}">${sl}</em></span></div>`).join('')}
    </section>
  </div>`;

/* ---------- the bar ---------- */

const FOLLOW = 'Ask a follow up question or search for something else.';
const head = {
  input: (k: string, typed: [string, string][], ph = 'Search or ask Pulse AI…', logo = true) =>
    `<div class="pl-hv" data-k="${k}">${PI.search}<span class="pl-input">${typed.map(([key, t]) => letters(t, key)).join('')}<i class="pw-caret" data-k="${k}-caret"></i><span class="pl-ph${logo ? '' : ' pw-dark'}" data-k="${k}-ph">${ph}</span></span>${logo ? '<span class="pl-logo"><i class="ring"></i></span>' : ''}</div>`,
  looking: (k: string) => `<div class="pl-hv" data-k="${k}">${PI.spin}<span class="pl-input">Pulse AI is looking for the information you requested</span><span class="pl-stop" data-k="${k}-stop"><i></i>Stop</span></div>`,
  back: (k: string) => `<div class="pl-hv" data-k="${k}"><span class="pw-backb">${ic('back')}</span><span class="pl-input">Go back to search</span><span class="pl-logo"><i class="ring"></i></span></div>`,
};

type Row = [title: string, kind: string, icon: string];
const row = ([t, kind, icon]: Row, k: string, at?: number) =>
  `<div class="pl-row${at === undefined ? '' : ' pw-alt'}" data-k="${k}"${at === undefined ? '' : ` style="top:${at * 52}px"`}><span class="pl-tile">${ic(icon)}</span>${t}<span>${kind}</span></div>`;
// The sparkle's gradient gets its own id: the cover's copy sits in a hidden layer, and a gradient referenced there doesn't paint.
const SPARKLE = PI.sparkle.replace(/spk/g, 'pw-spk');
const UP_ON = PI.up.replace('fill="none" stroke="currentColor"', 'fill="#6d4fe0" stroke="#6d4fe0"');
const SOURCES = [['red', 'Q4 Planning sync with marketing'], ['', 'Follow up with Acme Corp'], ['', 'Review Ticket #456 feedback']];
const PROMPTS: Row[] = [['Create meeting note', 'notes', 'note'], ['Create report', 'reports', 'chart'], ['Create email', 'outreach', 'mail']];

const view = {
  // Ask Pulse AI first, with the words as typed, then the records they match. `alt` stands in for a row once more is typed.
  search: (k: string, q: [string, string], rows: Row[], alt?: [number, Row]) => `<div class="pw-v" data-k="${k}">
      <div class="pl-ask" data-k="${k}-ask"><span class="pl-tile"><i class="ring"></i></span><span class="pw-askq">${letters(q[1], q[0])}</span><span class="pl-ask-tag">&nbsp;-&nbsp; Ask Pulse AI</span><span class="pl-kbd">⌘↵</span></div>
      <div class="pl-label" data-k="${k}-label">Result</div>
      <div class="pw-rows"><i class="pw-hl" data-k="${k}-hl"></i>${rows.map((r, i) => row(r, `${k}-r${i}`)).join('')}${alt ? row(alt[1], `${k}-alt`, alt[0]) : ''}</div>
    </div>`,
  looking: (k: string, q: string) => `<div class="pw-v" data-k="${k}">
      <div class="pl-query">${SPARKLE}<span class="grad">${q}</span></div>
      <p class="pl-note">Review all AI-generated outputs for relevance and appropriateness before use.</p>
      <div class="pl-skel"><i style="width:30%"></i><i style="width:70%"></i><i style="width:45%"></i><i style="width:32%"></i></div>
    </div>`,
  answer: (k: string, q: string, paras: string[]) => `<div class="pw-v" data-k="${k}">
      <div class="pl-query">${SPARKLE}<span class="grad">${q}</span></div>
      <p class="pl-note">Review all AI-generated outputs for relevance and appropriateness before use.</p>
      <div class="pw-stack">
        <div class="pw-ans" data-k="${k}-box">${paras.map((p) => `<p>${words(p)}</p>`).join('')}</div>
        <div class="pl-skel" data-k="${k}-skel"><i style="width:30%"></i><i style="width:70%"></i><i style="width:45%"></i><i style="width:32%"></i></div>
      </div>
      <div class="pl-react" data-k="${k}-react"><span class="pw-up" data-k="${k}-up">${PI.up}<i data-k="${k}-upon">${UP_ON}</i></span>${PI.down}${PI.redo}${PI.copy}</div>
      <div class="pl-chips" data-k="${k}-chips"><span class="pl-chip pw-chip" data-k="${k}-c0">Remind me at 9:30 AM<b data-k="${k}-c0on">${ic('check')}Reminder set · 9:30 AM</b></span><span class="pl-chip">Add Zoom link to notes</span><span class="pl-chip">Move CRM update to tomorrow</span></div>
      <div class="pl-src" data-k="${k}-src"><p class="pl-srcl">Source</p><div class="pl-cards">${SOURCES.map(([c, t], i) => `
        <div class="pl-card" data-k="${k}-s${i}"><span class="pl-tile ${c}">${c ? PI.clip : PI.mail}</span><b>${t}</b>Assigned to you<em data-k="${k}-s${i}-open">Open ↗</em></div>`).join('')}</div></div>
    </div>`,
  prompts: (k: string) => `<div class="pw-v" data-k="${k}"><div class="pl-label pw-ail">AI Prompts ${SPARKLE}</div>
      <div class="pw-rows"><i class="pw-hl" data-k="${k}-hl"></i>${PROMPTS.map((r, i) => row(r, `${k}-r${i}`)).join('')}</div></div>`,
};

const DICTATED = 'Help me draft a professional email to Acme Corp following up on our proposal. Remind them about the updated pricing sheet and ask if they need anything else before deciding. Keep it polite and concise.';
const LONG = ['Hi Jane,', 'I hope this email finds you well. I wanted to follow up on the proposal we sent over last week. As discussed, I’ve attached the updated pricing sheet for your reference.',
  'Please let me know if you have any questions or need anything else to move forward. I’m happy to set up a call or share more details at your convenience.', 'Looking forward to your feedback.', 'Warm regards,<br>Emmanuel'];
const SHORT = ['Hi Jane,', 'Following up on last week’s proposal: the updated pricing sheet is attached.', 'Is there anything else you need before deciding? Happy to set up a call.', 'Best,<br>Emmanuel'];
// /create's composer: a prompt to start from, which becomes the draft (`draft` adds the email, Refine and Send).
const compose = (k: string, draft: boolean) => `<div class="pw-v" data-k="${k}"><div class="pw-scroll" data-k="${k}-scroll">
    <div class="pl-query">${SPARKLE}<span class="grad">Compose an email</span></div>
    <p class="pl-note">Pulse AI uses natural language to handle tasks such as creating and editing events, setting reminders and scheduling meetings.</p>
    <div class="pw-card">
      <div class="pw-card-h"><i class="pw-gm"></i><b>Outreach</b><span>from your connected inbox</span></div>
      <div class="pw-panes" data-k="${k}-panes">
        <div class="pw-prompt" data-k="${k}-prompt">
          <div class="pw-ta"><span class="pw-ph2" data-k="${k}-ph">What’s the email about, and who’s it for?</span>${draft ? `<p data-k="${k}-said">${words(DICTATED)}</p>` : ''}</div>
          <div class="pw-tools"><span class="pw-tb pw-mic" data-k="${k}-mic">${ic('mic')}<i data-k="${k}-micon">${ic('mic')}</i></span><span class="pw-tb">${ic('plus')}</span>
            <span class="pw-wave" data-k="${k}-wave">${'<i></i>'.repeat(16)}</span><span class="pw-run">Run<i data-k="${k}-run">Run</i></span></div>
        </div>${draft ? `
        <div class="pw-mail" data-k="${k}-mail">
          <div class="pw-mail-in">
            <div class="pw-mf" data-k="${k}-to"><span>To:</span><span class="pw-rcp"><i class="pw-av">J</i>Jane Cooper</span><em>Acme Corp</em></div>
            <div class="pw-mf" data-k="${k}-subj"><span>Subject:</span><b>Following up on our proposal</b></div>
            <div class="pw-mb"><div data-k="${k}-long">${LONG.map((p) => `<p>${words(p)}</p>`).join('')}</div><div class="pw-short" data-k="${k}-short">${SHORT.map((p) => `<p>${p}</p>`).join('')}</div><i class="pw-sheen" data-k="${k}-sheen"></i></div>
            <div class="pw-att" data-k="${k}-att"><i class="pw-pdf">PDF</i>Updated Pricing Sheet.pdf${ic('x')}</div>
          </div>
          <div class="pw-acts" data-k="${k}-acts"><span>${ic('redo')}Recreate</span><span data-k="${k}-refine">${ic('refine')}Refine${ic('chev')}</span><span class="pw-edit">Edit</span>
            <span class="pw-send" data-k="${k}-send">Send<b data-k="${k}-sent">${ic('check')}Sent</b></span>
            <div class="pw-menu" data-k="${k}-menu"><i class="pw-mhl" data-k="${k}-mhl"></i><span data-k="${k}-m0">Shorter</span><span>More formal</span><span>Friendlier</span></div></div>
        </div>` : ''}
      </div>
    </div>
  </div></div>`;

const bar = (heads: string, views: string) => `<div class="pw-bar" data-k="bar"><div class="pl-head">${heads}</div><div class="pw-body">${views}</div></div>`;

/* ---------- a scene: the window on its wallpaper, filmed ---------- */

function scene(el: HTMLElement, o: { label: string; loop: number; poster: number; pages: string; bar: string; over?: string }) {
  el.classList.add('fl-web');
  el.innerHTML = `<div class="pw" role="img" aria-label="${o.label}">
      <div class="pw-cam"><div class="pw-win">${o.pages}<i class="pw-wash" data-k="wash"></i>${o.bar}</div></div>
      <div class="pw-hud"></div>${o.over ?? ''}
    </div>${CONTROLS}`;
  const pw = el.querySelector<HTMLElement>('.pw')!;
  // The view is drawn at 720 wide and scaled to the panel, on the page and up close.
  const fit = () => pw.style.setProperty('--fit', String(el.clientWidth / W || 1));
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  const q = (k: string) => el.querySelector<HTMLElement>(`[data-k="${k}"]`)!;
  const tl = timeline(o.loop);
  const win = el.querySelector<HTMLElement>('.pw-win')!, cam = el.querySelector<HTMLElement>('.pw-cam')!;
  return {
    q, tl, cam, win,
    hud: el.querySelector<HTMLElement>('.pw-hud')!,
    at: (k: string, rx = 0.5, ry = 0.5) => spot(win, q(k), rx, ry),
    // Shown at once (o = 1) or not, then faded at each time in `fades`.
    fade: (k: string, from: 0 | 1, ...fades: [number, number, number?][]) => fades.reduce((tr, [t, v, ms = 200]) => tr.to(t, ms, { opacity: v }, 'ease-out'), tl.of(q(k), { opacity: from })),
    // Start playing; with reduced motion, hold on the poster frame instead.
    run() {
      const anims = tl.play(), stop = player(el, anims);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) anims.forEach((a) => { a.currentTime = o.poster; });
      return () => { ro.disconnect(); stop(); };
    },
  };
}
const appear = (tl: TL, el: Element, t: number, dy = 4) => tl.of(el, { opacity: 0, transform: `translateY(${dy}px)` }).to(t, 280, { opacity: 1, transform: 'none' });
const press = (tl: TL, el: Element, t: number, s = 0.985) => tl.of(el, { transform: 'none' }).to(t, 80, { transform: `scale(${s})` }, 'ease-out').to(t + 80, 180, { transform: 'none' });

/*
  Anywhere (What shipped): the whole window over a company record. ⌘K washes the page out and opens the bar as
  the camera pushes in; then its three jobs, one after another: "northwind" finds records, "What's due today?"
  is asked with ⌘↵ and answered, and /create lists what Pulse can make, ↓↓↵ opening the email composer. Esc,
  and the camera pulls back to the page.
*/
const ANY_LOOP = 14000;
const NW: Row[] = [['Northwind', 'Companies', 'building'], ['Prepare the Northwind demo', 'Tasks', 'task'], ['Northwind expansion', 'Deals', 'deal'], ['Sales pitch with Northwind', 'Calendar', 'cal']];
const DUE: Row[] = [['Follow up with Acme Corp', 'Tasks', 'task'], ['Q4 planning sync with Marketing', 'Calendar', 'cal'], ['Review feedback on Ticket #456', 'Tasks', 'task']];
const DUE_ANSWER = ['Three things are due today, Saturday, September 27.',
  'Follow up with Acme Corp about their proposal by 10:00 AM, with the updated pricing sheet attached. The Q4 planning sync with Marketing is at 2:00 PM; the Zoom link is in your calendar.',
  'Before the end of the day, review the customer feedback on Ticket #456.'];

function anywhere(el: HTMLElement) {
  const s = scene(el, {
    label: 'Impulse, open on a company record. Command K opens Pulse over it: it finds Northwind’s records, answers what’s due today with its sources, and /create opens the email composer. Escape returns to the record.',
    loop: ANY_LOOP, poster: 7200, pages: company(),
    bar: bar(head.input('hi', [['q1', 'northwind'], ['q2', 'What’s due today?']]) + head.looking('hl') + head.input('hf', [['q3', '/create']], FOLLOW, false) + head.back('hb'),
      view.search('s1', ['q1m', 'northwind'], NW) + view.search('s2', ['q2m', 'What’s due today?'], DUE) + view.answer('an', 'What’s due today?', DUE_ANSWER) + view.prompts('pr') + compose('cm', false)),
    over: `<div class="pw-mode">${['Search', 'Ask', 'Compose'].map((m, i) => `<span data-k="m${i}"><b>${i + 1}</b>${m}</span>`).join('')}</div>`,
  });
  const { q, tl, fade } = s;
  const t1 = keystrokes('northwind', 1500, 72), t2 = keystrokes('What’s due today?', 3100, 58), t3 = keystrokes('/create', 8200, 80);
  const OPEN = 900, ASK = 4600, ANSWER = 5500, DONE = 6700, PICK = 10000, ESC = 11500;

  tl.of(s.cam, shot(WIDE)).to(OPEN, 1000, shot(WHOLE), MOVE).to(PICK + 100, 800, shot([721, 405, 1.02]), MOVE).to(ESC, 1000, shot(WIDE), MOVE);
  keys(tl, s.hud, [[OPEN, ['⌘', 'K']], [ASK - 100, ['⌘', '↵']], [9100, ['↓']], [9500, ['↓']], [PICK - 100, ['↵']], [ESC - 100, ['esc']]]);
  fade('wash', 0, [OPEN, 1, 250], [ESC, 0, 250]);
  tl.of(q('bar'), { opacity: 0, transform: 'scale(0.97)' }).to(OPEN, 260, { opacity: 1, transform: 'none' }).to(ESC, 200, { opacity: 0, transform: 'scale(0.98)' }, 'ease-in');
  ['m0', 'm1', 'm2'].forEach((m, i) => fade(m, 0, [[1300, 3050, 8050][i], 1], [[2950, 7950, ESC][i], 0]));

  // 1 · Search: the words find records as they're typed, then go.
  tl.of(q('hi-caret'), { visibility: 'hidden' }).set(OPEN + 100, { visibility: 'visible' }).set(ASK, { visibility: 'hidden' });
  tl.of(q('hi-ph'), { visibility: 'visible' }).set(t1[0], { visibility: 'hidden' });
  grow(tl, q('q1'), t1, 2900); grow(tl, q('q1m'), t1, 2900);
  fade('s1', 0, [t1[0], 1, 160], [2900, 0, 140]);
  NW.forEach((_, i) => appear(tl, q(`s1-r${i}`), t1[1] + i * 45));
  // 2 · Ask: the question, ⌘↵, Pulse looks, and the answer streams in with its sources.
  grow(tl, q('q2'), t2); grow(tl, q('q2m'), t2);
  fade('s2', 0, [t2[0], 1, 160], [ASK, 0, 160]);
  DUE.forEach((_, i) => appear(tl, q(`s2-r${i}`), t2[2] + i * 45));
  press(tl, q('s2-ask'), ASK - 100);
  fade('hi', 1, [ASK, 0, 180]);
  fade('hl', 0, [ASK, 1, 220], [DONE, 0, 180]);
  tl.of(q('an'), { opacity: 0, transform: 'translateY(6px)' }).to(ASK, 280, { opacity: 1, transform: 'none' }).to(t3[0] + 40, 160, { opacity: 0 }, 'ease-in');
  fade('an-skel', 1, [ANSWER, 0, 160]);
  fade('an-box', 0, [ANSWER, 1, 160]);
  stream(tl, q('an-box'), ANSWER + 60, 17);
  appear(tl, q('an-react'), DONE);
  appear(tl, q('an-chips'), DONE + 100);
  appear(tl, q('an-src'), DONE + 220, 8);
  // 3 · Compose: /create in the follow-up, ↓↓ to Create email, ↵ opens its composer.
  fade('hf', 0, [DONE, 1, 220], [PICK, 0, 160]);
  tl.of(q('hf-caret'), { visibility: 'hidden' }).set(7800, { visibility: 'visible' });
  tl.of(q('hf-ph'), { visibility: 'visible' }).set(t3[0], { visibility: 'hidden' });
  grow(tl, q('q3'), t3);
  fade('pr', 0, [t3[0] + 60, 1, 180], [PICK, 0, 160]);
  tl.of(q('pr-hl'), { transform: 'none' }).to(9100, 160, { transform: 'translateY(52px)' }).to(9500, 160, { transform: 'translateY(104px)' });
  fade('hb', 0, [PICK, 1, 220]);
  tl.of(q('cm'), { opacity: 0, transform: 'translateY(6px)' }).to(PICK, 300, { opacity: 1, transform: 'none' });
  return s.run();
}

/*
  Search, by keyboard (One bar): on Tasks, the bar is open. "acme" finds records as it's typed (the third row
  changes as more letters land); ↓ moves to Acme Corp and ↵ opens it, closing the bar. ⌘K again, and a question
  this time: the same list offers to ask it, ⌘↵ does, and Stop hands the bar back while Pulse looks. Esc, a
  click on Tasks, ⌘K, and round again.
*/
const SEARCH_LOOP = 13600;
const ACME: Row[] = [['Follow up with Acme Corp', 'Tasks', 'task'], ['Acme Corp', 'Companies', 'building'], ['Account plan for Q4', 'Notes', 'note'], ['Jane Cooper', 'People', 'person']];
const WHO: Row[] = [['Follow up with Acme Corp', 'Tasks', 'task'], ['Weekly follow-ups', 'Lists', 'list'], ['Prepare the Northwind demo', 'Tasks', 'task']];
const WHO_Q = 'who needs a follow-up this week';

function search(el: HTMLElement) {
  const s = scene(el, {
    label: 'Pulse open over Tasks. Typing “acme” finds records as each letter lands; the down arrow moves to Acme Corp and Enter opens its record. A question typed into the same bar is asked with Command Enter, and Stop hands the bar back while Pulse looks.',
    loop: SEARCH_LOOP, poster: 1800, pages: tasks() + company(),
    bar: bar(head.input('hi', [['q1', 'acme'], ['q2', WHO_Q]]) + head.looking('hl'),
      view.search('s1', ['q1m', 'acme'], ACME, [2, ['Acme Corp renewal', 'Deals', 'deal']]) + view.search('s2', ['q2m', WHO_Q], WHO) + view.looking('lk', WHO_Q)),
  });
  const { q, tl, fade } = s;
  const t1 = keystrokes('acme', 500, 110), t2 = keystrokes(WHO_Q, 4300, 46);
  const OPEN_REC = 2200, REOPEN = 3700, ASK = 6400, STOP = 7700, CLOSE = 9300, TO_TASKS = 10700, BACK = 11700;
  const stop = s.at('hl-stop'), nav = s.at('nav-tasks', 0.3);
  const c = cursor(tl, s.cam, [1010, 600]);

  tl.of(s.cam, shot(TOP)).to(OPEN_REC, 800, shot(PAGE), MOVE).to(REOPEN, 800, shot(TOP), MOVE).to(6900, 800, shot([740, 275, 1.2]), MOVE)
    .to(STOP + 200, 800, shot(TOP), MOVE).to(CLOSE, 800, shot(PAGE), MOVE).to(BACK, 800, shot(TOP), MOVE);
  keys(tl, s.hud, [[1500, ['↓']], [OPEN_REC - 100, ['↵']], [REOPEN - 100, ['⌘', 'K']], [ASK - 100, ['⌘', '↵']], [CLOSE - 100, ['esc']], [BACK - 100, ['⌘', 'K']]]);
  fade('wash', 1, [OPEN_REC, 0, 220], [REOPEN, 1, 220], [CLOSE, 0, 220], [BACK, 1, 220]);
  const shut = { opacity: 0, transform: 'scale(0.98)' }, open = { opacity: 1, transform: 'none' };
  tl.of(q('bar'), open).to(OPEN_REC, 180, shut, 'ease-in').to(REOPEN, 240, open).to(CLOSE, 180, shut, 'ease-in').to(BACK, 240, open);
  // ↵ opens Acme Corp; later, Tasks in the sidebar goes back.
  fade('p-company', 0, [OPEN_REC, 1, 160], [TO_TASKS + 60, 0, 160]);

  // "acme": records as it's typed, the third changing at the fourth letter; ↓ to Acme Corp.
  tl.of(q('hi-ph'), { visibility: 'visible' }).set(t1[0], { visibility: 'hidden' }).set(OPEN_REC + 300, { visibility: 'visible' })
    .set(t2[0], { visibility: 'hidden' }).set(CLOSE + 300, { visibility: 'visible' });
  grow(tl, q('q1'), t1, OPEN_REC + 300); grow(tl, q('q1m'), t1);
  fade('s1', 0, [t1[0], 1, 140], [OPEN_REC + 300, 0, 1]);
  const found = ACME.map((_, i) => appear(tl, q(`s1-r${i}`), t1[1] + i * 45));
  found[2].to(t1[3], 140, { opacity: 0 }, 'ease-out');
  fade('s1-alt', 0, [t1[3], 1, 160]);
  tl.of(q('s1-hl'), { transform: 'none' }).to(1500, 170, { transform: 'translateY(52px)' });

  // A question: the same list offers to ask it; ⌘↵ asks; Stop hands it back.
  grow(tl, q('q2'), t2, CLOSE + 300); grow(tl, q('q2m'), t2);
  fade('s2', 0, [t2[0], 1, 140], [ASK, 0, 140], [STOP + 100, 1, 200], [CLOSE + 300, 0, 1]);
  WHO.forEach((_, i) => appear(tl, q(`s2-r${i}`), t2[4] + i * 45));
  press(tl, q('s2-ask'), ASK - 100);
  fade('hi', 1, [ASK, 0, 160], [STOP + 100, 1, 200]);
  fade('hl', 0, [ASK, 1, 200], [STOP + 100, 0, 160]);
  fade('lk', 0, [ASK, 1, 220], [STOP + 100, 0, 160]);
  tl.of(q('hl-stop'), { backgroundColor: 'rgba(242, 242, 244, 0)' }).to(STOP - 250, 120, { backgroundColor: 'rgba(242, 242, 244, 1)' }).to(STOP + 100, 160, { backgroundColor: 'rgba(242, 242, 244, 0)' });
  c.enter(6900, 600, stop);
  c.click(STOP, stop);
  c.leave(STOP + 500);
  c.place(9800, [760, 640]);
  c.enter(9900, 700, nav);
  c.click(TO_TASKS, nav);
  c.leave(TO_TASKS + 400);
  return s.run();
}

/*
  The answer and its sources (Answers you can check): "What are my tasks for today" is being looked up; the
  answer streams in as the camera follows it down. The cursor rests on a source (it lifts, offering to open the
  record), taps "Remind me at 9:30 AM", which sets the reminder there and then, and gives the answer a thumbs up.
  The camera pulls back to the whole bar, then it's asked again.
*/
const ANSWER_LOOP = 12600;

function answer(el: HTMLElement) {
  const s = scene(el, {
    label: 'Pulse answering “What are my tasks for today”: the answer streams in, then its sources, each a click from its record. A follow-up, Remind me at 9:30 AM, sets the reminder from the answer, and a thumbs up rates it.',
    loop: ANSWER_LOOP, poster: 9400, pages: company(),
    bar: bar(head.looking('hl') + head.input('hf', [], FOLLOW, false), view.answer('an', 'What are my tasks for today', PL_ANSWER)),
  });
  const { q, tl, fade } = s;
  const STREAM = 1000, DONE = 3600, AGAIN = 11000;
  const card = s.at('an-s1'), chip = s.at('an-c0'), up = s.at('an-up');
  const c = cursor(tl, s.cam, [1060, 780]);

  tl.of(s.cam, shot([721, 320, 1.1])).to(STREAM + 100, DONE - STREAM, shot([721, 420, 1.1]), 'ease-in-out')
    .to(4300, 900, shot([card[0] - 40, card[1] - 30, 1.35]), MOVE).to(5600, 700, shot([chip[0] + 60, chip[1] - 20, 1.3]), MOVE)
    .to(7900, 1000, shot(WHOLE), MOVE).to(AGAIN, 1000, shot([721, 320, 1.1]), MOVE);
  fade('wash', 1);
  fade('an', 1);
  fade('hl', 1, [DONE, 0, 180], [AGAIN, 1, 220]);
  fade('hf', 0, [DONE, 1, 220], [AGAIN, 0, 180]);
  fade('an-skel', 1, [STREAM, 0, 160], [AGAIN + 100, 1, 200]);
  fade('an-box', 0, [STREAM, 1, 160], [AGAIN, 0, 200]);
  stream(tl, q('an-box'), STREAM + 60, 17, AGAIN + 300);
  ['an-react', 'an-chips', 'an-src'].forEach((k, i) => tl.of(q(k), { opacity: 0, transform: `translateY(${4 + 2 * i}px)` }).to(DONE + i * 120, 280, { opacity: 1, transform: 'none' }).to(AGAIN, 200, { opacity: 0 }, 'ease-in'));

  // A source lifts under the cursor, offering its record; the follow-up sets the reminder; a thumbs up.
  c.enter(4300, 700, [card[0] + 10, card[1] + 6]);
  tl.of(q('an-s1'), { transform: 'none', borderColor: '#e7e7ea', boxShadow: '0 0 0 0 rgba(31, 24, 70, 0)' })
    .to(4950, 220, { transform: 'translateY(-2px)', borderColor: '#cfc4f7', boxShadow: '0 8px 18px rgba(31, 24, 70, 0.1)' }).to(5650, 200, { transform: 'none', borderColor: '#e7e7ea', boxShadow: '0 0 0 0 rgba(31, 24, 70, 0)' });
  fade('an-s1-open', 0, [4950, 1, 220], [5650, 0, 160]);
  c.move(5600, 550, chip);
  c.click(6200, chip);
  press(tl, q('an-c0'), 6200, 0.95);
  fade('an-c0on', 0, [6300, 1, 240], [AGAIN, 0, 200]);
  c.move(6900, 500, up);
  c.click(7450, up);
  fade('an-upon', 0, [7500, 1, 120], [AGAIN, 0, 200]);
  tl.of(q('an-up'), { transform: 'none' }).to(7500, 140, { transform: 'scale(1.3)' }, 'ease-out').to(7640, 260, { transform: 'none' });
  c.leave(8100);
  return s.run();
}

/*
  Compose (Start from the job): "/create" lists what Pulse can make; the cursor picks Create email and its
  composer opens. Dictated, the prompt arrives word by word; Run turns it into the email (recipient, subject,
  body, the pricing sheet attached) as the card grows. Refine › Shorter rewrites it in place, and the person
  presses Send.
*/
const COMPOSE_LOOP = 15600;

function composeFlow(el: HTMLElement) {
  const s = scene(el, {
    label: '/create in Pulse lists what it can make. Create email opens a composer; a dictated prompt becomes a draft to Jane Cooper at Acme Corp with the pricing sheet attached. Refine makes it shorter, and the person presses Send.',
    loop: COMPOSE_LOOP, poster: 10200, pages: company(),
    bar: bar(head.input('hi', [['q3', '/create']]) + head.back('hb'), view.prompts('pr') + compose('cm', true)),
  });
  const { q, tl, fade } = s;
  const t3 = keystrokes('/create', 500, 85);
  const PICK = 2200, OPEN = 2300, MIC = 3900, MIC_OFF = 6900, RUN = 7900, GROW = 8100, REFINE = 11000, SHORTER = 11900, SEND = 13300, RESET = 14600;
  // The prompt becomes the email: the panes grow to the email's height and the composer scrolls to keep its foot in view.
  const panes = q('cm-panes'), promptH = q('cm-prompt').offsetHeight, mailH = q('cm-mail').offsetHeight;
  const cardBottom = spot(q('cm-scroll'), panes)[1] - 0.5 * panes.offsetHeight + mailH + 22;
  const scroll = Math.max(0, cardBottom - 530);
  const item = s.at('pr-r2', 0.42), mic = s.at('cm-mic'), run = s.at('cm-run');
  const lift = ([x, y]: Pt): Pt => [x, y - scroll];
  // Shorter rewrites the body in place and the email closes up under it, taking Send up with it.
  const long = q('cm-long'), mb = long.parentElement!, cut = long.offsetHeight - q('cm-short').offsetHeight;
  const refine = lift(s.at('cm-refine')), shorter = lift(s.at('cm-m0', 0.3)), send = lift(s.at('cm-send'));
  send[1] -= cut;
  const c = cursor(tl, s.cam, [1070, 720]);

  tl.of(s.cam, shot(TOP)).to(OPEN, 800, shot([721, 392, 1.12]), MOVE).to(GROW, 900, shot([721, 492, 1.04]), MOVE)
    .to(10300, 700, shot([refine[0] + 70, refine[1] - 90, 1.25]), MOVE).to(12500, 700, shot([691, send[1] - 170, 1.15]), MOVE)
    .to(RESET, 900, shot(TOP), MOVE);
  fade('wash', 1);
  fade('hi', 1, [OPEN, 0, 160], [RESET, 1, 220]);
  fade('hb', 0, [OPEN, 1, 220], [RESET, 0, 160]);
  tl.of(q('hi-ph'), { visibility: 'visible' }).set(t3[0], { visibility: 'hidden' }).set(RESET, { visibility: 'visible' });
  grow(tl, q('q3'), t3, RESET);

  // /create, and Create email picked with the cursor.
  fade('pr', 0, [t3[0] + 40, 1, 180], [OPEN, 0, 150]);
  PROMPTS.forEach((_, i) => appear(tl, q(`pr-r${i}`), t3[0] + 60 + i * 50));
  tl.of(q('pr-hl'), { transform: 'none' }).to(1950, 160, { transform: 'translateY(104px)' });
  c.enter(1400, 600, item);
  c.click(PICK, item);
  tl.of(q('cm'), { opacity: 0, transform: 'translateY(6px)' }).to(OPEN, 300, { opacity: 1, transform: 'none' }).to(RESET, 200, { opacity: 0 }, 'ease-in');

  // Said, not typed: the mic listens and the words arrive; Run lights up when it stops.
  c.move(3300, 500, mic);
  c.click(MIC, mic);
  fade('cm-micon', 0, [MIC + 50, 1, 160], [MIC_OFF + 50, 0, 160]);
  fade('cm-wave', 0, [MIC + 50, 1, 200], [MIC_OFF + 50, 0, 200]);
  tl.of(q('cm-ph'), { visibility: 'visible' }).set(MIC + 150, { visibility: 'hidden' });
  stream(tl, q('cm-said'), MIC + 250, 52);
  c.click(MIC_OFF, mic);
  fade('cm-run', 0, [MIC_OFF + 100, 1, 200]);
  c.move(7300, 500, run);
  c.click(RUN, run);

  // Run: the prompt gives way to the email, which writes itself in.
  fade('cm-prompt', 1, [GROW, 0, 160]);
  tl.of(panes, { height: promptH + 'px' }).to(GROW, 650, { height: mailH + 'px' }).to(SHORTER + 350, 420, { height: mailH - cut + 'px' });
  tl.of(q('cm-scroll'), { transform: 'none' }).to(GROW, 650, { transform: `translateY(${-scroll}px)` });
  fade('cm-mail', 0, [GROW + 150, 1, 200]);
  appear(tl, q('cm-to'), GROW + 300);
  appear(tl, q('cm-subj'), GROW + 420);
  const written = stream(tl, q('cm-long'), GROW + 600, 9);
  appear(tl, q('cm-att'), written + 100, 6);
  appear(tl, q('cm-acts'), written + 250, 6);

  // Refine › Shorter rewrites it in place; then Send, pressed by the person.
  c.move(10400, 500, refine);
  c.click(REFINE, refine);
  tl.of(q('cm-menu'), { opacity: 0, transform: 'translateY(6px) scale(0.98)' }).to(REFINE + 60, 180, { opacity: 1, transform: 'none' }).to(SHORTER + 60, 140, { opacity: 0, transform: 'translateY(4px) scale(0.98)' }, 'ease-in');
  c.move(11400, 350, shorter);
  fade('cm-mhl', 0, [11700, 1, 120]);
  c.click(SHORTER, shorter);
  fade('cm-long', 1, [SHORTER + 150, 0, 260]);
  fade('cm-short', 0, [SHORTER + 300, 1, 300]);
  tl.of(mb, { height: mb.offsetHeight + 'px' }).to(SHORTER + 350, 420, { height: mb.offsetHeight - cut + 'px' });
  tl.of(q('cm-sheen'), { transform: 'translateX(-110%)' }).to(SHORTER + 100, 700, { transform: 'translateX(110%)' }, 'ease-in-out');
  c.move(12700, 500, send);
  c.click(SEND, send);
  press(tl, q('cm-send'), SEND, 0.94);
  fade('cm-sent', 0, [SEND + 80, 1, 200]);
  c.leave(SEND + 600);
  return s.run();
}

export const PULSE_FLOWS: Record<string, (el: HTMLElement) => () => void> = {
  'pulse-anywhere': anywhere,
  'pulse-search': search,
  'pulse-answer': answer,
  'pulse-compose': composeFlow,
};
