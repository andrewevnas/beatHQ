// lib/r2.ts
// Cloudflare R2 client using the S3-compatible API.
// R2 endpoint format: https://{accountId}.r2.cloudflarestorage.com
// Region must be 'auto' for R2.

import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/lib/env';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/** The R2 bucket name, sourced from env vars. */
export const BUCKET = env.R2_BUCKET_NAME;

/** Base public URL for publicly-readable R2 objects (previews/, covers/). */
export const R2_PUBLIC_URL = env.R2_PUBLIC_URL;
