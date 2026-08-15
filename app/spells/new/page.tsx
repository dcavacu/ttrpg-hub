import { createSupabaseClient } from '@/lib/supabase/client';
import { createSpellAction } from '../actions';
import { SpellForm } from '../SpellForm';
import type { System } from '@/lib/content/types';

export default async function NewSpellPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const { data: systems } = await client.from('systems').select('id, name').order('name');

  return (
    <main>
      <h1>Add a spell</h1>
      <SpellForm action={createSpellAction} systems={(systems ?? []) as System[]} error={searchParams.error} />
    </main>
  );
}
