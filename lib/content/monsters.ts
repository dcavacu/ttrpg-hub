import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { CombatRole, ContentFilters, Monster, MonsterTier } from './types';

const MONSTER_SELECT =
  'id, name, is_homebrew, rating_label, combat_role, race, tier, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listMonsters(client: SupabaseClient, filters: ContentFilters): Promise<Monster[]> {
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('monsters').select(MONSTER_SELECT).order('name') as any,
    filters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list monsters: ${error.message}`);
  return (data ?? []) as unknown as Monster[];
}

export async function getMonsterById(client: SupabaseClient, id: string): Promise<Monster | null> {
  const { data, error } = await client.from('monsters').select(MONSTER_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load monster ${id}: ${error.message}`);
  return (data as unknown as Monster) ?? null;
}

export interface MonsterInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  rating_label?: string;
  combat_role?: CombatRole | null;
  race?: string | null;
  tier?: MonsterTier;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}

export async function createMonster(client: SupabaseClient, input: MonsterInput): Promise<string> {
  const { data, error } = await client.from('monsters').insert(input).select('id').single();
  if (error) throw new Error(`Failed to create monster: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateMonster(client: SupabaseClient, id: string, input: MonsterInput): Promise<void> {
  const { error } = await client.from('monsters').update(input).eq('id', id);
  if (error) throw new Error(`Failed to update monster ${id}: ${error.message}`);
}
