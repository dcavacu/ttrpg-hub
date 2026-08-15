import { mapOpen5eMonsterToRow } from './open5e-mapper';

const raw = {
  name: 'Owlbear',
  challenge_rating: '3',
  armor_class: 13,
  hit_points: 59,
  speed: { walk: 40 },
  type: 'monstrosity',
  desc: 'A dangerous forest predator.',
};

describe('mapOpen5eMonsterToRow', () => {
  it('maps name, rating label, tags, and description', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.name).toBe('Owlbear');
    expect(row.rating_label).toBe('CR 3');
    expect(row.tags).toEqual(['monstrosity']);
    expect(row.description).toBe('A dangerous forest predator.');
  });

  it('sets system_id, source_id, and is_homebrew=false', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.system_id).toBe('sys-1');
    expect(row.source_id).toBe('src-1');
    expect(row.is_homebrew).toBe(false);
  });

  it('maps known stat fields into the stats bag', () => {
    const row = mapOpen5eMonsterToRow(raw, 'sys-1', 'src-1');
    expect(row.stats['Armor Class']).toBe('13');
    expect(row.stats['Hit Points']).toBe('59');
    expect(row.stats['Speed']).toBe('40 ft.');
  });

  it('falls back to an empty description when none is given', () => {
    const row = mapOpen5eMonsterToRow({ ...raw, desc: undefined }, 'sys-1', 'src-1');
    expect(row.description).toBe('');
  });
});
