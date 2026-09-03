import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import { PAGE_SIZE, type ContentFilters, type Item, type PagedResult } from './types';

const ITEM_SELECT =
  'id, name, is_homebrew, item_type, rarity, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listItems(
  client: SupabaseClient,
  filters: ContentFilters,
  page = 1,
): Promise<PagedResult<Item>> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('items').select(ITEM_SELECT, { count: 'exact' }).order('name').range(from, to) as any,
    filters,
  );
  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list items: ${error.message}`);
  return { items: (data ?? []) as unknown as Item[], total: count ?? 0 };
}

export async function getItemById(client: SupabaseClient, id: string): Promise<Item | null> {
  const { data, error } = await client.from('items').select(ITEM_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load item ${id}: ${error.message}`);
  return (data as unknown as Item) ?? null;
}

/** For the Favorites page: a batch lookup by id list, in no particular
 * order (the caller re-sorts to match the caller's own id order if it
 * matters). Empty input short-circuits rather than sending Supabase an
 * empty .in() filter. */
export async function getItemsByIds(client: SupabaseClient, ids: string[]): Promise<Item[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client.from('items').select(ITEM_SELECT).in('id', ids);
  if (error) throw new Error(`Failed to load items: ${error.message}`);
  return (data ?? []) as unknown as Item[];
}

export interface ItemInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  item_type?: string;
  rarity?: string;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}

export async function createItem(client: SupabaseClient, input: ItemInput): Promise<string> {
  const { data, error } = await client.from('items').insert(input).select('id').single();
  if (error) throw new Error(`Failed to create item: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateItem(client: SupabaseClient, id: string, input: ItemInput): Promise<void> {
  const { error } = await client.from('items').update(input).eq('id', id);
  if (error) throw new Error(`Failed to update item ${id}: ${error.message}`);
}
