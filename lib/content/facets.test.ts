import type { SupabaseClient } from '@supabase/supabase-js';
import { listFacetCounts, listManaCostBucketCounts } from './facets';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(resultsByTable: Record<string, any>) {
  const from = vi.fn((table: string) => ({
    select: vi.fn(() => Promise.resolve(resultsByTable[table])),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from } as any;
}

describe('listFacetCounts', () => {
  it('counts how many rows carry each value in the given column', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ tier: 'Normal' }, { tier: 'Legendary' }, { tier: 'Normal' }],
        error: null,
      },
    });

    const result = await listFacetCounts(client, 'monsters', 'tier');

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([
      { value: 'Legendary', count: 1 },
      { value: 'Normal', count: 2 },
    ]);
  });

  it('skips null and empty values', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ combat_role: 'Melee' }, { combat_role: null }, { combat_role: '' }],
        error: null,
      },
    });

    const result = await listFacetCounts(client, 'monsters', 'combat_role');

    expect(result).toEqual([{ value: 'Melee', count: 1 }]);
  });

  it('returns an empty array when there is no data', async () => {
    const client = createMockClient({ monsters: { data: [], error: null } });
    const result = await listFacetCounts(client, 'monsters', 'tier');
    expect(result).toEqual([]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({ monsters: { data: null, error: { message: 'boom' } } });
    await expect(listFacetCounts(client, 'monsters', 'tier')).rejects.toThrow('boom');
  });

  it('scopes the query by systemId when provided', async () => {
    const eq = vi.fn(() => Promise.resolve({ data: [{ tier: 'Normal' }], error: null }));
    const from = vi.fn(() => ({ select: vi.fn(() => ({ eq })) }));
    const client = { from } as unknown as SupabaseClient;

    await listFacetCounts(client, 'monsters', 'tier', 'system-123');

    expect(eq).toHaveBeenCalledWith('system_id', 'system-123');
  });
});

describe('listManaCostBucketCounts', () => {
  it('buckets 0, 1-2, and 3+ separately', async () => {
    const client = createMockClient({
      spells: {
        data: [{ mana_cost: 0 }, { mana_cost: 1 }, { mana_cost: 2 }, { mana_cost: 3 }, { mana_cost: 8 }],
        error: null,
      },
    });

    const result = await listManaCostBucketCounts(client);

    expect(client.from).toHaveBeenCalledWith('spells');
    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 2 },
      { bucket: '3+', count: 2 },
    ]);
  });

  it('skips null mana_cost values', async () => {
    const client = createMockClient({
      spells: { data: [{ mana_cost: null }, { mana_cost: 0 }], error: null },
    });

    const result = await listManaCostBucketCounts(client);

    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 0 },
      { bucket: '3+', count: 0 },
    ]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({ spells: { data: null, error: { message: 'boom' } } });
    await expect(listManaCostBucketCounts(client)).rejects.toThrow('boom');
  });
});
