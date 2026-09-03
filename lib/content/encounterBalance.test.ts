import { assessEncounterDifficulty, suggestMinionDieSize, extractDescriptionMarker } from './encounterBalance';

describe('assessEncounterDifficulty', () => {
  it('returns null when there are no heroes to compare against', () => {
    expect(assessEncounterDifficulty(10, 0)).toBeNull();
  });

  it('rates well under half the hero total as Easy', () => {
    expect(assessEncounterDifficulty(4, 10)).toBe('Easy');
  });

  it('rates around 75% of the hero total as Medium', () => {
    expect(assessEncounterDifficulty(7, 10)).toBe('Medium');
  });

  it('matches the book\'s own worked example: 6 griffons (24 total) vs 6 level-4 heroes (24 total) is Hard', () => {
    expect(assessEncounterDifficulty(24, 24)).toBe('Hard');
  });

  it('rates just over the hero total as Hard, not yet Deadly', () => {
    expect(assessEncounterDifficulty(12, 10)).toBe('Hard'); // 120%
  });

  it('rates 125-150% of the hero total as Deadly', () => {
    expect(assessEncounterDifficulty(13, 10)).toBe('Deadly'); // 130%
  });

  it('rates 150%+ of the hero total as Very Deadly', () => {
    expect(assessEncounterDifficulty(15, 10)).toBe('Very Deadly');
    expect(assessEncounterDifficulty(30, 10)).toBe('Very Deadly');
  });

  it('is monotonic across the whole boundary sweep', () => {
    const order: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2, Deadly: 3, 'Very Deadly': 4 };
    let last = -1;
    for (let m = 0; m <= 40; m++) {
      const rating = assessEncounterDifficulty(m, 20)!;
      const rank = order[rating];
      expect(rank).toBeGreaterThanOrEqual(last);
      last = rank;
    }
  });
});

describe('extractDescriptionMarker', () => {
  const mavDescription =
    "Wind Ward: attacks from Range 6 or beyond have disadvantage against her. " +
    "BLOODIED: at 140 HP her storm grows to 8x8, she is no longer vulnerable to Fire, and her forced movement doubles. " +
    "LAST STAND: 100 more damage banishes her to the Wildscapes; her storm ends and she summons icy shards covering the ground within Reach 12, dealing 3 damage per space moved through the area.";

  it('captures the BLOODIED callout up to the next all-caps marker', () => {
    expect(extractDescriptionMarker(mavDescription, 'BLOODIED')).toBe(
      'at 140 HP her storm grows to 8x8, she is no longer vulnerable to Fire, and her forced movement doubles.',
    );
  });

  it('captures the LAST STAND callout through the end of the description', () => {
    expect(extractDescriptionMarker(mavDescription, 'LAST STAND')).toBe(
      '100 more damage banishes her to the Wildscapes; her storm ends and she summons icy shards covering the ground within Reach 12, dealing 3 damage per space moved through the area.',
    );
  });

  it('returns null for an ordinary monster description with neither marker', () => {
    const plain = 'When disturbed it displays a spectacular defense mechanism: a noxious eruption of boiling oil.';
    expect(extractDescriptionMarker(plain, 'BLOODIED')).toBeNull();
    expect(extractDescriptionMarker(plain, 'LAST STAND')).toBeNull();
  });
});

describe('suggestMinionDieSize', () => {
  it('suggests d4 for very low party levels', () => {
    expect(suggestMinionDieSize(1)).toBe(4);
    expect(suggestMinionDieSize(2)).toBe(4);
  });

  it('suggests d6 once the party reaches the 3-5 band', () => {
    expect(suggestMinionDieSize(3)).toBe(6);
    expect(suggestMinionDieSize(4)).toBe(6);
  });

  it('suggests d8 for levels 5-9', () => {
    expect(suggestMinionDieSize(5)).toBe(8);
    expect(suggestMinionDieSize(9)).toBe(8);
  });

  it('suggests d10 for levels 10-12', () => {
    expect(suggestMinionDieSize(10)).toBe(10);
    expect(suggestMinionDieSize(12)).toBe(10);
  });

  it('suggests d12 for levels 13-16', () => {
    expect(suggestMinionDieSize(13)).toBe(12);
    expect(suggestMinionDieSize(16)).toBe(12);
  });

  it('suggests d20 for level 17+', () => {
    expect(suggestMinionDieSize(17)).toBe(20);
    expect(suggestMinionDieSize(20)).toBe(20);
  });
});
