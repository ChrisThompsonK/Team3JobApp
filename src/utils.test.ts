import { describe, expect, it } from 'vitest';
import { isAdult } from './utils';

describe('isAdult', () => {
  it('should return true for age 18 and above', () => {
    expect(isAdult(18)).toBe(true);
    expect(isAdult(25)).toBe(true);
    expect(isAdult(65)).toBe(true);
  });

  it('should return false for age below 18', () => {
    expect(isAdult(17)).toBe(false);
    expect(isAdult(0)).toBe(false);
    expect(isAdult(10)).toBe(false);
  });
});
