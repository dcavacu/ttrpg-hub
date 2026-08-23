import { deriveMonsterTier, deriveMonsterRaceFromTags, deriveSpellSchoolFromTags } from './derive-deterministic-facets';

describe('deriveMonsterTier', () => {
  it('returns Legendary when tags include Legendary', () => {
    expect(deriveMonsterTier('Mav, The Winter Queen', ['Fey', 'Legendary'])).toBe('Legendary');
  });

  it('returns Legendary even when the rating label has no "Solo" in it', () => {
    expect(deriveMonsterTier('Razzle, Gremlin Iconoclast', ['Fey', 'Legendary'])).toBe('Legendary');
  });

  it('returns Minion when the name ends with " Minion"', () => {
    expect(deriveMonsterTier('Kobold Minion', ['Kobolds'])).toBe('Minion');
    expect(deriveMonsterTier('Goblin Minion', ['Goblins'])).toBe('Minion');
  });

  it('returns Normal otherwise', () => {
    expect(deriveMonsterTier('Kobold', ['Kobolds'])).toBe('Normal');
  });

  it('does not mistake a Minion-named monster with a Legendary tag as anything but Legendary', () => {
    expect(deriveMonsterTier('Some Minion', ['Legendary'])).toBe('Legendary');
  });
});

describe('deriveMonsterRaceFromTags', () => {
  it('returns the tag directly when it already matches the vocabulary', () => {
    expect(deriveMonsterRaceFromTags(['Fiend'])).toBe('Fiend');
    expect(deriveMonsterRaceFromTags(['Giant Bug', 'Legendary', 'Dragon'])).toBe('Giant Bug');
    expect(deriveMonsterRaceFromTags(['Undead'])).toBe('Undead');
  });

  it('returns undefined for thematic-grouping tags that need the judgment pass', () => {
    expect(deriveMonsterRaceFromTags(['Kobolds'])).toBeUndefined();
    expect(deriveMonsterRaceFromTags(['Dungeon Denizens'])).toBeUndefined();
  });

  it('returns undefined for an empty tag list', () => {
    expect(deriveMonsterRaceFromTags([])).toBeUndefined();
  });

  it('capitalizes a lowercase single tag that matches the vocabulary (Open5e SRD monsters)', () => {
    expect(deriveMonsterRaceFromTags(['beast'])).toBe('Beast');
    expect(deriveMonsterRaceFromTags(['humanoid'])).toBe('Humanoid');
  });

  it('does not capitalize-match when there is more than one tag', () => {
    expect(deriveMonsterRaceFromTags(['beast', 'Legendary'])).toBeUndefined();
  });
});

describe('deriveSpellSchoolFromTags', () => {
  it('returns the elemental tag when it is the only tag', () => {
    expect(deriveSpellSchoolFromTags(['Fire'])).toBe('Fire');
  });

  it('finds the elemental tag even when Utility comes first', () => {
    expect(deriveSpellSchoolFromTags(['Utility', 'Fire'])).toBe('Fire');
    expect(deriveSpellSchoolFromTags(['Utility', 'Wind'])).toBe('Wind');
  });

  it('finds the elemental tag alongside Class-Restricted', () => {
    expect(deriveSpellSchoolFromTags(['Necrotic', 'Class-Restricted'])).toBe('Necrotic');
  });

  it('returns undefined when no elemental tag is present', () => {
    expect(deriveSpellSchoolFromTags(['Class-Restricted'])).toBeUndefined();
  });
});
