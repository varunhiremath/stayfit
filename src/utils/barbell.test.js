import { describe, it, expect } from 'vitest';
import { BAR_KG, BAR_LB, defaultBarKg, defaultBarDisplay } from './barbell.js';
import { toDisplay } from './units.js';

describe('default barbell', () => {
  it('is a 20 kg bar in metric', () => {
    expect(defaultBarKg('kg')).toBe(BAR_KG);
    expect(defaultBarDisplay('kg')).toBe(20);
  });

  it('is a 45 lb bar in imperial', () => {
    expect(defaultBarDisplay('lbs')).toBe(BAR_LB);
    // Stored in kg, it is the exact weight of a 45 lb bar.
    expect(defaultBarKg('lbs')).toBeCloseTo(20.4117, 3);
  });

  it('displays as a round number in either unit', () => {
    expect(toDisplay(defaultBarKg('kg'), 'kg')).toBe(20);
    expect(toDisplay(defaultBarKg('lbs'), 'lbs')).toBeCloseTo(45, 2);
  });

  it('defaults to metric for an unknown unit', () => {
    expect(defaultBarKg(undefined)).toBe(BAR_KG);
  });
});
