import type { Paragraph, Span } from './types';

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** "I design at [Halvest](#halvest)." → spans, used for the seed's summary. */
export function parseMarkdownLinks(text: string): Paragraph {
  const spans: Span[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) spans.push({ text: text.slice(last, m.index) });
    spans.push({ text: m[1], href: m[2], external: isExternal(m[2]) });
    last = m.index! + m[0].length;
  }
  if (last < text.length) spans.push({ text: text.slice(last) });
  return spans;
}

type PTSpan = { _type: 'span'; text: string; marks?: string[] };
type PTBlock = { _type: 'block'; children?: PTSpan[]; markDefs?: { _key: string; _type: string; href?: string }[] };

/** Portable Text paragraphs (with link annotations) → spans. */
export function portableTextToParagraphs(blocks: PTBlock[] | null | undefined): Paragraph[] {
  if (!blocks) return [];
  return blocks
    .filter((b) => b._type === 'block')
    .map((b) =>
      (b.children || []).map((c) => {
        const link = (c.marks || []).map((k) => b.markDefs?.find((d) => d._key === k && d._type === 'link')).find(Boolean);
        return link?.href ? { text: c.text, href: link.href, external: isExternal(link.href) } : { text: c.text };
      }),
    )
    .filter((p) => p.some((s) => s.text.trim()));
}

/** Split the headline around the words that should be set in italic. */
export function splitHeadline(headline: string, emphasis?: string | null) {
  const i = emphasis ? headline.lastIndexOf(emphasis) : -1;
  if (!emphasis || i < 0) return { before: headline, emphasis: '', after: '' };
  return { before: headline.slice(0, i), emphasis, after: headline.slice(i + emphasis.length) };
}

export const tzLabel = (timezone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value || '';

export const formatUpdated = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const hostOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
