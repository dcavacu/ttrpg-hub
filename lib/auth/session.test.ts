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
});
