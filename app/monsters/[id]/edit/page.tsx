import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { updateMonsterAction } from '../../actions';
import { MonsterForm } from '../../MonsterForm';
import type { System } from '@/lib/content/types';
import styles from '../../FormPage.module.css';

export default async function EditMonsterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, params.id);
  if (!monster) notFound();

  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'monsters', {}),
  ]);
  const boundAction = updateMonsterAction.bind(null, params.id);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Edit {monster.name}</h1>
        <MonsterForm
          action={boundAction}
          systems={(systems ?? []) as System[]}
          sources={sources}
          tags={tagCounts.map((t) => t.tag)}
          monster={monster}
          error={searchParams.error}
        />
      </div>
    </main>
  );
}
