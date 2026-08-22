import type { MonsterTier } from '../lib/content/types';

export function deriveMonsterTier(name: string, tags: string[]): MonsterTier {
  if (tags.includes('Legendary')) return 'Legendary';
  if (name.endsWith(' Minion')) return 'Minion';
  return 'Normal';
}

const EXACT_MATCH_RACES = new Set([
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
  'Giant Bug',
]);

const EXACT_MATCH_RACES_LOWER = new Map(Array.from(EXACT_MATCH_RACES).map((race) => [race.toLowerCase(), race]));

export function deriveMonsterRaceFromTags(tags: string[]): string | undefined {
  const exact = tags.find((tag) => EXACT_MATCH_RACES.has(tag));
  if (exact) return exact;
  // Open5e's `type` field (mapped straight into tags by open5e-mapper.ts) is lowercase
  // ("beast", "humanoid", ...) — this handles that case without a second pass.
  if (tags.length === 1) {
    const lower = tags[0].toLowerCase();
    if (EXACT_MATCH_RACES_LOWER.has(lower)) return EXACT_MATCH_RACES_LOWER.get(lower);
  }
  return undefined;
}

const ELEMENTAL_SCHOOLS = new Set(['Fire', 'Ice', 'Lightning', 'Wind', 'Radiant', 'Necrotic']);

export function deriveSpellSchoolFromTags(tags: string[]): string | undefined {
  return tags.find((tag) => ELEMENTAL_SCHOOLS.has(tag));
}
