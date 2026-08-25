import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getItemById } from '@/lib/content/items';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { updateItemAction } from '../../actions';
import { ItemForm } from '../../ItemForm';
import type { System } from '@/lib/content/types';
import styles from '../../FormPage.module.css';

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const client = createSupabaseClient();
  const item = await getItemById(client, params.id);
  if (!item) notFound();

  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'items', {}),
  ]);
  const boundAction = updateItemAction.bind(null, params.id);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Edit {item.name}</h1>
        <ItemForm
          action={boundAction}
          systems={(systems ?? []) as System[]}
          sources={sources}
          tags={tagCounts.map((t) => t.tag)}
          item={item}
          error={searchParams.error}
        />
      </div>
    </main>
  );
}
