import { createSupabaseClient } from '@/lib/supabase/client';
import { listItems } from '@/lib/content/items';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { listFacetCounts } from '@/lib/content/facets';
import { ItemCard } from './ItemCard';
import { ItemFilters } from './ItemFilters';
import { Sidebar } from '../Sidebar';
import { Pagination } from '../content/Pagination';
import { PAGE_SIZE, type ContentFilters, type SourceType, type System } from '@/lib/content/types';
import styles from './page.module.css';

const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
  itemType: (value) => value,
  rarity: (value) => value,
};

function activeFilterChips(filters: ContentFilters, systems: System[]) {
  const chips: { key: string; label: string; href: string }[] = [];
  const build = (overrides: Partial<ContentFilters>) => {
    const params = new URLSearchParams();
    const next = { ...filters, ...overrides };
    if (next.search) params.set('search', next.search);
    if (next.systemId) params.set('systemId', next.systemId);
    if (next.sourceType) params.set('sourceType', next.sourceType);
    if (next.tags && next.tags.length > 0) params.set('tags', next.tags.join(','));
    if (next.itemType) params.set('itemType', next.itemType);
    if (next.rarity) params.set('rarity', next.rarity);
    const query = params.toString();
    return query ? `/items?${query}` : '/items';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  if (filters.itemType) chips.push({ key: 'itemType', label: FILTER_LABELS.itemType(filters.itemType, systems), href: build({ itemType: undefined }) });
  if (filters.rarity) chips.push({ key: 'rarity', label: FILTER_LABELS.rarity(filters.rarity, systems), href: build({ rarity: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}

function buildPageHref(filters: ContentFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.itemType) params.set('itemType', filters.itemType);
  if (filters.rarity) params.set('rarity', filters.rarity);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/items?${query}` : '/items';
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    systemId?: string;
    sourceType?: string;
    tags?: string;
    itemType?: string;
    rarity?: string;
    page?: string;
  };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
    itemType: searchParams.itemType,
    rarity: searchParams.rarity,
  };
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const [{ data: systems }, { items, total }, counts, tags, itemTypeCounts, rarityCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listItems(client, filters, page),
    getCategoryCounts(client),
    listTagCounts(client, 'items', filters.systemId),
    listFacetCounts(client, 'items', 'item_type', filters.systemId),
    listFacetCounts(client, 'items', 'rarity', filters.systemId),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <main className={styles.page}>
      <h1>Items</h1>
      <a href="/items/new">+ Add entry</a>
      <ItemFilters systems={systemList} initial={filters} />
      {chips.length > 0 && (
        <div className={styles.activeFilters}>
          {chips.map((chip) => (
            <a key={chip.key} href={chip.href} className={styles.filterChip}>
              {chip.label} &times;
            </a>
          ))}
          <a href="/items" className={styles.clearAll}>
            Clear all
          </a>
        </div>
      )}
      <p className={styles.resultsCount}>
        Showing {rangeStart}-{rangeEnd} of {total}
      </p>
      <div className={styles.layout}>
        <Sidebar
          counts={counts}
          tags={tags}
          facets={[
            { key: 'itemType', label: 'Item Type', color: 'var(--cat-items)', options: itemTypeCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
            { key: 'rarity', label: 'Rarity', color: 'var(--cat-items)', options: rarityCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
          ]}
          initial={filters}
          category="items"
        />
        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that search.</p>
              <a href="/items">Clear filters</a>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} buildHref={(p) => buildPageHref(filters, p)} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
