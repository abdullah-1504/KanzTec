import { NextResponse } from 'next/server';
import { buildSeedReviews } from '@/lib/mockData';

// GET  /api/reviews — list reviews.
// POST /api/reviews — create a review { guestId, reservationId, rating, comment }.
export async function GET() {
  return NextResponse.json({ reviews: buildSeedReviews() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.guestId || !body?.rating) {
    return NextResponse.json({ error: 'Expected { guestId, reservationId, rating }.' }, { status: 400 });
  }
  return NextResponse.json({ message: 'Stub — reviews are stored client-side in the MVP.', received: body }, { status: 202 });
}