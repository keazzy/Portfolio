import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';
import { isSanityConfigured } from '@/sanity/env';

export const dynamic = 'force-static';
export { metadata, viewport } from 'next-sanity/studio';

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ padding: 40, font: '15px/1.6 system-ui, sans-serif', maxWidth: 560 }}>
        <h1 style={{ fontSize: 22 }}>Studio isn’t connected yet</h1>
        <p>
          Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> to <code>.env.local</code> (see <code>.env.example</code>) and restart the dev
          server. The site keeps rendering the local seed content until then.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
