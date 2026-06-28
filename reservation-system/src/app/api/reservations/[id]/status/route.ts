import { NextResponse } from 'next/server';

// PATCH /api/reservations/:id/status — update reservation status { status }.
// Mirrors updateReservationStatus(): completing a booking records spend and
// updates the guest's CRM stats; no-show forfeits a paid deposit.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const allowed = ['confirmed', 'cancelled', 'completed', 'no-show'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: `status must be one of ${allowed.join(', ')}.` }, { status: 400 });
  }
  return NextResponse.json({ message: 'Stub — handled client-side in the MVP.', id: params.id, status }, { status: 202 });
}