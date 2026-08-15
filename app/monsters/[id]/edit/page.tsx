import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { updateMonsterAction } from '../../actions';
import { MonsterForm } from '../../MonsterForm';
import type { System } from '@/lib/content/types';

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

  const { data: systems } = await client.from('systems').select('id, name').order('name');
  const boundAction = updateMonsterAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {monster.name}</h1>
      <MonsterForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        monster={monster}
        error={searchParams.error}
      />
    </main>
  );
}
