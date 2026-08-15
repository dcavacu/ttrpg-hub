import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getSpellById } from '@/lib/content/spells';
import { updateSpellAction } from '../../actions';
import { SpellForm } from '../../SpellForm';
import type { System } from '@/lib/content/types';

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

  const { data: systems } = await client.from('systems').select('id, name').order('name');
  const boundAction = updateSpellAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {spell.name}</h1>
      <SpellForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        spell={spell}
        error={searchParams.error}
      />
    </main>
  );
}
