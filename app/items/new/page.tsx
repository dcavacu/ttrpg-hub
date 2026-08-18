import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createItemAction } from '../actions';
import { ItemForm } from '../ItemForm';
import type { System } from '@/lib/content/types';

export default async function NewItemPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'items'),
  ]);

  return (
    <main>
      <h1>Add an item</h1>
      <ItemForm
        action={createItemAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        error={searchParams.error}
      />
    </main>
  );
}
