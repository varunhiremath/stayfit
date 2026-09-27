// Targets for bodyweight work.
//
// The barbell defaults in routineGenerator (3×10 / 4×8 / 4×6) are wrong for
// calisthenics twice over. You don't do six push-ups and call it a set, and a
// plank measured in reps is nonsense — it's a hold, counted in seconds.
//
// Whether something is a hold is derived from its name rather than stored on
// the row. That keeps it working for databases seeded long before this existed,
// with no migration and no back-filling, and it covers a custom "Wall Sit"
// somebody adds themselves.

import { normalize } from './exerciseSearch.js';

// Reps climb with level instead of falling — the progression in bodyweight work
// is more reps, then a harder variation.
export const BODYWEIGHT_REPS = {
  beginner: { sets: 3, reps: 12 },
  intermediate: { sets: 3, reps: 15 },
  advanced: { sets: 4, reps: 20 },
};

// Seconds per hold, by level.
export const HOLD_SECONDS = {
  beginner: 30,
  intermediate: 45,
  advanced: 60,
};

// Movements counted in seconds, not reps. "Side Plank Dip" is deliberately not
// here: it contains "plank" but you do it for reps.
const HOLD_NAMES = new Set([
  'plank',
  'side plank',
  'copenhagen plank',
  'wall sit',
  'hollow body hold',
  'wall handstand hold',
  'dead hang',
  'superman',
  'bear crawl',
  'l sit',
]);

export function isHoldExercise(exercise) {
  const name = normalize(exercise?.name);
  if (!name) return false;
  if (HOLD_NAMES.has(name)) return true;
  return name.endsWith(' hold');
}

export function isBodyweight(exercise) {
  return exercise?.equipment === 'bodyweight';
}

// The target for one exercise at one level. Anything that isn't bodyweight
// falls through to the caller's defaults, so gym splits are untouched.
export function targetFor(exercise, level = 'beginner', fallback = null) {
  if (!isBodyweight(exercise)) return fallback;
  if (isHoldExercise(exercise)) {
    const secs = HOLD_SECONDS[level] ?? HOLD_SECONDS.beginner;
    const { sets } = BODYWEIGHT_REPS[level] ?? BODYWEIGHT_REPS.beginner;
    return { targetSets: sets, targetReps: secs, isHold: true };
  }
  const { sets, reps } = BODYWEIGHT_REPS[level] ?? BODYWEIGHT_REPS.beginner;
  return { targetSets: sets, targetReps: reps, isHold: false };
}

// "3 × 12" for reps, "3 × 45s" for a hold. Returns null when there's no target
// worth printing.
export function formatTarget(targetSets, targetReps, exercise) {
  if (!targetSets && !targetReps) return null;
  if (!targetReps) return `${targetSets} sets`;
  const suffix = isBodyweight(exercise) && isHoldExercise(exercise) ? 's' : '';
  return `${targetSets}×${targetReps}${suffix}`;
}
