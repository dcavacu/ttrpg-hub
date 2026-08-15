'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { verifyUserCredentials } from '@/lib/auth/users';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

const SAFE_REDIRECT = /^\/(?!\/)/;

export async function login(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const requestedRedirectTo = String(formData.get('redirectTo') ?? '/monsters');
  const redirectTo = SAFE_REDIRECT.test(requestedRedirectTo) ? requestedRedirectTo : '/monsters';
  const secret = process.env.SITE_PASSWORD ?? '';

  const client = createSupabaseClient();
  const user = await verifyUserCredentials(client, username, password);

  if (!user) {
    redirect(`/login?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const token = await createSessionToken(secret, user.username);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  redirect(redirectTo);
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
