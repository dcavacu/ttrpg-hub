import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'ttrpg_hub_session';

async function verifySessionTokenInline(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;

  const SIGNED_VALUE = 'granted';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const valueData = encoder.encode(SIGNED_VALUE);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, valueData);
  const array = new Uint8Array(signature);
  const expected = Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');

  // Timing-safe comparison
  if (token.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SITE_PASSWORD ?? '';

  try {
    const isValid = await verifySessionTokenInline(token, secret);
    if (!isValid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // If verification fails, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/login/:path*',
    '/((?!_next).*)'
  ],
};
