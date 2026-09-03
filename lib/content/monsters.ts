import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import { PAGE_SIZE, type CombatRole, type ContentFilters, type Monster, type MonsterTier, type PagedResult } from './types';

const MONSTER_SELECT =
  'id, name, is_homebrew, rating_label, combat_role, race, tier, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listMonsters(
  client: SupabaseClient,
  filters: ContentFilters,
  page = 1,
): Promise<PagedResult<Monster>> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('monsters').select(MONSTER_SELECT, { count: 'exact' }).order('name').range(from, to) as any,
    filters,
  );
  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list monsters: ${error.message}`);
  return { items: (data ?? []) as unknown as Monster[], total: count ?? 0 };
}

export async function getMonsterById(client: SupabaseClient, id: string): Promise<Monster | null> {
  const { data, error } = await client.from('monsters').select(MONSTER_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load monster ${id}: ${error.message}`);
  return (data as unknown as Monster) ?? null;
}

/** For the Favorites page: a batch lookup by id list, in no particular
 * order. Empty input short-circuits rather than sending Supabase an
 * empty .in() filter. */
export async function getMonstersByIds(client: SupabaseClient, ids: string[]): Promise<Monster[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client.from('monsters').select(MONSTER_SELECT).in('id', ids);
  if (error) throw new Error(`Failed to load monsters: ${error.message}`);
  return (data ?? []) as unknown as Monster[];
}

export interface LeanMonster {
  id: string;
  name: string;
  ratingLabel: string | null;
  tier: MonsterTier;
  combatRole: CombatRole | null;
  race: string | null;
  hp: string | undefined;
  armor: string | undefined;
  stats: Record<string, string>;
  description: string;
}

/** Every Nimble-system monster, with just the fields the Encounter
 * Builder needs -- including the full stats/description so it can show
 * an in-context preview (abilities, dice, etc.) instead of sending the
 * GM to the monster's own detail page mid-build -- not paginated, since
 * the builder does its own client-side search/filtering over the whole
 * set rather than round-tripping per keystroke. */
export async function listNimbleMonstersLean(client: SupabaseClient): Promise<LeanMonster[]> {
  const { data, error } = await client
    .from('monsters')
    .select('id, name, rating_label, tier, combat_role, race, stats, description, system:systems!inner(name)')
    .eq('system.name', 'Nimble')
    .order('name');
  if (error) throw new Error(`Failed to list Nimble monsters: ${error.message}`);
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      name: string;
      rating_label: string | null;
      tier: MonsterTier;
      combat_role: CombatRole | null;
      race: string | null;
      stats: Record<string, string>;
      description: string;
    };
    return {
      id: r.id,
      name: r.name,
      ratingLabel: r.rating_label,
      tier: r.tier,
      combatRole: r.combat_role,
      race: r.race,
      hp: r.stats?.HP,
      armor: r.stats?.Armor,
      stats: r.stats ?? {},
      description: r.description,
    };
  });
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
