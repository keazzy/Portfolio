/*
  Seed content. Two jobs:
    1. The site renders from this until Sanity is connected (see src/lib/content.ts).
    2. scripts/import-seed.ts pushes it into Sanity, uploading every file under `assets/`.
  After the import, edit content in the Studio (/studio), not here.

  Links inside summary paragraphs use Markdown syntax: [text](url).
*/

export type SeedMedia = { path: string; w: number; h: number; alt?: string };
export type SeedShot = {
  id: string;
  title: string;
  description: string;
  media: SeedMedia[];
  platform?: string;
  status?: string;
  year?: string;
  contributions: string[];
  tags: string[];
  story?: { problem?: string; did?: string; decision?: string; result?: string };
  methods?: string[];
  caseStudy?: string;
  locked?: boolean;
};
export type SeedCompany = {
  id: string;
  name: string;
  product?: string;
  logo: string;
  role: string;
  years: string;
  tags: string[];
  url: string;
  summary: string;
  impact: { value: string; label: string }[];
  shots: SeedShot[];
};
export type SeedProject = { id: string; name: string; note?: string; logo: string; tags: string[]; url: string; status: string };

const img = (path: string, w: number, h: number): SeedMedia => ({ path, w, h });

export const seed = {
  settings: {
    name: 'Adeleke Abdulazeez',
    role: 'Product Designer',
    location: 'Nigeria',
    timezone: 'Africa/Lagos',
    headline: 'I’m Adeleke, a product designer who makes money and AI feel trustworthy.',
    emphasis: 'trustworthy',
    summary: [
      'I’m a product designer based in Nigeria, with 5+ years across fintech, AI and B2B tools.',
      'I currently design at [Halvest](#halvest), a halal investment platform, where I took the product from web-only to a mobile app that grew assets under management by $2.06M.',
      'Previously, I was the founding designer at [Impulse AI](#impulse), an agentic CRM, and led design on [Cuuro](#kinfolk), an AI due-diligence platform built inside Kinfolk VC.',
      'On the side I build iOS apps, [Waqty](https://testflight.apple.com/join/f8TbJ9Qy) and [Minaroute](https://testflight.apple.com/join/7cghR8qf), and design marketing sites in Webflow.',
      'You can find me on [LinkedIn](https://linkedin.com/in/deleke) and [Instagram](https://instagram.com/adeleke.design), or reach me via [email](mailto:delekeazzy1@gmail.com).',
    ],
    photo: { path: 'assets/Hero-image.avif', w: 960, h: 1280, alt: 'Stage at a Halvest event under an ‘A New Dawn’ banner', caption: 'Halvest, a new dawn' },
    email: 'delekeazzy1@gmail.com',
    links: [
      { label: 'CV', url: 'https://instantfind.me/adelekeazeez' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/deleke' },
      { label: 'Instagram', url: 'https://instagram.com/adeleke.design' },
    ],
    historyExtras: [{ years: 'Ongoing', name: 'Side projects', role: 'iOS apps · Webflow', href: '#side' }],
    accent: 'ember' as const,
    aurora: true,
    seo: {
      title: 'Adeleke Abdulazeez — Product Designer',
      description: 'Product designer in Nigeria making money and AI feel trustworthy. Work across Halvest, Impulse AI and Kinfolk VC.',
    },
    updatedAt: '2026-09-28T12:00:00Z',
  },

  companies: [
    {
      id: 'halvest',
      name: 'Halvest',
      logo: 'assets/Logos/Halvest.png',
      role: 'Senior Product Designer',
      years: '2024—now',
      tags: ['Fintech', 'Mobile', 'B2C'],
      url: 'https://halvestco.com',
      summary: 'Sole product designer at Halvest, a halal investment platform. I took it from web to a mobile-led product, launched halal US and NGX stocks, and built Vest, the design system we design and ship from. Now leading v2, which opens ethical investing to everyday investors under Halvest’s new SEC licence.',
      impact: [
        { value: '$2.06M', label: 'AUM growth since mobile launch' },
        { value: '145%', label: 'Revenue increase' },
        { value: '950+', label: 'Registered investors' },
      ],
      // Projects, strongest first. `story` feeds the viewer sidebar; [brackets] are numbers still to fill in.
      shots: [
        {
          id: 'mobile',
          title: 'Halvest goes mobile',
          description: 'Halvest’s first mobile app, designed for the phone rather than shrunk from the web. It now serves most of Halvest’s investors.',
          story: {
            problem: 'Halvest ran on a responsive website: usable on a phone, but never designed for one, and the phone is where investors were.',
            did: 'Designed the app end to end: funding the wallet, investing, the portfolio, and edge cases like a short balance. Built interactive prototypes in code so engineering could feel the interactions before building them.',
            decision: 'Ship the core loop first (fund, invest, track) instead of matching every web feature on day one.',
            result: 'Most investors now use the app. Since launch, AUM grew by $2.06M and registered investors passed 950.',
          },
          media: [img('assets/halvest/mockups/portfolio-pink.webp', 1000, 666), img('assets/halvest/Halvest Video.mp4', 956, 720), img('assets/halvest/image 20.png', 1392, 1048), img('assets/halvest/image 5.png', 1392, 894), img('assets/halvest/image 2.png', 1392, 1044)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'Interaction design', 'Prototyping in code'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'stocks',
          title: 'Halal stocks, from the US to the NGX',
          description: 'Stock investing for people who need to know every share is halal: US stocks first, then halal stocks on the Nigerian Exchange.',
          story: {
            problem: 'Ethically minded investors wanted stocks, but only if they could trust that each one was halal.',
            did: 'Ran six discovery calls with investors (I wrote the script and template) and five usability sessions on the prototype, then carried what we learned into the launch of halal NGX stocks.',
            decision: 'Show compliance status right where you decide to buy, with the screening detail one tap away, so trust never slows investing down.',
            result: 'Together with the app, the new stock products drove much of Halvest’s AUM growth: ethically minded investors finally had stocks they could buy with peace of mind.',
          },
          methods: ['User interviews', 'Usability testing'],
          caseStudy: '/work/halvest/stocks',
          // Unreleased v2 screens: the password is in my applications. Only the pre-blurred cover is public.
          locked: true,
          media: [img('assets/halvest/stocks/locked-cover.webp', 1000, 800)],
          platform: 'iOS · Android', status: 'Shipped', year: '2026',
          contributions: ['Product design', 'Research'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'vest',
          title: 'Vest: one design system, Figma to code',
          description: 'Halvest’s design system, built in Figma and in code, with tools that keep the two in sync. I now open pull requests myself.',
          story: {
            problem: 'As the only designer, keeping design and code aligned depended on me noticing: a colour changed in Figma and the app didn’t follow, copy said one thing in design and another in production.',
            did: 'Built Vest in Figma and as a code package: 346 tokens in light and dark, and 44 components. Then built Halvest Tokens, a Figma plugin that turns token changes into a pull request, and Halvest Say, which keeps the words in Figma and the words in the app the same.',
            decision: 'Spend time on tooling instead of more screens, so the system enforces itself rather than relying on me to catch drift.',
            result: 'Design changes reach the codebase as reviewed pull requests, not messages. A token change goes from Figma to checked code in seconds.',
          },
          caseStudy: '/work/halvest/vest',
          media: [img('assets/halvest/vest-teaser.mp4', 1280, 720)],
          platform: 'Figma · React Native', status: 'Shipping soon', year: '2026',
          contributions: ['Design system', 'Design engineering', 'Tooling'], tags: ['Design system', 'AI'],
        },
        {
          id: 'onboarding',
          title: 'Onboarding that keeps people',
          description: 'Sign-up rebuilt from the data: faster and simpler, with every security check intact.',
          story: {
            problem: 'Mobile inherited the web’s onboarding. Mixpanel and support tickets showed people getting stuck verifying their accounts, and some giving up.',
            did: 'Mapped the drop-off in Mixpanel, read the tickets and talked to users. Rebuilt the flow as one-task screens, reordered the steps, and explained why each detail is needed.',
            decision: 'Keep every check, but move identity verification to the moment it matters, before the first investment, so people get into the app first.',
            result: 'Verification completion rose and verification tickets dropped significantly after the redesign.',
          },
          methods: ['Mixpanel', 'Support tickets', 'User feedback'],
          media: [img('assets/halvest/image 19.png', 1392, 895)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'Research', 'UX writing'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'v2',
          title: 'Halvest v2: ethical investing for everyone',
          description: 'A new brand and a new app as Halvest’s SEC licence opens it to everyday investors, not only the wealthy.',
          story: {
            problem: 'Halvest was built for high-net-worth investors. The new SEC licence means it now has to welcome someone investing for the first time.',
            did: 'Leading the v2 app, and led the brand refresh with a contract brand designer: logo, illustration, iconography and photography.',
            decision: 'Keep the trust wealthy investors expect while feeling approachable to someone starting small.',
            result: 'Shipping 2027. More to show at launch.',
          },
          media: [img('assets/halvest/v2/app-icon.png', 512, 512)],
          platform: 'iOS · Android · Brand', status: 'In progress', year: '2027',
          contributions: ['Product design', 'Brand direction'], tags: ['Fintech', 'Brand'],
        },
        {
          id: 'halvest-os',
          title: 'Halvest OS: an AI workspace for the team',
          description: 'A workspace that starts from what Halvest already knows instead of a blank chat. A working prototype I use in my own work.',
          story: {
            problem: 'Company knowledge lived across docs, inboxes and people’s heads, and every AI chat started from zero.',
            did: 'Designed and built the prototype: sign-in with work accounts, a workspace grounded in Halvest’s own knowledge, and shared work so answers reach colleagues instead of sitting in one person’s history.',
            decision: 'Start from company knowledge, not a blank prompt.',
            result: 'A working prototype I use day to day.',
          },
          media: [img('assets/Logos/Halvest.png', 78, 78)],
          platform: 'Web', status: 'Prototype', year: '2026',
          contributions: ['Product design', 'Design engineering', 'AI'], tags: ['AI', 'Internal tools'],
        },
        {
          id: 'admin',
          title: 'Admin dashboard, organised around how ops works',
          description: 'The internal dashboard restructured around workstreams and permission levels, so it scales as Halvest adds products.',
          story: {
            problem: 'Stakeholder interviews kept pointing to the same thing: people couldn’t find what they needed, because the structure didn’t match how they work.',
            did: 'Interviewed the teams who use it, then rebuilt the information architecture around workstreams and permission levels.',
            decision: 'Organise by how each team works, not by data type, even though some records now appear in more than one place.',
            result: 'New products like stocks slot in without a rethink, and each team sees the work and permissions that are theirs.',
          },
          methods: ['Stakeholder interviews'],
          media: [img('assets/Logos/Halvest.png', 78, 78)],
          platform: 'Web',
          contributions: ['Information architecture', 'Research'], tags: ['Internal tools'],
        },
      ],
    },
    {
      id: 'impulse',
      name: 'Impulse AI',
      logo: 'assets/Logos/Impulse.png',
      role: 'Founding Product Designer',
      years: '2023—2024',
      tags: ['AI', 'CRM', 'B2B'],
      url: 'https://impulsecrm.io',
      summary: 'First designer at an AI-native, agentic CRM. Set the product direction and built the Pulse design system from zero. Five companies signed on from the designs alone.',
      impact: [
        { value: '5', label: 'Companies onboarded pre-launch' },
        { value: 'V1', label: 'Full product shipped' },
        { value: '0→1', label: 'Design system built' },
      ],
      shots: [
        {
          id: 'prospecting',
          title: 'Prospecting to automation',
          description: 'Filter premium data sources down to your ideal customer, then turn that search into a recurring automation without leaving the panel.',
          media: [img('assets/impulse/prospecting_djdauy.webm', 2000, 1254)],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Interaction design', 'Prototyping'], tags: ['AI', 'Web', 'Motion'],
        },
        {
          id: 'pulse-search',
          title: 'Pulse: search, ask, compose',
          description: 'One command bar for everything: find records, ask follow-ups about your pipeline, and draft emails or notes from what Pulse already knows. Step through the flow frame by frame.',
          media: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => img(`assets/impulse/Search - ${n}.png`, 2880, 1800)),
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Interaction design', 'AI UX'], tags: ['AI', 'Web'],
        },
        {
          id: 'meetings',
          title: 'Meeting intelligence',
          description: 'Summaries, action items, talk time and a chat that knows who was in the room, so every call becomes something you can act on.',
          media: [
            img('assets/impulse/MacBook Pro 14_ - 83.png', 2880, 1800),
            img('assets/impulse/MacBook Pro 14_ - 84.png', 2880, 1800),
            img('assets/impulse/MacBook Pro 14_ - 88.png', 2880, 1800),
            img('assets/impulse/Slide 4_3 - 2.png', 2048, 1536),
          ],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Product design', 'AI UX'], tags: ['AI', 'Web'],
        },
        {
          id: 'home',
          title: 'Ready when you are',
          description: 'A home that greets you with what matters today and a single prompt to start from. Space, not clutter.',
          media: [img('assets/impulse/Entities - Overview - Companies.png', 2880, 1800)],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Product design'], tags: ['AI', 'Web'],
        },
        {
          id: 'design-system',
          title: 'Pulse design system',
          description: 'High-leverage components first (agent cards, task surfaces, pipeline views, automation states) to cover 80% of the product fast.',
          media: [img('assets/impulse/image 3.png', 1400, 918)],
          platform: 'Figma · Web', status: 'Shipped', year: '2023',
          contributions: ['Design system'], tags: ['AI', 'Web'],
        },
        {
          id: 'marketing',
          title: 'Contextual relationship management',
          description: 'Launch site and customer stories for the public release.',
          media: [img('assets/impulse/Impulse first image.png', 1400, 1260), img('assets/impulse/image 4.png', 1400, 870)],
          platform: 'Web', status: 'Live', year: '2024',
          contributions: ['Web design'], tags: ['AI', 'Web'],
        },
      ],
    },
    {
      id: 'kinfolk',
      name: 'Kinfolk VC',
      product: 'Cuuro',
      logo: 'assets/Logos/Kinfolk.png',
      role: 'Lead Product Designer',
      years: 'Earlier', // TODO: real dates
      tags: ['AI', 'VC', 'B2B'],
      url: 'https://kinfolk.vc',
      summary: 'Led design of Cuuro, an AI due-diligence platform built inside Kinfolk VC for investors and the founders they back.',
      impact: [
        { value: '20+ hrs', label: 'Saved per week' },
        { value: '120%', label: 'Faster diligence cycles' },
      ],
      shots: [
        {
          id: 'deal-flow',
          title: 'Deal flow command center',
          description: 'Every startup on one board. Open one to see activity, team, files and a collaborative risk scorecard that specialists can add to before capital moves.',
          media: [img('assets/kinfolk/cuuro video 2 v2.mp4', 1136, 720), img('assets/kinfolk/Cuuro 2.png', 1400, 882)],
          platform: 'Web', status: 'Internal',
          contributions: ['Product design', 'Prototyping'], tags: ['AI', 'Web', 'Motion'],
        },
        {
          id: 'meeting-recording',
          title: 'AI meeting recording',
          description: 'Investor–founder calls transcribed, with extracted action items, citable moments and AI-suggested follow-up questions.',
          media: [img('assets/kinfolk/Cuuro 3.png', 1400, 875)],
          platform: 'Web', status: 'Internal',
          contributions: ['Product design', 'AI UX'], tags: ['AI', 'Web'],
        },
        {
          id: 'applications',
          title: 'Founder applications',
          description: 'Real-time status for every application, from submission to first investment, with a shared data room.',
          media: [img('assets/kinfolk/Cuuro 4.png', 1400, 875)],
          platform: 'Web', status: 'Internal',
          contributions: ['Product design'], tags: ['Web'],
        },
        {
          id: 'transaction-rules',
          title: 'Transaction rules',
          description: 'Founders connect their bank; AI categorises transactions and custom rules keep the books transparent for the team and investors.',
          media: [img('assets/kinfolk/Cuuro 5.png', 1400, 875)],
          platform: 'Web', status: 'Internal',
          contributions: ['Product design', 'AI UX'], tags: ['AI', 'Fintech', 'Web'],
        },
        {
          id: 'site',
          title: 'Invest with precision',
          description: 'Marketing site for taking Cuuro to other funds.',
          media: [img('assets/kinfolk/Cuuro 1.png', 1400, 904), img('assets/kinfolk/cuuro 6.png', 1400, 706)],
          platform: 'Web', status: 'Handed off',
          contributions: ['Web design'], tags: ['AI', 'Web'],
        },
      ],
    },
  ] satisfies SeedCompany[],

  sideProjects: [
    { id: 'waqty', name: 'Waqty', note: 'My time', logo: 'assets/Logos/Waqty.png', tags: ['Productivity', 'iOS', 'Mental health'], url: 'https://testflight.apple.com/join/f8TbJ9Qy', status: 'TestFlight' },
    { id: 'minaroute', name: 'Minaroute', logo: 'assets/Logos/Minaroute.png', tags: ['Travel', 'iOS'], url: 'https://testflight.apple.com/join/7cghR8qf', status: 'TestFlight' },
  ] satisfies SeedProject[],

  webflow: [
    { id: 'atlas', name: 'Atlascopilot', logo: 'assets/Logos/Atlas.png', tags: ['AI', 'SaaS'], url: 'https://atlascopilot.com', status: 'Live' },
    { id: 'aihr', name: 'AIHR Summit', logo: 'assets/Logos/AIHR_Webclip.png', tags: ['Conference'], url: 'https://aihrsummit.com', status: 'Live' },
  ] satisfies SeedProject[],
};
