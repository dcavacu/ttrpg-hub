import type { SupabaseClient } from '@supabase/supabase-js';
import { applyContentFilters } from './filters';
import type { ContentFilters, Rule } from './types';

const RULE_SELECT =
  'id, name, is_homebrew, category, tags, description, stats, system:systems(id,name), source:sources(id,name,is_homebrew)';

export async function listRules(client: SupabaseClient, filters: ContentFilters): Promise<Rule[]> {
  const query = applyContentFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase's query builder type doesn't structurally match FilterableQuery's generic constraint
    client.from('rules').select(RULE_SELECT).order('name') as any,
    filters,
  );
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list rules: ${error.message}`);
  return (data ?? []) as unknown as Rule[];
}

export async function getRuleById(client: SupabaseClient, id: string): Promise<Rule | null> {
  const { data, error } = await client.from('rules').select(RULE_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load rule ${id}: ${error.message}`);
  return (data as unknown as Rule) ?? null;
}

export interface RuleInput {
  name: string;
  system_id: string;
  source_id: string;
  is_homebrew: boolean;
  category?: string;
  tags?: string[];
  description?: string;
  stats?: Record<string, string>;
}

export async function createRule(client: SupabaseClient, input: RuleInput): Promise<string> {
  const { data, error } = await client.from('rules').insert(input).select('id').single();
  if (error) throw new Error(`Failed to create rule: ${error.message}`);
  return (data as { id: string }).id;
}

export async function updateRule(client: SupabaseClient, id: string, input: RuleInput): Promise<void> {
  const { error } = await client.from('rules').update(input).eq('id', id);
  if (error) throw new Error(`Failed to update rule ${id}: ${error.message}`);
}
