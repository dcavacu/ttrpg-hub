import { validateMonsterInput } from './validate-monster';

describe('validateMonsterInput', () => {
  it('returns no errors for a complete input', () => {
    const errors = validateMonsterInput({
      name: 'Owlbear',
      system_id: 'sys-1',
      source_id: 'src-1',
      description: 'Half owl, half bear.',
    });
    expect(errors).toEqual([]);
  });

  it('requires a name', () => {
    const errors = validateMonsterInput({ system_id: 'sys-1', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('Name is required.');
  });

  it('requires a system', () => {
    const errors = validateMonsterInput({ name: 'Owlbear', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('System is required.');
  });

  it('requires a source', () => {
    const errors = validateMonsterInput({ name: 'Owlbear', system_id: 'sys-1', description: 'x' });
    expect(errors).toContain('Source is required.');
  });

  it('collects multiple errors at once', () => {
    const errors = validateMonsterInput({});
    expect(errors).toEqual(
      expect.arrayContaining(['Name is required.', 'System is required.', 'Source is required.']),
    );
  });
});
