import { splitDescriptionSections } from './format-description';

describe('splitDescriptionSections', () => {
  it('returns a single unheaded section for plain prose', () => {
    expect(splitDescriptionSections('A minor fey that appears as a winged ball of light.')).toEqual([
      { heading: null, text: 'A minor fey that appears as a winged ball of light.' },
    ]);
  });

  it('returns an empty array for an empty description', () => {
    expect(splitDescriptionSections('')).toEqual([]);
  });

  it('splits out ALL-CAPS phase labels as their own headed sections', () => {
    const description =
      'Chitinous Plates. BLOODIED: At 45 HP, lose your Chitinous Plates ability! LAST STAND: Broodfly is dying! 90 more damage and he dies.';
    expect(splitDescriptionSections(description)).toEqual([
      { heading: null, text: 'Chitinous Plates.' },
      { heading: 'BLOODIED', text: 'At 45 HP, lose your Chitinous Plates ability!' },
      { heading: 'LAST STAND', text: 'Broodfly is dying! 90 more damage and he dies.' },
    ]);
  });

  it('handles a description that starts directly with a heading', () => {
    expect(splitDescriptionSections('ACTIONS: Move 4 then choose one.')).toEqual([
      { heading: 'ACTIONS', text: 'Move 4 then choose one.' },
    ]);
  });
});
