import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { ContentFilters, Spell } from './types';

const SPELL_SELECT =
  'id, name, is_homebrew, level, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listSpells(client: SupabaseClient, filters: ContentFilters): Promise<Spell[]> {
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('spells').select(SPELL_SELECT).order('name') as any,
    filters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list spells: ${error.message}`);
  return (data ?? []) as unknown as Spell[];
}

export async function getSpellById(client: SupabaseClient, id: string): Promise<Spell | null> {
  const { data, error } = await client.from('spells').select(SPELL_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load spell ${id}: ${error.message}`);
  return (data as unknown as Spell) ?? null;
}

export interface SpellInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  level?: string;
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
