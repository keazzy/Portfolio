import { defineArrayMember, defineField, defineType } from 'sanity';

const STATUSES = ['Shipped', 'Live', 'Internal', 'Handed off', 'Concept', 'Beta'];
const TAGS = ['Fintech', 'AI', 'Mobile', 'Web', 'Motion', 'B2B', 'B2C'];

/** One piece of UI you want to show: a screen, a flow, or a clip. Lives inside a company. */
export const shot = defineType({
  name: 'shot',
  title: 'Shot',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Link name',
      type: 'slug',
      description: 'Used in the shareable link, e.g. /#/work/halvest/onboarding.',
      options: { source: (_doc, ctx) => (ctx.parent as { title?: string })?.title || '', maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({
      name: 'media',
      title: 'Images & videos',
      type: 'array',
      description: 'Drag to reorder. The first one is the cover; more than one becomes a step-through in the viewer.',
      of: [defineArrayMember({ type: 'imageFrame' }), defineArrayMember({ type: 'videoFrame' })],
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'platform', title: 'Platform', type: 'string', description: 'e.g. iOS · Android, Web' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: STATUSES } }),
    defineField({ name: 'year', title: 'Year', type: 'string' }),
    defineField({ name: 'contributions', title: 'Contribution', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: `Suggested: ${TAGS.join(', ')}.`,
    }),
  ],
  preview: {
    select: { title: 'title', status: 'status', year: 'year', image: 'media.0.image' },
    prepare: ({ title, status, year, image }) => ({ title, subtitle: [status, year].filter(Boolean).join(' · '), media: image }),
  },
});

export const company = defineType({
  name: 'company',
  title: 'Company',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Link name',
      type: 'slug',
      options: { source: 'name', maxLength: 40 },
      description: 'Used for the section link, e.g. /#halvest.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'product', title: 'Product name', type: 'string', description: 'Optional, e.g. Cuuro.' }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'role', title: 'Your role', type: 'string' }),
    defineField({ name: 'years', title: 'Years', type: 'string', description: 'e.g. 2024—now' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'url', title: 'Website', type: 'url' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3 }),
    defineField({
      name: 'impact',
      title: 'Impact numbers',
      type: 'array',
      description: 'Up to three.',
      validation: (r) => r.max(3),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'string', description: 'e.g. $2.06M' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({
      name: 'shots',
      title: 'Shots',
      type: 'array',
      description: 'Drag to reorder.',
      of: [defineArrayMember({ type: 'shot' })],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'logo' },
  },
});
