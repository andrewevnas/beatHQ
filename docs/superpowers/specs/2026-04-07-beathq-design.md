# BeatHQ — Design Spec
**Date:** 2026-04-07
**Status:** Approved

---

## 1. Overview

A minimalistic beat sales website for a music producer. Sells beats directly (no third-party platform). Two license tiers per beat. Stripe handles payments. Cloudflare R2 handles file storage. No database — beat metadata is derived from filenames.

---

## 2. Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Space Mono (Google Fonts) |
| Hosting | Vercel (free tier) |
| File Storage | Cloudflare R2 |
| Payments | Stripe (Checkout + Webhooks) |
| Database | None |

---

## 3. File Naming Convention

All beat files follow this pattern:

```
BeatName_BPMbpm_Key.ext
```

Examples:
```
DragonFire_140bpm_Am.wav
DragonFire_140bpm_Am.mp3
DragonFire_140bpm_Am.jpg   ← cover art
```

**Parsing rules:**
- Split on `_` → `[name, bpm, key]`
- BPM: strip `bpm` suffix → integer
- Key: use as-is
- Display name: replace hyphens/underscores with spaces, title-case

---

## 4. R2 Bucket Structure

```
beats/
  previews/   ← low-quality MP3 for in-browser playback (streamed, not downloaded)
  mp3/        ← full-quality MP3, delivered on purchase
  wav/        ← full-quality WAV, delivered on purchase
  covers/     ← square JPEG/PNG cover art shown in grid
```

All four folders use the same base filename. Adding a beat = uploading 4 files via R2 dashboard. Removing = deleting them.

---

## 5. Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Beat grid homepage |
| `/api/beats` | Lists beats by reading R2 `previews/` folder, returns parsed metadata |
| `/api/checkout` | Creates a Stripe Checkout session for a given beat |
| `/api/webhook` | Stripe webhook — optional safety net (records payment server-side if user closes browser before redirect) |
| `/success` | Post-payment page — verifies Stripe session, generates signed R2 download URLs |

---

## 6. UI Design

**Typeface:** Space Mono (monospace, stark)
**Palette:** `#FAFAFA` background · `#09090B` text/borders · `#A1A1AA` muted
**Aesthetic:** Notion-minimal, editorial, white-dominant, bold black structural lines

### Nav
- `border-bottom: 2px solid #09090B`
- Left: logo/name (uppercase, letter-spaced)
- Right: "Beats" · "Contact" (muted, hover to black)

### Beat Grid
- 4 columns, fixed 120×120px squares
- Gap: 100px vertical · 180px horizontal
- Centered on page
- Cover art fills the square (dark placeholder if no cover)
- Beat name underneath: 9px, uppercase, muted grey, Space Mono

### Beat Hover State
- Dark overlay (75% opacity) fades in (180ms)
- Circular play button (32px, white border)
- BPM and Key stacked below in small uppercase tags

### Beat Modal (on click)
- Slides up / appears centered
- Shows: beat name, BPM, key
- Preview audio player (streams from R2 `previews/` via public R2 URL — no signing needed for previews)
- Two buttons:
  - **"General License — £50"** → triggers Stripe Checkout
  - **"Exclusive License — Enquire"** → `mailto:` link to producer's email

### Footer
- `border-top: 2px solid #09090B`
- Left: "All Rights Reserved"
- Right: "© 2026 [Name]"

---

## 7. Purchase Flow

1. User clicks beat → modal opens with preview player + license buttons
2. User clicks **"General License — £50"**
3. POST `/api/checkout` with `{ beatName }` → server creates Stripe Checkout session with:
   - Amount: 5000 (£50.00 in pence)
   - Currency: `gbp`
   - Metadata: `{ beatName }`
   - `success_url`: `/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url`: `/`
4. User completes payment on Stripe's hosted page
5. Stripe redirects to `/success?session_id=xxx`
6. Server calls `stripe.checkout.sessions.retrieve(session_id)` — verifies `payment_status === 'paid'`
7. Extracts `beatName` from session metadata
8. Generates two **24-hour signed URLs** from Cloudflare R2:
   - `beats/mp3/{beatName}.mp3`
   - `beats/wav/{beatName}.wav`
9. Success page renders with two download buttons

**Exclusive License:** `mailto:producer@email.com?subject=Exclusive License - {beatName}` — no Stripe involved.

---

## 8. Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Site
PRODUCER_EMAIL=
NEXT_PUBLIC_SITE_NAME=
```

---

## 9. Key Constraints

- **No database** — beat catalog is derived live from R2 `previews/` folder contents
- **No user accounts** — purchase is guest checkout only
- **Single General License price** — £50, set via environment variable `GENERAL_PRICE_PENCE=5000`
- **No email delivery** — download links shown directly on success page (24hr expiry)
- **Exclusive = contact only** — no automated exclusive purchase flow

---

## 10. Out of Scope

- Admin panel (beats managed via R2 dashboard)
- Beat watermarking / preview tagging
- License PDF generation
- Analytics / play count tracking
- Discount codes
