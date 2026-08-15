export const SESSION_COOKIE_NAME = 'ttrpg_hub_session';

async function hmac(secret: string, value: string): Promise<string> {
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(secret: string, username: string): Promise<string> {
  const encodedUsername = encodeURIComponent(username);
  const signature = await hmac(secret, encodedUsername);
  return `${encodedUsername}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<{ username: string } | null> {
  if (!token) return null;
  const separatorIndex = token.indexOf('.');
  if (separatorIndex === -1) return null;
  const encodedUsername = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = await hmac(secret, encodedUsername);
  if (!timingSafeEqual(signature, expectedSignature)) return null;
  return { username: decodeURIComponent(encodedUsername) };
}
