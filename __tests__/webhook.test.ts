// __tests__/webhook.test.ts
jest.mock('@/lib/env', () => ({
  env: { STRIPE_WEBHOOK_SECRET: 'whsec_test' },
}));
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

import { POST } from '@/app/api/webhook/route';
import { stripe } from '@/lib/stripe';
import { NextRequest } from 'next/server';

const mockConstructEvent = stripe.webhooks.constructEvent as jest.Mock;

beforeEach(() => {
  mockConstructEvent.mockReset();
  process.env['STRIPE_WEBHOOK_SECRET'] = 'whsec_test';
});

function makeWebhookRequest(body: string, signature = 'valid-sig'): NextRequest {
  return new NextRequest('http://localhost:3000/api/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': signature },
    body,
  });
}

describe('POST /api/webhook', () => {
  it('handles checkout.session.completed and returns 200', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          payment_status: 'paid',
          metadata: { beatName: 'DragonFire_140bpm_Am' },
        },
      },
    };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
  });

  it('returns 200 for unhandled event types', async () => {
    const event = { type: 'payment_intent.created', data: { object: {} } };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)));
    expect(res.status).toBe(200);
  });

  it('returns 400 when Stripe signature is invalid', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('Webhook signature verification failed');
    });

    const res = await POST(makeWebhookRequest('bad-payload', 'bad-sig'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhook', {
      method: 'POST',
      body: 'payload',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
