import { validateItemInput } from './validate-item';

describe('validateItemInput', () => {
  it('returns no errors for a complete input', () => {
    const errors = validateItemInput({
      name: 'Sword of Owlbears',
      system_id: 'sys-1',
      source_id: 'src-1',
      description: 'A sword shaped like an owlbear.',
    });
    expect(errors).toEqual([]);
  });

  it('requires a name', () => {
    const errors = validateItemInput({ system_id: 'sys-1', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('Name is required.');
  });

  it('requires a system', () => {
    const errors = validateItemInput({ name: 'Sword of Owlbears', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('System is required.');
  });

  it('requires a source', () => {
    const errors = validateItemInput({ name: 'Sword of Owlbears', system_id: 'sys-1', description: 'x' });
    expect(errors).toContain('Source is required.');
  });

  it('collects multiple errors at once', () => {
    const errors = validateItemInput({});
    expect(errors).toEqual(
      expect.arrayContaining(['Name is required.', 'System is required.', 'Source is required.']),
    );
  });
});
