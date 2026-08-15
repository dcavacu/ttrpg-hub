import { createSupabaseClient } from '@/lib/supabase/client';
import { listItems } from '@/lib/content/items';
import { getCategoryCounts, listDistinctTags } from '@/lib/content/sidebar';
import { ItemCard } from './ItemCard';
import { ItemFilters } from './ItemFilters';
import { Sidebar } from '../Sidebar';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

export default async function ItemsPage({
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

  const [{ data: systems }, items, counts, tags] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listItems(client, filters),
    getCategoryCounts(client),
    listDistinctTags(client, 'items'),
  ]);

  return (
    <main className={styles.page}>
      <h1>Items</h1>
      <a href="/items/new">+ Add entry</a>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="items" />
        <div className={styles.content}>
          <ItemFilters systems={(systems ?? []) as System[]} initial={filters} />
          {items.length === 0 ? (
            <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
          ) : (
            <div className={styles.grid}>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
