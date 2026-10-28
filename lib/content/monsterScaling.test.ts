import {
  NORMAL_MONSTER_TABLE,
  LEGENDARY_MONSTER_TABLE,
  normalizeArmorTier,
  extractLevelLabel,
  replaceLevelLabel,
  levelLabelToNumber,
  previewRescale,
  applyRescaleToStats,
  scaleDiceExpression,
  scaleDamageInDescription,
} from './monsterScaling';

describe('normalizeArmorTier', () => {
  it('reads Heavy from a full or abbreviated value', () => {
    expect(normalizeArmorTier('Heavy')).toBe('Heavy');
    expect(normalizeArmorTier('heavy armor')).toBe('Heavy');
    expect(normalizeArmorTier('H')).toBe('Heavy');
  });

  it('reads Medium from a full or abbreviated value', () => {
    expect(normalizeArmorTier('Medium')).toBe('Medium');
    expect(normalizeArmorTier('medium')).toBe('Medium');
    expect(normalizeArmorTier('M')).toBe('Medium');
  });

  it('defaults to None for missing or unrecognized values', () => {
    expect(normalizeArmorTier(undefined)).toBe('None');
    expect(normalizeArmorTier(null)).toBe('None');
    expect(normalizeArmorTier('')).toBe('None');
    expect(normalizeArmorTier('Unarmored')).toBe('None');
  });
});

describe('extractLevelLabel', () => {
  it('reads a whole-number level after "Lvl"', () => {
    expect(extractLevelLabel('Lvl 6')).toBe('6');
  });

  it('reads a fractional level', () => {
    expect(extractLevelLabel('Lvl 1/2')).toBe('1/2');
  });

  it('reads a level embedded in a longer legendary label', () => {
    expect(extractLevelLabel('Level 10 Solo Avatar of Seasons')).toBe('10');
    expect(extractLevelLabel('Level 7 Small, Insufferable Rascal')).toBe('7');
  });

  it('returns null when no level prefix is present', () => {
    expect(extractLevelLabel('CR 10')).toBeNull();
    expect(extractLevelLabel(null)).toBeNull();
    expect(extractLevelLabel(undefined)).toBeNull();
  });
});

describe('replaceLevelLabel', () => {
  it('swaps a simple "Lvl N" label', () => {
    expect(replaceLevelLabel('Lvl 6', '10')).toBe('Lvl 10');
  });

  it('swaps a fractional label for a whole number and vice versa', () => {
    expect(replaceLevelLabel('Lvl 1/2', '3')).toBe('Lvl 3');
    expect(replaceLevelLabel('Lvl 3', '1/2')).toBe('Lvl 1/2');
  });

  it('preserves everything else in a legendary label, replacing only the number', () => {
    expect(replaceLevelLabel('Level 10 Solo Avatar of Seasons', '6')).toBe('Level 6 Solo Avatar of Seasons');
  });

  it('returns the original string unchanged when no level prefix is found', () => {
    expect(replaceLevelLabel('CR 10', '6')).toBe('CR 10');
    expect(replaceLevelLabel(null, '6')).toBe('');
  });
});

describe('levelLabelToNumber', () => {
  it('converts a whole-number label', () => {
    expect(levelLabelToNumber('6')).toBe(6);
    expect(levelLabelToNumber('20')).toBe(20);
  });

  it('converts a fractional label', () => {
    expect(levelLabelToNumber('1/2')).toBe(0.5);
    expect(levelLabelToNumber('1/4')).toBe(0.25);
    expect(levelLabelToNumber('1/3')).toBeCloseTo(0.333, 3);
  });

  it('returns 0 for null, undefined, or an unparseable label', () => {
    expect(levelLabelToNumber(null)).toBe(0);
    expect(levelLabelToNumber(undefined)).toBe(0);
    expect(levelLabelToNumber('not-a-level')).toBe(0);
  });
});

describe('previewRescale — Normal tier', () => {
  it('returns null for Minion tier (no HP table applies)', () => {
    expect(previewRescale('Minion', undefined, 'Lvl 6', '10')).toBeNull();
  });

  it('returns null for a level label with no matching table row', () => {
    expect(previewRescale('Normal', undefined, 'Lvl 6', '21')).toBeNull();
    expect(previewRescale('Normal', undefined, 'Lvl 6', 'twelve')).toBeNull();
  });

  it('looks up HP by the unarmored column when no Armor stat is set', () => {
    const result = previewRescale('Normal', undefined, 'Lvl 6', '10');
    expect(result).not.toBeNull();
    expect(result!.armor).toBe('None');
    expect(result!.hp).toBe(118); // NORMAL_MONSTER_TABLE level 10, None column
  });

  it('looks up HP by the matching armor column when Armor is set', () => {
    const result = previewRescale('Normal', 'Medium', 'Lvl 6', '10');
    expect(result!.hp).toBe(94); // level 10, Medium column
    const heavy = previewRescale('Normal', 'Heavy', 'Lvl 6', '10');
    expect(heavy!.hp).toBe(71); // level 10, Heavy column
  });

  it('carries the level-appropriate damage/attack-dice/save DC/CR reference through', () => {
    const row = NORMAL_MONSTER_TABLE.find((r) => r.levelLabel === '6')!;
    const result = previewRescale('Normal', undefined, 'Lvl 3', '6');
    expect(result!.damagePerRound).toBe(row.damagePerRound);
    expect(result!.attackDice).toBe(row.attackDice);
    expect(result!.saveDC).toBe(row.saveDC);
    expect(result!.crEquiv).toBe(row.crEquiv);
  });

  it('replaces only the level number in the rating label', () => {
    const result = previewRescale('Normal', undefined, 'Lvl 3', '1/2');
    expect(result!.ratingLabel).toBe('Lvl 1/2');
  });

  it('supports fractional level labels ("1/4", "1/3", "1/2")', () => {
    for (const label of ['1/4', '1/3', '1/2']) {
      const result = previewRescale('Normal', undefined, 'Lvl 1', label);
      expect(result).not.toBeNull();
      expect(result!.levelLabel).toBe(label);
    }
  });
});

describe('previewRescale — Legendary tier', () => {
  it('returns null for a level outside 1-20', () => {
    expect(previewRescale('Legendary', 'Medium', 'Level 5 Boss', '21')).toBeNull();
    expect(previewRescale('Legendary', 'Medium', 'Level 5 Boss', '1/2')).toBeNull();
  });

  it('uses the Medium column by default, including when currently unarmored', () => {
    const result = previewRescale('Legendary', undefined, 'Level 2 Solo Dumb Ogre', '2');
    expect(result!.armor).toBe('Medium');
    expect(result!.hp).toBe(75); // LEGENDARY_MONSTER_TABLE level 2, Medium column
  });

  it('uses the Heavy column when the monster already carries Heavy armor', () => {
    const result = previewRescale('Legendary', 'Heavy', 'Level 2 Solo Dumb Ogre', '2');
    expect(result!.armor).toBe('Heavy');
    expect(result!.hp).toBe(55);
  });

  it('carries Last Stand HP, small/big attack damage, and save DC through', () => {
    const row = LEGENDARY_MONSTER_TABLE.find((r) => r.levelLabel === '5')!;
    const result = previewRescale('Legendary', 'Medium', 'Level 2 Boss', '5');
    expect(result!.hpLastStand).toBe(row.hpLastStand);
    expect(result!.attackDmgSmall).toBe(row.attackDmgSmall);
    expect(result!.attackDmgBig).toBe(row.attackDmgBig);
    expect(result!.saveDC).toBe(row.saveDC);
  });

  it('preserves the descriptive part of a legendary rating label', () => {
    const result = previewRescale('Legendary', 'Medium', 'Level 10 Solo Avatar of Seasons', '6');
    expect(result!.ratingLabel).toBe('Level 6 Solo Avatar of Seasons');
  });
});

describe('previewRescale — HP scaling relative to the monster\'s current HP', () => {
  it('scales a hand-tuned monster\'s HP by the table ratio between its current and target level, instead of snapping to the table\'s raw value', () => {
    // Acidpod: Lvl 1, HP 8, Heavy armor -- well under the table's Lvl 1
    // Heavy value (16). Rescaling to Lvl 3 (Heavy: 25) should preserve
    // that ~50% relative tuning: round(8 * (25/16)) = 13, not the table's
    // raw 25.
    const result = previewRescale('Normal', 'Heavy', 'Lvl 1', '3', '8');
    expect(result!.hpScaled).toBe(true);
    expect(result!.hp).toBe(Math.round(8 * (25 / 16)));
    expect(result!.hp).not.toBe(25); // the bug this fixes: no longer the raw table value
  });

  it('is a no-op when rescaling to the level the monster is already at', () => {
    // This is exactly the bug report: applying "rescale to 1" on a Lvl 1
    // monster previously overwrote its actual (hand-tuned) HP with the
    // table's flat default. Same level in and out -> ratio of 1 -> HP
    // unchanged.
    const result = previewRescale('Normal', 'Heavy', 'Lvl 1', '1', '8');
    expect(result!.hp).toBe(8);
    expect(result!.hpScaled).toBe(true);
  });

  it('scales up proportionally for a monster built stronger than the table baseline', () => {
    // Lvl 3 None column is 41; a monster with 62 HP at Lvl 3 is running
    // ~1.5x the book's baseline. At Lvl 6 (None: 68) it should keep that
    // same ~1.5x, not reset to 68.
    const result = previewRescale('Normal', undefined, 'Lvl 3', '6', '62');
    expect(result!.hp).toBe(Math.round(62 * (68 / 41)));
  });

  it('scales Legendary HP the same way, using the effective (armor-adjusted) column on both sides', () => {
    // Party Lvl 2 Medium is 75; a boss built at 60 HP there is running
    // ~0.8x baseline. At party Lvl 5 (Medium: 150) it should stay ~0.8x.
    const result = previewRescale('Legendary', 'Medium', 'Level 2 Boss', '5', '60');
    expect(result!.hpScaled).toBe(true);
    expect(result!.hp).toBe(Math.round(60 * (150 / 75)));
  });

  it('falls back to the table\'s raw value when the current level can\'t be read from the rating label', () => {
    const result = previewRescale('Normal', undefined, 'CR 10', '6', '40');
    expect(result!.hpScaled).toBe(false);
    expect(result!.hp).toBe(68); // NORMAL_MONSTER_TABLE level 6, None column
  });

  it('falls back to the table\'s raw value when the current HP is missing or not a plain number', () => {
    const missing = previewRescale('Normal', undefined, 'Lvl 3', '6', undefined);
    expect(missing!.hpScaled).toBe(false);
    expect(missing!.hp).toBe(68);

    const nonNumeric = previewRescale('Normal', undefined, 'Lvl 3', '6', 'unknown');
    expect(nonNumeric!.hpScaled).toBe(false);
    expect(nonNumeric!.hp).toBe(68);
  });

  it('omitting currentHp entirely behaves exactly like the pre-scaling raw-value lookup (backward compatible)', () => {
    const result = previewRescale('Normal', undefined, 'Lvl 3', '6');
    expect(result!.hpScaled).toBe(false);
    expect(result!.hp).toBe(68);
  });
});

describe('applyRescaleToStats', () => {
  it('sets HP from the preview, leaving other stats untouched', () => {
    const preview = previewRescale('Normal', undefined, 'Lvl 3', '6')!;
    const next = applyRescaleToStats({ Size: 'Large', HP: '41' }, preview);
    expect(next).toEqual({ Size: 'Large', HP: '68' });
  });

  it('adds an Armor stat for a legendary monster bumped from unarmored to Medium', () => {
    const preview = previewRescale('Legendary', undefined, 'Level 2 Boss', '2')!;
    const next = applyRescaleToStats({ HP: '10' }, preview);
    expect(next.Armor).toBe('Medium');
    expect(next.HP).toBe('75');
  });

  it('leaves Armor untouched when the preview keeps the monster unarmored', () => {
    const preview = previewRescale('Normal', undefined, 'Lvl 3', '6')!;
    const next = applyRescaleToStats({ HP: '41' }, preview);
    expect(next.Armor).toBeUndefined();
  });
});

describe('scaleDiceExpression', () => {
  it('turns 1d10 into 1d20 when the table roughly doubles', () => {
    // table 2d10 -> 2d20 is avg 11 -> 21, a ratio of ~1.91
    expect(scaleDiceExpression(1, 10, 0, 21 / 11)).toBe('1d20');
  });

  it('halves the dice when the table halves', () => {
    expect(scaleDiceExpression(2, 10, 0, 0.5)).toBe('1d10');
  });

  it('scales the flat bonus and re-picks dice for the rest', () => {
    expect(scaleDiceExpression(1, 10, 5, 28 / 30)).toBe('1d8+5');
    expect(scaleDiceExpression(1, 10, 10, 28 / 30)).toBe('1d10+9');
  });

  it('is a no-op at ratio 1', () => {
    expect(scaleDiceExpression(2, 8, 4, 1)).toBe('2d8+4');
  });

  it('never goes below one die', () => {
    expect(scaleDiceExpression(1, 4, 0, 0.1)).toBe('1d4');
  });
});

describe('scaleDamageInDescription', () => {
  const bogey =
    'Smash (1d10+5 damage, on hit Grappled escape DC 14) or Headbutt (if Grappling target, 1d10+10 damage and Dazed). Bloodied: uses a d20 for its attacks.';

  it('scales damage dice but not DCs or bare dice', () => {
    const { text, changes } = scaleDamageInDescription(bogey, 28 / 30);
    expect(text).toContain('1d8+5 damage');
    expect(text).toContain('1d10+9 damage');
    expect(text).toContain('DC 14');
    expect(text).toContain('a d20 for its attacks');
    expect(changes).toEqual([
      { from: '1d10+5', to: '1d8+5' },
      { from: '1d10+10', to: '1d10+9' },
    ]);
  });

  it('catches "attacks for XdY" and multi-word damage, skips non-damage dice', () => {
    const { text } = scaleDamageInDescription(
      'Three attacks for 1d8+2. Deals 2d6 acid damage. Moves a target 1d10 spaces. Each hero rolls 3d20.',
      2,
    );
    expect(text).toContain('attacks for 2d8+4');
    expect(text).toContain('4d6 acid damage');
    expect(text).toContain('1d10 spaces');
    expect(text).toContain('rolls 3d20');
  });

  it('leaves the text identical at ratio 1', () => {
    expect(scaleDamageInDescription(bogey, 1).text).toBe(bogey);
    expect(scaleDamageInDescription(bogey, 1).changes).toEqual([]);
  });
});

describe('previewRescale damage', () => {
  it('rescales description damage by the table ratio between the two levels', () => {
    const desc = 'Smash (1d10+5 damage) then Headbutt (1d10+10 damage).';
    const result = previewRescale('Normal', 'None', 'Lvl 10', '9', '120', desc)!;
    expect(result.description).toBe('Smash (1d8+5 damage) then Headbutt (1d10+9 damage).');
    expect(result.damageChanges).toHaveLength(2);
  });

  it('leaves description untouched when no current level can be read', () => {
    const result = previewRescale('Normal', 'None', null, '9', '120', 'Hits for 1d10 damage.')!;
    expect(result.description).toBeUndefined();
  });

  it('uses the legendary table ratio for legendary monsters', () => {
    const result = previewRescale('Legendary', 'Medium', 'Level 4 Boss', '8', '125', 'Slash deals 1d10+15 damage.')!;
    // small attack damage 11 -> 15, ratio ~1.36
    expect(result.damageChanges).toHaveLength(1);
    expect(result.description).not.toBe('Slash deals 1d10+15 damage.');
  });
});
