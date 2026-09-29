import { cache } from 'react';
import { seed, type SeedCompany, type SeedMedia, type SeedProject } from '@/content/seed';
import { client, imageUrl } from '@/sanity/client';
import { isSanityConfigured } from '@/sanity/env';
import { PORTFOLIO_QUERY } from '@/sanity/queries';
import { parseMarkdownLinks, portableTextToParagraphs, splitHeadline } from './text';
import type { Accent, Company, HistoryRow, Media, Portfolio, ProjectLink, Section, Settings, Shot } from './types';

/*
  Single entry point for page content. Reads from Sanity once a project is
  connected (NEXT_PUBLIC_SANITY_PROJECT_ID), otherwise from the local seed.
*/
export const getPortfolio = cache(async function getPortfolio(): Promise<Portfolio> {
  if (!isSanityConfigured) return fromSeed();
  const data = await client.fetch(PORTFOLIO_QUERY, {}, { next: { revalidate: 60, tags: ['sanity'] } });
  if (!data?.settings || !data?.home) return fromSeed(); // empty dataset: keep the site up until the import runs
  return fromSanity(data);
});

/* ---------------- shared assembly ---------------- */

function assemble(settings: Omit<Settings, 'history'>, sections: Section[], extras: HistoryRow[], source: Portfolio['source']): Portfolio {
  const companies = sections.flatMap((s) => (s.type === 'work' ? s.companies : []));
  const history: HistoryRow[] = [
    ...companies.map((c) => ({ years: c.years, name: c.name, role: c.role, href: `#${c.id}` })),
    ...extras,
  ];
  const shots = companies.flatMap((c) =>
    c.shots.map((s) => ({ ...s, company: { id: c.id, name: c.name, product: c.product, logo: c.logo, years: c.years, url: c.url, impact: c.impact } })),
  );
  return { settings: { ...settings, history }, sections, shots, source };
}

/* ---------------- seed ---------------- */

const local = (p: string) => '/' + p.split('/').map(encodeURIComponent).join('/');
const isVideo = (p: string) => /\.(mp4|webm|mov)$/i.test(p);

function seedMedia(m: SeedMedia): Media {
  const src = local(m.path);
  return { kind: isVideo(m.path) ? 'video' : 'image', src, card: src, thumb: src, width: m.w, height: m.h, alt: m.alt };
}

function seedCompany(c: SeedCompany): Company {
  return {
    ...c,
    logo: local(c.logo),
    shots: c.shots.map((s): Shot => ({ ...s, key: `${c.id}/${s.id}`, media: s.media.map(seedMedia) })),
  };
}

const seedProject = (p: SeedProject): ProjectLink => ({ ...p, logo: local(p.logo) });

function fromSeed(): Portfolio {
  const s = seed.settings;
  const settings: Omit<Settings, 'history'> = {
    name: s.name,
    role: s.role,
    location: s.location,
    timezone: s.timezone,
    headline: splitHeadline(s.headline, s.emphasis),
    summary: s.summary.map(parseMarkdownLinks),
    photo: { src: local(s.photo.path), alt: s.photo.alt, caption: s.photo.caption },
    email: s.email,
    links: s.links,
    accent: s.accent,
    aurora: s.aurora,
    updatedAt: s.updatedAt,
    seo: s.seo,
  };
  const sections: Section[] = [
    { type: 'work', key: 'work', layout: 'rows', companies: seed.companies.map(seedCompany) },
    {
      type: 'projects',
      key: 'projects',
      anchor: 'side',
      layout: 'list',
      groups: [
        { title: 'Side projects', items: seed.sideProjects.map(seedProject) },
        { title: 'Webflow sites', items: seed.webflow.map(seedProject) },
      ],
    },
    { type: 'sayHello', key: 'hello', label: 'Say hello' },
  ];
  return assemble(settings, sections, s.historyExtras, 'seed');
}

/* ---------------- sanity ---------------- */

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function sanityMedia(m: Raw): Media | null {
  if (m._type === 'videoFrame') {
    if (!m.url) return null;
    return { kind: 'video', src: m.url, card: m.url, thumb: m.url, width: m.width || 1600, height: m.height || 1000, alt: m.alt };
  }
  if (!m.assetId) return null;
  return {
    kind: 'image',
    src: imageUrl(m.assetId, 2400),
    card: imageUrl(m.assetId, 1200),
    thumb: imageUrl(m.assetId, 240),
    width: m.width || 1600,
    height: m.height || 1000,
    alt: m.alt,
  };
}

function sanityCompany(c: Raw): Company {
  const id = c.id;
  return {
    id,
    name: c.name || 'Untitled',
    product: c.product || undefined,
    logo: c.logo ? imageUrl(c.logo, 160) : undefined,
    role: c.role || '',
    years: c.years || '',
    tags: c.tags || [],
    url: c.url || undefined,
    summary: c.summary || '',
    impact: (c.impact || []).filter((i: Raw) => i?.value),
    shots: (c.shots || [])
      .map((s: Raw): Shot => ({
        id: s.id,
        key: `${id}/${s.id}`,
        title: s.title || 'Untitled',
        description: s.description || '',
        media: (s.media || []).map(sanityMedia).filter(Boolean) as Media[],
        platform: s.platform || undefined,
        status: s.status || undefined,
        year: s.year || undefined,
        contributions: s.contributions || [],
        tags: s.tags || [],
      }))
      .filter((s: Shot) => s.media.length > 0),
  };
}

function fromSanity(data: Raw): Portfolio {
  const s = data.settings;
  const settings: Omit<Settings, 'history'> = {
    name: s.name || '',
    role: s.role || '',
    location: s.location || '',
    timezone: s.timezone || 'Africa/Lagos',
    headline: splitHeadline(s.headline || '', s.emphasis),
    summary: portableTextToParagraphs(s.summary),
    photo: s.photo ? { src: imageUrl(s.photo, 600), alt: s.photoAlt || '', caption: s.photoCaption || undefined } : undefined,
    email: s.email || '',
    links: (s.links || []).filter((l: Raw) => l?.url),
    accent: (['ember', 'iris', 'claret'].includes(s.accent) ? s.accent : 'ember') as Accent,
    aurora: s.aurora !== false,
    updatedAt: data.updatedAt || new Date().toISOString(),
    seo: { title: s.seoTitle || s.name || 'Portfolio', description: s.seoDescription || '' },
  };
  const sections: Section[] = (data.home.sections || []).map((sec: Raw): Section | null => {
    if (sec._type === 'workSection') {
      return { type: 'work', key: sec._key, layout: sec.layout === 'grid' ? 'grid' : 'rows', companies: (sec.companies || []).filter(Boolean).map(sanityCompany) };
    }
    if (sec._type === 'projectsSection') {
      return {
        type: 'projects',
        key: sec._key,
        anchor: sec.anchor || 'side',
        layout: sec.layout === 'cards' ? 'cards' : 'list',
        groups: (sec.groups || []).map((g: Raw) => ({
          title: g.title || '',
          items: (g.items || []).filter((i: Raw) => i?.url).map((i: Raw) => ({
            id: i._key, name: i.name || '', note: i.note || undefined, logo: i.logo ? imageUrl(i.logo, 120) : undefined,
            tags: i.tags || [], url: i.url, status: i.status || undefined,
          })),
        })),
      };
    }
    if (sec._type === 'sayHelloSection') return { type: 'sayHello', key: sec._key, label: sec.label || 'Say hello' };
    return null;
  }).filter(Boolean) as Section[];
  return assemble(settings, sections, (s.historyExtras || []).filter((h: Raw) => h?.name), 'sanity');
}
