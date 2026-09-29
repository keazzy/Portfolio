import type { Metadata } from 'next';
import { Geist_Mono, Inter, Newsreader } from 'next/font/google';
import { getPortfolio } from '@/lib/content';
import './globals.css';
import './viewer.css';

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
  return (
    <html lang="en" data-accent={settings.accent} className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
