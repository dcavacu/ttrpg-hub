import { createSupabaseClient } from '@/lib/supabase/client';
import { listRules } from '@/lib/content/rules';
import { getCategoryCounts, listTagCounts } from '@/lib/content/sidebar';
import { listFacetCounts } from '@/lib/content/facets';
import { RuleCard } from './RuleCard';
import { RuleFilters } from './RuleFilters';
import { Sidebar } from '../Sidebar';
import { Pagination } from '../content/Pagination';
import { PAGE_SIZE, type ContentFilters, type SourceType, type System } from '@/lib/content/types';
import styles from './page.module.css';

const FILTER_LABELS: Record<string, (value: string, systems: System[]) => string> = {
  search: (value) => `Search: "${value}"`,
  systemId: (value, systems) => systems.find((s) => s.id === value)?.name ?? 'System',
  sourceType: (value) => (value === 'homebrew' ? 'Homebrew' : 'Official'),
  category: (value) => value,
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
    if (next.category) params.set('category', next.category);
    const query = params.toString();
    return query ? `/rules?${query}` : '/rules';
  };

  if (filters.search) chips.push({ key: 'search', label: FILTER_LABELS.search(filters.search, systems), href: build({ search: undefined }) });
  if (filters.systemId) chips.push({ key: 'systemId', label: FILTER_LABELS.systemId(filters.systemId, systems), href: build({ systemId: undefined }) });
  if (filters.sourceType) chips.push({ key: 'sourceType', label: FILTER_LABELS.sourceType(filters.sourceType, systems), href: build({ sourceType: undefined }) });
  if (filters.category) chips.push({ key: 'category', label: FILTER_LABELS.category(filters.category, systems), href: build({ category: undefined }) });
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
  if (filters.category) params.set('category', filters.category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/rules?${query}` : '/rules';
}

export default async function RulesPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    systemId?: string;
    sourceType?: string;
    tags?: string;
    category?: string;
    page?: string;
  };
}) {
  const client = createSupabaseClient();

  const filters: ContentFilters = {
    search: searchParams.search,
    systemId: searchParams.systemId,
    sourceType: searchParams.sourceType as SourceType | undefined,
    tags: searchParams.tags?.split(',').filter(Boolean),
    category: searchParams.category,
  };
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const [{ data: systems }, { items: rules, total }, counts, tags, categoryCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listRules(client, filters, page),
    getCategoryCounts(client),
    listTagCounts(client, 'rules', filters.systemId),
    listFacetCounts(client, 'rules', 'category', filters.systemId),
  ]);

  const systemList = (systems ?? []) as System[];
  const chips = activeFilterChips(filters, systemList);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <main className={styles.page}>
      <h1>Rules</h1>
      <a href="/rules/new">+ Add entry</a>
      <RuleFilters systems={systemList} initial={filters} />
      {chips.length > 0 && (
        <div className={styles.activeFilters}>
          {chips.map((chip) => (
            <a key={chip.key} href={chip.href} className={styles.filterChip}>
              {chip.label} &times;
            </a>
          ))}
          <a href="/rules" className={styles.clearAll}>
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
            { key: 'category', label: 'Category', color: 'var(--cat-rules)', options: categoryCounts.map((c) => ({ value: c.value, label: c.value, count: c.count })) },
          ]}
          initial={filters}
          category="rules"
        />
        <div className={styles.content}>
          {rules.length === 0 ? (
            <div className={styles.empty}>
              <p>Nothing on the shelf matches that search.</p>
              <a href="/rules">Clear filters</a>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {rules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
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
