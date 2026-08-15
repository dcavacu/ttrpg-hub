import { applyContentFilters, type FilterableQuery } from './filters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
function createMockQuery(): FilterableQuery & { eq: any; ilike: any } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- minimal mock double, real typing adds no value here
  const query: any = {};
  query.eq = vi.fn(() => query);
  query.ilike = vi.fn(() => query);
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
  });

  it('combines multiple filters', () => {
    const query = createMockQuery();
    applyContentFilters(query, { systemId: 'sys-123', sourceType: 'homebrew', search: 'owl' });
    expect(query.eq).toHaveBeenCalledWith('system_id', 'sys-123');
    expect(query.eq).toHaveBeenCalledWith('is_homebrew', true);
    expect(query.ilike).toHaveBeenCalledWith('name', '%owl%');
  });
});
