const SIGNED_VALUE = 'granted';

export const SESSION_COOKIE_NAME = 'ttrpg_hub_session';

async function createHmac(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const valueData = encoder.encode(value);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, valueData);
  const array = new Uint8Array(signature);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(secret: string): Promise<string> {
  return createHmac(secret, SIGNED_VALUE);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken(secret);
  return timingSafeEqual(token, expected);
}
