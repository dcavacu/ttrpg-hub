import { createSupabaseClient } from '@/lib/supabase/client';
import { createItemAction } from '../actions';
import { ItemForm } from '../ItemForm';
import type { System } from '@/lib/content/types';

export default async function NewItemPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const { data: systems } = await client.from('systems').select('id, name').order('name');

  return (
    <main>
      <h1>Add an item</h1>
      <ItemForm action={createItemAction} systems={(systems ?? []) as System[]} error={searchParams.error} />
    </main>
  );
}
