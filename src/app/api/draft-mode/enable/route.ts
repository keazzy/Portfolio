import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/sanity/client';

// Called by the Studio's Presentation tool; it verifies a one-time secret before turning on draft mode.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
