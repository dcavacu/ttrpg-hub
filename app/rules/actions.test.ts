import { readInput } from './read-input';

function buildFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe('readInput', () => {
  it('leaves stats undefined when no stat rows are submitted, so an update never wipes the existing stat block', () => {
    const formData = buildFormData({
      name: 'Grappling with an Owlbear',
      system_id: 'sys-1',
      source_id: 'src-1',
    });

    const result = readInput(formData);

    expect(result.stats).toBeUndefined();
  });

  it('parses a comma-separated tags field into a trimmed array', () => {
    const formData = buildFormData({
      name: 'Grappling with an Owlbear',
      system_id: 'sys-1',
      source_id: 'src-1',
      tags: 'grappling, combat,  action',
    });

    const result = readInput(formData);

    expect(result.tags).toEqual(['grappling', 'combat', 'action']);
  });
});
