import { defineArrayMember, defineField, defineType } from 'sanity';

/* Homepage = the intro (from Site settings) followed by these sections, in order. */

export const workSection = defineType({
  name: 'workSection',
  title: 'Work',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'rows',
      options: {
        layout: 'radio',
        direction: 'horizontal',
        list: [
          { title: 'Scrolling rows', value: 'rows' },
          { title: 'Grid', value: 'grid' },
        ],
      },
    }),
    defineField({
      name: 'companies',
      title: 'Companies',
      type: 'array',
      description: 'Drag to reorder. This order is also used for the “From” list and the sticky tabs.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'company' }] })],
    }),
  ],
  preview: { select: { layout: 'layout', c0: 'companies.0.name', c1: 'companies.1.name', c2: 'companies.2.name' }, prepare: ({ layout, c0, c1, c2 }) => ({ title: 'Work', subtitle: `${[c0, c1, c2].filter(Boolean).join(', ')} · ${layout === 'grid' ? 'Grid' : 'Rows'}` }) },
});

const projectLink = defineArrayMember({
  type: 'object',
  name: 'projectLink',
  title: 'Project',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'note', title: 'Note', type: 'string', description: 'Optional, shown in brackets after the name.' }),
    defineField({ name: 'logo', title: 'Icon', type: 'image' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'url', title: 'Link', type: 'url', validation: (r) => r.required() }),
    defineField({ name: 'status', title: 'Status', type: 'string', description: 'e.g. TestFlight, Live' }),
  ],
  preview: { select: { title: 'name', subtitle: 'status', media: 'logo' } },
});

export const projectsSection = defineType({
  name: 'projectsSection',
  title: 'Projects list',
  type: 'object',
  fields: [
    defineField({ name: 'anchor', title: 'Section link name', type: 'string', initialValue: 'side', description: 'For links like #side.' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'list',
      options: { layout: 'radio', direction: 'horizontal', list: [{ title: 'List', value: 'list' }, { title: 'Cards', value: 'cards' }] },
    }),
    defineField({
      name: 'groups',
      title: 'Columns',
      type: 'array',
      description: 'Each column has a title and its projects. Two columns sit side by side.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'items', title: 'Projects', type: 'array', of: [projectLink] }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
  ],
  preview: { select: { g0: 'groups.0.title', g1: 'groups.1.title' }, prepare: ({ g0, g1 }) => ({ title: 'Projects', subtitle: [g0, g1].filter(Boolean).join(' · ') }) },
});

export const sayHelloSection = defineType({
  name: 'sayHelloSection',
  title: 'Say hello',
  type: 'object',
  fields: [defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Say hello' })],
  preview: { select: { title: 'label' }, prepare: ({ title }) => ({ title: title || 'Say hello', subtitle: 'Big email + footer' }) },
});

export const home = defineType({
  name: 'home',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      description: 'Drag to reorder, or remove a section to hide it. The intro always comes first.',
      of: [
        defineArrayMember({ type: 'workSection' }),
        defineArrayMember({ type: 'projectsSection' }),
        defineArrayMember({ type: 'sayHelloSection' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
});
