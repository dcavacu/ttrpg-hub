import type { SupabaseClient } from '@supabase/supabase-js';
import { getCategoryCounts, listTagCounts } from './sidebar';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(resultsByTable: Record<string, any>) {
  const from = vi.fn((table: string) => ({
    select: vi.fn(() => Promise.resolve(resultsByTable[table])),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from } as any;
}

describe('getCategoryCounts', () => {
  it('returns counts for each table', async () => {
    const client = createMockClient({
      monsters: { count: 324, error: null },
      items: { count: 0, error: null },
      spells: { count: 0, error: null },
      rules: { count: 0, error: null },
    });

    const result = await getCategoryCounts(client);

    expect(result).toEqual({ monsters: 324, items: 0, spells: 0, rules: 0 });
    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(client.from).toHaveBeenCalledWith('items');
    expect(client.from).toHaveBeenCalledWith('spells');
    expect(client.from).toHaveBeenCalledWith('rules');
  });

  it('throws when any table query returns an error', async () => {
    const client = createMockClient({
      monsters: { count: 324, error: null },
      items: { count: 0, error: null },
      spells: { count: null, error: { message: 'boom' } },
      rules: { count: 0, error: null },
    });

    await expect(getCategoryCounts(client)).rejects.toThrow('boom');
  });
});

describe('listTagCounts', () => {
  it('counts how many rows carry each tag', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ tags: ['Dragon', 'Beast'] }, { tags: ['Dragon'] }, { tags: [] }],
        error: null,
      },
    });

    const result = await listTagCounts(client, 'monsters');

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([
      { tag: 'Beast', count: 1 },
      { tag: 'Dragon', count: 2 },
    ]);
  });

  it('returns an empty array when there is no data', async () => {
    const client = createMockClient({
      monsters: { data: [], error: null },
    });

    const result = await listTagCounts(client, 'monsters');

    expect(result).toEqual([]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({
      monsters: { data: null, error: { message: 'boom' } },
    });

    await expect(listTagCounts(client, 'monsters')).rejects.toThrow('boom');
  });

  it('works against a different table name', async () => {
    const client = createMockClient({
      items: {
        data: [{ tags: ['Weapon'] }, { tags: ['Weapon', 'Magic'] }],
        error: null,
      },
    });

    const result = await listTagCounts(client, 'items');

    expect(client.from).toHaveBeenCalledWith('items');
    expect(result).toEqual([
      { tag: 'Magic', count: 1 },
      { tag: 'Weapon', count: 2 },
    ]);
  });

  it('scopes the query by systemId when provided', async () => {
    const eq = vi.fn(() => Promise.resolve({ data: [{ tags: ['Dragon'] }], error: null }));
    const from = vi.fn(() => ({ select: vi.fn(() => ({ eq })) }));
    const client = { from } as unknown as SupabaseClient;

    await listTagCounts(client, 'monsters', 'system-123');

    expect(eq).toHaveBeenCalledWith('system_id', 'system-123');
  });
});
