/* Vest: the design system case study (ported from concepts/case-vest.html). Its live rolling number is in src/lib/work/case-live.ts. */
import { A, type CaseStudy } from '@/lib/work/case';

const V = (f: string) => A('halvest/vest/' + f);

/* ---------- diagrams only this story needs ---------- */
const drift = () => `
  <div class="drift">
    <div class="dr-col sheet"><p class="dr-h">Figma</p>
      <div class="dr-row"><span>Gain colour</span><b><i class="sw" style="background:#1f9d55"></i>#1F9D55</b></div>
      <div class="dr-row"><span>Small button</span><b>44px</b></div>
      <div class="dr-row"><span>Wallet button</span><b>“Fund wallet”</b></div>
    </div>
    <div class="dr-mid"><span class="dr-bubble">“We changed the gain colour.”</span><small>…and someone has to remember to tell engineering</small></div>
    <div class="dr-col sheet"><p class="dr-h">The app</p>
      <div class="dr-row off"><span>Gain colour</span><b><i class="sw" style="background:#2fae66"></i>#2FAE66</b></div>
      <div class="dr-row off"><span>Small button</span><b>40px</b></div>
      <div class="dr-row off"><span>Wallet button</span><b>“Top up”</b></div>
    </div>
  </div>`;

const RULES = [
  ['Presentation only', 'A component takes props and calls handlers. It never fetches data, navigates or reads a store.', 'npm run check · boundary'],
  ['Values come from Figma', 'Colour, type, scale and motion arrive through the tokens. A value typed into a component is a value that will drift.', 'drift check'],
  ['One way to do each thing', 'One formatter writes every figure; one Change decides every gain or loss. A second way is how one loss came to be printed four ways.', 'formatMoney · <Change>'],
  ['Name it, then use the name', 'A spring is asked for by its job, a curve by what the move is doing. A bare number is a decision nobody can find later.', "useSpring('settle')"],
  ['A rule is a check, and a check has been seen failing', 'Each check was run against the old code first, to watch it fail. A check nobody has seen fail is not a check.', 'npm run check'],
];
const rules = () => `<div class="rules">${RULES.map(([t, d, c], i) => `<div class="rule"><i>0${i + 1}</i><b>${t}</b><p>${d}</p><code>${c.replace(/</g, '&lt;')}</code></div>`).join('')}</div>`;

const pipeline = () => `
  <div class="pipe">
    <div class="pp"><small>In Figma</small><b>Vest’s variables and text styles</b></div><i class="pp-arrow"></i>
    <div class="pp accent"><small>Figma plugin</small><b>Halvest Tokens</b></div><i class="pp-arrow"></i>
    <div class="pp-routes">
      <div><b>Bridge</b><span>Repo open: written and checked before the button finishes</span></div>
      <div><b>GitHub</b><span>Never cloned it: opens a pull request</span></div>
      <div><b>File</b><span>Neither works: a file to apply</span></div>
    </div><i class="pp-arrow"></i>
    <div class="pp"><small>In the repo</small><b>Token source that mirrors Figma</b></div><i class="pp-arrow"></i>
    <div class="pp"><small>What the app imports</small><b>@halvest/tokens</b></div>
    <p class="pp-check">The drift check fails the moment code and Figma disagree</p>
  </div>`;

const TOKENS: [string, number, string][] = [['Primitives', 212, '#6935d3'], ['Semantic, light and dark', 63, '#a184f2'], ['Scale', 39, '#32d0c6'], ['Type styles', 28, '#ff91f7'], ['Elevation', 4, '#28134e']];
const tokens = () => `
  <div class="tk sheet" style="padding:20px">
    <p class="tk-total">346 tokens, generated from Figma</p>
    <div class="tk-bar">${TOKENS.map(([, n, c]) => `<i style="flex:${n};background:${c}"></i>`).join('')}</div>
    <div class="tk-legend">${TOKENS.map(([l, n, c]) => `<span><i style="background:${c}"></i><b>${n}</b>${l}</span>`).join('')}</div>
  </div>`;

const say = () => `
  <div class="say">
    <div class="say-src"><small>Halvest Say · source of truth</small><code>wallet.fund.cta</code><b>Fund wallet</b></div>
    <div class="say-outs">
      <div><small>Figma</small><span class="say-layer">Fund wallet</span></div>
      <div><small>The app · @halvest/say</small><code>say('wallet.fund.cta')</code></div>
      <div><small>iOS · .strings</small><code>"wallet.fund.cta" = "Fund wallet";</code></div>
      <div><small>Android · strings.xml</small><code>&lt;string name="wallet_fund_cta"&gt;Fund wallet&lt;/string&gt;</code></div>
    </div>
  </div>`;

const handover = () => `
  <pre class="code"><span class="m">/**
 * AmountEntry · interaction demo
 *</span>
 * <span class="k">DS Mapping</span>           <span class="m">every value, mapped to a token</span>
 * <span class="k">Motion Spec</span>          <span class="m">numbers that are decisions: keep them exactly</span>
 * <span class="k">Deliberate One-Offs</span>  <span class="m">literal on purpose</span>
 * <span class="k">Platform Notes</span>       <span class="m">bugs we have already hit, and the workarounds</span>
 * <span class="k">Out of Scope</span>         <span class="m">wire these to the real implementation</span>
 <span class="m">*/</span></pre>
  <div class="demos">${['AmountEntry', 'ChartScrub', 'CountUp', 'CurrencySwipe', 'ForYouCards', 'HideValue', 'NavDock', 'Numpad', 'SwipePager'].map((d) => `<span>${d}</span>`).join('')}</div>`;

const pr = () => `
  <div class="pr">
    <div class="pr-head"><span>Open</span><b>Tokens: sync from Figma</b><small>From Halvest Tokens · ready for review</small></div>
    <div class="pr-files"><span>src/semantic.json</span><span class="a">+4</span><span class="d">−4</span></div>
    <div class="pr-checks"><span>Drift check</span><span>Boundary check</span><span>Types</span></div>
  </div>`;

export const vest: CaseStudy = {
  palette: { tint: '#ece6fa', accent: '#6935d3', deep: '#28134e' },
  back: { href: '/#halvest' },
  crumbs: ['Halvest', 'Vest'],
  logo: A('Logos/Halvest.png'),
  eyebrow: 'Halvest · Design system · 2026',
  title: 'Vest: a design system that checks itself',
  lede: 'As Halvest’s only designer, I built Vest in Figma and in code, then wrote the tools that keep the two in step. Design changes now reach the app as pull requests I open myself.',
  meta: [['Role', 'Sole designer, design engineering'], ['With', 'Halvest’s engineers'], ['When', '2026'], ['Status', 'Shipping soon']],
  results: [['346', 'design tokens, generated from Figma'], ['44', 'components, each with a doc card'], ['2', 'Figma plugins I built: Tokens and Say'], ['Seconds', 'from a change in Figma to checked code']],
  hero: { video: A('halvest/vest-teaser.mp4'), w: 1280, h: 720 },
  next: { href: '/#/work/halvest/mobile', label: 'Next', title: 'Halvest goes mobile' },
  blocks: [
    { t: 'chapter', id: 'overview', eyebrow: 'Overview', title: 'Designed in one place, built in another',
      text: ['Halvest’s app is designed in Figma and built in code, and the two drifted. A colour changed in the file and the app didn’t follow; a button said one thing in design and another in production. As the only designer, the only check was me noticing.',
        'Vest is how I stopped relying on that.'] },
    { t: 'html', label: 'How drift happens', html: drift, cap: 'An illustration of the problem: every difference needed someone to notice it and send a message.' },

    { t: 'chapter', id: 'system', eyebrow: 'The system', toc: 'The system', title: 'So Vest starts in Figma…',
      text: ['Every component gets a doc card: what it’s for, when not to use it, its parts, every variant and state, how it moves, and what a screen reader says. One page explains how to read them all, and every card says when it last matched the code.'] },
    { t: 'figure', label: 'Start here', src: V('start-here.webp'), w: 1360, h: 1050, cap: 'The page every designer and engineer reads first: how to read a card, what each status means, and how things are named.' },
    { t: 'figure', label: 'One component, 336 variants', src: V('button-set.webp'), w: 1600, h: 1206, cap: 'Button: seven styles, three sizes, four states and four icon positions, all one component in Figma and in code.' },
    { t: 'figure', label: 'Components carry decisions', src: V('action-items.webp'), w: 1600, h: 733, cap: 'An action item already knows its four tones, from urgent to neutral, so no screen has to choose colours for itself.' },
    { t: 'figure', frame: 'flush deep', label: 'Illustrations live in Vest too', src: V('illustrations.webp'), w: 2400, h: 128 },

    { t: 'chapter', id: 'rules', eyebrow: 'The rules', toc: 'The rules', title: '…and is enforced in code',
      text: ['Vest is also the package the app imports. Its principles aren’t guidelines people are asked to remember: each one is a check that fails.'] },
    { t: 'html', label: 'Five principles, five checks', html: rules },

    { t: 'chapter', id: 'tokens', eyebrow: 'Halvest Tokens', toc: 'Tokens', title: 'A change in Figma becomes a pull request',
      text: ['Halvest Tokens is a Figma plugin I built. It reads Vest’s variables and text styles and sends them to the codebase in one of three ways, depending on who’s sending. A designer who has never cloned the repo can still open a pull request.'] },
    { t: 'html', label: 'From Figma to the app', html: pipeline },
    { t: 'html', label: 'What it carries', html: tokens },
    { t: 'decision', title: 'Why the plugin doesn’t build the package itself', text: 'A Figma plugin can’t run Node, so the GitHub route commits only the token source, and CI builds the package on that branch. It also keeps the plugin’s access small: it can write one branch, and nothing more.' },

    { t: 'chapter', id: 'copy', eyebrow: 'Halvest Say', toc: 'Copy', title: 'The same words, everywhere',
      text: ['Copy drifted the same way colour did. Halvest Say keeps every string in one place: a Figma plugin to write and link copy, an API that holds the source of truth, and exports in each platform’s own format.'] },
    { t: 'html', label: 'One string, every surface', html: say },
    { t: 'todo', what: 'A short recording of the Say plugin in Figma' },

    { t: 'chapter', id: 'motion', eyebrow: 'Motion', toc: 'Motion', title: 'Motion is part of the system, too',
      text: ['Springs, curves and durations live in one file and are asked for by the job they do, like <code>useSpring(\'settle\')</code>. Every figure that changes in front of you rolls the same way.',
        'Every spring and duration was tuned on a real phone, not in a prototype preview.'] },
    { t: 'live', frame: 'deep', label: 'Rolling number', name: 'rolling' },
    { t: 'figure', label: 'From its doc card', src: V('rolling-stills.webp'), w: 1360, h: 869, cap: 'The doc card stops the roll at its telling moments, worked out from the code’s own springs, and says what Reduce Motion does instead.' },

    { t: 'chapter', id: 'handover', eyebrow: 'Handover', toc: 'Handover', title: 'Handing over interactions, not just screens',
      text: ['When a static frame can’t explain an interaction, I build a working demo with its spec written into the source: which values map to tokens, which motion numbers are decisions, and which platform bugs we’ve already hit. It’s written to be read by an engineer, or by an AI agent working in our repo.'] },
    { t: 'html', label: 'Every demo opens with its spec', html: handover, cap: 'The interaction gallery: nine demos so far, each one a single file an engineer can lift into the app.' },

    { t: 'chapter', id: 'issues', eyebrow: 'Known issues', toc: 'Known issues', title: 'Logging what isn’t right yet',
      text: ['Building a real screen from Vest surfaced problems: touch targets under 44px, parts that break when resized, type that reads wrong in context. Each is logged with a proposed fix as an open decision, rather than quietly patched.'] },
    { t: 'figure', label: 'Known issues', src: V('known-issues.webp'), w: 1400, h: 1187 },

    { t: 'chapter', id: 'engineering', eyebrow: 'Engineering × Design', toc: 'Engineering × Design', title: 'Now I open pull requests',
      text: ['Working in the codebase changed how I design. Constraints show up while I’m still deciding, I can fix a token or a string myself, and engineering reviews a change instead of rebuilding it from a handoff. Token and copy changes no longer need a ticket or a message: they arrive as pull requests that only need a review.'] },
    { t: 'html', label: 'How a design change arrives now', html: pr, cap: 'An illustration of the workflow: the change, the files it touches, and the checks it has to pass.' },

    { t: 'chapter', id: 'reflection', eyebrow: 'Reflection', toc: 'Reflection', title: 'What I’d keep doing' },
    { t: 'reflect', items: [['Make rules fail loudly.', 'A guideline nobody can fail is only a suggestion. Writing each principle as a check is what made Vest hold.'],
      ['Tune motion where people feel it.', 'Values that looked right in a preview often felt wrong in the hand. Deciding on a real phone, and writing the reason down, saved arguments later.']] },
  ],
};
