import type { Metadata } from 'next';
import { VisualEditing } from 'next-sanity/visual-editing';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { draftMode } from 'next/headers';
import { Cursor, DraftModeBadge } from '@/components/client';
import { Ink } from '@/components/ink';
import { getPortfolio } from '@/lib/content';
import { isSanityConfigured } from '@/sanity/env';
import { SanityLive } from '@/sanity/live';
import './globals.css';
import './viewer.css';
import './work.css';

// The serif is Fraunces (SIL OFL, licence beside the file), subset to Latin with all four axes: the base the ink is drawn on.
// Drawn 5% large so it sets in the space of the face it replaced; lib/ink.ts counts on that.
const serif = localFont({
  src: './fonts/Fraunces.woff2',
  weight: '100 900',
  variable: '--font-serif',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  declarations: [{ prop: 'size-adjust', value: '105%' }],
});
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolio();
  return {
    title: settings.seo.title,
    description: settings.seo.description,
    openGraph: { title: settings.seo.title, description: settings.seo.description, type: 'website' },
  };
}

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const { settings } = await getPortfolio();
  const { isEnabled: isDraftMode } = await draftMode();
  return (
    // data-scroll-behavior: case studies scroll smoothly to their chapters, but page changes still jump straight to the top.
    <html lang="en" data-accent={settings.accent} data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Ink />
        <Cursor />
        {isSanityConfigured && <SanityLive />}
        {isDraftMode && (
          <>
            <VisualEditing />
            <DraftModeBadge />
          </>
        )}
      </body>
    </html>
  );
}
