/*
  The two live covers, drawn in code: Pulse's command bar and "a day with Pulse".
  Markup is plain HTML so the server can render it into a card and the reels can rebuild it;
  each is drawn at a fixed size and scaled to its box with --k.
*/

const I = {
  search: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg>',
  mail: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="4.5" width="15" height="11" rx="2.5"/><path d="m3.5 6 6.5 5 6.5-5"/></svg>',
  clip: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="4" y="3.5" width="12" height="14" rx="2.5"/><path d="M7.5 3.5h5v2.5h-5zM7 10l1.5 1.5L11 9M7 14h6"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24"><defs><linearGradient id="spk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c084fc"/><stop offset=".55" stop-color="#f59e7c"/><stop offset="1" stop-color="#8b7cf6"/></linearGradient></defs><g fill="none" stroke="url(#spk)" stroke-width="1.5" stroke-linejoin="round"><path d="M10 4.5 11.6 9 16 10.5 11.6 12 10 16.5 8.4 12 4 10.5 8.4 9z"/><path d="M17.5 3v3M16 4.5h3M18 15.5v2.5M16.8 16.8h2.5"/></g></svg>',
  spin: '<svg class="pl-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
  up: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M6 9v8H3.5V9zM6 9l3.5-6c1.4 0 2 .9 1.7 2.3L10.8 8H15a1.6 1.6 0 0 1 1.6 1.9l-1 5.6A1.8 1.8 0 0 1 13.8 17H6"/></svg>',
  down: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M6 11V3H3.5v8zM6 11l3.5 6c1.4 0 2-.9 1.7-2.3L10.8 12H15a1.6 1.6 0 0 0 1.6-1.9l-1-5.6A1.8 1.8 0 0 0 13.8 3H6"/></svg>',
  redo: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3h-3"/></svg>',
  copy: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M13 7V5.5A2.5 2.5 0 0 0 10.5 3h-5A2.5 2.5 0 0 0 3 5.5v5A2.5 2.5 0 0 0 5.5 13H7"/></svg>',
};
const PL_ROWS: [string, string][] = [['Meeting with Kinfolk CEO', 'Tasks'], ['New push test', 'Tasks'], ['Press Emmax neck', 'Tasks'], ['Sales Pitch Meeting', 'Calendar']];
export const PL_ANSWER = [
  'Here’s a quick rundown of what’s on your plate for today, Saturday, September 27, 2025',
  'You’ve got a busy but manageable day ahead. First up, you need to follow up with Acme Corp about their proposal by 10:00 AM—don’t forget to attach the updated pricing sheet. Then, at 2:00 PM, you’ve got the Q4 planning sync with the Marketing Team; the Zoom link is already in your calendar.',
  'There’s also a high-priority task to review customer feedback for Ticket #456 before the end of the day. And whenever you get a chance, try to update the CRM contact list—it’s not urgent, but it’ll help keep things organized.',
];
export const PL_INNER = `
  <div class="pl-head">
    <div class="pl-hv on">${I.search}<span class="pl-input"><span class="pl-q"></span><span class="pl-ph">Search or ask Pulse AI…</span></span><span class="pl-logo"><i class="ring"></i></span></div>
    <div class="pl-hv">${I.spin}<span class="pl-input">Pulse AI is looking for the information you requested</span><span class="pl-stop"><i></i>Stop</span></div>
    <div class="pl-hv">${I.search}<span class="pl-input">Ask a follow up question or search for something else.</span></div>
  </div>
  <div class="pl-body">
    <div class="pl-a">
      <div class="pl-ask" style="opacity:0"><span class="pl-tile"><i class="ring"></i></span><span class="pl-ask-q"></span><span class="pl-ask-tag">&nbsp;-&nbsp; Ask Pulse AI</span><span class="pl-kbd">⌘↵</span></div>
      <div class="pl-label" style="opacity:0">Result</div>
      ${PL_ROWS.map(([t, k], i) => `<div class="pl-row${i ? '' : ' hl'}" style="opacity:0"><span class="pl-tile">${I.mail}</span>${t}<span>${k}</span></div>`).join('')}
    </div>
    <div class="pl-b">
      <div class="pl-query">${I.sparkle}<span class="grad">What are my tasks for today</span></div>
      <p class="pl-note">Review all AI-generated outputs for relevance and appropriateness before use.</p>
      <div class="pl-skel"><i style="width:30%"></i><i style="width:70%"></i><i style="width:45%"></i><i style="width:32%"></i></div>
      <div class="pl-answer">
        ${PL_ANSWER.map(() => '<p></p>').join('')}
        <div class="pl-react">${I.up}${I.down}${I.redo}${I.copy}</div>
        <div class="pl-chips"><span class="pl-chip">Remind me at 9:30 AM</span><span class="pl-chip">Add Zoom link to notes</span><span class="pl-chip">Move CRM update to tomorrow</span></div>
        <div class="pl-src">
          <p class="pl-srcl">Source</p>
          <div class="pl-cards">
            <div class="pl-card"><span class="pl-tile red">${I.clip}</span><b>Q4 Planning sync with marketing</b>Assigned to you</div>
            <div class="pl-card"><span class="pl-tile">${I.mail}</span><b>Follow up with Acme Corp</b>Assigned to you</div>
            <div class="pl-card"><span class="pl-tile">${I.mail}</span><b>Review Ticket #456 feedback</b>Assigned to you</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

/* ---------- the live Pulse home: one morning, afternoon and evening ---------- */
export const DI = {
  cal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>',
  meet: '<svg viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"><rect x="2" y="4.5" width="8.5" height="7" rx="1.6"/><path d="m10.5 7 3.5-2v6l-3.5-2"/></svg>',
  check: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 6.2 2.3 2.3 4.7-5"/></svg>',
  down: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="m3 4.5 3 3 3-3"/></svg>',
  mic: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="5.5" y="2" width="5" height="8" rx="2.5"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
  up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3.5M4 7.5l4-4 4 4"/></svg>',
  doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 2h5.5L12 4.5V14H4z"/><path d="M6 8h4M6 10.5h4"/></svg>',
  plan: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="3" y="2.5" width="10" height="11.5" rx="2"/><path d="m5.5 7 1 1 2-2M5.5 11h5"/></svg>',
  sum: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5 6h6M5 8.5h6M5 11h3.5"/></svg>',
};
// Each beat: the time, a request (strings are typed; [typed, kind, chip] turns into an entity chip), and what comes back.
type ChipKind = 'time' | 'co' | 'meet' | 'deal';
type Beat = {
  sky: 'm' | 'a' | 'e';
  word: string;
  time: string;
  mins: number;
  sun: [number, number];
  dark?: boolean;
  ask: (string | [string, ChipKind, string])[];
  out: { label: string; title: string; kind: 'dot' | 'check' | 'mail'; items: (string | [string, string, string, string])[] };
};
export const DY_BEATS: Beat[] = [
  { sky: 'm', word: 'morning', time: '8:30 AM', mins: 8 * 60 + 30, sun: [52, 200],
    ask: ['Prep me for my ', ['10am', 'time', '10:00 AM'], ' with ', ['Acme', 'co', 'Acme Corp']],
    out: { label: 'Meeting brief', title: 'Acme Corp · 10:00 AM', kind: 'dot',
      items: ['Proposal due Friday; they want the updated pricing', 'Last call: questions on seat-based billing', 'Open deal: $48k, in negotiation'] } },
  { sky: 'a', word: 'afternoon', time: '2:00 PM', mins: 14 * 60, sun: [440, 22],
    ask: ['Summarize the ', ['Q4 planning sync', 'meet', 'Q4 Planning sync']],
    out: { label: 'Meeting summary', title: 'Q4 Planning sync · 3 action items', kind: 'check',
      items: ['Campaign launch moves to Oct 14', 'Emmanuel: share the updated pricing sheet', 'Marketing: draft the Acme case study'] } },
  { sky: 'e', word: 'evening', time: '7:45 PM', mins: 19 * 60 + 45, sun: [630, 420], dark: true,
    ask: ['Draft follow-ups for ', ['today’s deals', 'deal', 'Today’s deals · 3']],
    out: { label: 'Drafts', title: '3 follow-ups ready to send', kind: 'mail',
      items: [['A', 'Acme Corp', 'Re: proposal and pricing', '#16151c'], ['N', 'Northwind', 'Next steps after the demo', '#2f6fe4'], ['G', 'Globex', 'Contract redlines', '#e5484d']] } },
];
export const dyChip = (kind: ChipKind, label: string) =>
  `<span class="dy-chip ${kind}"><i>${{ time: DI.cal, co: label[0], meet: DI.meet, deal: '$' }[kind]}</i>${label}</span>`;
export const dyOut = (o: Beat['out']) => `
  <div class="dy-ch"><span class="dy-tile"><i class="ring"></i></span>${o.label}<span class="dy-now">Just now</span></div>
  <p class="dy-ct">${o.title}</p>
  ${o.items.map((it) => (typeof it !== 'string'
    ? `<div class="dy-li"><span class="av" style="background:${it[3]}">${it[0]}</span><b>${it[1]}</b><em>${it[2]}</em></div>`
    : `<div class="dy-li">${o.kind === 'check' ? `<span class="box">${DI.check}</span>` : '<span class="dot"></span>'}${it}</div>`)).join('')}`;
export const DY_INNER = `
  ${DY_BEATS.map((b, i) => `<div class="dy-sky ${b.sky}${i ? '' : ' on'}"></div>`).join('')}
  <div class="dy-sun"><div class="dy-sun-y">${DY_BEATS.map((b) => `<i class="${b.sky}"></i>`).join('')}</div></div>
  <span class="dy-moon"></span>
  <div class="dy-top">
    <span class="dy-time"><span class="dy-clock"><i class="h"></i><i class="m"></i></span><b>${DY_BEATS[0].time}</b>· Lagos</span>
    <p class="dy-hi" style="margin-bottom:0">Good <span class="dy-roll"><span class="dy-words">${DY_BEATS.map((b) => `<span>${b.word}</span>`).join('')}</span></span>, Emmanuel</p>
    <span class="dy-sub">Ready when you are</span>
  </div>
  <div class="dy-box">
    <div class="dy-in">
      <div class="dy-text"><span class="dy-ph">Ask Pulse AI…</span></div>
      <div class="dy-tools"><span class="dy-model">Select model${DI.down}</span><span class="dy-btn">${DI.mic}</span><span class="dy-btn">${DI.plus}</span><span class="dy-btn dy-send">${DI.up}</span></div>
    </div>
    <div class="dy-out"></div>
  </div>
  <div class="dy-chips"><span>${DI.doc}Create doc</span><span>${DI.plan}Make a plan</span><span>${DI.sum}Summarize text</span></div>`;


const $ = (root: ParentNode, sel: string) => root.querySelector(sel) as HTMLElement;
const $$ = (root: ParentNode, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];

// Set the clock, sky and greeting for a beat without animating (start of a loop, reduced motion).
export function dySet(root: HTMLElement, i: number) {
  const b = DY_BEATS[i], words = $$(root, '.dy-words > span');
  $$(root, '.dy-sky').forEach((s, j) => s.classList.toggle('on', j <= i));
  root.classList.toggle('dark', !!b.dark);
  $(root, '.dy-sun').style.transform = `translateX(${b.sun[0]}px)`;
  $(root, '.dy-sun-y').style.transform = `translateY(${b.sun[1]}px)`;
  $$(root, '.dy-sun i').forEach((s, j) => { s.style.opacity = j === i ? '1' : '0'; });
  $(root, '.dy-moon').style.opacity = b.dark ? '1' : '0';
  $(root, '.dy-clock .h').style.transform = `rotate(${b.mins * 0.5}deg)`;
  $(root, '.dy-clock .m').style.transform = `rotate(${b.mins * 6}deg)`;
  $(root, '.dy-time b').textContent = b.time;
  $(root, '.dy-words').style.transform = `translateY(${-38 * i}px)`;
  $(root, '.dy-roll').style.width = words[i].offsetWidth + 'px';
}

/* ---------- finished states, for reduced motion ---------- */
function staticPulse(pl: HTMLElement) {
  pl.innerHTML = PL_INNER;
  const hv = $$(pl, '.pl-hv'); hv[0].classList.remove('on'); hv[2].classList.add('on');
  $(pl, '.pl-a').style.display = 'none'; $(pl, '.pl-b').style.display = 'block';
  $(pl, '.pl-skel').style.display = 'none'; $(pl, '.pl-answer').style.display = 'block';
  $$(pl, '.pl-answer > p').forEach((p, i) => { p.textContent = PL_ANSWER[i]; });
  $$(pl, '.pl-react, .pl-chips, .pl-src').forEach((el) => { el.style.visibility = 'visible'; });
}
// The evening home, exactly as designed.
function staticDay(dy: HTMLElement) {
  dy.innerHTML = DY_INNER;
  dySet(dy, DY_BEATS.length - 1);
}

/* ---------- live covers: drawn at a fixed size, then scaled to their box ---------- */
export type LiveName = 'pulse' | 'day';
export const LIVE: Record<LiveName, { cls: string; w: number; h: number; inner: string; script: 'pulseLive' | 'dayLive'; still: (el: HTMLElement) => void; narrow: [number, number]; rise?: boolean; full?: boolean }> = {
  pulse: { cls: 'pl', w: 557, h: 600, inner: PL_INNER, script: 'pulseLive', still: staticPulse, narrow: [1000, 1080], rise: true },
  day: { cls: 'dy', w: 640, h: 360, inner: DY_INNER, script: 'dayLive', still: staticDay, narrow: [1000, 600], full: true },
};
// Cards: `lift` floats the component on the cover, `rise` lets it run off the bottom edge, `full` makes it the whole cover. Viewer: `fit-height`.
export function liveCover(name: LiveName, { fitHeight = false } = {}) {
  const L = LIVE[name];
  return `<div class="live-wrap ${fitHeight ? 'fit-height' : L.full ? 'full' : L.rise ? 'rise lift' : 'lift'}" data-live="${name}"><div class="${L.cls}">${L.inner}</div></div>`;
}
export function fitLive(wrap: HTMLElement | null) {
  if (!wrap) return;
  const { w, h } = LIVE[wrap.dataset.live as LiveName], host = wrap.parentElement!, fit = wrap.classList.contains('fit-height');
  const k = fit ? Math.min((host.clientHeight * 0.88) / h, (host.clientWidth * 0.9) / w) : wrap.clientWidth / w;
  wrap.style.setProperty('--k', k.toFixed(4));
  if (fit) wrap.style.width = w * k + 'px';
  else if (!wrap.classList.contains('rise')) wrap.style.top = Math.max(0, (host.clientHeight - h * k) / 2) + 'px';
  wrap.style.height = h * k + 'px';
}
