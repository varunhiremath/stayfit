import { create } from 'zustand';
import { db } from '../db/db.js';
import useUserStore from './userStore.js';
import { strengthKcal } from '../utils/calories.js';
import { computeVolume } from '../utils/volume.js';
import { getCurrentBodyweight } from '../utils/healthActions.js';
import { serialize, deserialize, isStale } from '../utils/workoutSession.js';
import { moveItem } from '../utils/reorder.js';
import { todayKey } from '../utils/dateKey.js';

const ACTIVE_KEY = 'opus_active_workout';

// Restore a non-stale in-progress session from a previous run (lock/reload).
function loadActive() {
  try {
    const saved = deserialize(localStorage.getItem(ACTIVE_KEY));
    if (saved && !isStale(saved)) return saved;
    if (saved) localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
  return null;
}

const restored = loadActive();

const useWorkoutStore = create((set, get) => ({
  activeWorkout: restored,
  resumed: !!restored,

  dismissResumed() {
    set({ resumed: false });
  },

  startWorkout(name = 'Workout', templateId = null) {
    set({
      resumed: false,
      activeWorkout: {
        id: null,
        name,
        templateId,
        startedAt: Date.now(),
        exercises: [],
      },
    });
  },

  setWorkoutName(name) {
    const w = get().activeWorkout;
    if (w) set({ activeWorkout: { ...w, name } });
  },

  setWorkoutNotes(notes) {
    const w = get().activeWorkout;
    if (w) set({ activeWorkout: { ...w, notes } });
  },

  startFromTemplate(template) {
    set({
      resumed: false,
      activeWorkout: {
        id: null,
        name: template.name,
        templateId: template.id,
        startedAt: Date.now(),
        exercises: (template.exercises ?? []).map(e => ({
          exerciseId: e.id,
          name: e.name,
          targetSets: e.targetSets ?? null,
          targetReps: e.targetReps ?? null,
          targetWeight: e.targetWeight ?? null,
          sets: [],
        })),
      },
    });
  },

  async repeatWorkout(workoutId) {
    const w = await db.workouts.get(workoutId);
    if (!w) return;
    const sets = await db.sets.where('workoutId').equals(workoutId).toArray();
    const orderedIds = [];
    for (const s of sets) if (!orderedIds.includes(s.exerciseId)) orderedIds.push(s.exerciseId);
    const exercises = [];
    for (const id of orderedIds) {
      const ex = await db.exercises.get(id);
      exercises.push({ exerciseId: id, name: ex?.name ?? 'Exercise', sets: [] });
    }
    set({
      resumed: false,
      activeWorkout: {
        id: null,
        name: w.name,
        templateId: w.templateId ?? null,
        startedAt: Date.now(),
        exercises,
      },
    });
  },

  addExercise(exercise) {
    const w = get().activeWorkout;
    if (!w) return;
    const already = w.exercises.find(e => e.exerciseId === exercise.id);
    if (already) return;
    set({
      activeWorkout: {
        ...w,
        exercises: [
          ...w.exercises,
          { exerciseId: exercise.id, name: exercise.name, sets: [] },
        ],
      },
    });
  },

  // Adds focused seconds to an exercise — WorkoutPage banks the time whenever
  // you switch away from an open card, so each one carries how long it took.
  accrueExerciseTime(exerciseId, secs) {
    const w = get().activeWorkout;
    if (!w || !(secs > 0)) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map((e) =>
          e.exerciseId !== exerciseId ? e : { ...e, activeSecs: (e.activeSecs ?? 0) + Math.round(secs) }
        ),
      },
    });
  },

  logSet(exerciseId, setData) {
    const w = get().activeWorkout;
    if (!w) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map(e =>
          e.exerciseId !== exerciseId
            ? e
            : {
                ...e,
                sets: [
                  ...e.sets,
                  { setNumber: e.sets.length + 1, completedAt: Date.now(), ...setData },
                ],
              }
        ),
      },
    });
  },

  setSetNote(exerciseId, setNumber, note) {
    const w = get().activeWorkout;
    if (!w) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map(e =>
          e.exerciseId !== exerciseId
            ? e
            : { ...e, sets: e.sets.map(s => (s.setNumber === setNumber ? { ...s, note } : s)) }
        ),
      },
    });
  },

  removeSet(exerciseId, setNumber) {
    const w = get().activeWorkout;
    if (!w) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map(e =>
          e.exerciseId !== exerciseId
            ? e
            : { ...e, sets: e.sets.filter(s => s.setNumber !== setNumber) }
        ),
      },
    });
  },

  toggleWarmup(exerciseId, setNumber) {
    const w = get().activeWorkout;
    if (!w) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map(e =>
          e.exerciseId !== exerciseId
            ? e
            : {
                ...e,
                sets: e.sets.map(s =>
                  s.setNumber === setNumber ? { ...s, isWarmup: !s.isWarmup } : s
                ),
              }
        ),
      },
    });
  },

  removeExercise(exerciseId) {
    const w = get().activeWorkout;
    if (!w) return;
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.filter(e => e.exerciseId !== exerciseId),
      },
    });
  },

  // Replace an exercise in the live session with another, keeping its logged
  // sets (0-set case is the common one — swapping before you start lifting).
  swapExercise(oldId, exercise) {
    const w = get().activeWorkout;
    if (!w || oldId === exercise.id) return;
    if (w.exercises.some(e => e.exerciseId === exercise.id)) return; // no duplicates
    set({
      activeWorkout: {
        ...w,
        exercises: w.exercises.map(e =>
          e.exerciseId !== oldId ? e : { ...e, exerciseId: exercise.id, name: exercise.name }
        ),
      },
    });
  },

  // Reorder an exercise up (-1) or down (+1).
  moveExercise(exerciseId, dir) {
    const w = get().activeWorkout;
    if (!w) return;
    const i = w.exercises.findIndex((e) => e.exerciseId === exerciseId);
    if (i < 0) return;
    const exercises = moveItem(w.exercises, i, dir);
    if (exercises === w.exercises) return;
    set({ activeWorkout: { ...w, exercises } });
  },


  async completeWorkout() {
    const w = get().activeWorkout;
    if (!w) return null;
    const duration = Math.round((Date.now() - w.startedAt) / 1000);
    const allSets = w.exercises.flatMap(e => e.sets);
    const workingSets = allSets.filter(s => !s.isWarmup);
    const totalSets = workingSets.length;
    const today = todayKey();

    // Don't save an empty session — discard it instead.
    if (totalSets === 0) {
      set({ activeWorkout: null, resumed: false });
      return { discarded: true };
    }

    // Bodyweight counts toward volume; snapshot bodyweight for accurate history.
    const bodyweightKg = await getCurrentBodyweight();
    const flatSets = w.exercises.flatMap((e) => e.sets.map((s) => ({ ...s, exerciseId: e.exerciseId })));
    const totalVolume = await computeVolume(flatSets, bodyweightKg);

    // Calories: cardio bouts carry a precise (ACSM/MET) figure; lifting is a MET
    // estimate over the non-cardio portion of the session.
    const cardioKcal = allSets.reduce((a, s) => a + (s.calories || 0), 0);
    const cardioMin = allSets.reduce((a, s) => a + (s.durationSec || 0), 0) / 60;
    const hasStrength = allSets.some((s) => !s.isCardio && !s.isWarmup && ((s.weight || 0) > 0 || (s.reps || 0) > 0));
    const strengthMin = hasStrength ? Math.max(0, duration / 60 - cardioMin) : 0;
    const totalCalories = Math.round(cardioKcal + strengthKcal({ weightKg: bodyweightKg ?? 70, minutes: strengthMin }));

    const workoutId = await db.workouts.add({
      date: today,
      templateId: w.templateId,
      name: w.name,
      status: 'completed',
      duration,
      notes: w.notes ?? '',
      totalVolume,
      totalCalories,
      totalSets,
      bodyweightKg,
      // Seconds focused on each exercise, keyed by exercise id. Unindexed, so
      // Dexie stores it without a migration.
      exerciseTimes: Object.fromEntries(
        w.exercises.filter((e) => e.activeSecs > 0).map((e) => [e.exerciseId, e.activeSecs])
      ),
      createdAt: Date.now(),
    });

    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        await db.sets.add({
          workoutId,
          exerciseId: ex.exerciseId,
          setNumber: s.setNumber,
          reps: s.reps ?? 0,
          weight: s.weight ?? 0,
          rpe: s.rpe ?? null,
          isWarmup: s.isWarmup ?? false,
          note: s.note ?? null,
          completedAt: s.completedAt,
          isCardio: s.isCardio ?? false,
          durationSec: s.durationSec ?? null,
          speedKmh: s.speedKmh ?? null,
          incline: s.incline ?? null,
          distanceKm: s.distanceKm ?? null,
          calories: s.calories ?? 0,
        });
      }
    }

    // PR detection — a fitness feature, kept (no XP reward attached).
    let prCount = 0;
    for (const ex of w.exercises) {
      const working = ex.sets.filter(s => !s.isWarmup && (s.weight > 0 || s.reps > 0));
      if (!working.length) continue;
      const maxWeight = Math.max(...working.map(s => s.weight));
      const maxReps = Math.max(...working.map(s => s.reps));
      const maxVol = Math.max(...working.map(s => s.weight * s.reps));
      const existing = await db.prs.where('exerciseId').equals(ex.exerciseId).toArray();
      const upsert = async (type, value) => {
        if (value <= 0) return;
        const prev = existing.find(p => p.type === type);
        if (!prev || value > prev.value) {
          const record = { exerciseId: ex.exerciseId, type, value, achievedAt: Date.now(), workoutId };
          if (prev) await db.prs.put({ ...prev, ...record });
          else await db.prs.add(record);
          prCount += 1;
        }
      };
      await upsert('weight', maxWeight);
      await upsert('reps', maxReps);
      await upsert('volume', maxVol);
    }

    // Streak — a plain consecutive-days counter (no XP, no rewards).
    const userStore = useUserStore.getState();
    const profile = userStore.profile;
    if (profile && profile.lastWorkoutDate !== today) {
      const yesterday = todayKey(new Date(Date.now() - 86400000));
      const streak = profile.lastWorkoutDate === yesterday ? (profile.streak ?? 0) + 1 : 1;
      await userStore.updateProfile({ lastWorkoutDate: today, streak });
    }

    set({ activeWorkout: null, resumed: false });
    return { workoutId, prCount, totalVolume, totalCalories, totalSets, duration };
  },

  discardWorkout() {
    set({ activeWorkout: null, resumed: false });
  },
}));

// Write-through: mirror the active session to localStorage on every change so a
// lock/reload restores it; clear it when the workout ends.
if (typeof window !== 'undefined') {
  useWorkoutStore.subscribe((state) => {
    try {
      if (state.activeWorkout) localStorage.setItem(ACTIVE_KEY, serialize(state.activeWorkout));
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  });
}

export default useWorkoutStore;
