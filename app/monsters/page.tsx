import { createSupabaseClient } from '@/lib/supabase/client';
import { listMonsters } from '@/lib/content/monsters';
import { getCategoryCounts, listDistinctTags } from '@/lib/content/sidebar';
import { MonsterCard } from './MonsterCard';
import { MonsterFilters } from './MonsterFilters';
import { Sidebar } from '../Sidebar';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

export default async function MonstersPage({
  searchParams,
}: {
  searchParams: { search?: string; systemId?: string; sourceType?: string; tags?: string };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
  };

  const [{ data: systems }, monsters, counts, tags] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listMonsters(client, filters),
    getCategoryCounts(client),
    listDistinctTags(client, 'monsters'),
  ]);

  return (
    <main className={styles.page}>
      <h1>Monsters</h1>
      <a href="/monsters/new">+ Add entry</a>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="monsters" />
        <div className={styles.content}>
          <MonsterFilters systems={(systems ?? []) as System[]} initial={filters} />
          {monsters.length === 0 ? (
            <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
          ) : (
            <div className={styles.grid}>
              {monsters.map((monster) => (
                <MonsterCard key={monster.id} monster={monster} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
