/*
  A company's work as two columns of covers (ported from concepts/work-cards.html).
  Covers are built on the server (src/lib/work/build.ts); <WorkEngine> brings them to life.
  Cards carry `data-shot={index}` so the engine can find them without React state.
  A shot with a case study is a link to it; the rest open the viewer.
*/
import Link from 'next/link';
import { ViewTransition } from 'react';
import type { Shot } from '@/lib/types';

/** Pairs a card's cover with its case study's cover, so one morphs into the other on navigation. */
export const coverTransitionName = (key: string) => `cover-${key.replace(/[^a-z0-9-]/gi, '-')}`;

const Lock = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="7" width="10" height="7" rx="2" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
);

function WorkCard({ shot, index, order }: { shot: Shot; index: number; order: number }) {
  const cover = shot.cover!;
  const meta = [shot.status, shot.year].filter(Boolean).join(' ');
  const cue = shot.caseStudy ? 'Read case study' : shot.locked ? 'Enter password' : 'View details';
  const props = {
    className: `wcard${shot.locked ? ' locked' : ''}`,
    'data-shot': index,
    'data-reel': !shot.locked ? cover.reel : undefined,
    style: { ['--o' as string]: order },
    'aria-label': `${shot.title}. ${cue}`,
  };
  const inner = (
    <>
      <div className="wcover">
        <MaybeMorph name={shot.caseStudy ? coverTransitionName(shot.key) : undefined}>
          <div className="cover" style={{ aspectRatio: cover.ratio ?? (cover.tall ? '5/4' : '16/9'), background: cover.background }} dangerouslySetInnerHTML={{ __html: cover.html }} />
        </MaybeMorph>
        <span className="wshade" aria-hidden="true" />
        <span className="wcue" aria-hidden="true">{shot.locked && <Lock />}{cue}{shot.caseStudy && <i>→</i>}</span>
      </div>
      <div className="wcap">
        <b>{shot.title}</b>
        <span>/ {meta}{shot.caseStudy ? ' · Case study' : ''}</span>
      </div>
    </>
  );
  return shot.caseStudy ? <Link href={shot.caseStudy} {...props}>{inner}</Link> : <button {...props}>{inner}</button>;
}

// `default="none"` keeps the cover still during unrelated transitions; `share="morph"` styles the card → case study move.
const MaybeMorph = ({ name, children }: { name?: string; children: React.ReactNode }) =>
  name ? <ViewTransition name={name} share="morph" default="none">{children}</ViewTransition> : <>{children}</>;

// Cards are a short 16:9; a `tall` one (5:4) per company sits at the top of the right column so the columns fall out of step.
export function WorkGrid({ shots, indexOf }: { shots: Shot[]; indexOf: (key: string) => number }) {
  const cards = shots.filter((s) => s.cover).map((s, i) => <WorkCard key={s.key} shot={s} index={indexOf(s.key)} order={i} />);
  return (
    <div className="wgrid">
      <div className="wcol">{cards.filter((_, i) => i % 2 === 0)}</div>
      <div className="wcol">{cards.filter((_, i) => i % 2 === 1)}</div>
    </div>
  );
}
