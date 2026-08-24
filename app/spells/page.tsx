import { createSupabaseClient } from '@/lib/supabase/client';
import { listSpells } from '@/lib/content/spells';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { listFacetCounts, listManaCostBucketCounts } from '@/lib/content/facets';
import { SpellCard } from './SpellCard';
import { SpellFilters } from './SpellFilters';
import { Sidebar } from '../Sidebar';
import { Pagination } from '../content/Pagination';
import { PAGE_SIZE, type ContentFilters, type SourceType, type System } from '@/lib/content/types';
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

function buildPageHref(filters: ContentFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.systemId) params.set('systemId', filters.systemId);
  if (filters.sourceType) params.set('sourceType', filters.sourceType);
  if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
  if (filters.school) params.set('school', filters.school);
  if (filters.manaCostBucket) params.set('manaCostBucket', filters.manaCostBucket);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/spells?${query}` : '/spells';
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
    page?: string;
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
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const [{ data: systems }, { items: spells, total }, counts, tags, schoolCounts, manaCostCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSpells(client, filters, page),
    getCategoryCounts(client),
    listTagCounts(client, 'spells', filters),
    listFacetCounts(client, 'spells', 'school', filters, 'school'),
    listManaCostBucketCounts(client, filters),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

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
        Showing {rangeStart}-{rangeEnd} of {total}
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
            <>
              <div className={styles.grid}>
                {spells.map((spell) => (
                  <SpellCard key={spell.id} spell={spell} />
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
