'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { defineLocations, presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { apiVersion, dataset, projectId, studioUrl } from './src/sanity/env';
import { schemaTypes, SINGLETONS } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';

const HOME = [{ title: 'Homepage', href: '/' }];

export default defineConfig({
  name: 'default',
  title: 'Adeleke — Portfolio',
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the “new document” menu.
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    // …nor duplicated, deleted or unpublished.
    actions: (actions, { schemaType }) =>
      SINGLETONS.includes(schemaType) ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action)) : actions,
  },
  plugins: [
    // Live preview of the site next to the editor; click anything on the page to edit it.
    presentationTool({
      title: 'Preview',
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
      resolve: {
        locations: {
          settings: defineLocations({ locations: HOME, message: 'Intro, contact and look & feel on the homepage' }),
          home: defineLocations({ locations: HOME }),
          company: defineLocations({
            select: { title: 'name', slug: 'slug.current' },
            resolve: (doc) => ({ locations: [{ title: doc?.title || 'Company', href: `/#${doc?.slug || ''}` }] }),
          }),
        },
      },
    }),
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
