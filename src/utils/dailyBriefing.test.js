import { describe, it, expect } from 'vitest';
import {
  focusLabels,
  joinFocus,
  gapPhrase,
  lastWorkoutLine,
  shouldBrief,
  buildBriefing,
  rankSwaps,
  SWAP_TARGETS,
} from './dailyBriefing.js';

const TODAY = '2026-07-27';

describe('focusLabels', () => {
  it('rolls granular muscles up into friendly groups', () => {
    expect(focusLabels({ chest: 6, triceps: 3 })).toEqual(['Chest', 'Arms']);
  });

  it('orders by working-set count, commonest first', () => {
    expect(focusLabels({ triceps: 2, biceps: 3, quadriceps: 9 })).toEqual(['Legs', 'Arms']);
  });

  it('merges muscles that share a group', () => {
    // biceps + triceps + forearm all roll into Arms, beating chest
    expect(focusLabels({ biceps: 3, triceps: 3, forearm: 2, chest: 5 })).toEqual(['Arms', 'Chest']);
  });

  it('caps the list and ignores unknown tokens', () => {
    expect(focusLabels({ chest: 5, quadriceps: 4, abs: 3 }, 2)).toEqual(['Chest', 'Legs']);
    expect(focusLabels({ nonsense: 9 })).toEqual([]);
    expect(focusLabels({})).toEqual([]);
  });
});

describe('joinFocus', () => {
  it('reads naturally', () => {
    expect(joinFocus([])).toBe('');
    expect(joinFocus(['Chest'])).toBe('Chest');
    expect(joinFocus(['Chest', 'Arms'])).toBe('Chest and Arms');
    expect(joinFocus(['Chest', 'Arms', 'Core'])).toBe('Chest, Arms and Core');
  });
});

describe('gapPhrase', () => {
  it('describes the gap in human terms', () => {
    expect(gapPhrase(0)).toBe('earlier today');
    expect(gapPhrase(1)).toBe('yesterday');
    expect(gapPhrase(5)).toBe('5 days ago');
    expect(gapPhrase(null)).toBeNull();
  });
});

describe('lastWorkoutLine', () => {
  it('summarises the previous session', () => {
    const line = lastWorkoutLine({
      workout: { date: '2026-07-24' },
      muscleCounts: { chest: 8, triceps: 4 },
      today: TODAY,
    });
    expect(line.days).toBe(3);
    expect(line.focus).toBe('Chest and Arms');
    expect(line.text).toBe('Last workout 3 days ago — focused on Chest and Arms.');
  });

  it('drops the focus clause when nothing is known', () => {
    const line = lastWorkoutLine({ workout: { date: '2026-07-26' }, muscleCounts: {}, today: TODAY });
    expect(line.text).toBe('Last workout yesterday.');
  });

  it('is null with no history', () => {
    expect(lastWorkoutLine({ workout: null, muscleCounts: {}, today: TODAY })).toBeNull();
  });
});

describe('shouldBrief', () => {
  it('fires once per day', () => {
    expect(shouldBrief({ lastBriefedDate: '', today: TODAY })).toBe(true);
    expect(shouldBrief({ lastBriefedDate: '2026-07-26', today: TODAY })).toBe(true);
    expect(shouldBrief({ lastBriefedDate: TODAY, today: TODAY })).toBe(false);
  });

  it('stays quiet until onboarding is done', () => {
    expect(shouldBrief({ lastBriefedDate: '', today: TODAY, onboarded: false })).toBe(false);
  });
});

describe('buildBriefing', () => {
  const last = { workout: { date: '2026-07-25' }, muscleCounts: { quadriceps: 10 } };

  it("leads with today's scheduled routine", () => {
    const b = buildBriefing({
      plan: { hasSchedule: true, today: { routine: { name: 'Push' } }, next: null, restDay: false },
      last,
      today: TODAY,
    });
    expect(b.today.kind).toBe('planned');
    expect(b.today.title).toBe('Push');
    expect(b.lastLine.text).toMatch(/Last workout 2 days ago — focused on Legs\./);
  });

  it('recognises a rest day and names what is next', () => {
    const b = buildBriefing({
      plan: { hasSchedule: true, today: null, restDay: true, next: { routine: { name: 'Pull' }, label: 'tomorrow' } },
      last,
      today: TODAY,
    });
    expect(b.today.kind).toBe('rest');
    expect(b.today.subtitle).toBe('Next: Pull tomorrow');
  });

  it('acknowledges a session already done', () => {
    const b = buildBriefing({
      plan: { hasSchedule: true, today: { routine: { name: 'Push' }, done: true }, next: null, restDay: false },
      last,
      today: TODAY,
    });
    expect(b.today.kind).toBe('done');
    expect(b.today.title).toBe('Done for today');
  });

  it('falls back to a free day with no schedule', () => {
    const b = buildBriefing({ plan: { hasSchedule: false, today: null, restDay: false, next: null }, last, today: TODAY });
    expect(b.today.kind).toBe('free');
  });

  it('survives a first run with no history at all', () => {
    const b = buildBriefing({ plan: { hasSchedule: false }, last: { workout: null, muscleCounts: {} }, today: TODAY });
    expect(b.lastLine).toBeNull();
    expect(b.recentFocus).toEqual([]);
  });
});

describe('rankSwaps', () => {
  it('offers every target', () => {
    expect(rankSwaps([])).toHaveLength(SWAP_TARGETS.length);
  });

  it('sinks options that repeat the last session below fresh ones', () => {
    const ranked = rankSwaps(['Legs']).map((t) => t.key);
    expect(ranked.indexOf('push')).toBeLessThan(ranked.indexOf('legs'));
    expect(ranked.indexOf('pull')).toBeLessThan(ranked.indexOf('legs'));
  });

  it('keeps a stable list when nothing was trained recently', () => {
    expect(rankSwaps([]).map((t) => t.key)).toEqual(SWAP_TARGETS.map((t) => t.key));
  });
});
