"use server";

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'crypto';
import { startAdminSession } from '@/lib/admin-session';

export type LoginState = { error: string | null };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const expectedEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || '';

  if (!expectedEmail || !expectedPassword) {
    return {
      error:
        'Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local and restart the dev server.',
    };
  }

  if (
    !email ||
    !password ||
    !safeEqual(email, expectedEmail) ||
    !safeEqual(password, expectedPassword)
  ) {
    return { error: 'Invalid email or password.' };
  }

  await startAdminSession();
  redirect('/');
}
