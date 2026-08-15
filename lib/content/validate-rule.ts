import type { RuleInput } from './rules';

export function validateRuleInput(input: Partial<RuleInput>): string[] {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push('Name is required.');
  if (!input.system_id) errors.push('System is required.');
  if (!input.source_id) errors.push('Source is required.');
  return errors;
}
