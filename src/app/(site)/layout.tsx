import type { Metadata } from 'next';
import { VisualEditing } from 'next-sanity/visual-editing';
import { Geist_Mono, Inter, Newsreader } from 'next/font/google';
import { draftMode } from 'next/headers';
import { DraftModeBadge } from '@/components/client';
import { getPortfolio } from '@/lib/content';
import { isSanityConfigured } from '@/sanity/env';
import { SanityLive } from '@/sanity/live';
import './globals.css';
import './viewer.css';
import './work.css';

const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], variable: '--font-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

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
    <html lang="en" data-accent={settings.accent} data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
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
