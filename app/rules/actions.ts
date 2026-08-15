'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createRule, updateRule, type RuleInput } from '@/lib/content/rules';
import { validateRuleInput } from '@/lib/content/validate-rule';
import { readInput } from './read-input';

export async function createRuleAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateRuleInput(input);
  if (errors.length > 0) {
    redirect(`/rules/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  let id: string;
  try {
    id = await createRule(client, input as RuleInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/rules/new?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/rules/${id}`);
}

export async function updateRuleAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateRuleInput(input);
  if (errors.length > 0) {
    redirect(`/rules/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  try {
    await updateRule(client, id, input as RuleInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/rules/${id}/edit?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/rules/${id}`);
}
