import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonsterById } from '@/lib/content/monsters';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
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

  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'monsters', {}),
  ]);
  const boundAction = updateMonsterAction.bind(null, params.id);

  return (
    <main>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Edit {monster.name}</h1>
      <MonsterForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        monster={monster}
        error={searchParams.error}
      />
    </main>
  );
}
