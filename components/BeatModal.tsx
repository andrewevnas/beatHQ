// components/BeatModal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Beat } from '@/lib/types';

interface BeatModalProps {
  beat: Beat;
  producerEmail: string;
  onClose: () => void;
}

export default function BeatModal({ beat, producerEmail, onClose }: BeatModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const mailtoUrl = `mailto:${producerEmail}?subject=${encodeURIComponent(`Exclusive License — ${beat.name}`)}`;

  async function handleGeneralLicense() {
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ beatName: beat.slug }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setCheckoutError(data.error ?? 'Failed to start checkout');
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError('Network error. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${beat.name} license options`}
    >
      <div
        className="bg-canvas border-2 border-ink p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-sm font-bold tracking-[2px] uppercase text-ink">
              {beat.name}
            </h2>
            <p className="text-[10px] tracking-[1px] uppercase text-muted mt-1">
              {beat.bpm} BPM · {beat.key}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors duration-150 text-2xl leading-none cursor-pointer ml-4"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <audio
          ref={audioRef}
          src={beat.previewUrl}
          controls
          className="w-full mb-6"
          aria-label={`Preview: ${beat.name}`}
        />

        <div className="flex flex-col gap-3">
          <button
            className="w-full py-3 text-[11px] font-bold tracking-[2px] uppercase bg-ink text-canvas hover:bg-ink/90 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGeneralLicense}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Loading...' : 'General License — £50'}
          </button>

          <a
            href={mailtoUrl}
            className="w-full py-3 text-[11px] font-bold tracking-[2px] uppercase border-2 border-ink text-ink text-center hover:bg-ink hover:text-canvas transition-colors duration-150 block"
          >
            Exclusive License — Enquire
          </a>
        </div>

        {checkoutError !== null && (
          <p className="mt-3 text-[9px] tracking-[1px] uppercase text-red-600 text-center">
            {checkoutError}
          </p>
        )}
      </div>
    </div>
  );
}
