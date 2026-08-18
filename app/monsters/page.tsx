import { createSupabaseClient } from '@/lib/supabase/client';
import { listMonsters } from '@/lib/content/monsters';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { MonsterCard } from './MonsterCard';
import { MonsterFilters } from './MonsterFilters';
import { Sidebar } from '../Sidebar';
import { RevealGrid } from '../content/RevealGrid';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
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
    const query = params.toString();
    return query ? `/monsters?${query}` : '/monsters';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}

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
    listTagCounts(client, 'monsters', filters.systemId),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);

  return (
    <main className={styles.page}>
      <h1>Monsters</h1>
      <a href="/monsters/new">+ Add entry</a>
      <MonsterFilters systems={systemList} initial={filters} />
      {chips.length > 0 && (
        <div className={styles.activeFilters}>
          {chips.map((chip) => (
            <a key={chip.key} href={chip.href} className={styles.filterChip}>
              {chip.label} &times;
            </a>
          ))}
          <a href="/monsters" className={styles.clearAll}>
            Clear all
          </a>
        </div>
      )}
      <p className={styles.resultsCount}>
        Showing {monsters.length} of {counts.monsters}
      </p>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="monsters" />
        <div className={styles.content}>
          {monsters.length === 0 ? (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that search.</p>
              <a href="/monsters">Clear filters</a>
            </div>
          ) : (
            <RevealGrid gridClassName={styles.grid}>
              {monsters.map((monster) => (
                <MonsterCard key={monster.id} monster={monster} />
              ))}
            </RevealGrid>
          )}
        </div>
      </div>
    </main>
  );
}
