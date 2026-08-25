import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createMonsterAction } from '../actions';
import { MonsterForm } from '../MonsterForm';
import type { System } from '@/lib/content/types';
import styles from '../FormPage.module.css';

export default async function NewMonsterPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'monsters', {}),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Add a monster</h1>
        <MonsterForm
          action={createMonsterAction}
          systems={(systems ?? []) as System[]}
          sources={sources}
          tags={tagCounts.map((t) => t.tag)}
          error={searchParams.error}
        />
      </div>
    </main>
  );
}
