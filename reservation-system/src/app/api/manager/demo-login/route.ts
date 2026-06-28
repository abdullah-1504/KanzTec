import { NextResponse } from 'next/server';
import { SESSION_COOKIE, getManagerPassword, sessionToken } from '@/lib/auth';

// POST /api/manager/demo-login — passwordless sign-in for the public portfolio
// demo. Only works when NEXT_PUBLIC_DEMO_MODE=true, so it can't be abused on a
// real (non-demo) deployment.
export async function POST() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode is disabled.' }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await sessionToken(getManagerPassword()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}