import { revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { contentTag } from '@/sanity/env';

/*
  Sanity calls this on every publish, unpublish and delete: a webhook signed with SANITY_REVALIDATE_SECRET.
  It expires the cached content, so the next visitor gets the new version even if nobody had the site open
  when the change went out (SanityLive only revalidates through a page that's open at the time).
*/
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return new Response('Webhook secret not configured', { status: 500 });

  // The third argument waits a moment for the change to reach Sanity's CDN, so the refetch isn't stale.
  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
  if (!isValidSignature) return new Response('Invalid signature', { status: 401 });

  // A webhook can't use updateTag, so expire the data outright: the next request refetches it.
  revalidateTag(contentTag, { expire: 0 });
  return Response.json({ revalidated: true, type: body?._type ?? null });
}
