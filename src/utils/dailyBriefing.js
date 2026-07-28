// The "here's where you're at" briefing shown once a day when the app opens:
// how long since the last session and what it worked, what's on today's plan,
// and the alternatives if today's plan doesn't suit.
//
// Pure — the hook supplies workouts, the muscle lookup and today's plan.

import { daysBetween, todayKey } from './dateKey.js';

// Coarse groupings so the summary reads like a person would say it, rather
// than listing the granular stored muscle tokens.
export const FOCUS_GROUPS = {
  chest: 'Chest', triceps: 'Arms', biceps: 'Arms', forearm: 'Arms',
  'front-deltoids': 'Shoulders', 'back-deltoids': 'Shoulders', trapezius: 'Shoulders',
  'upper-back': 'Back', 'lower-back': 'Back',
  abs: 'Core', obliques: 'Core',
  quadriceps: 'Legs', hamstring: 'Legs', gluteal: 'Legs', calves: 'Legs',
  abductors: 'Legs', adductor: 'Legs',
};

// The muscle groups a "swap today's focus" choice maps to, for the generator.
export const SWAP_TARGETS = [
  { key: 'push', label: 'Push', groups: ['chest', 'front-deltoids', 'triceps'] },
  { key: 'pull', label: 'Pull', groups: ['upper-back', 'back-deltoids', 'biceps'] },
  { key: 'legs', label: 'Legs', groups: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'abductors', 'adductor'] },
  { key: 'upper', label: 'Upper body', groups: ['chest', 'upper-back', 'front-deltoids', 'biceps', 'triceps'] },
  { key: 'core', label: 'Core', groups: ['abs', 'obliques', 'lower-back'] },
  { key: 'full', label: 'Full body', groups: ['chest', 'upper-back', 'quadriceps', 'front-deltoids', 'abs'] },
];

// Turn raw muscle tokens into up to `max` friendly focus labels, commonest first.
export function focusLabels(muscleCounts = {}, max = 2) {
  const totals = {};
  for (const [muscle, n] of Object.entries(muscleCounts)) {
    const label = FOCUS_GROUPS[muscle];
    if (!label) continue;
    totals[label] = (totals[label] ?? 0) + n;
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([label]) => label);
}

// "Chest and Arms" / "Legs" / "" — natural-language join.
export function joinFocus(labels = []) {
  if (!labels.length) return '';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

// How the gap since the last session reads.
export function gapPhrase(days) {
  if (days == null) return null;
  if (days <= 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// A short line about the previous session, or null when there isn't one.
export function lastWorkoutLine({ workout, muscleCounts, today = todayKey() }) {
  if (!workout) return null;
  const days = daysBetween(workout.date, today);
  const focus = joinFocus(focusLabels(muscleCounts));
  const when = gapPhrase(days);
  return {
    days,
    focus,
    when,
    text: focus
      ? `Last workout ${when} — focused on ${focus}.`
      : `Last workout ${when}.`,
  };
}

// Whether the briefing is due: once per calendar day, and only after onboarding.
export function shouldBrief({ lastBriefedDate, today = todayKey(), onboarded = true }) {
  if (!onboarded) return false;
  return lastBriefedDate !== today;
}

// Assembles everything the briefing modal renders.
//   plan  — the result of nextSession()
//   last  — { workout, muscleCounts }
// Returns today's headline plus the alternatives offered.
export function buildBriefing({ plan, last, today = todayKey() }) {
  const lastLine = lastWorkoutLine({ ...last, today });

  let todayKind = 'free';
  let todayTitle = 'No session scheduled';
  let todaySubtitle = 'Pick something below, or just stretch.';

  if (plan?.today && !plan.today.done) {
    todayKind = 'planned';
    todayTitle = plan.today.routine.name;
    todaySubtitle = "On today's plan";
  } else if (plan?.today?.done) {
    todayKind = 'done';
    todayTitle = 'Done for today';
    todaySubtitle = plan.next ? `Next: ${plan.next.routine.name} ${plan.next.label}` : 'Nice work.';
  } else if (plan?.restDay) {
    todayKind = 'rest';
    todayTitle = 'Rest day';
    todaySubtitle = plan.next ? `Next: ${plan.next.routine.name} ${plan.next.label}` : 'Recover well.';
  }

  return {
    lastLine,
    today: { kind: todayKind, title: todayTitle, subtitle: todaySubtitle },
    // The muscle groups worked last time, so the swap list can suggest
    // something different rather than repeating it.
    recentFocus: focusLabels(last?.muscleCounts ?? {}, 3),
  };
}

// Order the swap options so anything hit in the last session sinks to the
// bottom — you usually want to train something else.
export function rankSwaps(recentFocus = []) {
  const recent = new Set(recentFocus);
  const overlaps = (t) => focusLabels(Object.fromEntries(t.groups.map((g) => [g, 1])), 3).some((l) => recent.has(l));
  return [...SWAP_TARGETS].sort((a, b) => Number(overlaps(a)) - Number(overlaps(b)));
}
