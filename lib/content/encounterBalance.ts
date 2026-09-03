/**
 * Encounter-balance math from the Game Master Guide's "Monster Levels"
 * section (p.26): sum the levels of the heroes, sum the levels of the
 * monsters, and the ratio between them gives a difficulty rating. Also
 * "Suggested minion die size by party level" from the same page.
 */

export type EncounterDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Deadly' | 'Very Deadly';

/**
 * The book's own bands overlap a little at their edges in prose ("Hard...
 * equal to the heroes'", "Deadly...100-125%"), since it's guidance, not a
 * spec. This resolves that into clean, non-overlapping, monotonic bands
 * that still match its one fully worked example (6 level-4 heroes vs a
 * level-24-total flock of monsters, ratio exactly 1.0, called "hard"):
 *
 *   < 50%        Easy
 *   50% - <100%  Medium
 *   100% - <125% Hard
 *   125% - <150% Deadly
 *   >= 150%      Very Deadly
 */
export function assessEncounterDifficulty(monsterTotalLevel: number, heroTotalLevel: number): EncounterDifficulty | null {
  if (heroTotalLevel <= 0) return null;
  const ratio = monsterTotalLevel / heroTotalLevel;
  if (ratio < 0.5) return 'Easy';
  if (ratio < 1.0) return 'Medium';
  if (ratio < 1.25) return 'Hard';
  if (ratio < 1.5) return 'Deadly';
  return 'Very Deadly';
}

/** Pulls a "BLOODIED: ..." or "LAST STAND: ..." callout out of a monster's
 * free-text description, for the combat tracker to surface as a reminder
 * once that monster's HP crosses the relevant threshold. Nimble legendary
 * monster write-ups consistently use these markers verbatim (all-caps,
 * followed by a colon); this captures everything up to the next such
 * marker or the end of the description. Returns null when the marker
 * isn't present -- ordinary (non-legendary) monsters don't have one. */
export function extractDescriptionMarker(description: string, marker: 'BLOODIED' | 'LAST STAND'): string | null {
  const re = new RegExp(`${marker}:\\s*(.*?)(?=\\s+[A-Z][A-Z ]{2,}:|$)`, 's');
  const match = description.match(re);
  return match ? match[1].trim() : null;
}

/** Suggested minion die size by PARTY level (not monster level) -- used
 * as a rough durability measure for minions, which don't track HP. The
 * table's ranges overlap by one level at each edge (e.g. "1-3" then
 * "3-5"); resolved here by letting the next band's lower bound win at
 * the shared boundary. */
export function suggestMinionDieSize(partyLevel: number): number {
  if (partyLevel < 3) return 4;
  if (partyLevel < 5) return 6;
  if (partyLevel < 10) return 8;
  if (partyLevel < 13) return 10;
  if (partyLevel < 17) return 12;
  return 20;
}
