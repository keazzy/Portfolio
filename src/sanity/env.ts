export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-01';
export const studioUrl = '/studio';

/** Every Sanity fetch carries this cache tag, so the publish webhook (app/api/revalidate) can expire them all at once. */
export const contentTag = 'sanity-content';

/** False until a Sanity project is connected; the site then renders the local seed. */
export const isSanityConfigured = Boolean(projectId);
