import { createSessionToken, verifySessionToken } from './session';

describe('session tokens', () => {
  it('verifies a token created for a username and returns that exact username', async () => {
    const token = await createSessionToken('secret-a', 'alice');
    expect(await verifySessionToken(token, 'secret-a')).toEqual({ username: 'alice' });
  });

  it('rejects a token created with a different secret', async () => {
    const token = await createSessionToken('secret-a', 'alice');
    expect(await verifySessionToken(token, 'secret-b')).toBeNull();
  });

  it('rejects an undefined token', async () => {
    expect(await verifySessionToken(undefined, 'secret-a')).toBeNull();
  });

  it('rejects a tampered signature', async () => {
    const token = await createSessionToken('secret-a', 'alice');
    expect(await verifySessionToken(token + 'x', 'secret-a')).toBeNull();
  });

  it('rejects a token whose username was swapped but kept the original signature', async () => {
    const token = await createSessionToken('secret-a', 'alice');
    const separatorIndex = token.indexOf('.');
    const signature = token.slice(separatorIndex + 1);
    const forgedToken = `bob.${signature}`;
    expect(await verifySessionToken(forgedToken, 'secret-a')).toBeNull();
  });

  it('throws when creating a token with an empty secret', async () => {
    await expect(createSessionToken('', 'alice')).rejects.toThrow();
  });

  it('rejects verification against an empty secret, even with a validly-shaped token', async () => {
    const token = await createSessionToken('secret-a', 'alice');
    expect(await verifySessionToken(token, '')).toBeNull();
  });

  it('rejects verification when no secret is configured (undefined coerced to empty string)', async () => {
    // Mirrors how middleware.ts / actions.ts derive the secret: process.env.SITE_PASSWORD ?? ''
    expect(await verifySessionToken('anything.deadbeef', '')).toBeNull();
  });

  it('round-trips a username containing a literal dot', async () => {
    const token = await createSessionToken('secret-a', 'john.doe');
    expect(await verifySessionToken(token, 'secret-a')).toEqual({ username: 'john.doe' });
  });
});
