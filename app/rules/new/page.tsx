import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createRuleAction } from '../actions';
import { RuleForm } from '../RuleForm';
import type { System } from '@/lib/content/types';
import styles from '../FormPage.module.css';

export default async function NewRulePage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'rules', {}),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Add a rule</h1>
        <RuleForm
          action={createRuleAction}
          systems={(systems ?? []) as System[]}
          sources={sources}
          tags={tagCounts.map((t) => t.tag)}
          error={searchParams.error}
        />
      </div>
    </main>
  );
}
