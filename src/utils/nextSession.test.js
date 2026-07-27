import { describe, it, expect } from 'vitest';
import {
  scheduleByDay,
  relativeDayLabel,
  nextSession,
  reminderText,
  shouldRemind,
} from './nextSession.js';

// 2026-07-27 is a Monday.
const monday = new Date(2026, 6, 27, 9, 0, 0);
const tuesday = new Date(2026, 6, 28, 9, 0, 0);
const saturday = new Date(2026, 7, 1, 9, 0, 0);

const push = { id: 1, name: 'Push', dayOfWeek: 1 };
const pull = { id: 2, name: 'Pull', dayOfWeek: 3 };
const legs = { id: 3, name: 'Legs', dayOfWeek: 5 };
const plan = [push, pull, legs];

describe('scheduleByDay', () => {
  it('groups routines by weekday', () => {
    expect(scheduleByDay(plan)).toEqual({ 1: [push], 3: [pull], 5: [legs] });
  });
  it('ignores unassigned routines', () => {
    expect(scheduleByDay([{ id: 9, name: 'Ad-hoc', dayOfWeek: null }])).toEqual({});
  });
  it('keeps multiple routines on the same day', () => {
    const a = { id: 4, name: 'AM', dayOfWeek: 1 };
    expect(scheduleByDay([push, a])[1]).toHaveLength(2);
  });
});

describe('relativeDayLabel', () => {
  it('names near days in relative terms', () => {
    expect(relativeDayLabel(0, 1)).toBe('today');
    expect(relativeDayLabel(1, 2)).toBe('tomorrow');
    expect(relativeDayLabel(3, 4)).toBe('Thursday');
  });
});

describe('nextSession', () => {
  it('reports no schedule when nothing is assigned', () => {
    const r = nextSession({ templates: [], now: monday });
    expect(r.hasSchedule).toBe(false);
    expect(r.today).toBeNull();
    expect(r.message).toMatch(/No weekly plan/);
  });

  it("surfaces today's routine on a scheduled day", () => {
    const r = nextSession({ templates: plan, now: monday });
    expect(r.today.routine.name).toBe('Push');
    expect(r.restDay).toBe(false);
    expect(r.message).toBe("Push is on today's plan.");
  });

  it('looks past today for the next session', () => {
    const r = nextSession({ templates: plan, now: monday });
    expect(r.next.routine.name).toBe('Pull');
    expect(r.next.offset).toBe(2);
    expect(r.next.label).toBe('Wednesday');
  });

  it('marks a rest day and points at what is coming', () => {
    const r = nextSession({ templates: plan, now: tuesday });
    expect(r.restDay).toBe(true);
    expect(r.today).toBeNull();
    expect(r.next.routine.name).toBe('Pull');
    expect(r.next.label).toBe('tomorrow');
    expect(r.message).toBe('Rest day. Next: Pull tomorrow.');
  });

  it('wraps around the week end', () => {
    const r = nextSession({ templates: plan, now: saturday }); // Saturday
    expect(r.restDay).toBe(true);
    expect(r.next.routine.name).toBe('Push');
    expect(r.next.day).toBe(1);
    expect(r.next.offset).toBe(2);
  });

  it('acknowledges a session already trained today', () => {
    const r = nextSession({ templates: plan, now: monday, trainedToday: true });
    expect(r.today.done).toBe(true);
    expect(r.message).toBe('Done for today. Next: Pull Wednesday.');
  });

  it('handles a single routine scheduled only for today', () => {
    const r = nextSession({ templates: [push], now: monday });
    expect(r.today.routine.name).toBe('Push');
    expect(r.next.routine.name).toBe('Push'); // same routine, next week
    expect(r.next.offset).toBe(7);
  });
});

describe('reminderText', () => {
  it("nudges about today's untrained session", () => {
    const info = nextSession({ templates: plan, now: monday });
    expect(reminderText(info)).toEqual({
      title: "Today's session",
      body: "Push is on your plan. Let's get it done.",
    });
  });

  it('gives a heads-up the day before', () => {
    const info = nextSession({ templates: plan, now: tuesday });
    expect(reminderText(info).title).toBe('Tomorrow');
    expect(reminderText(info).body).toMatch(/Pull is up tomorrow/);
  });

  it('says nothing without a schedule or when done', () => {
    expect(reminderText(nextSession({ templates: [], now: monday }))).toBeNull();
    expect(reminderText(nextSession({ templates: plan, now: monday, trainedToday: true }))).toBeNull();
  });
});

describe('shouldRemind', () => {
  const info = nextSession({ templates: plan, now: monday });
  const today = '2026-07-27';

  it('fires at or after the reminder hour on a scheduled day', () => {
    const evening = new Date(2026, 6, 27, 17, 30);
    expect(shouldRemind({ info, now: evening, reminderHour: 17, today })).toBe(true);
  });

  it('stays quiet before the reminder hour', () => {
    const morning = new Date(2026, 6, 27, 9, 0);
    expect(shouldRemind({ info, now: morning, reminderHour: 17, today })).toBe(false);
  });

  it('never repeats on the same day', () => {
    const evening = new Date(2026, 6, 27, 18, 0);
    expect(shouldRemind({ info, now: evening, reminderHour: 17, today, lastRemindedDate: today })).toBe(false);
  });

  it('stays quiet on rest days and after training', () => {
    const restInfo = nextSession({ templates: plan, now: tuesday });
    const evening = new Date(2026, 6, 28, 18, 0);
    expect(shouldRemind({ info: restInfo, now: evening, reminderHour: 17, today: '2026-07-28' })).toBe(false);

    const doneInfo = nextSession({ templates: plan, now: monday, trainedToday: true });
    expect(shouldRemind({ info: doneInfo, now: new Date(2026, 6, 27, 18, 0), reminderHour: 17, today })).toBe(false);
  });
});
