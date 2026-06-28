import { NextResponse } from 'next/server';

// POST /api/walk-in — seat a walk-in { customerName, phone, guests, tableId }.
// Mirrors addWalkIn() in the client service layer (marks the table occupied).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.tableId || !body?.guests) {
    return NextResponse.json({ error: 'Expected { guests, tableId }.' }, { status: 400 });
  }
  return NextResponse.json({ message: 'Stub — walk-ins are handled client-side in the MVP.', received: body }, { status: 202 });
}