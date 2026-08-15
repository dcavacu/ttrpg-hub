import { createSupabaseClient } from '@/lib/supabase/client';
import { listMonsters } from '@/lib/content/monsters';
import { MonsterCard } from './MonsterCard';
import { MonsterFilters } from './MonsterFilters';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';

export default async function MonstersPage({
  searchParams,
}: {
  searchParams: { search?: string; systemId?: string; sourceType?: string };
}) {
  const client = createSupabaseClient();

  const { data: systems } = await client.from('systems').select('id, name').order('name');

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
  };

  const monsters = await listMonsters(client, filters);

  return (
    <main>
      <h1>Monsters</h1>
      <a href="/monsters/new">+ Add entry</a>
      <MonsterFilters systems={(systems ?? []) as System[]} initial={filters} />
      {monsters.length === 0 ? (
        <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
      ) : (
        <div>
          {monsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}
        </div>
      )}
    </main>
  );
}
