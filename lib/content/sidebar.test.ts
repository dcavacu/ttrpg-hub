import { getCategoryCounts, listDistinctTags } from './sidebar';

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

describe('listDistinctTags', () => {
  it('returns deduplicated, sorted tags', async () => {
    const client = createMockClient({
      monsters: {
        data: [{ tags: ['Dragon', 'Beast'] }, { tags: ['Dragon', 'Aberration'] }],
        error: null,
      },
    });

    const result = await listDistinctTags(client, 'monsters');

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual(['Aberration', 'Beast', 'Dragon']);
  });

  it('returns an empty array when there is no data', async () => {
    const client = createMockClient({
      monsters: { data: [], error: null },
    });

    const result = await listDistinctTags(client, 'monsters');

    expect(result).toEqual([]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const client = createMockClient({
      monsters: { data: null, error: { message: 'boom' } },
    });

    await expect(listDistinctTags(client, 'monsters')).rejects.toThrow('boom');
  });

  it('works against a different table name', async () => {
    const client = createMockClient({
      items: {
        data: [{ tags: ['Weapon'] }, { tags: ['Weapon', 'Magic'] }],
        error: null,
      },
    });

    const result = await listDistinctTags(client, 'items');

    expect(client.from).toHaveBeenCalledWith('items');
    expect(result).toEqual(['Magic', 'Weapon']);
  });
});
