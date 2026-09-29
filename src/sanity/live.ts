import { defineLive } from 'next-sanity/live';
import { client } from './client';

/*
  Live content: published changes reach open pages within seconds, and in
  draft mode (the Studio's Presentation tool) pages show drafts as you type,
  with click-to-edit overlays.

  SANITY_API_READ_TOKEN is a read-only (viewer) token. It's only sent to the
  browser when draft mode is on, which requires signing in to the Studio.
*/
const token = process.env.SANITY_API_READ_TOKEN || false;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
