import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifySessionToken,
} from './session-shared';

function adminSessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not set in .env.local');
  return s;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    return await verifySessionToken(token, adminSessionSecret());
  } catch {
    return false;
  }
}

/** Security gate for every privileged server action. Throws when the caller
 * has no valid admin session — actions catch and surface it as an error. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error('Unauthorized: admin session required. Please sign in again.');
  }
}

/** Issues a fresh signed session cookie (12h expiry). */
export async function startAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, await createSessionToken(adminSessionSecret()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** Clears the session immediately (sign out). */
export async function endAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}
