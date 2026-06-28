import { NextResponse } from 'next/server';

// PATCH /api/tables/:id/status — set a table status { status }.
// Mirrors updateTableStatus() in the client service layer.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const allowed = ['available', 'occupied', 'reserved', 'cleaning'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: `status must be one of ${allowed.join(', ')}.` }, { status: 400 });
  }
  return NextResponse.json({ message: 'Stub — handled client-side in the MVP.', id: params.id, status }, { status: 202 });
}