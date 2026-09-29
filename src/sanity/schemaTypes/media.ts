import { defineField, defineType } from 'sanity';

export const imageFrame = defineType({
  name: 'imageFrame',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({ name: 'alt', title: 'Description', type: 'string', description: 'What the image shows, for screen readers.' }),
  ],
  preview: { select: { media: 'image', title: 'alt' }, prepare: ({ media, title }) => ({ media, title: title || 'Image' }) },
});

export const videoFrame = defineType({
  name: 'videoFrame',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      title: 'Video file',
      type: 'file',
      options: { accept: 'video/mp4,video/webm,video/quicktime' },
      description: 'Short, muted loops work best (MP4 or WebM). Keep it under ~10 MB.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'width', title: 'Width (px)', type: 'number', description: 'Used to reserve space before the video loads.' }),
    defineField({ name: 'height', title: 'Height (px)', type: 'number' }),
    defineField({ name: 'alt', title: 'Description', type: 'string' }),
  ],
  preview: { select: { title: 'alt', file: 'file.asset.originalFilename' }, prepare: ({ title, file }) => ({ title: title || file || 'Video', subtitle: 'Video' }) },
});
