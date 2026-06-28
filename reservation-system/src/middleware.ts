import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, expectedToken } from '@/lib/auth';

// Protect the manager console. Unauthenticated requests are redirected to the
// login page with a `next` param so they return where they intended.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Open access (public demo) when no password is configured. Set MANAGER_PASSWORD
  // to lock the console for a real deployment.
  if (!process.env.MANAGER_PASSWORD) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = await expectedToken();

  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/manager/:path*'],
};