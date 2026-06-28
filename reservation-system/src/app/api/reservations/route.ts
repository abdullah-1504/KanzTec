import { NextResponse } from 'next/server';
import { buildSeedReservations } from '@/lib/mockData';

// GET  /api/reservations — list reservations.
// POST /api/reservations — create a reservation (shape documented below).
//
// MVP note: writes are handled client-side via createReservation() in
// src/lib/store.ts, which runs the SAME shared helpers a production handler
// would (availability, deposits, guest matching). This route shows the contract.
export async function GET() {
  return NextResponse.json({ reservations: buildSeedReservations() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  // A production implementation would call the shared booking core here, e.g.:
  //   const result = createReservationServer(body)  // checkTableAvailable + evaluateDeposit + findOrCreateGuest
  return NextResponse.json(
    {
      message: 'Stub endpoint — in the MVP, bookings are created via the client service layer.',
      received: body,
    },
    { status: 202 },
  );
}