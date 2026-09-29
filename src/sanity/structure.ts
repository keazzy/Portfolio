import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Portfolio')
    .items([
      S.listItem().title('Site settings').id('settings').child(S.document().schemaType('settings').documentId('settings').title('Site settings')),
      S.listItem().title('Homepage').id('home').child(S.document().schemaType('home').documentId('home').title('Homepage')),
      S.divider(),
      S.documentTypeListItem('company').title('Companies'),
    ]);
