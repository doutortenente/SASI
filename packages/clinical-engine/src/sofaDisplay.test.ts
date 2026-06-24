import { describe, expect, it } from 'vitest';
import { sofaColorClass, sofaTier } from './scores/sofaDisplay.js';

describe('sofaTier', () => {
  it('classifies critical', () => {
    expect(sofaTier(12)).toBe('critical');
  });

  it('classifies unknown for null', () => {
    expect(sofaTier(null)).toBe('unknown');
  });
});

describe('sofaColorClass', () => {
  it('maps tiers to css classes', () => {
    expect(sofaColorClass(11)).toBe('sofa-critical');
    expect(sofaColorClass(2)).toBe('sofa-low');
  });
});