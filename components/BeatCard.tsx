// components/BeatCard.tsx
// Client component. Renders a single beat card in the grid.
// Hover reveals a dark overlay with play button, BPM, and key.
// Clicking the card calls onClick(beat) to open the modal.

'use client';

import { useState } from 'react';
import type { Beat } from '@/lib/types';

interface BeatCardProps {
  beat: Beat;
  onClick: (beat: Beat) => void;
}

export default function BeatCard({ beat, onClick }: BeatCardProps) {
  const [imgSrc, setImgSrc] = useState(beat.coverUrl);

  function handleImgError() {
    // If .jpg fails, try .png once
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(imgSrc.replace(/\.jpg$/, '.png'));
    }
  }

  return (
    <button
      type="button"
      className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0"
      onClick={() => onClick(beat)}
      aria-label={`Play ${beat.name} — ${beat.bpm} BPM, ${beat.key}`}
    >
      {/* Thumbnail */}
      <div className="relative w-[120px] h-[120px] bg-[#1C1C1E] overflow-hidden group">
        {/* Cover art — dark background shows through on load failure */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={beat.name}
          className="w-full h-full object-cover"
          onError={handleImgError}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms]">
          {/* Play button */}
          <div className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center">
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
              <polygon points="0,0 10,6 0,12" fill="#FAFAFA" />
            </svg>
          </div>
          {/* BPM and key tags */}
          <div className="flex flex-col items-center gap-[3px]">
            <span className="text-[8px] tracking-[1px] uppercase text-white/70">
              {beat.bpm} BPM
            </span>
            <span className="text-[8px] tracking-[1px] uppercase text-white/70">
              {beat.key}
            </span>
          </div>
        </div>
      </div>

      {/* Beat name */}
      <p className="mt-[9px] text-[9px] tracking-[1px] uppercase text-dim text-center w-[120px] truncate font-mono">
        {beat.name}
      </p>
    </button>
  );
}
