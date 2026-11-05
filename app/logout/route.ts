import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { endAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await endAdminSession();
  return NextResponse.redirect(new URL('/login', req.url), 303);
}

export async function GET(req: NextRequest) {
  // Never end admin session on speculative/prefetch GET requests.
  return NextResponse.redirect(new URL('/', req.url));
}
