// How an active session is organised on screen: what's still to do, what's
// already done, and which same-muscle alternatives you could swap in.
//
// Pure — WorkoutPage owns the "which card is open" state and feeds it in.

// An exercise counts as started once it has any logged set.
export function isLogged(exercise) {
  return (exercise?.sets?.length ?? 0) > 0;
}

// Split the session into the list you're working through and the ones already
// done. The open card always stays in `todo`, so finishing a set never yanks
// the card you're looking at out from under you — it moves once you open
// another exercise.
export function partitionSession(exercises = [], activeId = null) {
  const todo = [];
  const done = [];
  for (const ex of exercises) {
    if (isLogged(ex) && ex.exerciseId !== activeId) done.push(ex);
    else todo.push(ex);
  }
  return { todo, done };
}

// The exercise to open by default: the first one with nothing logged yet.
export function nextUpId(exercises = []) {
  const next = exercises.find((e) => !isLogged(e));
  return next ? next.exerciseId : null;
}

// After finishing with `justClosedId`, the next unstarted exercise to move to.
export function advanceFrom(exercises = [], justClosedId = null) {
  const rest = exercises.filter((e) => e.exerciseId !== justClosedId);
  return nextUpId(rest);
}

// Alternatives in the same muscle group that aren't already in the session.
export function swapCandidates({ muscleGroup, catalog = [], sessionIds = [], limit = 4 }) {
  if (!muscleGroup) return [];
  const inSession = new Set(sessionIds);
  return catalog
    .filter((e) => e.muscleGroup === muscleGroup && !inSession.has(e.id))
    .slice(0, limit);
}

// Working-set totals for a card's summary line.
export function summarise(exercise) {
  const working = (exercise?.sets ?? []).filter((s) => !s.isWarmup);
  return {
    sets: working.length,
    reps: working.reduce((a, s) => a + (s.reps || 0), 0),
    volumeKg: working.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0),
  };
}

// Overall session progress, for the header bar.
export function sessionProgress(exercises = []) {
  const total = exercises.length;
  const completed = exercises.filter(isLogged).length;
  return { total, completed, pct: total ? completed / total : 0 };
}

// mm:ss, or h:mm:ss once past an hour — the big elapsed clock.
export function formatElapsed(secs) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
