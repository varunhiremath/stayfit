import { describe, it, expect } from 'vitest';
import { toCm, toFeetInches, fmtHeight, calcBmi, bmiCategory } from './bmi.js';

describe('toCm', () => {
  it('converts feet and inches', () => {
    expect(toCm(5, 10)).toBe(177.8);
    expect(toCm(6, 0)).toBe(182.9);
  });

  it('accepts either part on its own', () => {
    expect(toCm(5, '')).toBe(152.4);
    expect(toCm('', 10)).toBe(25.4);
  });

  it('is null when nothing usable was entered', () => {
    expect(toCm('', '')).toBeNull();
    expect(toCm(null, undefined)).toBeNull();
    expect(toCm(0, 0)).toBeNull();
    expect(toCm('abc', 'x')).toBeNull();
  });
});

describe('toFeetInches', () => {
  it('splits cm into feet and inches', () => {
    expect(toFeetInches(177.8)).toEqual({ feet: 5, inches: 10 });
    expect(toFeetInches(152.4)).toEqual({ feet: 5, inches: 0 });
  });

  it('rolls 12 inches over into the next foot', () => {
    // 181.8cm rounds to 71.57 -> 72 inches, which must read 6'0" not 5'12"
    expect(toFeetInches(182.7)).toEqual({ feet: 6, inches: 0 });
  });

  it('round-trips through toCm', () => {
    const { feet, inches } = toFeetInches(toCm(5, 8));
    expect({ feet, inches }).toEqual({ feet: 5, inches: 8 });
  });

  it('is null for junk', () => {
    expect(toFeetInches(0)).toBeNull();
    expect(toFeetInches(-5)).toBeNull();
    expect(toFeetInches('')).toBeNull();
  });
});

describe('fmtHeight', () => {
  it('formats metric', () => {
    expect(fmtHeight(178, 'cm')).toBe('178 cm');
    expect(fmtHeight(177.8, 'cm')).toBe('178 cm');
  });

  it('formats imperial', () => {
    expect(fmtHeight(177.8, 'ftin')).toBe('5′ 10″');
  });

  it('defaults to cm and is null when unset', () => {
    expect(fmtHeight(178)).toBe('178 cm');
    expect(fmtHeight(null, 'ftin')).toBeNull();
  });
});

describe('calcBmi', () => {
  it('computes to one decimal', () => {
    expect(calcBmi(70, 175)).toBe(22.9);
    expect(calcBmi(100, 180)).toBe(30.9);
  });

  it('needs both figures', () => {
    expect(calcBmi(70, null)).toBeNull();
    expect(calcBmi(null, 175)).toBeNull();
    expect(calcBmi('', '')).toBeNull();
  });

  it('rejects non-positive and non-numeric input', () => {
    expect(calcBmi(0, 175)).toBeNull();
    expect(calcBmi(70, 0)).toBeNull();
    expect(calcBmi(-70, 175)).toBeNull();
    expect(calcBmi('heavy', 175)).toBeNull();
  });
});

describe('bmiCategory', () => {
  it('bands by the WHO cutoffs', () => {
    expect(bmiCategory(17).label).toBe('Underweight');
    expect(bmiCategory(22).label).toBe('Healthy');
    expect(bmiCategory(27).label).toBe('Overweight');
    expect(bmiCategory(33).label).toBe('Obese');
  });

  it('puts the boundaries in the upper band', () => {
    expect(bmiCategory(18.5).key).toBe('healthy');
    expect(bmiCategory(25).key).toBe('over');
    expect(bmiCategory(30).key).toBe('obese');
  });

  it('is null without a usable value', () => {
    expect(bmiCategory(null)).toBeNull();
    expect(bmiCategory(0)).toBeNull();
    expect(bmiCategory('x')).toBeNull();
  });
});
