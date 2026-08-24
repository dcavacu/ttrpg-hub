import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { ContentFilters } from './types';

export interface CategoryCounts {
  monsters: number;
  items: number;
  spells: number;
  rules: number;
}

export async function getCategoryCounts(client: SupabaseClient): Promise<CategoryCounts> {
  const [monsters, items, spells, rules] = await Promise.all([
    client.from('monsters').select('*', { count: 'exact', head: true }),
    client.from('items').select('*', { count: 'exact', head: true }),
    client.from('spells').select('*', { count: 'exact', head: true }),
    client.from('rules').select('*', { count: 'exact', head: true }),
  ]);
  const results = { monsters, items, spells, rules };
  for (const [table, result] of Object.entries(results)) {
    if (result.error) throw new Error(`Failed to count ${table}: ${result.error.message}`);
  }
  return {
    monsters: monsters.count ?? 0,
    items: items.count ?? 0,
    spells: spells.count ?? 0,
    rules: rules.count ?? 0,
  };
}

export interface TagCount {
  tag: string;
  count: number;
}

// tags are excluded from the filters applied here so the list still shows every tag (and its
// count under the OTHER active filters) rather than collapsing to only the tags already selected.
export async function listTagCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  filters: ContentFilters,
): Promise<TagCount[]> {
  const scopedFilters: ContentFilters = { ...filters, tags: undefined };
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from(table).select('tags') as any,
    scopedFilters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ${table} tag counts: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as { tags: string[] }[]) {
    for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
