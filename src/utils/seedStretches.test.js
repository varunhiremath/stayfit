import { describe, it, expect } from 'vitest';
import seed, {
  stretchSeed,
  STRETCH_ROUTINES,
  routineStretchNames,
  resolveRoutine,
  BODY_AREAS,
} from './seedStretches.js';

const names = new Set(seed.map((s) => s.name));

describe('stretch catalogue', () => {
  it('has no duplicate names', () => {
    expect(names.size).toBe(seed.length);
  });

  it('gives every stretch a valid type, body area and duration', () => {
    for (const s of seed) {
      expect(['dynamic', 'static', 'mobility']).toContain(s.type);
      expect(BODY_AREAS).toContain(s.bodyArea);
      expect(s.durationSec).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(10);
      expect(['beginner', 'intermediate', 'advanced']).toContain(s.difficulty);
    }
  });

  it('marks seeded rows as non-custom', () => {
    expect(stretchSeed().every((s) => s.isCustom === false)).toBe(true);
    expect(stretchSeed()).toHaveLength(seed.length);
  });

  it('covers both pre and post phases', () => {
    const phases = new Set(STRETCH_ROUTINES.map((r) => r.phase));
    expect(phases).toEqual(new Set(['pre', 'post']));
  });
});

describe('bundled routines', () => {
  it('references only catalogue stretches', () => {
    for (const name of routineStretchNames()) {
      expect(names, `"${name}" is not in the catalogue`).toContain(name);
    }
  });

  it('gives every routine at least 4 moves', () => {
    for (const r of STRETCH_ROUTINES) {
      expect(r.items.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('uses only dynamic/mobility moves in pre-workout routines', () => {
    const byName = Object.fromEntries(seed.map((s) => [s.name, s]));
    for (const r of STRETCH_ROUTINES.filter((x) => x.phase === 'pre')) {
      for (const n of r.items) {
        expect(['dynamic', 'mobility'], `${r.name} → ${n}`).toContain(byName[n].type);
      }
    }
  });

  it('resolves to DB rows, dropping unknown names', () => {
    const routine = { name: 'T', phase: 'pre', bodyArea: 'hips', items: ['Arm Circles', 'Nope'] };
    const resolved = resolveRoutine(routine, { 'Arm Circles': 7 }, { 'Arm Circles': { durationSec: 30 } });
    expect(resolved.items).toEqual([{ stretchId: 7, durationSec: 30 }]);
    expect(resolved.isCustom).toBe(false);
  });
});
