/* Server-rendered page sections for the portfolio (concept A layout). */
/* eslint-disable @next/next/no-img-element -- images come pre-sized from Sanity's CDN */
import { Fragment } from 'react';
import { formatUpdated, hostOf } from '@/lib/text';
import type { Company, Paragraph, Portfolio, ProjectsSection, SayHelloSection, Settings } from '@/lib/types';
import { LocalTime } from './client';
import { WorkGrid } from './work';

const ext = (external?: boolean) => (external ? { target: '_blank', rel: 'noopener' } : {});

function Rich({ paragraph }: { paragraph: Paragraph }) {
  return (
    <p>
      {paragraph.map((s, i) =>
        s.href ? (
          <a key={i} className="link" href={s.href} {...ext(s.external)}>{s.text}</a>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )}
    </p>
  );
}

export function Header({ settings }: { settings: Settings }) {
  const cv = settings.links[0];
  return (
    <header className="top">
      <a className="top__name" href="#">{settings.name}</a>
      <nav>
        <a href="#work">Work</a>
        {cv && <a className="keep" href={cv.url} target="_blank" rel="noopener">{cv.label} ↗</a>}
        {settings.email && <a className="keep" href={`mailto:${settings.email}`}>Email</a>}
      </nav>
    </header>
  );
}

export function Hero({ settings }: { settings: Settings }) {
  const h = settings.headline;
  return (
    <section className="hero">
      <h1>
        {h.before}
        {h.emphasis && <em>{h.emphasis}</em>}
        {h.after}
      </h1>
      <div className="hero__summary">
        <div className="summary">
          {settings.summary.map((p, i) => <Rich key={i} paragraph={p} />)}
        </div>
        <div className="stamp mono">
          <span>Updated {formatUpdated(settings.updatedAt)}</span>
          <LocalTime timezone={settings.timezone} suffix={settings.location ? ` in ${settings.location}` : ''} />
        </div>
      </div>
      {settings.history.length > 0 && (
        <nav className="from" aria-label="Work history">
          <div className="eyebrow">From</div>
          <ol>
            {settings.history.map((row, i) => (
              <li key={i}>
                <a href={row.href} {...ext(/^https?:/.test(row.href))}>
                  <span className="y">{row.years}</span>
                  <span><b>{row.name}</b><em>{row.role}</em></span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {settings.photo && (
        <figure className="polaroid">
          <img src={settings.photo.src} alt={settings.photo.alt} />
          {settings.photo.caption && <figcaption>{settings.photo.caption}</figcaption>}
        </figure>
      )}
    </section>
  );
}

export function CompanySection({ company, indexOf }: { company: Company; indexOf: (key: string) => number }) {
  return (
    <section className="co" id={company.id} aria-labelledby={`h-${company.id}`}>
      <div className="wrap">
        <div className="co__head">
          <div>
            {company.logo && <img className="co__logo" src={company.logo} alt="" />}
            <h2 className="co__name" id={`h-${company.id}`}>
              {company.name}
              {company.product && <> <em>· {company.product}</em></>}
            </h2>
            <div className="co__role">{company.role}</div>
            <div className="co__meta mono">
              {company.tags.length > 0 && <span>{company.tags.join(' · ')}</span>}
              <span>{company.years}</span>
            </div>
          </div>
          <div>
            {company.summary && <p className="co__summary">{company.summary}</p>}
            {company.impact.length > 0 && (
              <div className="impact">
                {company.impact.map((i, k) => (
                  <div key={k}><b>{i.value}</b><span>{i.label}</span></div>
                ))}
              </div>
            )}
            {company.url && (
              <div className="co__links">
                <a className="link" href={company.url} target="_blank" rel="noopener">Visit {hostOf(company.url)} ↗</a>
              </div>
            )}
          </div>
        </div>
        {company.shots.length > 0 && <WorkGrid shots={company.shots} indexOf={indexOf} />}
      </div>
    </section>
  );
}

export function Projects({ section }: { section: ProjectsSection }) {
  return (
    <div className="wrap">
      <section className={`section projects projects--${section.layout}`} id={section.anchor}>
        <div className="cols">
          {section.groups.map((g, i) => (
            <div key={i}>
              {g.title && <h2>{g.title}</h2>}
              <ul className="list">
                {g.items.map((x) => (
                  <li key={x.id}>
                    <a href={x.url} target="_blank" rel="noopener">
                      {x.logo ? <img src={x.logo} alt="" /> : <span className="list__blank" />}
                      <span>
                        <b>{x.name}</b>
                        {x.note && <> <small style={{ display: 'inline' }}>({x.note})</small></>}
                        {x.tags.length > 0 && <small>{x.tags.join(' · ')}</small>}
                      </span>
                      <em>{x.status ? `${x.status} ↗` : '↗'}</em>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SayHello({ section, settings }: { section: SayHelloSection; settings: Settings }) {
  const [user, domain] = settings.email.split('@');
  return (
    <div className="wrap">
      <section className="hello" id="contact">
        <p className="eyebrow">{section.label}</p>
        {settings.email && (
          <a className="hello__mail" href={`mailto:${settings.email}`}>
            <span>{user}{domain && <><em>@</em>{domain}</>}</span>
          </a>
        )}
        <div className="hello__foot">
          <span>Updated {formatUpdated(settings.updatedAt)}</span>
          <nav aria-label="Elsewhere">
            {settings.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener">{l.label} ↗</a>)}
          </nav>
          <span>© {new Date(settings.updatedAt).getUTCFullYear()} {settings.name}</span>
        </div>
      </section>
    </div>
  );
}

export function Sections({ portfolio }: { portfolio: Portfolio }) {
  const keys = portfolio.shots.map((s) => s.key);
  const indexOf = (key: string) => keys.indexOf(key);
  const firstWork = portfolio.sections.find((s) => s.type === 'work')?.key;
  return (
    <>
      {portfolio.sections.map((sec) => {
        if (sec.type === 'work') {
          return (
            <main key={sec.key} id={sec.key === firstWork ? 'work' : undefined}>
              {sec.companies.map((c) => <CompanySection key={c.id} company={c} indexOf={indexOf} />)}
            </main>
          );
        }
        if (sec.type === 'projects') return <Projects key={sec.key} section={sec} />;
        return <SayHello key={sec.key} section={sec} settings={portfolio.settings} />;
      })}
    </>
  );
}
