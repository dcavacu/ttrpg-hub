'use client';

import { useCallback, useEffect, useState } from 'react';

export type FavoriteCategory = 'monsters' | 'items' | 'spells' | 'rules';

const STORAGE_KEY = 'ttrpg-hub-favorites-v1';

export type FavoritesState = Record<FavoriteCategory, string[]>;

function emptyState(): FavoritesState {
  return { monsters: [], items: [], spells: [], rules: [] };
}

function readStorage(): FavoritesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<FavoritesState>;
    return {
      monsters: Array.isArray(parsed.monsters) ? parsed.monsters : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
      spells: Array.isArray(parsed.spells) ? parsed.spells : [],
      rules: Array.isArray(parsed.rules) ? parsed.rules : [],
    };
  } catch {
    return emptyState();
  }
}

function writeStorage(state: FavoritesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable -- favoriting just won't persist this time.
  }
}

/** Per-browser "session prep" list: star a handful of monsters/items/
 * spells/rules before a game, then pull up just those on /favorites.
 * Deliberately localStorage-only, not a DB table -- this is scratch
 * convenience for whoever's browsing on this device, not shared state
 * other players or sessions need to see. */
export function useFavorites(category: FavoriteCategory) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStorage()[category]);
  }, [category]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      const state = readStorage();
      const current = state[category];
      state[category] = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      writeStorage(state);
      setIds(state[category]);
    },
    [category],
  );

  return { isFavorite, toggle };
}

/** Reads the full favorites state once (not reactive) -- used by the
 * /favorites page, which only needs the snapshot at mount to ask the
 * server for those records. */
export function readFavoritesSnapshot(): FavoritesState {
  return readStorage();
}
