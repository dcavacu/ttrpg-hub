import { readInput } from './read-input';

function formDataWith(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [key, value] of entries) fd.append(key, value);
  return fd;
}

describe('readInput stats parsing', () => {
  it('pairs stats_key/stats_value entries into a record', () => {
    const fd = formDataWith([
      ['name', 'Sword of Owlbears'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', 'Damage'],
      ['stats_value', '1d8'],
      ['stats_key', 'Weight'],
      ['stats_value', '3 lb'],
    ]);
    expect(readInput(fd).stats).toEqual({ Damage: '1d8', Weight: '3 lb' });
  });

  it('omits stats entirely when no rows have a key', () => {
    const fd = formDataWith([
      ['name', 'Sword of Owlbears'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toBeUndefined();
  });

  it('returns an empty object (not undefined) when the stats editor was submitted with all rows cleared', () => {
    const fd = formDataWith([
      ['name', 'Sword of Owlbears'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_present', '1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toEqual({});
  });
});
