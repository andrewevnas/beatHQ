// app/api/webhook/route.ts
// POST /api/webhook
// Stripe webhook endpoint. Verifies signature, logs completed purchases.
// No database — acts as a safety net for payments where user closes browser early.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';

// Next.js App Router: must read raw body text to verify Stripe signature.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[api/webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const beatName = session.metadata?.beatName ?? 'unknown';
    console.log(`[api/webhook] Payment completed for beat: ${beatName}`);
  }

  return NextResponse.json({ received: true });
}
