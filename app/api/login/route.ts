import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  shouldUseSecureCookie,
} from '@/lib/session-shared';

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

function safeDestination(value: FormDataEntryValue | null): string {
  const destination = String(value || '');
  return destination.startsWith('/') && !destination.startsWith('//')
    ? destination
    : '/';
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const expectedEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  if (!expectedEmail || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Admin credentials are not configured.' },
      { status: 500 }
    );
  }

  if (
    !email ||
    !password ||
    !safeEqual(email, expectedEmail) ||
    !safeEqual(password, expectedPassword)
  ) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const response = NextResponse.json({
    redirectTo: safeDestination(formData.get('next')),
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(process.env.ADMIN_SESSION_SECRET), {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookie(request.headers),
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
  return response;
}
