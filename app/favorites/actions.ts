'use server';

import { createSupabaseClient } from '@/lib/supabase/client';
import { getMonstersByIds } from '@/lib/content/monsters';
import { getItemsByIds } from '@/lib/content/items';
import { getSpellsByIds } from '@/lib/content/spells';
import { getRulesByIds } from '@/lib/content/rules';
import type { Monster, Item, Spell, Rule } from '@/lib/content/types';

export interface FavoritedContent {
  monsters: Monster[];
  items: Item[];
  spells: Spell[];
  rules: Rule[];
}

/** The Favorites page's list of ids lives in the browser's localStorage
 * (see useFavorites) -- there's nothing to look up server-side until the
 * client tells us which ids it has starred. This is that lookup. */
export async function getFavoritedContent(ids: {
  monsters: string[];
  items: string[];
  spells: string[];
  rules: string[];
}): Promise<FavoritedContent> {
  const client = createSupabaseClient();
  const [monsters, items, spells, rules] = await Promise.all([
    getMonstersByIds(client, ids.monsters),
    getItemsByIds(client, ids.items),
    getSpellsByIds(client, ids.spells),
    getRulesByIds(client, ids.rules),
  ]);
  return { monsters, items, spells, rules };
}
