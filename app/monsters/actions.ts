'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonster, updateMonster, type MonsterInput } from '@/lib/content/monsters';
import { validateMonsterInput } from '@/lib/content/validate-monster';
import { readInput } from './read-input';

export async function createMonsterAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  let id: string;
  try {
    id = await createMonster(client, input as MonsterInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/monsters/new?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/monsters/${id}`);
}

export async function updateMonsterAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  try {
    await updateMonster(client, id, input as MonsterInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/monsters/${id}/edit?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/monsters/${id}`);
}
