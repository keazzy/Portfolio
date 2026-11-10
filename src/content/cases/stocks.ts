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
  description: 'Ethically minded investors wanted stocks, but only ones they could trust were halal. I designed Halvest’s stock investing, first for US stocks and then for halal stocks on the Nigerian Exchange, so the proof sits next to the price and doing the right thing is the default.',
  meta: [['Role', 'Sole product designer'], ['Research', 'Discovery calls, usability tests'], ['When', '2025–2026'], ['Platform', 'iOS and Android']],
  results: [['2', 'markets: US stocks, then halal NGX stocks'], ['3', 'order types: market, limit and recurring'], ['On', 'by default: purification on every dividend and sale']],
  next: { href: '/work/halvest/vest', label: 'Also from Halvest', title: 'Vest: a design system that checks itself' },
  blocks: [
    { t: 'chapter', id: 'overview', eyebrow: 'Overview', title: 'Halal investors wanted stocks, on their terms',
      text: ['Halvest’s investors kept asking for stocks. But for them, buying a share comes with questions a normal brokerage doesn’t answer: is this company actually halal, what do I do with the part of its income that isn’t, and how do I pay for a US share from a naira wallet?',
        'They didn’t need another trading app. They needed one where the proof sits next to the price and doing the right thing is the default.'] },

    // The result comes first; the rest of the story is how we got there.
    { t: 'chapter', id: 'shipped', eyebrow: 'What shipped', toc: 'What shipped', title: 'Stocks you can check before you buy',
      text: ['Halal US stocks first, then halal stocks on the Nigerian Exchange. Every stock shows its compliance status right under its price, with the full screening one tap away. Purification is on by default, and a naira wallet can buy a US share.'] },
    { t: 'live', frame: 'flush slide', name: 'stocks-slider', cap: 'Invest, the stock list, a stock with its compliance status under the price, the full report, buying and the order going in.' },

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
    { t: 'flow', name: 'comply', label: 'Core flow', title: 'From the price to the proof',
      text: 'The pill under the price opens the report over the stock: two tests against their ceilings, a summary, then questions to ask. A related question answers itself below the list.' },
    { t: 'html', label: 'What the report checks', html: tests, cap: 'Redrawn from the Dangote Cement report: both tests are AAOIFI standards, and the company passes each with room to spare.' },
    { t: 'decision', title: 'Show the test, not just the badge', text: 'A “compliant” label asks people to trust us. Two bars against published ceilings let them check it for themselves, without leaving the stock.' },
    { t: 'decision', title: 'One status, because only compliant stocks are listed', text: 'We tested “questionable” and “non-compliant” labels too, and they caused the most hesitation. Since Halvest lists only stocks that pass screening, we settled on a single status. It still changes if a company’s screening does, which answers the question one tester asked: “What if a stock becomes non-compliant?”' },

    { t: 'chapter', id: 'purification', eyebrow: 'Purification', toc: 'Purification', title: 'Doing the right thing is the default',
      text: ['Even a compliant company earns a little impermissible income, so a share of each dividend should go to charity. Halvest works out that share and gives it on the investor’s behalf.',
        'At review, purification comes first and is on by default. Switching it off opens a sheet that hands the job over to the investor; switching it back on asks nothing.'] },
    { t: 'flow', name: 'purify', label: 'Core flow', title: 'On by default, off on purpose',
      text: 'Purification leads the review, already on. Switching it off hands the job over and says what that means; How purification works explains it for this company.' },
    { t: 'compare', label: 'Before and after',
      before: { ...S('old-buy-review'), tag: 'Earlier design', alt: 'The earlier review screen', notes: [
        { text: 'Just the ticker', y: 45, to: [150, 88], loop: [158, 76, 60, 24], bend: -6 },
        { text: 'No word on purification', y: 590, brace: [8, 505, 705] }] },
      after: { ...S('buy-review', 900), tag: 'As shipped', alt: 'The review screen as shipped', notes: [
        { text: 'The company, by name', y: 192, to: [182, 196], bend: -5 },
        { text: 'Purification comes first, and it’s on', y: 345, to: [338, 314], loop: [16, 264, 343, 92], bend: 6 },
        { text: 'The total, fee included', y: 712, under: [281, 382, 716] },
        { text: 'A way back to the amount', y: 846, to: [238, 841], bend: -5 }] } },
    { t: 'decision', title: 'Off asks, on doesn’t', text: 'Opting out of giving should be a choice someone makes knowingly, never something they slide past. Opting back in should take one tap.' },

    { t: 'chapter', id: 'currencies', eyebrow: 'Across markets', toc: 'Across markets', title: 'A US share, paid for in naira',
      text: ['Buying Apple from a naira wallet means an exchange rate and a market that might be asleep. The review shows the rate in one line, and when New York is closed the order is queued, with a card saying when it will fill.'] },
    { t: 'flow', name: 'markets', label: 'Core flow', title: 'Paid for in naira',
      text: 'Apple pays from the dollar wallet unless you change it. Switch to naira and the review shows the rate in one line, and with New York closed, queues the order and says when it fills.' },

    { t: 'chapter', id: 'orders', eyebrow: 'Orders', toc: 'Orders', title: 'Market, limit or recurring, in one flow',
      text: ['Buy opens with no order type chosen, so the kind of order is a decision rather than a default. Flipping between money and shares keeps what you typed.'] },
    { t: 'flow', name: 'orders', label: 'Core flow', title: 'One flow, three kinds of order',
      text: 'Buy starts with nothing chosen. The pill in the bar reopens the choice at any point: Recurring asks how often, Limit asks for a price. Money and shares are one tap apart.' },

    { t: 'chapter', id: 'holdings', eyebrow: 'Holdings', toc: 'Holdings and selling', title: 'What you own, and what you give',
      text: ['The stock portfolio adds every holding up in one currency. Selling gives the purification share from the gross proceeds, unless the investor chooses to give it themselves, and the sheet says so before they confirm.'] },
    { t: 'marked', label: 'Holding and selling', items: [
      { ...S('holdings'), cap: 'One total, every holding screened', loop: [16, 246, 169, 34] },
      { ...S('stock-us-light'), cap: 'What each dividend gives, worked out for you', loop: [16, 636, 342, 170] },
      { ...S('sell-review', 999), cap: 'Purification comes from the gross proceeds', loop: [17, 267, 340, 138] },
      { ...S('sell-purify-yourself'), cap: 'Or it’s yours to give, said plainly', loop: [16, 398, 268, 50] }] },

    { t: 'chapter', id: 'handoff', eyebrow: 'Design × Engineering', toc: 'Design × Engineering', title: 'Every screen says how it behaves',
      text: ['Beside each group of screens in Figma sits a behaviour card, tied to the file in the codebase that builds it: what each part does, what happens at the edges, and why. Engineering builds from it, and when the code changes, the card is updated to match.'] },
    { t: 'figure', label: 'Behaviour · Buy', src: A('halvest/stocks/behaviour-buy.webp'), w: 760, h: 1394, cap: 'The behaviour card for Buy, from order type to the order’s end, with the screens it maps to in code.' },

    { t: 'chapter', id: 'impact', eyebrow: 'Impact', toc: 'Impact', title: 'Stocks people could buy with peace of mind',
      text: ['Together with the mobile app, the stock products drove much of Halvest’s growth in assets under management. Ethically minded investors finally had stocks they could check before they bought them.',
        'What we learned with US stocks carried straight into the launch of halal NGX stocks, which brought in the names investors had asked for, like Dangote.'] },
    { t: 'stats', items: [['[Amount]', 'invested in stocks since launch'], ['[Number]', 'investors who bought a stock'], ['[Share]', 'of purchases with purification left on']] },

    { t: 'chapter', id: 'reflection', eyebrow: 'Reflection', toc: 'Reflection', title: 'What I’d keep doing' },
    { t: 'reflect', items: [['Put the proof where the decision happens.', 'Trust came from showing the screening next to the price, not from a badge or a help page.'],
      ['Make the ethical choice the easy one.', 'Purification being on by default, and asking before it goes off, did more than any amount of explaining could.']] },
  ],
};
