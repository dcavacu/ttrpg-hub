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
});
