/* Halal stocks: the stocks case study (ported from concepts/case-stocks.html). Protected: unreleased v2 screens. */
import { A, type CaseStudy, type Screen } from '@/lib/work/case';

const S = (f: string, h = 812): Screen => ({ src: A(`halvest/stocks/${f}.webp`), w: 375, h });

// Where Dangote Cement sits against each AAOIFI ceiling, as the compliance report shows it.
const tests = () => `
  <div class="tests">
    ${([['Impermissible income', 'share of revenue', 2.6, 5, '2.6% of revenue, against a ceiling of 5%'],
       ['Debt ratio', 'interest-bearing debt against market value', 11.9, 30, '11.9% of market value, against a ceiling of 30%']] as [string, string, number, number, string][]).map(([t, d, v, max, line]) => `
      <div class="test">
        <div class="test-head"><b>${t}</b><span>${d}</span></div>
        <div class="meter"><em style="left:${(v / max) * 100}%">${v}%</em><i style="left:${(v / max) * 100}%"></i></div>
        <div class="meter-scale"><span>0%</span><span>${max}% ceiling</span></div>
        <p>${line}</p>
      </div>`).join('')}
  </div>`;

// From the May 2025 discovery calls (6) and the usability study (5 sessions). Names left out on purpose.
const THEMES = [
  ['Halal, or not at all', 'All six investors made compliance a condition, not a preference.', 'I’d like to invest, but I need to know it’s genuinely halal and that I’m not walking blindly.', 'Prospective investor, cautious about stocks'],
  ['Trust had been broken before', 'Half had been burned investing before: over halal concerns, poor transparency, or a broker who went quiet.', 'I don’t want to lose track of my portfolio again.', 'Investor who left a traditional broker'],
  ['Explain it, without the jargon', 'People asked for plain summaries, not raw data or charts. In testing, terms like “lazy portfolio” and P/E lost them.', 'If it’s well-managed and I don’t have to figure everything out myself, I’m ready to start.', 'Prospective investor, new to stocks'],
  ['Set it, and trust it', 'Many wanted to put money in regularly and leave it to grow, with control when they wanted it.', 'I want to put my money somewhere and forget it, but I need to trust where it’s going.', 'Prospective investor'],
];
const themes = () => `<div class="themes">${THEMES.map(([t, d, q, who]) => `<div class="theme"><b>${t}</b><p>${d}</p><q>${q}</q><small>${who}</small></div>`).join('')}</div>`;
const MAP = [
  ['“Questionable” and “non-compliant” labels caused the most hesitation', 'Only compliant stocks are listed, with one status and the reasoning a tap away'],
  ['People asked about purification while testing', 'Purification on every stock page, and first at review'],
  ['Commission, pricing and currency confused people at checkout', 'A review that lists the fee, the total and, for a US stock, the rate'],
  ['Jargon like “investment themes” and “lazy portfolio” lost people', 'Plain filters: All, My watchlist, NGX and US'],
  ['People wanted to invest regularly, not trade', 'Recurring buys, from daily to monthly'],
];
const findings = () => `<div class="map"><div class="map-row head"><span>What testing showed</span><i></i><span>What shipped</span></div>${MAP.map(([a, b]) => `<div class="map-row"><span>${a}</span><i>→</i><span>${b}</span></div>`).join('')}</div>`;

export const stocks: CaseStudy = {
  palette: { tint: '#ece6fa', accent: '#6935d3', deep: '#28134e' },
  locked: true,
  back: { href: '/#halvest' },
  crumbs: ['Halvest', 'Halal stocks'],
  logo: A('Logos/Halvest.png'),
  eyebrow: 'Halvest · Stocks · 2026',
  title: 'Halal stocks, bought with peace of mind',
  lede: 'Ethically minded investors wanted stocks, but only ones they could trust were halal. I designed Halvest’s stock investing, first for US stocks and then for halal stocks on the Nigerian Exchange, so the proof sits next to the price and doing the right thing is the default.',
  meta: [['Role', 'Sole product designer'], ['Research', 'Discovery calls, usability tests'], ['When', '2025–2026'], ['Platform', 'iOS and Android']],
  results: [['2', 'markets: US stocks, then halal NGX stocks'], ['3', 'order types: market, limit and recurring'], ['On', 'by default: purification on every dividend and sale']],
  heroScreens: { items: [S('list'), { ...S('stock', 1773) }, { ...S('compliance', 1712), scroll: true }] },
  next: { href: '/work/halvest/vest', label: 'Also from Halvest', title: 'Vest: a design system that checks itself' },
  blocks: [
    { t: 'chapter', id: 'overview', eyebrow: 'Overview', title: 'Halal investors wanted stocks, on their terms',
      text: ['Halvest’s investors kept asking for stocks. But for them, buying a share comes with questions a normal brokerage doesn’t answer: is this company actually halal, what do I do with the part of its income that isn’t, and how do I pay for a US share from a naira wallet?',
        'They didn’t need another trading app. They needed one that let them invest with peace of mind.'] },

    { t: 'chapter', id: 'research', eyebrow: 'Research', title: 'It started with listening',
      text: ['In May 2025 I ran six discovery calls with investors about stocks: what they used, why they’d stopped or never started, and what would make them try. I wrote the interview script and the template we logged every call in. Then I put a Figma prototype in front of five people in moderated sessions over two weeks.'] },
    { t: 'stats', items: [['6', 'discovery calls with investors'], ['5', 'moderated usability sessions'], ['6 of 6', 'made halal compliance a condition'], ['3 of 6', 'had been burned investing before']] },
    { t: 'html', label: 'What we heard', html: themes },
    { t: 'text', text: 'Investors also asked for names they already knew, like Dangote, which the halal NGX stocks later brought in.' },
    { t: 'html', label: 'From finding to feature', html: findings, cap: 'The usability study ended with a clear brief: compliance education first, then a clearer buy flow. These are the changes that shipped.' },
    { t: 'quote', text: 'Why show non-compliant stocks if I can’t buy them?', who: 'Usability participant, an existing Halvest investor' },

    { t: 'chapter', id: 'compliance', eyebrow: 'Compliance', toc: 'Compliance', title: 'The proof sits next to the price',
      text: ['Every stock carries a “Shariah compliant” pill right under its price. It opens a compliance report: the two tests a company has to pass, where it sits against each ceiling, and a summary in plain language.',
        'Investors can ask follow-up questions in the report itself, answered by HalAI in the same plain language and pointing back to the standard.'] },
    { t: 'screens', frame: 'dark', label: 'From the price to the proof', items: [
      { ...S('stock', 1773), cap: 'The pill under the price opens the report.' },
      { ...S('compliance', 1712), scroll: true, cap: 'Two tests, a summary, and questions you can ask.' },
      { ...S('compliance-answered', 1712), cap: 'An answer, in plain language.' }] },
    { t: 'html', label: 'What the report checks', html: tests, cap: 'Redrawn from the Dangote Cement report: both tests are AAOIFI standards, and the company passes each with room to spare.' },
    { t: 'decision', title: 'Show the test, not just the badge', text: 'A “compliant” label asks people to trust us. Two bars against published ceilings let them check it for themselves, without leaving the stock.' },
    { t: 'decision', title: 'One status, because only compliant stocks are listed', text: 'We tested “questionable” and “non-compliant” labels too, and they caused the most hesitation. Since Halvest lists only stocks that pass screening, we settled on a single status. It still changes if a company’s screening does, which answers the question one tester asked: “What if a stock becomes non-compliant?”' },

    { t: 'chapter', id: 'purification', eyebrow: 'Purification', toc: 'Purification', title: 'Doing the right thing is the default',
      text: ['Even a compliant company earns a little impermissible income, so a share of each dividend should go to charity. Halvest works out that share and gives it on the investor’s behalf.',
        'At review, purification comes first and is on by default. Switching it off opens a sheet that hands the job over to the investor; switching it back on asks nothing.'] },
    { t: 'screens', frame: 'dark', label: 'On by default, off on purpose', items: [
      { ...S('buy-review', 900), cap: 'Purification leads the review, already on.' },
      { ...S('buy-handover'), cap: 'Off hands it over, and says what that means.' },
      { ...S('purification-sheet'), cap: 'How purification works, for this company.' }] },
    { t: 'screens', frame: 'dark', label: 'Before and after', items: [
      { ...S('old-buy-review'), tag: 'Earlier design', cap: 'Purification wasn’t part of the decision.' },
      { ...S('buy-review', 900), tag: 'As shipped', cap: 'It’s the first thing you see, and it’s on.' }] },
    { t: 'decision', title: 'Off asks, on doesn’t', text: 'Opting out of giving should be a choice someone makes knowingly, never something they slide past. Opting back in should take one tap.' },

    { t: 'chapter', id: 'currencies', eyebrow: 'Across markets', toc: 'Across markets', title: 'A US share, paid for in naira',
      text: ['Buying Apple from a naira wallet means an exchange rate and a market that might be asleep. The review shows the rate in one line, and when New York is closed the order is queued, with a card saying when it will fill.'] },
    { t: 'screens', frame: 'dark', label: 'The rate, and when it fills', items: [
      { ...S('stock-us-closed', 961), cap: 'A US stock says when its market is closed.' },
      { ...S('buy-naira-closed', 1058), scroll: true, cap: 'The rate is part of the review; the order waits for the open.' },
      { ...S('holdings-dollars'), cap: 'Holdings can be read in dollars, converted at the same rate.' }] },

    { t: 'chapter', id: 'orders', eyebrow: 'Orders', toc: 'Orders', title: 'Market, limit or recurring, in one flow',
      text: ['Buy opens with no order type chosen, so the kind of order is a decision rather than a default. Flipping between money and shares keeps what you typed. A key that would break the figure shakes instead of failing later, and running short offers to add or convert money rather than ending in an error.'] },
    { t: 'screens', frame: 'dark', label: 'Choosing, sizing and placing an order', items: [
      { ...S('buy-type'), cap: 'Nothing chosen to start.' },
      { ...S('buy-amount', 861), cap: 'Money or shares, one tap apart.' },
      { ...S('buy-need-more', 861), cap: 'Short? Add money or convert.' },
      { ...S('buy-submitted'), cap: 'Submitted, with the settlement day.' }] },

    { t: 'chapter', id: 'holdings', eyebrow: 'Holdings', toc: 'Holdings and selling', title: 'What you own, and what you give',
      text: ['The stock portfolio adds every holding up in one currency. Selling gives the purification share from the gross proceeds, unless the investor chooses to give it themselves, and the sheet says so before they confirm.'] },
    { t: 'screens', frame: 'dark', label: 'Holding and selling', items: [
      { ...S('holdings'), cap: 'Every holding, every holding screened.' },
      { ...S('sell-review', 999), cap: 'Purification comes from the gross proceeds.' },
      { ...S('sell-purify-yourself'), cap: 'Or it’s yours to give, said plainly.' }] },

    { t: 'chapter', id: 'handoff', eyebrow: 'Design × Engineering', toc: 'Design × Engineering', title: 'Every screen says how it behaves',
      text: ['Beside each group of screens in Figma sits a behaviour card, tied to the file in the codebase that builds it: what each part does, what happens at the edges, and why. Engineering builds from it, and when the code changes, the card is updated to match.'] },
    { t: 'figure', label: 'Behaviour · Buy', src: A('halvest/stocks/behaviour-buy.webp'), w: 760, h: 1394, cap: 'The behaviour card for Buy, from order type to the order’s end, with the screens it maps to in code.' },

    { t: 'chapter', id: 'reflection', eyebrow: 'Reflection', toc: 'Reflection', title: 'What I’d keep doing' },
    { t: 'reflect', items: [['Put the proof where the decision happens.', 'Trust came from showing the screening next to the price, not from a badge or a help page.'],
      ['Make the ethical choice the easy one.', 'Purification being on by default, and asking before it goes off, did more than any amount of explaining could.']] },
  ],
};
