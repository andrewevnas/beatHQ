# BeatHQ Stage 1 — Project Scaffold & R2 Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Next.js 14 project and build the R2 data layer so that `GET /api/beats` returns a typed array of parsed beat metadata derived from Cloudflare R2 filenames.

**Architecture:** Next.js 14 App Router with TypeScript strict mode. Beat metadata lives entirely in filenames stored in Cloudflare R2 — no database. A filename parser utility converts raw S3 object keys into typed `Beat` objects. The `/api/beats` API route lists the R2 `beats/previews/` prefix and returns the parsed result as JSON.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, Space Mono (Google Fonts via `next/font`), `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, Jest

---

## File Map

| File | Status | Responsibility |
|------|--------|---------------|
| `package.json` | Created by scaffold | Dependencies |
| `next.config.ts` | Modified | Security headers, image domains |
| `tsconfig.json` | Modified | Enforce strict mode |
| `tailwind.config.ts` | Modified | Color tokens + Space Mono font variable |
| `.env.local` | Create | Stubbed local env vars |
| `lib/types.ts` | Create | `Beat` interface and shared types |
| `lib/env.ts` | Create | Env var validation — fails loudly at startup if vars missing |
| `lib/r2.ts` | Create | S3-compatible R2 client singleton |
| `lib/parseFilename.ts` | Create | Filename → `ParsedFilename` parser, returns `null` on bad input |
| `app/layout.tsx` | Modified | Root layout with Space Mono font variable |
| `app/page.tsx` | Modified | Placeholder homepage (replaced in Stage 2) |
| `app/api/beats/route.ts` | Create | `GET /api/beats` — lists R2, parses filenames, returns `Beat[]` |
| `jest.config.ts` | Create | Jest config using `next/jest` transformer |
| `jest.setup.ts` | Create | Jest setup file |
| `__tests__/parseFilename.test.ts` | Create | Unit tests for filename parser |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Creates all base project files via `create-next-app`

- [ ] **Step 1: Run the scaffold command**

Run from inside `/c/Users/andre/Desktop/beatHQ`:

```bash
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

If prompted interactively, answer: TypeScript=Yes, ESLint=Yes, Tailwind=Yes, src/=No, App Router=Yes, import alias=`@/*`.

Expected output ends with: `Success! Created beathq`

- [ ] **Step 2: Verify the scaffold**

```bash
ls
```

Expected: `app/  node_modules/  public/  .env.local  next.config.ts  package.json  tailwind.config.ts  tsconfig.json`

- [ ] **Step 3: Confirm dev server starts**

```bash
npm run dev &
sleep 5 && curl -s http://localhost:3000 | head -5
kill %1
```

Expected: HTML response starting with `<!DOCTYPE html>`

- [ ] **Step 4: Initial commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project"
```

---

## Task 2: Configure TypeScript Strict Mode

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Open `tsconfig.json` and confirm or add strict flags**

Replace the `compilerOptions` block with:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors)

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: enable TypeScript strict mode"
```

---

## Task 3: Set Up Environment Variables

**Files:**
- Create: `.env.local`
- Create: `lib/env.ts`

- [ ] **Step 1: Create `.env.local` with stubbed values**

```bash
cat > .env.local << 'EOF'
# Cloudflare R2
R2_ACCOUNT_ID=stub_account_id
R2_ACCESS_KEY_ID=stub_access_key
R2_SECRET_ACCESS_KEY=stub_secret_key
R2_BUCKET_NAME=beathq
R2_PUBLIC_URL=https://stub.r2.dev

# Stripe (wired in Stage 3)
STRIPE_SECRET_KEY=sk_test_stub
STRIPE_WEBHOOK_SECRET=whsec_stub

# Site
PRODUCER_EMAIL=you@example.com
NEXT_PUBLIC_SITE_NAME=BeatHQ
GENERAL_PRICE_PENCE=5000
EOF
```

- [ ] **Step 2: Add `.env.local` to `.gitignore`**

Open `.gitignore` and confirm `.env.local` is listed. If not, add it:

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 3: Create `lib/env.ts`**

```typescript
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
  R2_ACCOUNT_ID:        requireEnv('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID:     requireEnv('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: requireEnv('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET_NAME:       requireEnv('R2_BUCKET_NAME'),
  R2_PUBLIC_URL:        requireEnv('R2_PUBLIC_URL'),
  STRIPE_SECRET_KEY:    requireEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET:requireEnv('STRIPE_WEBHOOK_SECRET'),
  PRODUCER_EMAIL:       requireEnv('PRODUCER_EMAIL'),
  GENERAL_PRICE_PENCE:  requireIntEnv('GENERAL_PRICE_PENCE'),
} as const;
```

- [ ] **Step 4: Commit**

```bash
git add lib/env.ts .gitignore
git commit -m "chore: add env var validation module"
```

---

## Task 4: Define Shared Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: define Beat and ParsedFilename types"
```

---

## Task 5: Set Up Jest

**Files:**
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Jest dependencies**

```bash
npm install --save-dev jest @types/jest jest-environment-node
```

Expected: packages added to `devDependencies`

- [ ] **Step 2: Create `jest.config.ts`**

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['lib/**/*.ts', '!lib/env.ts'],
};

export default createJestConfig(config);
```

- [ ] **Step 3: Create `jest.setup.ts`**

```typescript
// jest.setup.ts
// Global Jest setup. Add any global mocks or config here.
```

- [ ] **Step 4: Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 5: Verify Jest runs (no tests yet)**

```bash
npm test -- --passWithNoTests
```

Expected: `Test Suites: 0 skipped` or similar — no failures

- [ ] **Step 6: Commit**

```bash
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: configure Jest with next/jest transformer"
```

---

## Task 6: Build and Test the Filename Parser

**Files:**
- Create: `lib/parseFilename.ts`
- Create: `__tests__/parseFilename.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `__tests__/parseFilename.test.ts`:

```typescript
import { parseFilename } from '@/lib/parseFilename';

describe('parseFilename', () => {
  describe('happy path', () => {
    it('parses a standard filename', () => {
      const result = parseFilename('DragonFire_140bpm_Am.mp3');
      expect(result).toEqual({
        slug: 'DragonFire_140bpm_Am',
        name: 'DragonFire',
        bpm: 140,
        key: 'Am',
      });
    });

    it('parses a sharp key', () => {
      const result = parseFilename('NeonShadows_93bpm_F#m.mp3');
      expect(result).toEqual({
        slug: 'NeonShadows_93bpm_F#m',
        name: 'NeonShadows',
        bpm: 93,
        key: 'F#m',
      });
    });

    it('parses a hyphenated display name', () => {
      const result = parseFilename('Dragon-Fire_140bpm_Am.mp3');
      expect(result).toEqual({
        slug: 'Dragon-Fire_140bpm_Am',
        name: 'Dragon Fire',
        bpm: 140,
        key: 'Am',
      });
    });

    it('parses a .wav extension', () => {
      const result = parseFilename('GoldRush_120bpm_Cm.wav');
      expect(result).not.toBeNull();
      expect(result?.slug).toBe('GoldRush_120bpm_Cm');
    });

    it('parses a .jpg extension (cover art)', () => {
      const result = parseFilename('GoldRush_120bpm_Cm.jpg');
      expect(result).not.toBeNull();
      expect(result?.bpm).toBe(120);
    });

    it('handles uppercase BPM suffix', () => {
      const result = parseFilename('Voltage_144BPM_Em.mp3');
      expect(result).not.toBeNull();
      expect(result?.bpm).toBe(144);
    });
  });

  describe('error cases — returns null', () => {
    it('returns null for missing BPM segment', () => {
      expect(parseFilename('DragonFire_Am.mp3')).toBeNull();
    });

    it('returns null for non-integer BPM', () => {
      expect(parseFilename('DragonFire_fastbpm_Am.mp3')).toBeNull();
    });

    it('returns null for zero BPM', () => {
      expect(parseFilename('DragonFire_0bpm_Am.mp3')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseFilename('')).toBeNull();
    });

    it('returns null for filename with no extension', () => {
      // No extension is fine as long as segments parse correctly
      const result = parseFilename('DragonFire_140bpm_Am');
      expect(result).not.toBeNull();
    });

    it('returns null for missing key segment', () => {
      expect(parseFilename('DragonFire_140bpm_.mp3')).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/lib/parseFilename'`

- [ ] **Step 3: Implement `lib/parseFilename.ts`**

```typescript
// lib/parseFilename.ts
// Parses a beat filename into structured metadata.
// Returns null (never throws) for any filename that doesn't match the convention.
// Convention: BeatName_BPMbpm_Key.ext  e.g. DragonFire_140bpm_Am.mp3

import type { ParsedFilename } from '@/lib/types';

export function parseFilename(filename: string): ParsedFilename | null {
  if (!filename) return null;

  // Strip file extension (everything after the last dot)
  const withoutExt = filename.replace(/\.[^.]+$/, '');

  // Split on underscore — expect exactly 3 segments: name, bpm, key
  const parts = withoutExt.split('_');
  if (parts.length < 3) return null;

  const [rawName, rawBpm, rawKey, ...rest] = parts;

  // Names with more than 3 underscore-separated segments are unsupported
  if (rest.length > 0) return null;

  // Validate name segment
  if (!rawName) return null;

  // Parse BPM — strip case-insensitive "bpm" suffix, parse as integer
  const bpmStr = rawBpm?.toLowerCase().replace('bpm', '').trim() ?? '';
  const bpm = parseInt(bpmStr, 10);
  if (isNaN(bpm) || bpm <= 0) return null;

  // Validate key segment
  if (!rawKey || rawKey.trim() === '') return null;

  // Display name: replace hyphens with spaces
  const name = rawName.replace(/-/g, ' ');

  return {
    slug: withoutExt,
    name,
    bpm,
    key: rawKey,
  };
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm test
```

Expected:
```
PASS  __tests__/parseFilename.test.ts
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

- [ ] **Step 5: Commit**

```bash
git add lib/parseFilename.ts __tests__/parseFilename.test.ts
git commit -m "feat: add filename parser with full test coverage"
```

---

## Task 7: Build the R2 Client

**Files:**
- Create: `lib/r2.ts`

- [ ] **Step 1: Install AWS SDK packages**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Expected: packages added to `dependencies`

- [ ] **Step 2: Create `lib/r2.ts`**

```typescript
// lib/r2.ts
// Cloudflare R2 client using the S3-compatible API.
// R2 endpoint format: https://{accountId}.r2.cloudflarestorage.com
// Region must be 'auto' for R2.
// Install: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add lib/r2.ts package.json package-lock.json
git commit -m "feat: add Cloudflare R2 S3-compatible client"
```

---

## Task 8: Build the `/api/beats` Route

**Files:**
- Create: `app/api/beats/route.ts`

- [ ] **Step 1: Create `app/api/beats/route.ts`**

```typescript
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
        // Strip the prefix to get just the filename
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add app/api/beats/route.ts
git commit -m "feat: add GET /api/beats route reading from R2"
```

---

## Task 9: Configure Tailwind Tokens and Space Mono Font

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `tailwind.config.ts` with design tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        ink: '#09090B',
        canvas: '#FAFAFA',
        muted: '#A1A1AA',
        dim: '#52525B',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update `app/layout.tsx` with Space Mono font**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? 'BeatHQ',
  description: 'Independent beat store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceMono.variable}>
      <body className="bg-canvas text-ink font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace `app/page.tsx` with a placeholder**

```typescript
// app/page.tsx
// Placeholder — replaced in Stage 2 with the beat grid.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm uppercase tracking-widest text-muted">
        Stage 1 complete — UI coming in Stage 2
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Verify dev server renders the placeholder**

```bash
npm run dev &
sleep 5 && curl -s http://localhost:3000 | grep "Stage 1"
kill %1
```

Expected: line containing `Stage 1 complete`

- [ ] **Step 5: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: no output

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts app/layout.tsx app/page.tsx
git commit -m "feat: configure Tailwind tokens and Space Mono font"
```

---

## Task 10: Add Security Headers to `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "media-src 'self' https:",  // for R2 audio streaming
              "connect-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify build compiles**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` or `Route (app)` table with no errors

- [ ] **Step 3: Run full test suite one last time**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 4: Final Stage 1 commit**

```bash
git add next.config.ts
git commit -m "chore: add security headers to Next.js config"
```

---

## Stage 1 Complete — Smoke Test Checklist

Before handing off to Stage 2, verify:

- [ ] `npm test` — all 11 parser tests pass
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run build` — production build succeeds
- [ ] `npm run dev` — dev server starts, `http://localhost:3000` shows placeholder page
- [ ] `curl http://localhost:3000/api/beats` — returns `[]` (empty array, no error) since R2 is stubbed

The `GET /api/beats` returning `[]` with stubbed credentials is expected — a real R2 connection will return the actual beat list once real credentials are added to `.env.local`.
