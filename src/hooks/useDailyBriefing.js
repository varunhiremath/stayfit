import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { useNextSession } from './useNextSession.js';
import { buildBriefing, shouldBrief } from '../utils/dailyBriefing.js';
import { todayKey } from '../utils/dateKey.js';
import useSettingsStore from '../store/settingsStore.js';

// The most recent finished session plus the muscles it worked.
export function useLastWorkoutFocus() {
  return useLiveQuery(async () => {
    const workouts = await db.workouts.orderBy('createdAt').reverse().limit(1).toArray();
    const workout = workouts[0] ?? null;
    if (!workout) return { workout: null, muscleCounts: {} };

    const sets = (await db.sets.where('workoutId').equals(workout.id).toArray()).filter((s) => !s.isWarmup);
    const muscleCounts = {};
    const seen = {};
    for (const s of sets) {
      if (seen[s.exerciseId] === undefined) {
        const ex = await db.exercises.get(s.exerciseId);
        seen[s.exerciseId] = ex?.muscleGroup ?? null;
      }
      const g = seen[s.exerciseId];
      if (g) muscleCounts[g] = (muscleCounts[g] ?? 0) + 1;
    }
    return { workout, muscleCounts };
  }, []) ?? { workout: null, muscleCounts: {} };
}

// Everything the once-a-day briefing needs, plus whether it is due.
export function useDailyBriefing() {
  const plan = useNextSession();
  const last = useLastWorkoutFocus();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const lastBriefedDate = useSettingsStore((s) => s.lastBriefedDate);
  const markBriefed = useSettingsStore((s) => s.markBriefed);

  const today = todayKey();
  const due = shouldBrief({ lastBriefedDate, today, onboarded });
  const briefing = buildBriefing({ plan, last, today });

  return { due, briefing, plan, dismiss: () => markBriefed(today) };
}
