// components/BeatGrid.tsx
// Client component. Owns modal state. Renders the beat grid and modal.
// Receives beats as props from the server component (app/page.tsx).

'use client';

import { useState } from 'react';
import BeatCard from '@/components/BeatCard';
import BeatModal from '@/components/BeatModal';
import type { Beat } from '@/lib/types';

interface BeatGridProps {
  beats: Beat[];
  producerEmail: string;
}

export default function BeatGrid({ beats, producerEmail }: BeatGridProps) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

  return (
    <>
      <main className="flex-1 flex flex-col items-center py-20 px-16 overflow-x-auto">
        {beats.length === 0 ? (
          <p className="text-[10px] tracking-[2px] uppercase text-muted">
            No beats available
          </p>
        ) : (
          <div className="grid [grid-template-columns:repeat(4,120px)] [column-gap:180px] [row-gap:100px]">
            {beats.map((beat) => (
              <BeatCard
                key={beat.slug}
                beat={beat}
                onClick={setSelectedBeat}
              />
            ))}
          </div>
        )}
      </main>

      {selectedBeat !== null && (
        <BeatModal
          beat={selectedBeat}
          producerEmail={producerEmail}
          onClose={() => setSelectedBeat(null)}
        />
      )}
    </>
  );
}
