/* Halvest goes mobile: the first app, then the closed beta. Screens are the live v1.1 designs, with bank details blurred. */
import { A, type CaseStudy, type Screen } from '@/lib/work/case';

const S = (f: string, h = 812): Screen => ({ src: A(`halvest/mobile/${f}.webp`), w: 375, h });

// The July 2025 usability study: two moderated sessions with existing investors, on a TestFlight build. Names left out on purpose.
const STUDY = [
  ['The currency toggle behaved differently from screen to screen', 'Live campaigns in one list on Home, with naira and dollars as a filter on “See all”'],
  ['Expected ROI and maturity needed explaining in plain English', 'A sheet behind each term, like “What is Expected ROI?”'],
  ['“I’d expect the ROI to be in naira, not just a percentage.”', 'The expected return in naira while you type an amount, and again at review'],
  ['“Total Fee” confused both investors', 'The fee is its own line at review, next to the amount and the rate'],
  ['Both wanted their capital and their returns shown apart', 'Each investment shows what you put in and what it’s expected to earn, separately'],
];
const study = () => `<div class="map"><div class="map-row head"><span>What testing showed</span><i></i><span>In the app now</span></div>${STUDY.map(([a, b]) => `<div class="map-row"><span>${a}</span><i>→</i><span>${b}</span></div>`).join('')}</div>`;

// From the FigLog changelogs beside each part of the app in Figma, July to September 2025. The reasons are theirs, shortened.
const LOG = [
  ['Investors who didn’t flip the NGN/USD toggles missed live campaigns in the other currency', 'Home: one list of live and upcoming campaigns, without toggles'],
  ['Transaction history on Home added nothing and crowded it', 'Home: transaction history removed'],
  ['Beta investors wanted social proof before backing a business', 'Invest: business pages tagged with their category and completed campaigns'],
  ['New investors should know what they’re investing in, and how it works', 'Invest: a walkthrough for first-time investors'],
  ['We couldn’t keep the key financials accurate, and investors noticed', 'Portfolio: key financials removed until the data is right'],
  ['One block of instructions for every sender overwhelmed people', 'Wallet: dollar funding grouped by where the money is coming from'],
  ['In a financial app, people need to know what happens to their money', 'Profile: a page that explains deleting an account before you do it'],
  ['People didn’t know they could use their face or fingerprint', 'Sign-up: a step to turn on biometric login'],
];
const log = () => `<div class="map"><div class="map-row head"><span>Why</span><i></i><span>What changed</span></div>${LOG.map(([a, b]) => `<div class="map-row"><span>${a}</span><i>→</i><span>${b}</span></div>`).join('')}</div>`;

export const mobile: CaseStudy = {
  palette: { tint: '#ece6fa', accent: '#6935d3', deep: '#28134e' },
  back: { href: '/#halvest' },
  crumbs: ['Halvest', 'Mobile app'],
  logo: A('Logos/Halvest.png'),
  eyebrow: 'Halvest · Mobile app · 2025',
  title: 'Halvest goes mobile: an app investors helped shape',
  description: 'I designed Halvest’s first mobile app, from May 2025 to its public beta that November, then reshaped it through a closed beta with the reason for every change written down. Most new investors now sign up in the app.',
  meta: [['Role', 'Sole product designer'], ['With', 'A product manager and 3 engineers'], ['When', 'May–November 2025'], ['Platform', 'iOS and Android']],
  results: [['83%', 'of new sign-ups happen in the app'], ['6 in 10', 'investments are made in the app'], ['67%', 'of sign-ups started in the app are finished, against 20% on the web']],
  next: { href: '/work/halvest/stocks', label: 'Next', title: 'Halal stocks, bought with peace of mind' },
  blocks: [
    { t: 'chapter', id: 'overview', eyebrow: 'Overview', title: 'A website that happened to work on a phone',
      text: ['Halvest ran on a responsive website. It worked on a phone, but it was never designed for one, and the phone is where investors were. In May 2025 I started designing Halvest’s first app, and it opened to the public on 1 November 2025.',
        'Shipping it was half the job. In a closed beta, investors told us what wasn’t working, and I changed the app to answer them, writing down the reason for every change.'] },

    // The result comes first; the rest is how it got there.
    { t: 'chapter', id: 'shipped', eyebrow: 'What shipped', toc: 'What shipped', title: 'An app built around your money',
      text: ['Home shows what you have and what’s live. Invest lists ethically curated businesses, each with its record and its campaigns. A campaign shows how far it’s funded and what happens next, and Portfolio breaks down what you own.'] },
    { t: 'live', frame: 'flush slide', name: 'slider', cap: 'Home, signing in, the setup checklist, a business, an investment review and the wallet.' },
    { t: 'screens', frame: 'dark', label: 'Up close', items: [
      { ...S('home', 1322), scroll: true, cap: 'Home: your wealth, and what’s live.' },
      { ...S('business', 1590), scroll: true, cap: 'A business, its record, and its campaigns.' },
      { ...S('campaign', 1045), cap: 'A campaign: funding, details and timeline.' },
      { ...S('portfolio', 859), cap: 'Portfolio: what you own, by type.' }] },

    { t: 'chapter', id: 'scope', eyebrow: 'Scope', toc: 'Scope', title: 'Fund, invest, track. The rest could wait.',
      text: ['The website did more than a first app needed to. I designed the first version around one loop: put money in, invest it in a campaign, and watch it work.',
        'Bank transfer and currency conversion came first; funding by card and by USSD were designed in, marked “Soon”. The managed portfolio opened as a waitlist rather than a product.'] },
    { t: 'screens', frame: 'dark', label: 'What came later', items: [
      { ...S('add-funds'), cap: 'Card and USSD funding, marked “Soon”.' },
      { ...S('managed', 1314), cap: 'The managed portfolio, as a waitlist.' }] },
    { t: 'decision', title: 'Ship the loop, not the feature list', text: 'Doing the core loop well mattered more than matching every web feature on day one. The “Soon” labels told investors what was coming without building it yet.' },

    { t: 'chapter', id: 'onboarding', eyebrow: 'Onboarding', toc: 'Onboarding', title: 'From download to a first investment',
      text: ['Signing up asks only for what an account needs: your country, an email and a password. First-time setup offers a passcode and biometric login, then you’re in.',
        'Verification comes after, as a checklist on Home: verify your BVN, verify your identity, fund your wallet, invest. Each step says how long it takes and why it’s needed.'] },
    { t: 'screens', frame: 'dark', label: 'Signing up, then setting up', items: [
      { ...S('biometrics'), cap: 'Biometric login, offered during setup.' },
      { ...S('home-unverified'), cap: 'Home shows how far along you are.' },
      { ...S('checklist', 890), cap: 'The checklist: what’s left, and how long it takes.' },
      { ...S('bvn'), cap: 'Why Halvest asks for a BVN, before you give it.' }] },
    { t: 'decision', title: 'Let people in before asking for their BVN', text: 'Halvest has to verify investors before they invest, not before they look around. New investors see what Halvest offers first, and the checklist keeps the remaining steps in view.' },
    { t: 'stats', items: [['67%', 'of sign-ups started in the app are finished'], ['20%', 'of sign-ups started on the website are finished']] },
    { t: 'text', text: 'Those figures are from Mixpanel, March to October 2026. Some of the gap is the channel: someone who downloads an app arrives more committed than someone who lands on a website.' },

    { t: 'chapter', id: 'short', eyebrow: 'Edge cases', toc: 'Running short', title: 'Running short doesn’t end the investment',
      text: ['If your wallet can’t cover an investment, the app doesn’t stop at an error. It offers to fund the wallet right there, shows the transfer details without leaving the page, and takes you back to review the investment once the money arrives.'] },
    { t: 'screens', frame: 'dark', label: 'Not enough funds', items: [
      { ...S('short'), cap: 'Short? Fund the wallet from here.' },
      { ...S('short-transfer'), cap: 'The transfer details, on the same page.' },
      { ...S('short-review'), cap: 'Then straight back to review.' }] },

    { t: 'chapter', id: 'testing', eyebrow: 'Testing', toc: 'Testing', title: 'Two investors, a real build',
      text: ['In July 2025, the product manager and I ran two moderated sessions with existing investors on a TestFlight build of the app. Each completed seven of the eight tasks, and both struggled with the same one: making sense of the portfolio.',
        'Two sessions can’t tell you how common a problem is, but they showed us where to look.'] },
    { t: 'html', label: 'From finding to the app', html: study },
    { t: 'quote', text: 'The fee part is confusing. Just say ‘Transaction Fee.’', who: 'Usability participant, an existing Halvest investor' },

    { t: 'chapter', id: 'beta', eyebrow: 'Closed beta', toc: 'Closed beta', title: 'Every change, with its reason',
      text: ['In the closed beta, investors told us what wasn’t working in a WhatsApp group and in support tickets. Beside every part of the app in Figma, I kept a changelog: what changed, when, and why. Most of the reasons came straight from investors.'] },
    { t: 'figure', label: 'The changelog beside Home', src: A('halvest/mobile/changelog.webp'), w: 800, h: 1457, cap: 'Every part of the app has one, from sign-up to Profile.' },
    { t: 'html', label: 'Eight changes, and why', html: log },
    { t: 'decision', title: 'Take out what we can’t stand behind', text: 'We couldn’t keep the portfolio’s key financials accurate, and investors had noticed. Rather than show figures we weren’t sure of, I took them out until the data is right, and laid the portfolio out as a vertical list to fill the space.' },

    { t: 'chapter', id: 'proof', eyebrow: 'Social proof', toc: 'Social proof', title: 'Proof before you back a business',
      text: ['Beta investors wanted proof before backing a business they didn’t know. I designed two directions for the business page. The second shipped: a performance chart, the business’s category, and how many campaigns it has completed, or “New & promising” for a first-timer. The same badges sit on each campaign, next to its investment memo.'] },
    { t: 'screens', frame: 'dark', label: 'Two directions', items: [
      { ...S('business-a', 1095), tag: 'Direction A', cap: 'The business, then its campaigns.' },
      { ...S('business', 1590), tag: 'Shipped', scroll: true, cap: 'Its record first: performance, category, past campaigns.' },
      { ...S('campaign', 1045), cap: 'The badges carry onto every campaign.' }] },

    { t: 'chapter', id: 'funding', eyebrow: 'Funding', toc: 'Funding', title: 'Instructions for where you’re sending from',
      text: ['Funding the dollar wallet meant one long block of bank details and notes, written for everyone. I grouped it by where the money is coming from, Nigeria, the US or elsewhere, so each investor opens only the instructions that apply, with that route’s fee stated inline.'] },
    { t: 'screens', frame: 'dark', label: 'Funding the dollar wallet', items: [
      { ...S('wallet'), cap: 'The wallet, in naira and dollars.' },
      { ...S('usd'), cap: 'Pick where you’re sending from.' },
      { ...S('usd-us', 928), cap: 'Only the details for that route, and its fee.' }] },

    { t: 'chapter', id: 'impact', eyebrow: 'Impact', toc: 'Impact', title: 'New investors start in the app',
      text: ['A year after the public beta, most new investors start in the app: since March 2026, 83% of sign-ups have happened there, and six in ten investments are made in it. Among investors who sign in, the app overtook the website in September 2026, and its share is still growing.',
        'All figures are from Mixpanel, which has tracked the app since February 2026.'] },
    { t: 'stats', items: [['47%', 'of signed-in investors used the app in August 2026'], ['56%', 'did by October']] },

    { t: 'chapter', id: 'reflection', eyebrow: 'Reflection', toc: 'Reflection', title: 'What I’d keep doing' },
    { t: 'reflect', items: [['Write the reason down.', 'A changelog with a “why” on every change made each decision easy to explain, and easy to revisit when the feedback or the data changed.'],
      ['Test to find problems; let the beta say which matter.', 'Two sessions showed where people struggled. The closed beta showed which of those problems were worth fixing first.'],
      ['Signing up isn’t the finish line.', 'People now finish signing up in the app far more often than on the web. The next drop is between signing up and funding a wallet, and that’s where I’d look next.']] },
  ],
};
