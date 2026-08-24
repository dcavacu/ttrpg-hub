import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createSpellAction } from '../actions';
import { SpellForm } from '../SpellForm';
import type { System } from '@/lib/content/types';

export default async function NewSpellPage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'spells', {}),
  ]);

  return (
    <main>
      <h1>Add a spell</h1>
      <SpellForm
        action={createSpellAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        error={searchParams.error}
      />
    </main>
  );
}
