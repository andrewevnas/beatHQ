# Deployment Guide
**Date:** 2026-04-14

---

## 1. Vercel

### Connect repo
1. Push `master` to GitHub (ensure `.env.local` is gitignored — it is)
2. Go to vercel.com → New Project → Import from GitHub
3. Framework: **Next.js** (auto-detected)
4. Root directory: `/` (default)
5. No build command override needed (`next build` is the default)

### Env vars — set all of these in Vercel dashboard (Settings → Environment Variables)

| Variable | Value |
|---|---|
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | e.g. `beathq` |
| `R2_PUBLIC_URL` | Public R2 domain, e.g. `https://pub-xxx.r2.dev` or custom domain |
| `SITE_URL` | Production URL, e.g. `https://beathq.com` (no trailing slash) |
| `STRIPE_SECRET_KEY` | Live key: `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe dashboard — see step 3 |
| `PRODUCER_EMAIL` | Your email for exclusive license enquiries |
| `GENERAL_PRICE_PENCE` | `5000` (= £50.00) |
| `NEXT_PUBLIC_SITE_NAME` | Display name, e.g. `BeatHQ` |

> Set all vars for **Production** environment. Optionally copy to Preview too.

---

## 2. R2 Configuration

### Bucket structure (must exist before launch)
```
beats/
  previews/   ← public read
  covers/     ← public read
  mp3/        ← private (signed URLs only)
  wav/        ← private (signed URLs only)
```

### Public access
- Enable **R2.dev public URL** or configure a custom domain on the bucket
- Set `R2_PUBLIC_URL` to that URL (no trailing slash)
- Only `previews/` and `covers/` need to be publicly accessible — do NOT make the whole bucket public

### CORS rule
Required so audio previews work in Firefox (Firefox routes media through `connect-src`).

In R2 dashboard → Bucket → Settings → CORS, add:
```json
[
  {
    "AllowedOrigins": ["https://beathq.com"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Disposition", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace `https://beathq.com` with your actual domain.

After setting the final domain, also add the R2 public URL to `connect-src` in `middleware.ts`:
```ts
`connect-src 'self' https://api.stripe.com ${env.R2_PUBLIC_URL}`,
```

### R2 API token
Create a token in Cloudflare dashboard with **Object Read & Write** on this bucket only.

---

## 3. Stripe

### Switch to live mode
- In Stripe dashboard, toggle to **Live mode**
- Use `sk_live_...` for `STRIPE_SECRET_KEY` (NOT the test key)

### Register webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://beathq.com/api/webhook`
3. Events to listen to: `checkout.session.completed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (`whsec_...`) → set as `STRIPE_WEBHOOK_SECRET` in Vercel

### Test the webhook
After deploying, use Stripe CLI or the dashboard's test delivery to confirm `checkout.session.completed` events reach your endpoint and return `200`.

---

## 4. DNS / Custom Domain

1. In Vercel: Settings → Domains → Add your domain
2. Add the CNAME/A record Vercel gives you at your registrar
3. Vercel auto-provisions TLS (Let's Encrypt)
4. Once DNS propagates, update `SITE_URL` in Vercel to the custom domain

> HSTS `preload` flag can be added to `next.config.mjs` post-launch once the domain is stable.

---

## 5. Pre-launch Checklist

- [ ] All env vars set in Vercel (Production)
- [ ] R2 bucket folders created with correct access levels
- [ ] R2 CORS rule added for production domain
- [ ] Stripe webhook registered and signing secret copied to Vercel
- [ ] Custom domain configured and TLS active
- [ ] `SITE_URL` updated to final production URL
- [ ] Test full purchase flow end-to-end with a real Stripe payment (can refund immediately)
- [ ] Confirm download links trigger file download (not browser playback) — the `ResponseContentDisposition` fix handles this
- [ ] Upload at least one beat (all 4 files: preview, mp3, wav, cover) before going live

---

## 6. Post-launch

- Monitor Vercel function logs for R2/Stripe errors
- Add HSTS `preload` to `next.config.mjs` once domain is confirmed stable
- Add R2 public URL to `connect-src` in `middleware.ts` once domain is finalised
- Consider R2 pagination for `/api/beats` if catalog grows beyond 1000 beats
