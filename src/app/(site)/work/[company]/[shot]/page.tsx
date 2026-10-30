import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { CaseEngine, CaseGate } from '@/components/case-engine';
import { coverTransitionName } from '@/components/work';
import { CASES } from '@/content/cases';
import { getPortfolio } from '@/lib/content';
import { present } from '@/lib/work/build';
import { renderCase, type CaseStudy } from '@/lib/work/case';
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
  return c ? { title: `${c.title} · Adeleke Abdulazeez`, description: c.description } : {};
}

function CaseNav({ c }: { c: CaseStudy }) {
  return (
    <nav className="cs-nav">
      <Link href={c.back.href}>← Work</Link>
      {c.crumbs.map((crumb) => <span key={crumb}><span className="sep">/</span> {crumb}</span>)}
    </nav>
  );
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[company]/[shot]'>) {
  const { company, shot: shotId } = await params;
  const key = `${company}/${shotId}`;
  const c = CASES[key];
  if (!c) notFound();
  // Only protected studies read the password cookie, so the others can stay static.
  const unlocked = c.locked ? await isUnlocked() : false;
  const style = Object.fromEntries(Object.entries(c.palette).map(([k, v]) => [`--${k}`, v]));

  // The page opens with the project's card cover (whatever the Studio has, locked or not), and the card morphs into it.
  const shot = present(await getPortfolio(), { unlocked }).shots.find((s) => s.key === key);
  const cover = shot?.cover && (
    <ViewTransition name={coverTransitionName(key)} share="morph" default="none">
      <div className="cover cs-cover" style={{ background: shot.cover.background }} dangerouslySetInnerHTML={{ __html: shot.cover.html }} />
    </ViewTransition>
  );

  // Protected studies are only rendered for visitors who have entered the password.
  if (c.locked && !unlocked) {
    return (
      <div className="case" style={style}>
        <CaseNav c={c} />
        {cover}
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
      <CaseNav c={c} />
      {cover}
      <div dangerouslySetInnerHTML={{ __html: renderCase(c) }} />
      <CaseEngine />
    </div>
  );
}
