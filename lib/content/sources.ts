import type { SupabaseClient } from '@supabase/supabase-js';

export interface SourceOption {
  id: string;
  name: string;
  is_homebrew: boolean;
  systemName: string;
}

interface SourceRow {
  id: string;
  name: string;
  is_homebrew: boolean;
  system: { name: string } | null;
}

export async function listSources(client: SupabaseClient): Promise<SourceOption[]> {
  const { data, error } = await client
    .from('sources')
    .select('id, name, is_homebrew, system:systems(name)')
    .order('name');
  if (error) throw new Error(`Failed to list sources: ${error.message}`);
  return ((data ?? []) as unknown as SourceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    is_homebrew: row.is_homebrew,
    systemName: row.system?.name ?? 'Unknown system',
  }));
}
