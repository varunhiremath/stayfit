// Schedule awareness: given the weekday→routine plan, answer "what am I doing
// today, and what's next?". Pure + unit-tested; the hook supplies the routines
// and the clock. Weekday numbering matches Date#getDay (0 = Sunday).

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Routines assigned to a weekday, keyed by day number.
export function scheduleByDay(templates = []) {
  const map = {};
  for (const t of templates) {
    if (t.dayOfWeek == null) continue;
    (map[t.dayOfWeek] ??= []).push(t);
  }
  return map;
}

// The next scheduled day at or after `fromDay`, searching a full week.
// `skipToday` starts the search tomorrow. Returns null when nothing is planned.
function findNext(map, fromDay, skipToday = false) {
  for (let offset = skipToday ? 1 : 0; offset <= 7; offset++) {
    const day = (fromDay + offset) % 7;
    if (map[day]?.length) return { day, offset, routines: map[day] };
  }
  return null;
}

// Formats how far away a scheduled day is, in human terms.
export function relativeDayLabel(offset, day) {
  if (offset === 0) return 'today';
  if (offset === 1) return 'tomorrow';
  return DAY_NAMES[day];
}

// The core query. Returns:
//   { hasSchedule, today, next, restDay, message }
// - `today`    { routines } when something is planned for today, else null
// - `next`     { day, offset, routines, label } for the upcoming session
// - `restDay`  true when there's a schedule but nothing planned today
export function nextSession({ templates = [], now = new Date(), trainedToday = false } = {}) {
  const map = scheduleByDay(templates);
  const hasSchedule = Object.keys(map).length > 0;
  const currentDay = now.getDay();

  if (!hasSchedule) {
    return {
      hasSchedule: false,
      today: null,
      next: null,
      restDay: false,
      message: 'No weekly plan yet — set one up to get reminders.',
    };
  }

  const todayRoutines = map[currentDay] ?? [];
  const hasToday = todayRoutines.length > 0;

  // "Next" always means after today — today is reported separately.
  const upcoming = findNext(map, currentDay, true);
  const next = upcoming
    ? { ...upcoming, label: relativeDayLabel(upcoming.offset, upcoming.day), routine: upcoming.routines[0] }
    : null;

  if (hasToday && !trainedToday) {
    return {
      hasSchedule: true,
      today: { routines: todayRoutines, routine: todayRoutines[0] },
      next,
      restDay: false,
      message: `${todayRoutines[0].name} is on today's plan.`,
    };
  }

  if (hasToday && trainedToday) {
    return {
      hasSchedule: true,
      today: { routines: todayRoutines, routine: todayRoutines[0], done: true },
      next,
      restDay: false,
      message: next
        ? `Done for today. Next: ${next.routine.name} ${next.label}.`
        : 'Done for today.',
    };
  }

  return {
    hasSchedule: true,
    today: null,
    next,
    restDay: true,
    message: next
      ? `Rest day. Next: ${next.routine.name} ${next.label}.`
      : 'Rest day.',
  };
}

// The notification body for an upcoming session — used by the reminder path.
export function reminderText(info) {
  if (!info?.hasSchedule) return null;
  if (info.today && !info.today.done) {
    return { title: "Today's session", body: `${info.today.routine.name} is on your plan. Let's get it done.` };
  }
  if (info.next && info.next.offset === 1) {
    return { title: 'Tomorrow', body: `${info.next.routine.name} is up tomorrow — get some rest.` };
  }
  return null;
}

// Whether a reminder should fire now: only on a scheduled, untrained day, at or
// after the user's chosen hour, and not already sent today.
export function shouldRemind({ info, now = new Date(), reminderHour = 17, lastRemindedDate = null, today }) {
  if (!info?.hasSchedule) return false;
  if (!info.today || info.today.done) return false;
  if (lastRemindedDate === today) return false;
  return now.getHours() >= reminderHour;
}
