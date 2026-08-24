import type { ContentFilters } from './types';

export interface FilterableQuery {
  eq(column: string, value: unknown): FilterableQuery;
  ilike(column: string, pattern: string): FilterableQuery;
  contains(column: string, value: unknown[]): FilterableQuery;
  gte(column: string, value: unknown): FilterableQuery;
  lte(column: string, value: unknown): FilterableQuery;
}

function applyManaCostBucket(query: FilterableQuery, bucket: ContentFilters['manaCostBucket']): FilterableQuery {
  if (bucket === '0') return query.eq('mana_cost', 0);
  if (bucket === '1-2') return query.gte('mana_cost', 1).lte('mana_cost', 2);
  if (bucket === '3+') return query.gte('mana_cost', 3);
  return query;
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
    // contains (Postgres @>) requires every selected tag to be present — an AND across tags,
    // not overlaps' (&&) OR-across-tags "any of these" semantics.
    result = result.contains('tags', filters.tags);
  }
  if (filters.combatRole) {
    result = result.eq('combat_role', filters.combatRole);
  }
  if (filters.race) {
    result = result.eq('race', filters.race);
  }
  if (filters.tier) {
    result = result.eq('tier', filters.tier);
  }
  if (filters.itemType) {
    result = result.eq('item_type', filters.itemType);
  }
  if (filters.rarity) {
    result = result.eq('rarity', filters.rarity);
  }
  if (filters.school) {
    result = result.eq('school', filters.school);
  }
  if (filters.category) {
    result = result.eq('category', filters.category);
  }
  if (filters.manaCostBucket) {
    result = applyManaCostBucket(result, filters.manaCostBucket);
  }
  return result as Q;
}
