// lib/types.ts
// Shared TypeScript interfaces used across API routes and UI components.

/** Raw parsed result from a filename. Slug is the base filename without extension. */
export interface ParsedFilename {
  /** Base filename without extension. e.g. "DragonFire_140bpm_Am" */
  slug: string;
  /** Display name derived from the first segment. e.g. "DragonFire" */
  name: string;
  /** Beats per minute. e.g. 140 */
  bpm: number;
  /** Musical key. e.g. "Am", "F#m", "Cm" */
  key: string;
}

/** A beat as returned by GET /api/beats — includes public URLs for streaming and display. */
export interface Beat extends ParsedFilename {
  /** Public R2 URL for the low-quality preview MP3. Streamed directly in the browser. */
  previewUrl: string;
  /** Public R2 URL for the square cover image. Falls back gracefully if missing. */
  coverUrl: string;
}
