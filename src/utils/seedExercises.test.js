import { describe, it, expect } from 'vitest';
import seed, { HIP_EXERCISES, HOME_EXERCISES } from './seedExercises.js';
import { ALL_MUSCLES } from '../hooks/useRecovery.js';

// The seed's ids are positional (`i + 1`) and are written into `sets.exerciseId`
// the moment anyone logs a set. Inserting a row mid-list silently renumbers
// every exercise after it, so a user's bench-press history would reattach to
// whatever slid into that slot. These tests exist to make that mistake loud:
// new exercises go at the END of the list, always.
describe('seed ids are stable', () => {
  it('numbers rows positionally from 1', () => {
    seed.forEach((e, i) => expect(e.id).toBe(i + 1));
  });

  it('pins the ids of long-standing exercises', () => {
    // If one of these fails, something was inserted rather than appended.
    const pinned = {
      1: 'Push-Up',
      2: 'Dumbbell Flye',
      3: 'Bench Press',
      74: "Farmer's Walk", // last entry before the hip block was appended
    };
    for (const [id, name] of Object.entries(pinned)) {
      expect(seed.find((e) => e.id === Number(id)).name).toBe(name);
    }
  });

  it('keeps the hip exercises after every pre-existing row', () => {
    const hips = seed.filter((e) => HIP_EXERCISES.some((h) => h.name === e.name));
    expect(hips).toHaveLength(HIP_EXERCISES.length);
    const firstHipId = Math.min(...hips.map((e) => e.id));
    expect(firstHipId).toBeGreaterThan(74);
  });

  it('keeps the home exercises after the hips', () => {
    const homes = seed.filter((e) => HOME_EXERCISES.some((h) => h.name === e.name));
    expect(homes).toHaveLength(HOME_EXERCISES.length);
    const firstHomeId = Math.min(...homes.map((e) => e.id));
    const lastHipId = Math.max(...seed.filter((e) => HIP_EXERCISES.some((h) => h.name === e.name)).map((e) => e.id));
    expect(firstHomeId).toBeGreaterThan(lastHipId);
    expect(lastHipId).toBe(85); // the hips ended here before the home block landed
  });

  it('has no duplicate names or ids', () => {
    expect(new Set(seed.map((e) => e.name)).size).toBe(seed.length);
    expect(new Set(seed.map((e) => e.id)).size).toBe(seed.length);
  });
});

describe('seed muscle groups', () => {
  it('only uses groups the app knows how to display', () => {
    for (const e of seed) expect(ALL_MUSCLES).toContain(e.muscleGroup);
  });

  it('covers hip abduction and adduction', () => {
    const groups = new Set(seed.map((e) => e.muscleGroup));
    expect(groups.has('abductors')).toBe(true);
    expect(groups.has('adductor')).toBe(true);
  });

  // The Home split can only build a balanced session if every group it draws
  // from has at least one bodyweight option.
  it('offers a bodyweight movement for every muscle group', () => {
    const bodyweight = new Set(seed.filter((e) => e.equipment === 'bodyweight').map((e) => e.muscleGroup));
    for (const g of new Set(seed.map((e) => e.muscleGroup))) {
      if (g === 'cardio' || g === 'forearm') continue; // no sane bodyweight-only grip movement
      expect(bodyweight.has(g), `no bodyweight exercise for ${g}`).toBe(true);
    }
  });

  it('gives every exercise a name, group and equipment', () => {
    for (const e of seed) {
      expect(e.name.trim()).not.toBe('');
      expect(e.muscleGroup).toBeTruthy();
      expect(['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine']).toContain(e.equipment);
      expect(['beginner', 'intermediate', 'advanced']).toContain(e.difficulty);
    }
  });
});
