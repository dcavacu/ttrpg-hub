import { listMonsters, getMonsterById, createMonster, updateMonster } from './monsters';

function createMockBuilder(result: { data: unknown; error: { message: string } | null }) {
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

function createMockClient(builder: any) {
  return { from: vi.fn(() => builder) } as any;
}

const sampleRow = {
  id: 'm-1',
  name: 'Owlbear',
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast'],
  description: 'Half owl, half bear.',
  stats: { 'Armor Class': '13' },
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: 'Monster Manual', is_homebrew: false },
};

describe('listMonsters', () => {
  it('returns mapped rows on success', async () => {
    const builder = createMockBuilder({ data: [sampleRow], error: null });
    const client = createMockClient(builder);

    const result = await listMonsters(client, {});

    expect(client.from).toHaveBeenCalledWith('monsters');
    expect(result).toEqual([sampleRow]);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);

    await expect(listMonsters(client, {})).rejects.toThrow('boom');
  });
});

describe('getMonsterById', () => {
  it('returns the row when found', async () => {
    const builder = createMockBuilder({ data: sampleRow, error: null });
    const client = createMockClient(builder);

    const result = await getMonsterById(client, 'm-1');

    expect(builder.eq).toHaveBeenCalledWith('id', 'm-1');
    expect(result).toEqual(sampleRow);
  });

  it('returns null when not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await getMonsterById(client, 'missing');

    expect(result).toBeNull();
  });
});

const sampleInput = {
  name: 'Owlbear',
  system_id: 'sys-1',
  source_id: 'src-1',
  is_homebrew: false,
  rating_label: 'CR 3',
  tags: ['beast'],
  description: 'Half owl, half bear.',
  stats: { 'Armor Class': '13' },
};

describe('createMonster', () => {
  it('inserts and returns the new id', async () => {
    const builder = createMockBuilder({ data: { id: 'm-2' }, error: null });
    const client = createMockClient(builder);

    const id = await createMonster(client, sampleInput);

    expect(builder.insert).toHaveBeenCalledWith(sampleInput);
    expect(id).toBe('m-2');
  });
});

describe('updateMonster', () => {
  it('updates the row by id', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    await updateMonster(client, 'm-1', sampleInput);

    expect(builder.update).toHaveBeenCalledWith(sampleInput);
    expect(builder.eq).toHaveBeenCalledWith('id', 'm-1');
  });
});
