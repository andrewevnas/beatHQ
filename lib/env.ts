// lib/env.ts
// Validates all required server-side env vars at module load time.
// Import this module from server-only code (API routes, lib files).
// If any var is missing, the app crashes loudly rather than failing silently at runtime.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Add it to .env.local for development or to Vercel dashboard for production.`
    );
  }
  return value;
}

function requireIntEnv(name: string): number {
  const raw = requireEnv(name);
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got: "${raw}"`);
  }
  return parsed;
}

export const env = {
  R2_ACCOUNT_ID:         requireEnv('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID:      requireEnv('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY:  requireEnv('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET_NAME:        requireEnv('R2_BUCKET_NAME'),
  R2_PUBLIC_URL:         requireEnv('R2_PUBLIC_URL'),
  STRIPE_SECRET_KEY:     requireEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
  PRODUCER_EMAIL:        requireEnv('PRODUCER_EMAIL'),
  GENERAL_PRICE_PENCE:   requireIntEnv('GENERAL_PRICE_PENCE'),
} as const;
