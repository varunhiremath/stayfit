import { describe, it, expect } from 'vitest';
import {
  BODYWEIGHT_REPS,
  HOLD_SECONDS,
  isHoldExercise,
  isBodyweight,
  targetFor,
  formatTarget,
} from './bodyweightTargets.js';

const bw = (name) => ({ name, equipment: 'bodyweight' });
const bar = (name) => ({ name, equipment: 'barbell' });

describe('isHoldExercise', () => {
  it('spots the holds', () => {
    expect(isHoldExercise(bw('Plank'))).toBe(true);
    expect(isHoldExercise(bw('Side Plank'))).toBe(true);
    expect(isHoldExercise(bw('Wall Sit'))).toBe(true);
    expect(isHoldExercise(bw('Hollow Body Hold'))).toBe(true);
    expect(isHoldExercise(bw('Wall Handstand Hold'))).toBe(true);
    expect(isHoldExercise(bw('Copenhagen Plank'))).toBe(true);
  });

  it('matches anything ending in "hold"', () => {
    expect(isHoldExercise(bw('Ring Support Hold'))).toBe(true);
  });

  it('does not mistake rep work for a hold', () => {
    // Contains "plank" but is counted in reps.
    expect(isHoldExercise(bw('Side Plank Dip'))).toBe(false);
    expect(isHoldExercise(bw('Push-Up'))).toBe(false);
    expect(isHoldExercise(bw('Bodyweight Squat'))).toBe(false);
  });

  it('ignores case and punctuation', () => {
    expect(isHoldExercise(bw('  wall   sit '))).toBe(true);
    expect(isHoldExercise(bw('L-Sit'))).toBe(true);
  });

  it('survives junk', () => {
    expect(isHoldExercise(null)).toBe(false);
    expect(isHoldExercise({})).toBe(false);
    expect(isHoldExercise(bw(''))).toBe(false);
  });
});

describe('isBodyweight', () => {
  it('reads the equipment tag', () => {
    expect(isBodyweight(bw('Push-Up'))).toBe(true);
    expect(isBodyweight(bar('Bench Press'))).toBe(false);
    expect(isBodyweight(null)).toBe(false);
  });
});

describe('targetFor', () => {
  it('gives bodyweight work higher reps than the barbell defaults', () => {
    expect(targetFor(bw('Push-Up'), 'beginner')).toEqual({ targetSets: 3, targetReps: 12, isHold: false });
    expect(targetFor(bw('Push-Up'), 'intermediate')).toEqual({ targetSets: 3, targetReps: 15, isHold: false });
    expect(targetFor(bw('Push-Up'), 'advanced')).toEqual({ targetSets: 4, targetReps: 20, isHold: false });
  });

  it('reps go up with level, not down', () => {
    expect(BODYWEIGHT_REPS.advanced.reps).toBeGreaterThan(BODYWEIGHT_REPS.beginner.reps);
  });

  it('counts holds in seconds', () => {
    expect(targetFor(bw('Plank'), 'beginner')).toEqual({ targetSets: 3, targetReps: 30, isHold: true });
    expect(targetFor(bw('Plank'), 'advanced')).toEqual({ targetSets: 4, targetReps: 60, isHold: true });
    expect(HOLD_SECONDS.advanced).toBeGreaterThan(HOLD_SECONDS.beginner);
  });

  it('leaves non-bodyweight exercises to the caller', () => {
    const fallback = { targetSets: 4, targetReps: 8 };
    expect(targetFor(bar('Bench Press'), 'intermediate', fallback)).toBe(fallback);
    expect(targetFor(bar('Bench Press'), 'intermediate')).toBeNull();
  });

  it('falls back to beginner for an unknown level', () => {
    expect(targetFor(bw('Push-Up'), 'wizard')).toEqual({ targetSets: 3, targetReps: 12, isHold: false });
  });
});

describe('formatTarget', () => {
  it('prints reps plainly', () => {
    expect(formatTarget(3, 12, bw('Push-Up'))).toBe('3×12');
    expect(formatTarget(4, 8, bar('Bench Press'))).toBe('4×8');
  });

  it('marks holds with seconds', () => {
    expect(formatTarget(3, 45, bw('Plank'))).toBe('3×45s');
    expect(formatTarget(3, 30, bw('Wall Sit'))).toBe('3×30s');
  });

  it('does not add seconds to a weighted exercise that happens to be named like a hold', () => {
    expect(formatTarget(3, 30, bar('Dead Hang'))).toBe('3×30');
  });

  it('handles missing pieces', () => {
    expect(formatTarget(3, null, bw('Push-Up'))).toBe('3 sets');
    expect(formatTarget(null, null, bw('Push-Up'))).toBeNull();
  });
});
