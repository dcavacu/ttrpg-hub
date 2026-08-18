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
});
