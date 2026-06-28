import { NextResponse } from 'next/server';
import { SAMPLE_TABLES } from '@/lib/mockData';

// GET /api/tables — returns the restaurant's tables.
// MVP note: the live app reads/writes through the client service layer
// (src/lib/store.ts, localStorage). These routes document the REST contract a
// production backend would expose; swap the bodies for real DB queries.
export async function GET() {
  return NextResponse.json({ tables: SAMPLE_TABLES });
}