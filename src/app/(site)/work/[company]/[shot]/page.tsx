import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseEngine, CaseGate } from '@/components/case-engine';
import { CASES } from '@/content/cases';
import { caseNav, renderCase } from '@/lib/work/case';
import { isUnlocked } from '@/lib/work/lock';
import '../../case.css';

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(CASES).map((key) => {
  const [company, shot] = key.split('/');
  return { company, shot };
});

export async function generateMetadata({ params }: PageProps<'/work/[company]/[shot]'>): Promise<Metadata> {
  const { company, shot } = await params;
  const c = CASES[`${company}/${shot}`];
  return c ? { title: `${c.title} · Adeleke Abdulazeez`, description: c.lede } : {};
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[company]/[shot]'>) {
  const { company, shot } = await params;
  const c = CASES[`${company}/${shot}`];
  if (!c) notFound();
  const style = Object.fromEntries(Object.entries(c.palette).map(([k, v]) => [`--${k}`, v]));

  // Protected studies are only rendered for visitors who have entered the password.
  if (c.locked && !(await isUnlocked())) {
    return (
      <div className="case" style={style}>
        <div dangerouslySetInnerHTML={{ __html: caseNav(c) }} />
        <main className="gate-page">
          <p className="cs-eyebrow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.logo && <img src={c.logo} alt="" />}
            {c.eyebrow}
          </p>
          <h1 className="develop">{c.title}</h1>
          <p className="cs-lede">This one is behind a password while Halvest’s v2 is unreleased. You’ll find it in my application.</p>
          <CaseGate />
        </main>
      </div>
    );
  }

  return (
    <div className="case" style={style}>
      <div dangerouslySetInnerHTML={{ __html: renderCase(c) }} />
      <CaseEngine />
    </div>
  );
}
