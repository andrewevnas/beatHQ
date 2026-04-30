// lib/getSignedUrls.ts
// Server-only. Generates 24-hour presigned R2 URLs for purchased beat files.
// Called from /success page after verifying Stripe payment.

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, BUCKET } from '@/lib/r2';
import { isValidSlug } from '@/lib/slug';

const EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours

export async function getSignedUrls(slug: string): Promise<{ mp3Url: string; wavUrl: string }> {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug format: ${slug}`);
  }

  const [mp3Url, wavUrl] = await Promise.all([
    getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: `beats/mp3/${slug}.mp3`,
        ResponseContentDisposition: `attachment; filename="${slug}.mp3"`,
      }),
      { expiresIn: EXPIRY_SECONDS }
    ),
    getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: `beats/wav/${slug}.wav`,
        ResponseContentDisposition: `attachment; filename="${slug}.wav"`,
      }),
      { expiresIn: EXPIRY_SECONDS }
    ),
  ]);
  return { mp3Url, wavUrl };
}
