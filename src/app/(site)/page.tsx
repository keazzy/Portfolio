import { Aurora, CompanyTabs } from '@/components/client';
import { Header, Hero, Sections } from '@/components/sections';
import { ShotViewer } from '@/components/shots';
import { getPortfolio } from '@/lib/content';

export default async function Home() {
  const portfolio = await getPortfolio();
  const { settings } = portfolio;
  const companies = portfolio.sections.flatMap((s) => (s.type === 'work' ? s.companies : []));

  return (
    <>
      {settings.aurora && <Aurora accent={settings.accent} />}
      <CompanyTabs label={settings.name.split(' ')[0]} tabs={companies.map((c) => ({ id: c.id, name: c.name, years: c.years }))} />
      <div className="wrap">
        <Header settings={settings} />
        <Hero settings={settings} />
      </div>
      <Sections portfolio={portfolio} />
      <ShotViewer shots={portfolio.shots} />
    </>
  );
}
