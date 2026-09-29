/*
  Shared content for all three concepts.
  This is also a first draft of the content model the editor will manage:
  site → companies → shots (each shot has one or more media frames).
  Copy marked "draft" was condensed from the current case studies — edit freely.
*/
window.PORTFOLIO = {
  site: {
    name: 'Adeleke Abdulazeez',
    first: 'Adeleke',
    role: 'Product Designer',
    location: 'Nigeria',
    timezone: 'Africa/Lagos',
    tzLabel: 'WAT',
    updated: '2026-09-28',
    email: 'delekeazzy1@gmail.com',
    links: [
      { label: 'CV', href: 'https://instantfind.me/adelekeazeez' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/deleke' },
      { label: 'Instagram', href: 'https://instagram.com/adeleke.design' },
    ],
    heroPhoto: 'assets/Hero-image.avif',
    // Benji-style summary. [text](key) marks inline links resolved in the page.
    summary: [
      'I’m a product designer based in Nigeria, with 5+ years across fintech, AI and B2B tools.',
      'I currently design at [Halvest](halvest), a halal investment platform, where I took the product from web-only to a mobile app that grew assets under management by $2.06M.',
      'Previously, I was the founding designer at [Impulse AI](impulse), an agentic CRM, and led design on [Cuuro](kinfolk), an AI due-diligence platform built inside Kinfolk VC.',
      'On the side I build iOS apps, [Waqty](waqty) and [Minaroute](minaroute), and design marketing sites in Webflow.',
      'You can find me on [LinkedIn](linkedin) and [Instagram](instagram), or reach me via [email](email).',
    ],
  },

  companies: [
    {
      id: 'halvest',
      name: 'Halvest',
      logo: 'assets/Logos/Halvest.png',
      role: 'Product Designer',
      years: '2024—now',
      start: '2024',
      tags: ['Fintech', 'Mobile', 'B2C'],
      url: 'https://halvestco.com',
      color: '#6935D3',
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
          desc: 'Bank-transfer funding with details you can copy in one tap, a calm “confirming” state while the money lands, and a success moment that hands you straight back to investing.',
          media: [{ type: 'video', src: 'assets/halvest/Halvest Video.mp4', w: 956, h: 720 }],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Interaction design', 'Prototyping'],
          tags: ['Fintech', 'Mobile', 'Motion'],
        },
        {
          id: 'onboarding',
          title: 'Onboarding, one step at a time',
          desc: 'Regulatory sign-up split into single-task screens (country, email, verification, password) with copy that explains why each detail is needed. Completion went up; testers called it “way easier”.',
          media: [{ src: 'assets/halvest/image 19.png', w: 1392, h: 895 }],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'UX writing'],
          tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'not-enough-funds',
          title: 'Not enough funds',
          desc: 'An edge case turned into a path forward: when the wallet is short, your amount stays put and a sheet offers to top up without losing your place.',
          media: [{ src: 'assets/halvest/image 20.png', w: 1392, h: 1048 }],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design'],
          tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'portfolio',
          title: 'Portfolio at a glance',
          desc: 'Holdings and financing composition with compliance details close at hand, but never in the way of the main action: investing.',
          media: [{ src: 'assets/halvest/image 5.png', w: 1392, h: 894 }],
          platform: 'iOS · Android', status: 'Shipped', year: '2025',
          contributions: ['Product design', 'Design system'],
          tags: ['Fintech', 'Mobile'],
        },
        {
          id: 'launch',
          title: 'Mobile launch',
          desc: 'The app out in the world. Halvest added 600 new investors in 2025 alone, more than doubling the user base.',
          media: [{ src: 'assets/halvest/image 2.png', w: 1392, h: 1044 }, { src: 'assets/halvest/Frame 2085654841.png', w: 1392, h: 697 }],
          platform: 'iOS · Android', status: 'Live', year: '2025',
          contributions: ['Product design', 'Launch'],
          tags: ['Fintech', 'Mobile'],
        },
      ],
    },
    {
      id: 'impulse',
      name: 'Impulse AI',
      logo: 'assets/Logos/Impulse.png',
      role: 'Founding Product Designer',
      years: '2023—2024',
      start: '2023',
      tags: ['AI', 'CRM', 'B2B'],
      url: 'https://impulsecrm.io',
      color: '#5B5BD6',
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
          desc: 'Filter premium data sources down to your ideal customer, then turn that search into a recurring automation without leaving the panel.',
          media: [{ type: 'video', src: 'assets/impulse/prospecting_djdauy.webm', w: 2000, h: 1254 }],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Interaction design', 'Prototyping'],
          tags: ['AI', 'Web', 'Motion'],
        },
        {
          id: 'pulse-search',
          title: 'Pulse: search, ask, compose',
          desc: 'One command bar for everything: find records, ask follow-ups about your pipeline, and draft emails or notes from what Pulse already knows. Step through the flow frame by frame.',
          media: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ src: `assets/impulse/Search - ${n}.png`, w: 2880, h: 1800 })),
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Interaction design', 'AI UX'],
          tags: ['AI', 'Web'],
        },
        {
          id: 'meetings',
          title: 'Meeting intelligence',
          desc: 'Summaries, action items, talk time and a chat that knows who was in the room, so every call becomes something you can act on.',
          media: [
            { src: 'assets/impulse/MacBook Pro 14_ - 83.png', w: 2880, h: 1800 },
            { src: 'assets/impulse/MacBook Pro 14_ - 84.png', w: 2880, h: 1800 },
            { src: 'assets/impulse/MacBook Pro 14_ - 88.png', w: 2880, h: 1800 },
            { src: 'assets/impulse/Slide 4_3 - 2.png', w: 2048, h: 1536 },
          ],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Product design', 'AI UX'],
          tags: ['AI', 'Web'],
        },
        {
          id: 'home',
          title: 'Ready when you are',
          desc: 'A home that greets you with what matters today and a single prompt to start from. Space, not clutter.',
          media: [{ src: 'assets/impulse/Entities - Overview - Companies.png', w: 2880, h: 1800 }],
          platform: 'Web', status: 'Shipped', year: '2024',
          contributions: ['Product design'],
          tags: ['AI', 'Web'],
        },
        {
          id: 'design-system',
          title: 'Pulse design system',
          desc: 'High-leverage components first (agent cards, task surfaces, pipeline views, automation states) to cover 80% of the product fast.',
          media: [{ src: 'assets/impulse/image 3.png', w: 1400, h: 918 }],
          platform: 'Figma · Web', status: 'Shipped', year: '2023',
          contributions: ['Design system'],
          tags: ['AI', 'Web'],
        },
        {
          id: 'marketing',
          title: 'Contextual relationship management',
          desc: 'Launch site and customer stories for the public release.',
          media: [{ src: 'assets/impulse/Impulse first image.png', w: 1400, h: 1260 }, { src: 'assets/impulse/image 4.png', w: 1400, h: 870 }],
          platform: 'Web', status: 'Live', year: '2024',
          contributions: ['Web design'],
          tags: ['AI', 'Web'],
        },
      ],
    },
    {
      id: 'kinfolk',
      name: 'Kinfolk VC',
      product: 'Cuuro',
      logo: 'assets/Logos/Kinfolk.png',
      role: 'Lead Product Designer',
      years: 'Earlier', // TODO: confirm dates
      start: '',
      tags: ['AI', 'VC', 'B2B'],
      url: 'https://kinfolk.vc',
      color: '#111111',
      summary: 'Led design of Cuuro, an AI due-diligence platform built inside Kinfolk VC for investors and the founders they back.',
      impact: [
        { value: '20+ hrs', label: 'Saved per week' },
        { value: '120%', label: 'Faster diligence cycles' },
      ],
      shots: [
        {
          id: 'deal-flow',
          title: 'Deal flow command center',
          desc: 'Every startup on one board. Open one to see activity, team, files and a collaborative risk scorecard that specialists can add to before capital moves.',
          media: [{ type: 'video', src: 'assets/kinfolk/cuuro video 2 v2.mp4', w: 1136, h: 720 }, { src: 'assets/kinfolk/Cuuro 2.png', w: 1400, h: 882 }],
          platform: 'Web', status: 'Internal', year: '',
          contributions: ['Product design', 'Prototyping'],
          tags: ['AI', 'Web', 'Motion'],
        },
        {
          id: 'meeting-recording',
          title: 'AI meeting recording',
          desc: 'Investor–founder calls transcribed, with extracted action items, citable moments and AI-suggested follow-up questions.',
          media: [{ src: 'assets/kinfolk/Cuuro 3.png', w: 1400, h: 875 }],
          platform: 'Web', status: 'Internal', year: '',
          contributions: ['Product design', 'AI UX'],
          tags: ['AI', 'Web'],
        },
        {
          id: 'applications',
          title: 'Founder applications',
          desc: 'Real-time status for every application, from submission to first investment, with a shared data room.',
          media: [{ src: 'assets/kinfolk/Cuuro 4.png', w: 1400, h: 875 }],
          platform: 'Web', status: 'Internal', year: '',
          contributions: ['Product design'],
          tags: ['Web'],
        },
        {
          id: 'transaction-rules',
          title: 'Transaction rules',
          desc: 'Founders connect their bank; AI categorises transactions and custom rules keep the books transparent for the team and investors.',
          media: [{ src: 'assets/kinfolk/Cuuro 5.png', w: 1400, h: 875 }],
          platform: 'Web', status: 'Internal', year: '',
          contributions: ['Product design', 'AI UX'],
          tags: ['AI', 'Fintech', 'Web'],
        },
        {
          id: 'site',
          title: 'Invest with precision',
          desc: 'Marketing site for taking Cuuro to other funds.',
          media: [{ src: 'assets/kinfolk/Cuuro 1.png', w: 1400, h: 904 }, { src: 'assets/kinfolk/cuuro 6.png', w: 1400, h: 706 }],
          platform: 'Web', status: 'Handed off', year: '',
          contributions: ['Web design'],
          tags: ['AI', 'Web'],
        },
      ],
    },
  ],

  sideProjects: [
    { id: 'waqty', name: 'Waqty', note: 'My time', logo: 'assets/Logos/Waqty.png', tags: ['Productivity', 'iOS', 'Mental health'], href: 'https://testflight.apple.com/join/f8TbJ9Qy', status: 'TestFlight' },
    { id: 'minaroute', name: 'Minaroute', logo: 'assets/Logos/Minaroute.png', tags: ['Travel', 'iOS'], href: 'https://testflight.apple.com/join/7cghR8qf', status: 'TestFlight' },
  ],
  webflow: [
    { id: 'atlas', name: 'Atlascopilot', logo: 'assets/Logos/Atlas.png', tags: ['AI', 'SaaS'], href: 'https://atlascopilot.com', status: 'Live' },
    { id: 'aihr', name: 'AIHR Summit', logo: 'assets/Logos/AIHR_Webclip.png', tags: ['Conference'], href: 'https://aihrsummit.com', status: 'Live' },
  ],
};

/* ---------- helpers shared by the concepts ---------- */
(function () {
  const P = window.PORTFOLIO;
  const base = '../';
  P.asset = (p) => base + encodeURI(p);

  // Flat list of shots, each with a back-reference to its company and a running index.
  P.allShots = [];
  P.companies.forEach((c) => c.shots.forEach((s) => { s.company = c; s.index = P.allShots.length; P.allShots.push(s); }));

  P.linkFor = (key) => {
    const s = P.site;
    const map = {
      linkedin: s.links.find((l) => l.label === 'LinkedIn').href,
      instagram: s.links.find((l) => l.label === 'Instagram').href,
      email: 'mailto:' + s.email,
    };
    if (map[key]) return { href: map[key], external: key !== 'email' };
    const side = [...P.sideProjects, ...P.webflow].find((x) => x.id === key);
    if (side) return { href: side.href, external: true };
    if (P.companies.find((c) => c.id === key)) return { href: '#' + key, external: false };
    return { href: '#', external: false };
  };

  // Turn "[text](key)" into anchors.
  P.richText = (str, cls = '') =>
    str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, key) => {
      const l = P.linkFor(key);
      return `<a class="${cls}" href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    });

  P.updatedLabel = () =>
    new Date(P.site.updated + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  P.localTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: P.site.timezone }).toLowerCase().replace(' ', '');

  P.startClock = (el, fmt) => {
    if (!el) return;
    const tick = () => { el.textContent = fmt ? fmt(P.localTime()) : P.localTime(); };
    tick();
    setInterval(tick, 15000);
  };

  P.mediaHTML = (m, { autoplay = true, cls = '' } = {}) => {
    const src = P.asset(m.src);
    if (m.type === 'video') {
       return `<video class="${cls}" src="${src}#t=0.1" ${autoplay ? 'autoplay' : ''} muted loop playsinline preload="metadata" width="${m.w}" height="${m.h}"></video>`;
    }
    return `<img class="${cls}" src="${src}" alt="" loading="lazy" decoding="async" width="${m.w}" height="${m.h}" />`;
  };
})();
