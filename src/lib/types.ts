/*
  The shape every component renders from. Sanity results and the local seed are
  both mapped into these types, so components never care where content came from.
*/

export type Accent = 'ember' | 'iris' | 'claret';

/** One run of text inside a paragraph; `href` makes it a link. */
export type Span = { text: string; href?: string; external?: boolean };
export type Paragraph = Span[];

export type Media = {
  kind: 'image' | 'video';
  /** Full-size source for the viewer. */
  src: string;
  /** Smaller source for cards and thumbnails (same as `src` for video). */
  card: string;
  thumb: string;
  width: number;
  height: number;
  alt?: string;
  /** The uploaded file's name: tells whether a designed cover still matches the project's first image. */
  file?: string;
  /** A composed frame (stage, live component) rendered as-is instead of `src`. */
  html?: string;
  thumbHTML?: string;
  caption?: string;
  /** Live component to run while this frame is showing. */
  live?: string;
  /** Shape on phones, when it differs from `width` × `height`. */
  nw?: number;
  nh?: number;
};

/** The short story beside a shot: what was wrong, what I did, the call I made, what changed. */
export type Story = { problem?: string; did?: string; decision?: string; result?: string };

/** How a shot appears as a card: cover markup and the background it sits on. */
export type Cover = { html: string; background: string; tall: boolean; reel?: string };

export type Shot = {
  id: string;
  /** Deep-link key, `company/shot`. */
  key: string;
  title: string;
  description: string;
  media: Media[];
  platform?: string;
  status?: string;
  year?: string;
  contributions: string[];
  tags: string[];
  story?: Story;
  methods?: string[];
  /** Link to the full case study, when there is one. */
  caseStudy?: string;
  /** Behind the case-study password until it's entered. */
  locked?: boolean;
  cover?: Cover;
};

export type Impact = { value: string; label: string };

export type Company = {
  id: string;
  name: string;
  product?: string;
  logo?: string;
  role: string;
  years: string;
  tags: string[];
  url?: string;
  summary: string;
  impact: Impact[];
  shots: Shot[];
};

export type ProjectLink = {
  id: string;
  name: string;
  note?: string;
  logo?: string;
  tags: string[];
  url: string;
  status?: string;
};

export type HistoryRow = { years: string; name: string; role: string; href: string };

export type WorkSection = { type: 'work'; key: string; layout: 'rows' | 'grid'; companies: Company[] };
export type ProjectsSection = {
  type: 'projects';
  key: string;
  anchor: string;
  layout: 'list' | 'cards';
  groups: { title: string; items: ProjectLink[] }[];
};
export type SayHelloSection = { type: 'sayHello'; key: string; label: string };
export type Section = WorkSection | ProjectsSection | SayHelloSection;

export type Settings = {
  name: string;
  role: string;
  location: string;
  timezone: string;
  /** Headline with the emphasised words pulled out so they can be set in italic. */
  headline: { before: string; emphasis: string; after: string };
  /** The intro reads: a short line, “Currently” and “Previously”, then the summary paragraphs. */
  intro: Paragraph[];
  currently: Paragraph[];
  previously: Paragraph[];
  summary: Paragraph[];
  photo?: { src: string; alt: string; caption?: string };
  email: string;
  links: { label: string; url: string }[];
  history: HistoryRow[];
  accent: Accent;
  aurora: boolean;
  updatedAt: string;
  seo: { title: string; description: string };
};

export type Portfolio = {
  settings: Settings;
  sections: Section[];
  /** Every shot in page order, for the viewer's prev/next. */
  shots: (Shot & { company: Pick<Company, 'id' | 'name' | 'product' | 'logo' | 'years' | 'url' | 'impact'> })[];
  source: 'sanity' | 'seed';
};
