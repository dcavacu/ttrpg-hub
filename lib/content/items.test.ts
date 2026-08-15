import { listItems, getItemById, createItem, updateItem } from './items';

function createMockBuilder(result: { data: unknown; error: { message: string } | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.ilike = vi.fn(() => builder);
  builder.insert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: typeof result) => unknown) => Promise.resolve(result).then(resolve);
  return builder;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockClient(builder: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  return { from: vi.fn(() => builder) } as any;
}

const sampleRow = {
  id: 'i-1',
  name: 'Sword of Owlbears',
  is_homebrew: false,
  item_type: 'Weapon',
  rarity: 'Rare',
  tags: ['weapon'],
  description: 'A sword shaped like an owlbear.',
  stats: { 'Damage': '1d8' },
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: 'Dungeon Master\'s Guide', is_homebrew: false },
};

describe('listItems', () => {
  it('returns mapped rows on success', async () => {
    const builder = createMockBuilder({ data: [sampleRow], error: null });
    const client = createMockClient(builder);

    const result = await listItems(client, {});

    expect(client.from).toHaveBeenCalledWith('items');
    expect(result).toEqual([sampleRow]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);

    await expect(listItems(client, {})).rejects.toThrow('boom');
  });
});

describe('getItemById', () => {
  it('returns the row when found', async () => {
    const builder = createMockBuilder({ data: sampleRow, error: null });
    const client = createMockClient(builder);

    const result = await getItemById(client, 'i-1');

    expect(builder.eq).toHaveBeenCalledWith('id', 'i-1');
    expect(result).toEqual(sampleRow);
  });

  it('returns null when not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await getItemById(client, 'missing');

    expect(result).toBeNull();
  });
});

const sampleInput = {
  name: 'Sword of Owlbears',
  system_id: 'sys-1',
  source_id: 'src-1',
  is_homebrew: false,
  item_type: 'Weapon',
  rarity: 'Rare',
  tags: ['weapon'],
  description: 'A sword shaped like an owlbear.',
  stats: { 'Damage': '1d8' },
};

describe('createItem', () => {
  it('inserts and returns the new id', async () => {
    const builder = createMockBuilder({ data: { id: 'i-2' }, error: null });
    const client = createMockClient(builder);

    const id = await createItem(client, sampleInput);

    expect(builder.insert).toHaveBeenCalledWith(sampleInput);
    expect(id).toBe('i-2');
  });
});

describe('updateItem', () => {
  it('updates the row by id', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    await updateItem(client, 'i-1', sampleInput);

    expect(builder.update).toHaveBeenCalledWith(sampleInput);
    expect(builder.eq).toHaveBeenCalledWith('id', 'i-1');
  });
});
