// app/api/beats/route.ts
// GET /api/beats — returns Beat[] as JSON.
// Delegates to getBeats() — no duplicated R2 logic here.

import { NextResponse } from 'next/server';
import { getBeats } from '@/lib/getBeats';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const beats = await getBeats();
    return NextResponse.json(beats);
  } catch (error) {
    console.error('[api/beats] Failed to fetch beats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beats' },
      { status: 500 }
    );
  }
}
