import { createSupabaseClient } from '@/lib/supabase/client';
import { createRuleAction } from '../actions';
import { RuleForm } from '../RuleForm';
import type { System } from '@/lib/content/types';

export default async function NewRulePage({ searchParams }: { searchParams: { error?: string } }) {
  const client = createSupabaseClient();
  const { data: systems } = await client.from('systems').select('id, name').order('name');

  return (
    <main>
      <h1>Add a rule</h1>
      <RuleForm action={createRuleAction} systems={(systems ?? []) as System[]} error={searchParams.error} />
    </main>
  );
}
