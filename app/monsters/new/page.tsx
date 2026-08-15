import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonsterAction } from '../actions';
import { MonsterForm } from '../MonsterForm';
import type { System } from '@/lib/content/types';

export default async function NewMonsterPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const { data: systems } = await client.from('systems').select('id, name').order('name');

  return (
    <main>
      <h1>Add a monster</h1>
      <MonsterForm action={createMonsterAction} systems={(systems ?? []) as System[]} error={searchParams.error} />
    </main>
  );
}
