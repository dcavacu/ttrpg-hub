import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getRuleById } from '@/lib/content/rules';
import { updateRuleAction } from '../../actions';
import { RuleForm } from '../../RuleForm';
import type { System } from '@/lib/content/types';

export default async function EditRulePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const client = createSupabaseClient();
  const rule = await getRuleById(client, params.id);
  if (!rule) notFound();

  const { data: systems } = await client.from('systems').select('id, name').order('name');
  const boundAction = updateRuleAction.bind(null, params.id);

  return (
    <main>
      <h1>Edit {rule.name}</h1>
      <RuleForm
        action={boundAction}
        systems={(systems ?? []) as System[]}
        rule={rule}
        error={searchParams.error}
      />
    </main>
  );
}
