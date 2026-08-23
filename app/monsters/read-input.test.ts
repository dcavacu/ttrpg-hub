import { readInput } from './read-input';

function formDataWith(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [key, value] of entries) fd.append(key, value);
  return fd;
}

describe('readInput stats parsing', () => {
  it('pairs stats_key/stats_value entries into a record', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', 'HP'],
      ['stats_value', '12'],
      ['stats_key', 'Speed'],
      ['stats_value', 'Fly'],
    ]);
    expect(readInput(fd).stats).toEqual({ HP: '12', Speed: 'Fly' });
  });

  it('omits stats entirely when no rows have a key', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toBeUndefined();
  });

  it('returns an empty object (not undefined) when the stats editor was submitted with all rows cleared', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_present', '1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toEqual({});
  });
});

describe('readInput facet fields', () => {
  it('reads combat_role, race, and tier when present', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['combat_role', 'Ranged'],
      ['race', 'Fey'],
      ['tier', 'Normal'],
    ]);
    const input = readInput(fd);
    expect(input.combat_role).toBe('Ranged');
    expect(input.race).toBe('Fey');
    expect(input.tier).toBe('Normal');
  });

  it('leaves combat_role and race null, and tier undefined, when not submitted', () => {
    const fd = formDataWith([
      ['name', 'Sprite'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
    ]);
    const input = readInput(fd);
    expect(input.combat_role).toBeNull();
    expect(input.race).toBeNull();
    expect(input.tier).toBeUndefined();
  });
});
