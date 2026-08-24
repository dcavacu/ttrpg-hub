import { applyContentFilters, type FilterableQuery } from './filters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockQuery(): FilterableQuery & { eq: any; ilike: any; contains: any; gte: any; lte: any } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const query: any = {};
  query.eq = vi.fn(() => query);
  query.ilike = vi.fn(() => query);
  query.contains = vi.fn(() => query);
  query.gte = vi.fn(() => query);
  query.lte = vi.fn(() => query);
  return query;
}

describe('applyContentFilters', () => {
  it('filters by system id when provided', () => {
    const query = createMockQuery();
    applyContentFilters(query, { systemId: 'sys-123' });
    expect(query.eq).toHaveBeenCalledWith('system_id', 'sys-123');
  });

  it('filters by is_homebrew=true for sourceType homebrew', () => {
    const query = createMockQuery();
    applyContentFilters(query, { sourceType: 'homebrew' });
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', true);
  });

  it('filters by is_homebrew=false for sourceType official', () => {
    const query = createMockQuery();
    applyContentFilters(query, { sourceType: 'official' });
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', false);
  });

  it('applies a case-insensitive name search', () => {
    const query = createMockQuery();
    applyContentFilters(query, { search: 'owl' });
    expect(query.ilike).toHaveBeenCalledWith('name', '%owl%');
  });

  it('applies no filters when none are given', () => {
    const query = createMockQuery();
    applyContentFilters(query, {});
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.ilike).not.toHaveBeenCalled();
    expect(query.contains).not.toHaveBeenCalled();
  });

  it('filters by a single tag', () => {
    const query = createMockQuery();
    applyContentFilters(query, { tags: ['Dragon'] });
    expect(query.contains).toHaveBeenCalledWith('tags', ['Dragon']);
  });

  it('filters by multiple tags', () => {
    const query = createMockQuery();
    applyContentFilters(query, { tags: ['Dragon', 'Beast'] });
    expect(query.contains).toHaveBeenCalledWith('tags', ['Dragon', 'Beast']);
  });

  it('does not call contains when tags is an empty array', () => {
    const query = createMockQuery();
    applyContentFilters(query, { tags: [] });
    expect(query.contains).not.toHaveBeenCalled();
  });

  it('combines multiple filters', () => {
    const query = createMockQuery();
    applyContentFilters(query, {
      systemId: 'sys-123',
      sourceType: 'homebrew',
      search: 'owl',
      tags: ['Dragon', 'Beast'],
    });
    expect(query.eq).toHaveBeenCalledWith('system_id', 'sys-123');
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', true);
    expect(query.ilike).toHaveBeenCalledWith('name', '%owl%');
    expect(query.contains).toHaveBeenCalledWith('tags', ['Dragon', 'Beast']);
  });
});

describe('applyContentFilters — new facets', () => {
  it('filters by combatRole', () => {
    const query = createMockQuery();
    applyContentFilters(query, { combatRole: 'Melee' });
    expect(query.eq).toHaveBeenCalledWith('combat_role', 'Melee');
  });

  it('filters by race', () => {
    const query = createMockQuery();
    applyContentFilters(query, { race: 'Dragon' });
    expect(query.eq).toHaveBeenCalledWith('race', 'Dragon');
  });

  it('filters by tier', () => {
    const query = createMockQuery();
    applyContentFilters(query, { tier: 'Legendary' });
    expect(query.eq).toHaveBeenCalledWith('tier', 'Legendary');
  });

  it('filters by itemType', () => {
    const query = createMockQuery();
    applyContentFilters(query, { itemType: 'Weapon' });
    expect(query.eq).toHaveBeenCalledWith('item_type', 'Weapon');
  });

  it('filters by rarity', () => {
    const query = createMockQuery();
    applyContentFilters(query, { rarity: 'Rare' });
    expect(query.eq).toHaveBeenCalledWith('rarity', 'Rare');
  });

  it('filters by school', () => {
    const query = createMockQuery();
    applyContentFilters(query, { school: 'Fire' });
    expect(query.eq).toHaveBeenCalledWith('school', 'Fire');
  });

  it('filters by category', () => {
    const query = createMockQuery();
    applyContentFilters(query, { category: 'Combat' });
    expect(query.eq).toHaveBeenCalledWith('category', 'Combat');
  });

  it('filters manaCostBucket "0" as an equality check', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '0' });
    expect(query.eq).toHaveBeenCalledWith('mana_cost', 0);
  });

  it('filters manaCostBucket "1-2" as a gte/lte range', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '1-2' });
    expect(query.gte).toHaveBeenCalledWith('mana_cost', 1);
    expect(query.lte).toHaveBeenCalledWith('mana_cost', 2);
  });

  it('filters manaCostBucket "3+" as a gte-only range', () => {
    const query = createMockQuery();
    applyContentFilters(query, { manaCostBucket: '3+' });
    expect(query.gte).toHaveBeenCalledWith('mana_cost', 3);
    expect(query.lte).not.toHaveBeenCalled();
  });
});
