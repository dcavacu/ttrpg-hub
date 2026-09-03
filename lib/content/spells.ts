import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import { PAGE_SIZE, type ContentFilters, type PagedResult, type Spell } from './types';

const SPELL_SELECT =
  'id, name, is_homebrew, level, school, mana_cost, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listSpells(
  client: SupabaseClient,
  filters: ContentFilters,
  page = 1,
): Promise<PagedResult<Spell>> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('spells').select(SPELL_SELECT, { count: 'exact' }).order('name').range(from, to) as any,
    filters,
  );
  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list spells: ${error.message}`);
  return { items: (data ?? []) as unknown as Spell[], total: count ?? 0 };
}

export async function getSpellById(client: SupabaseClient, id: string): Promise<Spell | null> {
  const { data, error } = await client.from('spells').select(SPELL_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load spell ${id}: ${error.message}`);
  return (data as unknown as Spell) ?? null;
}

/** For the Favorites page: a batch lookup by id list, in no particular
 * order. Empty input short-circuits rather than sending Supabase an
 * empty .in() filter. */
export async function getSpellsByIds(client: SupabaseClient, ids: string[]): Promise<Spell[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client.from('spells').select(SPELL_SELECT).in('id', ids);
  if (error) throw new Error(`Failed to load spells: ${error.message}`);
  return (data ?? []) as unknown as Spell[];
}

export interface SpellInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  level?: string;
  school?: string | null;
  mana_cost?: number | null;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}

export async function createSpell(client: SupabaseClient, input: SpellInput): Promise<string> {
  const { data, error } = await client.from('spells').insert(input).select('id').single();
  if (error) throw new Error(`Failed to create spell: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateSpell(client: SupabaseClient, id: string, input: SpellInput): Promise<void> {
  const { error } = await client.from('spells').update(input).eq('id', id);
  if (error) throw new Error(`Failed to update spell ${id}: ${error.message}`);
}
