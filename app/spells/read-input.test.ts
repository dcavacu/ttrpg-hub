import { readInput } from './read-input';

function formDataWith(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [key, value] of entries) fd.append(key, value);
  return fd;
}

describe('readInput stats parsing', () => {
  it('pairs stats_key/stats_value entries into a record', () => {
    const fd = formDataWith([
      ['name', 'Owlbear Bolt'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', 'Range'],
      ['stats_value', '120 ft'],
      ['stats_key', 'Duration'],
      ['stats_value', 'Instant'],
    ]);
    expect(readInput(fd).stats).toEqual({ Range: '120 ft', Duration: 'Instant' });
  });

  it('omits stats entirely when no rows have a key', () => {
    const fd = formDataWith([
      ['name', 'Owlbear Bolt'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toBeUndefined();
  });

  it('returns an empty object (not undefined) when the stats editor was submitted with all rows cleared', () => {
    const fd = formDataWith([
      ['name', 'Owlbear Bolt'],
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
  it('reads school and mana_cost when present', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['school', 'Fire'],
      ['mana_cost', '2'],
    ]);
    const input = readInput(fd);
    expect(input.school).toBe('Fire');
    expect(input.mana_cost).toBe(2);
  });

  it('reads mana_cost of 0 as 0, not undefined', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['mana_cost', '0'],
    ]);
    expect(readInput(fd).mana_cost).toBe(0);
  });

  it('leaves school and mana_cost null when not submitted', () => {
    const fd = formDataWith([
      ['name', 'Flame Dart'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
    ]);
    const input = readInput(fd);
    expect(input.school).toBeNull();
    expect(input.mana_cost).toBeNull();
  });
});
