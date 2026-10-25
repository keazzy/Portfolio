import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/*
  Password protection for unreleased work. The password lives in CASE_PASSWORD (never in the page);
  entering it sets an httpOnly cookie, and protected screens are only rendered for requests that carry it.
*/
export const LOCK_COOKIE = 'case-pass';

const digest = (s: string) => createHash('sha256').update('adeleke-portfolio:' + s.trim().toLowerCase()).digest();
const password = () => process.env.CASE_PASSWORD?.trim() || '';

/** The cookie value: a hash of the password, so changing the password signs everyone out. */
export const passToken = () => (password() ? digest(password()).toString('hex') : '');

export function checkPassword(input: string) {
  if (!password()) return false;
  return timingSafeEqual(digest(input), digest(password()));
}

export async function isUnlocked() {
  const token = passToken();
  return !!token && (await cookies()).get(LOCK_COOKIE)?.value === token;
}
