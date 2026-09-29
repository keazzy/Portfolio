import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import { apiVersion, dataset, projectId, studioUrl } from './env';

export const client = createClient({
  projectId: projectId || 'unconfigured',
  dataset,
  apiVersion,
  useCdn: true,
  stega: { studioUrl },
});

const builder = createImageUrlBuilder({ projectId: projectId || 'unconfigured', dataset });

/** Sanity CDN URL for an image asset id, resized and served as WebP/AVIF where supported. */
export function imageUrl(assetId: string, width: number) {
  return builder.image(assetId).width(width).fit('max').auto('format').quality(82).url();
}
