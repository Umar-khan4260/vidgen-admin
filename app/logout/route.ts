import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { endAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await endAdminSession();
  return NextResponse.redirect(new URL('/login', req.url));
}
