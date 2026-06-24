import { describe, expect, it } from 'vitest';
import { isValidBRNumber, parseFloatBR } from './calculations/parseBR.js';

describe('parseFloatBR', () => {
  it('parses comma decimal', () => {
    expect(parseFloatBR('37,5')).toBe(37.5);
  });

  it('parses thousand separator', () => {
    expect(parseFloatBR('1.234,56')).toBe(1234.56);
  });

  it('returns NaN for empty', () => {
    expect(Number.isNaN(parseFloatBR(''))).toBe(true);
  });
});

describe('isValidBRNumber', () => {
  it('accepts valid BR numbers', () => {
    expect(isValidBRNumber('65,0')).toBe(true);
  });
});