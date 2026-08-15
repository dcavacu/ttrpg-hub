import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth/session';

const SESSION_COOKIE = 'ttrpg_hub_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/login')) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SITE_PASSWORD ?? '';

  if (!(await verifySessionToken(token, secret))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
