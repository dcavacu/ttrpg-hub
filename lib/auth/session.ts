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

// base64url (RFC 4648 §5) encode/decode for the username segment of the
// token. This — rather than encodeURIComponent — is what guarantees the
// token can always be split unambiguously on the first '.': base64url's
// alphabet is exactly A-Z a-z 0-9 - _ and never contains a literal '.',
// whereas encodeURIComponent leaves '.' unescaped (it's in the unreserved
// set), which would break the split for a username like "john.doe".
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): string {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function createSessionToken(secret: string, username: string): Promise<string> {
  if (!secret) throw new Error('createSessionToken requires a non-empty secret');
  const encodedUsername = base64UrlEncode(username);
  const signature = await hmac(secret, encodedUsername);
  return `${encodedUsername}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<{ username: string } | null> {
  if (!secret) return null;
  if (!token) return null;
  const separatorIndex = token.indexOf('.');
  if (separatorIndex === -1) return null;
  const encodedUsername = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = await hmac(secret, encodedUsername);
  if (!timingSafeEqual(signature, expectedSignature)) return null;
  return { username: base64UrlDecode(encodedUsername) };
}
