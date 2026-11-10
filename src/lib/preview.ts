import type { Metadata } from 'next';

/** Where the site is served. Link previews need absolute URLs, and Next only resolves og:image against metadataBase, not og:video. */
export const SITE_URL = 'https://adelekeux.vercel.app';

/*
  The link preview: a hand-drawn loop (og:video) where a platform plays one (iMessage and Discord, and probably Telegram)
  and its still (og:image) everywhere else (WhatsApp, Slack, LinkedIn, X, Facebook). Both are rendered by
  scripts/og/render.mjs into public/og/. Bump VERSION after a re-render: previews are cached by URL, and iMessage and
  WhatsApp have no way to refresh one.
*/
const VERSION = 1;
const still = {
  url: `${SITE_URL}/og/doodle.png?v=${VERSION}`,
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'Adeleke Abdulazeez, product designer, beside one-line doodles of a bank card, an AI chat bubble, a heartbeat, a dashboard, a shopping cart, a shield, a house and a rocket.',
};
const video = { url: `${SITE_URL}/og/doodle.mp4?v=${VERSION}`, type: 'video/mp4', width: 1200, height: 630 };

/** A page's link preview. Each page passes its own path, so a shared case study links to itself and not the home page. */
export function preview({ title, description, path }: { title: string; description?: string; path: string }): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    // video.other is what makes Discord lay the card out as a video; the still is its poster frame.
    openGraph: { type: 'video.other', title, description, url: path, images: [still], videos: [{ ...video, secureUrl: video.url }] },
    twitter: { card: 'summary_large_image', title, description, images: [still] },
  };
}
