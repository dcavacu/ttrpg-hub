import { listSpells, getSpellById, createSpell, updateSpell } from './spells';

function createMockBuilder(result: { data: unknown; error: { message: string } | null; count?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const builder: any = {};
  builder.select = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.range = vi.fn(() => builder);
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
  id: 'sp-1',
  name: 'Owlbear Bolt',
  is_homebrew: false,
  level: '3rd',
  tags: ['evocation'],
  description: 'Hurls a bolt shaped like an owlbear claw.',
  stats: { 'Casting Time': '1 action' },
  system: { id: 'sys-1', name: 'D&D 5e' },
  source: { id: 'src-1', name: "Player's Handbook", is_homebrew: false },
};

describe('listSpells', () => {
  it('returns mapped rows and the total count on success', async () => {
    const builder = createMockBuilder({ data: [sampleRow], error: null, count: 1 });
    const client = createMockClient(builder);

    const result = await listSpells(client, {});

    expect(client.from).toHaveBeenCalledWith('spells');
    expect(result).toEqual({ items: [sampleRow], total: 1 });
  });

  it('requests the first page (rows 0-35) by default', async () => {
    const builder = createMockBuilder({ data: [sampleRow], error: null, count: 1 });
    const client = createMockClient(builder);

    await listSpells(client, {});

    expect(builder.range).toHaveBeenCalledWith(0, 35);
  });

  it('throws with the Supabase error message on failure', async () => {
    const builder = createMockBuilder({ data: null, error: { message: 'boom' } });
    const client = createMockClient(builder);

    await expect(listSpells(client, {})).rejects.toThrow('boom');
  });
});

describe('getSpellById', () => {
  it('returns the row when found', async () => {
    const builder = createMockBuilder({ data: sampleRow, error: null });
    const client = createMockClient(builder);

    const result = await getSpellById(client, 'sp-1');

    expect(builder.eq).toHaveBeenCalledWith('id', 'sp-1');
    expect(result).toEqual(sampleRow);
  });

  it('returns null when not found', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    const result = await getSpellById(client, 'missing');

    expect(result).toBeNull();
  });
});

const sampleInput = {
  name: 'Owlbear Bolt',
  system_id: 'sys-1',
  source_id: 'src-1',
  is_homebrew: false,
  level: '3rd',
  tags: ['evocation'],
  description: 'Hurls a bolt shaped like an owlbear claw.',
  stats: { 'Casting Time': '1 action' },
};

describe('createSpell', () => {
  it('inserts and returns the new id', async () => {
    const builder = createMockBuilder({ data: { id: 'sp-2' }, error: null });
    const client = createMockClient(builder);

    const id = await createSpell(client, sampleInput);

    expect(builder.insert).toHaveBeenCalledWith(sampleInput);
    expect(id).toBe('sp-2');
  });
});

describe('updateSpell', () => {
  it('updates the row by id', async () => {
    const builder = createMockBuilder({ data: null, error: null });
    const client = createMockClient(builder);

    await updateSpell(client, 'sp-1', sampleInput);

    expect(builder.update).toHaveBeenCalledWith(sampleInput);
    expect(builder.eq).toHaveBeenCalledWith('id', 'sp-1');
  });
});
