// app/api/checkout/route.ts
// POST /api/checkout
// Creates a Stripe Checkout session for a General License purchase.
// Body: { beatName: string }
// Returns: { url: string } — the Stripe-hosted checkout URL.

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';

const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9\-]*_\d+bpm_[A-Za-z][A-Za-z0-9#b]*$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let beatName: unknown;
  try {
    const body = await request.json() as Record<string, unknown>;
    beatName = body['beatName'];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof beatName !== 'string' || beatName.trim() === '') {
    return NextResponse.json({ error: 'beatName is required and must be a non-empty string' }, { status: 400 });
  }

  if (!SLUG_RE.test(beatName)) {
    return NextResponse.json({ error: 'Invalid beat identifier' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: `General License — ${beatName}` },
            unit_amount: env.GENERAL_PRICE_PENCE,
          },
          quantity: 1,
        },
      ],
      metadata: { beatName },
      success_url: `${env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.SITE_URL}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[api/checkout] Stripe error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
