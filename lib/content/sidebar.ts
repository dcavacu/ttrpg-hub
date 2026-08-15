import type { SupabaseClient } from '@supabase/supabase-js';

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

export async function listDistinctTags(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
): Promise<string[]> {
  const { data, error } = await client.from(table).select('tags');
  if (error) throw new Error(`Failed to list ${table} tags: ${error.message}`);
  const tagSet = new Set<string>();
  for (const row of (data ?? []) as { tags: string[] }[]) {
    for (const tag of row.tags ?? []) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}
