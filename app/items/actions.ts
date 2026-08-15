'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createItem, updateItem, type ItemInput } from '@/lib/content/items';
import { validateItemInput } from '@/lib/content/validate-item';
import { readInput } from './read-input';

export async function createItemAction(formData: FormData) {
  const input = readInput(formData);
  const errors = validateItemInput(input);
  if (errors.length > 0) {
    redirect(`/items/new?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  let id: string;
  try {
    id = await createItem(client, input as ItemInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/items/new?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/items/${id}`);
}

export async function updateItemAction(id: string, formData: FormData) {
  const input = readInput(formData);
  const errors = validateItemInput(input);
  if (errors.length > 0) {
    redirect(`/items/${id}/edit?error=${encodeURIComponent(errors.join(' '))}`);
  }
  const client = createSupabaseClient();

  try {
    await updateItem(client, id, input as ItemInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/items/${id}/edit?error=${encodeURIComponent(`Could not save: ${message}`)}`);
  }
  redirect(`/items/${id}`);
}
