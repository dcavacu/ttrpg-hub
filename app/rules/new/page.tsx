import { createSupabaseClient } from '@/lib/supabase/client';
import { listSources } from '@/lib/content/sources';
import { listTagCounts } from '@/lib/content/sidebar';
import { createRuleAction } from '../actions';
import { RuleForm } from '../RuleForm';
import type { System } from '@/lib/content/types';

export default async function NewRulePage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const [{ data: systems }, sources, tagCounts] = await Promise.all([
    client.from('systems').select('id, name').order('name'),
    listSources(client),
    listTagCounts(client, 'rules', {}),
  ]);

  return (
    <main>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Add a rule</h1>
      <RuleForm
        action={createRuleAction}
        systems={(systems ?? []) as System[]}
        sources={sources}
        tags={tagCounts.map((t) => t.tag)}
        error={searchParams.error}
      />
    </main>
  );
}
