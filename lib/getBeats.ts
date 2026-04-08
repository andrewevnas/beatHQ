// lib/getBeats.ts
// Server-only utility. Lists R2 beats/previews/, parses filenames, returns Beat[].
// Called directly by app/page.tsx (server component) and app/api/beats/route.ts.
// Never throws — callers should catch errors and handle gracefully.

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2, BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { parseFilename } from '@/lib/parseFilename';
import type { Beat } from '@/lib/types';

const PREVIEWS_PREFIX = 'beats/previews/';

export async function getBeats(): Promise<Beat[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: PREVIEWS_PREFIX,
  });

  const response = await r2.send(command);
  const objects = response.Contents ?? [];

  return objects
    .map((obj): Beat | null => {
      const key = obj.Key ?? '';
      const filename = key.slice(PREVIEWS_PREFIX.length);
      if (!filename) return null;

      const parsed = parseFilename(filename);
      if (!parsed) {
        console.warn(`[getBeats] Skipping unparseable filename: ${filename}`);
        return null;
      }

      return {
        ...parsed,
        previewUrl: `${R2_PUBLIC_URL}/${PREVIEWS_PREFIX}${filename}`,
        coverUrl: `${R2_PUBLIC_URL}/beats/covers/${parsed.slug}.jpg`,
      };
    })
    .filter((beat): beat is Beat => beat !== null);
}
