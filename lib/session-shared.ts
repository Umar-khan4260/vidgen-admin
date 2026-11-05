/**
 * Admin session token helpers — shared by middleware (edge runtime) and
 * server actions (node runtime). Uses only Web Crypto so both runtimes
 * work. Token format: "<expiresAtMs>.<hmac-sha256-hex(expiresAtMs, secret)>".
 */
export const ADMIN_SESSION_COOKIE = 'vg_admin_session';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function shouldUseSecureCookie(requestHeaders?: Headers | null): boolean {
  if (process.env.NODE_ENV === 'development') return false;
  if (!requestHeaders) return process.env.NODE_ENV === 'production';
  const forwardedProtocol = requestHeaders.get('x-forwarded-proto');
  const protocol = forwardedProtocol?.split(',')[0].trim().toLowerCase();
  if (protocol) return protocol === 'https';

  const origin = requestHeaders.get('origin') ?? requestHeaders.get('referer') ?? '';
  if (origin.startsWith('https://')) return true;
  if (origin.startsWith('http://')) return false;

  return process.env.NODE_ENV === 'production';
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bytesToHex(new Uint8Array(mac));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${await hmacHex(String(expiresAt), secret)}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await hmacHex(String(expiresAt), secret);
  return constantTimeEqual(sig, expected);
}
