import { NextResponse } from 'next/server';

// GET /api/health — lightweight liveness probe for uptime monitors / load
// balancers. Returns 200 with basic status info.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'tablekit',
    time: new Date().toISOString(),
  });
}