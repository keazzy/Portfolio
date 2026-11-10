/* Pulse: Impulse's command bar for search, questions and drafts. Its prototypes are rebuilt in code from the shipped designs (lib/work/pulse-flows.ts). */
import { A, type CaseStudy } from '@/lib/work/case';

// What five products do well with a command bar or AI, and what Pulse took from each.
const REVIEW = [
  ['Linear’s ⌘K', 'Every action, from anywhere, by keyboard', 'One shortcut that works on every page'],
  ['Raycast', 'Commands and AI in the same bar', '“Ask Pulse AI” sits with the results'],
  ['Notion AI', 'AI inside the work, with prompts to start from', 'Prompts for the job, like /create'],
  ['Superhuman', 'Speed first; AI drafts that you send', 'Drafts arrive ready to edit, never sent for you'],
  ['Attio', 'A CRM where every record is a search away', 'Records first in the results'],
];
const review = () => `<div class="map"><div class="map-row head"><span>What it does well</span><i></i><span>What Pulse took</span></div>${REVIEW.map(([n, a, b]) => `<div class="map-row"><span><b>${n}</b> · ${a}</span><i>→</i><span>${b}</span></div>`).join('')}</div>`;

// The first two come from the stakeholder sessions, the last two from the competitor review. Usability tests can join them once there are notes to cite.
const LEARNED = [
  ['Search was scattered', 'Each page and table had its own search box, so finding anything meant knowing where it lived first.', 'Stakeholder sessions'],
  ['AI belongs where people already look', 'For the CEO, PM and CTO, AI wasn’t a feature to visit. It had to be part of how people find things.', 'Stakeholder sessions'],
  ['An answer needs receipts', 'In a CRM, people act on what an answer says. The AI worth trusting showed where each answer came from, so it could be checked first.', 'Competitor review'],
  ['The answer is only step one', 'Knowing what’s due leads straight to a reminder, a note or an email. The best bars let you act from where you were; Impulse sent you to another page.', 'Competitor review'],
];
const learned = () => `<div class="themes">${LEARNED.map(([t, d, from]) => `<div class="theme"><b>${t}</b><p>${d}</p><small>${from.replace(/\[([^\]]+)\]/, '<mark class="fill-in">$1</mark>')}</small></div>`).join('')}</div>`;

// Each finding became a question, and each question a part of the bar; the last card is the brief they add up to.
const HMW = [
  ['How might we let people find anything from anywhere, without first choosing between search and AI?', 'One bar, Ask first'],
  ['How might we make an AI answer trustworthy enough to act on?', 'Sources on every answer'],
  ['How might we turn an answer into the next step, without leaving the bar?', 'One-tap follow-ups'],
  ['How might we help people draft from what the CRM knows, without writing a perfect prompt?', '/create prompts'],
];
const hmw = () => `<div class="rules hmw">${HMW.map(([q, a], i) => `<div class="rule"><i>HMW 0${i + 1}</i><b>${q}</b><code>${a}</code></div>`).join('')}
  <div class="rule"><i>The brief</i><b>One bar that finds, answers and drafts, and always shows its working.</b></div></div>`;

export const pulse: CaseStudy = {
  palette: { tint: '#eeeafc', accent: '#6d4fe0', deep: '#1f1846' },
  back: { href: '/#impulse' },
  crumbs: ['Impulse AI', 'Pulse'],
  logo: A('Logos/Impulse.png'),
  eyebrow: 'Impulse AI · Pulse · 2024',
  title: 'Pulse: ⌘K that answers back',
  description: 'At Impulse, an AI-native CRM, search lived on each page and table. I designed Pulse: one ⌘K bar to find any record, ask about your pipeline and draft emails or notes. It became the default way to find things in Impulse.',
  meta: [['Role', 'Founding product designer'], ['With', 'The CEO, PM and CTO'], ['Timeline', '2–4 weeks'], ['Platform', 'Web']],
  results: [['Default', 'way to find things in Impulse, from launch'], ['1', 'bar to find, ask and draft from any page'], ['5', 'products reviewed before designing']],
  next: { href: '/work/halvest/mobile', label: 'Next', title: 'Halvest goes mobile: an app investors helped shape' },
  blocks: [
    { t: 'chapter', id: 'overview', eyebrow: 'Overview', title: 'Finding things meant knowing where they lived',
      text: ['Impulse is an AI-native CRM, but its search was the default kind: a box on each page and table. To find a task you went to Tasks; to find a deal, Deals. The AI couldn’t help you look.',
        'Pulse replaces all of that with one bar. Press ⌘K anywhere to find a record, ask about your pipeline, or draft an email or note from what Impulse already knows.'] },

    // The result comes first; the rest is how it got there.
    { t: 'chapter', id: 'shipped', eyebrow: 'What shipped', toc: 'What shipped', title: 'One bar: search, ask, compose',
      text: ['Pulse opens over whatever you’re working on. Type, and records appear with “Ask Pulse AI” at the top. Ask, and the answer streams in with what to do next and the records it used. Type /create, and it drafts an email, a note or a report for you to edit and send.'] },
    { t: 'flow', wide: true, name: 'pulse-anywhere', label: 'Prototype', title: 'Over whatever you’re working on',
      text: '⌘K opens Pulse over a company record. The same bar finds Northwind’s records, answers what’s due today and starts an email; Esc puts you back on the record.' },

    { t: 'chapter', id: 'research', eyebrow: 'Research', toc: 'Research', title: 'What AI at the heart of search means',
      text: ['I started with the people who’d live with the decision. The CEO, the PM and the CTO each told me what putting AI at the heart of how people find things meant to them: for the business, for the roadmap and for what we could build.',
        'Then I reviewed how five products handle a command bar or AI: what each did well, and what Pulse could take from it. What I learned became four How Might We questions to design against.'] },
    { t: 'stats', items: [['3', 'stakeholder sessions: CEO, PM and CTO'], ['5', 'products reviewed']] },
    { t: 'html', label: 'Competitor review', html: review },
    { t: 'html', label: 'What we learned', html: learned },
    { t: 'html', label: 'How might we…', html: hmw, cap: 'Each question, and the part of Pulse that answers it.' },

    { t: 'chapter', id: 'search', eyebrow: 'Search', toc: 'One bar', title: 'No modes to choose',
      text: ['Search and AI share one list. Matching records appear as you type, and the first row offers to ask Pulse instead: ↵ opens a record, ⌘↵ asks. While Pulse looks, you can stop it.'] },
    { t: 'flow', wide: true, name: 'pulse-search', label: 'Prototype', title: '↵ opens, ⌘↵ asks',
      text: 'Records narrow as each letter lands, and ↓ ↵ opens one. Type a question instead and the same list offers to ask it; Stop hands the bar back while Pulse looks.' },
    { t: 'decision', title: 'One place to type', text: 'A separate AI chat would have meant two places to look, and a decision before every question. Making “Ask” the first result lets the same words do both.' },

    { t: 'chapter', id: 'ask', eyebrow: 'Ask', toc: 'Answers', title: 'Answers you can check, then act on',
      text: ['The answer streams in under your question, with a reminder to review it. It ends in one-tap follow-ups, like “Remind me at 9:30 AM”, and the records it came from, each a click away. The bar stays open for the next question.'] },
    { t: 'flow', wide: true, name: 'pulse-answer', label: 'Prototype', title: 'Check it, then act on it',
      text: 'The answer streams in with the records it came from, each a click away. “Remind me at 9:30 AM” sets the reminder from the answer, and the thumbs tell Pulse how it did.' },
    { t: 'decision', title: 'Show the receipts', text: 'In a CRM, an answer is only as good as the records behind it. Showing them under every answer lets people check before they act, and the thumbs tell us when Pulse gets it wrong.' },

    { t: 'chapter', id: 'compose', eyebrow: 'Compose', toc: 'Compose', title: 'Start from the job, not a blank prompt',
      text: ['Type /create and Pulse offers what it can make: a meeting note, a report, an email. Each opens a composer that already knows your account and asks what the email is about and who it’s for. The draft arrives as a real email, attachment included, ready to refine, edit or send.'] },
    { t: 'flow', wide: true, name: 'pulse-compose', label: 'Prototype', title: 'From /create to Send',
      text: 'Pick Create email and say what it’s about. The draft comes back addressed, with the pricing sheet attached; Refine makes it shorter, and you press Send.' },
    { t: 'decision', title: 'Pulse drafts; people send', text: 'Nothing leaves without a person pressing Send. Recreate and Refine let them steer the draft without starting over.' },

    { t: 'chapter', id: 'impact', eyebrow: 'Impact', toc: 'Impact', title: 'The default way to find things',
      text: ['Engineering built Pulse straight away, and it replaced the page-by-page search as the default. People stopped moving between pages: from one bar they could find a record, ask about it, draft the follow-up and plan the next step.'] },

    { t: 'chapter', id: 'reflection', eyebrow: 'Reflection', toc: 'Reflection', title: 'What I’d keep doing' },
    { t: 'reflect', items: [['Start with the people who carry the decision.', 'Hearing what the CEO, PM and CTO each needed from AI told me what Pulse had to be before I drew a single screen.'],
      ['Design the step after the answer.', 'An answer is rarely the goal. The follow-ups and the composer turned a search box into somewhere work gets done.']] },
  ],
};
