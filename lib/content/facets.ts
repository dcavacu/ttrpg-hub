import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { ContentFilters, ManaCostBucket } from './types';

export interface FacetCount {
  value: string;
  count: number;
}

// excludeKey omits that one field from the filters applied to this count query, so a facet's
// own sidebar still shows every sibling value (and its count under the OTHER active filters)
// instead of collapsing to just the one value already selected for that facet.
export async function listFacetCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  column: string,
  filters: ContentFilters,
  excludeKey?: keyof ContentFilters,
): Promise<FacetCount[]> {
  const scopedFilters = excludeKey ? { ...filters, [excludeKey]: undefined } : filters;
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from(table).select(column) as any,
    scopedFilters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ${table} ${column} counts: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as Record<string, string | null>[]) {
    const value = row[column];
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export interface ManaCostBucketCount {
  bucket: ManaCostBucket;
  count: number;
}

export async function listManaCostBucketCounts(
  client: SupabaseClient,
  filters: ContentFilters,
): Promise<ManaCostBucketCount[]> {
  const scopedFilters: ContentFilters = { ...filters, manaCostBucket: undefined };
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('spells').select('mana_cost') as any,
    scopedFilters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list spell mana cost counts: ${error.message}`);
  const buckets: Record<ManaCostBucket, number> = { '0': 0, '1-2': 0, '3+': 0 };
  for (const row of (data ?? []) as unknown as { mana_cost: number | null }[]) {
    if (row.mana_cost === null || row.mana_cost === undefined) continue;
    if (row.mana_cost === 0) buckets['0'] += 1;
    else if (row.mana_cost <= 2) buckets['1-2'] += 1;
    else buckets['3+'] += 1;
  }
  return (['0', '1-2', '3+'] as const).map((bucket) => ({ bucket, count: buckets[bucket] }));
}
