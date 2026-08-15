'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isCorrectPassword } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

const SAFE_REDIRECT = /^\/(?!\/)/;

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const requestedRedirectTo = String(formData.get('redirectTo') ?? '/monsters');
  const redirectTo = SAFE_REDIRECT.test(requestedRedirectTo) ? requestedRedirectTo : '/monsters';
  const secret = process.env.SITE_PASSWORD ?? '';

  if (!isCorrectPassword(password, secret)) {
    redirect(`/login?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const token = await createSessionToken(secret);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  redirect(redirectTo);
}
