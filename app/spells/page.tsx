import { createSupabaseClient } from '@/lib/supabase/client';
import { listSpells } from '@/lib/content/spells';
import { getCategoryCounts, listDistinctTags } from '@/lib/content/sidebar';
import { SpellCard } from './SpellCard';
import { SpellFilters } from './SpellFilters';
import { Sidebar } from '../Sidebar';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

export default async function SpellsPage({
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

  const [{ data: systems }, spells, counts, tags] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSpells(client, filters),
    getCategoryCounts(client),
    listDistinctTags(client, 'spells'),
  ]);

  return (
    <main className={styles.page}>
      <h1>Spells</h1>
      <a href="/spells/new">+ Add entry</a>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="spells" />
        <div className={styles.content}>
          <SpellFilters systems={(systems ?? []) as System[]} initial={filters} />
          {spells.length === 0 ? (
            <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
          ) : (
            <div className={styles.grid}>
              {spells.map((spell) => (
                <SpellCard key={spell.id} spell={spell} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
