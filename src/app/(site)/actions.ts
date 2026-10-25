'use server';

import { cookies } from 'next/headers';
import { checkPassword, LOCK_COOKIE, passToken } from '@/lib/work/lock';

export type UnlockState = { ok: boolean; error?: string };

export async function unlock(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  if (!checkPassword(String(form.get('password') ?? ''))) {
    return { ok: false, error: 'That’s not it. Check the password in my application.' };
  }
  (await cookies()).set(LOCK_COOKIE, passToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}
