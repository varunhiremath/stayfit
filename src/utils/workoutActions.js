import { db } from '../db/db.js';

// Rebuild PR records for an exercise from its remaining (non-warmup) sets.
export async function recomputePRs(exerciseId) {
  await db.prs.where('exerciseId').equals(exerciseId).delete();
  const sets = (await db.sets.where('exerciseId').equals(exerciseId).toArray()).filter((s) => !s.isWarmup);
  if (!sets.length) return;
  const maxWeight = Math.max(...sets.map((s) => s.weight));
  const maxReps = Math.max(...sets.map((s) => s.reps));
  const maxVol = Math.max(...sets.map((s) => s.weight * s.reps));
  const add = async (type, value) => {
    if (value > 0) await db.prs.add({ exerciseId, type, value, achievedAt: Date.now(), workoutId: null });
  };
  await add('weight', maxWeight);
  await add('reps', maxReps);
  await add('volume', maxVol);
}

// Recompute the plain consecutive-days streak from remaining workouts.
export async function recomputeStreak() {
  const workouts = await db.workouts.toArray();
  const dates = [...new Set(workouts.map((w) => w.date))].sort();
  let streak = 0;
  let lastWorkoutDate = null;
  if (dates.length) {
    lastWorkoutDate = dates[dates.length - 1];
    streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
  }

  const { default: useUserStore } = await import('../store/userStore.js');
  const store = useUserStore.getState();
  if (store.profile) {
    await store.updateProfile({ streak, lastWorkoutDate });
  } else {
    const profile = await db.userProfile.get(1);
    if (profile) await db.userProfile.put({ ...profile, streak, lastWorkoutDate });
  }
}

// Deletes a workout and reverses everything it contributed:
// its sets, energy log, PR records (recomputed), any linked stretch logs, and
// the streak counter.
export async function deleteWorkout(workoutId) {
  const workout = await db.workouts.get(workoutId);
  if (!workout) return;

  const sets = await db.sets.where('workoutId').equals(workoutId).toArray();
  const affected = [...new Set(sets.map((s) => s.exerciseId))];

  await db.sets.where('workoutId').equals(workoutId).delete();
  await db.energyLogs.where('workoutId').equals(workoutId).delete();
  // Stretch logs linked to this workout (table added in DB v10) — unlink so a
  // deleted workout leaves no dangling reference.
  if (db.stretchLogs) {
    const linked = await db.stretchLogs.where('workoutId').equals(workoutId).toArray();
    for (const l of linked) await db.stretchLogs.update(l.id, { workoutId: null });
  }
  await db.workouts.delete(workoutId);

  for (const exId of affected) await recomputePRs(exId);
  await recomputeStreak();
}
