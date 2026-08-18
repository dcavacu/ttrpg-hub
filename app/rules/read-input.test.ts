import { readInput } from './read-input';

function formDataWith(entries: [string, string][]): FormData {
  const fd = new FormData();
  for (const [key, value] of entries) fd.append(key, value);
  return fd;
}

describe('readInput stats parsing', () => {
  it('pairs stats_key/stats_value entries into a record', () => {
    const fd = formDataWith([
      ['name', 'Grappling with an Owlbear'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', 'DC'],
      ['stats_value', '15'],
      ['stats_key', 'Action'],
      ['stats_value', 'Standard'],
    ]);
    expect(readInput(fd).stats).toEqual({ DC: '15', Action: 'Standard' });
  });

  it('omits stats entirely when no rows have a key', () => {
    const fd = formDataWith([
      ['name', 'Grappling with an Owlbear'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toBeUndefined();
  });

  it('returns an empty object (not undefined) when the stats editor was submitted with all rows cleared', () => {
    const fd = formDataWith([
      ['name', 'Grappling with an Owlbear'],
      ['system_id', 'sys-1'],
      ['source_id', 'src-1'],
      ['stats_present', '1'],
      ['stats_key', ''],
      ['stats_value', ''],
    ]);
    expect(readInput(fd).stats).toEqual({});
  });
});
