// Pure logic for the guided stretch runner: turning a routine into a timed
// sequence, and answering "where am I?" for any elapsed time. No DOM, no DB —
// the component owns the ticking clock and just asks these functions.

// Total seconds for a routine's items.
export function totalDuration(items = []) {
  return items.reduce((a, i) => a + (i.durationSec || 0), 0);
}

// Cumulative timeline: each step gains its absolute start/end offset in seconds.
export function buildSequence(items = []) {
  let at = 0;
  return items.map((item, index) => {
    const durationSec = item.durationSec || 0;
    const step = { ...item, index, startAt: at, endAt: at + durationSec, durationSec };
    at += durationSec;
    return step;
  });
}

// Which step is active at `elapsed` seconds, and how far into it we are.
// Past the end, returns `done` with the last step retained for display.
export function stepAt(sequence, elapsed) {
  if (!sequence.length) return { done: true, step: null, index: -1, remaining: 0, stepElapsed: 0, progress: 1 };
  const total = sequence[sequence.length - 1].endAt;
  if (elapsed >= total) {
    const last = sequence[sequence.length - 1];
    return { done: true, step: last, index: sequence.length - 1, remaining: 0, stepElapsed: last.durationSec, progress: 1 };
  }
  const i = sequence.findIndex((s) => elapsed < s.endAt);
  const step = sequence[i];
  const stepElapsed = Math.max(0, elapsed - step.startAt);
  return {
    done: false,
    step,
    index: i,
    stepElapsed,
    remaining: Math.max(0, step.endAt - elapsed),
    progress: step.durationSec > 0 ? Math.min(1, stepElapsed / step.durationSec) : 1,
  };
}

// Elapsed seconds at the start of a step — used when skipping forward/back.
export function seekToStep(sequence, index) {
  if (!sequence.length) return 0;
  const i = Math.max(0, Math.min(index, sequence.length - 1));
  return sequence[i].startAt;
}

// mm:ss for the countdown display.
export function formatClock(secs) {
  const s = Math.max(0, Math.round(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// The log row for a finished (or ended-early) session. `elapsed` is what the
// user actually did, so bailing halfway still logs honest time.
export function buildLog({ routine, elapsed, date, phase, workoutId = null }) {
  return {
    date,
    phase: phase ?? routine?.phase ?? 'pre',
    routineId: routine?.id ?? null,
    routineName: routine?.name ?? 'Stretch',
    durationSec: Math.max(0, Math.round(elapsed)),
    workoutId,
    completedAt: Date.now(),
  };
}
