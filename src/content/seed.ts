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
      role: 'Product Designer',
      years: '2024—now',
      tags: ['Fintech', 'Mobile', 'B2C'],
      url: 'https://halvestco.com',
      summary: 'Took a web-only halal investment platform to mobile. Rebuilt onboarding, investing and the wallet so ethical investing fits in your pocket.',
      impact: [
        { value: '$2.06M', label: 'AUM growth since mobile launch' },
        { value: '145%', label: 'Revenue increase' },
        { value: '950+', label: 'Registered investors' },
      ],
      shots: [
        {
          id: 'fund-wallet',
          title: 'Funding the wallet',
          description: 'Bank-transfer funding with details you can copy in one tap, a calm “confirming” state while the money lands, and a success moment that hands you straight back to investing.',
          media: [img('assets/halvest/Halvest Video.mp4', 956, 720)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Interaction design', 'Prototyping'], tags: ['Fintech', 'Mobile', 'Motion'],
        },
        {
          id: 'onboarding',
          title: 'Onboarding, one step at a time',
          description: 'Regulatory sign-up split into single-task screens (country, email, verification, password) with copy that explains why each detail is needed. Completion went up; testers called it “way easier”.',
          media: [img('assets/halvest/image 19.png', 1392, 895)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'UX writing'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'not-enough-funds',
          title: 'Not enough funds',
          description: 'An edge case turned into a path forward: when the wallet is short, your amount stays put and a sheet offers to top up without losing your place.',
          media: [img('assets/halvest/image 20.png', 1392, 1048)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'portfolio',
          title: 'Portfolio at a glance',
          description: 'Holdings and financing composition with compliance details close at hand, but never in the way of the main action: investing.',
          media: [img('assets/halvest/image 5.png', 1392, 894)],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'Design system'], tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'launch',
          title: 'Mobile launch',
          description: 'The app out in the world. Halvest added 600 new investors in 2025 alone, more than doubling the user base.',
          media: [img('assets/halvest/image 2.png', 1392, 1044), img('assets/halvest/Frame 2085654841.png', 1392, 697)],
          platform: 'iOS · Android', status: 'Live', year: '2025',
          contributions: ['Product design', 'Launch'], tags: ['Fintech', 'Mobile'],
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
