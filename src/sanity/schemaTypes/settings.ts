import { defineArrayMember, defineField, defineType } from 'sanity';

export const settings = defineType({
  name: 'settings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'intro', title: 'Intro', default: true },
    { name: 'contact', title: 'Contact & links' },
    { name: 'look', title: 'Look & feel' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', group: 'intro', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', group: 'intro' }),
    defineField({ name: 'location', title: 'Location', type: 'string', group: 'intro', description: 'Shown next to your local time, e.g. “Nigeria”.' }),
    defineField({
      name: 'timezone',
      title: 'Time zone',
      type: 'string',
      group: 'intro',
      initialValue: 'Africa/Lagos',
      description: 'IANA name used for the live clock, e.g. Africa/Lagos.',
    }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', group: 'intro', validation: (r) => r.required() }),
    defineField({
      name: 'emphasis',
      title: 'Italic words in the headline',
      type: 'string',
      group: 'intro',
      description: 'Must appear in the headline exactly as typed. They are set in italic, in your accent colour.',
      validation: (r) =>
        r.custom((value, ctx) => {
          const headline = (ctx.document?.headline as string) || '';
          return !value || headline.includes(value) ? true : 'These words don’t appear in the headline.';
        }),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'array',
      group: 'intro',
      description: 'A few short paragraphs. Select text and use the link button to link it.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    description: 'A web address, mailto: link, or a section on the page like #halvest.',
                    validation: (r) => r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', group: 'intro', description: 'Shown as a tilted polaroid next to your work history (hidden on phones).' }),
    defineField({ name: 'photoAlt', title: 'Photo description', type: 'string', group: 'intro', description: 'For screen readers.' }),
    defineField({ name: 'photoCaption', title: 'Photo caption', type: 'string', group: 'intro' }),
    defineField({
      name: 'historyExtras',
      title: 'Extra rows in “From”',
      type: 'array',
      group: 'intro',
      description: 'Companies are listed automatically from your work. Add rows here for anything else, e.g. side projects.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'years', title: 'Years', type: 'string' }),
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'role', title: 'Subtitle', type: 'string' }),
            defineField({ name: 'href', title: 'Link', type: 'string', description: 'e.g. #side or a URL.' }),
          ],
          preview: { select: { title: 'name', subtitle: 'years' } },
        }),
      ],
    }),

    defineField({ name: 'email', title: 'Email', type: 'string', group: 'contact', validation: (r) => r.email() }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),

    defineField({
      name: 'accent',
      title: 'Accent colour',
      type: 'string',
      group: 'look',
      initialValue: 'ember',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Ember (orange)', value: 'ember' },
          { title: 'Iris (purple)', value: 'iris' },
          { title: 'Claret (wine)', value: 'claret' },
        ],
      },
    }),
    defineField({ name: 'aurora', title: 'Aurora curtain at the top', type: 'boolean', group: 'look', initialValue: true }),

    defineField({ name: 'seoTitle', title: 'Page title', type: 'string', group: 'seo' }),
    defineField({ name: 'seoDescription', title: 'Description', type: 'text', rows: 3, group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
