import bcrypt from 'bcryptjs';
import { verifyUserCredentials, createUser } from './users';

// Low cost factor for test fixtures only — keeps the suite fast. The real
// createUser/verifyUserCredentials functions always use cost 12.
const TEST_BCRYPT_COST = 4;

function createMockBuilder(result: { data: unknown; error: { message: string } | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.insert = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  return builder;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(builder: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from: vi.fn(() => builder) } as any;
}

describe('verifyUserCredentials', () => {
  it('returns the user when username and password are correct', async () => {
    const passwordHash = await bcrypt.hash('correct-horse', TEST_BCRYPT_COST);
    const builder = createMockBuilder({
      data: { id: 'u-1', username: 'alice', password_hash: passwordHash },
      error: null,
    });
    const client = createMockClient(builder);

    const result = await verifyUserCredentials(client, 'alice', 'correct-horse');

    expect(client.from).toHaveBeenCalledWith('users');
    expect(builder.eq).toHaveBeenCalledWith('username', 'alice');
    expect(result).toEqual({ id: 'u-1', username: 'alice' });
  });

  it('returns null when the password is wrong', async () => {
    const passwordHash = await bcrypt.hash('correct-horse', TEST_BCRYPT_COST);
    const builder = createMockBuilder({
      data: { id: 'u-1', username: 'alice', password_hash: passwordHash },
      error: null,
    });
    const client = createMockClient(builder);

    const result = await verifyUserCredentials(client, 'alice', 'wrong-password');

    expect(result).toBeNull();
  });

  it('returns null when the username is not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await verifyUserCredentials(client, 'nobody', 'anything');

    expect(result).toBeNull();
  });

  it('still runs a bcrypt comparison on the not-found path, to avoid a timing side channel', async () => {
    // If the "user not found" branch short-circuited without ever calling
    // bcrypt.compare, it would return much faster than the "found, wrong
    // password" branch — letting an attacker enumerate valid usernames by
    // timing login attempts. Asserting the compare call happens here (rather
    // than asserting on wall-clock timing, which would be flaky) proves the
    // dummy-hash comparison in the not-found branch actually runs.
    const compareSpy = vi.spyOn(bcrypt, 'compare');
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    await verifyUserCredentials(client, 'nobody', 'anything');

    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledWith('anything', expect.any(String));
    compareSpy.mockRestore();
  });

  it('throws when the database returns an error', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'connection lost' } });
    const client = createMockClient(builder);

    await expect(verifyUserCredentials(client, 'alice', 'correct-horse')).rejects.toThrow('connection lost');
  });
});

describe('createUser', () => {
  it('inserts a hashed password (not the plaintext) and returns the new id', async () => {
    const builder = createMockBuilder({ data: { id: 'u-2' }, error: null });
    const client = createMockClient(builder);

    const id = await createUser(client, 'bob', 'hunter2');

    expect(builder.insert).toHaveBeenCalledTimes(1);
    const insertedRow = builder.insert.mock.calls[0][0];
    expect(insertedRow.username).toBe('bob');
    expect(insertedRow.password_hash).not.toBe('hunter2');
    await expect(bcrypt.compare('hunter2', insertedRow.password_hash)).resolves.toBe(true);
    expect(id).toBe('u-2');
  });
});
