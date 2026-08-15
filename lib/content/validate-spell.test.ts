import { validateSpellInput } from './validate-spell';

describe('validateSpellInput', () => {
  it('returns no errors for a complete input', () => {
    const errors = validateSpellInput({
      name: 'Owlbear Bolt',
      system_id: 'sys-1',
      source_id: 'src-1',
      description: 'Hurls a bolt shaped like an owlbear claw.',
    });
    expect(errors).toEqual([]);
  });

  it('requires a name', () => {
    const errors = validateSpellInput({ system_id: 'sys-1', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('Name is required.');
  });

  it('requires a system', () => {
    const errors = validateSpellInput({ name: 'Owlbear Bolt', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('System is required.');
  });

  it('requires a source', () => {
    const errors = validateSpellInput({ name: 'Owlbear Bolt', system_id: 'sys-1', description: 'x' });
    expect(errors).toContain('Source is required.');
  });

  it('collects multiple errors at once', () => {
    const errors = validateSpellInput({});
    expect(errors).toEqual(
      expect.arrayContaining(['Name is required.', 'System is required.', 'Source is required.']),
    );
  });
});
