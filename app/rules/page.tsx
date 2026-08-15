import { createSupabaseClient } from '@/lib/supabase/client';
import { listRules } from '@/lib/content/rules';
import { getCategoryCounts, listDistinctTags } from '@/lib/content/sidebar';
import { RuleCard } from './RuleCard';
import { RuleFilters } from './RuleFilters';
import { Sidebar } from '../Sidebar';
import type { ContentFilters, SourceType, System } from '@/lib/content/types';
import styles from './page.module.css';

export default async function RulesPage({
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

  const [{ data: systems }, rules, counts, tags] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listRules(client, filters),
    getCategoryCounts(client),
    listDistinctTags(client, 'rules'),
  ]);

  return (
    <main className={styles.page}>
      <h1>Rules</h1>
      <a href="/rules/new">+ Add entry</a>
      <div className={styles.layout}>
        <Sidebar counts={counts} tags={tags} initial={filters} category="rules" />
        <div className={styles.content}>
          <RuleFilters systems={(systems ?? []) as System[]} initial={filters} />
          {rules.length === 0 ? (
            <p>Nothing on the shelf matches that search. Try clearing a filter.</p>
          ) : (
            <div className={styles.grid}>
              {rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
