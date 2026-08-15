import { validateRuleInput } from './validate-rule';

describe('validateRuleInput', () => {
  it('returns no errors for a complete input', () => {
    const errors = validateRuleInput({
      name: 'Grappling with an Owlbear',
      system_id: 'sys-1',
      source_id: 'src-1',
      description: 'Special rules for grappling an owlbear.',
    });
    expect(errors).toEqual([]);
  });

  it('requires a name', () => {
    const errors = validateRuleInput({ system_id: 'sys-1', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('Name is required.');
  });

  it('requires a system', () => {
    const errors = validateRuleInput({ name: 'Grappling with an Owlbear', source_id: 'src-1', description: 'x' });
    expect(errors).toContain('System is required.');
  });

  it('requires a source', () => {
    const errors = validateRuleInput({ name: 'Grappling with an Owlbear', system_id: 'sys-1', description: 'x' });
    expect(errors).toContain('Source is required.');
  });

  it('collects multiple errors at once', () => {
    const errors = validateRuleInput({});
    expect(errors).toEqual(
      expect.arrayContaining(['Name is required.', 'System is required.', 'Source is required.']),
    );
  });
});
