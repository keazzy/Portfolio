/*
  One-off import: pushes src/content/seed.ts into Sanity and uploads every
  image/video it references from ./assets.

  Run (after `npx sanity login`):
    npx sanity exec scripts/import-seed.ts --with-user-token

  Safe to re-run: documents are replaced by fixed ids, and Sanity de-duplicates
  identical uploads, so nothing is duplicated.
*/
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { seed, type SeedCompany, type SeedMedia, type SeedProject } from '../src/content/seed';

const client = getCliClient({ apiVersion: '2025-09-01' });
const tmp = mkdtempSync(join(tmpdir(), 'portfolio-import-'));

let keyN = 0;
const key = () => `k${(++keyN).toString(36).padStart(4, '0')}`;
const ref = (id: string) => ({ _type: 'reference' as const, _ref: id });
const isVideo = (p: string) => /\.(mp4|webm|mov)$/i.test(p);

/* ---------- uploads (cached by path) ---------- */
const uploaded = new Map<string, string>();
async function upload(path: string): Promise<string> {
  if (uploaded.has(path)) return uploaded.get(path)!;
  if (!existsSync(path)) throw new Error(`Missing file: ${path}`);
  let file = path;
  // AVIF isn't accepted everywhere; convert to JPEG with macOS `sips` before uploading.
  if (/\.avif$/i.test(path)) {
    file = join(tmp, basename(path).replace(/\.avif$/i, '.jpg'));
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', path, '--out', file], { stdio: 'ignore' });
  }
  const kind = isVideo(file) ? 'file' : 'image';
  const asset = await client.assets.upload(kind, createReadStream(file), { filename: basename(file) });
  console.log(`  ↑ ${kind.padEnd(5)} ${path}`);
  uploaded.set(path, asset._id);
  return asset._id;
}

const image = async (path: string) => ({ _type: 'image' as const, asset: ref(await upload(path)) });

async function frame(m: SeedMedia) {
  if (isVideo(m.path)) {
    return { _key: key(), _type: 'videoFrame', file: { _type: 'file', asset: ref(await upload(m.path)) }, width: m.w, height: m.h, alt: m.alt };
  }
  return { _key: key(), _type: 'imageFrame', image: await image(m.path), alt: m.alt };
}

/* ---------- Markdown links → Portable Text ---------- */
function block(text: string) {
  const markDefs: { _key: string; _type: 'link'; href: string }[] = [];
  const children: { _key: string; _type: 'span'; text: string; marks: string[] }[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) children.push({ _key: key(), _type: 'span', text: text.slice(last, m.index), marks: [] });
    const k = key();
    markDefs.push({ _key: k, _type: 'link', href: m[2] });
    children.push({ _key: key(), _type: 'span', text: m[1], marks: [k] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) children.push({ _key: key(), _type: 'span', text: text.slice(last), marks: [] });
  return { _key: key(), _type: 'block', style: 'normal', markDefs, children };
}

/* ---------- documents ---------- */
async function companyDoc(c: SeedCompany) {
  const shots = [];
  for (const s of c.shots) {
    const media = [];
    for (const m of s.media) media.push(await frame(m));
    shots.push({
      _key: key(),
      _type: 'shot',
      title: s.title,
      slug: { _type: 'slug', current: s.id },
      description: s.description,
      media,
      platform: s.platform,
      status: s.status,
      year: s.year,
      contributions: s.contributions,
      tags: s.tags,
    });
  }
  return {
    _id: `company-${c.id}`,
    _type: 'company',
    name: c.name,
    slug: { _type: 'slug', current: c.id },
    product: c.product,
    logo: await image(c.logo),
    role: c.role,
    years: c.years,
    tags: c.tags,
    url: c.url,
    summary: c.summary,
    impact: c.impact.map((i) => ({ _key: key(), ...i })),
    shots,
  };
}

async function projectItem(p: SeedProject) {
  return { _key: key(), _type: 'projectLink', name: p.name, note: p.note, logo: await image(p.logo), tags: p.tags, url: p.url, status: p.status };
}

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Importing into ${projectId}/${dataset}\n`);

  const companies = [];
  for (const c of seed.companies) {
    console.log(`• ${c.name}`);
    companies.push(await companyDoc(c));
  }

  console.log('• Site settings');
  const s = seed.settings;
  const settings = {
    _id: 'settings',
    _type: 'settings',
    name: s.name,
    role: s.role,
    location: s.location,
    timezone: s.timezone,
    headline: s.headline,
    emphasis: s.emphasis,
    intro: s.intro.map(block),
    currently: s.currently.map(block),
    previously: s.previously.map(block),
    summary: s.summary.map(block),
    photo: await image(s.photo.path),
    photoAlt: s.photo.alt,
    photoCaption: s.photo.caption,
    historyExtras: s.historyExtras.map((h) => ({ _key: key(), ...h })),
    email: s.email,
    links: s.links.map((l) => ({ _key: key(), ...l })),
    accent: s.accent,
    aurora: s.aurora,
    seoTitle: s.seo.title,
    seoDescription: s.seo.description,
  };

  console.log('• Homepage');
  const sideItems = [];
  for (const p of seed.sideProjects) sideItems.push(await projectItem(p));
  const webflowItems = [];
  for (const p of seed.webflow) webflowItems.push(await projectItem(p));
  const home = {
    _id: 'home',
    _type: 'home',
    sections: [
      { _key: key(), _type: 'workSection', layout: 'rows', companies: companies.map((c) => ({ _key: key(), ...ref(c._id) })) },
      {
        _key: key(),
        _type: 'projectsSection',
        anchor: 'side',
        layout: 'list',
        groups: [
          { _key: key(), title: 'Side projects', items: sideItems },
          { _key: key(), title: 'Webflow sites', items: webflowItems },
        ],
      },
      { _key: key(), _type: 'sayHelloSection', label: 'Say hello' },
    ],
  };

  const tx = client.transaction();
  const docs: { _id: string; _type: string }[] = [...companies, settings, home];
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log(`\nDone: ${companies.length} companies, ${uploaded.size} files, settings and homepage published.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
