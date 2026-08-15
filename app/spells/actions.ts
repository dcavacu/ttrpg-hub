'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createSpell, updateSpell, type SpellInput } from '@/lib/content/spells';
import { validateSpellInput } from '@/lib/content/validate-spell';
import { readInput } from './read-input';

export async function createSpellAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateSpellInput(input);
  if (errors.length > 0) {
    redirect(`/spells/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  let id: string;
  try {
    id = await createSpell(client, input as SpellInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/spells/new?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/spells/${id}`);
}

export async function updateSpellAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateSpellInput(input);
  if (errors.length > 0) {
    redirect(`/spells/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  try {
    await updateSpell(client, id, input as SpellInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/spells/${id}/edit?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/spells/${id}`);
}
