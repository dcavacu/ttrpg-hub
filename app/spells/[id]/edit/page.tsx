import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getSpellById } from '@/lib/content/spells';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { updateSpellAction } from '../../actions';
import { SpellForm } from '../../SpellForm';
import type { System } from '@/lib/content/types';
import styles from '../../FormPage.module.css';

export default async function EditSpellPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const client = createSupabaseClient();
  const spell = await getSpellById(client, params.id);
  if (!spell) notFound();

  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'spells', {}),
  ]);
  const boundAction = updateSpellAction.bind(null, params.id);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Edit {spell.name}</h1>
        <SpellForm
          action={boundAction}
          systems={(systems ?? []) as System[]}
          sources={sources}
          tags={tagCounts.map((t) => t.tag)}
          spell={spell}
          error={searchParams.error}
        />
      </div>
    </main>
  );
}
