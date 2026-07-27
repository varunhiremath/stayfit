import { describe, it, expect } from 'vitest';
import {
  isLogged,
  partitionSession,
  nextUpId,
  advanceFrom,
  swapCandidates,
  summarise,
  sessionProgress,
  formatElapsed,
} from './sessionFlow.js';

const ex = (id, name, sets = []) => ({ exerciseId: id, name, sets });
const set = (weight, reps, extra = {}) => ({ weight, reps, ...extra });

describe('isLogged', () => {
  it('is true only once a set exists', () => {
    expect(isLogged(ex(1, 'Bench'))).toBe(false);
    expect(isLogged(ex(1, 'Bench', [set(60, 8)]))).toBe(true);
    expect(isLogged(undefined)).toBe(false);
  });
});

describe('partitionSession', () => {
  const session = [
    ex(1, 'Bench', [set(60, 8)]),
    ex(2, 'Row'),
    ex(3, 'Curl', [set(20, 12)]),
  ];

  it('moves logged exercises into done', () => {
    const { todo, done } = partitionSession(session, null);
    expect(done.map((e) => e.name)).toEqual(['Bench', 'Curl']);
    expect(todo.map((e) => e.name)).toEqual(['Row']);
  });

  it('keeps the open card in todo even after it has sets', () => {
    const { todo, done } = partitionSession(session, 1);
    expect(todo.map((e) => e.name)).toEqual(['Bench', 'Row']);
    expect(done.map((e) => e.name)).toEqual(['Curl']);
  });

  it('leaves an untouched session entirely to do', () => {
    const fresh = [ex(1, 'Bench'), ex(2, 'Row')];
    expect(partitionSession(fresh, null).done).toHaveLength(0);
    expect(partitionSession(fresh, null).todo).toHaveLength(2);
  });

  it('preserves order within each group', () => {
    const { done } = partitionSession(session, null);
    expect(done[0].name).toBe('Bench');
  });

  it('handles an empty session', () => {
    expect(partitionSession([], null)).toEqual({ todo: [], done: [] });
    expect(partitionSession()).toEqual({ todo: [], done: [] });
  });
});

describe('nextUpId / advanceFrom', () => {
  it('opens the first unstarted exercise', () => {
    expect(nextUpId([ex(1, 'Bench', [set(60, 8)]), ex(2, 'Row'), ex(3, 'Curl')])).toBe(2);
  });

  it('is null when everything has been logged', () => {
    expect(nextUpId([ex(1, 'Bench', [set(60, 8)])])).toBeNull();
    expect(nextUpId([])).toBeNull();
  });

  it('skips the exercise you just closed', () => {
    const s = [ex(1, 'Bench'), ex(2, 'Row')];
    expect(advanceFrom(s, 1)).toBe(2);
  });

  it('returns null when the one you closed was the last unstarted', () => {
    const s = [ex(1, 'Bench'), ex(2, 'Row', [set(50, 10)])];
    expect(advanceFrom(s, 1)).toBeNull();
  });
});

describe('swapCandidates', () => {
  const catalog = [
    { id: 1, name: 'Bench Press', muscleGroup: 'chest' },
    { id: 2, name: 'Push-Up', muscleGroup: 'chest' },
    { id: 3, name: 'Cable Crossover', muscleGroup: 'chest' },
    { id: 4, name: 'Dumbbell Flye', muscleGroup: 'chest' },
    { id: 5, name: 'Chest Dip', muscleGroup: 'chest' },
    { id: 9, name: 'Back Squat', muscleGroup: 'quadriceps' },
  ];

  it('offers same-muscle alternatives', () => {
    const out = swapCandidates({ muscleGroup: 'chest', catalog, sessionIds: [1] });
    expect(out.map((e) => e.name)).toEqual(['Push-Up', 'Cable Crossover', 'Dumbbell Flye', 'Chest Dip']);
  });

  it('never suggests something already in the session', () => {
    const out = swapCandidates({ muscleGroup: 'chest', catalog, sessionIds: [1, 2, 3] });
    expect(out.map((e) => e.id)).not.toContain(2);
    expect(out.map((e) => e.id)).not.toContain(3);
  });

  it('excludes other muscle groups', () => {
    const out = swapCandidates({ muscleGroup: 'chest', catalog, sessionIds: [] });
    expect(out.map((e) => e.id)).not.toContain(9);
  });

  it('respects the limit', () => {
    expect(swapCandidates({ muscleGroup: 'chest', catalog, sessionIds: [], limit: 2 })).toHaveLength(2);
  });

  it('is empty without a muscle group', () => {
    expect(swapCandidates({ muscleGroup: null, catalog, sessionIds: [] })).toEqual([]);
    expect(swapCandidates({})).toEqual([]);
  });
});

describe('summarise', () => {
  it('totals working sets only', () => {
    const e = ex(1, 'Bench', [set(60, 8), set(60, 8), set(20, 10, { isWarmup: true })]);
    expect(summarise(e)).toEqual({ sets: 2, reps: 16, volumeKg: 960 });
  });

  it('is zeroed for an untouched exercise', () => {
    expect(summarise(ex(1, 'Bench'))).toEqual({ sets: 0, reps: 0, volumeKg: 0 });
  });
});

describe('sessionProgress', () => {
  it('counts started exercises', () => {
    const s = [ex(1, 'a', [set(1, 1)]), ex(2, 'b'), ex(3, 'c', [set(1, 1)])];
    expect(sessionProgress(s)).toEqual({ total: 3, completed: 2, pct: 2 / 3 });
  });

  it('is safe when empty', () => {
    expect(sessionProgress([])).toEqual({ total: 0, completed: 0, pct: 0 });
  });
});

describe('formatElapsed', () => {
  it('reads m:ss under an hour', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(9)).toBe('0:09');
    expect(formatElapsed(754)).toBe('12:34');
  });

  it('adds hours past 60 minutes', () => {
    expect(formatElapsed(3600)).toBe('1:00:00');
    expect(formatElapsed(3725)).toBe('1:02:05');
  });

  it('never goes negative', () => {
    expect(formatElapsed(-30)).toBe('0:00');
  });
});
