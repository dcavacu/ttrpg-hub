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

export interface TagCount {
  tag: string;
  count: number;
}

export async function listTagCounts(
  client: SupabaseClient,
  table: 'monsters' | 'items' | 'spells' | 'rules',
  systemId?: string,
): Promise<TagCount[]> {
  let query = client.from(table).select('tags');
  if (systemId) query = query.eq('system_id', systemId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ${table} tag counts: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { tags: string[] }[]) {
    for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
