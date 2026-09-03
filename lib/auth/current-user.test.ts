import { getUserByUsername } from './current-user';

function createMockBuilder(result: { data: unknown; error: { message: string; code?: string } | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  return builder;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(builder: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from: vi.fn(() => builder) } as any;
}

describe('getUserByUsername', () => {
  it('returns the user with isGm coerced from the raw column', async () => {
    const builder = createMockBuilder({ data: { id: 'u-1', username: 'alice', is_gm: true }, error: null });
    const client = createMockClient(builder);

    const result = await getUserByUsername(client, 'alice');

    expect(client.from).toHaveBeenCalledWith('users');
    expect(builder.eq).toHaveBeenCalledWith('username', 'alice');
    expect(result).toEqual({ id: 'u-1', username: 'alice', isGm: true });
  });

  it('defaults isGm to false when the column is false or null', async () => {
    const builder = createMockBuilder({ data: { id: 'u-2', username: 'bob', is_gm: false }, error: null });
    const client = createMockClient(builder);

    const result = await getUserByUsername(client, 'bob');

    expect(result!.isGm).toBe(false);
  });

  it('returns null when the username is not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await getUserByUsername(client, 'nobody');

    expect(result).toBeNull();
  });

  it('throws when the database returns an error', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'connection lost' } });
    const client = createMockClient(builder);

    await expect(getUserByUsername(client, 'alice')).rejects.toThrow('connection lost');
  });

  describe('when the is_gm column does not exist yet (migration not yet applied)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
    function createFallbackClient(fallbackResult: { data: unknown; error: { message: string } | null }) {
      const firstBuilder = createMockBuilder({ data: null, error: { message: 'column "is_gm" does not exist', code: '42703' } });
      const secondBuilder = createMockBuilder(fallbackResult);
      let call = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
      const client: any = { from: vi.fn(() => (call++ === 0 ? firstBuilder : secondBuilder)) };
      return { client, firstBuilder, secondBuilder };
    }

    it('falls back to a query without is_gm and treats the user as not a GM', async () => {
      const { client, secondBuilder } = createFallbackClient({ data: { id: 'u-3', username: 'carol' }, error: null });

      const result = await getUserByUsername(client, 'carol');

      expect(client.from).toHaveBeenCalledTimes(2);
      expect(secondBuilder.select).toHaveBeenCalledWith('id, username');
      expect(result).toEqual({ id: 'u-3', username: 'carol', isGm: false });
    });

    it('still returns null when the user is not found on the fallback path', async () => {
      const { client } = createFallbackClient({ data: null, error: null });

      const result = await getUserByUsername(client, 'nobody');

      expect(result).toBeNull();
    });

    it('still throws if the fallback query itself errors', async () => {
      const { client } = createFallbackClient({ data: null, error: { message: 'connection lost' } });

      await expect(getUserByUsername(client, 'carol')).rejects.toThrow('connection lost');
    });
  });
});
