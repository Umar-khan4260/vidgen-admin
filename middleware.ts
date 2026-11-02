import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/session-shared';

const PUBLIC_PATHS = new Set(['/login']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  const valid = session && secret ? await verifySessionToken(session, secret) : false;

  if (!valid && !PUBLIC_PATHS.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Already signed in — skip the login page.
  if (valid && PUBLIC_PATHS.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
