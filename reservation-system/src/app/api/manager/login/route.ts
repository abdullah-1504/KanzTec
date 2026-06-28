import { NextResponse } from 'next/server';
import { SESSION_COOKIE, getManagerPassword, sessionToken } from '@/lib/auth';

// POST /api/manager/login — exchange the manager password for a session cookie.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password: unknown = body?.password;

  if (typeof password !== 'string' || password !== getManagerPassword()) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}