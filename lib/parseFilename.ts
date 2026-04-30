// lib/parseFilename.ts
// Parses a beat filename into structured metadata.
// Returns null (never throws) for any filename that doesn't match the convention.
// Convention: BeatName_BPMbpm_Key.ext  e.g. DragonFire_140bpm_Am.mp3

import type { ParsedFilename } from '@/lib/types';
import { isValidSlug } from '@/lib/slug';

export function parseFilename(filename: string): ParsedFilename | null {
  if (!filename) return null;

  // Strip file extension (everything after the last dot)
  const withoutExt = filename.replace(/\.[^.]+$/, '');

  // Split on underscore — expect exactly 3 segments: name, bpm, key
  const parts = withoutExt.split('_');
  if (parts.length !== 3) return null;

  const [rawName, rawBpm, rawKey] = parts;

  // Validate name segment
  if (!rawName) return null;

  // Parse BPM — strip case-insensitive "bpm" suffix, parse as integer
  const bpmStr = (rawBpm ?? '').toLowerCase().replace('bpm', '').trim();
  const bpm = parseInt(bpmStr, 10);
  if (isNaN(bpm) || bpm <= 0) return null;

  // Validate key segment
  if (!rawKey || rawKey.trim() === '') return null;

  // Reject slugs that would fail checkout validation
  if (!isValidSlug(withoutExt)) return null;

  // Display name: replace hyphens with spaces
  const name = rawName.replace(/-/g, ' ');

  return {
    slug: withoutExt,
    name,
    bpm,
    key: rawKey,
  };
}
