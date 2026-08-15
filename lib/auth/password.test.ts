import { isCorrectPassword } from './password';

describe('isCorrectPassword', () => {
  it('returns true when the input matches exactly', () => {
    expect(isCorrectPassword('open-sesame', 'open-sesame')).toBe(true);
  });

  it('returns false when the input does not match', () => {
    expect(isCorrectPassword('wrong', 'open-sesame')).toBe(false);
  });

  it('returns false for an empty input', () => {
    expect(isCorrectPassword('', 'open-sesame')).toBe(false);
  });

  it('returns false when expected is unset', () => {
    expect(isCorrectPassword('anything', '')).toBe(false);
  });
});
