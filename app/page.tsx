// app/page.tsx
// Server component. Fetches beats from R2 and renders the homepage.
// Errors from getBeats() (e.g. stub credentials in dev) result in an empty grid.

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BeatGrid from '@/components/BeatGrid';
import { getBeats } from '@/lib/getBeats';
import { env } from '@/lib/env';
import type { Beat } from '@/lib/types';

// Force dynamic rendering — beats must always be fresh, never statically cached.
export const dynamic = 'force-dynamic';

export default async function Home() {
  let beats: Beat[] = [];
  try {
    beats = await getBeats();
  } catch (error) {
    // R2 unavailable (stub credentials in dev, or transient error).
    // Show empty grid rather than crashing.
    console.error('[page] Failed to load beats:', error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <BeatGrid
        beats={beats}
        producerEmail={env.PRODUCER_EMAIL}
      />
      <Footer />
    </div>
  );
}
