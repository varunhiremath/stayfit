// Split-aware WEEK planner. Turns a chosen split + days/week + level + session
// length + rest preference into a full week of day-routines, composing the
// single-day generateRoutine() per day. Pure (seeded rng, no DB/Date) so it's
// unit-testable and shared by web + native. Each day is ready for the platform's
// createTemplate: { name, dayOfWeek, autoKey, groups, exercises:[{exerciseId,
// targetSets, targetReps, targetWeight, targetRest}] }.
import { generateRoutine, LEVEL_DEFAULTS } from './routineGenerator.js';
import { targetFor } from './bodyweightTargets.js';

// Muscle buckets over the 15-token taxonomy (matches routineName's grouping).
const PUSH = ['chest', 'front-deltoids', 'triceps'];
const PULL = ['upper-back', 'lower-back', 'trapezius', 'back-deltoids', 'biceps', 'forearm'];
const LEGS = ['quadriceps', 'hamstring', 'gluteal', 'calves', 'abductors', 'adductor'];
const CORE = ['abs', 'obliques'];
const CHEST = ['chest'];
const BACK = ['upper-back', 'lower-back', 'trapezius'];
const SHOULDERS = ['front-deltoids', 'back-deltoids'];
const ARMS = ['biceps', 'triceps', 'forearm'];
const UPPER = [...PUSH, ...PULL];
const LOWER = [...LEGS, ...CORE];

// ORDER MATTERS on any multi-category day. generateRoutine round-robins through
// the groups in order and stops once it has enough exercises, so listing all of
// push before any of legs means a six-exercise "Full Body" day is six upper-body
// movements and no squat. These lists interleave instead: the first four groups
// are a push, a pull, a squat and a core movement — the shape every beginner
// full-body session is supposed to have — and the rest fill out from there.
const FULL = [
  'chest', 'upper-back', 'quadriceps', 'abs',
  'front-deltoids', 'gluteal', 'obliques', 'back-deltoids',
  'triceps', 'hamstring', 'biceps', 'lower-back', 'calves', 'trapezius', 'forearm',
];
// Calisthenics treats core as a main event rather than an afterthought, so the
// home days always carry it.
const HOME_FULL = FULL;
const HOME_UPPER = [
  'chest', 'upper-back', 'abs', 'front-deltoids',
  'back-deltoids', 'triceps', 'obliques', 'biceps', 'trapezius', 'lower-back',
];
const HOME_LOWER = [
  'quadriceps', 'abs', 'gluteal', 'obliques',
  'hamstring', 'calves', 'abductors', 'adductor',
];
const CHEST_BACK = [...CHEST, ...BACK];
const SHOULDER_ARMS = [...SHOULDERS, ...ARMS];

// Append A/B/C… when a day name repeats within the week (Push A / Push B).
function letterize(blueprints) {
  const counts = {};
  for (const b of blueprints) counts[b.name] = (counts[b.name] || 0) + 1;
  const seen = {};
  return blueprints.map((b) => {
    if (counts[b.name] > 1) {
      seen[b.name] = (seen[b.name] || 0) + 1;
      return { ...b, name: `${b.name} ${String.fromCharCode(64 + seen[b.name])}` };
    }
    return b;
  });
}

// Each split: allowed days-per-week + a layout(days) → ordered day blueprints
// ({ key, name, groups }). key becomes the day's autoKey (day-of-week re-match).
export const SPLITS = {
  ppl: {
    key: 'ppl', label: 'Push · Pull · Legs',
    blurb: 'The classic. Push, pull and legs on rotation — great balance of frequency and recovery.',
    days: [3, 6],
    layout: (d) => {
      const base = [
        { key: 'push', name: 'Push', groups: PUSH },
        { key: 'pull', name: 'Pull', groups: PULL },
        { key: 'legs', name: 'Legs', groups: LEGS },
      ];
      return letterize(d >= 6 ? [...base, ...base] : base);
    },
  },
  arnold: {
    key: 'arnold', label: 'Arnold',
    blurb: 'Opposing groups together — Chest/Back, Shoulders/Arms, Legs. High volume, big pumps.',
    days: [6],
    layout: () => letterize([
      { key: 'chest-back', name: 'Chest & Back', groups: CHEST_BACK },
      { key: 'shoulders-arms', name: 'Shoulders & Arms', groups: SHOULDER_ARMS },
      { key: 'legs', name: 'Legs', groups: LEGS },
      { key: 'chest-back', name: 'Chest & Back', groups: CHEST_BACK },
      { key: 'shoulders-arms', name: 'Shoulders & Arms', groups: SHOULDER_ARMS },
      { key: 'legs', name: 'Legs', groups: LEGS },
    ]),
  },
  upperLower: {
    key: 'upperLower', label: 'Upper · Lower',
    blurb: 'Every muscle 2–3×/week. Alternate upper- and lower-body days.',
    days: [4, 6],
    layout: (d) => {
      const pair = [
        { key: 'upper', name: 'Upper', groups: UPPER },
        { key: 'lower', name: 'Lower', groups: LOWER },
      ];
      return letterize(d >= 6 ? [...pair, ...pair, ...pair] : [...pair, ...pair]);
    },
  },
  ulppl: {
    key: 'ulppl', label: 'Upper · Lower · PPL',
    blurb: 'Two heavy strength days, then three PPL hypertrophy days. Two rest days a week.',
    days: [5],
    layout: () => [
      { key: 'upper', name: 'Upper', groups: UPPER },
      { key: 'lower', name: 'Lower', groups: LOWER },
      { key: 'push', name: 'Push', groups: PUSH },
      { key: 'pull', name: 'Pull', groups: PULL },
      { key: 'legs', name: 'Legs', groups: LEGS },
    ],
  },
  bro: {
    key: 'bro', label: 'Body-part (Bro)',
    blurb: 'One muscle group a day — obliterate it, then a full week to recover.',
    days: [5],
    layout: () => [
      { key: 'chest', name: 'Chest', groups: CHEST },
      { key: 'back', name: 'Back', groups: BACK },
      { key: 'legs', name: 'Legs', groups: LEGS },
      { key: 'shoulders', name: 'Shoulders', groups: SHOULDERS },
      { key: 'arms', name: 'Arms', groups: ARMS },
    ],
  },
  fullBody: {
    key: 'fullBody', label: 'Full Body',
    blurb: 'Whole body each session while fresh. Ideal for 3–5 focused days a week.',
    days: [3, 4, 5],
    layout: (d) => letterize(Array.from({ length: d }, () => ({ key: 'full-body', name: 'Full Body', groups: FULL }))),
  },
  home: {
    key: 'home', label: 'Home · Calisthenics',
    blurb: 'No gym, no kit. Push, pull, legs and core with just your bodyweight — 3 to 5 days a week.',
    days: [3, 4, 5],
    // Restricts the pool to bodyweight movements, and switches targets to
    // calisthenics reps and timed holds.
    equipment: ['bodyweight'],
    layout: (d) => {
      if (d >= 5) {
        return [
          { key: 'push', name: 'Push', groups: PUSH },
          { key: 'pull', name: 'Pull', groups: PULL },
          { key: 'legs', name: 'Legs', groups: LEGS },
          { key: 'core', name: 'Core', groups: CORE },
          { key: 'full-body', name: 'Full Body', groups: HOME_FULL },
        ];
      }
      if (d === 4) {
        return letterize([
          { key: 'home-upper', name: 'Upper', groups: HOME_UPPER },
          { key: 'home-lower', name: 'Lower', groups: HOME_LOWER },
          { key: 'home-upper', name: 'Upper', groups: HOME_UPPER },
          { key: 'home-lower', name: 'Lower', groups: HOME_LOWER },
        ]);
      }
      // Three days is the standard bodyweight starting point: full body each
      // session, a rest day between, push/pull/squat/core every time.
      return letterize(Array.from({ length: d }, () => ({ key: 'full-body', name: 'Full Body', groups: HOME_FULL })));
    },
  },
};

// Ordered list for pickers.
export const SPLIT_LIST = Object.values(SPLITS);

// Which weekdays (1=Mon … 7=Sun) the N training days land on, spreading rest.
export function weekdayLayout(days) {
  const MAP = { 1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 7] };
  return MAP[days] || MAP[Math.min(6, Math.max(1, days))];
}

// Rest between sets (seconds), by preference and whether the lift is a big
// compound. Mirrors typical guidance (compounds rest longer than isolation).
export const REST_PREFS = ['short', 'standard', 'long'];
export function restFor(pref, isCompound) {
  const T = { short: [90, 45], standard: [150, 75], long: [210, 105] };
  const [comp, iso] = T[pref] || T.standard;
  return isCompound ? comp : iso;
}

// Groups whose bodyweight movements are whole-body efforts (a pull-up or a
// pistol squat earns a compound's rest); the rest are isolation or core.
const BODYWEIGHT_COMPOUND_GROUPS = new Set([
  'chest', 'upper-back', 'front-deltoids', 'quadriceps', 'hamstring', 'gluteal',
]);

// Which lifts read as compounds for rest purposes.
function isCompound(ex) {
  if (!ex) return false;
  if (ex.equipment === 'barbell') return true;
  return ex.equipment === 'bodyweight' && BODYWEIGHT_COMPOUND_GROUPS.has(ex.muscleGroup);
}

// Exercises per day from the time budget (falls back to the level default).
export function sessionCount(sessionMinutes, level) {
  const base = (LEVEL_DEFAULTS[level] || LEVEL_DEFAULTS.beginner).count;
  if (!sessionMinutes) return base;
  const m = Number(sessionMinutes);
  const n = m <= 30 ? 4 : m <= 45 ? 5 : m <= 60 ? 6 : m <= 75 ? 7 : 8;
  return Math.max(3, Math.min(8, n));
}

// Nearest allowed days-per-week for a split.
export function resolveDays(split, days) {
  const def = SPLITS[split];
  if (!def) return days;
  if (def.days.includes(days)) return days;
  return def.days.reduce((best, d) => (Math.abs(d - days) < Math.abs(best - days) ? d : best), def.days[0]);
}

// Plan a whole week. Returns an array of day objects ready for createTemplate.
export function planWeek({ split, days, level = 'intermediate', sessionMinutes = 0, rest = 'standard', exercises = [], rng }) {
  const def = SPLITS[split];
  if (!def) return [];
  const dayCount = resolveDays(split, days);
  const blueprints = def.layout(dayCount);
  const weekdays = weekdayLayout(blueprints.length);
  const count = sessionCount(sessionMinutes, level);

  // A split can restrict what it will draw on — the home split takes bodyweight
  // only, so it never plans a session around a cable machine you don't own.
  const pool = def.equipment
    ? exercises.filter((e) => def.equipment.includes(e.equipment))
    : exercises;
  const byId = new Map(pool.map((e) => [e.id, e]));

  return blueprints.map((bp, i) => {
    const slots = generateRoutine({ exercises: pool, groups: bp.groups, level, count, rng });
    const withRest = slots.map((sl) => {
      const ex = byId.get(sl.exerciseId);
      // Bodyweight movements get calisthenics reps, and holds get seconds —
      // "Plank 4×8" means nothing. Everything else keeps the generator's targets.
      const bwTarget = targetFor(ex, level, null);
      return {
        exerciseId: sl.exerciseId,
        targetSets: bwTarget?.targetSets ?? sl.targetSets,
        targetReps: bwTarget?.targetReps ?? sl.targetReps,
        targetWeight: sl.targetWeight ?? null,
        targetRest: restFor(rest, isCompound(ex)),
      };
    });
    return { name: bp.name, dayOfWeek: weekdays[i] ?? null, autoKey: bp.key, groups: bp.groups, exercises: withRest };
  });
}
