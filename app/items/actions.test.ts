import { readInput } from './read-input';

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe('readInput', () => {
  it('does not set a stats key, so an update never wipes the existing stat block', () => {
    const formData = buildFormData({
      name: 'Sword of Owlbears',
      system_id: 'sys-1',
      source_id: 'src-1',
    });

    const result = readInput(formData);

    expect(result).not.toHaveProperty('stats');
  });

  it('parses a comma-separated tags field into a trimmed array', () => {
    const formData = buildFormData({
      name: 'Sword of Owlbears',
      system_id: 'sys-1',
      source_id: 'src-1',
      tags: 'weapon, magic,  rare',
    });

    const result = readInput(formData);

    expect(result.tags).toEqual(['weapon', 'magic', 'rare']);
  });
});
