import { listFacetCounts, listManaCostBucketCounts } from './facets';

function createMockBuilder(result: { data: unknown; error: { message: string } | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.ilike = vi.fn(() => builder);
  builder.contains = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lte = vi.fn(() => builder);
  builder.then = (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve);
  return builder;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(builder: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from: vi.fn(() => builder) } as any;
}

describe('listFacetCounts', () => {
  it('counts how many rows carry each value in the given column', async () => {
    const builder = createMockBuilder({
      data: [{ tier: 'Normal' }, { tier: 'Legendary' }, { tier: 'Normal' }],
      error: null,
    });
    const client = createMockClient(builder);

    const result = await listFacetCounts(client, 'monsters', 'tier', {});

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([
      { value: 'Legendary', count: 1 },
      { value: 'Normal', count: 2 },
    ]);
  });

  it('skips null and empty values', async () => {
    const builder = createMockBuilder({
      data: [{ combat_role: 'Melee' }, { combat_role: null }, { combat_role: '' }],
      error: null,
    });
    const client = createMockClient(builder);

    const result = await listFacetCounts(client, 'monsters', 'combat_role', {});

    expect(result).toEqual([{ value: 'Melee', count: 1 }]);
  });

  it('returns an empty array when there is no data', async () => {
    const builder = createMockBuilder({ data: [], error: null });
    const client = createMockClient(builder);
    const result = await listFacetCounts(client, 'monsters', 'tier', {});
    expect(result).toEqual([]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);
    await expect(listFacetCounts(client, 'monsters', 'tier', {})).rejects.toThrow('boom');
  });

  it('scopes the query by systemId when provided', async () => {
    const builder = createMockBuilder({ data: [{ tier: 'Normal' }], error: null });
    const client = createMockClient(builder);

    await listFacetCounts(client, 'monsters', 'tier', { systemId: 'system-123' });

    expect(builder.eq).toHaveBeenCalledWith('system_id', 'system-123');
  });

  it('excludes the given key from filters so sibling values still show', async () => {
    const builder = createMockBuilder({ data: [{ race: 'Dragon' }], error: null });
    const client = createMockClient(builder);

    await listFacetCounts(client, 'monsters', 'race', { race: 'Beast' }, 'race');

    expect(builder.eq).not.toHaveBeenCalledWith('race', 'Beast');
  });

  it('applies other active filters to the count', async () => {
    const builder = createMockBuilder({ data: [{ race: 'Dragon' }], error: null });
    const client = createMockClient(builder);

    await listFacetCounts(client, 'monsters', 'race', { tier: 'Legendary' }, 'race');

    expect(builder.eq).toHaveBeenCalledWith('tier', 'Legendary');
  });
});

describe('listManaCostBucketCounts', () => {
  it('buckets 0, 1-2, and 3+ separately', async () => {
    const builder = createMockBuilder({
      data: [{ mana_cost: 0 }, { mana_cost: 1 }, { mana_cost: 2 }, { mana_cost: 3 }, { mana_cost: 8 }],
      error: null,
    });
    const client = createMockClient(builder);

    const result = await listManaCostBucketCounts(client, {});

    expect(client.from).toHaveBeenCalledWith('spells');
    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 2 },
      { bucket: '3+', count: 2 },
    ]);
  });

  it('skips null mana_cost values', async () => {
    const builder = createMockBuilder({ data: [{ mana_cost: null }, { mana_cost: 0 }], error: null });
    const client = createMockClient(builder);

    const result = await listManaCostBucketCounts(client, {});

    expect(result).toEqual([
      { bucket: '0', count: 1 },
      { bucket: '1-2', count: 0 },
      { bucket: '3+', count: 0 },
    ]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);
    await expect(listManaCostBucketCounts(client, {})).rejects.toThrow('boom');
  });

  it('excludes manaCostBucket from filters so other buckets still show', async () => {
    const builder = createMockBuilder({ data: [{ mana_cost: 1 }], error: null });
    const client = createMockClient(builder);

    await listManaCostBucketCounts(client, { manaCostBucket: '0' });

    expect(builder.eq).not.toHaveBeenCalledWith('mana_cost', 0);
  });
});
