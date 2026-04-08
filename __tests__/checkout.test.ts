// __tests__/checkout.test.ts
jest.mock('@/lib/env', () => ({
  env: { GENERAL_PRICE_PENCE: 5000 },
}));
jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

import { POST } from '@/app/api/checkout/route';
import { stripe } from '@/lib/stripe';
import { NextRequest } from 'next/server';

const mockCreate = stripe.checkout.sessions.create as jest.Mock;

beforeEach(() => {
  mockCreate.mockReset();
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'origin': 'http://localhost:3000' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/checkout', () => {
  it('creates a Stripe session and returns the URL', async () => {
    mockCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/abc123' });

    const res = await POST(makeRequest({ beatName: 'DragonFire_140bpm_Am' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ url: 'https://checkout.stripe.com/pay/abc123' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        metadata: { beatName: 'DragonFire_140bpm_Am' },
      })
    );
  });

  it('returns 400 when beatName is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when beatName is empty string', async () => {
    const res = await POST(makeRequest({ beatName: '' }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 400 when beatName is not a string', async () => {
    const res = await POST(makeRequest({ beatName: 42 }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 500 when Stripe throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Stripe error'));
    const res = await POST(makeRequest({ beatName: 'DragonFire_140bpm_Am' }));
    expect(res.status).toBe(500);
  });
});
