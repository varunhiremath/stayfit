import { describe, it, expect } from 'vitest';
import { normalize, tokenize, withinOneEdit, scoreExercise, searchExercises } from './exerciseSearch.js';

const ex = (name, muscleGroup = 'chest', equipment = 'barbell') => ({ name, muscleGroup, equipment });

const CATALOG = [
  ex('Bench Press', 'chest', 'barbell'),
  ex('Incline Bench Press', 'chest', 'barbell'),
  ex('Push-Up', 'chest', 'bodyweight'),
  ex("Farmer's Walk", 'forearm', 'dumbbell'),
  ex('Hip Abduction Machine', 'abductors', 'machine'),
  ex('Hip Adduction Machine', 'adductor', 'machine'),
  ex('Cable Hip Adduction', 'adductor', 'cable'),
  ex('Lateral Lunge', 'adductor', 'dumbbell'),
];

const names = (q) => searchExercises(CATALOG, q).map((e) => e.name);

describe('normalize', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalize('Push-Up')).toBe('push up');
    expect(normalize("Farmer's Walk")).toBe('farmer s walk');
  });

  it('collapses whitespace and trims', () => {
    expect(normalize('  bench   press  ')).toBe('bench press');
  });

  it('strips accents', () => {
    expect(normalize('Épaule')).toBe('epaule');
  });

  it('handles empty input', () => {
    expect(normalize('')).toBe('');
    expect(normalize(null)).toBe('');
    expect(tokenize('')).toEqual([]);
  });
});

describe('withinOneEdit', () => {
  it('accepts identical strings', () => {
    expect(withinOneEdit('bench', 'bench')).toBe(true);
  });

  it('accepts one substitution, insertion or deletion', () => {
    expect(withinOneEdit('bech', 'bench')).toBe(true);   // insertion
    expect(withinOneEdit('benchh', 'bench')).toBe(true); // deletion
    expect(withinOneEdit('bunch', 'bench')).toBe(true);  // substitution
  });

  it('rejects two or more edits', () => {
    expect(withinOneEdit('bch', 'bench')).toBe(false);
    expect(withinOneEdit('press', 'bench')).toBe(false);
  });
});

describe('searchExercises — the forgiving bits', () => {
  it('tolerates extra and leading whitespace', () => {
    expect(names('  bench   press ')).toContain('Bench Press');
  });

  it('ignores punctuation in either direction', () => {
    expect(names('push up')).toContain('Push-Up');
    expect(names('pushup')).toContain('Push-Up');
    expect(names('farmers walk')).toContain("Farmer's Walk");
  });

  it('matches words in any order', () => {
    expect(names('press bench')).toContain('Bench Press');
  });

  it('forgives a single typo', () => {
    expect(names('bech press')).toContain('Bench Press');
    expect(names('abdction')).toContain('Hip Abduction Machine');
  });

  it('keeps abduction and adduction apart', () => {
    // One edit separates the two words, so a *complete* word must win outright
    // rather than dragging in its neighbour.
    expect(names('adduction')[0]).toMatch(/Adduction/);
    expect(names('abduction')[0]).toMatch(/Abduction/);
  });

  it('searches muscle group and equipment too', () => {
    expect(names('adductor')).toContain('Lateral Lunge');
    expect(names('machine')).toContain('Hip Abduction Machine');
  });

  it('ranks whole-name prefix hits first', () => {
    expect(names('bench')[0]).toBe('Bench Press');
  });

  it('returns everything for an empty query', () => {
    expect(searchExercises(CATALOG, '')).toHaveLength(CATALOG.length);
    expect(searchExercises(CATALOG, '   ')).toHaveLength(CATALOG.length);
  });

  it('returns nothing for genuine nonsense', () => {
    expect(names('zzzzqqqq')).toEqual([]);
  });

  it('does not blow up on a missing list', () => {
    expect(searchExercises(undefined, 'bench')).toEqual([]);
  });
});

describe('scoreExercise', () => {
  it('scores a prefix hit best', () => {
    expect(scoreExercise(ex('Bench Press'), 'bench')).toBe(0);
  });

  it('scores a mid-name hit above a tag-only hit', () => {
    const mid = scoreExercise(ex('Incline Bench Press'), 'bench press');
    const tag = scoreExercise(ex('Lateral Lunge', 'adductor', 'dumbbell'), 'adductor');
    expect(mid).toBeLessThan(tag);
  });

  it('is null when nothing matches', () => {
    expect(scoreExercise(ex('Bench Press'), 'squat')).toBeNull();
  });
});
