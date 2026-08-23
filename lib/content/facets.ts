import type { SupabaseClient } from '@supabase/supabase-js';
import type { ManaCostBucket } from './types';

export interface FacetCount {
  value: string;
  count: number;
}

export async function listFacetCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  column: string,
  systemId?: string,
): Promise<FacetCount[]> {
  let query = client.from(table).select(column);
  if (systemId) query = query.eq('system_id', systemId);
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
  systemId?: string,
): Promise<ManaCostBucketCount[]> {
  let query = client.from('spells').select('mana_cost');
  if (systemId) query = query.eq('system_id', systemId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list spell mana cost counts: ${error.message}`);
  const buckets: Record<ManaCostBucket, number> = { '0': 0, '1-2': 0, '3+': 0 };
  for (const row of (data ?? []) as { mana_cost: number | null }[]) {
    if (row.mana_cost === null || row.mana_cost === undefined) continue;
    if (row.mana_cost === 0) buckets['0'] += 1;
    else if (row.mana_cost <= 2) buckets['1-2'] += 1;
    else buckets['3+'] += 1;
  }
  return (['0', '1-2', '3+'] as const).map((bucket) => ({ bucket, count: buckets[bucket] }));
}
