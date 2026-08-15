import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getItemById } from '@/lib/content/items';
import { updateItemAction } from '../../actions';
import { ItemForm } from '../../ItemForm';
import type { System } from '@/lib/content/types';

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

  const { data: systems } = await client.from('systems').select('id, name').order('name');
  const boundAction = updateItemAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {item.name}</h1>
      <ItemForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        item={item}
        error={searchParams.error}
      />
    </main>
  );
}
