import { describe, it, expect } from 'vitest';
import { makeRng } from './routineGenerator.js';
import {
  SPLITS, SPLIT_LIST, planWeek, weekdayLayout, restFor, sessionCount, resolveDays,
} from './weekPlanner.js';

const MUSCLES = [
  'chest', 'triceps', 'biceps', 'front-deltoids', 'back-deltoids',
  'upper-back', 'lower-back', 'trapezius', 'abs', 'obliques',
  'quadriceps', 'hamstring', 'gluteal', 'calves', 'forearm',
];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const EQUIP = ['barbell', 'dumbbell', 'cable'];

// Synthetic catalog: 3 exercises per muscle (one per difficulty), ids stable.
const catalog = [];
for (const m of MUSCLES) {
  LEVELS.forEach((difficulty, i) => {
    catalog.push({ id: `${m}-${i}`, name: `${m}-${i}`, muscleGroup: m, difficulty, equipment: EQUIP[i] });
  });
}
const byId = new Map(catalog.map((e) => [e.id, e]));

describe('SPLITS catalog', () => {
  it('exposes the seven splits', () => {
    expect(Object.keys(SPLITS).sort()).toEqual(['arnold', 'bro', 'fullBody', 'home', 'ppl', 'ulppl', 'upperLower']);
    expect(SPLIT_LIST).toHaveLength(7);
    for (const s of SPLIT_LIST) { expect(s.label).toBeTruthy(); expect(s.days.length).toBeGreaterThan(0); }
  });
});

describe('weekdayLayout', () => {
  it('spreads training days with rest gaps', () => {
    expect(weekdayLayout(3)).toEqual([1, 3, 5]);
    expect(weekdayLayout(4)).toEqual([1, 2, 4, 5]);
    expect(weekdayLayout(6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('restFor', () => {
  it('rests compounds longer than isolation, and long > short', () => {
    expect(restFor('standard', true)).toBeGreaterThan(restFor('standard', false));
    expect(restFor('long', true)).toBeGreaterThan(restFor('short', true));
  });
});

describe('sessionCount', () => {
  it('scales exercise count with the time budget, clamped', () => {
    expect(sessionCount(30, 'intermediate')).toBe(4);
    expect(sessionCount(60, 'intermediate')).toBe(6);
    expect(sessionCount(120, 'intermediate')).toBe(8);
    expect(sessionCount(0, 'advanced')).toBe(7); // falls back to level default
  });
});

describe('resolveDays', () => {
  it('snaps to the nearest allowed day count', () => {
    expect(resolveDays('ppl', 3)).toBe(3);
    expect(resolveDays('ppl', 5)).toBe(6); // ppl allows [3,6]
    expect(resolveDays('bro', 3)).toBe(5); // bro allows [5]
  });
});

describe('planWeek', () => {
  it('PPL 6-day → six labelled days on Mon–Sat with populated exercises', () => {
    const week = planWeek({ split: 'ppl', days: 6, level: 'intermediate', sessionMinutes: 60, rest: 'standard', exercises: catalog, rng: makeRng(42) });
    expect(week.map((d) => d.name)).toEqual(['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B']);
    expect(week.map((d) => d.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const day of week) {
      expect(day.exercises.length).toBeGreaterThan(0);
      for (const ex of day.exercises) {
        expect(ex.targetSets).toBeGreaterThan(0);
        expect(ex.targetReps).toBeGreaterThan(0);
        expect(ex.targetRest).toBeGreaterThan(0);
        // every exercise belongs to that day's muscle groups
        expect(day.groups).toContain(byId.get(ex.exerciseId).muscleGroup);
      }
    }
  });

  it('PPL 3-day → three days on Mon/Wed/Fri', () => {
    const week = planWeek({ split: 'ppl', days: 3, level: 'beginner', exercises: catalog, rng: makeRng(7) });
    expect(week.map((d) => d.name)).toEqual(['Push', 'Pull', 'Legs']);
    expect(week.map((d) => d.dayOfWeek)).toEqual([1, 3, 5]);
  });

  it('Full Body 4-day → four Full Body days', () => {
    const week = planWeek({ split: 'fullBody', days: 4, level: 'intermediate', exercises: catalog, rng: makeRng(1) });
    expect(week).toHaveLength(4);
    expect(week.map((d) => d.name)).toEqual(['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D']);
    expect(week.map((d) => d.dayOfWeek)).toEqual([1, 2, 4, 5]);
  });

  it('is deterministic for a given seed', () => {
    const a = planWeek({ split: 'arnold', days: 6, exercises: catalog, rng: makeRng(99) });
    const b = planWeek({ split: 'arnold', days: 6, exercises: catalog, rng: makeRng(99) });
    expect(a).toEqual(b);
  });

  it('returns [] for an unknown split', () => {
    expect(planWeek({ split: 'nope', days: 3, exercises: catalog, rng: makeRng(1) })).toEqual([]);
  });
});

describe('planWeek — Home / Calisthenics', () => {
  // The synthetic catalog above has no bodyweight entries, so the home split
  // needs its own: one bodyweight movement per muscle, plus a hold and some
  // gym kit that must never be planned.
  const homeCatalog = [
    ...MUSCLES.map((m, i) => ({ id: `bw-${m}`, name: `${m} push-up`, muscleGroup: m, difficulty: LEVELS[i % 3], equipment: 'bodyweight' })),
    { id: 'bw-plank', name: 'Plank', muscleGroup: 'abs', difficulty: 'beginner', equipment: 'bodyweight' },
    { id: 'bw-wall-sit', name: 'Wall Sit', muscleGroup: 'quadriceps', difficulty: 'beginner', equipment: 'bodyweight' },
    ...catalog, // barbell / dumbbell / cable — all off-limits at home
  ];
  const homeById = new Map(homeCatalog.map((e) => [e.id, e]));

  it('plans three full-body days on Mon/Wed/Fri', () => {
    const week = planWeek({ split: 'home', days: 3, level: 'beginner', exercises: homeCatalog, rng: makeRng(5) });
    expect(week.map((d) => d.name)).toEqual(['Full Body A', 'Full Body B', 'Full Body C']);
    expect(week.map((d) => d.dayOfWeek)).toEqual([1, 3, 5]);
  });

  it('alternates upper and lower on four days', () => {
    const week = planWeek({ split: 'home', days: 4, level: 'beginner', exercises: homeCatalog, rng: makeRng(5) });
    expect(week.map((d) => d.name)).toEqual(['Upper A', 'Lower A', 'Upper B', 'Lower B']);
  });

  it('splits push/pull/legs/core/full on five days', () => {
    const week = planWeek({ split: 'home', days: 5, level: 'beginner', exercises: homeCatalog, rng: makeRng(5) });
    expect(week.map((d) => d.name)).toEqual(['Push', 'Pull', 'Legs', 'Core', 'Full Body']);
  });

  it('never plans anything that needs equipment', () => {
    for (const days of [3, 4, 5]) {
      const week = planWeek({ split: 'home', days, level: 'intermediate', exercises: homeCatalog, rng: makeRng(11) });
      for (const day of week) {
        expect(day.exercises.length).toBeGreaterThan(0);
        for (const slot of day.exercises) {
          expect(homeById.get(slot.exerciseId).equipment).toBe('bodyweight');
        }
      }
    }
  });

  it('uses calisthenics reps, not the barbell defaults', () => {
    const week = planWeek({ split: 'home', days: 3, level: 'beginner', exercises: homeCatalog, rng: makeRng(3) });
    const reps = week.flatMap((d) => d.exercises.map((s) => s.targetReps));
    // Beginner bodyweight is 3×12; the barbell beginner default is 3×10.
    expect(reps.every((r) => r >= 12)).toBe(true);
  });

  it('counts a plank in seconds', () => {
    const week = planWeek({ split: 'home', days: 5, level: 'beginner', exercises: homeCatalog, rng: makeRng(2) });
    const plank = week.flatMap((d) => d.exercises).find((s) => s.exerciseId === 'bw-plank');
    expect(plank).toBeTruthy();
    expect(plank.targetReps).toBe(30); // seconds, not reps
  });

  it('rests a bodyweight compound longer than a core move', () => {
    const week = planWeek({ split: 'home', days: 5, level: 'beginner', rest: 'standard', exercises: homeCatalog, rng: makeRng(4) });
    const slots = week.flatMap((d) => d.exercises);
    const compound = slots.find((s) => homeById.get(s.exerciseId).muscleGroup === 'chest');
    const core = slots.find((s) => homeById.get(s.exerciseId).muscleGroup === 'abs');
    expect(compound.targetRest).toBeGreaterThan(core.targetRest);
  });

  it('is deterministic for a given seed', () => {
    const a = planWeek({ split: 'home', days: 3, exercises: homeCatalog, rng: makeRng(77) });
    const b = planWeek({ split: 'home', days: 3, exercises: homeCatalog, rng: makeRng(77) });
    expect(a).toEqual(b);
  });

  // Regression: the group lists used to run push → pull → legs → core, and the
  // round-robin ran out of slots before it ever reached legs. A six-exercise
  // "Full Body" day was six upper-body movements and no squat.
  it('puts a push, a pull, a squat and a core move in every full-body day', () => {
    const PUSH_G = ['chest', 'front-deltoids', 'triceps'];
    const PULL_G = ['upper-back', 'lower-back', 'trapezius', 'back-deltoids', 'biceps'];
    const LEG_G = ['quadriceps', 'hamstring', 'gluteal', 'calves'];
    const CORE_G = ['abs', 'obliques'];

    for (const seed of [1, 2, 3, 42]) {
      const week = planWeek({ split: 'home', days: 3, level: 'beginner', sessionMinutes: 45, exercises: homeCatalog, rng: makeRng(seed) });
      for (const day of week) {
        const groups = day.exercises.map((s) => homeById.get(s.exerciseId).muscleGroup);
        expect(groups.some((g) => PUSH_G.includes(g)), `seed ${seed}: no push`).toBe(true);
        expect(groups.some((g) => PULL_G.includes(g)), `seed ${seed}: no pull`).toBe(true);
        expect(groups.some((g) => LEG_G.includes(g)), `seed ${seed}: no legs`).toBe(true);
        expect(groups.some((g) => CORE_G.includes(g)), `seed ${seed}: no core`).toBe(true);
      }
    }
  });
});

describe('Full Body (gym) covers the whole body too', () => {
  it('reaches legs and core, not just the upper body', () => {
    const week = planWeek({ split: 'fullBody', days: 3, level: 'beginner', sessionMinutes: 45, exercises: catalog, rng: makeRng(9) });
    for (const day of week) {
      const groups = day.exercises.map((s) => byId.get(s.exerciseId).muscleGroup);
      expect(groups.some((g) => ['quadriceps', 'hamstring', 'gluteal', 'calves'].includes(g))).toBe(true);
      expect(groups.some((g) => ['abs', 'obliques'].includes(g))).toBe(true);
    }
  });
});
