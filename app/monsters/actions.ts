'use server';

import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { createMonster, updateMonster, getMonsterById, type MonsterInput } from '@/lib/content/monsters';
import { validateMonsterInput } from '@/lib/content/validate-monster';
import { previewRescale, applyRescaleToStats } from '@/lib/content/monsterScaling';
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

/** Recalculates HP (and Armor, for a legendary monster bumped up from
 * unarmored) for a target level, per the Game Master Guide's monster-
 * builder tables, and saves it -- leaving name/description/tags/etc.
 * untouched. HP is scaled relative to the monster's own current HP
 * (see previewRescale), not snapped to the table's flat value, so a
 * hand-tuned monster keeps its relative strength as it moves levels.
 * Ability/attack damage written into the description is not rewritten
 * (it's free-form prose, not a structured field); the client shows the
 * level's reference damage numbers so the player can apply them by hand
 * via the normal edit form. */
export async function rescaleMonsterAction(id: string, formData: FormData) {
  const targetLevelLabel = String(formData.get('targetLevel') ?? '').trim();
  const client = createSupabaseClient();
  const monster = await getMonsterById(client, id);
  if (!monster) {
    redirect(`/monsters/${id}?error=${encodeURIComponent('Monster not found.')}`);
  }

  const preview = previewRescale(
    monster.tier,
    monster.stats.Armor,
    monster.rating_label,
    targetLevelLabel,
    monster.stats.HP,
  );
  if (!preview) {
    redirect(`/monsters/${id}?error=${encodeURIComponent('Could not rescale to that level.')}`);
  }

  try {
    await updateMonster(client, id, {
      name: monster.name,
      system_id: monster.system.id,
      source_id: monster.source.id,
      is_homebrew: monster.is_homebrew,
      rating_label: preview.ratingLabel,
      combat_role: monster.combat_role,
      race: monster.race,
      tier: monster.tier,
      tags: monster.tags,
      description: monster.description,
      stats: applyRescaleToStats(monster.stats, preview),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/monsters/${id}?error=${encodeURIComponent(`Could not rescale: ${message}`)}`);
  }
  redirect(`/monsters/${id}`);
}
