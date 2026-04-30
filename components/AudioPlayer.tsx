// components/AudioPlayer.tsx
// Client component. Custom audio player with play/pause and seekable scrubber.
// Used in BeatModal. Pauses and cleans up on unmount.

'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  label: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('durationchange', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('durationchange', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Pause on unmount (modal close)
  useEffect(() => {
    const audio = audioRef.current;
    return () => { audio?.pause(); };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }

  function seek(clientX: number) {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    seek(e.clientX);
    const onMove = (ev: PointerEvent) => seek(ev.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full mb-6" aria-label={label}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center flex-shrink-0 text-ink hover:bg-ink hover:text-canvas transition-colors duration-150 cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true" fill="currentColor">
              <rect x="0" y="0" width="3" height="11" />
              <rect x="6" y="0" width="3" height="11" />
            </svg>
          ) : (
            <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden="true" fill="currentColor">
              <polygon points="1,0 9,5.5 1,11" />
            </svg>
          )}
        </button>

        {/* Scrubber */}
        <div className="flex-1 flex flex-col gap-[6px]">
          <div
            ref={barRef}
            className="w-full h-[3px] bg-ink/20 relative cursor-pointer"
            onPointerDown={handlePointerDown}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Seek"
          >
            <div
              className="absolute left-0 top-0 h-full bg-ink"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-ink"
              style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
            />
          </div>

          {/* Times */}
          <div className="flex justify-between text-[8px] tracking-[1px] uppercase font-mono text-muted select-none">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
