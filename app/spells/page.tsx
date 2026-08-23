import { createSupabaseClient } from '@/lib/supabase/client';
import { listSpells } from '@/lib/content/spells';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { listFacetCounts, listManaCostBucketCounts } from '@/lib/content/facets';
import { SpellCard } from './SpellCard';
import { SpellFilters } from './SpellFilters';
import { Sidebar } from '../Sidebar';
import { RevealGrid } from '../content/RevealGrid';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
  school: (value) => value,
  manaCostBucket: (value) => `Mana: ${value}`,
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
    if (next.school) params.set('school', next.school);
    if (next.manaCostBucket) params.set('manaCostBucket', next.manaCostBucket);
    const query = params.toString();
    return query ? `/spells?${query}` : '/spells';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  if (filters.school) chips.push({ key: 'school', label: FILTER_LABELS.school(filters.school, systems), href: build({ school: undefined }) });
  if (filters.manaCostBucket) chips.push({ key: 'manaCostBucket', label: FILTER_LABELS.manaCostBucket(filters.manaCostBucket, systems), href: build({ manaCostBucket: undefined }) });
  for (const tag of filters.tags ?? []) {
    chips.push({ key: `tag-${tag}`, label: tag, href: build({ tags: (filters.tags ?? []).filter((t) => t !== tag) }) });
  }
  return chips;
}

export default async function SpellsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    systemId?: string;
    sourceType?: string;
    tags?: string;
    school?: string;
    manaCostBucket?: string;
  };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
    school: searchParams.school,
    manaCostBucket: searchParams.manaCostBucket as ContentFilters['manaCostBucket'],
  };

  const [{ data: systems }, spells, counts, tags, schoolCounts, manaCostCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSpells(client, filters),
    getCategoryCounts(client),
    listTagCounts(client, 'spells', filters.systemId),
    listFacetCounts(client, 'spells', 'school', filters.systemId),
    listManaCostBucketCounts(client, filters.systemId),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);

  return (
    <main className={styles.page}>
      <h1>Spells</h1>
      <a href="/spells/new">+ Add entry</a>
      <SpellFilters systems={systemList} initial={filters} />
      {chips.length > 0 && (
        <div className={styles.activeFilters}>
          {chips.map((chip) => (
            <a key={chip.key} href={chip.href} className={styles.filterChip}>
              {chip.label} &times;
            </a>
          ))}
          <a href="/spells" className={styles.clearAll}>
            Clear all
          </a>
        </div>
      )}
      <p className={styles.resultsCount}>
        Showing {spells.length} of {counts.spells}
      </p>
      <div className={styles.layout}>
        <Sidebar
          counts={counts}
          tags={tags}
          facets={[
            { key: 'school', label: 'School', color: 'var(--cat-spells)', options: schoolCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
            { key: 'manaCostBucket', label: 'Mana Cost', color: 'var(--cat-spells)', options: manaCostCounts.filter((c) => c.count > 0).map((c) => ({ value: c.bucket, label: c.bucket, count: c.count })) },
          ]}
          initial={filters}
          category="spells"
        />
        <div className={styles.content}>
          {spells.length === 0 ? (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that search.</p>
              <a href="/spells">Clear filters</a>
            </div>
          ) : (
            <RevealGrid gridClassName={styles.grid}>
              {spells.map((spell) => (
                <SpellCard key={spell.id} spell={spell} />
              ))}
            </RevealGrid>
          )}
        </div>
      </div>
    </main>
  );
}
