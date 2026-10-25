import { Aurora, CompanyTabs } from '@/components/client';
import { Header, Hero, Sections } from '@/components/sections';
import { WorkEngine } from '@/components/work-engine';
import { getPortfolio } from '@/lib/content';
import { present } from '@/lib/work/build';
import { isUnlocked } from '@/lib/work/lock';

// Reads the case-study cookie, so the page renders per request: protected screens are only
// included for visitors who have entered the password.
export default async function Home() {
  const portfolio = present(await getPortfolio(), { unlocked: await isUnlocked() });
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
      <WorkEngine shots={portfolio.shots} />
    </>
  );
}
