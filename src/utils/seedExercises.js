// Curated exercise list — covers all 17 muscle groups with the movements people actually use.
// difficulty: 'beginner' | 'intermediate' | 'advanced'

// Hip abduction (outer hip) and adduction (inner thigh). Exported separately so
// `ensureSeedExercises` can add them to databases seeded before they existed.
export const HIP_EXERCISES = [
  { name: 'Hip Abduction Machine',  muscleGroup: 'abductors',      equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Cable Hip Abduction',    muscleGroup: 'abductors',      equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Clamshell',              muscleGroup: 'abductors',      equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Side-Lying Leg Raise',   muscleGroup: 'abductors',      equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Lateral Band Walk',      muscleGroup: 'abductors',      equipment: 'bodyweight', difficulty: 'intermediate' },

  { name: 'Hip Adduction Machine',  muscleGroup: 'adductor',       equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Cable Hip Adduction',    muscleGroup: 'adductor',       equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Lateral Lunge',          muscleGroup: 'adductor',       equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Sumo Squat',             muscleGroup: 'adductor',       equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Cossack Squat',          muscleGroup: 'adductor',       equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Copenhagen Plank',       muscleGroup: 'adductor',       equipment: 'bodyweight', difficulty: 'advanced'     },
];

// Bodyweight work you can do in a living room. Exported separately so
// `ensureSeedExercises` can add them to databases seeded before they existed.
//
// The spread is deliberate: every block below covers a push, a pull, a squat
// and a core movement at three difficulties, so the Home split can build a
// balanced session and you can trade up a rung as a movement gets easy
// (knee → incline → full → decline → archer push-up, and so on).
export const HOME_EXERCISES = [
  // Push — chest
  { name: 'Knee Push-Up',           muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Incline Push-Up',        muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Wide Push-Up',           muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Decline Push-Up',        muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Archer Push-Up',         muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'advanced'     },
  { name: 'Pseudo Planche Push-Up', muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'advanced'     },

  // Push — triceps & shoulders
  { name: 'Bench Dip',              muscleGroup: 'triceps',        equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Pike Push-Up',           muscleGroup: 'front-deltoids', equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Wall Handstand Hold',    muscleGroup: 'front-deltoids', equipment: 'bodyweight', difficulty: 'advanced'     },

  // Pull — the hard part without a gym, so it starts from a towel and a door
  { name: 'Towel Row',              muscleGroup: 'upper-back',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Inverted Row',           muscleGroup: 'upper-back',     equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Negative Pull-Up',       muscleGroup: 'upper-back',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Reverse Snow Angel',     muscleGroup: 'back-deltoids',  equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Prone Y Raise',          muscleGroup: 'trapezius',      equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Superman',               muscleGroup: 'lower-back',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Bird Dog',               muscleGroup: 'lower-back',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Towel Curl',             muscleGroup: 'biceps',         equipment: 'bodyweight', difficulty: 'beginner'     },

  // Legs
  { name: 'Bodyweight Squat',       muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Split Squat',            muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Step-Up',                muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Wall Sit',               muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Jump Squat',             muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Burpee',                 muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Pistol Squat',           muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'advanced'     },
  { name: 'Single-Leg RDL',         muscleGroup: 'hamstring',      equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Single-Leg Glute Bridge',muscleGroup: 'gluteal',        equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Donkey Kick',            muscleGroup: 'gluteal',        equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Single-Leg Calf Raise',  muscleGroup: 'calves',         equipment: 'bodyweight', difficulty: 'beginner'     },

  // Core
  { name: 'Dead Bug',               muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Lying Leg Raise',        muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Mountain Climber',       muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Flutter Kick',           muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Hollow Body Hold',       muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'V-Up',                   muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Bear Crawl',             muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Bicycle Crunch',         muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Heel Touch',             muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Side Plank Dip',         muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'intermediate' },
];

const seed = [
  // ── Chest ─────────────────────────────────────────────────────────────────
  { name: 'Push-Up',                muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Dumbbell Flye',          muscleGroup: 'chest',          equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Bench Press',            muscleGroup: 'chest',          equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Incline Bench Press',    muscleGroup: 'chest',          equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Dumbbell Bench Press',   muscleGroup: 'chest',          equipment: 'dumbbell',   difficulty: 'intermediate' },
  { name: 'Decline Bench Press',    muscleGroup: 'chest',          equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Cable Crossover',        muscleGroup: 'chest',          equipment: 'cable',      difficulty: 'intermediate' },
  { name: 'Chest Dip',              muscleGroup: 'chest',          equipment: 'bodyweight', difficulty: 'advanced'     },

  // ── Triceps ───────────────────────────────────────────────────────────────
  { name: 'Diamond Push-Up',        muscleGroup: 'triceps',        equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Overhead Tricep Ext.',   muscleGroup: 'triceps',        equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Tricep Pushdown',        muscleGroup: 'triceps',        equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Close-Grip Bench Press', muscleGroup: 'triceps',        equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Skull Crusher',          muscleGroup: 'triceps',        equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Tricep Dip',             muscleGroup: 'triceps',        equipment: 'bodyweight', difficulty: 'intermediate' },

  // ── Biceps ────────────────────────────────────────────────────────────────
  { name: 'Dumbbell Curl',          muscleGroup: 'biceps',         equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Hammer Curl',            muscleGroup: 'biceps',         equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Concentration Curl',     muscleGroup: 'biceps',         equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Barbell Curl',           muscleGroup: 'biceps',         equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Preacher Curl',          muscleGroup: 'biceps',         equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Cable Curl',             muscleGroup: 'biceps',         equipment: 'cable',      difficulty: 'intermediate' },

  // ── Front Deltoids / Shoulders ────────────────────────────────────────────
  { name: 'Lateral Raise',          muscleGroup: 'front-deltoids', equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Front Raise',            muscleGroup: 'front-deltoids', equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Dumbbell Shoulder Press',muscleGroup: 'front-deltoids', equipment: 'dumbbell',   difficulty: 'intermediate' },
  { name: 'Arnold Press',           muscleGroup: 'front-deltoids', equipment: 'dumbbell',   difficulty: 'intermediate' },
  { name: 'Overhead Press',         muscleGroup: 'front-deltoids', equipment: 'barbell',    difficulty: 'advanced'     },

  // ── Rear Deltoids ─────────────────────────────────────────────────────────
  { name: 'Reverse Flye',           muscleGroup: 'back-deltoids',  equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Face Pull',              muscleGroup: 'back-deltoids',  equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Rear Delt Row',          muscleGroup: 'back-deltoids',  equipment: 'dumbbell',   difficulty: 'intermediate' },

  // ── Upper Back ────────────────────────────────────────────────────────────
  { name: 'Cable Row',              muscleGroup: 'upper-back',     equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Dumbbell Row',           muscleGroup: 'upper-back',     equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Lat Pulldown',           muscleGroup: 'upper-back',     equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Chest-Supported Row',    muscleGroup: 'upper-back',     equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Barbell Row',            muscleGroup: 'upper-back',     equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Pull-Up',                muscleGroup: 'upper-back',     equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Chin-Up',                muscleGroup: 'upper-back',     equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'T-Bar Row',              muscleGroup: 'upper-back',     equipment: 'barbell',    difficulty: 'advanced'     },

  // ── Trapezius ─────────────────────────────────────────────────────────────
  { name: 'Dumbbell Shrug',         muscleGroup: 'trapezius',      equipment: 'dumbbell',   difficulty: 'beginner'     },
  { name: 'Cable Shrug',            muscleGroup: 'trapezius',      equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Barbell Shrug',          muscleGroup: 'trapezius',      equipment: 'barbell',    difficulty: 'intermediate' },

  // ── Lower Back ────────────────────────────────────────────────────────────
  { name: 'Back Extension',         muscleGroup: 'lower-back',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Romanian Deadlift',      muscleGroup: 'lower-back',     equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Good Morning',           muscleGroup: 'lower-back',     equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Deadlift',               muscleGroup: 'lower-back',     equipment: 'barbell',    difficulty: 'advanced'     },

  // ── Abs ───────────────────────────────────────────────────────────────────
  { name: 'Crunch',                 muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Sit-Up',                 muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Plank',                  muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Cable Crunch',           muscleGroup: 'abs',            equipment: 'cable',      difficulty: 'intermediate' },
  { name: 'Hanging Leg Raise',      muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Ab Wheel Rollout',       muscleGroup: 'abs',            equipment: 'bodyweight', difficulty: 'advanced'     },

  // ── Obliques ──────────────────────────────────────────────────────────────
  { name: 'Side Plank',             muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Oblique Crunch',         muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Russian Twist',          muscleGroup: 'obliques',       equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Cable Woodchop',         muscleGroup: 'obliques',       equipment: 'cable',      difficulty: 'intermediate' },

  // ── Quadriceps ────────────────────────────────────────────────────────────
  { name: 'Leg Press',              muscleGroup: 'quadriceps',     equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Leg Extension',          muscleGroup: 'quadriceps',     equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Lunges',                 muscleGroup: 'quadriceps',     equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Bulgarian Split Squat',  muscleGroup: 'quadriceps',     equipment: 'dumbbell',   difficulty: 'intermediate' },
  { name: 'Hack Squat',             muscleGroup: 'quadriceps',     equipment: 'machine',    difficulty: 'intermediate' },
  { name: 'Back Squat',             muscleGroup: 'quadriceps',     equipment: 'barbell',    difficulty: 'advanced'     },
  { name: 'Front Squat',            muscleGroup: 'quadriceps',     equipment: 'barbell',    difficulty: 'advanced'     },

  // ── Hamstrings ────────────────────────────────────────────────────────────
  { name: 'Lying Leg Curl',         muscleGroup: 'hamstring',      equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Seated Leg Curl',        muscleGroup: 'hamstring',      equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Stiff-Leg Deadlift',     muscleGroup: 'hamstring',      equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Nordic Curl',            muscleGroup: 'hamstring',      equipment: 'bodyweight', difficulty: 'advanced'     },

  // ── Glutes ────────────────────────────────────────────────────────────────
  { name: 'Glute Bridge',           muscleGroup: 'gluteal',        equipment: 'bodyweight', difficulty: 'beginner'     },
  { name: 'Cable Kickback',         muscleGroup: 'gluteal',        equipment: 'cable',      difficulty: 'beginner'     },
  { name: 'Hip Thrust',             muscleGroup: 'gluteal',        equipment: 'barbell',    difficulty: 'intermediate' },
  { name: 'Sumo Deadlift',          muscleGroup: 'gluteal',        equipment: 'barbell',    difficulty: 'advanced'     },

  // ── Calves ────────────────────────────────────────────────────────────────
  { name: 'Seated Calf Raise',      muscleGroup: 'calves',         equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Standing Calf Raise',    muscleGroup: 'calves',         equipment: 'machine',    difficulty: 'beginner'     },
  { name: 'Donkey Calf Raise',      muscleGroup: 'calves',         equipment: 'bodyweight', difficulty: 'intermediate' },

  // ── Forearms ──────────────────────────────────────────────────────────────
  { name: 'Wrist Curl',             muscleGroup: 'forearm',        equipment: 'barbell',    difficulty: 'beginner'     },
  { name: 'Reverse Wrist Curl',     muscleGroup: 'forearm',        equipment: 'barbell',    difficulty: 'beginner'     },
  { name: "Farmer's Walk",          muscleGroup: 'forearm',        equipment: 'dumbbell',   difficulty: 'intermediate' },

  // ── Hips ──────────────────────────────────────────────────────────────────
  // Appended last on purpose: ids below are positional (`i + 1`), so inserting
  // these mid-list would renumber every exercise after them and orphan the sets
  // already logged against those ids. `abductors` / `adductor` are the
  // react-body-highlighter slugs (singular adductor is theirs, not a typo), so
  // the body map highlights them.
  ...HIP_EXERCISES,

  // ── Home / calisthenics ───────────────────────────────────────────────────
  // Appended after the hips for the same reason: ids are positional, so new
  // movements only ever go on the end.
  ...HOME_EXERCISES,
];

export default seed.map((e, i) => ({
  ...e,
  id: i + 1,
  secondaryMuscles: [],
  description: '',
  isCustom: false,
  wgerId: null,
}));
