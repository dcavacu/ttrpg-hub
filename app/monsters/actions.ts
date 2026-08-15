'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonster, updateMonster, type MonsterInput } from '@/lib/content/monsters';
import { validateMonsterInput } from '@/lib/content/validate-monster';

function readInput(formData: FormData): Partial<MonsterInput> {
  const sourceId = String(formData.get('source_id') ?? '');
  const isHomebrew = formData.get('is_homebrew') === 'on';
  return {
    name: String(formData.get('name') ?? '').trim(),
    system_id: String(formData.get('system_id') ?? ''),
    source_id: sourceId,
    is_homebrew: isHomebrew,
    rating_label: String(formData.get('rating_label') ?? '') || undefined,
    description: String(formData.get('description') ?? ''),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    stats: {},
  };
}

export async function createMonsterAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();
  const id = await createMonster(client, input as MonsterInput);
  redirect(`/monsters/${id}`);
}

export async function updateMonsterAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateMonsterInput(input);
  if (errors.length > 0) {
    redirect(`/monsters/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();
  await updateMonster(client, id, input as MonsterInput);
  redirect(`/monsters/${id}`);
}
