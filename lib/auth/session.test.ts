import { createSessionToken, verifySessionToken } from './session';

describe('session tokens', () => {
  it('verifies a token created with the same secret', async () => {
    const token = await createSessionToken('secret-a');
    expect(await verifySessionToken(token, 'secret-a')).toBe(true);
  });

  it('rejects a token created with a different secret', async () => {
    const token = await createSessionToken('secret-a');
    expect(await verifySessionToken(token, 'secret-b')).toBe(false);
  });

  it('rejects an undefined token', async () => {
    expect(await verifySessionToken(undefined, 'secret-a')).toBe(false);
  });

  it('rejects a tampered token', async () => {
    const token = await createSessionToken('secret-a');
    expect(await verifySessionToken(token + 'x', 'secret-a')).toBe(false);
  });
});
