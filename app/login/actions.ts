'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isCorrectPassword } from '@/lib/auth/password';
import { createSessionToken } from '@/lib/auth/session';

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/monsters');
  const secret = process.env.SITE_PASSWORD ?? '';

  if (!isCorrectPassword(password, secret)) {
    redirect(`/login?error=1&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const token = await createSessionToken(secret);
  cookies().set('ttrpg_hub_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  redirect(redirectTo);
}
