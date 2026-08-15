import type { ContentFilters } from './types';

export interface FilterableQuery {
  eq(column: string, value: unknown): FilterableQuery;
  ilike(column: string, pattern: string): FilterableQuery;
  overlaps(column: string, value: unknown[]): FilterableQuery;
}

export function applyContentFilters<Q extends FilterableQuery>(query: Q, filters: ContentFilters): Q {
  let result: FilterableQuery = query;
  if (filters.systemId) {
    result = result.eq('system_id', filters.systemId);
  }
  if (filters.sourceType) {
    result = result.eq('is_homebrew', filters.sourceType === 'homebrew');
  }
  if (filters.search) {
    result = result.ilike('name', `%${filters.search}%`);
  }
  if (filters.tags && filters.tags.length > 0) {
    result = result.overlaps('tags', filters.tags);
  }
  return result as Q;
}
