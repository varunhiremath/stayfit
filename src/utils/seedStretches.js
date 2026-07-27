// StayFit stretch & mobility catalogue.
//
// `type`     'dynamic' (pre-workout, movement-based) | 'static' (post-workout,
//            hold-and-breathe) | 'mobility' (joint prep, either phase).
// `bodyArea` the region it targets — mirrors the muscle vocabulary used by the
//            exercise catalogue where it overlaps.
// `durationSec` the default hold/perform time used by the guided runner.
//
// Pure data + resolvers, so it is unit-testable with no DB.

export const BODY_AREAS = [
  'neck', 'shoulders', 'chest', 'back', 'hips', 'glutes',
  'hamstrings', 'quads', 'calves', 'ankles', 'wrists', 'full-body',
];

const seed = [
  // ── Dynamic — pre-workout ────────────────────────────────────────────────
  { name: 'Arm Circles',              type: 'dynamic', bodyArea: 'shoulders',  durationSec: 30, difficulty: 'beginner',
    description: 'Big slow circles forward, then backward. Open the shoulders without forcing the range.' },
  { name: 'Leg Swings (Front–Back)',  type: 'dynamic', bodyArea: 'hips',       durationSec: 30, difficulty: 'beginner',
    description: 'Hold something steady. Swing one leg front to back, relaxed, growing the range each rep.' },
  { name: 'Leg Swings (Side–Side)',   type: 'dynamic', bodyArea: 'hips',       durationSec: 30, difficulty: 'beginner',
    description: 'Swing the leg across the body and out. Keep hips square and the torso tall.' },
  { name: 'Cat–Cow',                  type: 'dynamic', bodyArea: 'back',       durationSec: 40, difficulty: 'beginner',
    description: 'On all fours, alternate arching and rounding the spine with your breath.' },
  { name: 'World’s Greatest Stretch', type: 'dynamic', bodyArea: 'hips',  durationSec: 60, difficulty: 'intermediate',
    description: 'Deep lunge, elbow to instep, then rotate the top arm to the sky. Alternate sides.' },
  { name: 'Walking Lunge with Twist', type: 'dynamic', bodyArea: 'hips',       durationSec: 45, difficulty: 'intermediate',
    description: 'Step into a lunge and rotate the torso over the front leg. Controlled, not bouncy.' },
  { name: 'Inchworm',                 type: 'dynamic', bodyArea: 'hamstrings', durationSec: 45, difficulty: 'intermediate',
    description: 'Hinge, walk the hands out to a plank, walk the feet in. Keep the legs as straight as comfortable.' },
  { name: 'Torso Twists',             type: 'dynamic', bodyArea: 'back',       durationSec: 30, difficulty: 'beginner',
    description: 'Feet planted, rotate side to side with loose arms. Let the spine wake up.' },
  { name: 'High Knees',               type: 'dynamic', bodyArea: 'full-body',  durationSec: 30, difficulty: 'beginner',
    description: 'Light jog on the spot, driving the knees up. Raises the heart rate before lifting.' },
  { name: 'Band Pull-Apart',          type: 'dynamic', bodyArea: 'shoulders',  durationSec: 30, difficulty: 'beginner',
    description: 'Arms straight, pull a light band apart across the chest. Great before pressing.' },
  { name: 'Bodyweight Squat to Stand', type: 'dynamic', bodyArea: 'hips',      durationSec: 45, difficulty: 'beginner',
    description: 'Hold the toes, sink into a deep squat, lift the chest, then straighten the legs.' },
  { name: 'Ankle Rocks',              type: 'dynamic', bodyArea: 'ankles',     durationSec: 30, difficulty: 'beginner',
    description: 'In a half-kneel, drive the front knee over the toes and back. Prepares squats.' },
  { name: 'Wrist Rolls',              type: 'dynamic', bodyArea: 'wrists',     durationSec: 30, difficulty: 'beginner',
    description: 'Circle the wrists, then gently flex and extend. Essential before front racks and presses.' },

  // ── Static — post-workout ────────────────────────────────────────────────
  { name: 'Standing Hamstring Stretch', type: 'static', bodyArea: 'hamstrings', durationSec: 40, difficulty: 'beginner',
    description: 'Hinge at the hips over a near-straight leg. Feel it behind the thigh, not the lower back.' },
  { name: 'Quad Stretch',             type: 'static', bodyArea: 'quads',       durationSec: 40, difficulty: 'beginner',
    description: 'Heel toward the glute, knees together, hips pushed slightly forward.' },
  { name: 'Pigeon Pose',              type: 'static', bodyArea: 'glutes',      durationSec: 60, difficulty: 'intermediate',
    description: 'Front shin across the mat, back leg long. Sink the hips and breathe into the glute.' },
  { name: 'Figure-Four Stretch',      type: 'static', bodyArea: 'glutes',      durationSec: 40, difficulty: 'beginner',
    description: 'On your back, ankle over the opposite knee, pull the thigh toward you.' },
  { name: 'Child’s Pose',        type: 'static', bodyArea: 'back',        durationSec: 60, difficulty: 'beginner',
    description: 'Knees wide, hips to heels, arms long. Let the lower back decompress.' },
  { name: 'Doorway Chest Stretch',    type: 'static', bodyArea: 'chest',       durationSec: 40, difficulty: 'beginner',
    description: 'Forearm on the frame at 90°, step through gently. Opens the chest after pressing.' },
  { name: 'Cross-Body Shoulder Stretch', type: 'static', bodyArea: 'shoulders', durationSec: 30, difficulty: 'beginner',
    description: 'Draw one arm across the chest with the opposite hand. Keep the shoulder down.' },
  { name: 'Triceps Overhead Stretch', type: 'static', bodyArea: 'shoulders',   durationSec: 30, difficulty: 'beginner',
    description: 'Hand behind the neck, gently press the elbow back with the other hand.' },
  { name: 'Seated Forward Fold',      type: 'static', bodyArea: 'hamstrings',  durationSec: 50, difficulty: 'beginner',
    description: 'Legs long, hinge forward with a flat back. Breathe out into the stretch.' },
  { name: 'Calf Stretch on Wall',     type: 'static', bodyArea: 'calves',      durationSec: 40, difficulty: 'beginner',
    description: 'Back leg straight, heel down, hips forward. Then bend the knee to reach the soleus.' },
  { name: 'Couch Stretch',            type: 'static', bodyArea: 'quads',       durationSec: 60, difficulty: 'advanced',
    description: 'Rear foot elevated against a wall in a half-kneel. Intense hip-flexor and quad opener.' },
  { name: 'Supine Spinal Twist',      type: 'static', bodyArea: 'back',        durationSec: 50, difficulty: 'beginner',
    description: 'On your back, drop both knees to one side, arms wide, look the other way.' },
  { name: 'Butterfly Stretch',        type: 'static', bodyArea: 'hips',        durationSec: 50, difficulty: 'beginner',
    description: 'Soles together, knees falling open. Sit tall and hinge forward slightly.' },
  { name: 'Neck Side Stretch',        type: 'static', bodyArea: 'neck',        durationSec: 30, difficulty: 'beginner',
    description: 'Ear toward the shoulder, opposite shoulder relaxed down. Never force the neck.' },
  { name: 'Lat Stretch on Rack',      type: 'static', bodyArea: 'back',        durationSec: 40, difficulty: 'beginner',
    description: 'Hold a rack, sit the hips back and let the ribs drop. Lengthens the lats after pulling.' },

  // ── Mobility — either phase ──────────────────────────────────────────────
  { name: 'Hip CARs',                 type: 'mobility', bodyArea: 'hips',      durationSec: 45, difficulty: 'intermediate',
    description: 'Controlled articular rotations — draw the biggest slow circle you can with the knee.' },
  { name: 'Shoulder Pass-Through',    type: 'mobility', bodyArea: 'shoulders', durationSec: 40, difficulty: 'beginner',
    description: 'Wide grip on a band or stick, pass it overhead and behind with straight arms.' },
  { name: 'Thoracic Extension',       type: 'mobility', bodyArea: 'back',      durationSec: 45, difficulty: 'intermediate',
    description: 'Upper back over a foam roller or bench edge, open the chest over the support.' },
  { name: '90/90 Hip Switch',         type: 'mobility', bodyArea: 'hips',      durationSec: 60, difficulty: 'intermediate',
    description: 'Seated with both knees at 90°, rotate side to side without using the hands.' },
];

// Catalogue rows, ready for db.stretches.bulkAdd (isCustom flag added).
export function stretchSeed() {
  return seed.map((s) => ({ ...s, isCustom: false }));
}

// Bundled routines, referencing stretches by NAME (resolved to ids at seed time
// so the data stays declarative and testable).
export const STRETCH_ROUTINES = [
  {
    name: 'Full-Body Warm-Up',
    phase: 'pre',
    bodyArea: 'full-body',
    items: ['Arm Circles', 'Torso Twists', 'Leg Swings (Front–Back)', 'Cat–Cow', 'Bodyweight Squat to Stand', 'High Knees'],
  },
  {
    name: 'Upper-Body Warm-Up',
    phase: 'pre',
    bodyArea: 'shoulders',
    items: ['Arm Circles', 'Band Pull-Apart', 'Shoulder Pass-Through', 'Wrist Rolls', 'Cat–Cow'],
  },
  {
    name: 'Lower-Body Warm-Up',
    phase: 'pre',
    bodyArea: 'hips',
    items: ['Leg Swings (Front–Back)', 'Leg Swings (Side–Side)', 'Ankle Rocks', 'Bodyweight Squat to Stand', 'World’s Greatest Stretch'],
  },
  {
    name: 'Full-Body Cool-Down',
    phase: 'post',
    bodyArea: 'full-body',
    items: ['Standing Hamstring Stretch', 'Quad Stretch', 'Figure-Four Stretch', 'Child’s Pose', 'Supine Spinal Twist'],
  },
  {
    name: 'Upper-Body Cool-Down',
    phase: 'post',
    bodyArea: 'chest',
    items: ['Doorway Chest Stretch', 'Cross-Body Shoulder Stretch', 'Triceps Overhead Stretch', 'Lat Stretch on Rack', 'Neck Side Stretch'],
  },
  {
    name: 'Lower-Body Cool-Down',
    phase: 'post',
    bodyArea: 'hamstrings',
    items: ['Seated Forward Fold', 'Quad Stretch', 'Pigeon Pose', 'Calf Stretch on Wall', 'Butterfly Stretch'],
  },
  {
    name: 'Hip Mobility Flow',
    phase: 'post',
    bodyArea: 'hips',
    items: ['90/90 Hip Switch', 'Hip CARs', 'Pigeon Pose', 'Butterfly Stretch', 'Couch Stretch'],
  },
  {
    name: 'Desk Recovery',
    phase: 'post',
    bodyArea: 'back',
    items: ['Neck Side Stretch', 'Doorway Chest Stretch', 'Thoracic Extension', 'Child’s Pose', 'Supine Spinal Twist'],
  },
];

// Every distinct stretch name the bundled routines reference.
export function routineStretchNames() {
  return [...new Set(STRETCH_ROUTINES.flatMap((r) => r.items))];
}

// Resolve a bundled routine into a DB-ready row. `nameToId` maps a catalogue
// stretch name → its id; unresolved names are skipped.
export function resolveRoutine(routine, nameToId = {}, byName = {}) {
  return {
    name: routine.name,
    phase: routine.phase,
    bodyArea: routine.bodyArea,
    isCustom: false,
    items: routine.items
      .map((n) => ({ stretchId: nameToId[n], durationSec: byName[n]?.durationSec ?? 30 }))
      .filter((i) => i.stretchId != null),
  };
}

export default seed;
