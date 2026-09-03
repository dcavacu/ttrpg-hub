/**
 * Nimble monster level-scaling, sourced from the Game Master Guide's two
 * "Monster Builder" tables (p.29 "Monster Builder" for ordinary monsters,
 * p.44 "Legendary Monster Builder" for solo/legendary monsters). Working
 * entirely in the level LABEL (a string like "1/2" or "6") rather than a
 * parsed number avoids fraction-comparison bugs entirely -- every level a
 * monster can be is one of these exact, fixed table rows, so string
 * equality is both correct and simpler.
 */

export type ArmorTier = 'None' | 'Medium' | 'Heavy';

export interface NormalMonsterLevelStats {
  levelLabel: string;
  hpByArmor: Record<ArmorTier, number>;
  damagePerRound: number;
  attackDice: string;
  saveDC: number;
  crEquiv: string;
}

// Game Master Guide, "Monster Builder" table.
export const NORMAL_MONSTER_TABLE: NormalMonsterLevelStats[] = [
  { levelLabel: '1/4', hpByArmor: { None: 12, Medium: 9, Heavy: 7 }, damagePerRound: 3, attackDice: '1d4+1', saveDC: 9, crEquiv: '1/8' },
  { levelLabel: '1/3', hpByArmor: { None: 15, Medium: 11, Heavy: 8 }, damagePerRound: 5, attackDice: '1d6+2', saveDC: 9, crEquiv: '1/4' },
  { levelLabel: '1/2', hpByArmor: { None: 18, Medium: 15, Heavy: 11 }, damagePerRound: 7, attackDice: '1d6+3', saveDC: 10, crEquiv: '1/4' },
  { levelLabel: '1', hpByArmor: { None: 26, Medium: 20, Heavy: 16 }, damagePerRound: 11, attackDice: '2d8+2 or (2x) 1d8+1', saveDC: 10, crEquiv: '1/2' },
  { levelLabel: '2', hpByArmor: { None: 34, Medium: 27, Heavy: 20 }, damagePerRound: 13, attackDice: '2d8+4 or (2x) 1d8+3', saveDC: 11, crEquiv: '1' },
  { levelLabel: '3', hpByArmor: { None: 41, Medium: 33, Heavy: 25 }, damagePerRound: 15, attackDice: '2d8+6 or (2x) 1d8+4', saveDC: 11, crEquiv: '1' },
  { levelLabel: '4', hpByArmor: { None: 49, Medium: 39, Heavy: 29 }, damagePerRound: 18, attackDice: '2d8+9 or (2x) 1d8+5', saveDC: 12, crEquiv: '2' },
  { levelLabel: '5', hpByArmor: { None: 58, Medium: 46, Heavy: 35 }, damagePerRound: 19, attackDice: '2d8+10 or (2x) 1d8+6', saveDC: 12, crEquiv: '2' },
  { levelLabel: '6', hpByArmor: { None: 68, Medium: 54, Heavy: 41 }, damagePerRound: 21, attackDice: '2d8+12 or (2x) 1d8+7', saveDC: 13, crEquiv: '3' },
  { levelLabel: '7', hpByArmor: { None: 79, Medium: 63, Heavy: 47 }, damagePerRound: 24, attackDice: '3d8+10 or (2x) 2d8+4', saveDC: 13, crEquiv: '3' },
  { levelLabel: '8', hpByArmor: { None: 91, Medium: 73, Heavy: 55 }, damagePerRound: 26, attackDice: '3d8+12 or (2x) 2d8+5', saveDC: 14, crEquiv: '4' },
  { levelLabel: '9', hpByArmor: { None: 104, Medium: 83, Heavy: 62 }, damagePerRound: 28, attackDice: '4d8+10 or (2x) 2d8+6', saveDC: 14, crEquiv: '4' },
  { levelLabel: '10', hpByArmor: { None: 118, Medium: 94, Heavy: 71 }, damagePerRound: 30, attackDice: '4d8+12 or (2x) 2d8+7', saveDC: 15, crEquiv: '5' },
  { levelLabel: '11', hpByArmor: { None: 133, Medium: 106, Heavy: 80 }, damagePerRound: 33, attackDice: '5d8+11 or (2x) 3d8+3', saveDC: 15, crEquiv: '6' },
  { levelLabel: '12', hpByArmor: { None: 149, Medium: 119, Heavy: 89 }, damagePerRound: 35, attackDice: '5d8+13 or (2x) 3d8+4', saveDC: 16, crEquiv: '7' },
  { levelLabel: '13', hpByArmor: { None: 166, Medium: 132, Heavy: 100 }, damagePerRound: 38, attackDice: '6d8+11 or (2x) 3d8+6', saveDC: 16, crEquiv: '8' },
  { levelLabel: '14', hpByArmor: { None: 184, Medium: 147, Heavy: 110 }, damagePerRound: 40, attackDice: '6d8+13 or (2x) 3d8+7', saveDC: 17, crEquiv: '9' },
  { levelLabel: '15', hpByArmor: { None: 203, Medium: 162, Heavy: 122 }, damagePerRound: 43, attackDice: '7d8+11 or (2x) 3d8+8', saveDC: 17, crEquiv: '9' },
  { levelLabel: '16', hpByArmor: { None: 223, Medium: 178, Heavy: 134 }, damagePerRound: 45, attackDice: '7d8+13 or (2x) 4d8+5', saveDC: 18, crEquiv: '10' },
  { levelLabel: '17', hpByArmor: { None: 244, Medium: 195, Heavy: 146 }, damagePerRound: 48, attackDice: '8d8+12 or (2x) 4d8+6', saveDC: 18, crEquiv: '11' },
  { levelLabel: '18', hpByArmor: { None: 266, Medium: 213, Heavy: 160 }, damagePerRound: 50, attackDice: '8d8+14 or (2x) 4d8+7', saveDC: 19, crEquiv: '12' },
  { levelLabel: '19', hpByArmor: { None: 289, Medium: 231, Heavy: 173 }, damagePerRound: 52, attackDice: '9d8+12 or (2x) 4d8+8', saveDC: 19, crEquiv: '13' },
  { levelLabel: '20', hpByArmor: { None: 313, Medium: 250, Heavy: 189 }, damagePerRound: 54, attackDice: '9d8+13 or (2x) 4d8+9', saveDC: 20, crEquiv: '14' },
];

export interface LegendaryMonsterLevelStats {
  levelLabel: string;
  hpByArmor: { Medium: number; Heavy: number };
  hpLastStand: number;
  saveDC: number;
  attackDmgSmall: number;
  attackDmgBig: number;
}

// Game Master Guide, "Legendary Monster Stats by Level" table. Keyed by
// PARTY level (the book: "the numbers here are all based off the Party
// Level... and stay the same regardless of the number of heroes").
export const LEGENDARY_MONSTER_TABLE: LegendaryMonsterLevelStats[] = [
  { levelLabel: '1', hpByArmor: { Medium: 50, Heavy: 35 }, hpLastStand: 10, saveDC: 10, attackDmgSmall: 8, attackDmgBig: 16 },
  { levelLabel: '2', hpByArmor: { Medium: 75, Heavy: 55 }, hpLastStand: 20, saveDC: 11, attackDmgSmall: 9, attackDmgBig: 18 },
  { levelLabel: '3', hpByArmor: { Medium: 100, Heavy: 75 }, hpLastStand: 30, saveDC: 11, attackDmgSmall: 10, attackDmgBig: 20 },
  { levelLabel: '4', hpByArmor: { Medium: 125, Heavy: 95 }, hpLastStand: 40, saveDC: 12, attackDmgSmall: 11, attackDmgBig: 22 },
  { levelLabel: '5', hpByArmor: { Medium: 150, Heavy: 115 }, hpLastStand: 50, saveDC: 12, attackDmgSmall: 12, attackDmgBig: 24 },
  { levelLabel: '6', hpByArmor: { Medium: 175, Heavy: 135 }, hpLastStand: 60, saveDC: 13, attackDmgSmall: 13, attackDmgBig: 26 },
  { levelLabel: '7', hpByArmor: { Medium: 200, Heavy: 155 }, hpLastStand: 70, saveDC: 13, attackDmgSmall: 14, attackDmgBig: 28 },
  { levelLabel: '8', hpByArmor: { Medium: 225, Heavy: 175 }, hpLastStand: 80, saveDC: 14, attackDmgSmall: 15, attackDmgBig: 30 },
  { levelLabel: '9', hpByArmor: { Medium: 250, Heavy: 195 }, hpLastStand: 90, saveDC: 14, attackDmgSmall: 16, attackDmgBig: 32 },
  { levelLabel: '10', hpByArmor: { Medium: 275, Heavy: 215 }, hpLastStand: 100, saveDC: 15, attackDmgSmall: 17, attackDmgBig: 34 },
  { levelLabel: '11', hpByArmor: { Medium: 300, Heavy: 235 }, hpLastStand: 110, saveDC: 15, attackDmgSmall: 18, attackDmgBig: 36 },
  { levelLabel: '12', hpByArmor: { Medium: 325, Heavy: 255 }, hpLastStand: 120, saveDC: 16, attackDmgSmall: 19, attackDmgBig: 38 },
  { levelLabel: '13', hpByArmor: { Medium: 350, Heavy: 275 }, hpLastStand: 130, saveDC: 16, attackDmgSmall: 20, attackDmgBig: 40 },
  { levelLabel: '14', hpByArmor: { Medium: 375, Heavy: 295 }, hpLastStand: 140, saveDC: 17, attackDmgSmall: 21, attackDmgBig: 42 },
  { levelLabel: '15', hpByArmor: { Medium: 400, Heavy: 315 }, hpLastStand: 150, saveDC: 17, attackDmgSmall: 22, attackDmgBig: 44 },
  { levelLabel: '16', hpByArmor: { Medium: 425, Heavy: 335 }, hpLastStand: 160, saveDC: 18, attackDmgSmall: 23, attackDmgBig: 46 },
  { levelLabel: '17', hpByArmor: { Medium: 450, Heavy: 355 }, hpLastStand: 170, saveDC: 18, attackDmgSmall: 24, attackDmgBig: 48 },
  { levelLabel: '18', hpByArmor: { Medium: 475, Heavy: 375 }, hpLastStand: 180, saveDC: 19, attackDmgSmall: 25, attackDmgBig: 50 },
  { levelLabel: '19', hpByArmor: { Medium: 500, Heavy: 395 }, hpLastStand: 190, saveDC: 19, attackDmgSmall: 26, attackDmgBig: 52 },
  { levelLabel: '20', hpByArmor: { Medium: 525, Heavy: 415 }, hpLastStand: 200, saveDC: 20, attackDmgSmall: 27, attackDmgBig: 54 },
];

/** Reads the free-form Armor stat value ("Medium", "Heavy Armor", "H",
 * missing, ...) down to one of the table's three tiers. Missing/unrecognized
 * defaults to None, matching how the data already treats an absent Armor
 * stat as unarmored throughout this codebase. */
export function normalizeArmorTier(raw: string | null | undefined): ArmorTier {
  const v = (raw ?? '').trim().toLowerCase();
  if (v.startsWith('heavy') || v === 'h') return 'Heavy';
  if (v.startsWith('medium') || v === 'm') return 'Medium';
  return 'None';
}

/** Pulls the level label ("6", "1/2", "10") out of a rating_label string
 * like "Lvl 6", "Lvl 1/2", or "Level 10 Solo Avatar of Seasons". Returns
 * null when no recognizable level prefix is present. */
export function extractLevelLabel(ratingLabel: string | null | undefined): string | null {
  const match = (ratingLabel ?? '').match(/\b(?:Lvl\.?|Level)\s*(\d+(?:\/\d+)?)/i);
  return match ? match[1] : null;
}

/** Converts a level label ("6", "1/2") to a plain number, for arithmetic
 * like summing an encounter's total monster level. Returns 0 for a label
 * that isn't a real level (or a monster with no parseable level at all)
 * rather than throwing -- callers summing across a whole roster shouldn't
 * have one odd entry blow up the total. */
export function levelLabelToNumber(levelLabel: string | null | undefined): number {
  if (!levelLabel) return 0;
  if (levelLabel.includes('/')) {
    const [num, den] = levelLabel.split('/').map(Number);
    return den ? num / den : 0;
  }
  const n = Number(levelLabel);
  return Number.isFinite(n) ? n : 0;
}

/** Swaps just the level number in a rating_label, preserving everything
 * else in the string (e.g. a legendary monster's descriptive subtitle).
 * Returns the original string unchanged if no level prefix is found --
 * callers should treat that as "couldn't confirm the label updated". */
export function replaceLevelLabel(ratingLabel: string | null | undefined, newLevelLabel: string): string {
  const label = ratingLabel ?? '';
  if (!/\b(?:Lvl\.?|Level)\s*\d+(?:\/\d+)?/i.test(label)) return label;
  return label.replace(/\b(Lvl\.?|Level)\s*\d+(?:\/\d+)?/i, (_m, prefix: string) => `${prefix} ${newLevelLabel}`);
}

export interface RescalePreview {
  levelLabel: string;
  ratingLabel: string;
  hp: number;
  /** false when hp is the table's raw value for the target level (no
   * current level/HP to scale from); true when it was scaled relative to
   * the monster's own current HP -- see previewRescale's doc comment. */
  hpScaled: boolean;
  armor: ArmorTier;
  saveDC: number;
  /** Ordinary (Normal/Minion-tier) monsters only. */
  damagePerRound?: number;
  attackDice?: string;
  crEquiv?: string;
  /** Legendary-tier monsters only. */
  hpLastStand?: number;
  attackDmgSmall?: number;
  attackDmgBig?: number;
}

/** Computes what a monster's stats *should* be at a given target level,
 * per the tier-appropriate Game Master Guide table. `currentArmor` /
 * `currentRatingLabel` / `currentHp` come from the monster's existing
 * stats.Armor / rating_label / stats.HP. Returns null for a level label
 * that isn't a real row in the relevant table, or for Minion tier (the
 * rules track minions by die size, not HP -- there's no table for them
 * here). Never mutates anything.
 *
 * HP is scaled relative to the monster's own current HP rather than
 * snapped to the table's raw value -- a hand-tuned monster (e.g. built
 * at half the book's suggested HP for a "glass cannon" feel) should stay
 * at roughly that same relative strength at the new level, not jump to
 * the table's flat default and erase the tuning:
 *
 *     newHp = round(currentHp * (targetLevelTableHp / currentLevelTableHp))
 *
 * (same armor column on both sides of the ratio). This falls back to the
 * table's raw value (hpScaled: false in the result) only when there's no
 * usable baseline to scale from -- the current level can't be read from
 * the rating label, or the current HP isn't a plain number. */
export function previewRescale(
  tier: 'Normal' | 'Legendary' | 'Minion',
  currentArmor: string | null | undefined,
  currentRatingLabel: string | null | undefined,
  targetLevelLabel: string,
  currentHp?: string | null,
): RescalePreview | null {
  if (tier === 'Minion') return null;
  const armor = normalizeArmorTier(currentArmor);
  const currentLevelLabel = extractLevelLabel(currentRatingLabel);
  const currentHpNum = currentHp != null ? Number(currentHp) : NaN;
  const canScale = currentLevelLabel !== null && Number.isFinite(currentHpNum);

  if (tier === 'Legendary') {
    const row = LEGENDARY_MONSTER_TABLE.find((r) => r.levelLabel === targetLevelLabel);
    if (!row) return null;
    // Legendary monsters are assumed to carry at least Medium armor per
    // the book ("if unarmored make sure they have some other defensive
    // ability") -- the table itself only has Medium/Heavy columns.
    const effectiveArmor: ArmorTier = armor === 'Heavy' ? 'Heavy' : 'Medium';
    const targetHp = row.hpByArmor[effectiveArmor];
    const currentRow = canScale ? LEGENDARY_MONSTER_TABLE.find((r) => r.levelLabel === currentLevelLabel) : undefined;
    const hp = currentRow ? Math.round(currentHpNum * (targetHp / currentRow.hpByArmor[effectiveArmor])) : targetHp;
    return {
      levelLabel: targetLevelLabel,
      ratingLabel: replaceLevelLabel(currentRatingLabel, targetLevelLabel),
      hp,
      hpScaled: !!currentRow,
      armor: effectiveArmor,
      saveDC: row.saveDC,
      hpLastStand: row.hpLastStand,
      attackDmgSmall: row.attackDmgSmall,
      attackDmgBig: row.attackDmgBig,
    };
  }

  const row = NORMAL_MONSTER_TABLE.find((r) => r.levelLabel === targetLevelLabel);
  if (!row) return null;
  const targetHp = row.hpByArmor[armor];
  const currentRow = canScale ? NORMAL_MONSTER_TABLE.find((r) => r.levelLabel === currentLevelLabel) : undefined;
  const hp = currentRow ? Math.round(currentHpNum * (targetHp / currentRow.hpByArmor[armor])) : targetHp;
  return {
    levelLabel: targetLevelLabel,
    ratingLabel: replaceLevelLabel(currentRatingLabel, targetLevelLabel),
    hp,
    hpScaled: !!currentRow,
    armor,
    saveDC: row.saveDC,
    damagePerRound: row.damagePerRound,
    attackDice: row.attackDice,
    crEquiv: row.crEquiv,
  };
}

/** Applies a preview's numeric results onto a stats bag: sets HP (and,
 * for Legendary monsters bumped up from unarmored, Armor). Leaves every
 * other stat key untouched. */
export function applyRescaleToStats(
  stats: Record<string, string>,
  preview: RescalePreview,
): Record<string, string> {
  const next: Record<string, string> = { ...stats, HP: String(preview.hp) };
  if (stats.Armor !== undefined || preview.armor !== 'None') {
    next.Armor = preview.armor === 'None' ? '' : preview.armor;
    if (!next.Armor) delete next.Armor;
  }
  return next;
}
