// app/api/beats/route.ts
// GET /api/beats
// Lists objects in R2 at beats/previews/, parses filenames, returns Beat[].
// Skips any filename that fails parsing (graceful degradation).

import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2, BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { parseFilename } from '@/lib/parseFilename';
import type { Beat } from '@/lib/types';

const PREVIEWS_PREFIX = 'beats/previews/';

export async function GET(): Promise<NextResponse> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREVIEWS_PREFIX,
    });

    const response = await r2.send(command);
    const objects = response.Contents ?? [];

    const beats: Beat[] = objects
      .map((obj): Beat | null => {
        const key = obj.Key ?? '';
        const filename = key.slice(PREVIEWS_PREFIX.length);
        if (!filename) return null;

        const parsed = parseFilename(filename);
        if (!parsed) {
          console.warn(`[api/beats] Skipping unparseable filename: ${filename}`);
          return null;
        }

        return {
          ...parsed,
          previewUrl: `${R2_PUBLIC_URL}/${PREVIEWS_PREFIX}${filename}`,
          coverUrl: `${R2_PUBLIC_URL}/beats/covers/${parsed.slug}.jpg`,
        };
      })
      .filter((beat): beat is Beat => beat !== null);

    return NextResponse.json(beats);
  } catch (error) {
    console.error('[api/beats] Failed to list R2 objects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beats' },
      { status: 500 }
    );
  }
}
